import { PhoneOtp } from '#core/models/PhoneOtp.model.js';
import BaseRepository from './base.repository.js';

class PhoneOtpRepository extends BaseRepository {
    constructor() {
        super(PhoneOtp);
    }

    findLatestUsableByPhoneNumber(phoneNumber, options = {}) {
        const query = this.model
            .findOne({
                phoneNumber,
                usedAt: null,
                expiresAt: { $gt: new Date() },
            })
            .sort({ createdAt: -1 });

        return this.applyReadOptions(query, options);
    }

    incrementAttemptById(id) {
        return this.updateById(id, { $inc: { attemptCount: 1 } });
    }

    markUsedById(id) {
        return this.updateById(id, { usedAt: new Date() });
    }

    invalidateUnusedByPhoneNumber(phoneNumber) {
        return this.model.updateMany(
            {
                phoneNumber,
                usedAt: null,
            },
            {
                usedAt: new Date(),
            }
        );
    }
}

export default new PhoneOtpRepository();
