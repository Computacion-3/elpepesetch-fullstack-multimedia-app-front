import type { Page } from '@playwright/test';
import { alertWithText, expect, test } from '../fixtures/test';
import { MESSAGES, PREFIX, TEST_PASSWORD, newUserData, storageStatePath, uid } from '../fixtures/test-data';

test.use({ storageState: storageStatePath('admin') });

async function openRoles(page: Page) {
    await page.goto('/roles');
    await expect(page.getByRole('heading', { name: 'Roles', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'ADMIN', exact: true })).toBeVisible();
}

function rowOf(page: Page, name: string) {
    return page.getByRole('row').filter({ has: page.getByRole('cell', { name, exact: true }) });
}

/** Casilla de un permiso: su etiqueta empieza por el nombre del permiso. */
function permissionCheckbox(page: Page, name: string) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return page.getByRole('dialog').getByRole('checkbox', { name: new RegExp(`^${escaped}`) });
}

test.describe('Administración de roles (/roles)', () => {
    const roleName = `${PREFIX.role}${uid()}`.toUpperCase();

    test.afterAll(async ({ api }) => {
        const role = await api.roleByName(roleName);
        if (role) {
            await api.setRolePermissions(role.id, []);
            await api.deleteRole(role.id);
        }
    });

    test('AC7: lista nombre, descripción y número de permisos', async ({ page, api }) => {
        await openRoles(page);
        for (const header of ['Nombre', 'Descripción', 'Permisos', 'Acciones']) {
            await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
        }
        const admin = await api.roleByName('ADMIN');
        const count = (await api.rolePermissionNames(admin!.id)).length;
        await expect(rowOf(page, 'ADMIN').getByRole('cell', { name: String(count), exact: true })).toBeVisible();
    });

    test('AC7: crear, editar, asignar permisos y eliminar un rol', async ({ page, api }) => {
        await openRoles(page);

        // Crear
        await page.getByRole('button', { name: 'Nuevo rol' }).click();
        let dialog = page.getByRole('dialog', { name: 'Nuevo rol' });
        await dialog.getByLabel('Nombre').fill(roleName);
        await dialog.getByLabel('Descripción').fill('Rol creado por E2E');
        await dialog.getByRole('button', { name: 'Crear rol' }).click();
        await expect(dialog).toBeHidden();
        const row = rowOf(page, roleName);
        await expect(row).toContainText('Rol creado por E2E');
        await expect(row.getByRole('cell', { name: '0', exact: true })).toBeVisible();

        // Nombre repetido → 409 dentro del modal
        await page.getByRole('button', { name: 'Nuevo rol' }).click();
        dialog = page.getByRole('dialog', { name: 'Nuevo rol' });
        await dialog.getByLabel('Nombre').fill(roleName);
        await dialog.getByRole('button', { name: 'Crear rol' }).click();
        await expect(dialog.getByRole('alert').filter({ hasText: MESSAGES.roleConflict })).toBeVisible();
        expect(await api.requestStatus('POST', '/roles', { name: roleName, description: '' })).toBe(409);
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();

        // Editar descripción
        await page.getByRole('button', { name: `Editar ${roleName}`, exact: true }).click();
        dialog = page.getByRole('dialog', { name: 'Editar rol' });
        await expect(dialog.getByLabel('Nombre')).toHaveValue(roleName);
        await dialog.getByLabel('Descripción').fill('Descripción editada por E2E');
        await dialog.getByRole('button', { name: 'Guardar cambios' }).click();
        await expect(dialog).toBeHidden();
        await expect(row).toContainText('Descripción editada por E2E');

        // Asignar dos permisos con las casillas
        await page.getByRole('button', { name: `Permisos de ${roleName}`, exact: true }).click();
        dialog = page.getByRole('dialog', { name: `Permisos de ${roleName}` });
        await permissionCheckbox(page, 'catalog:delete').check();
        await permissionCheckbox(page, 'reviews:delete').check();
        await dialog.getByRole('button', { name: 'Guardar permisos' }).click();
        await expect(dialog).toBeHidden();
        await expect(row.getByRole('cell', { name: '2', exact: true })).toBeVisible();
        const role = await api.roleByName(roleName);
        expect(await api.rolePermissionNames(role!.id)).toEqual(['catalog:delete', 'reviews:delete']);

        // Reemplazar el conjunto: al reabrir se ven marcadas; quitar una deja solo la otra
        await page.getByRole('button', { name: `Permisos de ${roleName}`, exact: true }).click();
        await expect(permissionCheckbox(page, 'catalog:delete')).toBeChecked();
        await expect(permissionCheckbox(page, 'reviews:delete')).toBeChecked();
        await permissionCheckbox(page, 'catalog:delete').uncheck();
        await dialog.getByRole('button', { name: 'Guardar permisos' }).click();
        await expect(dialog).toBeHidden();
        await expect(row.getByRole('cell', { name: '1', exact: true })).toBeVisible();
        expect(await api.rolePermissionNames(role!.id)).toEqual(['reviews:delete']);

        // Eliminar (sin usuarios asignados)
        await page.getByRole('button', { name: `Eliminar ${roleName}`, exact: true }).click();
        const confirm = page.getByRole('dialog', { name: 'Eliminar rol' });
        await confirm.getByRole('button', { name: 'Eliminar', exact: true }).click();
        await expect(confirm).toBeHidden();
        await expect(rowOf(page, roleName)).toHaveCount(0);
        expect(await api.roleByName(roleName)).toBeUndefined();
    });

    test('AC7: no deja eliminar un rol con usuarios asignados (409)', async ({ page, api }) => {
        const busyRole = await api.createRole(`${PREFIX.role}BUSY_${uid()}`.toUpperCase());
        const member = await api.createUser({ ...newUserData('rm'), password: TEST_PASSWORD, roleId: busyRole.id });
        try {
            await openRoles(page);
            await page.getByRole('button', { name: `Eliminar ${busyRole.name}`, exact: true }).click();
            await page
                .getByRole('dialog', { name: 'Eliminar rol' })
                .getByRole('button', { name: 'Eliminar', exact: true })
                .click();

            await expect(alertWithText(page, MESSAGES.roleInUse)).toBeVisible();
            await expect(rowOf(page, busyRole.name)).toHaveCount(1);
            expect(await api.roleByName(busyRole.name)).toBeDefined();
            expect(await api.requestStatus('DELETE', `/roles/${busyRole.id}`)).toBe(409);
        } finally {
            await api.deleteUser(member.id);
            await api.deleteRole(busyRole.id);
        }
    });
});
