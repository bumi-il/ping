const successResponse = (res, status, data) => {
    return res.status(status).json({ success: true, data });
};

const errorResponse = (res, status, message, details = {}) => {
    return res.status(status).json({ success: false, message, ...details });
};

const redirectResponse = (res, url) => {
    return res.redirect(url);
};

export { successResponse, errorResponse, redirectResponse };
