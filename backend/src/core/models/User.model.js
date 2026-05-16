import { model, Schema } from 'mongoose';
import { USER_STATUSES } from '#core/constants/user.constants.js';

const userSchema = new Schema(
    {
        // Basic required information
        username: {
            type: String,
            required: true,
            trim: true,
        },
        displayName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
            trim: true,
        },

        // Additional information
        avatar: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: Object.values(USER_STATUSES),
            default: USER_STATUSES.ACTIVE,
        },
        emailVerifiedAt: {
            type: Date,
            default: null,
        },

        // Preferences
        locale: {
            type: String,
            default: 'en-US',
        },
        theme: {
            type: Schema.Types.ObjectId,
            ref: 'Theme',
            default: null,
        },

        // Platform information
        isPlatformAdmin: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ status: 1 });

export const User = model('User', userSchema);
