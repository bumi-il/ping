const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getUser = (req) => {
    return req.user;
};

const normalizeEmail = (email) => {
    return email.trim().toLowerCase();
};

const normalizeUsername = (username) => {
    return username.trim().toLowerCase();
};

const isEmail = (value) => {
    return typeof value === 'string' && EMAIL_PATTERN.test(normalizeEmail(value));
};

export { getUser, normalizeEmail, normalizeUsername, isEmail };
