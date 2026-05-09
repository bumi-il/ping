import { model, Schema } from 'mongoose';

const themeSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            trim: true,
        },
        mode: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system',
        },
        colors: {
            type: Map,
            of: String,
            default: () => ({}),
        },
    },
    {
        timestamps: true,
    },
);

themeSchema.index({ slug: 1 }, { unique: true });

export const Theme = model('Theme', themeSchema);
