import Fastify, { FastifyInstance } from 'fastify';
import { setupHealthRoutes } from '../../presentation/routes/health.routes';
import { setupRootRoutes } from '../../presentation/routes/root.routes';

export const buildServer = async (): Promise<FastifyInstance> => {
    const app = Fastify({
        logger: true,
    });

    // Register routes
    setupHealthRoutes(app);
    setupRootRoutes(app);

    return app;
};
