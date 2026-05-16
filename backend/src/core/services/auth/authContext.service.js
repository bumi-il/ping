import jwt from 'jsonwebtoken';
import { env } from '#config/env.config.js';
import { USER_STATUSES } from '#core/constants/user.constants.js';
import userRepository from '#core/repositories/user.repository.js';
import { isObjectId } from '#core/utils/mongoose.utils.js';
import { AUTH_CONTEXT_FAILURES } from '#core/constants/auth.constants.js';

class AuthContextService {
    async authenticateToken(token) {
        if (typeof token !== 'string' || !token.trim()) {
            return {
                user: null,
                failure: AUTH_CONTEXT_FAILURES.TOKEN_INVALID,
            };
        }

        let payload;

        try {
            payload = jwt.verify(token.trim(), env.JWT_SECRET);
        } catch (_error) {
            return {
                user: null,
                failure: AUTH_CONTEXT_FAILURES.TOKEN_INVALID,
            };
        }

        if (!isObjectId(payload.sub)) {
            return {
                user: null,
                failure: AUTH_CONTEXT_FAILURES.TOKEN_INVALID,
            };
        }

        const user = await userRepository.findById(payload.sub, {
            select: '-passwordHash -__v',
        });

        if (!user) {
            return {
                user: null,
                failure: AUTH_CONTEXT_FAILURES.USER_NOT_FOUND,
            };
        }

        if (user.status !== USER_STATUSES.ACTIVE) {
            return {
                user: null,
                failure: AUTH_CONTEXT_FAILURES.USER_DISABLED,
            };
        }

        if (!user.emailVerifiedAt) {
            return {
                user: null,
                failure: AUTH_CONTEXT_FAILURES.EMAIL_VERIFICATION_REQUIRED,
            };
        }

        return { user, failure: null };
    }
}

export default new AuthContextService();
