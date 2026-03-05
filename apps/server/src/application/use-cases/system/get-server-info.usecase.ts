import fs from 'fs';
import path from 'path';

export interface ServerInfo {
    serverName: string;
    packageName: string;
    version: string;
    region: string;
    status: string;
}

export class GetServerInfoUseCase {
    execute(): ServerInfo {
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        let packageName = 'pokemon-stadium-lite-server';
        let version = '1.0.0';

        if (fs.existsSync(packageJsonPath)) {
            const pkgStr = fs.readFileSync(packageJsonPath, 'utf-8');
            const pkg = JSON.parse(pkgStr);
            if (pkg.name) packageName = pkg.name;
            if (pkg.version) version = pkg.version;
        }

        const serverName = process.env.SERVER_NAME || 'pokemon-stadium-lite-server-01';
        const region = process.env.REGION || 'local';

        return {
            serverName,
            packageName,
            version,
            region,
            status: 'online',
        };
    }
}
