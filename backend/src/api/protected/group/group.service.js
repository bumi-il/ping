import { getGroup, getGroupMember } from '#core/utils/group.utils.js';

class GroupService {
    getCurrent(req) {
        return {
            group: getGroup(req),
            membership: getGroupMember(req),
        };
    }
}

export default new GroupService();
