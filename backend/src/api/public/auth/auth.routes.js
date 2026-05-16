import { Router } from 'express';
import authController from './auth.controller.js';

const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/sms/start', authController.startSms);
authRouter.post('/sms/verify', authController.verifySms);
authRouter.post('/restore', authController.restore);
authRouter.get('/verify-email', authController.verifyEmail);
authRouter.post('/resend-verification', authController.resendVerification);
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password', authController.resetPassword);

export default authRouter;
