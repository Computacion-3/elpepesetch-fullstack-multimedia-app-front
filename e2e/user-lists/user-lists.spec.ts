import {
    createUserListAs,
    getMyListsAs,
    getPublicListsAs,
    getUserListAs,
    requestStatusAs,
    type ApiUser,
} from '../fixtures/api';
import { NO_SESSION, expect, loginViaUi, test, waitForHydration } from '../fixtures/test';
import { newUserData, SEEDED_MEDIA } from '../fixtures/test-data';

const accountFor = (user: ReturnType<typeof newUserData>) => ({ email: user.email, password: user.password });

test.describe('User Lists', () => {
    test.use({ storageState: NO_SESSION });

    test('protege las listas personales y públicas para sesiones ausentes', async ({ page }) => {
        await page.goto('/lists');
        await expect(page).toHaveURL(/\/login$/);
        await page.goto('/community/lists');
        await expect(page).toHaveURL(/\/login$/);
    });

    test('crea, edita, consulta, agrega y quita medios y elimina una lista', async ({ page, api }) => {
        const userData = newUserData('lists_');
        const createdUser = await api.createUser({ ...userData, roleId: await api.roleId('USER') });
        const account = accountFor(userData);

        try {
            await loginViaUi(page, account);
            await page.goto('/lists');
            await expect(page.getByRole('heading', { name: 'Mis listas' })).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Todavía no tienes listas' })).toBeVisible();
            await waitForHydration(page, 'section');

            await page.getByRole('button', { name: 'Crear mi primera lista' }).click();
            const editor = page.getByRole('dialog');
            const name = `Lista ${userData.username}`;
            await editor.getByLabel('Nombre').fill('');
            expect(await editor.getByLabel('Nombre').evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(false);
            await editor.getByLabel('Nombre').fill(name);
            await editor.getByLabel('Descripción').fill('Lista creada desde Playwright.');
            await editor.getByLabel('Visibilidad').selectOption('PRIVATE');
            await editor.getByRole('button', { name: 'Crear lista' }).click();

            const card = page.getByRole('article').filter({ hasText: name });
            await expect(card).toContainText('Privada');
            let persisted = await getMyListsAs(account);
            expect(persisted).toHaveLength(1);
            expect(persisted[0]).toMatchObject({ name, visibility: 'PRIVATE', owner: { username: userData.username } });

            await card.getByRole('button', { name: 'Editar' }).click();
            const editDialog = page.getByRole('dialog');
            const updatedName = `${name} actualizada`;
            await editDialog.getByLabel('Nombre').fill(updatedName);
            await editDialog.getByLabel('Descripción').fill('Descripción editada.');
            await editDialog.getByLabel('Visibilidad').selectOption('PUBLIC');
            await editDialog.getByRole('button', { name: 'Guardar cambios' }).click();
            const updatedCard = page.getByRole('article').filter({ hasText: updatedName });
            await expect(updatedCard).toContainText('Pública');
            await expect(updatedCard).toContainText('Descripción editada.');

            await updatedCard.getByRole('link', { name: updatedName }).click();
            await expect(page.getByRole('heading', { name: updatedName })).toBeVisible();
            await expect(page.getByText('Esta lista todavía no tiene medios.')).toBeVisible();
            await waitForHydration(page, 'section');
            await page.getByRole('button', { name: 'Agregar medio' }).click();
            const picker = page.getByRole('dialog');
            await picker.getByPlaceholder('Título o creador').fill('Hades');
            await picker.getByRole('button', { name: 'Buscar' }).click();
            const media = picker.getByRole('listitem').filter({ hasText: SEEDED_MEDIA.hades.title });
            await expect(media).toBeVisible();
            await media.getByRole('button', { name: 'Agregar' }).click();
            await expect(picker).not.toBeVisible();
            await expect(page.getByRole('listitem').filter({ hasText: SEEDED_MEDIA.hades.title })).toBeVisible();
            expect((await getUserListAs(account, persisted[0].id)).items.map((item) => item.id)).toContain(SEEDED_MEDIA.hades.id);

            await page.getByRole('button', { name: 'Agregar medio' }).click();
            const duplicatePicker = page.getByRole('dialog');
            await duplicatePicker.getByPlaceholder('Título o creador').fill('Hades');
            await duplicatePicker.getByRole('button', { name: 'Buscar' }).click();
            await expect(duplicatePicker.getByText('No hay medios aprobados disponibles para esta búsqueda.')).toBeVisible();
            await duplicatePicker.getByRole('button', { name: 'Cerrar' }).click();

            await page.getByRole('button', { name: `Quitar ${SEEDED_MEDIA.hades.title} de la lista` }).click();
            await expect(page.getByText('Esta lista todavía no tiene medios.')).toBeVisible();
            persisted = await getMyListsAs(account);
            expect(persisted[0]).toMatchObject({ name: updatedName, visibility: 'PUBLIC', description: 'Descripción editada.' });
            expect(persisted[0].items).toHaveLength(0);

            await page.getByRole('button', { name: 'Eliminar', exact: true }).click();
            await page.getByRole('button', { name: 'Eliminar lista' }).click();
            await expect(page).toHaveURL(/\/lists$/);
            expect(await getMyListsAs(account)).toHaveLength(0);
        } finally {
            await api.deleteUser(createdUser.id).catch(() => undefined);
        }
    });

    test('muestra listas públicas ajenas y el backend niega cambios y lectura privada', async ({ page, api }) => {
        const ownerData = newUserData('listowner_');
        const viewerData = newUserData('listviewer_');
        const roleId = await api.roleId('USER');
        const owner: ApiUser = await api.createUser({ ...ownerData, roleId });
        let viewer: ApiUser | undefined;

        try {
            viewer = await api.createUser({ ...viewerData, roleId });
            const ownerAccount = accountFor(ownerData);
            const viewerAccount = accountFor(viewerData);
            const suffix = ownerData.username;
            const publicList = await createUserListAs(ownerAccount, {
                name: `Pública ${suffix}`,
                description: 'Visible para la comunidad.',
                visibility: 'PUBLIC',
            });
            const privateList = await createUserListAs(ownerAccount, {
                name: `Privada ${suffix}`,
                visibility: 'PRIVATE',
            });
            expect(publicList.visibility).toBe('PUBLIC');
            const publicPage = await getPublicListsAs(viewerAccount);
            const visibleList = publicPage.data.find((list) => list.id === publicList.id);
            expect(visibleList).toMatchObject({
                name: publicList.name,
                owner: { id: owner.id, username: ownerData.username },
                items: [],
            });

            await loginViaUi(page, viewerAccount);
            await page.goto('/community/lists');
            await expect(page.getByRole('heading', { name: 'Listas públicas' })).toBeVisible();
            const card = page.getByRole('article').filter({ hasText: publicList.name });
            await expect(card).toContainText(ownerData.username);
            await card.getByRole('link', { name: publicList.name }).click();
            await expect(page.getByRole('heading', { name: publicList.name })).toBeVisible();
            await expect(page.getByText(ownerData.username, { exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Editar' })).toHaveCount(0);
            await expect(page.getByRole('button', { name: 'Agregar medio' })).toHaveCount(0);
            await expect(page.getByRole('button', { name: 'Eliminar', exact: true })).toHaveCount(0);

            expect(await requestStatusAs(viewerAccount, 'PATCH', `/lists/${publicList.id}`, { name: 'Cambio ajeno' })).toBe(403);
            expect(await requestStatusAs(viewerAccount, 'GET', `/lists/${privateList.id}`)).toBe(404);
        } finally {
            if (viewer) await api.deleteUser(viewer.id).catch(() => undefined);
            await api.deleteUser(owner.id).catch(() => undefined);
        }
    });
});
