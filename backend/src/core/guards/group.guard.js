import { HTTP_STATUS } from '#core/constants/httpStatus.constants.js';
import { MESSAGES } from '#core/constants/messages.constants.js';
import groupRepository from '#core/repositories/group.repository.js';
import AppError from '#core/utils/AppError.utils.js';
import { isObjectId } from '#core/utils/mongoose.utils.js';
import { GROUP_STATUSES } from '#core/constants/group.constants.js';

const checkGroup = async (req, _res, next) => {
    const { groupId } = req.params;

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
