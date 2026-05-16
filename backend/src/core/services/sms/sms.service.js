class SmsService {
    async sendOtp({ phoneNumber, code }) {
        console.info(`SMS OTP for ${phoneNumber}: ${code}`);

        return {
            provider: 'console',
            delivered: true,
        };
    }
}

export default new SmsService();
