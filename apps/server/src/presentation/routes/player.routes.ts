import { FastifyInstance } from 'fastify';
import { PlayerController } from '../controllers/player.controller';

export const setupPlayerRoutes = (app: FastifyInstance) => {
    // GET /api/players/check?nickname=xxx
    // Returns { available: boolean, message?: string }
    app.get('/api/players/check', PlayerController.checkNickname);
};
