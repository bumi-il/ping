import { getUser } from '#core/utils/user.utils.js';

class GeneralService {
    getMe(req) {
        return {
            user: getUser(req),
        };
    }
}

export default new GeneralService();
