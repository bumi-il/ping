import { config } from 'dotenv';
config();

export const env = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
    NODE_ENV: process.env.NODE_ENV,
};
