import { NODE_ENVS } from '#core/constants/constants.js';
import { config } from 'dotenv';
config();

const env = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,

    JWT_SECRET: process.env.JWT_SECRET,

    MONGO_URI: process.env.MONGO_URI,

    RESEND_API_KEY: process.env.RESEND_API_KEY,
    APP_EMAIL: process.env.APP_EMAIL,
};

const REQUIRED_ENVS = ['PORT', 'MONGO_URI', 'JWT_SECRET'];

REQUIRED_ENVS.forEach((key) => {
    if (!env[key]) {
        throw new Error(`${key} is not configured`);
    }
});

if (env.NODE_ENV === NODE_ENVS.PROD) {
    Object.keys(env).forEach((key) => {
        if (!env[key]) {
            throw new Error(`${key} is not configured`);
        }
    });
} else {
    Object.keys(env).forEach((key) => {
        if (!env[key]) {
            console.error(`🚫 ${key} is not configured`);
        }
    });
}

Object.freeze(env);

export { env };
