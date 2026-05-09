import { isValidObjectId, Types } from 'mongoose';

const isObjectId = (value) => {
    return isValidObjectId(value);
};

const toObjectId = (value) => {
    return new Types.ObjectId(value);
};

export { isObjectId, toObjectId };
