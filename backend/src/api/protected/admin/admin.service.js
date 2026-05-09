import { getUser } from '../../../core/utils/user.utils.js';

class AdminService {
    getMe(req) {
        return {
            user: getUser(req),
            scope: 'platform-admin',
        };
    }
}

export default new AdminService();
