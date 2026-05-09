import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
import { MESSAGES } from '../constants/messages.constants.js';
import groupRepository from '../repositories/group.repository.js';
import AppError from '../utils/AppError.utils.js';
import { isObjectId } from '../utils/mongoose.utils.js';
import {
    GROUP_HEADER_KEY,
    GROUP_STATUSES,
} from '../constants/group.constants.js';

const checkGroup = async (req, _res, next) => {
    const groupId = req.headers[GROUP_HEADER_KEY];

    if (!groupId) {
        throw new AppError(MESSAGES.GROUP.REQUIRED, HTTP_STATUS.BAD_REQUEST);
    }

    if (!isObjectId(groupId)) {
        throw new AppError(MESSAGES.GROUP.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
    }

    const group = await groupRepository.findById(groupId);

    if (!group) {
        throw new AppError(MESSAGES.GROUP.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (group.status !== GROUP_STATUSES.ACTIVE) {
        throw new AppError(MESSAGES.GROUP.DISABLED, HTTP_STATUS.FORBIDDEN);
    }

    req.group = group;

    next();
};

export { checkGroup };
