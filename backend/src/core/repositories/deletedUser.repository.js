import { DeletedUser } from '#core/models/DeletedUser.model.js';
import { DELETED_USER_TTL } from '#core/constants/auth.constants.js';
import BaseRepository from './base.repository.js';

class DeletedUserRepository extends BaseRepository {
    constructor() {
        super(DeletedUser);
    }

    findByUsername(username, options = {}) {
        return this.findOne({ username }, options);
    }

    findByEmail(email, options = {}) {
        return this.findOne({ email }, options);
    }

    findRestorableByUsername(username, options = {}) {
        return this.findRestorable({ username }, options);
    }

    findRestorableByEmail(email, options = {}) {
        return this.findRestorable({ email }, options);
    }

    findRestorable(filter = {}, options = {}) {
        const deletedAfter = new Date(Date.now() - DELETED_USER_TTL);
        const query = this.model
            .findOne({
                ...filter,
                restored: false,
                deletedAt: { $gte: deletedAfter },
            })
            .sort({ deletedAt: -1 });

        return this.applyReadOptions(query, options);
    }

    markRestoredById(id) {
        return this.updateOne({ _id: id, restored: false }, { restored: true });
    }
}

export default new DeletedUserRepository();
