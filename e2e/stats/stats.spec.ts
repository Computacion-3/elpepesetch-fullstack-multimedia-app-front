import { getPersonalStatsAs } from '../fixtures/api';
import { NO_SESSION, expect, test } from '../fixtures/test';
import { ACCOUNTS, storageStatePath } from '../fixtures/test-data';

test.describe('Estadísticas — protección de ruta', () => {
    test.use({ storageState: NO_SESSION });

    test('redirige a /login si no hay sesión activa', async ({ page }) => {
        await page.goto('/stats');
        await expect(page).toHaveURL(/\/login$/);
    });
});

test.describe('Estadísticas como USER', () => {
    test.use({ storageState: storageStatePath('user') });

    test('muestra estadísticas personales consistentes con el backend y oculta bloque global', async ({
        page,
    }) => {
        const expected = await getPersonalStatsAs(ACCOUNTS.user);
        const totalEntries =
            expected.entriesByType.GAME +
            expected.entriesByType.MOVIE +
            expected.entriesByType.BOOK;

        await page.goto('/stats');
        await expect(page.getByRole('heading', { name: 'Estadísticas', exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Mis estadísticas' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Estadísticas globales' })).toHaveCount(0);

        await expect(page.getByText('Total en biblioteca')).toBeVisible();
        await expect(page.getByText(String(totalEntries), { exact: true }).first()).toBeVisible();
        await expect(page.getByText(`${expected.averageRating.toFixed(1)} / 10`)).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Por tipo de medio' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Por estado' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Top 5 géneros' })).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'Finalizaciones mensuales (últimos 12 meses)' }),
        ).toBeVisible();
    });
});

test.describe('Estadísticas como ADMIN', () => {
    test.use({ storageState: storageStatePath('admin') });

    test('muestra estadísticas personales y globales con cifras del backend', async ({
        page,
        api,
    }) => {
        const expectedGlobal = await api.getGlobalStats();
        const totalMedia =
            expectedGlobal.mediaItemsByType.GAME +
            expectedGlobal.mediaItemsByType.MOVIE +
            expectedGlobal.mediaItemsByType.BOOK;

        await page.goto('/stats');
        await expect(page.getByRole('heading', { name: 'Mis estadísticas' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Estadísticas globales' })).toBeVisible();

        await expect(page.getByText('Usuarios', { exact: true })).toBeVisible();
        await expect(page.getByText('Catálogo total')).toBeVisible();
        await expect(page.getByText('Entradas en bibliotecas')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Catálogo global por tipo' })).toBeVisible();
        await expect(page.getByText(String(totalMedia), { exact: true }).first()).toBeVisible();
    });
});
