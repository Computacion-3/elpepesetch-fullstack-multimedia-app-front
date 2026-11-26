import type { Page } from '@playwright/test';
import type { ApiUser } from '../fixtures/api';
import {
    NO_SESSION,
    alertWithText,
    expect,
    loginViaUi,
    reduxState,
    sessionCookie,
    storeIsExposed,
    test,
} from '../fixtures/test';
import { newUserData } from '../fixtures/test-data';

test.use({ storageState: NO_SESSION });

declare global {
    interface Window {
        __e2eNoReload?: boolean;
    }
}

/** Snapshot de los slices expuestos solo en modo E2E. */
async function realtimeSlice(page: Page) {
    return (await reduxState(page)).realtime;
}

/** Marca la ventana; si la página se recarga, la marca desaparece. */
async function markWindow(page: Page): Promise<void> {
    await page.evaluate(() => {
        window.__e2eNoReload = true;
    });
}

async function windowStillMarked(page: Page): Promise<boolean> {
    return page.evaluate(() => window.__e2eNoReload === true);
}

/** Estado del indicador que se muestra en el menú de usuario. */
function realtimeStatus(page: Page, label: string) {
    return page.getByRole('status').filter({ hasText: label });
}

test.describe('Tiempo real (Socket.IO)', () => {
    let target: ApiUser;
    let password: string;

    test.beforeEach(async ({ api, page }) => {
        const data = newUserData('rt');
        password = data.password;
        target = await api.createUser({ ...data, roleId: await api.roleId('USER') });

        await loginViaUi(page, { email: target.email, password });
        await expect(realtimeStatus(page, 'En línea')).toBeVisible({ timeout: 30_000 });
    });

    test.afterEach(async ({ api }) => {
        const still = await api.findUser(target.username);
        if (still) await api.deleteUser(still.id);
    });

    test('se conecta con el ticket y se desconecta al cerrar sesión', async ({ page, context }) => {
        expect(await page.evaluate(() => document.cookie)).not.toContain('session=');

        if (await storeIsExposed(page)) {
            expect((await realtimeSlice(page))?.status).toBe('connected');
        }

        await page.getByRole('button', { name: 'Cerrar sesión' }).click();
        await expect(page).toHaveURL(/\/login/);
        expect(await sessionCookie(context)).toBeUndefined();
        if (await storeIsExposed(page)) {
            await expect.poll(async () => (await realtimeSlice(page))?.status).toBe('disconnected');
        }
    });

    test('un cambio de rol llega sin recargar la página', async ({ api, page }) => {
        await markWindow(page);
        await expect(page.getByRole('link', { name: /Notificaciones, 0 sin leer/ })).toBeVisible();

        await api.assignRole(target.id, await api.roleId('MODERATOR'));

        await expect(realtimeStatus(page, 'Tu rol cambió a MODERATOR.')).toBeVisible();
        await expect(page.getByRole('link', { name: /Notificaciones, 1 sin leer/ })).toBeVisible();
        const userMenu = page.getByRole('button', { name: 'Cerrar sesión' }).locator('xpath=..');
        await expect(userMenu.getByText('MODERATOR', { exact: true })).toBeVisible();
        expect(await windowStillMarked(page)).toBe(true);

        if (await storeIsExposed(page)) {
            const state = await reduxState(page);
            expect(state.auth.user?.role).toBe('MODERATOR');
            expect(state.realtime?.events.map((event) => event.event)).toContain('account.updated');
        }
    });

    test('desactivar la cuenta cierra la sesión abierta al instante', async ({
        api,
        page,
        context,
    }) => {
        await api.setUserStatus(target.id, false);

        await expect(page).toHaveURL(/\/login\?reason=account-deactivated$/);
        await expect(alertWithText(page, 'Tu cuenta fue desactivada')).toBeVisible();
        expect(await sessionCookie(context)).toBeUndefined();

        if (await storeIsExposed(page)) {
            const state = await reduxState(page);
            expect(state.auth.user).toBeNull();
            await expect.poll(async () => (await realtimeSlice(page))?.status).toBe('disconnected');
        }

        await page.goto('/');
        await expect(page).toHaveURL(/\/login/);
    });
});
