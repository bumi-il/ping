import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '#config/env.config.js';
import { HTTP_STATUS } from '#core/constants/httpStatus.constants.js';
import { MESSAGES } from '#core/constants/messages.constants.js';
import userRepository from '#core/repositories/user.repository.js';
import AppError from '#core/utils/AppError.utils.js';
import {
    BCRYPT_SALT_ROUNDS,
    EMAIL_PATTERN,
    PASSWORD_MIN_LENGTH,
    JWT_SIGN_OPTIONS,
} from '#core/constants/auth.constants.js';
import { USER_STATUSES } from '#core/constants/user.constants.js';

class AuthService {
    async register(data = {}) {
        const { username, displayName, email, password } = data;

        this.validateRegisterData({ username, displayName, email, password });

        const normalizedUsername = username.trim().toLowerCase();
        const existingUsername =
            await userRepository.findByUsername(normalizedUsername);
        if (existingUsername) {
            throw new AppError(
                MESSAGES.AUTH.USERNAME_IN_USE,
                HTTP_STATUS.CONFLICT,
            );
        }
        // TODO: Check if username is in deleted users

        const normalizedEmail = email.trim().toLowerCase();
        const existingEmail = await userRepository.findByEmail(normalizedEmail);
        if (existingEmail) {
            throw new AppError(
                MESSAGES.AUTH.EMAIL_IN_USE,
                HTTP_STATUS.CONFLICT,
            );
        }
        // TODO: Check if email is in deleted users

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

        const credential = emailOrUsername.trim().toLowerCase();

        const user = EMAIL_PATTERN.test(credential)
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

    signToken(user) {
        // TODO: Learn jwt params - https://www.npmjs.com/package/jsonwebtoken
        return jwt.sign(
            { sub: user._id.toString() },
            env.JWT_SECRET,
            JWT_SIGN_OPTIONS,
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

        if (!EMAIL_PATTERN.test(email.trim().toLowerCase())) {
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

    validateLoginData(data) {
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
}

export default new AuthService();
