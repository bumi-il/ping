import { model, Schema } from 'mongoose';

const deletedUserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
            trim: true,
        },
        dataToRestore: {
            type: Schema.Types.Mixed,
        },
        deletedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        deletedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        restored: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        collection: 'deleted_user',
    }
);

deletedUserSchema.pre('save', async function blockRestoredDocumentChanges() {
    if (this.isNew || !this.isModified()) {
        return;
    }

    const existingDeletedUser = await this.constructor.findById(this._id).select('restored').lean();

    if (existingDeletedUser?.restored) {
        throw new Error('Restored deleted user documents are immutable');
    }
});

deletedUserSchema.pre(
    ['findOneAndUpdate', 'updateOne', 'updateMany'],
    async function blockRestoredDocumentUpdates() {
        const restoredDeletedUserCount = await this.model.countDocuments({
            ...this.getQuery(),
            restored: true,
        });

        if (restoredDeletedUserCount > 0) {
            throw new Error('Restored deleted user documents are immutable');
        }
    }
);

deletedUserSchema.index({ deletedAt: 1 });
deletedUserSchema.index({ username: 1, restored: 1, deletedAt: -1 });
deletedUserSchema.index({ email: 1, restored: 1, deletedAt: -1 });

export const DeletedUser = model('DeletedUser', deletedUserSchema);
