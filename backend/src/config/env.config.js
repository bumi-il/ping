import { config } from 'dotenv';
config();

const env = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
    NODE_ENV: process.env.NODE_ENV,
};

const REQUIRED_ENVS = ['PORT', 'MONGO_URI', 'JWT_SECRET', 'NODE_ENV'];

REQUIRED_ENVS.forEach((key) => {
    if (!env[key]) {
        throw new Error(`${key} is not configured`);
    }
});

export { env };
