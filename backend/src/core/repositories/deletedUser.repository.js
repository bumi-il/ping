import { DeletedUser } from '#core/models/DeletedUser.model.js';
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
}

export default new DeletedUserRepository();
