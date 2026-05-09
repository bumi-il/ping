import AppError from '../utils/AppError.utils';

const checkGroup = (req, _res, next) => {
    const groupId = req.headers['group-id'];

    if (!groupId) {
        throw new AppError('Group not found', 401);
    }

    // TODO: Get group from database
    const group = '';
    req.group = group;

    next();
};

export { checkGroup };
