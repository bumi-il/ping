import { Router } from 'express';
import protectedRouter from './protected/protected.routes.js';
import publicRouter from './public/public.routes.js';

const api = Router();

api.use(publicRouter);
api.use(protectedRouter);

export default api;
