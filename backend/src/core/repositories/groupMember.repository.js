import { GroupMember } from '#core/models/GroupMember.model.js';
import BaseRepository from './base.repository.js';

class GroupMemberRepository extends BaseRepository {
    constructor() {
        super(GroupMember);
    }

    findByGroupAndUser(group, user, options = {}) {
        return this.findOne({ group, user }, options);
    }

    findByUser(user, options = {}) {
        return this.findMany({ user }, options);
    }

    findActiveByUser(user, options = {}) {
        return this.findMany({ user, status: 'active' }, options);
    }

    findByGroup(group, options = {}) {
        return this.findMany({ group }, options);
    }

    findActiveByGroup(group, options = {}) {
        return this.findMany({ group, status: 'active' }, options);
    }

    findAdminsByGroup(group, options = {}) {
        return this.findMany(
            {
                group,
                role: { $in: ['owner', 'admin'] },
                status: 'active',
            },
            options,
        );
    }
}

export default new GroupMemberRepository();
