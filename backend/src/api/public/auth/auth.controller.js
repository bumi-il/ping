import { HTTP_STATUS } from '#core/constants/httpStatus.constants.js';
import { successResponse } from '#core/utils/response.utils.js';
import authService from './auth.service.js';

class AuthController {
    register = async (req, res) => {
        const authPayload = await authService.register(req.body);
        return successResponse(res, HTTP_STATUS.CREATED, authPayload);
    };

    login = async (req, res) => {
        const authPayload = await authService.login(req.body);
        return successResponse(res, HTTP_STATUS.OK, authPayload);
    };
}

export default new AuthController();
