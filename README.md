# Elpepesetch — Frontend Multimedia (Next.js + Clean Architecture)

Aplicación web desarrollada con **Next.js (App Router)**, **TypeScript**, **Tailwind CSS + daisyUI** y **Redux Toolkit**, estructurada bajo **Clean Architecture Feature-First** para consumir los servicios REST/GraphQL del backend en NestJS.

---

## Arquitectura del proyecto

Cada módulo de negocio vive en `src/features/<feature>/` y respeta estrictamente la regla de dependencias hacia adentro (auditada por `npm run lint:clean` mediante `eslint-plugin-boundaries`):

```text
src/features/<feature>/
├── domain/          # Entidades puras, invariantes, puertos (repositorios) y casos de uso
├── infrastructure/  # DTOs de red, datasources (REST/GraphQL), mappers y ReposImpl
├── di/              # Composition Root (instancia datasources, repositorios y casos de uso)
└── presentation/    # ViewModels, Server Actions, Redux slice/selectors, hook fachada y UI
```

### Regla de dependencias y estado global

- **`domain/`**: TypeScript puro sin dependencias de React, Next.js, Redux ni SDKs HTTP.
- **`infrastructure/`**: implementa los puertos de `domain/` y traduce errores HTTP a `DomainError` (`toDomainError()`).
- **`presentation/`**: los componentes UI consumen únicamente su **hook fachada** (`useAuth`, `useUsers`, `useReviews`, `useReports`, `useStats`, `useLibrary`), nunca `react-redux` ni infraestructura directamente.
- **Global Store (`src/store/store.ts`)**: combina todos los slices (`authSlice`, `usersSlice`, `rolesSlice`, `permissionsSlice`, `librarySlice`, `reviewsSlice`, `reportsSlice`, `statsSlice`) e inyecta las dependencias (`Server Actions` / contenedores) vía `thunk extraArgument`. Al cerrar sesión (`logoutMutation.fulfilled`), `rootReducer` reinicia todo el store.

---

## Módulos y rutas implementadas

| Módulo | Rutas | Permisos / Acceso | Responsabilidad principal |
|---|---|---|---|
| `auth` | `/login`, `/register`, `/` | Público (`/login`, `/register`) y autenticado | Inicio de sesión JWT en cookie `httpOnly`, registro, cierre de sesión y ticket WebSocket |
| `users` | `/users`, `/roles`, `/permissions` | `users:manage`, `roles:manage`, `permissions:manage` | Administración de usuarios, roles y permisos (authorities) |
| `library` | `/library` | Autenticado | Gestión de biblioteca personal (estados, progreso, calificaciones, favoritos) |
| `reviews` | `/reviews` | Autenticado (`reviews:create`, `reviews:update`, `reviews:delete`) | Consulta paginada por elemento multimedia, creación, edición y eliminación de reseñas |
| `reports` | `/reports` (+ modal en `/reviews`) | `reports:create` (reportar), `reviews:moderate` (moderar) | Reporte de reseñas ajenas y bandeja de moderación (`OPEN`, `RESOLVED`, `DISMISSED`) con `HIDE` / `DISMISS` |
| `stats` | `/stats` | Autenticado (`stats:read_global` para bloque global) | Estadísticas personales (tipos, estados, top 5 géneros, 12 meses, promedio) y métricas globales |

---

## Variables de entorno (`.env.example`)

Copiar `.env.example` a `.env.local` antes de iniciar en local:

```env
# URL base de la API backend (solo servidor, usada en Server Actions y DI containers)
API_URL=http://localhost:3002
# Fuente de datos del módulo dual: rest | graphql
NEXT_PUBLIC_DATA_SOURCE=rest
```

> `API_URL` es consumida únicamente desde código `server-only` (`src/shared/infrastructure/http-client.ts` y `di/`), evitando exponer credenciales o rutas internas al navegador.

---

## Arranque local y verificación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```
2. **Levantar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Disponible en `http://localhost:3000`.
3. **Auditoría Clean Architecture, lint y compilación:**
   ```bash
   npm run lint:clean   # Verifica reglas de límites entre capas y auditoría feature-first
   npm run lint         # ESLint estándar de Next.js
   npm run build        # Compilación de producción (TypeScript + App Router)
   ```

---

## Pruebas E2E (Playwright)

Las pruebas automatizadas se ejecutan contra el **backend NestJS real** con `db/seed.sql` cargado (en lugar de Cypress, el equipo adoptó Playwright; ver detalle en [`e2e/README.md`](e2e/README.md)):

```bash
npx playwright install chromium   # Solo la primera vez
npm run test:e2e                  # Suite completa con NEXT_PUBLIC_DATA_SOURCE=rest
npm run test:e2e:graphql          # Misma suite con NEXT_PUBLIC_DATA_SOURCE=graphql
npm run test:e2e:ui               # Modo interactivo
npm run test:e2e:report           # Ver reporte HTML de la última ejecución
```

---

## Comparativo técnico: REST vs GraphQL

El módulo dual de autenticación (`src/features/auth/`) demuestra la abstracción de fuentes de datos bajo un mismo contrato de dominio (`AuthRepository`), seleccionando `AuthRestDatasource` o `AuthGraphqlDatasource` en `src/features/auth/di/auth.container.ts` según `NEXT_PUBLIC_DATA_SOURCE`:

| Criterio | REST (`rest`) | GraphQL (`graphql`) |
|---|---|---|
| **Endpoints** | Múltiples recursos (`/auth/login`, `/auth/me`, `/media/:id/reviews`, `/reports`, `/stats/me`) | Punto de entrada único (`/graphql`) con queries y mutations tipadas |
| **Estructura de payload** | DTOs fijos definidos por cada endpoint del controlador NestJS | Selección declarativa de campos en la consulta, reduciendo over-fetching |
| **Manejo de errores** | Códigos HTTP semánticos (`400`, `401`, `403`, `404`, `409`) traducidos por `toDomainError()` | Respuesta `200 OK` con arreglo `errors` y extensiones de código mapeadas en el datasource |
| **Impacto en Dominio / UI** | **Cero** | **Cero**: entidades, casos de uso, slices de Redux, hooks fachada y componentes permanecen idénticos |

---

## Guía de despliegue en la nube (Vercel + Render)

### 1. Backend en Render
- Servicio desplegado: `https://elpepesetch-fullstack-multimedia-app-back.onrender.com` (documentación OpenAPI en `/api/docs`).
- Base de datos PostgreSQL administrada por Render (`DB_SSL=false` en red interna, `synchronize: true` y seed inicial `db/seed.sql`).
- Verificar que variables como `JWT_SECRET`, `JWT_EXPIRES_IN`, `POSTGRES_*` y `PORT` estén configuradas en Render.

### 2. Frontend en Vercel
1. Conectar el repositorio `elpepesetch-fullstack-multimedia-app-front` en [Vercel](https://vercel.com/).
2. Configurar las variables de entorno del proyecto en Vercel:
   - `API_URL=https://elpepesetch-fullstack-multimedia-app-back.onrender.com`
   - `NEXT_PUBLIC_DATA_SOURCE=rest` (o `graphql` según el entorno deseado)
3. Desplegar con el preset estándar de **Next.js** (`npm run build`).
4. **Sin problemas de CORS:** todas las llamadas al backend desde `reviews`, `reports`, `stats`, `auth` y `users` pasan por **Server Actions** (`'use server'`) usando `API_URL` en el servidor de Next.js, por lo que el navegador nunca realiza peticiones cross-origin directas contra el backend REST.
5. **Verificación post-despliegue (E2E remoto):**
   ```bash
   E2E_BASE_URL=https://<tu-app>.vercel.app E2E_API_URL=https://elpepesetch-fullstack-multimedia-app-back.onrender.com npx playwright test
   ```
