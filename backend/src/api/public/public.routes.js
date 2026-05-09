import { Router } from 'express';
import authRouter from './auth/auth.routes.js';

const publicRouter = Router();

publicRouter.use('/auth', authRouter);

export default publicRouter;
