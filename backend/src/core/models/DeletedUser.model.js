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
    },
    {
        timestamps: true,
        collection: 'deleted_user',
    },
);

deletedUserSchema.index({ username: 1 }, { unique: true });
deletedUserSchema.index({ email: 1 }, { unique: true });
deletedUserSchema.index({ deletedAt: 1 });

export const DeletedUser = model('DeletedUser', deletedUserSchema);
