import { FastifyReply, FastifyRequest } from 'fastify';
import { CheckHealthUseCase } from '../../application/use-cases/system/check-health.usecase';

export class HealthController {
    static async check(request: FastifyRequest, reply: FastifyReply) {
        const useCase = new CheckHealthUseCase();
        const result = useCase.execute();
        return reply.send(result);
    }
}
