import { model, Schema } from 'mongoose';

const userDeviceSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        deviceId: {
            type: String,
            required: true,
            trim: true,
        },
        platform: {
            type: String,
            required: true,
            trim: true,
        },
        deviceName: {
            type: String,
            default: '',
            trim: true,
        },
        appVersion: {
            type: String,
            default: '',
            trim: true,
        },
        osVersion: {
            type: String,
            default: '',
            trim: true,
        },
        pushToken: {
            type: String,
            default: '',
            trim: true,
        },
        locale: {
            type: String,
            default: '',
            trim: true,
        },
        timezone: {
            type: String,
            default: '',
            trim: true,
        },
        lastSeenAt: {
            type: Date,
            default: Date.now,
        },
        lastIp: {
            type: String,
            default: '',
            trim: true,
        },
        lastUserAgent: {
            type: String,
            default: '',
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        revokedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: 'user_device',
    }
);

userDeviceSchema.index({ user: 1, deviceId: 1 }, { unique: true });
userDeviceSchema.index({ user: 1, isActive: 1 });

export const UserDevice = model('UserDevice', userDeviceSchema);
