import { FastifyInstance } from 'fastify';
import { HealthController } from '../controllers/health.controller';

export const setupHealthRoutes = (app: FastifyInstance) => {
    app.get('/api/health', HealthController.check);
};
