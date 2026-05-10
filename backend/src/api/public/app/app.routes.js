import { Router } from 'express';
import appController from './app.controller.js';

const appRouter = Router();

appRouter.get('/health', appController.checkHealth);

export default appRouter;
