import { model, Schema } from 'mongoose';

const requestLogSchema = new Schema(
    {
        nodeEnv: {
            type: String,
            default: 'UNSPECIFIED',
            trim: true,
        },
        method: {
            type: String,
            required: true,
            trim: true,
        },
        originalUrl: {
            type: String,
            required: true,
            trim: true,
        },
        path: {
            type: String,
            required: true,
            trim: true,
        },
        query: {
            type: Schema.Types.Mixed,
            default: () => ({}),
        },
        params: {
            type: Schema.Types.Mixed,
            default: () => ({}),
        },
        body: {
            type: Schema.Types.Mixed,
            default: null,
        },
        headers: {
            type: Schema.Types.Mixed,
            default: () => ({}),
        },
        ip: {
            type: String,
            default: '',
            trim: true,
        },
        userAgent: {
            type: String,
            default: '',
            trim: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        statusCode: {
            type: Number,
            required: true,
        },
        responseBody: {
            type: Schema.Types.Mixed,
            default: null,
        },
        startedAt: {
            type: Date,
            required: true,
        },
        endedAt: {
            type: Date,
            required: true,
        },
        durationMs: {
            type: Number,
            required: true,
        },
        success: {
            type: Boolean,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: 'request_logs',
    },
);

requestLogSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 30 },
);
requestLogSchema.index({ statusCode: 1, createdAt: -1 });
requestLogSchema.index({ userId: 1, createdAt: -1 });
requestLogSchema.index({ method: 1, path: 1, createdAt: -1 });

export const RequestLog = model('RequestLog', requestLogSchema);
