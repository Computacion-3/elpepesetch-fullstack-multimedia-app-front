import { test as setup } from '@playwright/test';
import { loginViaUi } from './fixtures/test';
import { ACCOUNTS, storageStatePath } from './fixtures/test-data';

/**
 * Inicia sesión una vez por rol del seed (por la interfaz, así también prueba el login en la
 * fuente de datos activa) y guarda cookies en e2e/.auth/<rol>.json para las demás pruebas.
 *
 * Ninguna prueba debe cerrar sesión con estas sesiones: el logout revoca el token en el backend
 * y rompería las demás. Las pruebas de logout inician su propia sesión.
 */
for (const account of Object.values(ACCOUNTS)) {
    setup(`sesión de ${account.role}`, async ({ page }) => {
        await loginViaUi(page, account);
        await page.context().storageState({ path: storageStatePath(account.key) });
    });
}
