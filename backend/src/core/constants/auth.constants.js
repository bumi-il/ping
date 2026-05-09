const PASSWORD_MIN_LENGTH = 6;
const TOKEN_EXPIRES_IN = '7d';
const BCRYPT_SALT_ROUNDS = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const JWT_SIGN_OPTIONS = {
    expiresIn: TOKEN_EXPIRES_IN,
};

export {
    PASSWORD_MIN_LENGTH,
    TOKEN_EXPIRES_IN,
    BCRYPT_SALT_ROUNDS,
    EMAIL_PATTERN,
    JWT_SIGN_OPTIONS,
};
