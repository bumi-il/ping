import { Router } from 'express';
import authRouter from './auth/auth.routes.js';
import appRouter from './app/app.routes.js';

const publicRouter = Router();

publicRouter.use('/app', appRouter);
publicRouter.use('/auth', authRouter);

export default publicRouter;
