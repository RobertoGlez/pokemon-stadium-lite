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

        log('Step 2: Preparing declarative service configuration (service.yaml)...');
        const serviceYamlPath = path.join(serverDir, 'service.yaml');
        if (!fs.existsSync(serviceYamlPath)) {
            throw new Error('service.yaml not found.');
        }
        let serviceYamlContent = fs.readFileSync(serviceYamlPath, 'utf8');

        // Parse env_variables.yaml and inject into service.yaml
        const envVarsPath = path.join(serverDir, 'env_variables.yaml');
        let envYamlBlock = '';

        if (fs.existsSync(envVarsPath)) {
            const lines = fs.readFileSync(envVarsPath, 'utf8').split('\n');
            const parsedVars = [];
            for (const line of lines) {
                const match = line.match(/^\s+([A-Z_a-z0-9]+):\s*"(.*)"\s*$/);
                if (match) {
                    parsedVars.push({ key: match[1], value: match[2] });
                }
            }
            if (parsedVars.length > 0) {
                envYamlBlock = '          env:\n' + parsedVars.map(v => 
                    `            - name: ${v.key}\n              value: ${v.value.includes(':') ? '"' + v.value + '"' : v.value}`
                ).join('\n');
                log(`Found ${parsedVars.length} environment variables to inject from env_variables.yaml.`);
            }
        } else {
            log('No env_variables.yaml found, proceeding without extra environment variables.');
        }

        // Replace the placeholder in service.yaml
        if (envYamlBlock) {
            serviceYamlContent = serviceYamlContent.replace(/^\s*# ENV_VARIABLES_INJECTION_POINT\s*$/m, envYamlBlock);
        } else {
            serviceYamlContent = serviceYamlContent.replace(/^\s*# ENV_VARIABLES_INJECTION_POINT\s*$/m, '');
        }

        const tempServiceYamlPath = path.join(serverDir, 'service.deploy.yaml');
        fs.writeFileSync(tempServiceYamlPath, serviceYamlContent);

        log('Step 3: Deploying using gcloud run services replace...');
        const replaceArgs = [
            'run', 'services', 'replace', tempServiceYamlPath,
            `--region=${region}`,
            `--project=${projectId}`,
            '--quiet'
        ];

        await runCommand('gcloud', replaceArgs, serverDir);

        // Required to ensure public access is maintained since "replace" doesn't touch IAM setup manually
        log('Step 4: Ensuring service is public (--allow-unauthenticated equivalent)...');
        await runCommand('gcloud', [
            'run', 'services', 'add-iam-policy-binding', serviceName,
            '--member=allUsers',
            '--role=roles/run.invoker',
            `--region=${region}`,
            `--project=${projectId}`,
            '--quiet'
        ], serverDir);

        // Cleanup
        fs.unlinkSync(tempServiceYamlPath);

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
