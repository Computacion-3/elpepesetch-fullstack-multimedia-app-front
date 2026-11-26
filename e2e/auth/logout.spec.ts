import { authMeStatus } from '../fixtures/api';
import {
    NO_SESSION,
    SESSION_COOKIE,
    expect,
    loginViaUi,
    logoutViaUi,
    reduxState,
    sessionCookie,
    storeIsExposed,
    test,
} from '../fixtures/test';
import { ACCOUNTS } from '../fixtures/test-data';

// Cada prueba inicia su propia sesión: el logout revoca el token y no puede usar las de auth.setup.ts.
test.use({ storageState: NO_SESSION });

test.describe('Logout', () => {
    test('AC4: borra la cookie, redirige a /login y las rutas protegidas vuelven a pedir sesión', async ({
        page,
        context,
    }) => {
        await loginViaUi(page, ACCOUNTS.user);
        await logoutViaUi(page);

        expect(await sessionCookie(context)).toBeUndefined();
        await page.goto('/');
        await expect(page).toHaveURL(/\/login$/);
    });

    test('AC4: el backend revoca el token (reutilizar la cookie anterior no devuelve la sesión)', async ({
        page,
        context,
    }) => {
        await loginViaUi(page, ACCOUNTS.user);
        const oldCookie = (await sessionCookie(context))!;
        expect(await authMeStatus(oldCookie.value)).toBe(200);

        await logoutViaUi(page);

        expect(await authMeStatus(oldCookie.value), 'GET /auth/me con el token revocado').toBe(401);
        // Volver a poner la cookie vieja (el JWT aún no expira, así que el proxy la deja pasar):
        // el servidor consulta al backend, este rechaza el token y la página redirige a /login.
        await context.addCookies([{ ...oldCookie, name: SESSION_COOKIE }]);
        await page.goto('/');
        await expect(page).toHaveURL(/\/login$/);
    });

    test('AC4 / AC11: resetea todo el store de Redux (auth, users, roles y permissions)', async ({ page }) => {
        await loginViaUi(page, ACCOUNTS.admin);
        test.skip(!(await storeIsExposed(page)), 'El front no se levantó con NEXT_PUBLIC_E2E=true');

        // Llenar los slices de administración navegando por la interfaz (navegación de cliente: mismo store).
        await page
            .getByRole('navigation', { name: 'Administración', exact: true })
            .getByRole('link', { name: 'Usuarios' })
            .click();
        await expect(page.getByRole('cell', { name: ACCOUNTS.admin.email })).toBeVisible();
        await page
            .getByRole('navigation', { name: 'Administración', exact: true })
            .getByRole('link', { name: 'Roles' })
            .click();
        await expect(page.getByRole('cell', { name: 'ADMIN', exact: true })).toBeVisible();

        const before = await reduxState(page);
        expect(before.auth.user?.email).toBe(ACCOUNTS.admin.email);
        expect(before.users.items.length).toBeGreaterThan(0);
        expect(before.roles.items.length).toBeGreaterThan(0);

        await logoutViaUi(page);

        const after = await reduxState(page);
        expect(after.auth.user).toBeNull();
        expect(after.users.items).toEqual([]);
        expect(after.roles.items).toEqual([]);
        expect(after.roles.selected).toBeNull();
        expect(after.permissions.items).toEqual([]);
    });

    test('AC4: otro usuario que entra después no ve nada del anterior', async ({ page }) => {
        await loginViaUi(page, ACCOUNTS.admin);
        await expect(
            page.getByRole('navigation', { name: 'Administración', exact: true }),
        ).toBeVisible();
        await logoutViaUi(page);

        await loginViaUi(page, ACCOUNTS.user);
        await expect(page.getByRole('heading', { name: `Hola, ${ACCOUNTS.user.fullName}` })).toBeVisible();
        await expect(page.getByText(ACCOUNTS.admin.fullName)).toHaveCount(0);
        await expect(
            page.getByRole('navigation', { name: 'Administración', exact: true }),
        ).toHaveCount(0);
    });
});
