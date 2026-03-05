import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { setupHealthRoutes } from '../../presentation/routes/health.routes';
import { setupRootRoutes } from '../../presentation/routes/root.routes';
import { setupPlayerRoutes } from '../../presentation/routes/player.routes';
import { Server } from 'socket.io';
import { initializeLobbyGateway } from '../../presentation/gateways/lobby.gateway';

export const buildServer = async (): Promise<FastifyInstance> => {
    const app = Fastify({
        logger: true,
    });

    // Add hook to support Chrome's Private Network Access (PNA) for localhost testing from cloud instances
    app.addHook('onSend', (request, reply, payload, done) => {
        if (request.headers['access-control-request-private-network']) {
            reply.header('Access-Control-Allow-Private-Network', 'true');
        }
        done();
    });

    // Habilitamos CORS sin restricciones para evitar problemas con la app web local e IPs locales
    await app.register(cors, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    });

    // Register routes
    setupHealthRoutes(app);
    setupRootRoutes(app);
    setupPlayerRoutes(app);

    app.ready(err => {
        if (err) throw err;

        const io = new Server(app.server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        io.engine.on("initial_headers", (headers: any, req: any) => {
            if (req.headers["access-control-request-private-network"]) {
                headers["Access-Control-Allow-Private-Network"] = "true";
            }
        });

        io.engine.on("headers", (headers: any, req: any) => {
            if (req.headers["access-control-request-private-network"]) {
                headers["Access-Control-Allow-Private-Network"] = "true";
            }
        });

        initializeLobbyGateway(io);
    });

    return app;
};
