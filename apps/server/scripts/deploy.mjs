import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(serverDir, '../..'); // Root of the monorepo
const packageJsonPath = path.join(serverDir, 'package.json');

function log(message) {
    console.log(`[DEPLOY] ${message}`);
}

function errorLog(message) {
    console.error(`[ERROR] ${message}`);
}

async function runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
        const processStr = `${command} ${args.join(' ')}`;
        log(`Executing: ${processStr}`);

        const childProcess = spawn(process.platform === 'win32' && command === 'npm' ? 'npm.cmd' : command, args, {
            cwd,
            shell: true,
            stdio: 'inherit'
        });

        childProcess.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Command failed with exit code ${code}: ${processStr}`));
        });

        childProcess.on('error', (err) => {
            reject(new Error(`Failed to start process: ${err.message}`));
        });
    });
}

async function deploy() {
    try {
        log('Starting Cloud Run deployment process...');

        if (!fs.existsSync(packageJsonPath)) {
            throw new Error('package.json not found in the server directory.');
        }

        const projectId = 'pokemon-sbx';
        const region = 'us-central1';
        const repoName = 'pokemon-repo';
        const serviceName = 'pokemon-server-api';
        const imageTag = `${region}-docker.pkg.dev/${projectId}/${repoName}/pokemon-server`;

        log(`Target Project: ${projectId}`);
        log(`Target Service: ${serviceName}`);

        log('Compiling TypeScript...');
        await runCommand('npm', ['run', 'compile'], serverDir);
        log('Build successful.');

        log('Step 1: Building and pushing Docker image via Cloud Build...');
        // We run this from rootDir because Dockerfile needs monorepo context
        // and we use the cloudbuild.yaml we created earlier.
        await runCommand('gcloud', [
            'builds', 'submit',
            '--config', 'cloudbuild.yaml',
            '.',
            `--project=${projectId}`
        ], rootDir);

        log('Step 2: Parsing env_variables.yaml...');
        let envVarsFlag = '';
        const envVarsPath = path.join(serverDir, 'env_variables.yaml');
        if (fs.existsSync(envVarsPath)) {
            const lines = fs.readFileSync(envVarsPath, 'utf8').split('\n');
            const parsedVars = [];
            for (const line of lines) {
                // Match keys inside env_variables block like:
                //   KEY: "value"
                const match = line.match(/^\s+([A-Z_a-z0-9]+):\s*"(.*)"\s*$/);
                if (match) {
                    parsedVars.push(`${match[1]}=${match[2]}`);
                }
            }
            if (parsedVars.length > 0) {
                envVarsFlag = `--set-env-vars=^;^${parsedVars.join(';')}`; // Using ; as delimiter because URLs contain commas
                log(`Found ${parsedVars.length} environment variables to inject.`);
            }
        } else {
            log('No env_variables.yaml found, proceeding without environment variables.');
        }

        log('Step 3: Deploying to Cloud Run...');
        const deployArgs = [
            'run', 'deploy', serviceName,
            `--image=${imageTag}`,
            '--platform=managed',
            `--region=${region}`,
            '--allow-unauthenticated',
            '--port=8080',
            '--session-affinity', // Crucial for WebSockets
            `--project=${projectId}`,
            '--quiet'
        ];

        if (envVarsFlag) {
            deployArgs.push(envVarsFlag);
        }

        await runCommand('gcloud', deployArgs, serverDir);

        log('===================================================');
        log('✅ Deployment to Cloud Run completed successfully!');
        log('===================================================');

    } catch (error) {
        errorLog(`Deployment script aborted due to an error.`);
        errorLog(error.message);
        process.exit(1);
    }
}

deploy();
