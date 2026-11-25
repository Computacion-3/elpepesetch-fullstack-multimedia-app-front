import {
    addLibraryEntryAs,
    apiLogin,
    createReviewAs,
} from '../fixtures/api';
import {
    NO_SESSION,
    alertWithText,
    expect,
    loginViaUi,
    statusWithText,
    test,
    waitForHydration,
} from '../fixtures/test';
import {
    ACCOUNTS,
    MESSAGES,
    SEEDED_MEDIA,
    newUserData,
    storageStatePath,
    uid,
} from '../fixtures/test-data';

test.describe('Reseñas — protección de ruta', () => {
    test.use({ storageState: NO_SESSION });

    test('redirige a /login si no hay sesión activa', async ({ page }) => {
        await page.goto('/reviews');
        await expect(page).toHaveURL(/\/login$/);
    });
});

test.describe('Reseñas — consulta y reglas de autoría', () => {
    test.use({ storageState: storageStatePath('user') });

    test('muestra las reseñas del elemento seleccionado y oculta Reportar en reseñas propias', async ({
        page,
    }) => {
        await page.goto(`/reviews?mediaItemId=${SEEDED_MEDIA.zelda.id}`);
        await expect(page.getByRole('heading', { name: 'Reseñas de la comunidad' })).toBeVisible();

        const ownTitle = page.getByRole('heading', { name: 'Una aventura inolvidable' });
        await expect(ownTitle).toBeVisible();
        await expect(
            page.getByText(/El mundo abierto y la exploraci.+hacen que cada partida se sienta especial\./),
        ).toBeVisible();

        await expect(page.getByRole('button', { name: 'Editar reseña de user' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Eliminar reseña de user' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Reportar reseña de user' })).toHaveCount(0);
    });
});

test.describe('Reseñas — flujo completo CRUD y validaciones de dominio', () => {
    test.use({ storageState: NO_SESSION });

    test('valida invariantes, crea, edita y elimina una reseña persistiendo en backend', async ({
        page,
        api,
    }) => {
        const userRoleId = await api.roleId('USER');
        const userData = newUserData('rev_');
        const createdUser = await api.createUser({ ...userData, roleId: userRoleId });
        const account = { email: userData.email, password: userData.password };
        const tag = uid();
        const initialTitle = `Reseña E2E ${tag}`;
        const initialContent = `Contenido inicial válido para la prueba E2E ${tag}.`;
        const updatedTitle = `Reseña editada ${tag}`;
        const updatedContent = `Contenido actualizado correctamente en la prueba E2E ${tag}.`;

        try {
            await addLibraryEntryAs(account, SEEDED_MEDIA.hades.id, 'IN_PROGRESS');
            await loginViaUi(page, account);

            await page.getByRole('navigation', { name: 'Comunidad y estadísticas' }).getByRole('link', { name: 'Reseñas' }).click();
            await expect(page).toHaveURL(/\/reviews$/);

            await page.goto(`/reviews?mediaItemId=${SEEDED_MEDIA.hades.id}`);
            await expect(page.getByRole('button', { name: 'Nueva reseña' })).toBeVisible();

            // 1. Validación de invariante de dominio (mínimo 10 caracteres)
            await page.getByRole('button', { name: 'Nueva reseña' }).click();
            await waitForHydration(page, 'dialog form');
            await page.getByLabel('Título (opcional)').fill(initialTitle);
            await page.getByLabel('Reseña', { exact: true }).fill('Corto');
            await page.getByRole('button', { name: 'Publicar reseña' }).click();
            await expect(alertWithText(page, MESSAGES.reviewContentTooShort)).toBeVisible();

            // 2. Creación válida y verificación en backend
            await page.getByLabel('Reseña', { exact: true }).fill(initialContent);
            await page.getByRole('button', { name: 'Publicar reseña' }).click();
            await expect(statusWithText(page, MESSAGES.reviewCreated)).toBeVisible();
            await expect(page.getByRole('heading', { name: initialTitle })).toBeVisible();

            let backendReviews = await api.listReviewsByMedia(SEEDED_MEDIA.hades.id);
            expect(backendReviews.data.some((r) => r.user?.id === createdUser.id && r.content === initialContent)).toBe(true);

            // 3. Edición y verificación en backend
            await page.getByRole('button', { name: `Editar reseña de ${userData.username}` }).click();
            await waitForHydration(page, 'dialog form');
            await page.getByLabel('Título (opcional)').fill(updatedTitle);
            await page.getByLabel('Reseña', { exact: true }).fill(updatedContent);
            await page.getByRole('button', { name: 'Guardar cambios' }).click();
            await expect(statusWithText(page, MESSAGES.reviewUpdated)).toBeVisible();
            await expect(page.getByRole('heading', { name: updatedTitle })).toBeVisible();

            backendReviews = await api.listReviewsByMedia(SEEDED_MEDIA.hades.id);
            expect(backendReviews.data.some((r) => r.user?.id === createdUser.id && r.title === updatedTitle && r.content === updatedContent)).toBe(true);

            // 4. Eliminación con confirmación y verificación en backend
            await page.getByRole('button', { name: `Eliminar reseña de ${userData.username}` }).click();
            await page.getByRole('dialog').getByRole('button', { name: 'Eliminar' }).click();
            await expect(statusWithText(page, MESSAGES.reviewDeleted)).toBeVisible();
            await expect(page.getByRole('heading', { name: updatedTitle })).toHaveCount(0);

            backendReviews = await api.listReviewsByMedia(SEEDED_MEDIA.hades.id);
            expect(backendReviews.data.some((r) => r.user?.id === createdUser.id)).toBe(false);
        } finally {
            await api.deleteUser(createdUser.id).catch(() => undefined);
        }
    });

    test('ADMIN puede editar o eliminar la reseña de otro usuario', async ({ page, api }) => {
        const userRoleId = await api.roleId('USER');
        const userData = newUserData('admrev_');
        const createdUser = await api.createUser({ ...userData, roleId: userRoleId });
        const account = { email: userData.email, password: userData.password };
        const tag = uid();

        try {
            await addLibraryEntryAs(account, SEEDED_MEDIA.hades.id, 'COMPLETED');
            await createReviewAs(account, SEEDED_MEDIA.hades.id, {
                title: `Reseña ajena ${tag}`,
                content: `Texto de reseña para moderar o eliminar por admin ${tag}.`,
            });

            await loginViaUi(page, ACCOUNTS.admin);
            await page.goto(`/reviews?mediaItemId=${SEEDED_MEDIA.hades.id}`);
            await expect(page.getByRole('heading', { name: `Reseña ajena ${tag}` })).toBeVisible();

            await page.getByRole('button', { name: `Eliminar reseña de ${userData.username}` }).click();
            await page.getByRole('dialog').getByRole('button', { name: 'Eliminar' }).click();
            await expect(statusWithText(page, MESSAGES.reviewDeleted)).toBeVisible();
            await expect(page.getByRole('heading', { name: `Reseña ajena ${tag}` })).toHaveCount(0);
        } finally {
            await api.deleteUser(createdUser.id).catch(() => undefined);
        }
    });
});
