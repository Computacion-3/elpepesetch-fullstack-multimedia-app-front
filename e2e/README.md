# Pruebas E2E (Playwright)

Suite de extremo a extremo del frontend. Corre en un Chrome real contra el **backend NestJS real** con el seed (`db/seed.sql`), así que cubre el camino completo: interfaz → Redux → Server Actions → backend → base de datos.

> El enunciado del taller pide Cypress; el equipo eligió **Playwright**. Es una desviación registrada en el plan de la Parte 1 y está pendiente de confirmar con el profesor.

## Requisitos

1. Backend corriendo con el seed cargado (ver el README del repo del back):
   ```bash
   docker compose up -d db
   npm run start:dev           # API en http://localhost:3002
   # seed (Windows)
   powershell -ExecutionPolicy Bypass -File .\scripts\seed-db.ps1
   ```
2. En este repo, una sola vez:
   ```bash
   npm install
   npx playwright install chromium
   ```
3. **Cerrar `npm run dev`** si está abierto: Playwright levanta su propio `next dev` (puerto 3100 para REST y 3101 para GraphQL) y Next no permite dos `next dev` sobre la misma carpeta `.next`.

La URL del backend se toma de `E2E_API_URL`, si no de `API_URL` en `.env.local`, y si no `http://localhost:3002`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run test:e2e` | Toda la suite con `NEXT_PUBLIC_DATA_SOURCE=rest` |
| `npm run test:e2e:graphql` | La misma suite con `NEXT_PUBLIC_DATA_SOURCE=graphql` (módulo dual de auth) |
| `npm run test:e2e:ui` | Modo interactivo de Playwright (ver cada paso, repetir una prueba) |
| `npm run test:e2e:report` | Abre el reporte HTML de la última ejecución |
| `npx playwright test e2e/auth` | Solo una carpeta (o un archivo, o `-g "AC4"` para filtrar por nombre) |

Contra un despliegue (Vercel + Render): `E2E_BASE_URL=https://<front> E2E_API_URL=https://<back> npx playwright test`. En ese modo no se levanta servidor y las comprobaciones del store de Redux se marcan como *skipped* (el build de producción no expone el store).

## Cómo está organizada

```
e2e/
  auth.setup.ts          proyecto "setup": inicia sesión por la UI como ADMIN, MODERATOR y USER y guarda e2e/.auth/<rol>.json
  global.teardown.ts     proyecto "cleanup": borra lo que quede con prefijo e2e_ / E2E_ / e2e:
  fixtures/
    test.ts              `test` con el fixture `api` + helpers (loginViaUi, waitForHydration, alertWithText, reduxState…)
    api.ts               cliente REST del backend como admin: prepara datos y verifica en el backend lo que dice la UI
    test-data.ts         cuentas del seed, prefijos, generadores de datos únicos y mensajes esperados
  auth/                  Persona 1 · autenticación y sesión JWT
  users/                 Persona 1 · autorización, usuarios, roles y permisos
  run.mjs                ejecuta la suite con una fuente de datos (multiplataforma)
```

Principios:

- **Datos aislados:** cada prueba crea sus propios usuarios/roles/permisos por API con nombres únicos y los borra al terminar. Se puede correr muchas veces sobre la misma base, también en paralelo.
- **Se verifica en dos lados:** lo que la interfaz muestra y lo que quedó en el backend (por ejemplo, tras cambiar un rol se consulta `GET /users`).
- **Sesiones reutilizadas solo para leer:** ninguna prueba cierra sesión con las sesiones de `auth.setup.ts` (el logout revoca el token). Las de logout inician su propia sesión.
- **Hidratación:** antes de escribir en un formulario se espera a que React lo hidrate (`waitForHydration`), si no React vacía los inputs controlados.
- **Avisos:** se buscan por texto (`alertWithText`) porque Next monta su propio `role="alert"` (anunciador de rutas).

## Store de Redux en las pruebas

`playwright.config.ts` levanta el front con `NEXT_PUBLIC_E2E=true`. Solo con esa variable, `src/store/StoreProvider.tsx` expone el store en `window.__APP_STORE__` para comprobar que el logout lo deja vacío. En cualquier otro build no hace nada.

## Cobertura · Persona 1

| Archivo | Criterios |
|---|---|
| `auth/login.spec.ts` | AC1 login + cookie `session` httpOnly/Lax · AC2 error del backend sin cookie · AC5 token invisible para JS, recarga con Redux hidratado |
| `auth/register.spec.ts` | AC3 registro con rol USER y aviso · reglas de dominio (contraseña, usuario) · 409 correo en uso |
| `auth/logout.spec.ts` | AC4 borra cookie y redirige · token revocado en el backend · reset de **todo** el store (AC11 de users) · el siguiente usuario no ve nada del anterior |
| `auth/route-protection.spec.ts` | AC6 rutas protegidas sin sesión, con cookie basura, JWT vencido y JWT con firma falsa |
| `users/access-control.spec.ts` | AC1 403 "Acceso denegado" para USER y MODERATOR · AC9 navegación según permisos |
| `users/server-authorization.spec.ts` | Authorities: rol con solo `users:manage` · AC10 la Server Action revalida el permiso · los permisos nuevos aplican en la siguiente navegación |
| `users/users-admin.spec.ts` | AC2 lista, búsqueda, filtros por rol y estado, paginación · AC3 crear (dominio + 409) · AC4 editar · AC5 rol, activar/desactivar, fila propia · AC6 eliminar con confirmación |
| `users/roles-admin.spec.ts` | AC7 crear, 409, editar, asignar/reemplazar permisos, eliminar, 409 con usuarios asignados |
| `users/permissions-admin.spec.ts` | AC8 crear, 409, editar, eliminar |

Para agregar las pruebas de otro módulo: crear `e2e/<modulo>/*.spec.ts`, importar `test`/`expect` de `../fixtures/test` y usar `test.use({ storageState: storageStatePath('user') })` para entrar con una sesión del seed.

## Limitaciones conocidas

- "Acceso denegado" responde HTTP 200 (no 403) por el streaming de `cacheComponents`; por eso las pruebas comprueban el contenido y no el código HTTP.
- El tiempo real (WebSockets) es de la Persona 3; sus pruebas van en `e2e/<su-modulo>/`.
