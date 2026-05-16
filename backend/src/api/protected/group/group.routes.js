import { Router } from 'express';
import { checkGroup } from '#core/guards/group.guard.js';
import groupController from './group.controller.js';
import { checkGroupMember } from '#core/guards/groupMember.guard.js';
import groupAdminRouter from './admin/groupAdmin.routes.js';

const groupRouter = Router({ mergeParams: true });

groupRouter.use(checkGroup);
groupRouter.use(checkGroupMember);

groupRouter.use('/admin', groupAdminRouter);
groupRouter.get('/current', groupController.getCurrent);

export default groupRouter;
