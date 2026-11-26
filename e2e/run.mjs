// Ejecuta Playwright con una fuente de datos concreta, igual en Windows, macOS y Linux.
// Uso: node e2e/run.mjs <rest|graphql> [argumentos de playwright test]
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const [mode = 'rest', ...args] = process.argv.slice(2);
if (mode !== 'rest' && mode !== 'graphql') {
    console.error(`Fuente desconocida "${mode}". Usa rest o graphql.`);
    process.exit(1);
}

const playwrightCli = fileURLToPath(new URL('../node_modules/@playwright/test/cli.js', import.meta.url));
const child = spawn(process.execPath, [playwrightCli, 'test', ...args], {
    stdio: 'inherit',
    env: { ...process.env, E2E_DATA_SOURCE: mode },
});
child.on('exit', (code) => process.exit(code ?? 1));
