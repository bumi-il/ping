import { HTTP_STATUS } from '#core/constants/httpStatus.constants.js';
import { successResponse } from '#core/utils/response.utils.js';

class AppController {
    checkHealth = (_req, res) => {
        return successResponse(res, HTTP_STATUS.OK, {});
    };
}

export default new AppController();
