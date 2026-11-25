import type {
  LibraryEntryChanges,
  LibraryEntryProps,
  LibraryMediaReference,
} from '../../domain/entities/library-entry';
import type {
  AddLibraryEntryParams,
  LibraryQuery,
} from '../../domain/repositories/library.repository';

/** Temporary in-memory shape; kept separate from the confirmed API response. */
export type LibraryEntryMockDto = LibraryEntryProps;

export interface LibraryMediaGenreResponseDto {
  id: string;
  name: string;
  description?: string | null;
}

export interface LibraryMediaItemResponseDto {
  id: string;
  title: string;
  type: LibraryMediaReference['type'];
  description?: string | null;
  releaseYear: number;
  creator: string;
  coverUrl?: string | null;
  platform?: string | null;
  durationMinutes?: number | null;
  pages?: number | null;
  isbn?: string | null;
  approvalStatus?: string;
  rejectionReason?: string | null;
  averageRating?: number | string;
  ratingsCount?: number;
  genres?: LibraryMediaGenreResponseDto[];
  createdAt?: string;
  updatedAt?: string;
}

/** Confirmed LibraryEntry response fields consumed by this feature. */
export interface LibraryEntryResponseDto {
  id: string;
  status: LibraryEntryProps['status'];
  progress: number;
  rating: number | null;
  isFavorite: boolean;
  notes: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  addedAt: string;
  updatedAt?: string;
  mediaItem: LibraryMediaItemResponseDto;
}

export interface PaginatedLibraryResponseDto {
  data: LibraryEntryResponseDto[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

/** Nest validation and business-rule errors have a stable statusCode/message pair. */
export interface LibraryApiErrorDto {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export type LibraryEntryDto = LibraryEntryMockDto | LibraryEntryResponseDto;

/** DTOs de entrada compartidos por las operaciones REST y GraphQL. */
export type CreateLibraryEntryDto = AddLibraryEntryParams;
export type UpdateLibraryEntryDto = LibraryEntryChanges;
export type LibraryQueryDto = LibraryQuery;
export type LibraryMediaOptionDto = LibraryMediaReference;
