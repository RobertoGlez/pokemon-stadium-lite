import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { setupHealthRoutes } from '../../presentation/routes/health.routes';
import { setupRootRoutes } from '../../presentation/routes/root.routes';
import { Server } from 'socket.io';
import { initializeLobbyGateway } from '../../presentation/gateways/lobby.gateway';

export const buildServer = async (): Promise<FastifyInstance> => {
    const app = Fastify({
        logger: true,
    });

    // Habilitamos CORS sin restricciones para evitar problemas con la app web local e IPs locales
    await app.register(cors, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    });

    // Register routes
    setupHealthRoutes(app);
    setupRootRoutes(app);

    app.ready(err => {
        if (err) throw err;

        const io = new Server(app.server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        initializeLobbyGateway(io);
    });

    return app;
};
