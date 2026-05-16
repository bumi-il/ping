const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

const getUser = (req) => {
    return req.user;
};

const normalizeEmail = (email) => {
    return email.trim().toLowerCase();
};

const normalizeUsername = (username) => {
    return username.trim().toLowerCase();
};

const normalizePhoneNumber = (phoneNumber) => {
    if (typeof phoneNumber !== 'string') {
        return '';
    }

    return phoneNumber.replace(/[\s().-]/g, '').trim();
};

const isEmail = (value) => {
    return typeof value === 'string' && EMAIL_PATTERN.test(normalizeEmail(value));
};

const isPhoneNumber = (value) => {
    return typeof value === 'string' && PHONE_PATTERN.test(normalizePhoneNumber(value));
};

export { getUser, normalizeEmail, normalizeUsername, normalizePhoneNumber, isEmail, isPhoneNumber };
