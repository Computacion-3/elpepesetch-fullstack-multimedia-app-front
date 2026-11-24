import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures/test';
import { MESSAGES, PREFIX, storageStatePath, uid } from '../fixtures/test-data';

test.use({ storageState: storageStatePath('admin') });

async function openPermissions(page: Page) {
    await page.goto('/permissions');
    await expect(page.getByRole('heading', { name: 'Permisos', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'users:manage', exact: true })).toBeVisible();
}

function rowOf(page: Page, name: string) {
    return page.getByRole('row').filter({ has: page.getByRole('cell', { name, exact: true }) });
}

test.describe('Administración de permisos (/permissions)', () => {
    const name = `${PREFIX.permission}${uid()}`;

    test.afterAll(async ({ api }) => {
        const leftover = await api.permissionByName(name);
        if (leftover) await api.deletePermission(leftover.id);
    });

    test('AC8: listar, crear, rechazar duplicado (409), editar y eliminar', async ({ page, api }) => {
        await openPermissions(page);
        for (const header of ['Nombre', 'Descripción', 'Acciones']) {
            await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
        }

        // Crear
        await page.getByRole('button', { name: 'Nuevo permiso' }).click();
        let dialog = page.getByRole('dialog', { name: 'Nuevo permiso' });
        await dialog.getByLabel('Nombre').fill(name);
        await dialog.getByLabel('Descripción').fill('Permiso creado por E2E');
        await dialog.getByRole('button', { name: 'Crear permiso' }).click();
        await expect(dialog).toBeHidden();
        await expect(rowOf(page, name)).toContainText('Permiso creado por E2E');
        expect((await api.permissionByName(name))?.description).toBe('Permiso creado por E2E');

        // Duplicado → 409 dentro del modal
        await page.getByRole('button', { name: 'Nuevo permiso' }).click();
        dialog = page.getByRole('dialog', { name: 'Nuevo permiso' });
        await dialog.getByLabel('Nombre').fill(name);
        await dialog.getByRole('button', { name: 'Crear permiso' }).click();
        await expect(dialog.getByRole('alert').filter({ hasText: MESSAGES.permissionConflict })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
        await expect(rowOf(page, name)).toHaveCount(1);

        // Editar
        await page.getByRole('button', { name: `Editar ${name}`, exact: true }).click();
        dialog = page.getByRole('dialog', { name: 'Editar permiso' });
        await expect(dialog.getByLabel('Nombre')).toHaveValue(name);
        await dialog.getByLabel('Descripción').fill('Descripción editada por E2E');
        await dialog.getByRole('button', { name: 'Guardar cambios' }).click();
        await expect(dialog).toBeHidden();
        await expect(rowOf(page, name)).toContainText('Descripción editada por E2E');

        // Eliminar con confirmación
        await page.getByRole('button', { name: `Eliminar ${name}`, exact: true }).click();
        const confirm = page.getByRole('dialog', { name: 'Eliminar permiso' });
        await expect(confirm).toContainText(name);
        await confirm.getByRole('button', { name: 'Eliminar', exact: true }).click();
        await expect(confirm).toBeHidden();
        await expect(rowOf(page, name)).toHaveCount(0);
        expect(await api.permissionByName(name)).toBeUndefined();
    });
});
