import { RequestLog } from '#core/models/RequestLog.model.js';
import BaseRepository from './base.repository.js';

class RequestLogRepository extends BaseRepository {
    constructor() {
        super(RequestLog);
    }
}

export default new RequestLogRepository();
