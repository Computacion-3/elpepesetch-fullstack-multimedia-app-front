/**
 * Thin HTTP client used ONLY by infrastructure datasources.
 * The base URL comes from API_URL (server-only) so datasources never hardcode hosts.
 * Methods accept an optional bearer `token`, sent as `Authorization: Bearer <token>` only when provided.
 */
export class HttpError extends Error {
    constructor(
        readonly status: number,
        message: string,
        readonly body?: unknown,
    ) {
        super(message);
        this.name = 'HttpError';
    }
}

export interface HttpClient {
    get<T>(path: string, token?: string): Promise<T>;
    post<T>(path: string, body: unknown, token?: string): Promise<T>;
    put<T>(path: string, body: unknown, token?: string): Promise<T>;
    patch<T>(path: string, body: unknown, token?: string): Promise<T>;
    delete<T>(path: string, token?: string): Promise<T>;
}

export function createFetchHttpClient(
    baseUrl: string = process.env.API_URL ?? '',
): HttpClient {
    const request = async <T>(method: string, path: string, body?: unknown, token?: string): Promise<T> => {
        const response = await fetch(`${baseUrl}${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: body === undefined ? undefined : JSON.stringify(body),
        });

        const text = await response.text();
        const data: unknown = text ? JSON.parse(text) : undefined;

        if (!response.ok) {
            const message =
                typeof data === 'object' && data !== null && 'message' in data
                    ? String((data as { message: unknown }).message)
                    : response.statusText;
            throw new HttpError(response.status, message, data);
        }

        return data as T;
    };

    return {
        get: (path, token) => request('GET', path, undefined, token),
        post: (path, body, token) => request('POST', path, body, token),
        put: (path, body, token) => request('PUT', path, body, token),
        patch: (path, body, token) => request('PATCH', path, body, token),
        delete: (path, token) => request('DELETE', path, undefined, token),
    };
}
