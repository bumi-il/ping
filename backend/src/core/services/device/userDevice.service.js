import userDeviceRepository from '#core/repositories/userDevice.repository.js';

class UserDeviceService {
    upsertAuthenticatedDevice({ user, device, req }) {
        const deviceData = this.toDeviceData(device, req);

        return userDeviceRepository.upsertForUser(user, deviceData.deviceId, deviceData);
    }

    toDeviceData(device = {}, req = null) {
        const ip = req?.ip || req?.headers?.['x-forwarded-for'] || '';
        const userAgent = req?.headers?.['user-agent'] || '';

        return {
            deviceId: device.deviceId.trim(),
            platform: device.platform.trim(),
            deviceName: this.optionalString(device.deviceName),
            appVersion: this.optionalString(device.appVersion),
            osVersion: this.optionalString(device.osVersion),
            pushToken: this.optionalString(device.pushToken),
            locale: this.optionalString(device.locale),
            timezone: this.optionalString(device.timezone),
            lastIp: Array.isArray(ip) ? ip[0] : ip,
            lastUserAgent: userAgent,
        };
    }

    optionalString(value) {
        return typeof value === 'string' ? value.trim() : '';
    }
}

export default new UserDeviceService();
