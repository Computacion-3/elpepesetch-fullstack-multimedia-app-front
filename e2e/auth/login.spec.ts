import {
    NO_SESSION,
    alertWithText,
    expect,
    loginViaUi,
    reduxState,
    sessionCookie,
    storeIsExposed,
    test,
    waitForHydration,
} from '../fixtures/test';
import { ACCOUNTS, MESSAGES } from '../fixtures/test-data';

test.use({ storageState: NO_SESSION });

test.describe('Login (/login)', () => {
    test('AC1: con credenciales válidas abre sesión, guarda la cookie httpOnly y redirige a /', async ({
        page,
        context,
    }) => {
        await loginViaUi(page, ACCOUNTS.user);

        await expect(page.getByRole('heading', { name: `Hola, ${ACCOUNTS.user.fullName}` })).toBeVisible();
        await expect(page.getByText(ACCOUNTS.user.role, { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();

        const cookie = await sessionCookie(context);
        expect(cookie, 'debe existir la cookie de sesión').toBeDefined();
        expect(cookie!.httpOnly).toBe(true);
        expect(cookie!.sameSite).toBe('Lax');
        expect(cookie!.path).toBe('/');
        expect(cookie!.expires * 1000).toBeGreaterThan(Date.now());
    });

    test('AC5: el token nunca llega a JavaScript (ni document.cookie ni storage)', async ({ page, context }) => {
        await loginViaUi(page, ACCOUNTS.user);
        const token = (await sessionCookie(context))!.value;

        const visibleToJs = await page.evaluate(() => ({
            cookie: document.cookie,
            local: JSON.stringify({ ...localStorage }),
            session: JSON.stringify({ ...sessionStorage }),
        }));
        expect(visibleToJs.cookie).not.toContain('session=');
        expect(visibleToJs.local).not.toContain(token);
        expect(visibleToJs.session).not.toContain(token);
    });

    test('AC5: tras recargar la página la sesión sigue y Redux se hidrata con usuario y permisos', async ({
        page,
        context,
    }) => {
        await loginViaUi(page, ACCOUNTS.user);
        const token = (await sessionCookie(context))!.value;
        await page.reload();

        await expect(page.getByRole('heading', { name: `Hola, ${ACCOUNTS.user.fullName}` })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();

        test.skip(!(await storeIsExposed(page)), 'El front no se levantó con NEXT_PUBLIC_E2E=true');
        await expect.poll(async () => (await reduxState(page)).auth.user?.email).toBe(ACCOUNTS.user.email);
        const { auth } = await reduxState(page);
        expect(auth.user!.role).toBe(ACCOUNTS.user.role);
        expect(auth.user!.permissions.length).toBeGreaterThan(0);
        expect(JSON.stringify(auth)).not.toContain(token);
    });

    test('AC2: con contraseña incorrecta muestra el error del backend y no crea la cookie', async ({
        page,
        context,
    }) => {
        await page.goto('/login');
        await waitForHydration(page);
        await page.getByLabel('Correo electrónico').fill(ACCOUNTS.user.email);
        await page.getByLabel('Contraseña').fill('Incorrecta123');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();

        await expect(alertWithText(page, MESSAGES.invalidCredentials)).toBeVisible();
        await expect(page).toHaveURL(/\/login$/);
        expect(await sessionCookie(context)).toBeUndefined();
    });

    test('AC2: con un correo que no existe muestra el mismo error (no revela qué cuentas existen)', async ({
        page,
        context,
    }) => {
        await page.goto('/login');
        await waitForHydration(page);
        await page.getByLabel('Correo electrónico').fill('nadie-e2e@example.com');
        await page.getByLabel('Contraseña').fill('Cualquiera123');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();

        await expect(alertWithText(page, MESSAGES.invalidCredentials)).toBeVisible();
        expect(await sessionCookie(context)).toBeUndefined();
    });

    test('el enlace "Regístrate" lleva a /register', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('link', { name: /Regístrate/ }).click();
        await expect(page).toHaveURL(/\/register$/);
        await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible();
    });
});
