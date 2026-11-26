import { addLibraryEntryAs, createReviewAs } from '../fixtures/api';
import { expect, test } from '../fixtures/test';
import { SEEDED_MEDIA, newUserData, storageStatePath, uid } from '../fixtures/test-data';

test.describe('Tiempo real — eventos en la sala multimedia', () => {
    test.use({ storageState: storageStatePath('admin') });

    test('muestra una reseña creada en el backend sin recargar el detalle', async ({ page, api }) => {
        const userRoleId = await api.roleId('USER');
        const reviewerData = newUserData('live_');
        const reviewer = await api.createUser({ ...reviewerData, roleId: userRoleId });
        const reviewerAccount = { email: reviewerData.email, password: reviewerData.password };
        const media = SEEDED_MEDIA.hades;
        const reviewTitle = `Reseña en vivo ${uid()}`;
        let reviewId: string | undefined;
        let mainFrameNavigations = 0;

        page.on('framenavigated', (frame) => {
            if (frame === page.mainFrame()) mainFrameNavigations += 1;
        });

        try {
            await addLibraryEntryAs(reviewerAccount, media.id);

            await page.goto(`/catalog/${media.id}`);
            await expect(page.getByRole('heading', { name: media.title })).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Reseñas' })).toBeVisible();

            // Espera que la sesión esté conectada y el detalle haya solicitado la sala del medio.
            await page.waitForFunction((mediaItemId) => {
                const store = (window as unknown as { __APP_STORE__?: { getState: () => unknown } }).__APP_STORE__;
                if (!store) return false;
                const state = store.getState() as {
                    realtime: { status: string; subscribedMediaItemId: string | null };
                    reviews: { status: string; selectedMediaId: string };
                };
                return state.realtime.status === 'connected' &&
                    state.realtime.subscribedMediaItemId === mediaItemId &&
                    state.reviews.status === 'succeeded' &&
                    state.reviews.selectedMediaId === mediaItemId;
            }, media.id);
            // Da tiempo a que el servidor confirme la entrada a la sala antes de emitir la reseña.
            await page.waitForTimeout(300);
            const navigationCountBeforeEvent = mainFrameNavigations;

            // Esta petición real emite `review.created` a media:{id} en el backend.
            const createdReview = await createReviewAs(reviewerAccount, media.id, {
                title: reviewTitle,
                content: `Contenido válido para verificar la actualización en vivo ${uid()}.`,
            });
            reviewId = createdReview.id;

            await expect(page.getByRole('heading', { name: reviewTitle, exact: true })).toBeVisible();
            expect(mainFrameNavigations).toBe(navigationCountBeforeEvent);
            const persistedReviews = await api.listReviewsByMedia(media.id);
            expect(persistedReviews.data.some((review) => review.id === createdReview.id)).toBe(true);
        } finally {
            if (reviewId) await api.deleteReview(reviewId).catch(() => undefined);
            await api.deleteUser(reviewer.id).catch(() => undefined);
        }
    });
});
