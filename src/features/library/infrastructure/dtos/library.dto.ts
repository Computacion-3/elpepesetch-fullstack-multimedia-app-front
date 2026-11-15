import type {
  LibraryEntryChanges,
  LibraryEntryProps,
  LibraryMediaReference,
} from '../../domain/entities/library-entry';
import type {
  AddLibraryEntryParams,
  LibraryQuery,
} from '../../domain/repositories/library.repository';

/** Temporary in-memory shape. It is not claimed to match a backend response DTO. */
export interface LibraryEntryMockDto extends LibraryEntryProps {}

/** Request-like mock shapes; validate against the backend before adding an HTTP datasource. */
export interface CreateLibraryEntryDto extends AddLibraryEntryParams {}
export interface UpdateLibraryEntryDto extends LibraryEntryChanges {}
export type LibraryQueryDto = LibraryQuery;
export type LibraryMediaOptionDto = LibraryMediaReference;
