import { model, Schema } from 'mongoose';

const userSchema = new Schema(
    {
        // Basic required information
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            trim: true,
        },
        displayName: {
            type: String,
            trim: true,
            default: '',
        },
        email: {
            type: String,
            trim: true,
        },
        passwordHash: {
            type: String,
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
        emailVerifiedAt: {
            type: Date,
            default: null,
        },
        phoneVerifiedAt: {
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

userSchema.index({ phoneNumber: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ status: 1 });

export const User = model('User', userSchema);
