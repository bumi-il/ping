import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '#config/env.config.js';
import { HTTP_STATUS } from '#core/constants/httpStatus.constants.js';
import { MESSAGES } from '#core/constants/messages.constants.js';
import authTokenRepository from '#core/repositories/authToken.repository.js';
import deletedUserRepository from '#core/repositories/deletedUser.repository.js';
import userRepository from '#core/repositories/user.repository.js';
import emailService from '#core/services/email/email.service.js';
import AppError from '#core/utils/AppError.utils.js';
import {
    AUTH_TOKEN_TYPES,
    BCRYPT_SALT_ROUNDS,
    EMAIL_VERIFICATION_TOKEN_TTL,
    PASSWORD_MIN_LENGTH,
    PASSWORD_RESET_TOKEN_TTL,
    JWT_SIGN_OPTIONS,
    VERIFICATION_EMAIL_API_URL,
    VERIFICATION_EMAIL_CLIENT_URL,
    RESET_PASSWORD_CLIENT_URL,
} from '#core/constants/auth.constants.js';
import { USER_STATUSES } from '#core/constants/user.constants.js';
import {
    isEmail,
    normalizeEmail,
    normalizeUsername,
} from '#core/utils/user.utils.js';

class AuthService {
    async register(data = {}) {
        const { username, displayName, email, password } = data;

        this.validateRegisterData({ username, displayName, email, password });

        const normalizedUsername = normalizeUsername(username);
        const existingUsername =
            await userRepository.findByUsername(normalizedUsername);
        if (existingUsername) {
            throw new AppError(
                MESSAGES.AUTH.USERNAME_IN_USE,
                HTTP_STATUS.CONFLICT,
            );
        }
        const deletedUsername =
            await deletedUserRepository.findRestorableByUsername(
                normalizedUsername,
            );
        if (deletedUsername) {
            this.throwDeletedUserRestoreAction('username');
        }

        const normalizedEmail = normalizeEmail(email);
        const existingEmail = await userRepository.findByEmail(normalizedEmail);
        if (existingEmail) {
            throw new AppError(
                MESSAGES.AUTH.EMAIL_IN_USE,
                HTTP_STATUS.CONFLICT,
            );
        }
        const deletedEmail =
            await deletedUserRepository.findRestorableByEmail(normalizedEmail);
        if (deletedEmail) {
            this.throwDeletedUserRestoreAction('email');
        }

        const normalizedDisplayName = displayName.trim();

        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const user = await userRepository.create({
            username: normalizedUsername,
            displayName: normalizedDisplayName,
            email: normalizedEmail,
            passwordHash,
        });

        await this.sendVerificationEmail(user);

        return this.createVerificationRequiredPayload(user);
    }

    async login(data = {}) {
        const { emailOrUsername, password } = data;

        this.validateLoginData({ emailOrUsername, password });

        const credential = normalizeUsername(emailOrUsername);

        const user = isEmail(credential)
            ? await userRepository.findByEmail(credential)
            : await userRepository.findByUsername(credential);

        if (!user) {
            throw new AppError(
                MESSAGES.AUTH.CREDENTIALS_INVALID,
                HTTP_STATUS.UNAUTHORIZED,
            );
        }

        if (user.status !== USER_STATUSES.ACTIVE) {
            throw new AppError(MESSAGES.USER.DISABLED, HTTP_STATUS.FORBIDDEN);
        }

        if (!user.emailVerifiedAt) {
            throw new AppError(
                MESSAGES.AUTH.EMAIL_VERIFICATION_REQUIRED,
                HTTP_STATUS.FORBIDDEN,
            );
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash,
        );

        if (!isPasswordValid) {
            throw new AppError(
                MESSAGES.AUTH.CREDENTIALS_INVALID,
                HTTP_STATUS.UNAUTHORIZED,
            );
        }

        return this.createAuthPayload(user);
    }

    async restore(data = {}) {
        const { emailOrUsername, password } = data;

        this.validateRestoreData({ emailOrUsername, password });

        const credential = normalizeUsername(emailOrUsername);
        const deletedUser = isEmail(credential)
            ? await deletedUserRepository.findRestorableByEmail(credential)
            : await deletedUserRepository.findRestorableByUsername(credential);

        if (!deletedUser) {
            throw new AppError(
                MESSAGES.AUTH.CREDENTIALS_INVALID,
                HTTP_STATUS.UNAUTHORIZED,
            );
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            deletedUser.passwordHash,
        );

        if (!isPasswordValid) {
            throw new AppError(
                MESSAGES.AUTH.CREDENTIALS_INVALID,
                HTTP_STATUS.UNAUTHORIZED,
            );
        }

        await this.ensureRestoredUserIdentifiersAreAvailable(deletedUser);

        const user = await userRepository.create(
            this.createRestoredUserData(deletedUser),
        );

        await deletedUserRepository.markRestoredById(deletedUser._id);

        await this.sendEmailSafely(() =>
            emailService.sendAccountRestoredEmail({
                to: user.email,
                displayName: user.displayName,
            }),
        );

        return this.createAuthPayload(user);
    }

    async verifyEmail(data = {}) {
        const { token } = data;

        this.validateTokenData({ token });

        const authToken = await this.findUsableAuthToken(
            token,
            AUTH_TOKEN_TYPES.EMAIL_VERIFICATION,
        );

        const user = await userRepository.findById(authToken.user);
        if (!user) {
            throw new AppError(MESSAGES.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        }

        if (!user.emailVerifiedAt) {
            await userRepository.updateById(user._id, {
                emailVerifiedAt: new Date(),
            });

            await this.sendEmailSafely(() =>
                emailService.sendWelcomeEmail({
                    to: user.email,
                    displayName: user.displayName,
                }),
            );
        }

        await authTokenRepository.markUsedById(authToken._id);

        return this.createClientUrl('/email-verified', {
            status: 'success',
        });
    }

    async resendVerification(data = {}) {
        const { email } = data;

        this.validateEmailData({ email });

        const user = await userRepository.findByEmail(normalizeEmail(email));
        if (
            user &&
            !user.emailVerifiedAt &&
            user.status === USER_STATUSES.ACTIVE
        ) {
            await this.sendVerificationEmail(user);
        }

        return { message: MESSAGES.AUTH.EMAIL_VERIFICATION_SENT };
    }

    async forgotPassword(data = {}) {
        const { email } = data;

        this.validateEmailData({ email });

        const user = await userRepository.findByEmail(normalizeEmail(email));
        if (
            user &&
            user.emailVerifiedAt &&
            user.status === USER_STATUSES.ACTIVE
        ) {
            await this.sendPasswordResetEmail(user);
        }

        return { message: MESSAGES.AUTH.PASSWORD_RESET_SENT };
    }

    // TODO: This function is probably not needed
    async openPasswordReset(data = {}) {
        const { token } = data;

        this.validateTokenData({ token });

        await this.findUsableAuthToken(token, AUTH_TOKEN_TYPES.PASSWORD_RESET);

        return this.createClientUrl('/reset-password', { token });
    }

    async resetPassword(data = {}) {
        const { token, password } = data;

        this.validateResetPasswordData({ token, password });

        const authToken = await this.findUsableAuthToken(
            token,
            AUTH_TOKEN_TYPES.PASSWORD_RESET,
        );

        const user = await userRepository.findById(authToken.user);
        if (!user) {
            throw new AppError(MESSAGES.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        }

        if (user.status !== USER_STATUSES.ACTIVE || !user.emailVerifiedAt) {
            throw new AppError(
                MESSAGES.AUTH.AUTH_TOKEN_INVALID,
                HTTP_STATUS.BAD_REQUEST,
            );
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        await userRepository.updateById(user._id, { passwordHash });
        await authTokenRepository.markUsedById(authToken._id);

        return { message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS };
    }

    createAuthPayload(user) {
        return {
            user: this.toSafeUser(user),
            token: this.signToken(user),
        };
    }

    createVerificationRequiredPayload(user) {
        return {
            user: this.toSafeUser(user),
            message: MESSAGES.AUTH.EMAIL_VERIFICATION_REQUIRED,
        };
    }

    async sendVerificationEmail(user) {
        await authTokenRepository.invalidateUnusedForUser({
            user: user._id,
            type: AUTH_TOKEN_TYPES.EMAIL_VERIFICATION,
        });

        const token = await this.createAuthToken({
            user: user._id,
            type: AUTH_TOKEN_TYPES.EMAIL_VERIFICATION,
            ttl: EMAIL_VERIFICATION_TOKEN_TTL,
        });

        const verificationUrl = this.createClientUrl(
            VERIFICATION_EMAIL_CLIENT_URL,
            {
                token,
            },
        );

        await this.sendEmailSafely(() =>
            emailService.sendVerifyEmail({
                to: user.email,
                displayName: user.displayName,
                verificationUrl,
            }),
        );
    }

    async sendPasswordResetEmail(user) {
        await authTokenRepository.invalidateUnusedForUser({
            user: user._id,
            type: AUTH_TOKEN_TYPES.PASSWORD_RESET,
        });

        const token = await this.createAuthToken({
            user: user._id,
            type: AUTH_TOKEN_TYPES.PASSWORD_RESET,
            ttl: PASSWORD_RESET_TOKEN_TTL,
        });

        const resetUrl = this.createClientUrl(RESET_PASSWORD_CLIENT_URL, {
            token,
        });

        await this.sendEmailSafely(() =>
            emailService.sendPasswordResetEmail({
                to: user.email,
                displayName: user.displayName,
                resetUrl,
            }),
        );
    }

    async createAuthToken({ user, type, ttl }) {
        const token = crypto.randomBytes(32).toString('hex');

        await authTokenRepository.create({
            user,
            type,
            tokenHash: this.hashToken(token),
            expiresAt: new Date(Date.now() + ttl),
        });

        return token;
    }

    async findUsableAuthToken(token, type) {
        const authToken = await authTokenRepository.findUsableToken({
            tokenHash: this.hashToken(token),
            type,
        });

        if (!authToken) {
            throw new AppError(
                MESSAGES.AUTH.AUTH_TOKEN_INVALID,
                HTTP_STATUS.BAD_REQUEST,
            );
        }

        return authToken;
    }

    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    createApiUrl(path, params = {}) {
        return this.createUrl(env.API_ORIGIN, path, params);
    }

    createClientUrl(path, params = {}) {
        return this.createUrl(env.CLIENT_ORIGIN, path, params);
    }

    createUrl(origin, path, params = {}) {
        const url = new URL(path, origin);

        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });

        return url.toString();
    }

    toSafeUser(user) {
        const userObject = user.toObject ? user.toObject() : user;
        const { passwordHash, __v, ...safeUser } = userObject;

        return safeUser;
    }

    async ensureRestoredUserIdentifiersAreAvailable(deletedUser) {
        const existingUsername = await userRepository.findByUsername(
            deletedUser.username,
        );
        if (existingUsername) {
            throw new AppError(
                MESSAGES.AUTH.USERNAME_IN_USE,
                HTTP_STATUS.CONFLICT,
            );
        }

        const existingEmail = await userRepository.findByEmail(
            deletedUser.email,
        );
        if (existingEmail) {
            throw new AppError(
                MESSAGES.AUTH.EMAIL_IN_USE,
                HTTP_STATUS.CONFLICT,
            );
        }
    }

    createRestoredUserData(deletedUser) {
        const restoreData =
            deletedUser.dataToRestore &&
            typeof deletedUser.dataToRestore === 'object' &&
            !Array.isArray(deletedUser.dataToRestore)
                ? deletedUser.dataToRestore
                : {};
        const displayName =
            typeof restoreData.displayName === 'string' &&
            restoreData.displayName.trim()
                ? restoreData.displayName.trim()
                : deletedUser.username;

        const restoredUserData = {
            username: deletedUser.username,
            displayName,
            email: deletedUser.email,
            passwordHash: deletedUser.passwordHash,
            status: USER_STATUSES.ACTIVE,
            emailVerifiedAt: new Date(),
        };

        for (const field of ['avatar', 'bio', 'locale']) {
            if (typeof restoreData[field] === 'string') {
                restoredUserData[field] = restoreData[field];
            }
        }

        if (restoreData.theme) {
            restoredUserData.theme = restoreData.theme;
        }

        return restoredUserData;
    }

    async sendEmailSafely(sendEmail) {
        try {
            await sendEmail();
        } catch (error) {
            console.error('Email failed to send', error);
        }
    }

    signToken(user) {
        // TODO: Learn jwt params - https://www.npmjs.com/package/jsonwebtoken
        return jwt.sign(
            { sub: user._id.toString() },
            env.JWT_SECRET,
            JWT_SIGN_OPTIONS,
        );
    }

    throwDeletedUserRestoreAction(matchedBy) {
        throw new AppError(
            MESSAGES.AUTH.DELETED_USER_RESTORE_AVAILABLE,
            HTTP_STATUS.CONFLICT,
            {
                action: {
                    type: 'restore_deleted_user',
                    question: MESSAGES.AUTH.DELETED_USER_RESTORE_QUESTION,
                    matchedBy,
                },
            },
        );
    }

    validateRegisterData(data) {
        const { username, displayName, email, password } = data;

        if (
            typeof username !== 'string' ||
            !username.trim() ||
            typeof displayName !== 'string' ||
            !displayName.trim() ||
            typeof email !== 'string' ||
            !email.trim() ||
            typeof password !== 'string' ||
            !password.trim()
        ) {
            throw new AppError(
                MESSAGES.AUTH.REGISTER_FIELDS_REQUIRED,
                HTTP_STATUS.BAD_REQUEST,
            );
        }

        if (!isEmail(email)) {
            throw new AppError(
                MESSAGES.AUTH.EMAIL_INVALID,
                HTTP_STATUS.BAD_REQUEST,
            );
        }

        if (password.length < PASSWORD_MIN_LENGTH) {
            throw new AppError(
                MESSAGES.AUTH.PASSWORD_MIN_LENGTH(PASSWORD_MIN_LENGTH),
                HTTP_STATUS.BAD_REQUEST,
            );
        }
    }

    validateBasicData(data) {
        const { emailOrUsername, password } = data;

        if (
            typeof emailOrUsername !== 'string' ||
            !emailOrUsername.trim() ||
            typeof password !== 'string' ||
            !password.trim()
        ) {
            throw new AppError(
                MESSAGES.AUTH.CREDENTIALS_REQUIRED,
                HTTP_STATUS.BAD_REQUEST,
            );
        }
    }

    validateLoginData(data) {
        this.validateBasicData(data);
    }

    validateRestoreData(data) {
        this.validateBasicData(data);
    }

    validateEmailData(data) {
        const { email } = data;

        if (typeof email !== 'string' || !email.trim()) {
            throw new AppError(
                MESSAGES.AUTH.EMAIL_REQUIRED,
                HTTP_STATUS.BAD_REQUEST,
            );
        }

        if (!isEmail(email)) {
            throw new AppError(
                MESSAGES.AUTH.EMAIL_INVALID,
                HTTP_STATUS.BAD_REQUEST,
            );
        }
    }

    validateTokenData(data) {
        const { token } = data;

        if (typeof token !== 'string' || !token.trim()) {
            throw new AppError(
                MESSAGES.AUTH.TOKEN_QUERY_REQUIRED,
                HTTP_STATUS.BAD_REQUEST,
            );
        }
    }

    validateResetPasswordData(data) {
        const { token, password } = data;

        if (
            typeof token !== 'string' ||
            !token.trim() ||
            typeof password !== 'string' ||
            !password.trim()
        ) {
            throw new AppError(
                MESSAGES.AUTH.RESET_FIELDS_REQUIRED,
                HTTP_STATUS.BAD_REQUEST,
            );
        }

        if (password.length < PASSWORD_MIN_LENGTH) {
            throw new AppError(
                MESSAGES.AUTH.PASSWORD_MIN_LENGTH(PASSWORD_MIN_LENGTH),
                HTTP_STATUS.BAD_REQUEST,
            );
        }
    }
}

export default new AuthService();
