import type {
  LibraryEntry,
  LibraryEntryChanges,
  LibraryMediaReference,
  LibraryStatus,
  MediaType,
} from '../entities/library-entry';

export type LibrarySortBy =
  | 'title'
  | 'releaseYear'
  | 'averageRating'
  | 'addedAt';
export type SortOrder = 'ASC' | 'DESC';

export interface LibraryQuery {
  status?: LibraryStatus;
  isFavorite?: boolean;
  q?: string;
  type?: MediaType;
  genreId?: string;
  year?: number;
  sortBy?: LibrarySortBy;
  order?: SortOrder;
  page?: number;
  limit?: number;
}

export interface PaginatedLibrary {
  data: LibraryEntry[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface AddLibraryEntryParams {
  mediaItemId: string;
  status?: LibraryStatus;
  progress?: number;
  rating?: number | null;
  isFavorite?: boolean;
  notes?: string | null;
}

export interface LibraryRepository {
  getAll(query: LibraryQuery): Promise<PaginatedLibrary>;
  getById(id: string): Promise<LibraryEntry | null>;
  add(params: AddLibraryEntryParams): Promise<LibraryEntry>;
  update(id: string, changes: LibraryEntryChanges): Promise<LibraryEntry>;
  remove(id: string): Promise<void>;
}

export interface MediaCatalogRepository {
  getSelectableItems(): Promise<LibraryMediaReference[]>;
}
