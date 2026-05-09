import { Router } from 'express';
import { checkUser } from '../../core/guards/user.guard';
import { checkGroup } from '../../core/guards/group.guard';

const protectedRouter = Router();

protectedRouter.use(checkUser);
protectedRouter.use(checkGroup);

export default protectedRouter;
