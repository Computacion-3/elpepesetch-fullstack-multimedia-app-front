import type { Page } from '@playwright/test';
import type { ApiUser } from '../fixtures/api';
import {
    NO_SESSION,
    alertWithText,
    expect,
    loginViaUi,
    logoutViaUi,
    statusWithText,
    test,
} from '../fixtures/test';
import { ACCOUNTS, MESSAGES, newUserData, uid } from '../fixtures/test-data';

test.use({ storageState: NO_SESSION });

/**
 * Campo del formulario de perfil. Se busca por rol (no con getByLabel) porque Next deja montada,
 * oculta, la página de /login de la que se viene, y su campo "Correo electrónico" también coincide.
 */
function field(page: Page, name: string) {
    return page.getByRole('textbox', { name, exact: true });
}

/** Entra al perfil desde el menú de usuario (avatar) de la barra superior. */
async function openProfile(page: Page) {
    await page.getByRole('link', { name: /^Mi perfil:/ }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole('heading', { name: 'Mi perfil', exact: true })).toBeVisible();
}

test.describe('Perfil propio (/profile)', () => {
    let target: ApiUser;
    let password: string;

    test.beforeEach(async ({ api, page }) => {
        const data = newUserData('pf');
        password = data.password;
        target = await api.createUser({ ...data, roleId: await api.roleId('USER') });
        await loginViaUi(page, { email: target.email, password });
    });

    test.afterEach(async ({ api }) => {
        const still = await api.findUser(target.username);
        if (still) await api.deleteUser(still.id);
    });

    test('muestra la cuenta y guarda nombre y biografía (PATCH /users/me)', async ({ api, page }) => {
        await openProfile(page);
        await expect(page.getByText(`@${target.username}`)).toBeVisible();
        await expect(field(page, 'Correo electrónico')).toHaveValue(target.email);

        const saveButton = page.getByRole('button', { name: 'Guardar cambios' });
        await expect(saveButton).toBeDisabled();

        const newName = `E2E Nombre ${uid()}`;
        await field(page, 'Nombre completo').fill(newName);
        await field(page, 'Biografía').fill('Juego roguelikes y leo ciencia ficción.');
        await saveButton.click();

        await expect(statusWithText(page, 'Perfil actualizado.')).toBeVisible();
        // El menú de usuario se actualiza sin recargar (el store recibe el usuario nuevo).
        await expect(page.getByRole('link', { name: `Mi perfil: ${newName}` })).toBeVisible();
        await expect.poll(async () => (await api.findUser(target.username))?.fullName).toBe(newName);
    });

    test('valida la confirmación y cambia la contraseña', async ({ page }) => {
        await openProfile(page);
        await page.getByLabel('Nueva contraseña', { exact: true }).fill('NuevaPassw0rd');
        await page.getByLabel('Confirmar contraseña', { exact: true }).fill('OtraPassw0rd');
        await page.getByRole('button', { name: 'Guardar cambios' }).click();
        await expect(alertWithText(page, 'Las contraseñas no coinciden')).toBeVisible();

        await page.getByLabel('Confirmar contraseña', { exact: true }).fill('NuevaPassw0rd');
        await page.getByRole('button', { name: 'Guardar cambios' }).click();
        await expect(statusWithText(page, 'Perfil actualizado.')).toBeVisible();

        await logoutViaUi(page);
        await loginViaUi(page, { email: target.email, password: 'NuevaPassw0rd' });
    });

    test('un correo de otra cuenta muestra el conflicto 409 y no cambia nada', async ({ api, page }) => {
        await openProfile(page);
        await field(page, 'Correo electrónico').fill(ACCOUNTS.admin.email);
        await page.getByRole('button', { name: 'Guardar cambios' }).click();

        await expect(alertWithText(page, MESSAGES.userConflict)).toBeVisible();
        expect((await api.findUser(target.username))?.email).toBe(target.email);
    });
});
