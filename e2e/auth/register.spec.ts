import type { Page } from '@playwright/test';
import {
    NO_SESSION,
    alertWithText,
    expect,
    loginViaUi,
    sessionCookie,
    test,
    waitForHydration,
} from '../fixtures/test';
import { ACCOUNTS, MESSAGES, newUserData } from '../fixtures/test-data';

test.use({ storageState: NO_SESSION });

type RegisterInput = { username: string; email: string; password: string; fullName?: string };

async function fillRegister(page: Page, data: RegisterInput) {
    await page.goto('/register');
    await waitForHydration(page);
    await page.getByLabel('Usuario', { exact: true }).fill(data.username);
    if (data.fullName) await page.getByLabel('Nombre completo (opcional)').fill(data.fullName);
    await page.getByLabel('Correo electrónico').fill(data.email);
    await page.getByLabel('Contraseña').fill(data.password);
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
}

test.describe('Registro (/register)', () => {
    const created: string[] = [];

    test.afterAll(async ({ api }) => {
        for (const username of created) {
            const user = await api.findUser(username);
            if (user) await api.deleteUser(user.id);
        }
    });

    test('AC3: crea la cuenta con rol USER, redirige a /login con aviso y permite iniciar sesión', async ({
        page,
        context,
        api,
    }) => {
        const data = newUserData('reg');
        created.push(data.username);

        await fillRegister(page, data);

        await expect(page).toHaveURL(/\/login\?registered=1$/);
        await expect(page.getByRole('status').filter({ hasText: MESSAGES.registered })).toBeVisible();
        expect(await sessionCookie(context), 'el registro no abre sesión').toBeUndefined();

        const stored = await api.findUser(data.username);
        expect(stored?.email).toBe(data.email);
        expect(stored?.role.name).toBe('USER');
        expect(stored?.isActive).toBe(true);

        await loginViaUi(page, data);
        await expect(page.getByRole('heading', { name: `Hola, ${data.fullName}` })).toBeVisible();
        await expect(page.getByText('USER', { exact: true })).toBeVisible();
    });

    const invalidCases: { title: string; patch: Partial<RegisterInput>; message: string }[] = [
        { title: 'contraseña corta', patch: { password: 'Ab1' }, message: MESSAGES.passwordTooShort },
        { title: 'contraseña sin mayúscula ni número', patch: { password: 'solominusculas' }, message: MESSAGES.passwordWeak },
        { title: 'usuario con espacios', patch: { username: 'con espacios' }, message: MESSAGES.usernameChars },
    ];

    for (const { title, patch, message } of invalidCases) {
        test(`AC3: valida en el dominio (${title}) y no crea la cuenta`, async ({ page, api }) => {
            const data = { ...newUserData('bad'), ...patch };
            await fillRegister(page, data);

            await expect(alertWithText(page, message)).toBeVisible();
            await expect(page).toHaveURL(/\/register$/);
            expect(await api.findUser(data.username)).toBeUndefined();
        });
    }

    test('AC3: un correo ya registrado muestra el conflicto 409 del backend', async ({ page }) => {
        await fillRegister(page, { ...newUserData('dup'), email: ACCOUNTS.user.email });

        await expect(alertWithText(page, MESSAGES.userConflict)).toBeVisible();
        await expect(page).toHaveURL(/\/register$/);
    });
});
