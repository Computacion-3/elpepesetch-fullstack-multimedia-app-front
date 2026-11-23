import { NO_SESSION, SESSION_COOKIE, expect, test } from '../fixtures/test';

test.use({ storageState: NO_SESSION });

const PROTECTED_ROUTES = ['/', '/users', '/roles', '/permissions'];

/** JWT con la forma correcta pero firmado con nada: jwt-decode lo lee, el backend lo rechaza. */
function forgedJwt(expSecondsFromNow: number): string {
    const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const payload = { sub: '1', email: 'admin@example.com', jti: 'e2e-forged', iat: now, exp: now + expSecondsFromNow };
    return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.firma-invalida`;
}

test.describe('Protección de rutas (proxy + DAL)', () => {
    for (const route of PROTECTED_ROUTES) {
        test(`AC6: sin sesión ${route} redirige a /login`, async ({ page }) => {
            await page.goto(route);
            await expect(page).toHaveURL(/\/login$/);
            await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
        });
    }

    test('AC6: /login y /register son públicas', async ({ page }) => {
        await page.goto('/login');
        await expect(page).toHaveURL(/\/login$/);
        await page.goto('/register');
        await expect(page).toHaveURL(/\/register$/);
    });

    const badCookies = [
        { title: 'una cookie que no es un JWT', value: () => 'no-es-un-jwt' },
        { title: 'un JWT vencido', value: () => forgedJwt(-60) },
        { title: 'un JWT con firma falsa (lo detecta el backend, no el proxy)', value: () => forgedJwt(3600) },
    ];

    for (const { title, value } of badCookies) {
        test(`AC6: con ${title} las rutas protegidas redirigen a /login`, async ({ page, context, baseURL }) => {
            await context.addCookies([
                { name: SESSION_COOKIE, value: value(), url: baseURL!, httpOnly: true, sameSite: 'Lax' },
            ]);
            for (const route of ['/', '/users']) {
                await page.goto(route);
                await expect(page).toHaveURL(/\/login$/);
            }
        });
    }
});
