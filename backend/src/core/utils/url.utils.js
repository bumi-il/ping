import { env } from '#config/env.config.js';

const createUrl = (origin, path, params = {}) => {
    const url = new URL(path, origin);

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    return url.toString();
};

const createApiUrl = (path, params = {}) => {
    return createUrl(env.API_ORIGIN, path, params);
};

const createClientUrl = (path, params = {}) => {
    return createUrl(env.CLIENT_ORIGIN, path, params);
};

export { createUrl, createApiUrl, createClientUrl };
