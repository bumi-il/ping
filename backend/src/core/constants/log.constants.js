const MAX_DEPTH = 4;
const MAX_ARRAY_ITEMS = 20;
const MAX_OBJECT_KEYS = 50;
const MAX_SERIALIZED_LENGTH = 4000;
const REDACTED = '[REDACTED]';
const CIRCULAR = '[Circular]';

const SENSITIVE_KEY_PATTERNS = [
    /password/i,
    /passwordHash/i,
    /token/i,
    /authorization/i,
    /cookie/i,
    /secret/i,
    /jwt/i,
    /apiKey/i,
    /resetToken/i,
    /verification/i,
];

const SAFE_HEADER_NAMES = [
    'accept',
    'content-type',
    'origin',
    'referer',
    'user-agent',
    'x-forwarded-for',
    'x-request-id',
];

export {
    MAX_DEPTH,
    MAX_ARRAY_ITEMS,
    MAX_OBJECT_KEYS,
    MAX_SERIALIZED_LENGTH,
    REDACTED,
    SENSITIVE_KEY_PATTERNS,
    SAFE_HEADER_NAMES,
    CIRCULAR,
};
