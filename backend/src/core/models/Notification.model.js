import { model, Schema } from 'mongoose';

const notificationSchema = new Schema(
    {
        // user: {
        //     type: Schema.Types.ObjectId,
        //     ref: 'User',
        //     required: true,
        // },
        // group: {
        //     type: Schema.Types.ObjectId,
        //     ref: 'Group',
        //     default: null,
        // },
        // type: {
        //     type: String,
        //     required: true,
        //     enum: ['group_invite', 'group_update', 'ping_created', 'system'],
        // },
        // title: {
        //     type: String,
        //     required: true,
        //     trim: true,
        // },
        // body: {
        //     type: String,
        //     default: '',
        //     trim: true,
        // },
        // data: {
        //     type: Schema.Types.Mixed,
        //     default: () => ({}),
        // },
        // readAt: {
        //     type: Date,
        //     default: null,
        // },
    },
    {
        timestamps: true,
        collection: 'user_group_notification',
    },
);

// notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });
// notificationSchema.index({ group: 1, createdAt: -1 });

export const Notification = model('Notification', notificationSchema);
