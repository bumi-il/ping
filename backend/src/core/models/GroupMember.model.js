import { model, Schema } from 'mongoose';

const groupMemberSchema = new Schema(
    {
        group: {
            type: Schema.Types.ObjectId,
            ref: 'Group',
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['owner', 'admin', 'member'],
            default: 'member',
        },
        status: {
            type: String,
            enum: ['active', 'pending', 'invited', 'blocked'],
            required: true,
        },
        invitedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },

        // Preferences
        notifications: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        collection: 'group_member',
    },
);

groupMemberSchema.index({ group: 1, user: 1 }, { unique: true });
groupMemberSchema.index({ user: 1, status: 1 });
groupMemberSchema.index({ group: 1, role: 1 });

export const GroupMember = model('GroupMember', groupMemberSchema);
