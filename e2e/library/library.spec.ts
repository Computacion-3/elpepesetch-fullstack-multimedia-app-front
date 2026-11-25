import { getLibraryAs } from '../fixtures/api';
import { NO_SESSION, expect, loginViaUi, test } from '../fixtures/test';
import { SEEDED_MEDIA, newUserData } from '../fixtures/test-data';

test.describe('Biblioteca — protección de ruta', () => {
    test.use({ storageState: NO_SESSION });

    test('redirige a /login si no hay sesión', async ({ page }) => {
        await page.goto('/library');
        await expect(page).toHaveURL(/\/login$/);
        await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
    });
});

test.describe('Biblioteca — flujo de usuario', () => {
    test.use({ storageState: NO_SESSION });

    test('muestra el estado vacío, agrega, busca, edita y elimina una entrada persistida', async ({
        page,
        api,
    }) => {
        const userData = newUserData('library_');
        const userRoleId = await api.roleId('USER');
        const createdUser = await api.createUser({ ...userData, roleId: userRoleId });
        const account = { email: userData.email, password: userData.password };

        try {
            await loginViaUi(page, account);
            await page.goto('/library');
            await expect(page.getByRole('heading', { name: 'Mi biblioteca' })).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Tu próxima historia empieza aquí' })).toBeVisible();
            expect((await getLibraryAs(account)).meta.total).toBe(0);

            await page.getByRole('button', { name: 'Agregar elemento' }).click();
            await expect(page.getByRole('dialog')).toBeVisible();
            const picker = page.getByRole('dialog');
            await picker.getByLabel('Buscar en el catálogo').fill('Matrix');
            await picker.getByRole('button', { name: 'Buscar' }).click();
            await page.getByLabel('Elemento multimedia').selectOption(SEEDED_MEDIA.matrix.id);
            await page.getByRole('button', { name: 'Agregar a mi biblioteca' }).click();

            await expect(page.getByRole('heading', { name: SEEDED_MEDIA.matrix.title })).toBeVisible();
            let library = await getLibraryAs(account);
            expect(library.meta.total).toBe(1);
            expect(library.data[0].mediaItem.id).toBe(SEEDED_MEDIA.matrix.id);
            expect(library.data[0].status).toBe('PENDING');

            await page.getByRole('button', { name: 'Agregar elemento' }).click();
            const secondPicker = page.getByRole('dialog');
            await expect(secondPicker.getByLabel('Elemento multimedia')).toBeVisible();
            await expect(secondPicker.getByRole('option', { name: /Matrix/ })).toHaveCount(0);
            await secondPicker.getByRole('button', { name: 'Cancelar' }).click();

            await page.getByLabel('Buscar por título o creador').fill('Matrix');
            await page.getByRole('button', { name: 'Aplicar' }).click();
            await expect(page.getByRole('heading', { name: SEEDED_MEDIA.matrix.title })).toBeVisible();
            await expect(page.getByText('1 en total')).toBeVisible();

            await page.getByRole('button', { name: 'Ver detalle' }).click();
            await expect(page.getByRole('dialog')).toBeVisible();
            const editor = page.getByRole('dialog');
            await editor.getByLabel('Estado', { exact: true }).selectOption('IN_PROGRESS');
            await editor.getByRole('spinbutton').fill('12');
            await editor.getByLabel('Calificación', { exact: true }).selectOption('8');
            await editor.getByLabel('Favorito', { exact: true }).selectOption('true');
            await editor.getByLabel('Notas', { exact: true }).fill('Guardado desde Playwright.');
            await page.getByRole('button', { name: 'Guardar cambios' }).click();
            await expect(editor).not.toBeVisible();

            library = await getLibraryAs(account);
            expect(library.data[0]).toMatchObject({
                status: 'IN_PROGRESS',
                progress: 12,
                rating: 8,
                isFavorite: true,
                notes: 'Guardado desde Playwright.',
            });

            await page.getByRole('checkbox', { name: 'Favoritos' }).check();
            await page.getByRole('button', { name: 'Aplicar' }).click();
            await expect(page.getByRole('heading', { name: SEEDED_MEDIA.matrix.title })).toBeVisible();

            await page.getByRole('button', { name: 'Ver detalle' }).click();
            await page.getByRole('button', { name: 'Eliminar', exact: true }).click();
            await page.getByRole('button', { name: 'Sí, eliminar' }).click();
            await expect(page.getByRole('heading', { name: 'Tu próxima historia empieza aquí' })).toBeVisible();
            expect((await getLibraryAs(account)).meta.total).toBe(0);

            await page.setViewportSize({ width: 390, height: 844 });
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        } finally {
            await api.deleteUser(createdUser.id).catch(() => undefined);
        }
    });
});
