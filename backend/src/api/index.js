import { Router } from 'express';
import protectedRouter from './protected';
import publicRouter from './public';

const api = Router();

api.use(protectedRouter);
api.use(publicRouter);

export default api;
