import { NODE_ENVS } from '#core/constants/constants.js';
import { config } from 'dotenv';
config();

const env = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
    API_ORIGIN: process.env.API_ORIGIN,

    JWT_SECRET: process.env.JWT_SECRET,

    MONGO_URI: process.env.MONGO_URI,

    RESEND_API_KEY: process.env.RESEND_API_KEY,
    APP_EMAIL: process.env.APP_EMAIL,

    SMS_PROVIDER: process.env.SMS_PROVIDER || 'console',
    SMS_FROM: process.env.SMS_FROM,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
};

const REQUIRED_ENVS = ['PORT', 'MONGO_URI', 'JWT_SECRET'];
const PROD_REQUIRED_ENVS = [
    'PORT',
    'NODE_ENV',
    'CLIENT_ORIGIN',
    'API_ORIGIN',
    'JWT_SECRET',
    'MONGO_URI',
    'RESEND_API_KEY',
    'APP_EMAIL',
];
const TWILIO_REQUIRED_ENVS = ['SMS_FROM', 'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'];

REQUIRED_ENVS.forEach((key) => {
    if (!env[key]) {
        throw new Error(`${key} is not configured`);
    }
});

if (env.NODE_ENV === NODE_ENVS.PROD) {
    PROD_REQUIRED_ENVS.forEach((key) => {
        if (!env[key]) {
            throw new Error(`${key} is not configured`);
        }
    });

    if (env.SMS_PROVIDER === 'twilio') {
        TWILIO_REQUIRED_ENVS.forEach((key) => {
            if (!env[key]) {
                throw new Error(`${key} is not configured`);
            }
        });
    }
} else {
    Object.keys(env).forEach((key) => {
        if (env.SMS_PROVIDER !== 'twilio' && TWILIO_REQUIRED_ENVS.includes(key)) {
            return;
        }

        if (!env[key]) {
            console.error(`🚫 ${key} is not configured`);
        }
    });
}

Object.freeze(env);

export { env };
