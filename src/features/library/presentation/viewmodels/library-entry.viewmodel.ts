import type { LibraryEntry } from '../../domain/entities/library-entry';

export interface LibraryEntryViewModel {
  id: string;
  mediaItemId: string;
  title: string;
  creator: string;
  type: 'GAME' | 'MOVIE' | 'BOOK';
  releaseYear: number;
  cover: string;
  coverUrl?: string | null;
  description?: string | null;
  pages?: number | null;
  durationMinutes?: number | null;
  platform?: string | null;
  isbn?: string | null;
  ratingsCount?: number;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  mediaCreatedAt?: string;
  mediaUpdatedAt?: string;
  averageRating?: number;
  genres: { id: string; name: string; description?: string | null }[];
  progressMaximum?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
  progress: number;
  rating: number | null;
  isFavorite: boolean;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
  addedAt: string;
  updatedAt: string;
}

export class LibraryEntryViewModelMapper {
  static toViewModel(entry: LibraryEntry): LibraryEntryViewModel {
    return {
      id: entry.id,
      mediaItemId: entry.mediaItemId,
      title: entry.media.title,
      creator: entry.media.creator,
      type: entry.media.type,
      releaseYear: entry.media.releaseYear,
      cover: entry.media.cover,
      coverUrl: entry.media.coverUrl,
      description: entry.media.description,
      pages: entry.media.pages,
      durationMinutes: entry.media.durationMinutes,
      platform: entry.media.platform,
      isbn: entry.media.isbn,
      ratingsCount: entry.media.ratingsCount,
      approvalStatus: entry.media.approvalStatus,
      rejectionReason: entry.media.rejectionReason,
      mediaCreatedAt: entry.media.createdAt,
      mediaUpdatedAt: entry.media.updatedAt,
      genres: (entry.media.genres ?? []).map((genre) => ({ ...genre })),
      averageRating: entry.media.averageRating,
      progressMaximum: entry.media.progressMaximum,
      status: entry.status,
      progress: entry.progress,
      rating: entry.rating,
      isFavorite: entry.isFavorite,
      notes: entry.notes,
      startedAt: entry.startedAt,
      completedAt: entry.completedAt,
      addedAt: entry.addedAt,
      updatedAt: entry.updatedAt,
    };
  }
}
