import { FastifyReply, FastifyRequest } from 'fastify';
import { CheckHealthUseCase } from '../../application/use-cases/system/check-health.usecase';
import { GetPokemonDetailsUseCase } from '../../application/use-cases/pokemon-catalog/get-pokemon-details.usecase';
import { PokemonApiAdapter } from '../../infrastructure/http/adapters/pokemon-api.adapter';

export class HealthController {
    static async check(request: FastifyRequest, reply: FastifyReply) {
        const healthUseCase = new CheckHealthUseCase();
        const healthResult = healthUseCase.execute();

        try {
            // Integration test for B-US-02
            const adapter = new PokemonApiAdapter();
            const pokemonUseCase = new GetPokemonDetailsUseCase(adapter);
            const bulbasaur = await pokemonUseCase.execute(1);

            return reply.send({
                ...healthResult,
                pokemonApiIntegration: 'SUCCESS',
                data: bulbasaur
            });
        } catch (error: any) {
            return reply.send({
                ...healthResult,
                pokemonApiIntegration: 'FAILED',
                error: error.message
            });
        }
    }
}
