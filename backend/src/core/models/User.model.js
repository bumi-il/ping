import { model, Schema } from 'mongoose';

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
            enum: ['active', 'disabled'],
            default: 'active',
        },

        // Preferences
        locale: {
            type: String,
            default: 'en-US',
        },
        theme: {
            type: Schema.Types.ObjectId,
            ref: 'Theme',
            // TODO: Add default theme
        },

        // Platform information
        isPlatformAdmin: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ status: 1 });

export const User = model('User', userSchema);
