import type { Page } from '@playwright/test';
import type { ApiUser } from '../fixtures/api';
import { NO_SESSION, alertWithText, expect, test, waitForHydration } from '../fixtures/test';
import { ACCOUNTS, MESSAGES, PREFIX, TEST_PASSWORD, newUserData, storageStatePath, uid } from '../fixtures/test-data';

test.use({ storageState: storageStatePath('admin') });

/** Abre /users y espera a que la tabla cargue (lo que implica que React ya hidrató). */
async function openUsers(page: Page) {
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: 'Usuarios', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: ACCOUNTS.admin.email })).toBeVisible();
}

async function search(page: Page, q: string) {
    await page.getByLabel('Buscar').fill(q);
    await page.getByRole('button', { name: 'Buscar' }).click();
}

function rowOf(page: Page, username: string) {
    return page.getByRole('row').filter({ has: page.getByText(username, { exact: true }) });
}

function userDialog(page: Page, title: 'Nuevo usuario' | 'Editar usuario') {
    return page.getByRole('dialog', { name: title });
}

test.describe('Administración de usuarios (/users)', () => {
    // Un usuario temporal por prueba, creado por API para que cada prueba sea independiente.
    let target: ApiUser;

    test.beforeEach(async ({ api }) => {
        const data = newUserData('t');
        target = await api.createUser({ ...data, roleId: await api.roleId('USER') });
    });

    test.afterEach(async ({ api }) => {
        const still = await api.findUser(target.username);
        if (still) await api.deleteUser(still.id);
    });

    test('AC2: lista usuario, correo, rol y estado', async ({ page }) => {
        await openUsers(page);
        for (const header of ['Usuario', 'Correo', 'Rol', 'Estado', 'Acciones']) {
            await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
        }
        await search(page, target.username);

        const row = rowOf(page, target.username);
        await expect(row).toHaveCount(1);
        await expect(row.getByRole('cell', { name: target.email })).toBeVisible();
        await expect(row.getByRole('combobox', { name: `Rol de ${target.username}` })).toHaveValue(String(target.role.id));
        await expect(row.getByRole('cell', { name: 'Activo', exact: true })).toBeVisible();
    });

    test('AC3: crear usuario valida en el dominio, muestra el 409 y al final lo crea', async ({ page, api }) => {
        const data = newUserData('new');
        await openUsers(page);
        await search(page, data.username);
        await expect(page.getByRole('cell', { name: 'No hay usuarios' })).toBeVisible();

        await page.getByRole('button', { name: 'Nuevo usuario' }).click();
        const dialog = userDialog(page, 'Nuevo usuario');
        await expect(dialog).toBeVisible();
        await dialog.getByLabel('Usuario', { exact: true }).fill(data.username);
        await dialog.getByLabel('Correo electrónico').fill(data.email);
        await dialog.getByLabel('Contraseña').fill(data.password);
        await dialog.getByLabel('Nombre completo').fill(data.fullName);

        // Sin rol → regla de dominio del front (no llega al backend).
        await dialog.getByRole('button', { name: 'Crear usuario' }).click();
        await expect(alertWithText(page, MESSAGES.roleRequired)).toBeVisible();

        // Correo de otra cuenta → 409 del backend, mostrado dentro del modal.
        await dialog.getByLabel('Rol').selectOption({ label: 'MODERATOR' });
        await dialog.getByLabel('Correo electrónico').fill(ACCOUNTS.user.email);
        await dialog.getByRole('button', { name: 'Crear usuario' }).click();
        await expect(dialog.getByRole('alert').filter({ hasText: MESSAGES.userConflict })).toBeVisible();

        await dialog.getByLabel('Correo electrónico').fill(data.email);
        await dialog.getByRole('button', { name: 'Crear usuario' }).click();
        await expect(dialog).toBeHidden();

        const row = rowOf(page, data.username);
        await expect(row).toHaveCount(1);
        await expect(row.getByText(data.fullName)).toBeVisible();

        const stored = await api.findUser(data.username);
        try {
            expect(stored?.role.name).toBe('MODERATOR');
        } finally {
            if (stored) await api.deleteUser(stored.id);
        }
    });

    test('AC4: editar usuario cambia nombre completo y contraseña (vacía = no se cambia)', async ({
        page,
        api,
        browser,
    }) => {
        const newName = `Editado ${uid()}`;
        const newPassword = 'Nuev4Clave';
        await openUsers(page);
        await search(page, target.username);

        await page.getByRole('button', { name: `Editar ${target.username}`, exact: true }).click();
        const dialog = userDialog(page, 'Editar usuario');
        await expect(dialog.getByLabel('Usuario', { exact: true })).toHaveValue(target.username);
        await expect(dialog.getByLabel('Correo electrónico')).toHaveValue(target.email);
        await dialog.getByLabel('Nombre completo').fill(newName);
        await dialog.getByLabel('Nueva contraseña (opcional)').fill(newPassword);
        await dialog.getByRole('button', { name: 'Guardar cambios' }).click();
        await expect(dialog).toBeHidden();

        await expect(rowOf(page, target.username).getByText(newName)).toBeVisible();
        expect((await api.findUser(target.username))?.fullName).toBe(newName);

        // La contraseña nueva sirve para iniciar sesión (en otro contexto, sin la cookie del admin).
        const other = await browser.newContext({ storageState: NO_SESSION });
        try {
            const p = await other.newPage();
            await p.goto('/login');
            await waitForHydration(p);
            await p.getByLabel('Correo electrónico').fill(target.email);
            await p.getByLabel('Contraseña').fill(newPassword);
            await p.getByRole('button', { name: 'Iniciar sesión' }).click();
            await expect(p.getByRole('heading', { name: `Hola, ${newName}` })).toBeVisible();
        } finally {
            await other.close();
        }
    });

    test('AC5: cambiar el rol desde la fila persiste en el backend', async ({ page, api }) => {
        await openUsers(page);
        await search(page, target.username);
        const roleSelect = rowOf(page, target.username).getByRole('combobox', { name: `Rol de ${target.username}` });

        await roleSelect.selectOption({ label: 'MODERATOR' });

        await expect.poll(async () => (await api.findUser(target.username))?.role.name).toBe('MODERATOR');
        await page.reload();
        await search(page, target.username);
        await expect(roleSelect).toHaveValue(String(await api.roleId('MODERATOR')));
    });

    test('AC5: desactivar impide iniciar sesión y activar lo revierte', async ({ page, api, browser }) => {
        await openUsers(page);
        await search(page, target.username);
        const row = rowOf(page, target.username);

        await row.getByRole('button', { name: `Desactivar ${target.username}`, exact: true }).click();
        await expect(row.getByRole('cell', { name: 'Inactivo', exact: true })).toBeVisible();
        expect((await api.findUser(target.username))?.isActive).toBe(false);

        const other = await browser.newContext({ storageState: NO_SESSION });
        try {
            const p = await other.newPage();
            await p.goto('/login');
            await waitForHydration(p);
            await p.getByLabel('Correo electrónico').fill(target.email);
            await p.getByLabel('Contraseña').fill(TEST_PASSWORD);
            await p.getByRole('button', { name: 'Iniciar sesión' }).click();
            await expect(alertWithText(p, MESSAGES.accountDisabled)).toBeVisible();
        } finally {
            await other.close();
        }

        await row.getByRole('button', { name: `Activar ${target.username}`, exact: true }).click();
        await expect(row.getByRole('cell', { name: 'Activo', exact: true })).toBeVisible();
        expect((await api.findUser(target.username))?.isActive).toBe(true);
    });

    test('AC5: en la fila propia Desactivar y Eliminar están deshabilitados', async ({ page }) => {
        await openUsers(page);
        await search(page, ACCOUNTS.admin.email);
        const row = rowOf(page, ACCOUNTS.admin.username);

        await expect(row.getByRole('button', { name: `Desactivar ${ACCOUNTS.admin.username}`, exact: true })).toBeDisabled();
        await expect(row.getByRole('button', { name: `Eliminar ${ACCOUNTS.admin.username}`, exact: true })).toBeDisabled();
        await expect(row.getByRole('button', { name: `Editar ${ACCOUNTS.admin.username}`, exact: true })).toBeEnabled();
    });

    test('AC6: eliminar pide confirmación; Cancelar no borra y Eliminar sí', async ({ page, api }) => {
        await openUsers(page);
        await search(page, target.username);
        const deleteButton = page.getByRole('button', { name: `Eliminar ${target.username}`, exact: true });
        const confirm = page.getByRole('dialog', { name: 'Eliminar usuario' });

        await deleteButton.click();
        await expect(confirm).toContainText(target.username);
        await confirm.getByRole('button', { name: 'Cancelar' }).click();
        await expect(confirm).toBeHidden();
        await expect(rowOf(page, target.username)).toHaveCount(1);
        expect(await api.findUser(target.username)).toBeDefined();

        await deleteButton.click();
        await confirm.getByRole('button', { name: 'Eliminar', exact: true }).click();
        await expect(confirm).toBeHidden();
        await expect(rowOf(page, target.username)).toHaveCount(0);
        await expect(page.getByRole('cell', { name: 'No hay usuarios' })).toBeVisible();
        expect(await api.findUser(target.username)).toBeUndefined();
    });
});

test.describe('Filtros y paginación de /users', () => {
    const tag = `${PREFIX.user}pg${uid()}`;
    const TOTAL = 11; // 10 por página → 2 páginas

    test.beforeAll(async ({ api }) => {
        const userRole = await api.roleId('USER');
        const moderatorRole = await api.roleId('MODERATOR');
        for (let i = 0; i < TOTAL; i++) {
            const username = `${tag}_${String(i).padStart(2, '0')}`;
            const user = await api.createUser({
                username,
                email: `${username}@e2e.example.com`,
                password: TEST_PASSWORD,
                // el 0 es MODERATOR y el 1 queda inactivo, para probar los filtros
                roleId: i === 0 ? moderatorRole : userRole,
            });
            if (i === 1) await api.setUserStatus(user.id, false);
        }
    });

    test.afterAll(async ({ api }) => {
        await api.deleteUsersWithPrefix(tag);
    });

    test('AC2: búsqueda por texto + paginación de 10 en 10', async ({ page }) => {
        await openUsers(page);
        await search(page, tag);

        const pagination = page.getByRole('navigation', { name: 'Paginación' });
        await expect(pagination.getByText('Página 1 de 2')).toBeVisible();
        await expect(page.getByRole('row').filter({ hasText: tag })).toHaveCount(10);
        await expect(pagination.getByRole('button', { name: 'Anterior' })).toBeDisabled();

        await pagination.getByRole('button', { name: 'Siguiente' }).click();
        await expect(pagination.getByText('Página 2 de 2')).toBeVisible();
        await expect(page.getByRole('row').filter({ hasText: tag })).toHaveCount(TOTAL - 10);
        await expect(pagination.getByRole('button', { name: 'Siguiente' })).toBeDisabled();

        await pagination.getByRole('button', { name: 'Anterior' }).click();
        await expect(pagination.getByText('Página 1 de 2')).toBeVisible();
    });

    test('AC2: filtro por estado (Inactivos / Activos) combinado con la búsqueda', async ({ page }) => {
        await openUsers(page);
        await search(page, tag);

        await page.getByLabel('Estado').selectOption({ label: 'Inactivos' });
        await expect(page.getByRole('row').filter({ hasText: tag })).toHaveCount(1);
        await expect(rowOf(page, `${tag}_01`)).toHaveCount(1);
        await expect(page.getByRole('navigation', { name: 'Paginación' })).toHaveCount(0);

        await page.getByLabel('Estado').selectOption({ label: 'Activos' });
        await expect(page.getByRole('row').filter({ hasText: tag })).toHaveCount(10);
        await expect(page.getByRole('navigation', { name: 'Paginación' })).toHaveCount(0);
    });

    test('AC2: filtro por rol combinado con la búsqueda', async ({ page }) => {
        await openUsers(page);
        await search(page, tag);

        await page.locator('#users-filter-role').selectOption({ label: 'MODERATOR' });
        await expect(page.getByRole('row').filter({ hasText: tag })).toHaveCount(1);
        await expect(rowOf(page, `${tag}_00`)).toHaveCount(1);

        await page.locator('#users-filter-role').selectOption({ label: 'Todos' });
        await expect(page.getByRole('navigation', { name: 'Paginación' }).getByText('Página 1 de 2')).toBeVisible();
    });
});
