import { model, Schema } from 'mongoose';

const phoneOtpSchema = new Schema(
    {
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        codeHash: {
            type: String,
            required: true,
            trim: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        usedAt: {
            type: Date,
            default: null,
        },
        attemptCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastSentAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        requestIp: {
            type: String,
            default: '',
            trim: true,
        },
        requestUserAgent: {
            type: String,
            default: '',
            trim: true,
        },
    },
    {
        timestamps: true,
        collection: 'phone_otp',
    }
);

phoneOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
phoneOtpSchema.index({ phoneNumber: 1, usedAt: 1, createdAt: -1 });

export const PhoneOtp = model('PhoneOtp', phoneOtpSchema);
