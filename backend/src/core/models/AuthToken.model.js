import { model, Schema } from 'mongoose';
import { AUTH_TOKEN_TYPES } from '#core/constants/auth.constants.js';

const authTokenSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(AUTH_TOKEN_TYPES), // TODO: Make like this in all models
            required: true,
        },
        tokenHash: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        usedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TODO: What is expireAfterSeconds
authTokenSchema.index({ user: 1, type: 1, usedAt: 1 });
authTokenSchema.index({ tokenHash: 1, type: 1, usedAt: 1, expiresAt: 1 });

export const AuthToken = model('AuthToken', authTokenSchema);
