import { request, type APIRequestContext } from '@playwright/test';
import { ACCOUNTS, type Account } from './test-data';

export type ApiUser = {
    id: number;
    username: string;
    email: string;
    fullName?: string | null;
    isActive: boolean;
    role: { id: number; name: string };
};
export type ApiRole = { id: number; name: string; description: string };
export type ApiPermission = { id: number; name: string; description: string };
export type ApiGenre = { id: string; name: string; description?: string | null };
export type ApiReview = {
    id: string;
    title: string | null;
    content: string;
    isHidden: boolean;
    hiddenReason: string | null;
    user?: { id: number; username: string };
    mediaItem?: { id: string; title: string };
};
export type ApiReviewReport = {
    id: string;
    reason: 'SPOILER' | 'OFFENSIVE' | 'SPAM' | 'OTHER';
    comment: string | null;
    status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
    review?: ApiReview;
    reporter?: { id: number; username: string };
};
export type ApiPersonalStats = {
    entriesByType: Record<'GAME' | 'MOVIE' | 'BOOK', number>;
    entriesByStatus: Record<'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED', number>;
    topGenres: Array<{ id: string; name: string; count: number }>;
    completedByMonth: Array<{ month: string; count: number }>;
    averageRating: number;
};
export type ApiGlobalStats = {
    users: number;
    mediaItemsByType: Record<'GAME' | 'MOVIE' | 'BOOK', number>;
    libraryEntries: number;
    reviews: number;
};
type Paginated<T> = { data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } };

export type ApiLibraryEntry = {
    id: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
    progress: number;
    rating: number | null;
    isFavorite: boolean;
    notes: string | null;
    mediaItem: { id: string; title: string };
};

export function apiBaseUrl(): string {
    return process.env.E2E_API_URL ?? 'http://localhost:3002';
}

/** POST /auth/login directo al backend; devuelve el JWT. */
export async function apiLogin(ctx: APIRequestContext, account: Account): Promise<string> {
    const res = await ctx.post('/auth/login', { data: { email: account.email, password: account.password } });
    if (!res.ok()) throw new Error(`Login en el backend falló (${res.status()}): ${await res.text()}`);
    return ((await res.json()) as { accessToken: string }).accessToken;
}

/**
 * Cliente REST del backend con el token del administrador del seed.
 * Lo usan las pruebas para preparar datos (arrange) y limpiar (cleanup) sin pasar por la interfaz,
 * y para comprobar en el backend lo que la interfaz dice haber hecho.
 */
export class AdminApi {
    private constructor(
        private readonly ctx: APIRequestContext,
        private readonly token: string,
    ) {}

    static async create(): Promise<AdminApi> {
        const ctx = await request.newContext({ baseURL: apiBaseUrl() });
        try {
            return new AdminApi(ctx, await apiLogin(ctx, ACCOUNTS.admin));
        } catch (err) {
            await ctx.dispose();
            throw new Error(
                `No se pudo iniciar sesión como admin en ${apiBaseUrl()}. ¿Está corriendo el backend con el seed cargado?\n${String(err)}`,
            );
        }
    }

    async dispose(): Promise<void> {
        await this.ctx.dispose();
    }

    private async call<T>(method: string, path: string, data?: unknown): Promise<T> {
        const res = await this.ctx.fetch(path, {
            method,
            data,
            headers: { Authorization: `Bearer ${this.token}` },
        });
        const text = await res.text();
        if (!res.ok()) throw new Error(`${method} ${path} → ${res.status()} ${text}`);
        return (text ? JSON.parse(text) : undefined) as T;
    }

    // ---- usuarios
    createUser(body: {
        username: string;
        email: string;
        password: string;
        roleId: number;
        fullName?: string;
    }): Promise<ApiUser> {
        return this.call('POST', '/users', body);
    }

    searchUsers(q: string, page = 1, limit = 50): Promise<Paginated<ApiUser>> {
        const params = new URLSearchParams({ q, page: String(page), limit: String(limit) });
        return this.call('GET', `/users?${params.toString()}`);
    }

    async findUser(username: string): Promise<ApiUser | undefined> {
        const { data } = await this.searchUsers(username);
        return data.find((u) => u.username === username);
    }

    setUserStatus(id: number, isActive: boolean): Promise<ApiUser> {
        return this.call('PATCH', `/users/${id}/status`, { isActive });
    }

    async deleteUser(id: number): Promise<void> {
        await this.call('DELETE', `/users/${id}`);
    }

    /** Borra todos los usuarios cuyo username empiece por `prefix`. */
    async deleteUsersWithPrefix(prefix: string): Promise<void> {
        for (;;) {
            const { data } = await this.searchUsers(prefix);
            const matches = data.filter((u) => u.username.startsWith(prefix));
            if (matches.length === 0) return;
            for (const u of matches) await this.deleteUser(u.id);
        }
    }

    // ---- roles
    listRoles(): Promise<ApiRole[]> {
        return this.call('GET', '/roles');
    }

    async roleByName(name: string): Promise<ApiRole | undefined> {
        return (await this.listRoles()).find((r) => r.name === name);
    }

    async roleId(name: string): Promise<number> {
        const role = await this.roleByName(name);
        if (!role) throw new Error(`El rol ${name} no existe en el backend`);
        return role.id;
    }

    getRole(id: number): Promise<ApiRole & { rolePermissions?: { permission?: ApiPermission }[] }> {
        return this.call('GET', `/roles/${id}`);
    }

    async rolePermissionNames(id: number): Promise<string[]> {
        const role = await this.getRole(id);
        return (role.rolePermissions ?? []).flatMap((rp) => (rp.permission ? [rp.permission.name] : [])).sort();
    }

    createRole(name: string, description = 'Rol temporal de E2E'): Promise<ApiRole> {
        return this.call('POST', '/roles', { name, description });
    }

    async setRolePermissions(id: number, permissionIds: number[]): Promise<void> {
        await this.call('PUT', `/roles/${id}/permissions`, { permissionIds });
    }

    async deleteRole(id: number): Promise<void> {
        await this.call('DELETE', `/roles/${id}`);
    }

    // ---- permisos
    listPermissions(): Promise<ApiPermission[]> {
        return this.call('GET', '/permissions');
    }

    async permissionIds(names: string[]): Promise<number[]> {
        const all = await this.listPermissions();
        return names.map((name) => {
            const found = all.find((p) => p.name === name);
            if (!found) throw new Error(`El permiso ${name} no existe en el backend`);
            return found.id;
        });
    }

    async permissionByName(name: string): Promise<ApiPermission | undefined> {
        return (await this.listPermissions()).find((p) => p.name === name);
    }

    createPermission(name: string, description = 'Permiso temporal de E2E'): Promise<ApiPermission> {
        return this.call('POST', '/permissions', { name, description });
    }

    async deletePermission(id: number): Promise<void> {
        await this.call('DELETE', `/permissions/${id}`);
    }

    // ---- géneros (Persona 2; compatible con /genres y fallback /genre)
    async listGenres(): Promise<ApiGenre[]> {
        try {
            return await this.call('GET', '/genres');
        } catch {
            return this.call('GET', '/genre');
        }
    }

    async deleteGenre(id: string): Promise<void> {
        try {
            await this.call('DELETE', `/genres/${id}`);
        } catch {
            await this.call('DELETE', `/genre/${id}`);
        }
    }

    // ---- reseñas, reportes y estadísticas (Persona 4)
    listReviewsByMedia(mediaItemId: string, page = 1, limit = 50): Promise<Paginated<ApiReview>> {
        return this.call('GET', `/media/${mediaItemId}/reviews?page=${page}&limit=${limit}`);
    }

    async deleteReview(id: string): Promise<void> {
        await this.call('DELETE', `/reviews/${id}`);
    }

    listReports(status?: 'OPEN' | 'RESOLVED' | 'DISMISSED', page = 1, limit = 50): Promise<Paginated<ApiReviewReport>> {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) params.set('status', status);
        return this.call('GET', `/reports?${params.toString()}`);
    }

    resolveReport(id: string, body: { action: 'HIDE' | 'DISMISS'; reason?: string }): Promise<ApiReviewReport> {
        return this.call('PATCH', `/reports/${id}/resolve`, body);
    }

    getGlobalStats(): Promise<ApiGlobalStats> {
        return this.call('GET', '/stats/global');
    }

    // ---- limpieza
    /** Usuarios, luego roles (sin permisos) y por último permisos con el prefijo dado. Mejor esfuerzo. */
    async cleanup(prefix: { user: string; role: string; permission: string }): Promise<string[]> {
        const problems: string[] = [];
        const attempt = async (label: string, task: () => Promise<void>) => {
            try {
                await task();
            } catch (err) {
                problems.push(`${label}: ${String(err)}`);
            }
        };
        await attempt('usuarios', () => this.deleteUsersWithPrefix(prefix.user));
        for (const role of (await this.listRoles()).filter((r) => r.name.startsWith(prefix.role))) {
            await attempt(`rol ${role.name}`, async () => {
                await this.setRolePermissions(role.id, []);
                await this.deleteRole(role.id);
            });
        }
        for (const p of (await this.listPermissions()).filter((x) => x.name.startsWith(prefix.permission))) {
            await attempt(`permiso ${p.name}`, () => this.deletePermission(p.id));
        }
        for (const genre of (await this.listGenres()).filter((g) => g.name.startsWith(prefix.user))) {
            await attempt(`género ${genre.name}`, () => this.deleteGenre(genre.id));
        }
        return problems;
    }
}

/** GET /auth/me con un token cualquiera; devuelve el código HTTP. */
export async function authMeStatus(token: string): Promise<number> {
    const ctx = await request.newContext({ baseURL: apiBaseUrl() });
    try {
        const res = await ctx.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        return res.status();
    } finally {
        await ctx.dispose();
    }
}

/** Ejecuta una petición REST autenticada como la cuenta indicada (útil para preparar reseñas/reportes ajenos). */
async function callAsAccount<T>(account: Account, method: string, path: string, data?: unknown): Promise<T> {
    const ctx = await request.newContext({ baseURL: apiBaseUrl() });
    try {
        const token = await apiLogin(ctx, account);
        const res = await ctx.fetch(path, {
            method,
            data,
            headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();
        if (!res.ok()) throw new Error(`${method} ${path} → ${res.status()} ${text}`);
        return (text ? JSON.parse(text) : undefined) as T;
    } finally {
        await ctx.dispose();
    }
}

/** Agrega un elemento a la biblioteca de la cuenta indicada para habilitar la creación de reseñas. */
export function addLibraryEntryAs(
    account: Account,
    mediaItemId: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED' = 'IN_PROGRESS',
): Promise<{ id: string }> {
    return callAsAccount(account, 'POST', '/library', { mediaItemId, status });
}

/** Crea una reseña directamente en el backend autenticado como la cuenta indicada. */
export function createReviewAs(
    account: Account,
    mediaItemId: string,
    body: { title?: string; content: string },
): Promise<ApiReview> {
    return callAsAccount(account, 'POST', `/media/${mediaItemId}/reviews`, body);
}

/** Crea un reporte sobre una reseña directamente en el backend autenticado como la cuenta indicada. */
export function createReportAs(
    account: Account,
    reviewId: string,
    body: { reason: 'SPOILER' | 'OFFENSIVE' | 'SPAM' | 'OTHER'; comment?: string },
): Promise<ApiReviewReport> {
    return callAsAccount(account, 'POST', `/reviews/${reviewId}/report`, body);
}

/** Consulta GET /stats/me autenticado como la cuenta indicada para contrastar los KPIs en UI. */
export function getPersonalStatsAs(account: Account): Promise<ApiPersonalStats> {
    return callAsAccount(account, 'GET', '/stats/me');
}

/** Consulta la biblioteca de una cuenta para verificar lo persistido después del flujo UI. */
export function getLibraryAs(account: Account): Promise<Paginated<ApiLibraryEntry>> {
    return callAsAccount(account, 'GET', '/library?page=1&limit=50');
}
