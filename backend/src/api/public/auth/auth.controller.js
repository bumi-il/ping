import { HTTP_STATUS } from '#core/constants/httpStatus.constants.js';
import {
    redirectResponse,
    successResponse,
} from '#core/utils/response.utils.js';
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

    restore = async (req, res) => {
        const authPayload = await authService.restore(req.body);
        return successResponse(res, HTTP_STATUS.CREATED, authPayload);
    };

    verifyEmail = async (req, res) => {
        const redirectUrl = await authService.verifyEmail(req.query);
        return redirectResponse(res, redirectUrl);
    };

    resendVerification = async (req, res) => {
        const result = await authService.resendVerification(req.body);
        return successResponse(res, HTTP_STATUS.OK, result);
    };

    forgotPassword = async (req, res) => {
        const result = await authService.forgotPassword(req.body);
        return successResponse(res, HTTP_STATUS.OK, result);
    };

    resetPassword = async (req, res) => {
        const result = await authService.resetPassword(req.body);
        return successResponse(res, HTTP_STATUS.OK, result);
    };
}

export default new AuthController();
