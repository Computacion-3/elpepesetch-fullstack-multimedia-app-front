// Ejecuta Playwright con una fuente de datos concreta, igual en Windows, macOS y Linux.
// Uso: node e2e/run.mjs <rest|graphql> [argumentos de playwright test]
import { spawn } from 'node:child_process';

const [mode = 'rest', ...args] = process.argv.slice(2);
if (mode !== 'rest' && mode !== 'graphql') {
    console.error(`Fuente desconocida "${mode}". Usa rest o graphql.`);
    process.exit(1);
}

const child = spawn('npx', ['playwright', 'test', ...args], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, E2E_DATA_SOURCE: mode },
});
child.on('exit', (code) => process.exit(code ?? 1));
