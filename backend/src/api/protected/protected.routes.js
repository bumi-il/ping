import { Router } from 'express';
import { checkUser } from '#core/guards/user.guard.js';
import adminRouter from './admin/admin.routes.js';
import generalRouter from './general/general.routes.js';
import groupRouter from './group/group.routes.js';

const protectedRouter = Router();

protectedRouter.use(checkUser);

protectedRouter.use(generalRouter);
protectedRouter.use('/admin', adminRouter);
protectedRouter.use('/group', groupRouter);

export default protectedRouter;
