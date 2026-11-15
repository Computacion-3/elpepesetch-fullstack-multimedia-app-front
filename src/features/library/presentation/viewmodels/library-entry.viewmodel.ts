import type {
  LibraryEntry,
  LibraryMediaReference,
} from '../../domain/entities/library-entry';

export interface LibraryEntryViewModel {
  id: string;
  mediaItemId: string;
  title: string;
  creator: string;
  type: 'GAME' | 'MOVIE' | 'BOOK';
  releaseYear: number;
  cover: string;
  averageRating?: number;
  progressMaximum?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
  progress: number;
  rating: number | null;
  isFavorite: boolean;
  notes: string | null;
  addedAt: string;
}

export interface LibraryMediaOptionViewModel {
  id: string;
  title: string;
  type: 'GAME' | 'MOVIE' | 'BOOK';
  creator: string;
  releaseYear: number;
  cover: string;
  genreIds: string[];
  progressMaximum?: number;
  averageRating?: number;
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
      averageRating: entry.media.averageRating,
      progressMaximum: entry.media.progressMaximum,
      status: entry.status,
      progress: entry.progress,
      rating: entry.rating,
      isFavorite: entry.isFavorite,
      notes: entry.notes,
      addedAt: entry.addedAt,
    };
  }
}

export class LibraryMediaOptionViewModelMapper {
  static toViewModel(
    media: LibraryMediaReference,
  ): LibraryMediaOptionViewModel {
    return { ...media, genreIds: [...media.genreIds] };
  }
}
