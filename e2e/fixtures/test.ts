import { test as base, expect, type BrowserContext, type Page } from '@playwright/test';
import { AdminApi } from './api';
import { type Account } from './test-data';

/**
 * `test` del proyecto: el de Playwright más `api`, un cliente del backend autenticado como admin
 * (uno por worker) para preparar y limpiar datos.
 */
export const test = base.extend<Record<never, never>, { api: AdminApi }>({
    api: [
        // Playwright exige un patrón de destructuración como primer parámetro.
        // eslint-disable-next-line no-empty-pattern
        async ({}, provide) => {
            const api = await AdminApi.create();
            await provide(api);
            await api.dispose();
        },
        { scope: 'worker' },
    ],
});

export { expect };

/** Sin cookies ni storage: para las pruebas que deben empezar sin sesión. */
export const NO_SESSION = { cookies: [], origins: [] };

export const SESSION_COOKIE = 'session';

/**
 * Espera a que React hidrate el elemento. Si se escribe en un input controlado antes de la
 * hidratación, React lo vacía al hidratar y el formulario se envía vacío.
 */
export async function waitForHydration(page: Page, selector = 'form'): Promise<void> {
    await page.waitForFunction(
        (sel) => {
            const el = document.querySelector(sel);
            return !!el && Object.keys(el).some((key) => key.startsWith('__reactFiber$'));
        },
        selector,
    );
}

/** Inicia sesión por la interfaz de /login y espera la página de inicio. */
export async function loginViaUi(page: Page, account: Account): Promise<void> {
    await page.goto('/login');
    await waitForHydration(page);
    await page.getByLabel('Correo electrónico').fill(account.email);
    await page.getByLabel('Contraseña').fill(account.password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: /^Hola, / })).toBeVisible();
}

/** Cierra sesión con el botón del menú de usuario. */
export async function logoutViaUi(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL(/\/login$/);
}

/**
 * Busca un aviso role="alert" por su texto. Se filtra por texto porque Next también monta un
 * anunciador de rutas con role="alert".
 */
export function alertWithText(page: Page, text: string | RegExp) {
    return page.getByRole('alert').filter({ hasText: text });
}

/** Busca un aviso de éxito role="status" por su texto (Alert con variant="success"). */
export function statusWithText(page: Page, text: string | RegExp) {
    return page.getByRole('status').filter({ hasText: text });
}

export async function sessionCookie(context: BrowserContext) {
    return (await context.cookies()).find((c) => c.name === SESSION_COOKIE);
}

type ReduxSnapshot = {
    auth: { user: { id: number; email: string; role: string; permissions: string[]; displayName: string } | null };
    users: { items: unknown[] };
    roles: { items: unknown[]; selected: unknown };
    permissions: { items: unknown[] };
    reviews?: { items: unknown[]; selectedMediaId: string };
    reports?: { items: unknown[] };
    stats?: { personal: unknown; global: unknown };
};

/** true si el front se levantó con NEXT_PUBLIC_E2E=true (expone window.__APP_STORE__). */
export async function storeIsExposed(page: Page): Promise<boolean> {
    return page.evaluate(() => '__APP_STORE__' in window);
}

/** Estado actual del store de Redux (solo con NEXT_PUBLIC_E2E=true). */
export async function reduxState(page: Page): Promise<ReduxSnapshot> {
    return page.evaluate(() => {
        const store = (window as unknown as { __APP_STORE__?: { getState(): unknown } }).__APP_STORE__;
        if (!store) throw new Error('window.__APP_STORE__ no existe: levanta el front con NEXT_PUBLIC_E2E=true');
        return JSON.parse(JSON.stringify(store.getState())) as ReduxSnapshot;
    });
}
