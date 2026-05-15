import { GroupInvite } from '#core/models/GroupInvite.model.js';
import BaseRepository from './base.repository.js';

class GroupInviteRepository extends BaseRepository {
    constructor() {
        super(GroupInvite);
    }

    findByCode(code, options = {}) {
        return this.findOne({ code }, options);
    }

    findActiveByCode(code, options = {}) {
        return this.findOne(
            {
                code,
                status: 'active',
                expiresAt: { $gt: new Date() },
            },
            options
        );
    }

    findByGroup(group, options = {}) {
        return this.findMany({ group }, options);
    }

    findActiveByGroup(group, options = {}) {
        return this.findMany({ group, status: 'active' }, options);
    }

    incrementUses(id) {
        return this.updateById(id, { $inc: { usesCount: 1 } });
    }

    revokeById(id) {
        return this.updateById(id, { status: 'revoked' });
    }
}

export default new GroupInviteRepository();
