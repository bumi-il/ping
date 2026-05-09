import { model, Schema } from 'mongoose';

const themeSchema = new Schema({
    // TODO: Add theme properties
    // TODO: Remember light / dark mode
});

export const Theme = model('Theme', themeSchema);
