import { HTTP_STATUS } from '#core/constants/httpStatus.constants.js';
import { successResponse } from '#core/utils/response.utils.js';
import adminService from './admin.service.js';

class AdminController {
    getMe = (req, res) => {
        return successResponse(res, HTTP_STATUS.OK, adminService.getMe(req));
    };
}

export default new AdminController();
