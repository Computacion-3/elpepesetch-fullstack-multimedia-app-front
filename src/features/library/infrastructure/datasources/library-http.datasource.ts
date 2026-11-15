import type {
  CreateLibraryEntryDto,
  LibraryEntryResponseDto,
  LibraryQueryDto,
  PaginatedLibraryResponseDto,
  UpdateLibraryEntryDto,
} from '../dtos/library.dto';
import type { LibraryDatasource } from './library.datasource';

/**
 * Narrow port to be implemented by the app's authenticated shared HTTP client.
 * It should reject API failures with `statusCode` and `message` from Nest's body.
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
