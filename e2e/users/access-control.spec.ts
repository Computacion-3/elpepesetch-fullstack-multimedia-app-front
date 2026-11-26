import { expect, test } from '../fixtures/test';
import { ACCOUNTS, MESSAGES, storageStatePath } from '../fixtures/test-data';

const ADMIN_ROUTES = [
    { path: '/users', heading: 'Usuarios', link: 'Usuarios' },
    { path: '/roles', heading: 'Roles', link: 'Roles' },
    { path: '/permissions', heading: 'Permisos', link: 'Permisos' },
];

for (const account of [ACCOUNTS.user, ACCOUNTS.moderator]) {
    test.describe(`Autorización como ${account.role} (sin permisos de administración)`, () => {
        test.use({ storageState: storageStatePath(account.key) });

        test('AC9: la página de inicio no muestra la navegación de administración', async ({ page }) => {
            await page.goto('/');
            await expect(page.getByRole('heading', { name: `Hola, ${account.fullName}` })).toBeVisible();
            await expect(
                page.getByRole('navigation', { name: 'Administración', exact: true }),
            ).toHaveCount(0);
        });

        for (const route of ADMIN_ROUTES) {
            test(`AC1: ${route.path} muestra "Acceso denegado" y no entrega el panel`, async ({ page }) => {
                await page.goto(route.path);
                await expect(page).toHaveURL(new RegExp(`${route.path}$`));
                await expect(page.getByRole('heading', { name: MESSAGES.forbiddenPage })).toBeVisible();
                await expect(page.getByRole('heading', { name: route.heading, exact: true })).toHaveCount(0);
                await expect(page.getByRole('table')).toHaveCount(0);
            });
        }
    });
}

test.describe('Autorización como ADMIN', () => {
    test.use({ storageState: storageStatePath('admin') });

    test('AC9: ve los tres enlaces de administración y cada uno abre su panel', async ({ page }) => {
        await page.goto('/');
        const nav = page.getByRole('navigation', { name: 'Administración', exact: true });
        await expect(nav.getByRole('link')).toHaveText(ADMIN_ROUTES.map((r) => r.link));

        for (const route of ADMIN_ROUTES) {
            await nav.getByRole('link', { name: route.link }).click();
            await expect(page).toHaveURL(new RegExp(`${route.path}$`));
            await expect(page.getByRole('heading', { name: route.heading, exact: true })).toBeVisible();
        }
    });
});
