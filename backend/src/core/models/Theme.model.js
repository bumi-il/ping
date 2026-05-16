import { model, Schema } from 'mongoose';
import { THEME_MODES } from '#core/constants/theme.constants.js';

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
            enum: Object.values(THEME_MODES),
            default: THEME_MODES.SYSTEM,
        },
        colors: {
            type: Map,
            of: String,
            default: () => ({}),
        },
    },
    {
        timestamps: true,
    }
);

themeSchema.index({ slug: 1 }, { unique: true });

export const Theme = model('Theme', themeSchema);
