import {
    MAX_DEPTH,
    MAX_ARRAY_ITEMS,
    MAX_OBJECT_KEYS,
    MAX_SERIALIZED_LENGTH,
    REDACTED,
    SAFE_HEADER_NAMES,
    SENSITIVE_KEY_PATTERNS,
    CIRCULAR,
} from '#core/constants/log.constants.js';
import requestLogRepository from '#core/repositories/requestLog.repository.js';

const isSensitiveKey = (key) => {
    return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
};

const getType = (value) => {
    if (Array.isArray(value)) {
        return 'array';
    }

    if (value === null) {
        return 'null';
    }

    return typeof value;
};

const compactValue = (value) => {
    let serialized = '';

    try {
        serialized = JSON.stringify(value);
    } catch (_error) {
        return {
            truncated: true,
            type: getType(value),
            reason: 'unserializable',
        };
    }

    if (!serialized || serialized.length <= MAX_SERIALIZED_LENGTH) {
        return value;
    }

    return {
        truncated: true,
        type: getType(value),
        size: serialized.length,
        preview: serialized.slice(0, MAX_SERIALIZED_LENGTH),
    };
};

const sanitizeValue = (value, depth = 0, seen = new WeakSet()) => {
    if (value === null || value === undefined) {
        return value;
    }

    if (typeof value === 'string') {
        return value.length > MAX_SERIALIZED_LENGTH
            ? `${value.slice(0, MAX_SERIALIZED_LENGTH)}...`
            : value;
    }

    if (typeof value !== 'object') {
        return value;
    }

    if (seen.has(value)) {
        return CIRCULAR;
    }

    if (depth >= MAX_DEPTH) {
        return `[${getType(value)}]`;
    }

    seen.add(value);

    if (Array.isArray(value)) {
        const sanitizedArray = value
            .slice(0, MAX_ARRAY_ITEMS)
            .map((item) => sanitizeValue(item, depth + 1, seen));

        if (value.length > MAX_ARRAY_ITEMS) {
            sanitizedArray.push({
                truncated: true,
                remainingItems: value.length - MAX_ARRAY_ITEMS,
            });
        }

        return compactValue(sanitizedArray);
    }

    const sanitizedObject = {};
    const entries = Object.entries(value).slice(0, MAX_OBJECT_KEYS);

    entries.forEach(([key, item]) => {
        sanitizedObject[key] = isSensitiveKey(key)
            ? REDACTED
            : sanitizeValue(item, depth + 1, seen);
    });

    const keyCount = Object.keys(value).length;

    if (keyCount > MAX_OBJECT_KEYS) {
        sanitizedObject.__truncated = true;
        sanitizedObject.__remainingKeys = keyCount - MAX_OBJECT_KEYS;
    }

    return compactValue(sanitizedObject);
};

const sanitizeHeaders = (headers = {}) => {
    return SAFE_HEADER_NAMES.reduce((safeHeaders, headerName) => {
        if (headers[headerName] === undefined) {
            return safeHeaders;
        }

        safeHeaders[headerName] = isSensitiveKey(headerName)
            ? REDACTED
            : sanitizeValue(headers[headerName]);

        return safeHeaders;
    }, {});
};

const saveRequestLog = async (logData) => {
    try {
        await requestLogRepository.create(logData);
    } catch (error) {
        console.error('Failed to persist request log', error);
    }
};

export { sanitizeValue, sanitizeHeaders, saveRequestLog };
