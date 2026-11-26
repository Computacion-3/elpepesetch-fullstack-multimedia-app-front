import { expect, test } from '../fixtures/test';
import { storageStatePath } from '../fixtures/test-data';

test.use({ storageState: storageStatePath('user') });

test('Library, listas y actividad siguen utilizables en tablet y móvil', async ({ page }) => {
    for (const viewport of [{ width: 768, height: 1024 }, { width: 390, height: 844 }]) {
        await page.setViewportSize(viewport);

        await page.goto('/library');
        await expect(page.getByRole('heading', { name: 'Mi biblioteca' })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await expect(page.getByRole('button', { name: 'Agregar elemento' })).toBeVisible();

        await page.goto('/lists');
        await expect(page.getByRole('heading', { name: 'Mis listas' })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        const createButton = page.getByRole('button', { name: /Crear (mi primera )?lista/ }).first();
        await expect(createButton).toBeVisible();
        await createButton.click();
        const editor = page.getByRole('dialog');
        await expect(editor.getByLabel('Nombre')).toBeVisible();
        await editor.getByRole('button', { name: 'Cancelar' }).click();

        await page.goto('/community/lists');
        await expect(page.getByRole('heading', { name: 'Listas públicas' })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

        await page.goto('/activity');
        await expect(page.getByRole('heading', { name: 'Actividad reciente' })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
});
