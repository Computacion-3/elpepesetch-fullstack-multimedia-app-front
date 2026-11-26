import { getPersonalStatsAs } from '../fixtures/api';
import { NO_SESSION, expect, test } from '../fixtures/test';
import { ACCOUNTS, storageStatePath } from '../fixtures/test-data';

async function expectDistribution(
    page: import('@playwright/test').Page,
    title: string,
    expected: Array<{ label: string; count: number }>,
) {
    const list = page.getByRole('heading', { name: title, exact: true }).locator('xpath=..').getByRole('listitem');
    await expect(list).toHaveCount(expected.length);

    for (const item of expected) {
        const row = list.filter({ hasText: item.label });
        await expect(row).toHaveCount(1);
        await expect(row.locator('span').nth(1)).toHaveText(String(item.count));
    }
}

async function expectKpi(
    section: import('@playwright/test').Locator,
    label: string,
    expected: number,
) {
    const value = section.getByText(label, { exact: true }).locator('xpath=..').locator('p').nth(1);
    await expect(value).toHaveText(String(expected));
}

function monthLabel(monthKey: string): string {
    const [yearText, monthText] = monthKey.split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    if (!year || !month) return monthKey;

    return new Intl.DateTimeFormat('es-CO', {
        month: 'short',
        year: '2-digit',
        timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month - 1, 1)));
}

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
        const completedTotal = expected.completedByMonth.reduce((sum, month) => sum + month.count, 0);

        await page.goto('/stats');
        await expect(page.getByRole('heading', { name: 'Estadísticas', exact: true })).toBeVisible();
        const personalSection = page.getByRole('heading', { name: 'Mis estadísticas' }).locator('xpath=..');
        await expect(personalSection).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Estadísticas globales' })).toHaveCount(0);

        await expectKpi(personalSection, 'Total en biblioteca', totalEntries);
        await expectKpi(personalSection, 'Completados (últimos 12 meses)', completedTotal);
        const averageLabel = expected.averageRating > 0
            ? `${expected.averageRating.toFixed(1)} / 10`
            : 'Sin calificar';
        await expect(
            personalSection.getByText('Calificación promedio', { exact: true }).locator('xpath=..').locator('p').nth(1),
        ).toHaveText(averageLabel);

        await expectDistribution(page, 'Por tipo de medio', [
            { label: 'Juegos', count: expected.entriesByType.GAME },
            { label: 'Películas', count: expected.entriesByType.MOVIE },
            { label: 'Libros', count: expected.entriesByType.BOOK },
        ]);
        await expectDistribution(page, 'Por estado', [
            { label: 'Pendientes', count: expected.entriesByStatus.PENDING },
            { label: 'En progreso', count: expected.entriesByStatus.IN_PROGRESS },
            { label: 'Completados', count: expected.entriesByStatus.COMPLETED },
            { label: 'Abandonados', count: expected.entriesByStatus.DROPPED },
        ]);
        await expectDistribution(
            page,
            'Top 5 géneros',
            expected.topGenres.map((genre) => ({ label: genre.name, count: genre.count })),
        );

        const monthlySection = page
            .getByRole('heading', { name: 'Finalizaciones mensuales (últimos 12 meses)' })
            .locator('xpath=..');
        for (const month of expected.completedByMonth) {
            const label = monthlySection.getByText(monthLabel(month.month), { exact: true });
            await expect(label).toHaveCount(1);
            await expect(label.locator('xpath=..').locator('span').nth(1)).toHaveText(
                String(month.count),
            );
        }
    });
});

test.describe('Estadísticas como ADMIN', () => {
    test.use({ storageState: storageStatePath('admin') });

    test('muestra estadísticas personales y globales con cifras del backend', async ({
        page,
        api,
    }) => {
        const expectedPersonal = await getPersonalStatsAs(ACCOUNTS.admin);
        const expectedGlobal = await api.getGlobalStats();
        const totalMedia =
            expectedGlobal.mediaItemsByType.GAME +
            expectedGlobal.mediaItemsByType.MOVIE +
            expectedGlobal.mediaItemsByType.BOOK;

        await page.goto('/stats');
        const personalSection = page.getByRole('heading', { name: 'Mis estadísticas' }).locator('xpath=..');
        const globalSection = page.getByRole('heading', { name: 'Estadísticas globales' }).locator('xpath=..');
        await expect(personalSection).toBeVisible();
        await expect(globalSection).toBeVisible();

        await expectKpi(
            personalSection,
            'Total en biblioteca',
            Object.values(expectedPersonal.entriesByType).reduce((sum, count) => sum + count, 0),
        );
        await expectKpi(
            personalSection,
            'Completados (últimos 12 meses)',
            expectedPersonal.completedByMonth.reduce((sum, month) => sum + month.count, 0),
        );
        await expectKpi(globalSection, 'Usuarios', expectedGlobal.users);
        await expectKpi(globalSection, 'Catálogo total', totalMedia);
        await expectKpi(globalSection, 'Entradas en bibliotecas', expectedGlobal.libraryEntries);
        await expectKpi(globalSection, 'Reseñas', expectedGlobal.reviews);
        await expectDistribution(page, 'Catálogo global por tipo', [
            { label: 'Juegos', count: expectedGlobal.mediaItemsByType.GAME },
            { label: 'Películas', count: expectedGlobal.mediaItemsByType.MOVIE },
            { label: 'Libros', count: expectedGlobal.mediaItemsByType.BOOK },
        ]);
    });
});
