import { model, Schema } from 'mongoose';

const notificationSchema = new Schema(
    {
        // TODO: Add notification properties
    },
    {
        timestamps: true,
        collection: 'user_group_notification',
    }
);

export const Notification = model('Notification', notificationSchema);
