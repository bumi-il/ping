import { GROUP_STATUSES } from '#core/constants/group.constants.js';
import { GROUP_MEMBER_STATUSES } from '#core/constants/groupMember.constants.js';
import { MESSAGES } from '#core/constants/messages.constants.js';
import groupRepository from '#core/repositories/group.repository.js';
import groupMemberRepository from '#core/repositories/groupMember.repository.js';
import { isObjectId } from '#core/utils/mongoose.utils.js';

const acknowledgeError = (acknowledge, message) => {
    if (typeof acknowledge === 'function') {
        acknowledge({ ok: false, message });
    }
};

const acknowledgeSuccess = (acknowledge, payload) => {
    if (typeof acknowledge === 'function') {
        acknowledge({ ok: true, ...payload });
    }
};

const joinGroup = async (socket, payload = {}, acknowledge) => {
    const { groupId } = payload;

    if (!isObjectId(groupId)) {
        return acknowledgeError(acknowledge, MESSAGES.GROUP.INVALID_ID);
    }

    const group = await groupRepository.findById(groupId);

    if (!group) {
        return acknowledgeError(acknowledge, MESSAGES.GROUP.NOT_FOUND);
    }

    if (group.status !== GROUP_STATUSES.ACTIVE) {
        return acknowledgeError(acknowledge, MESSAGES.GROUP.DISABLED);
    }

    const groupMember = await groupMemberRepository.findByGroupAndUser(group._id, socket.user._id);

    if (!groupMember || groupMember.status !== GROUP_MEMBER_STATUSES.ACTIVE) {
        return acknowledgeError(acknowledge, MESSAGES.GROUP.ACCESS_DENIED);
    }

    await socket.join(createGroupRoom(group._id));
    return acknowledgeSuccess(acknowledge, { groupId: group._id.toString() });
};

const leaveGroup = async (socket, payload = {}, acknowledge) => {
    const { groupId } = payload;

    if (!isObjectId(groupId)) {
        return acknowledgeError(acknowledge, MESSAGES.GROUP.INVALID_ID);
    }

    await socket.leave(createGroupRoom(groupId));
    return acknowledgeSuccess(acknowledge, { groupId });
};

const createGroupRoom = (groupId) => {
    return `group:${groupId}`;
};

const createSocketListeners = (socket) => {
    socket.on('group:join', (payload, acknowledge) => {
        joinGroup(socket, payload, acknowledge).catch((_error) => {
            acknowledgeError(acknowledge, MESSAGES.SERVER.INTERNAL_ERROR);
        });
    });

    socket.on('group:leave', (payload, acknowledge) => {
        leaveGroup(socket, payload, acknowledge).catch((_error) => {
            acknowledgeError(acknowledge, MESSAGES.SERVER.INTERNAL_ERROR);
        });
    });
};

export { createSocketListeners, createGroupRoom };
