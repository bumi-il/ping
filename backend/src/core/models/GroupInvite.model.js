import { model, Schema } from 'mongoose';
import { GROUP_INVITES_STATUSES } from '#core/constants/groupInvite.constants.js';

const groupInviteSchema = new Schema(
    {
        group: {
            type: Schema.Types.ObjectId,
            ref: 'Group',
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        maxUses: {
            type: Number,
            default: 1,
            min: 1,
        },
        usesCount: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        status: {
            type: String,
            enum: Object.values(GROUP_INVITES_STATUSES),
            default: GROUP_INVITES_STATUSES.ACTIVE,
        },
    },
    {
        timestamps: true,
        collection: 'group_invite',
    }
);

groupInviteSchema.index({ code: 1 }, { unique: true });
groupInviteSchema.index({ group: 1, status: 1 });
groupInviteSchema.index({ expiresAt: 1 });

export const GroupInvite = model('GroupInvite', groupInviteSchema);
