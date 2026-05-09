import { Router } from 'express';
import generalController from './general.controller.js';

const generalRouter = Router();

generalRouter.get('/me', generalController.getMe);

export default generalRouter;
