# Informe de pruebas E2E con Playwright

**Fecha de ejecución:** 26 de noviembre de 2026  
**Entorno:** frontend local (Next.js dev), backend NestJS local con base de datos seed, Chromium  
**Resultado global:** suites completas ejecutadas en REST y GraphQL; ambas terminaron con 60 aprobadas y 13 fallidas. Los flujos de Library, User Lists, Activity Logs y responsive ejecutados de forma enfocada aprobaron en ambos datasources.

## Resumen ejecutivo

Se implementaron escenarios E2E para User Lists, Activity Logs en tiempo real y responsive. Se reutilizaron Playwright, fixtures de autenticación, cliente API de prueba, usuarios del seed y limpieza de E2E ya presentes. Las pruebas recorren navegador, interfaz, backend y persistencia; las pruebas de Socket.IO crean actividad mediante una operación real de Library o User Lists y esperan el evento del servidor.

Las ejecuciones enfocadas de los tres módulos tuvieron 13/13 tests aprobados en REST y 13/13 en GraphQL (incluyen tres tests de setup de sesión y uno de cleanup; nueve tests funcionales del alcance). La ejecución completa encontró además 13 fallas iguales por datasource en pruebas preexistentes de Auth, Reviews/Reports y autorización/navegación. No se ocultaron ni se desactivaron.

Durante responsive se detectó una tarjeta pública que imponía un ancho mínimo intrínseco al grid: medía 404 px con 362 px disponibles en viewport de 390 px. Se corrigió con `min-w-0` en la tarjeta. El escenario responsive pasó después en REST y GraphQL.

## Configuración

- `@playwright/test`: declarado `^1.63.0`; resuelto por `package-lock.json` a **1.65.1**.
- Next.js: **16.4.6**.
- Navegador: Chromium, proyecto Playwright `chromium-rest` o `chromium-graphql`.
- Configuración: [playwright.config.ts](../playwright.config.ts), `testDir: e2e`, trace y screenshot en fallo, video retain-on-failure, workers seriales en estas ejecuciones.
- Node usado: **20.13.1** (Node incluido con Visual Studio). Para ejecutarlo en esta máquina fue necesario usar la ruta completa a `node.exe`; el wrapper NVM del `PATH` no tenía versión activa.
- Backend: `E2E_API_URL` / `API_URL`, con valor local por defecto `http://localhost:3002`; pruebas reales contra backend local y datos seed. El frontend usa los puertos configurados en Playwright (3100 REST y 3101 GraphQL).
- Autenticación: `e2e/auth.setup.ts` inicia sesión mediante la UI para las cuentas seed ADMIN, MODERATOR y USER y guarda estados en `e2e/.auth/` (ignorado por Git). Los escenarios que necesitan aislamiento crean usuarios con prefijo E2E y limpian al final.
- No se usaron credenciales de producción. No se documentan contraseñas ni tokens.

### Scripts disponibles

```powershell
npm run test:e2e
npm run test:e2e:rest
npm run test:e2e:graphql
npm run test:e2e:library
npm run test:e2e:user-lists
npm run test:e2e:activity
npm run test:e2e:report
```

Los runners `test:e2e:rest` y `test:e2e:graphql` fijan el datasource de forma multiplataforma usando `e2e/run.mjs`. Para filtrar rutas junto con un datasource:

```powershell
node e2e/run.mjs rest e2e/library e2e/user-lists e2e/activity e2e/responsive --workers=1
node e2e/run.mjs graphql e2e/library e2e/user-lists e2e/activity e2e/responsive --workers=1
```

Requisitos previos: backend local levantado, base de datos con seed y Chromium instalado (`npx playwright install chromium`). Para depurar: `npx playwright test e2e/user-lists --debug`; para abrir el reporte HTML: `npm run test:e2e:report`.

## Inventario del alcance solicitado

Los IDs agrupan el flujo de cada test E2E real. El resultado por datasource corresponde a la ejecución enfocada serial de los tres módulos más responsive. Los 13 tests totales incluyen setup y cleanup de autenticación.

### Library

| ID | Escenario implementado | Tipo | REST | GraphQL |
|---|---|---|---|---|
| LIB-01 | Ruta protegida redirige a login sin sesión | E2E | Aprobado | Aprobado |
| LIB-02 | Biblioteca vacía; agrega medio, evita duplicado en el selector, busca, edita estado/progreso/rating/favorito/notas y elimina; comprueba persistencia | E2E | Aprobado | Aprobado |

### User Lists

| ID | Escenario implementado | Tipo | REST | GraphQL |
|---|---|---|---|---|
| ULS-01 | `/lists` y `/community/lists` requieren sesión | E2E | Aprobado | Aprobado |
| ULS-02 | Usuario aislado crea lista privada, edita nombre/descripción/visibilidad, consulta detalle, agrega/quita medio aprobado, evita duplicado y elimina; verifica persistencia | E2E | Aprobado | Aprobado |
| ULS-03 | Lista pública ajena visible con propietario; UI oculta acciones y API rechaza PATCH ajeno (403) y GET de lista privada ajena (404) | E2E + autorización | Aprobado | Aprobado |

### Activity Logs

| ID | Escenario implementado | Tipo | REST | GraphQL |
|---|---|---|---|---|
| ACT-01 | Usuario aislado ve historial vacío y la actividad persistida tras agregar un medio; comprueba que REST no incluya contexto de medio y GraphQL sí | E2E | Aprobado | Aprobado |
| ACT-02 | Evento de actividad creado por una operación real de Library llega por Socket.IO y actualiza la vista | E2E + Socket.IO | Aprobado | Aprobado |
| ACT-03 | Crear lista desde la interfaz genera `activity.created`; se recibe el evento y Activity Logs refleja la actividad | E2E + Socket.IO | Aprobado | Aprobado |

### Responsive

| ID | Escenario implementado | Viewports | REST | GraphQL |
|---|---|---|---|---|
| RSP-01 | Library, listas personales, explorar listas, formulario de lista y Activity Logs; comprueba overflow horizontal y controles principales | 768×1024 y 390×844 | Aprobado | Aprobado |

## Cobertura funcional

### Library

- **Cubierto:** acceso con/sin sesión; empty state; consulta; agregado; prevención de duplicado en selector; búsqueda; cambio de estado, progreso, rating, favorito y notas; eliminación; persistencia REST/GraphQL.
- **Parcial:** el flujo cubre una transición a `IN_PROGRESS`, progreso positivo y rating válido. No recorre todas las transiciones, límites por tipo de medio, ratings inválidos ni paginación/filtros combinados.
- **No cubierto:** matriz exhaustiva de reglas de negocio y errores HTTP de cada mutación.

### User Lists

- **Cubierto:** protección de rutas, CRUD, visibilidad privada/pública, detalle, medio aprobado, prevención de duplicado, quitar medio, listas ajenas, propietario y autorización final del backend (403/404), en ambos datasources.
- **Parcial:** prueba el límite del nombre requerido por el formulario vacío, pero no recorre nombre de 80 caracteres, descripción de 255, conflicto de nombre duplicado, paginación pública ni todos los estados de error.
- **No cubierto:** matriz completa de validaciones y errores de backend en todos los formularios.

### Activity Logs

- **Cubierto:** estado vacío, consulta de actividad persistida, diferencia REST/GraphQL de `mediaItem`, generación real de actividad por Library y User Lists, recepción de `activity.created` y actualización de vista en tiempo real.
- **Parcial:** la integración GraphQL verifica actividad con medio relacionado; REST verifica ausencia del medio. La suite actual no genera todos los tipos de actividad ni pagina un historial con más de una página.
- **No cubierto:** metadata incompleta/desconocida, reconexión real tras desconexión prolongada, duplicados/eventos repetidos y limpieza de socket al cerrar sesión.

## Resultados de ejecución

| Ejecución | Tests descubiertos | Aprobados | Fallidos | Omitidos | Duración |
|---|---:|---:|---:|---:|---:|
| Alcance Library + User Lists + Activity + responsive, REST | 13 | 13 | 0 | 0 | 52.1 s |
| Alcance Library + User Lists + Activity + responsive, GraphQL | 13 | 13 | 0 | 0 | 55.2 s |
| Suite completa, REST | 73 | 60 | 13 | 0 | 6.1 min |
| Suite completa, GraphQL | 73 | 60 | 13 | 0 | 6.3 min |
| Pruebas unitarias compiladas | 55 | 55 | 0 | 0 | 1.1 s |

Playwright empleó Chromium en todas las ejecuciones. La suite completa no está verde. Las 13 fallas completas fueron las mismas en REST y GraphQL; ningún test de los tres módulos objetivo falló en su ejecución enfocada.

### Fallas de la suite completa

Se conservaron las fallas y sus traces en `test-results/` (directorio ignorado por Git; una nueva ejecución lo reemplaza). Clasificación basada en mensajes de error observados:

| Grupo de fallas | Tests | Evidencia / clasificación | Estado |
|---|---:|---|---|
| Auth: login posterior a logout y registro | 2 | El helper esperaba URL `/`, la app redirigió a `/login?reason=session-ended`; investigar sesión/cookie o secuencia del test. No se cambió Auth. | Pendiente |
| Reports | 4 | Esperas de visibilidad/texto agotaron 15 s en moderación/reseñas; causa raíz no confirmada, requiere revisar responses y traces del servicio Reports. | Pendiente |
| Reviews | 3 | Un test falla por selector estricto: `getByLabel('Reseña')` encuentra cuatro controles; otros dos agotan espera de visibilidad. Probable selector/test desactualizado y flujo por investigar. | Pendiente |
| Navegación administrativa | 3 | Dos tests esperan que no exista el landmark “Administración”; otro espera enlaces exactos sin “Catálogo”. La UI muestra “Catálogo”; expectativa posiblemente antigua. | Pendiente |
| Server authorization | 1 | El test esperaba solo el enlace “Usuarios”, pero encontró “Catálogo” y “Usuarios”. Expectativa posiblemente antigua; comportamiento de permisos se debe revisar con el equipo dueño. | Pendiente |

No se modificó backend ni se eliminaron assertions. Para los errores cuyo origen no queda probado por la evidencia disponible, se registra explícitamente como pendiente en vez de atribuirlos al backend.

## Problemas encontrados y solución aplicada

| ID | Módulo | Descripción y causa | Clasificación | Solución | Estado |
|---|---|---|---|---|---|
| RSP-01 | User Lists / responsive | En viewport móvil de 390 px, una tarjeta del grid medía 404 px con 362 px disponibles; el elemento `<article>` conservaba el tamaño mínimo intrínseco como grid item. | Frontend | Se añadió `min-w-0` al contenedor `<article>` compartido en `UserListCard`. | Corregido; responsive pasó para ambos datasources. |
| UL-01 | REST mapper | El backend REST puede devolver medios de lista sin `genres`; el mapper esperaba el campo y podía fallar al mapear. | Integración frontend/backend | Normalizar géneros ausentes a arreglo vacío y agregar test unitario de mapper. | Corregido; unit tests y E2E REST/GraphQL pasan. |
| ACT-01 | Activity Logs realtime | El evento de socket llegaba, pero no propagaba una recarga del historial a la vista/estado. | Frontend | Conectar `activity.created` al estado de realtime y refrescar la primera página de Activity Logs. | Corregido; flujo real Socket.IO pasó en REST y GraphQL. |

## Archivos y evidencias

- Nuevas pruebas: `e2e/user-lists/user-lists.spec.ts`, `e2e/responsive/responsive.spec.ts`.
- Pruebas ampliadas: `e2e/activity/activity.spec.ts`; helpers de datos/API en `e2e/fixtures/api.ts`.
- Scripts: `package.json` y runner multiplataforma `e2e/run.mjs` (ya existente).
- Correcciones de integración: `src/features/user-lists/infrastructure/dtos/user-list.dto.ts`, mapper y test de mapper; `src/features/activity-logs/presentation/components/ActivityView.tsx`; `src/features/realtime/presentation/components/RealtimeSessionManager.tsx`.
- Corrección responsive: `src/features/user-lists/presentation/components/UserListCard.tsx`.
- Next dev actualizó el bloque generado `nextjs-agent-feedback` en `AGENTS.md`; se conservó según las instrucciones del proyecto.
- Evidencias Playwright: `test-results/` (screenshot, video, `error-context.md`, `trace.zip` para fallos); reporte HTML en `playwright-report/`.
- Resultado de tests unitarios: 55 aprobados, 0 fallidos. El compilador `tsc -p tsconfig.unit.json` terminó correctamente.

## Limitaciones y pendientes

- La suite global mantiene 13 fallas preexistentes fuera del alcance funcional solicitado; revisar los contextos y traces indicados antes de declarar CI global verde.
- No se añadieron casos específicos de reconnect/disconnect de Socket.IO ni pruebas para todas las variantes de metadata.
- La cobertura del catálogo de datos depende del seed local del backend.
- Las pruebas son Chromium-only; no se verificaron Firefox ni WebKit.
- Build de producción ejecutado con Next.js 16.4.6: compilación, TypeScript y generación estática completaron correctamente. No se probó contra despliegues remotos.
- Al ejecutar el script de tests unitarios desde PowerShell con Node 20.13.1, Node no expandió el glob del script `node --test "temp/unit-tests/src/**/*.test.js"`; la compilación TypeScript sí pasó y las 55 rutas compiladas se ejecutaron explícitamente con `node --test`.

## Cómo repetir

Requisitos: base local del backend levantada con seed, credenciales seed locales configuradas según `e2e/fixtures/test-data.ts` y Chromium instalado.

```powershell
# Módulos objetivo en REST o GraphQL
node e2e/run.mjs rest e2e/library e2e/user-lists e2e/activity e2e/responsive --workers=1
node e2e/run.mjs graphql e2e/library e2e/user-lists e2e/activity e2e/responsive --workers=1

# Suite completa (rest es el datasource por defecto)
npm run test:e2e:rest
npm run test:e2e:graphql

# Módulos separados, responsive y reporte
npm run test:e2e:library
npm run test:e2e:user-lists
npm run test:e2e:activity
npx playwright test e2e/responsive --workers=1
npm run test:e2e:report

# Una prueba concreta con inspector
npx playwright test e2e/user-lists/user-lists.spec.ts --debug
```
