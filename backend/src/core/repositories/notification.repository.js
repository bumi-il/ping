import { Notification } from '../models/Notification.model.js';
import BaseRepository from './base.repository.js';

class NotificationRepository extends BaseRepository {
    constructor() {
        super(Notification);
    }
}

export default new NotificationRepository();
