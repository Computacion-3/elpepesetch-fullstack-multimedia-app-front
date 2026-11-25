import type {
  CreateLibraryEntryDto,
  LibraryEntryDto,
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
  ): Promise<{ kind: 'created'; entry: LibraryEntryDto }>;
  updateEntry(
    id: string,
    dto: UpdateLibraryEntryDto,
  ): Promise<LibraryEntryDto | null>;
  deleteEntry(id: string): Promise<boolean>;
}
