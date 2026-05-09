import AppError from '../utils/AppError.utils.js';

const checkUser = (req, _res, next) => {
    const userId = req.headers['user'];

    if (!userId) {
        throw new AppError('User not found', 401);
    }

    // TODO: Get user from database
    const user = '';
    req.user = user;

    next();
};

export { checkUser };
