import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '#config/env.config.js';
import { HTTP_STATUS } from '#core/constants/httpStatus.constants.js';
import { MESSAGES } from '#core/constants/messages.constants.js';
import authTokenRepository from '#core/repositories/authToken.repository.js';
import deletedUserRepository from '#core/repositories/deletedUser.repository.js';
import userRepository from '#core/repositories/user.repository.js';
import emailService from '#core/services/email/email.service.js';
import AppError from '#core/utils/AppError.utils.js';
import { createRandomToken, hashToken } from '#core/utils/crypto.utils.js';
import { createClientUrl } from '#core/utils/url.utils.js';
import {
    AUTH_TOKEN_TYPES,
    BCRYPT_SALT_ROUNDS,
    EMAIL_VERIFICATION_TOKEN_TTL,
    PASSWORD_RESET_TOKEN_TTL,
    JWT_SIGN_OPTIONS,
    VERIFICATION_EMAIL_CLIENT_URL,
    RESET_PASSWORD_CLIENT_URL,
    EMAIL_VERIFIED_CLIENT_URL,
    EMAIL_VERIFIED_CLIENT_URL_PARAMS,
} from '#core/constants/auth.constants.js';
import { USER_STATUSES } from '#core/constants/user.constants.js';
import { isEmail, normalizeEmail, normalizeUsername } from '#core/utils/user.utils.js';
import authValidates from './auth.validates.js';

class AuthService {
    async register(data = {}) {
        const { username, displayName, email, password } = data;

        authValidates.validateRegisterData({
            username,
            displayName,
            email,
            password,
        });

        const normalizedUsername = normalizeUsername(username);
        const existingUsername = await userRepository.findByUsername(normalizedUsername);
        if (existingUsername) {
            throw new AppError(MESSAGES.AUTH.USERNAME_IN_USE, HTTP_STATUS.CONFLICT);
        }
        const deletedUsername =
            await deletedUserRepository.findRestorableByUsername(normalizedUsername);
        if (deletedUsername) {
            this.throwDeletedUserRestoreAction('username');
        }

        const normalizedEmail = normalizeEmail(email);
        const existingEmail = await userRepository.findByEmail(normalizedEmail);
        if (existingEmail) {
            throw new AppError(MESSAGES.AUTH.EMAIL_IN_USE, HTTP_STATUS.CONFLICT);
        }
        const deletedEmail = await deletedUserRepository.findRestorableByEmail(normalizedEmail);
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

        authValidates.validateLoginData({ emailOrUsername, password });

        const credential = normalizeUsername(emailOrUsername);

        const user = isEmail(credential)
            ? await userRepository.findByEmail(credential)
            : await userRepository.findByUsername(credential);

        if (!user) {
            throw new AppError(MESSAGES.AUTH.CREDENTIALS_INVALID, HTTP_STATUS.UNAUTHORIZED);
        }

        if (user.status !== USER_STATUSES.ACTIVE) {
            throw new AppError(MESSAGES.USER.DISABLED, HTTP_STATUS.FORBIDDEN);
        }

        if (!user.emailVerifiedAt) {
            throw new AppError(MESSAGES.AUTH.EMAIL_VERIFICATION_REQUIRED, HTTP_STATUS.FORBIDDEN);
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            throw new AppError(MESSAGES.AUTH.CREDENTIALS_INVALID, HTTP_STATUS.UNAUTHORIZED);
        }

        return this.createAuthPayload(user);
    }

    async restore(data = {}) {
        const { emailOrUsername, password } = data;

        authValidates.validateRestoreData({ emailOrUsername, password });

        const credential = normalizeUsername(emailOrUsername);
        const deletedUser = isEmail(credential)
            ? await deletedUserRepository.findRestorableByEmail(credential)
            : await deletedUserRepository.findRestorableByUsername(credential);

        if (!deletedUser) {
            throw new AppError(MESSAGES.AUTH.CREDENTIALS_INVALID, HTTP_STATUS.UNAUTHORIZED);
        }

        const isPasswordValid = await bcrypt.compare(password, deletedUser.passwordHash);

        if (!isPasswordValid) {
            throw new AppError(MESSAGES.AUTH.CREDENTIALS_INVALID, HTTP_STATUS.UNAUTHORIZED);
        }

        await this.ensureRestoredUserIdentifiersAreAvailable(deletedUser);

        const user = await userRepository.create(this.createRestoredUserData(deletedUser));

        await deletedUserRepository.markRestoredById(deletedUser._id);

        await this.sendEmailSafely(() =>
            emailService.sendAccountRestoredEmail({
                to: user.email,
                displayName: user.displayName,
            })
        );

        return this.createAuthPayload(user);
    }

    async verifyEmail(data = {}) {
        const { token } = data;

        authValidates.validateTokenData({ token });

        const authToken = await this.findUsableAuthToken(
            token,
            AUTH_TOKEN_TYPES.EMAIL_VERIFICATION
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
                })
            );
        }

        await authTokenRepository.markUsedById(authToken._id);

        return createClientUrl(EMAIL_VERIFIED_CLIENT_URL, EMAIL_VERIFIED_CLIENT_URL_PARAMS);
    }

    async resendVerification(data = {}) {
        const { email } = data;

        authValidates.validateEmailData({ email });

        const user = await userRepository.findByEmail(normalizeEmail(email));
        if (user && !user.emailVerifiedAt && user.status === USER_STATUSES.ACTIVE) {
            await this.sendVerificationEmail(user);
        }

        return { message: MESSAGES.AUTH.EMAIL_VERIFICATION_SENT };
    }

    async forgotPassword(data = {}) {
        const { email } = data;

        authValidates.validateEmailData({ email });

        const user = await userRepository.findByEmail(normalizeEmail(email));
        if (user && user.emailVerifiedAt && user.status === USER_STATUSES.ACTIVE) {
            await this.sendPasswordResetEmail(user);
        }

        return { message: MESSAGES.AUTH.PASSWORD_RESET_SENT };
    }

    async resetPassword(data = {}) {
        const { token, password } = data;

        authValidates.validateResetPasswordData({ token, password });

        const authToken = await this.findUsableAuthToken(token, AUTH_TOKEN_TYPES.PASSWORD_RESET);

        const user = await userRepository.findById(authToken.user);
        if (!user) {
            throw new AppError(MESSAGES.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        }

        if (user.status !== USER_STATUSES.ACTIVE || !user.emailVerifiedAt) {
            throw new AppError(MESSAGES.AUTH.AUTH_TOKEN_INVALID, HTTP_STATUS.BAD_REQUEST);
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

        const verificationUrl = createClientUrl(VERIFICATION_EMAIL_CLIENT_URL, {
            token,
        });

        await this.sendEmailSafely(() =>
            emailService.sendVerifyEmail({
                to: user.email,
                displayName: user.displayName,
                verificationUrl,
            })
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

        const resetUrl = createClientUrl(RESET_PASSWORD_CLIENT_URL, {
            token,
        });

        await this.sendEmailSafely(() =>
            emailService.sendPasswordResetEmail({
                to: user.email,
                displayName: user.displayName,
                resetUrl,
            })
        );
    }

    async createAuthToken({ user, type, ttl }) {
        const token = createRandomToken();

        await authTokenRepository.create({
            user,
            type,
            tokenHash: hashToken(token),
            expiresAt: new Date(Date.now() + ttl),
        });

        return token;
    }

    async findUsableAuthToken(token, type) {
        const authToken = await authTokenRepository.findUsableToken({
            tokenHash: hashToken(token),
            type,
        });

        if (!authToken) {
            throw new AppError(MESSAGES.AUTH.AUTH_TOKEN_INVALID, HTTP_STATUS.BAD_REQUEST);
        }

        return authToken;
    }

    toSafeUser(user) {
        const userObject = user.toObject ? user.toObject() : user;
        const { passwordHash, __v, ...safeUser } = userObject;

        return safeUser;
    }

    async ensureRestoredUserIdentifiersAreAvailable(deletedUser) {
        const existingUsername = await userRepository.findByUsername(deletedUser.username);
        if (existingUsername) {
            throw new AppError(MESSAGES.AUTH.USERNAME_IN_USE, HTTP_STATUS.CONFLICT);
        }

        const existingEmail = await userRepository.findByEmail(deletedUser.email);
        if (existingEmail) {
            throw new AppError(MESSAGES.AUTH.EMAIL_IN_USE, HTTP_STATUS.CONFLICT);
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
            typeof restoreData.displayName === 'string' && restoreData.displayName.trim()
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
        return jwt.sign({ sub: user._id.toString() }, env.JWT_SECRET, JWT_SIGN_OPTIONS);
    }

    throwDeletedUserRestoreAction(matchedBy) {
        throw new AppError(MESSAGES.AUTH.DELETED_USER_RESTORE_AVAILABLE, HTTP_STATUS.CONFLICT, {
            action: {
                type: 'restore_deleted_user',
                question: MESSAGES.AUTH.DELETED_USER_RESTORE_QUESTION,
                matchedBy,
            },
        });
    }
}

export default new AuthService();
