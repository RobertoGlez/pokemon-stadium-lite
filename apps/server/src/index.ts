import * as dotenv from 'dotenv';
import path from 'path';
import { buildServer } from './infrastructure/http/server';
import { connectDatabase } from './infrastructure/database/mongoose.config';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';

const start = async () => {
    try {
        await connectDatabase();
        const app = await buildServer();
        await app.listen({ port: PORT, host: HOST });
        app.log.info(`Server listening at http://${HOST}:${PORT}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
