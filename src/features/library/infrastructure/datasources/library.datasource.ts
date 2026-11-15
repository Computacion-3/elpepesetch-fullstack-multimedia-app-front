import type {
  CreateLibraryEntryDto,
  LibraryEntryMockDto,
  LibraryMediaOptionDto,
  LibraryQueryDto,
  UpdateLibraryEntryDto,
} from '../dtos/library.dto';

export interface LibraryDatasource {
  fetchEntries(query: LibraryQueryDto): Promise<{
    data: LibraryEntryMockDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>;
  fetchEntry(id: string): Promise<LibraryEntryMockDto | null>;
  createEntry(
    dto: CreateLibraryEntryDto,
  ): Promise<
    | { kind: 'created'; entry: LibraryEntryMockDto }
    | { kind: 'duplicate' }
    | { kind: 'unavailable' }
  >;
  updateEntry(id: string, dto: UpdateLibraryEntryDto): Promise<boolean>;
  deleteEntry(id: string): Promise<boolean>;
}

export interface LibraryCatalogDatasource {
  fetchSelectableItems(): Promise<LibraryMediaOptionDto[]>;
}
