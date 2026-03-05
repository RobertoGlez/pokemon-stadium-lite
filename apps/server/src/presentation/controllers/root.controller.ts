import { FastifyReply, FastifyRequest } from 'fastify';
import { GetServerInfoUseCase } from '../../application/use-cases/system/get-server-info.usecase';

export class RootController {
    static async getServerInfo(request: FastifyRequest, reply: FastifyReply) {
        try {
            const useCase = new GetServerInfoUseCase();
            const result = useCase.execute();

            return reply.send(result);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred while processing your request.',
            });
        }
    }
}
