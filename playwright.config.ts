import { defineConfig, devices } from '@playwright/test';

/**
 * E2E con Playwright contra el backend NestJS real (con el seed de db/seed.sql).
 *
 * Variables (todas opcionales):
 * - E2E_DATA_SOURCE=rest|graphql  fuente de datos del front que se levanta (por defecto rest).
 * - E2E_API_URL                   URL del backend; si falta se usa API_URL de .env.local o http://localhost:3002.
 * - E2E_BASE_URL                  probar un front ya desplegado (por ejemplo Vercel); no se levanta servidor.
 *
 * Cada fuente usa su propio puerto (rest 3100, graphql 3101) para no reutilizar por error un
 * servidor arrancado con la otra fuente.
 */
try {
    process.loadEnvFile('.env.local');
} catch {
    // .env.local es opcional
}

const dataSource = process.env.E2E_DATA_SOURCE === 'graphql' ? 'graphql' : 'rest';
const port = dataSource === 'graphql' ? 3101 : 3100;
const apiUrl = process.env.E2E_API_URL ?? process.env.API_URL ?? 'http://localhost:3002';
const externalBaseUrl = process.env.E2E_BASE_URL;

// Lo leen los helpers de e2e/fixtures (el proceso de cada worker hereda este entorno).
process.env.E2E_API_URL = apiUrl;
process.env.E2E_DATA_SOURCE = dataSource;

export default defineConfig({
    testDir: './e2e',
    outputDir: './test-results',
    timeout: 60_000,
    expect: { timeout: 15_000 },
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    // next dev compila cada ruta la primera vez: pocos workers evitan timeouts en equipos lentos.
    workers: process.env.CI ? 1 : 2,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: externalBaseUrl ?? `http://localhost:${port}`,
        locale: 'es-CO',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        navigationTimeout: 30_000,
    },
    projects: [
        { name: 'setup', testMatch: /auth\.setup\.ts/, teardown: 'cleanup' },
        { name: 'cleanup', testMatch: /global\.teardown\.ts/ },
        {
            name: `chromium-${dataSource}`,
            use: { ...devices['Desktop Chrome'] },
            dependencies: ['setup'],
            testIgnore: [/auth\.setup\.ts/, /global\.teardown\.ts/],
        },
    ],
    webServer: externalBaseUrl
        ? undefined
        : {
              command: `npm run dev -- --port ${port}`,
              url: `http://localhost:${port}/login`,
              timeout: 180_000,
              reuseExistingServer: !process.env.CI,
              stdout: 'ignore',
              stderr: 'pipe',
              env: {
                  API_URL: apiUrl,
                  NEXT_PUBLIC_DATA_SOURCE: dataSource,
                  // Expone el store de Redux en window.__APP_STORE__ para comprobar su estado.
                  NEXT_PUBLIC_E2E: 'true',
              },
          },
});
