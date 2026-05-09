import { User } from '../models/User.model.js';
import BaseRepository from './base.repository.js';

class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    findByUsername(username, options = {}) {
        return this.findOne({ username }, options);
    }

    findByEmail(email, options = {}) {
        return this.findOne({ email }, options);
    }
}

export default new UserRepository();
