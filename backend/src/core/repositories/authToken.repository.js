import { AuthToken } from '#core/models/AuthToken.model.js';
import BaseRepository from './base.repository.js';

class AuthTokenRepository extends BaseRepository {
    constructor() {
        super(AuthToken);
    }

    findUsableToken({ tokenHash, type }, options = {}) {
        return this.findOne(
            {
                tokenHash,
                type,
                usedAt: null,
                expiresAt: { $gt: new Date() },
            },
            options
        );
    }

    markUsedById(id) {
        return this.updateById(id, { usedAt: new Date() });
    }

    invalidateUnusedForUser({ user, type }) {
        return this.model.updateMany(
            {
                user,
                type,
                usedAt: null,
            },
            {
                $set: { usedAt: new Date() },
            }
        );
    }
}

export default new AuthTokenRepository();
