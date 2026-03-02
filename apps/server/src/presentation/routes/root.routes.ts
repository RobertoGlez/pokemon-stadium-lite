import { FastifyInstance } from 'fastify';
import { RootController } from '../controllers/root.controller';

export const setupRootRoutes = (app: FastifyInstance) => {
    app.get('/', RootController.getServerInfo);
};
