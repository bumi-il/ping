import { model, Schema } from 'mongoose';

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
            // TODO: Add default theme
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
            enum: ['public', 'private'],
            default: 'private',
        },
        joinPolicy: {
            type: String,
            enum: ['open', 'approval_required', 'invite_only'],
            default: 'invite_only',
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
            enum: ['active', 'disabled'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    },
);

groupSchema.index({ slug: 1 }, { unique: true });
groupSchema.index({ owner: 1 });
groupSchema.index({ visibility: 1, status: 1 });

export const Group = model('Group', groupSchema);
