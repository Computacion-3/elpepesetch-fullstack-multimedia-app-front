import type { ApiRole, ApiUser } from '../fixtures/api';
import { NO_SESSION, alertWithText, expect, loginViaUi, test } from '../fixtures/test';
import { MESSAGES, PREFIX, TEST_PASSWORD, newUserData, uid } from '../fixtures/test-data';

test.use({ storageState: NO_SESSION });

/**
 * Un rol temporal que solo tiene `users:manage` permite comprobar la autorización granular
 * (por permiso, no por nombre de rol) y que cada Server Action revalida el permiso en el servidor.
 */
test.describe('Autorización por permisos (authorities) y revalidación en el servidor', () => {
    let limitedRole: ApiRole;
    let operator: ApiUser; // inicia sesión con el rol limitado
    let victim: ApiUser; // usuario sobre el que intenta actuar

    test.beforeEach(async ({ api }) => {
        limitedRole = await api.createRole(`${PREFIX.role}LIMITED_${uid()}`.toUpperCase(), 'Solo gestiona usuarios');
        await api.setRolePermissions(limitedRole.id, await api.permissionIds(['users:manage']));
        operator = await api.createUser({ ...newUserData('op'), password: TEST_PASSWORD, roleId: limitedRole.id });
        victim = await api.createUser({ ...newUserData('vi'), password: TEST_PASSWORD, roleId: await api.roleId('USER') });
    });

    test.afterEach(async ({ api }) => {
        for (const user of [operator, victim]) {
            if (user && (await api.findUser(user.username))) await api.deleteUser(user.id);
        }
        if (limitedRole) {
            await api.setRolePermissions(limitedRole.id, []);
            await api.deleteRole(limitedRole.id);
        }
    });

    test('AC1 / AC9: con solo users:manage ve y abre Usuarios, pero no Roles ni Permisos', async ({ page }) => {
        await loginViaUi(page, { email: operator.email, password: TEST_PASSWORD });

        const nav = page.getByRole('navigation', { name: 'Administración', exact: true });
        await expect(nav.getByRole('link')).toHaveText(['Usuarios']);

        await nav.getByRole('link', { name: 'Usuarios' }).click();
        await expect(page.getByRole('heading', { name: 'Usuarios', exact: true })).toBeVisible();
        // Sin roles:manage no puede cargar roles: el rol se muestra como texto, sin selector (D10).
        await page.getByLabel('Buscar').fill(victim.username);
        await page.getByRole('button', { name: 'Buscar' }).click();
        const row = page.getByRole('row').filter({ hasText: victim.username });
        await expect(row.getByRole('cell', { name: 'USER', exact: true })).toBeVisible();
        await expect(row.getByRole('combobox')).toHaveCount(0);

        for (const path of ['/roles', '/permissions']) {
            await page.goto(path);
            await expect(page.getByRole('heading', { name: MESSAGES.forbiddenPage })).toBeVisible();
        }
    });

    test('AC10: si pierde el permiso con la página abierta, la Server Action se niega y el backend no cambia', async ({
        page,
        api,
    }) => {
        await loginViaUi(page, { email: operator.email, password: TEST_PASSWORD });
        await page.goto('/users');
        await page.getByLabel('Buscar').fill(victim.username);
        await page.getByRole('button', { name: 'Buscar' }).click();
        const deactivate = page.getByRole('button', { name: `Desactivar ${victim.username}`, exact: true });
        await expect(deactivate).toBeEnabled();

        // El admin le quita users:manage al rol mientras la página sigue abierta.
        await api.setRolePermissions(limitedRole.id, []);

        await deactivate.click();
        await expect(alertWithText(page, MESSAGES.forbiddenAction)).toBeVisible();
        expect((await api.findUser(victim.username))?.isActive, 'el usuario sigue activo en el backend').toBe(true);

        // Al recargar, la página ya no se entrega.
        await page.reload();
        await expect(page.getByRole('heading', { name: MESSAGES.forbiddenPage })).toBeVisible();
    });

    test('AC1: al darle el permiso, el cambio aplica en la siguiente navegación (permisos leídos del backend)', async ({
        page,
        api,
    }) => {
        await loginViaUi(page, { email: operator.email, password: TEST_PASSWORD });
        await page.goto('/roles');
        await expect(page.getByRole('heading', { name: MESSAGES.forbiddenPage })).toBeVisible();

        await api.setRolePermissions(limitedRole.id, await api.permissionIds(['users:manage', 'roles:manage']));

        await page.reload();
        await expect(page.getByRole('heading', { name: 'Roles', exact: true })).toBeVisible();
    });
});
