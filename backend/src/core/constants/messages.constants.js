const MESSAGES = {
    AUTH: {
        TOKEN_REQUIRED: 'Authentication token is required',
        TOKEN_INVALID: 'Invalid authentication token',
        CREDENTIALS_REQUIRED: 'Email or username and password are required',
        CREDENTIALS_INVALID: 'Invalid credentials',
        JWT_SECRET_MISSING: 'JWT secret is not configured',
        PHONE_REQUIRED: 'Phone number is required',
        PHONE_INVALID: 'Phone number must be a valid E.164 phone number',
        PHONE_IN_USE: 'Phone number is already in use',
        SMS_CODE_REQUIRED: 'SMS code is required',
        SMS_CODE_INVALID: 'Invalid or expired SMS code',
        SMS_CODE_SENT: 'If this phone number can receive SMS, a verification code has been sent',
        SMS_CODE_RATE_LIMITED: 'Please wait before requesting another SMS code',
        SMS_CODE_ATTEMPTS_EXCEEDED: 'Too many invalid SMS code attempts',
        DEVICE_REQUIRED: 'Device information is required',
        DEVICE_FIELDS_REQUIRED: 'Device id and platform are required',
        USERNAME_IN_USE: 'Username is already in use',
        EMAIL_IN_USE: 'Email is already in use',
        REGISTER_FIELDS_REQUIRED:
            'Phone number, username, display name, email, and password are required',
        EMAIL_REQUIRED: 'Email is required',
        TOKEN_QUERY_REQUIRED: 'Token is required',
        RESET_FIELDS_REQUIRED: 'Token and password are required',
        EMAIL_VERIFICATION_REQUIRED: 'Email verification is required',
        EMAIL_VERIFICATION_SENT:
            'If this email needs verification, a verification link has been sent',
        PASSWORD_RESET_SENT:
            'If an account exists for this email, a password reset link has been sent',
        PASSWORD_RESET_SUCCESS: 'Password reset successfully',
        AUTH_TOKEN_INVALID: 'Invalid or expired token',
        DELETED_USER_RESTORE_AVAILABLE: 'This account was recently deleted',
        DELETED_USER_RESTORE_QUESTION: 'Do you want to restore your previous account?',
        EMAIL_INVALID: 'Email must be a valid email address',
        PASSWORD_MIN_LENGTH: (minLength) => `Password must be at least ${minLength} characters`,
    },
    USER: {
        NOT_FOUND: 'User not found',
        DISABLED: 'User account is disabled',
    },
    GROUP: {
        REQUIRED: 'Group is required',
        INVALID_ID: 'Invalid group id',
        NOT_FOUND: 'Group not found',
        DISABLED: 'Group is disabled',
        ACCESS_DENIED: 'Group access denied',
    },
    ADMIN: {
        ACCESS_REQUIRED: 'Platform admin access required',
    },
    ROUTE: {
        NOT_FOUND: (path) => `Route ${path} was not found`,
    },
    SERVER: {
        INTERNAL_ERROR: 'Internal server error',
    },
};

export { MESSAGES };
