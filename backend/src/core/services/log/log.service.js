import { env } from '#config/env.config.js';
import { sanitizeHeaders, sanitizeValue, saveRequestLog } from './log.helpers.js';

class LogService {
    requestLogger() {
        return (req, res, next) => {
            const startedAt = new Date();
            const originalJson = res.json.bind(res);
            let responseBody = null;

            res.json = (body) => {
                responseBody = body;
                return originalJson(body);
            };

            res.on('finish', () => {
                const endedAt = new Date();
                const statusCode = res.statusCode;

                const logData = {
                    nodeEnv: env.NODE_ENV,
                    method: req.method,
                    originalUrl: req.originalUrl,
                    path: req.originalUrl.split('?')[0],
                    query: sanitizeValue(req.query),
                    params: sanitizeValue(req.params),
                    body: sanitizeValue(req.body),
                    headers: sanitizeHeaders(req.headers),
                    ip: req.ip,
                    userAgent: req.get('user-agent') || '',
                    userId: req.user?._id || null,
                    statusCode,
                    responseBody: sanitizeValue(responseBody),
                    startedAt,
                    endedAt,
                    durationMs: endedAt.getTime() - startedAt.getTime(),
                    success: statusCode < 400,
                };

                saveRequestLog(logData);
            });

            next();
        };
    }
}

export default new LogService();
