import { NO_SESSION, expect, test, waitForHydration } from '../fixtures/test';
import { MESSAGES, PREFIX, storageStatePath, uid } from '../fixtures/test-data';

test.describe('Géneros — protección de ruta', () => {
    test.use({ storageState: NO_SESSION });

    test('redirige a /login si no hay sesión activa', async ({ page }) => {
        await page.goto('/genres');
        await expect(page).toHaveURL(/\/login$/);
    });
});

for (const accountKey of ['user', 'moderator'] as const) {
    test.describe(`Géneros — acceso denegado para ${accountKey.toUpperCase()}`, () => {
        test.use({ storageState: storageStatePath(accountKey) });

        test('/genres muestra "Acceso denegado"', async ({ page }) => {
            await page.goto('/genres');
            await expect(page.getByRole('heading', { name: MESSAGES.forbiddenPage })).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Gestión de géneros' })).toHaveCount(0);
        });
    });
}

test.describe('Géneros — CRUD completo como ADMIN', () => {
    test.use({ storageState: storageStatePath('admin') });

    test('lista géneros del seed, crea, edita y elimina verificando en backend', async ({
        page,
        api,
    }) => {
        const tag = uid();
        const name = `${PREFIX.user}gen_${tag}`;
        const updatedName = `${PREFIX.user}gen_ed_${tag}`;
        const description = `Descripción E2E ${tag}`;

        try {
            await page.goto('/genres');
            await expect(page.getByRole('heading', { name: 'Gestión de géneros' })).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Drama' })).toBeVisible();

            // 1. Crear género
            await waitForHydration(page);
            await page.getByLabel('Nombre').fill(name);
            await page.getByLabel('Descripción (opcional)').fill(description);
            await page.getByRole('button', { name: 'Crear género' }).click();

            await expect(page.getByRole('heading', { name })).toBeVisible();
            let genres = await api.listGenres();
            expect(genres.some((g) => g.name === name && g.description === description)).toBe(true);

            // 2. Editar género
            const createdRow = page.locator('li').filter({ has: page.getByRole('heading', { name }) });
            await createdRow.getByRole('button', { name: 'Editar' }).click();
            await page.getByLabel('Nombre').fill(updatedName);
            await page.getByRole('button', { name: 'Guardar' }).click();

            await expect(page.getByRole('heading', { name: updatedName })).toBeVisible();
            genres = await api.listGenres();
            expect(genres.some((g) => g.name === updatedName)).toBe(true);

            // 3. Eliminar género con confirmación
            const updatedRow = page
                .locator('li')
                .filter({ has: page.getByRole('heading', { name: updatedName }) });
            await updatedRow.getByRole('button', { name: 'Eliminar' }).click();
            await page.getByRole('dialog').getByRole('button', { name: 'Eliminar' }).click();

            await expect(page.getByRole('heading', { name: updatedName })).toHaveCount(0);
            genres = await api.listGenres();
            expect(genres.some((g) => g.name === updatedName)).toBe(false);
        } finally {
            const leftover = (await api.listGenres()).filter(
                (g) => g.name === name || g.name === updatedName,
            );
            for (const g of leftover) {
                await api.deleteGenre(g.id).catch(() => undefined);
            }
        }
    });
});
