import { UserDevice } from '#core/models/userDevice.model.js';
import BaseRepository from './base.repository.js';

class UserDeviceRepository extends BaseRepository {
    constructor() {
        super(UserDevice);
    }

    findByUserAndDeviceId(user, deviceId, options = {}) {
        return this.findOne({ user, deviceId }, options);
    }

    upsertForUser(user, deviceId, data = {}) {
        return this.updateOne(
            { user, deviceId },
            {
                $set: {
                    ...data,
                    user,
                    deviceId,
                    isActive: true,
                    revokedAt: null,
                    lastSeenAt: new Date(),
                },
            },
            { upsert: true }
        );
    }

    touchLastSeen(user, deviceId, data = {}) {
        return this.updateOne(
            { user, deviceId },
            {
                $set: {
                    ...data,
                    lastSeenAt: new Date(),
                },
            }
        );
    }

    deactivate(user, deviceId) {
        return this.updateOne(
            { user, deviceId },
            {
                isActive: false,
                revokedAt: new Date(),
            }
        );
    }
}

export default new UserDeviceRepository();
