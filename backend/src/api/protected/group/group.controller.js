import { HTTP_STATUS } from '#core/constants/httpStatus.constants.js';
import { successResponse } from '#core/utils/response.utils.js';
import groupService from './group.service.js';

class GroupController {
    getCurrent = (req, res) => {
        return successResponse(
            res,
            HTTP_STATUS.OK,
            groupService.getCurrent(req),
        );
    };
}

export default new GroupController();
