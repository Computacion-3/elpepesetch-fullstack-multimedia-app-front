import type {
  CreateLibraryEntryDto,
  LibraryEntryResponseDto,
  LibraryQueryDto,
  PaginatedLibraryResponseDto,
  UpdateLibraryEntryDto,
} from '../dtos/library.dto';
import type { LibraryDatasource } from './library.datasource';
import type { HttpClient } from '@/src/shared/infrastructure/http-client';

/**
 * Adapta el cliente HTTP compartido al contrato pequeño usado por Biblioteca.
 */
export interface LibraryApiClient {
  request<T>(
    path: string,
    options?: {
      method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
      query?: URLSearchParams;
      body?: unknown;
    },
  ): Promise<T>;
}

/** Reenvía las peticiones REST con el token de la sesión actual. */
export class SharedLibraryApiClient implements LibraryApiClient {
  constructor(private readonly client: HttpClient, private readonly token: string) {}

  async request<T>(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
      query?: URLSearchParams;
      body?: unknown;
    } = {},
  ): Promise<T> {
    const query = options.query?.toString();
    const url = query ? `${path}?${query}` : path;
    const method = options.method ?? 'GET';

    if (method === 'GET') return this.client.get<T>(url, this.token);
    if (method === 'POST') return this.client.post<T>(url, options.body, this.token);
    if (method === 'PATCH') return this.client.patch<T>(url, options.body, this.token);
    return this.client.delete<T>(url, this.token);
  }
}

export class LibraryHttpDatasource implements LibraryDatasource {
  constructor(private readonly client: LibraryApiClient) {}

  fetchEntries(query: LibraryQueryDto) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params.set(key, String(value));
    }

    return this.client.request<PaginatedLibraryResponseDto>('/library', {
      method: 'GET',
      query: params,
    });
  }

  fetchEntry(id: string) {
    return this.client.request<LibraryEntryResponseDto>(
      `/library/${encodeURIComponent(id)}`,
      { method: 'GET' },
    );
  }

  async createEntry(dto: CreateLibraryEntryDto) {
    const entry = await this.client.request<LibraryEntryResponseDto>(
      '/library',
      { method: 'POST', body: dto },
    );
    return { kind: 'created' as const, entry };
  }

  updateEntry(id: string, dto: UpdateLibraryEntryDto) {
    return this.client.request<LibraryEntryResponseDto>(
      `/library/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: dto },
    );
  }

  async deleteEntry(id: string) {
    await this.client.request<void>(`/library/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return true;
  }
}
