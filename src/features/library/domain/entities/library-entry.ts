import { ValidationError } from '../../../../shared/domain/errors';

export type LibraryStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
export type MediaType = 'GAME' | 'MOVIE' | 'BOOK';

/** Descriptive fields are supplied by the temporary catalog fixture until Media is integrated. */
export interface LibraryMediaReference {
  readonly id: string;
  readonly title: string;
  readonly type: MediaType;
  readonly creator: string;
  readonly releaseYear: number;
  readonly cover: string;
  readonly coverUrl?: string | null;
  readonly genreIds: readonly string[];
  readonly progressMaximum?: number;
  readonly averageRating?: number;
}

export interface LibraryEntryProps {
  readonly id: string;
  readonly mediaItemId: string;
  readonly media: LibraryMediaReference;
  readonly status: LibraryStatus;
  readonly progress: number;
  readonly rating: number | null;
  readonly isFavorite: boolean;
  readonly notes: string | null;
  readonly addedAt: string;
}

export type LibraryEntryChanges = Partial<
  Pick<
    LibraryEntryProps,
    'status' | 'progress' | 'rating' | 'isFavorite' | 'notes'
  >
>;

export class LibraryEntry implements LibraryEntryProps {
  readonly id: string;
  readonly mediaItemId: string;
  readonly media: LibraryMediaReference;
  readonly status: LibraryStatus;
  readonly progress: number;
  readonly rating: number | null;
  readonly isFavorite: boolean;
  readonly notes: string | null;
  readonly addedAt: string;

  constructor(props: LibraryEntryProps) {
    this.assertValid(props);
    this.id = props.id;
    this.mediaItemId = props.mediaItemId;
    this.media = props.media;
    this.status = props.status;
    this.progress = props.progress;
    this.rating = props.rating;
    this.isFavorite = props.isFavorite;
    this.notes = props.notes;
    this.addedAt = props.addedAt;
  }

  withChanges(changes: LibraryEntryChanges): LibraryEntry {
    return new LibraryEntry({ ...this, ...changes });
  }

  static validateState(
    status: LibraryStatus,
    progress: number,
    rating: number | null,
  ): void {
    if (!['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DROPPED'].includes(status)) {
      throw new ValidationError('El estado de la entrada no es válido.');
    }

    if (!Number.isInteger(progress) || progress < 0) {
      throw new ValidationError(
        'El progreso debe ser un entero igual o mayor que cero.',
      );
    }

    if (
      rating !== null &&
      (!Number.isInteger(rating) || rating < 1 || rating > 10)
    ) {
      throw new ValidationError(
        'La calificación debe ser un entero entre 1 y 10.',
      );
    }

    if (status === 'PENDING' && rating !== null) {
      throw new ValidationError(
        'Una entrada pendiente no puede tener calificación.',
      );
    }
  }

  private assertValid(props: LibraryEntryProps): void {
    if (!['GAME', 'MOVIE', 'BOOK'].includes(props.media.type)) {
      throw new ValidationError('El tipo multimedia no es válido.');
    }

    LibraryEntry.validateState(props.status, props.progress, props.rating);

    if (props.mediaItemId !== props.media.id) {
      throw new ValidationError(
        'El elemento multimedia no coincide con la entrada.',
      );
    }
  }
}
