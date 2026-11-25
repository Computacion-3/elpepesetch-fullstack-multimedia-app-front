import {
    addLibraryEntryAs,
    createReportAs,
    createReviewAs,
} from '../fixtures/api';
import {
    NO_SESSION,
    alertWithText,
    expect,
    loginViaUi,
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

test.describe('Reportes — control de acceso por permisos', () => {
    test.describe('como USER (sin reviews:moderate)', () => {
        test.use({ storageState: storageStatePath('user') });

        test('no ve el enlace de Moderación de reportes y /reports muestra Acceso denegado', async ({
            page,
        }) => {
            await page.goto('/');
            const nav = page.getByRole('navigation', { name: 'Comunidad y estadísticas' });
            await expect(nav.getByRole('link')).toHaveText(['Reseñas', 'Estadísticas']);

            await page.goto('/reports');
            await expect(page.getByRole('heading', { name: MESSAGES.forbiddenPage })).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Moderación de reportes' })).toHaveCount(0);
        });
    });

    test.describe('como MODERATOR (con reviews:moderate)', () => {
        test.use({ storageState: storageStatePath('moderator') });

        test('ve el enlace de Moderación de reportes y accede al panel', async ({ page }) => {
            await page.goto('/');
            const nav = page.getByRole('navigation', { name: 'Comunidad y estadísticas' });
            await expect(nav.getByRole('link')).toHaveText([
                'Reseñas',
                'Estadísticas',
                'Moderación de reportes',
            ]);
            await nav.getByRole('link', { name: 'Moderación de reportes' }).click();
            await expect(page).toHaveURL(/\/reports$/);
            await expect(page.getByRole('heading', { name: 'Moderación de reportes' })).toBeVisible();
        });
    });
});

test.describe('Reportes — creación desde reseñas y moderación (HIDE / DISMISS)', () => {
    test.use({ storageState: NO_SESSION });

    test('usuario reporta reseña ajena (sin duplicados) y moderador resuelve con HIDE verificando ocultamiento', async ({
        page,
        api,
    }) => {
        const userRoleId = await api.roleId('USER');
        const authorData = newUserData('rep_aut_');
        const reporterData = newUserData('rep_usr_');
        const authorUser = await api.createUser({ ...authorData, roleId: userRoleId });
        const reporterUser = await api.createUser({ ...reporterData, roleId: userRoleId });
        const authorAcc = { email: authorData.email, password: authorData.password };
        const reporterAcc = { email: reporterData.email, password: reporterData.password };
        const tag = uid();
        const reviewTitle = `Reseña con spoiler ${tag}`;
        const hideReason = `Ocultada en E2E por spoilers ${tag}`;

        try {
            await addLibraryEntryAs(authorAcc, SEEDED_MEDIA.hades.id, 'COMPLETED');
            const createdReview = await createReviewAs(authorAcc, SEEDED_MEDIA.hades.id, {
                title: reviewTitle,
                content: `Esta reseña contiene detalles finales de la historia ${tag}.`,
            });

            // 1. El reporter inicia sesión y reporta la reseña desde /reviews
            await loginViaUi(page, reporterAcc);
            await page.goto(`/reviews?mediaItemId=${SEEDED_MEDIA.hades.id}`);
            await expect(page.getByRole('heading', { name: reviewTitle })).toBeVisible();

            await page.getByRole('button', { name: `Reportar reseña de ${authorData.username}` }).click();
            await waitForHydration(page, 'dialog form');
            await page.getByLabel('Motivo del reporte').selectOption('SPOILER');
            await page.getByLabel('Comentario adicional (opcional)').fill(`Spoiler E2E ${tag}`);
            await page.getByRole('button', { name: 'Enviar reporte' }).click();
            await expect(alertWithText(page, MESSAGES.reportSent)).toBeVisible();

            // 2. Intentar reportar la misma reseña por segunda vez devuelve 409
            await page.getByRole('button', { name: `Reportar reseña de ${authorData.username}` }).click();
            await waitForHydration(page, 'dialog form');
            await page.getByRole('button', { name: 'Enviar reporte' }).click();
            await expect(alertWithText(page, MESSAGES.reportConflict)).toBeVisible();
            await page.keyboard.press('Escape');

            const openReports = await api.listReports('OPEN');
            const targetReport = openReports.data.find(
                (r) => r.review?.id === createdReview.id && r.reporter?.id === reporterUser.id,
            );
            expect(targetReport).toBeDefined();

            // 3. Moderador inicia sesión, valida motivo obligatorio en HIDE y oculta la reseña
            await page.getByRole('button', { name: 'Cerrar sesión' }).click();
            await expect(page).toHaveURL(/\/login$/);
            await loginViaUi(page, ACCOUNTS.moderator);
            await page.goto('/reports');

            await expect(page.getByText(reviewTitle)).toBeVisible();
            await page.getByRole('button', { name: `Ocultar reseña del reporte ${targetReport!.id}` }).click();
            await waitForHydration(page, 'dialog form');

            // Motivo vacío dispara validación de dominio
            await page.getByRole('button', { name: 'Confirmar ocultamiento' }).click();
            await expect(alertWithText(page, MESSAGES.reportHideReasonRequired)).toBeVisible();

            // Confirmar con motivo válido
            await page.getByLabel('Motivo de moderación (obligatorio)').fill(hideReason);
            await page.getByRole('button', { name: 'Confirmar ocultamiento' }).click();
            await expect(alertWithText(page, MESSAGES.reportResolvedHide)).toBeVisible();

            // Filtrar por Resueltos y verificar estado en backend
            await page.getByLabel('Estado').selectOption('RESOLVED');
            await expect(page.getByText(`Motivo: ${hideReason}`)).toBeVisible();

            const reviewsAfter = await api.listReviewsByMedia(SEEDED_MEDIA.hades.id);
            const hiddenReview = reviewsAfter.data.find((r) => r.id === createdReview.id);
            expect(hiddenReview?.isHidden).toBe(true);
            expect(hiddenReview?.hiddenReason).toBe(hideReason);

            // Al volver a /reviews como moderador, la reseña muestra insignia y motivo
            await page.goto(`/reviews?mediaItemId=${SEEDED_MEDIA.hades.id}`);
            await expect(page.getByText('Oculta por moderación')).toBeVisible();
            await expect(page.getByText(`Motivo de ocultamiento: ${hideReason}`)).toBeVisible();
        } finally {
            await api.deleteUser(reporterUser.id).catch(() => undefined);
            await api.deleteUser(authorUser.id).catch(() => undefined);
        }
    });

    test('moderador puede descartar un reporte (DISMISS) manteniendo la reseña visible', async ({
        page,
        api,
    }) => {
        const userRoleId = await api.roleId('USER');
        const authorData = newUserData('dis_aut_');
        const reporterData = newUserData('dis_usr_');
        const authorUser = await api.createUser({ ...authorData, roleId: userRoleId });
        const reporterUser = await api.createUser({ ...reporterData, roleId: userRoleId });
        const authorAcc = { email: authorData.email, password: authorData.password };
        const reporterAcc = { email: reporterData.email, password: reporterData.password };
        const tag = uid();

        try {
            await addLibraryEntryAs(authorAcc, SEEDED_MEDIA.matrix.id, 'COMPLETED');
            const createdReview = await createReviewAs(authorAcc, SEEDED_MEDIA.matrix.id, {
                title: `Reseña válida ${tag}`,
                content: `Opinión respetuosa sin infracciones para probar DISMISS ${tag}.`,
            });
            const createdReport = await createReportAs(reporterAcc, createdReview.id, {
                reason: 'OTHER',
                comment: `Reporte improcedente ${tag}`,
            });

            await loginViaUi(page, ACCOUNTS.moderator);
            await page.goto('/reports');

            await page.getByRole('button', { name: `Descartar reporte ${createdReport.id}` }).click();
            await expect(alertWithText(page, MESSAGES.reportResolvedDismiss)).toBeVisible();

            await page.getByLabel('Estado').selectOption('DISMISSED');
            await expect(page.getByText(`Reporte improcedente ${tag}`)).toBeVisible();

            const reviewsAfter = await api.listReviewsByMedia(SEEDED_MEDIA.matrix.id);
            const visibleReview = reviewsAfter.data.find((r) => r.id === createdReview.id);
            expect(visibleReview?.isHidden).toBe(false);
        } finally {
            await api.deleteUser(reporterUser.id).catch(() => undefined);
            await api.deleteUser(authorUser.id).catch(() => undefined);
        }
    });
});
