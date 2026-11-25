import type {
  LibraryEntryChanges,
  LibraryEntryProps,
  LibraryMediaReference,
  MediaApprovalStatus,
} from '../../domain/entities/library-entry';
import type {
  AddLibraryEntryParams,
  LibraryQuery,
} from '../../domain/repositories/library.repository';

export interface LibraryRestGenreDto {
  id: string;
  name: string;
  description: string | null;
}

export interface LibraryRestMediaItemDto {
  id: string;
  title: string;
  type: LibraryMediaReference['type'];
  description: string | null;
  releaseYear: number;
  creator: string;
  coverUrl: string | null;
  platform: string | null;
  durationMinutes: number | null;
  pages: number | null;
  isbn: string | null;
  approvalStatus: MediaApprovalStatus;
  rejectionReason: string | null;
  averageRating: number | string;
  ratingsCount: number;
  genres?: LibraryRestGenreDto[];
  createdAt: string;
  updatedAt: string;
}

/** Confirmed LibraryEntry response fields consumed by this feature. */
export interface LibraryRestEntryDto {
  id: string;
  status: LibraryEntryProps['status'];
  progress: number;
  rating: number | null;
  isFavorite: boolean;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
  addedAt: string;
  updatedAt: string;
  mediaItem: LibraryRestMediaItemDto;
}

/** Library GraphQL intentionally selects a smaller media projection than REST. */
export interface LibraryGraphQLMediaItemDto {
  id: string;
  title: string;
  type: LibraryEntryProps['media']['type'];
  coverUrl: string | null;
  releaseYear: number;
  creator: string;
  pages: number | null;
  durationMinutes: number | null;
  platform: string | null;
  averageRating: number;
  ratingsCount: number;
  genres: { id: string; name: string }[];
}

export interface LibraryGraphQLEntryDto extends Omit<LibraryRestEntryDto, 'mediaItem'> {
  mediaItem: LibraryGraphQLMediaItemDto;
}

export type LibraryEntryResponseDto = LibraryRestEntryDto | LibraryGraphQLEntryDto;

export interface PaginatedLibraryResponseDto<TEntry extends LibraryEntryResponseDto = LibraryEntryResponseDto> {
  data: TEntry[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

/** Nest validation and business-rule errors have a stable statusCode/message pair. */
export interface LibraryApiErrorDto {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export type LibraryEntryDto = LibraryEntryResponseDto;

/** Request DTOs confirmed by the backend contract. */
export type CreateLibraryEntryDto = AddLibraryEntryParams;
export type UpdateLibraryEntryDto = LibraryEntryChanges;
export type LibraryQueryDto = LibraryQuery;
