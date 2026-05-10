import { PASSWORD_MIN_LENGTH } from '#core/constants/auth.constants.js';
import { HTTP_STATUS } from '#core/constants/httpStatus.constants.js';
import { MESSAGES } from '#core/constants/messages.constants.js';
import AppError from '#core/utils/AppError.utils.js';
import { isEmail } from '#core/utils/user.utils.js';

const validateRegisterData = (data) => {
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
};

const validateBasicData = (data) => {
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
};

const validateLoginData = (data) => {
    validateBasicData(data);
};

const validateRestoreData = (data) => {
    validateBasicData(data);
};

const validateEmailData = (data) => {
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
};

const validateTokenData = (data) => {
    const { token } = data;

    if (typeof token !== 'string' || !token.trim()) {
        throw new AppError(
            MESSAGES.AUTH.TOKEN_QUERY_REQUIRED,
            HTTP_STATUS.BAD_REQUEST,
        );
    }
};

const validateResetPasswordData = (data) => {
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
};

export default {
    validateRegisterData,
    validateLoginData,
    validateRestoreData,
    validateEmailData,
    validateTokenData,
    validateResetPasswordData,
};
