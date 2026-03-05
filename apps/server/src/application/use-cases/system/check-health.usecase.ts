export interface HealthStatus {
    status: string;
    timestamp: string;
}

export class CheckHealthUseCase {
    execute(): HealthStatus {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
}
