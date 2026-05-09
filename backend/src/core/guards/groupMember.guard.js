import { GROUP_MEMBER_STATUSES } from '../constants/groupMember.constants.js';
import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
import { MESSAGES } from '../constants/messages.constants.js';
import groupMemberRepository from '../repositories/groupMember.repository.js';
import AppError from '../utils/AppError.utils.js';

const checkGroupMember = async (req, _res, next) => {
    const groupMember = await groupMemberRepository.findByGroupAndUser(
        req.group._id,
        req.user._id,
    );

    if (!groupMember || groupMember.status !== GROUP_MEMBER_STATUSES.ACTIVE) {
        throw new AppError(MESSAGES.GROUP.ACCESS_DENIED, HTTP_STATUS.FORBIDDEN);
    }

    req.groupMember = groupMember;

    next();
};

export { checkGroupMember };
