const GROUP_STATUSES = {
    ACTIVE: 'active',
    DISABLED: 'disabled',
};

const GROUP_VISIBILITIES = {
    PUBLIC: 'public',
    PRIVATE: 'private',
};

const GROUP_JOIN_POLICIES = {
    INVITE_ONLY: 'invite_only',
    APPROVAL_REQUIRED: 'approval_required',
    OPEN: 'open',
};

const GROUP_HEADER_KEY = 'x-group-id';

export {
    GROUP_STATUSES,
    GROUP_VISIBILITIES,
    GROUP_JOIN_POLICIES,
    GROUP_HEADER_KEY,
};
