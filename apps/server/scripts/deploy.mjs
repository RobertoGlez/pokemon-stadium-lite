import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(serverDir, 'package.json');

function log(message) {
    console.log(`[DEPLOY] ${message}`);
}

function errorLog(message) {
    console.error(`[ERROR] ${message}`);
}

async function deploy() {
    try {
        log('Starting deployment process...');

        if (!fs.existsSync(packageJsonPath)) {
            throw new Error('package.json not found in the server directory.');
        }

        const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const rawVersion = packageData.version || '1.0.0';

        // Google Cloud App Engine versions cannot contain dots. 
        // e.g., 1.0.0 becomes 1-0-0
        const parsedVersion = rawVersion.replace(/\./g, '-');
        const projectId = 'pokemon-sbx';

        log(`Target Project: ${projectId}`);
        log(`Target Version: ${parsedVersion} (from package.json v${rawVersion})`);

        log('Compiling TypeScript...');
        const buildProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'compile'], {
            cwd: serverDir,
            stdio: 'inherit',
            shell: true
        });

        await new Promise((resolve, reject) => {
            buildProcess.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Build failed with exit code ${code}`));
            });
            buildProcess.on('error', reject);
        });
        log('Build successful. Proceeding to upload...');

        const deployArgs = [
            'app',
            'deploy',
            'app.yaml',
            `--project=${projectId}`,
            `--version=${parsedVersion}`,
            '--quiet' // Skips interactive prompts
        ];

        log('Executing gcloud command...');
        log(`Command: gcloud ${deployArgs.join(' ')}`);

        const gcloudProcess = spawn('gcloud', deployArgs, {
            cwd: serverDir,
            shell: true,
            stdio: 'inherit' // Pipes output directly to the terminal
        });

        gcloudProcess.on('close', (code) => {
            if (code === 0) {
                log('Deployment completed successfully.');
            } else {
                errorLog(`Deployment failed with exit code ${code}.`);
                process.exit(code);
            }
        });

        gcloudProcess.on('error', (err) => {
            errorLog(`Failed to start gcloud process. Is Google Cloud SDK installed and in PATH?`);
            errorLog(`Details: ${err.message}`);
            process.exit(1);
        });

    } catch (error) {
        errorLog(`Deployment script aborted due to an error.`);
        errorLog(error.message);
        process.exit(1);
    }
}

deploy();
