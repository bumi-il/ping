import { model, Schema } from 'mongoose';
import {
    GROUP_JOIN_POLICIES,
    GROUP_STATUSES,
    GROUP_VISIBILITIES,
} from '#core/constants/group.constants.js';

const groupSchema = new Schema(
    {
        // Basic information
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
        description: {
            type: String,
            default: '',
            trim: true,
        },
        icon: {
            type: String,
            default: '',
            trim: true,
        },
        theme: {
            type: Schema.Types.ObjectId,
            ref: 'Theme',
            default: null,
        },

        // Group members
        owner: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },

        // Group counters
        membersCount: {
            type: Number,
            default: 1,
            min: 0,
        },
        totalPingCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        activePingCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Group settings
        visibility: {
            type: String,
            enum: Object.values(GROUP_VISIBILITIES),
            default: GROUP_VISIBILITIES.PRIVATE,
        },
        joinPolicy: {
            type: String,
            enum: Object.values(GROUP_JOIN_POLICIES),
            default: GROUP_JOIN_POLICIES.INVITE_ONLY,
        },
        allowMembersToInvite: {
            type: Boolean,
            default: true,
        },
        allowMembersToCreatePings: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            enum: Object.values(GROUP_STATUSES),
            default: GROUP_STATUSES.ACTIVE,
        },
    },
    {
        timestamps: true,
    }
);

groupSchema.index({ slug: 1 }, { unique: true });
groupSchema.index({ owner: 1 });
groupSchema.index({ visibility: 1, status: 1 });

export const Group = model('Group', groupSchema);
