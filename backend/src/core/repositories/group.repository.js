import { Group } from '#core/models/Group.model.js';
import BaseRepository from './base.repository.js';

class GroupRepository extends BaseRepository {
    constructor() {
        super(Group);
    }

    findBySlug(slug, options = {}) {
        return this.findOne({ slug }, options);
    }

    findByOwner(owner, options = {}) {
        return this.findMany({ owner }, options);
    }

    findPublicActive(options = {}) {
        return this.findMany(
            {
                visibility: 'public',
                status: 'active',
            },
            options,
        );
    }

    incrementCounters(id, counters) {
        return this.updateById(id, { $inc: counters });
    }
}

export default new GroupRepository();
