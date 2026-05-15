import { Router } from 'express';
import protectedRouter from './protected/protected.routes.js';
import publicRouter from './public/public.routes.js';

const api = Router();

api.use('/public', publicRouter);
api.use('/protected', protectedRouter);

export default api;
