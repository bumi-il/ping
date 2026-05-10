import { Router } from 'express';
import appController from './app.controller';

const appRouter = Router();

appRouter.get('/health', appController.checkHealth);

export default appRouter;
