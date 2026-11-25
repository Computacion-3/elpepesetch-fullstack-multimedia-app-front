import type {
  CreateLibraryEntryDto,
  LibraryEntryDto,
  LibraryMediaOptionDto,
  LibraryQueryDto,
  UpdateLibraryEntryDto,
} from '../dtos/library.dto';

export interface LibraryDatasource {
  fetchEntries(query: LibraryQueryDto): Promise<{
    data: LibraryEntryDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>;
  fetchEntry(id: string): Promise<LibraryEntryDto | null>;
  createEntry(
    dto: CreateLibraryEntryDto,
  ): Promise<
    | { kind: 'created'; entry: LibraryEntryDto }
    | { kind: 'duplicate' }
    | { kind: 'unavailable' }
  >;
  updateEntry(
    id: string,
    dto: UpdateLibraryEntryDto,
  ): Promise<LibraryEntryDto | null>;
  deleteEntry(id: string): Promise<boolean>;
}

export interface LibraryCatalogDatasource {
  fetchSelectableItems(): Promise<LibraryMediaOptionDto[]>;
}

/** Puerto mínimo para adaptar el catálogo autenticado a opciones de biblioteca. */
export interface LibraryMediaCatalogPort {
  fetchAll(token: string, query: {
    page: number;
    limit: number;
    sortBy: 'title';
    order: 'ASC';
  }): Promise<{
    data: {
      id: string;
      title: string;
      type: LibraryMediaOptionDto['type'];
      creator: string;
      releaseYear: number;
      coverUrl?: string | null;
      averageRating?: number | string;
      genres?: { id: string }[];
      pages?: number | null;
      durationMinutes?: number | null;
    }[];
    meta: { totalPages: number };
  }>;
}
