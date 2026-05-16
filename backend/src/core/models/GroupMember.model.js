import { model, Schema } from 'mongoose';
import {
    GROUP_MEMBER_ROLES,
    GROUP_MEMBER_STATUSES,
} from '#core/constants/groupMember.constants.js';

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
            enum: Object.values(GROUP_MEMBER_ROLES),
            default: GROUP_MEMBER_ROLES.MEMBER,
        },
        status: {
            type: String,
            enum: Object.values(GROUP_MEMBER_STATUSES),
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
    }
);

groupMemberSchema.index({ group: 1, user: 1 }, { unique: true });
groupMemberSchema.index({ user: 1, status: 1 });
groupMemberSchema.index({ group: 1, role: 1 });

export const GroupMember = model('GroupMember', groupMemberSchema);
