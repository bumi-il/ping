import { Router } from 'express';
import { checkPlatformAdmin } from '../../../core/guards/platformAdmin.guard.js';
import adminController from './admin.controller.js';

const adminRouter = Router();

adminRouter.use(checkPlatformAdmin);

adminRouter.get('/me', adminController.getMe);

export default adminRouter;
