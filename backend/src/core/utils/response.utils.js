const successResponse = (res, status, data) => {
    return res.status(status).json({ success: true, data });
};

const errorResponse = (res, status, message) => {
    return res.status(status).json({ success: false, message });
};

export { successResponse, errorResponse };
