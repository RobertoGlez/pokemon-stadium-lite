import { FastifyReply, FastifyRequest } from 'fastify';
import { MongoPlayerRepository } from '../../infrastructure/database/repositories/mongo-player.repository';

interface CheckNicknameQuery {
    nickname?: string;
}

export class PlayerController {
    static async checkNickname(
        request: FastifyRequest<{ Querystring: CheckNicknameQuery }>,
        reply: FastifyReply
    ) {
        const { nickname } = request.query;

        if (!nickname || nickname.trim() === '') {
            return reply.status(400).send({ available: false, message: 'Nickname es requerido.' });
        }

        const playerRepo = new MongoPlayerRepository();
        const existing = await playerRepo.findByNickname(nickname.trim().toLowerCase());

        if (existing && existing.isOnline) {
            return reply.send({
                available: false,
                message: `El apodo "${nickname}" ya está en uso. Elige otro.`
            });
        }

        return reply.send({ available: true });
    }
}
