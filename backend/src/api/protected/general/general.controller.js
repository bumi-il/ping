import { HTTP_STATUS } from '../../../core/constants/httpStatus.constants.js';
import { successResponse } from '../../../core/utils/response.utils.js';
import generalService from './general.service.js';

class GeneralController {
    getMe = (req, res) => {
        return successResponse(
            res,
            HTTP_STATUS.OK,
            generalService.getMe(req),
        );
    };
}

export default new GeneralController();
