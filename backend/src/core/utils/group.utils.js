const getGroup = (req) => {
    return req.group;
};

const getGroupMember = (req) => {
    return req.groupMember;
};

export { getGroup, getGroupMember };
