import { addLibraryEntryAs, type AdminApi } from '../fixtures/api';
import { NO_SESSION, expect, loginViaUi, test } from '../fixtures/test';
import { newUserData, PREFIX, SEEDED_MEDIA, TEST_PASSWORD, type Account } from '../fixtures/test-data';

async function withActivityUser(api: AdminApi, page: import('@playwright/test').Page, run: (account: Account) => Promise<void>) {
  const userData = newUserData('activity_');
  const roleId = await api.roleId('USER');
  const user = await api.createUser({ ...userData, roleId });
  try {
    await loginViaUi(page, { email: userData.email, password: TEST_PASSWORD });
    await page.goto('/activity');
    await expect(page.getByRole('heading', { name: 'Actividad reciente' })).toBeVisible();
    await run({ email: userData.email, password: TEST_PASSWORD });
  } finally {
    await api.deleteUser(user.id);
    const remaining = await api.findUser(userData.username);
    if (remaining?.username.startsWith(PREFIX.user)) await api.deleteUser(remaining.id);
  }
}

test.describe('Actividad personal', () => {
  test.use({ storageState: NO_SESSION });

  test('carga actividades persistidas desde el historial propio', async ({ page, api }) => {
    await withActivityUser(api, page, async (account) => {
      await expect(page.getByText('Todavía no hay actividad para mostrar.')).toBeVisible();
      await addLibraryEntryAs(account, SEEDED_MEDIA.zelda.id);
      await page.reload();
      await expect(page.getByText('Agregaste un medio a tu biblioteca.')).toBeVisible();
      if (process.env.E2E_DATA_SOURCE === 'graphql') {
        await expect(page.getByRole('link', { name: new RegExp(SEEDED_MEDIA.zelda.title) })).toBeVisible();
      } else {
        await expect(page.getByText(SEEDED_MEDIA.zelda.title)).toHaveCount(0);
      }
    });
  });

  test('muestra la actividad nueva recibida por Socket.IO', async ({ page, api }) => {
    await withActivityUser(api, page, async (account) => {
      await expect(page.getByRole('status', { name: 'En línea' })).toBeVisible({ timeout: 15_000 });
      await addLibraryEntryAs(account, SEEDED_MEDIA.zelda.id);
      await expect(page.getByText('Agregaste un medio a tu biblioteca.')).toBeVisible({ timeout: 15_000 });
    });
  });
});
