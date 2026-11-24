# Autenticación del WebSocket (contrato para el módulo de tiempo real)

El taller pide autenticar el handshake del socket con un JWT. El JWT de sesión vive en una cookie **httpOnly**: el navegador no puede leerlo, y no debe poder hacerlo. Por eso el socket se abre con un **ticket**:

| | Token de sesión | Ticket del socket |
|---|---|---|
| Dónde vive | Cookie httpOnly (solo servidor) | Memoria del cliente, unos segundos |
| Vigencia | `JWT_EXPIRES_IN` (1 h) | 60 s |
| Usos | Todas las peticiones HTTP | **Un** handshake (luego se consume) |
| Sirve como Bearer en HTTP | Sí | No (401) |

```
navegador                    Next (servidor)                     NestJS
   │ extra.auth.getSocketToken()   │                                 │
   │ ─────────────────────────────▶│ POST /auth/socket-token         │
   │                               │ Authorization: Bearer <sesión> ─▶│ firma ticket (typ=socket, aud=socket, 60 s)
   │◀──────────── { token } ───────│◀────────────────────────────────│
   │ io(url, { auth: { token } }) ────────────────────────────────────▶│ createSocketAuthMiddleware: verifica,
   │◀────────────────────────────── connect / connect_error ──────────│ consume el jti, lee rol y permisos
```

## Lo que ya existe (Persona 1)

**Frontend**
- Server Action `getSocketTokenAction()` en `src/features/auth/presentation/actions/auth.actions.ts`. Devuelve `ActionResult<SocketTicket>` con `{ token, expiresInSeconds }`.
- Está inyectada en el store como `extra.auth.getSocketToken` (`src/store/store.ts`). **No la importes directamente** desde hooks o componentes (lo prohíbe `lint:clean`): úsala desde un thunk.
- Funciona con `NEXT_PUBLIC_DATA_SOURCE=rest` y `graphql` (mutation `socketToken`).

**Backend**
- `POST /auth/socket-token` y mutation `socketToken`.
- `createSocketAuthMiddleware(authService)`, `getSocketUser(socket)` y `userRoom(id)` en `src/auth/socket/socket-auth.middleware.ts`. `AuthModule` exporta `AuthService`.
- Ejemplo funcionando: `test/socket-token.e2e-spec.ts` (gateway de prueba + handshake real).

## Cómo usarlo (Persona 3)

**1. Gateway (backend).** Instalar `@nestjs/websockets @nestjs/platform-socket.io socket.io`. El módulo del gateway importa `AuthModule`:

```ts
@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL, credentials: true } })
export class RealtimeGateway implements OnGatewayInit {
    @WebSocketServer() server: Server;
    constructor(private readonly authService: AuthService) {}

    afterInit(server: Server) {
        server.use(createSocketAuthMiddleware(this.authService));
    }

    // En cualquier handler: const user = getSocketUser(client)  → { id, username, role, permissions }
    // Emitir solo a un usuario: this.server.to(userRoom(userId)).emit('evento', datos)
}
```

**2. Datasource del socket (frontend, `infrastructure/datasources/`).** Recibe el *proveedor* del ticket, no el ticket: así cada reconexión pide uno nuevo (el anterior ya se consumió).

```ts
export class SocketIoDatasource implements RealtimeDatasource {
    private socket?: Socket;

    connect(url: string, getTicket: () => Promise<string | null>): void {
        this.socket = io(url, {
            // socket.io-client llama a esta función en CADA intento de conexión
            auth: (cb) => {
                getTicket().then((token) => cb(token ? { token } : {}));
            },
        });
    }
}
```

**3. Thunk (frontend, `presentation/store/`).** El único sitio que toca `extra.auth`:

```ts
export const connectRealtime = createAppThunk('realtime/connect', async (_, { extra, dispatch }) => {
    extra.realtime.connect(process.env.NEXT_PUBLIC_SOCKET_URL!, async () => {
        const result = await extra.auth.getSocketToken();
        return result.ok ? result.data.token : null;
    });
    // extra.realtime.on('evento', (payload) => dispatch(eventoRecibido(payload)));
});
```

Tipar el thunk con `extra: { auth: AuthDependencies; realtime: ... }` (importa `AuthDependencies` como `import type`).

**4. Variables.** Front: `NEXT_PUBLIC_SOCKET_URL` (URL pública del backend). Back: `FRONTEND_URL` para el CORS del gateway. El navegador se conecta directo al backend, a diferencia de las peticiones HTTP, que pasan por el servidor de Next.

## Errores que verá el cliente (`connect_error` → `err.message`)

| Mensaje | Causa |
|---|---|
| `Falta el ticket del socket` | `auth` vacío (no hay sesión o falló la action) |
| `El ticket del socket es inválido o expiró` | Firma mala, más de 60 s, o se mandó el token de sesión |
| `El ticket del socket ya fue usado` | Se reutilizó un ticket (pedir uno nuevo) |
| `La cuenta está desactivada` | El admin desactivó la cuenta |
