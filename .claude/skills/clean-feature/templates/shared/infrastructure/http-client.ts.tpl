/**
 * Thin HTTP client used ONLY by infrastructure datasources.
 * The base URL comes from NEXT_PUBLIC_API_URL so datasources never hardcode hosts.
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
    get<T>(path: string): Promise<T>;
    post<T>(path: string, body: unknown): Promise<T>;
    put<T>(path: string, body: unknown): Promise<T>;
    patch<T>(path: string, body: unknown): Promise<T>;
    delete<T>(path: string): Promise<T>;
}

export function createFetchHttpClient(
    baseUrl: string = process.env.NEXT_PUBLIC_API_URL ?? '',
    getAuthToken?: () => string | null,
): HttpClient {
    const request = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
        const token = getAuthToken?.();
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
        get: (path) => request('GET', path),
        post: (path, body) => request('POST', path, body),
        put: (path, body) => request('PUT', path, body),
        patch: (path, body) => request('PATCH', path, body),
        delete: (path) => request('DELETE', path),
    };
}
