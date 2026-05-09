import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '#config/env.config.js';
import { HTTP_STATUS } from '#core/constants/httpStatus.constants.js';
import { MESSAGES } from '#core/constants/messages.constants.js';
import deletedUserRepository from '#core/repositories/deletedUser.repository.js';
import userRepository from '#core/repositories/user.repository.js';
import AppError from '#core/utils/AppError.utils.js';
import {
    BCRYPT_SALT_ROUNDS,
    PASSWORD_MIN_LENGTH,
    JWT_SIGN_OPTIONS,
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

        // TODO: Check if username is in deleted users & the account was deleted in the last { X } days
        const deletedUsername =
            await deletedUserRepository.findRestorableByUsername(
                normalizedUsername,
            );
        if (deletedUsername) {
            // TODO: Send the user a question if he wants to restore data
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
        // TODO: Check if email is in deleted users & the account was deleted in the last { X } days
        const deletedEmail =
            await deletedUserRepository.findRestorableByEmail(normalizedEmail);
        if (deletedEmail) {
            // TODO: Send the user a question if he wants to restore data
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

        return this.createAuthPayload(user);
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

        return this.createAuthPayload(user);
    }

    createAuthPayload(user) {
        return {
            user: this.toSafeUser(user),
            token: this.signToken(user),
        };
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
}

export default new AuthService();
