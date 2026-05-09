import { connect, disconnect } from 'mongoose';
import { env } from '#config/env.config.js';

const connectDB = async () => {
    await connect(env.MONGO_URI);
    console.log('Connected to MongoDB');
};

const disconnectDB = async () => {
    await disconnect();
};

export { connectDB, disconnectDB };
