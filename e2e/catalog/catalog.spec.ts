import { NO_SESSION, expect, test } from '../fixtures/test';
import { MESSAGES, SEEDED_MEDIA, storageStatePath } from '../fixtures/test-data';

test.describe('Catálogo — protección de rutas', () => {
    test.use({ storageState: NO_SESSION });

    for (const path of ['/catalog', '/catalog/proponer', '/media/pending']) {
        test(`sin sesión ${path} redirige a /login`, async ({ page }) => {
            await page.goto(path);
            await expect(page).toHaveURL(/\/login$/);
        });
    }
});

test.describe('Catálogo — navegación, filtros y detalle como USER', () => {
    test.use({ storageState: storageStatePath('user') });

    test('navega desde la barra principal, filtra y abre el detalle de un elemento', async ({
        page,
    }) => {
        await page.goto('/');
        const primaryNav = page.getByRole('navigation', { name: 'Principal', exact: true });
        await expect(primaryNav.getByRole('link')).toHaveText([
            'Inicio',
            'Catálogo',
            'Biblioteca',
            'Reseñas',
            'Estadísticas',
        ]);

        await primaryNav.getByRole('link', { name: 'Catálogo' }).click();
        await expect(page).toHaveURL(/\/catalog$/);
        await expect(page.getByRole('heading', { name: 'Catálogo multimedia' })).toBeVisible();

        // Verifica que los elementos aprobados del seed cargan y aplica filtros de tipo y búsqueda
        await expect(page.getByRole('heading', { name: SEEDED_MEDIA.matrix.title })).toBeVisible();
        await page.getByLabel('Tipo').selectOption('MOVIE');
        await page.getByLabel('Buscar por título o creador').fill('Matrix');
        await expect(page.getByRole('heading', { name: SEEDED_MEDIA.matrix.title })).toBeVisible();
        await expect(page.getByText('1 elementos')).toBeVisible();

        // Abre el detalle del elemento y valida metadatos
        await page.getByRole('link', { name: SEEDED_MEDIA.matrix.title }).click();
        await expect(page).toHaveURL(new RegExp(`/catalog/${SEEDED_MEDIA.matrix.id}$`));
        await expect(page.getByRole('heading', { name: SEEDED_MEDIA.matrix.title })).toBeVisible();
        await expect(page.getByRole('article').getByText('Lana y Lilly Wachowski · 1999')).toBeVisible();
        await expect(page.getByText('Duración: 136 minutos')).toBeVisible();
        await expect(page.getByText('Estado: Aprobado')).toBeVisible();
    });

    test('/media/pending muestra "Acceso denegado" para USER', async ({ page }) => {
        await page.goto('/media/pending');
        await expect(page.getByRole('heading', { name: MESSAGES.forbiddenPage })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Propuestas pendientes' })).toHaveCount(0);
    });
});

test.describe('Catálogo — moderación de propuestas como MODERATOR', () => {
    test.use({ storageState: storageStatePath('moderator') });

    test('ve Catálogo y Propuestas en la barra y consulta la cola de pendientes', async ({
        page,
    }) => {
        await page.goto('/');
        const primaryNav = page.getByRole('navigation', { name: 'Principal', exact: true });
        await expect(primaryNav.getByRole('link')).toHaveText([
            'Inicio',
            'Catálogo',
            'Biblioteca',
            'Reseñas',
            'Estadísticas',
        ]);
        const catalogNav = page.getByRole('navigation', {
            name: 'Administración del catálogo',
            exact: true,
        });
        await expect(catalogNav.getByRole('link')).toHaveText(['Propuestas']);

        await catalogNav.getByRole('link', { name: 'Propuestas' }).click();
        await expect(page).toHaveURL(/\/media\/pending$/);
        await expect(page.getByRole('heading', { name: 'Propuestas pendientes' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Celeste' })).toBeVisible();
    });
});
