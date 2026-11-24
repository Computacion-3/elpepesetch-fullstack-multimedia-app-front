import { test as teardown } from '@playwright/test';
import { AdminApi } from './fixtures/api';
import { PREFIX } from './fixtures/test-data';

/**
 * Red de seguridad: borra lo que las pruebas hayan dejado (usuarios e2e_*, roles E2E_*, permisos e2e:*).
 * Cada prueba ya limpia lo suyo; esto cubre las que fallaron a mitad de camino.
 */
teardown('limpiar datos de E2E', async () => {
    const api = await AdminApi.create();
    try {
        const problems = await api.cleanup(PREFIX);
        if (problems.length > 0) console.warn(`Limpieza E2E incompleta:\n${problems.join('\n')}`);
    } finally {
        await api.dispose();
    }
});
