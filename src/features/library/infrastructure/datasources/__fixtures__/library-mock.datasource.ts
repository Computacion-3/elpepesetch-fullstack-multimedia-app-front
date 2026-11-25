import type { LibraryEntryProps } from '../../../domain/entities/library-entry';
import type { LibraryDatasource } from '../library.datasource';
import { ConflictError, NotFoundError } from '../../../../../shared/domain/errors';
import type {
  CreateLibraryEntryDto,
  LibraryRestEntryDto,
  LibraryQueryDto,
  UpdateLibraryEntryDto,
} from '../../dtos/library.dto';

type LibraryEntryMockDto = LibraryEntryProps;
const mediaOptions: LibraryEntryProps['media'][] = [
  {
    id: 'media-game-01',
    title: 'Hollow Knight',
    type: 'GAME',
    creator: 'Team Cherry',
    releaseYear: 2017,
    cover: 'HK',
    genreIds: ['action', 'indie'],
    averageRating: 9.0,
  },
  {
    id: 'media-movie-01',
    title: 'Arrival',
    type: 'MOVIE',
    creator: 'Denis Villeneuve',
    releaseYear: 2016,
    cover: 'AR',
    genreIds: ['sci-fi', 'drama'],
    progressMaximum: 116,
    averageRating: 8.7,
  },
  {
    id: 'media-book-01',
    title: 'The Left Hand of Darkness',
    type: 'BOOK',
    creator: 'Ursula K. Le Guin',
    releaseYear: 1969,
    cover: 'LH',
    genreIds: ['sci-fi'],
    progressMaximum: 304,
    averageRating: 8.5,
  },
  {
    id: 'media-game-02',
    title: 'Celeste',
    type: 'GAME',
    creator: 'Maddy Thorson',
    releaseYear: 2018,
    cover: 'CE',
    genreIds: ['platformer', 'indie'],
    averageRating: 8.9,
  },
  {
    id: 'media-movie-02',
    title: 'Perfect Days',
    type: 'MOVIE',
    creator: 'Wim Wenders',
    releaseYear: 2023,
    cover: 'PD',
    genreIds: ['drama'],
    progressMaximum: 124,
    averageRating: 8.4,
  },
  {
    id: 'media-book-02',
    title: 'Kindred',
    type: 'BOOK',
    creator: 'Octavia E. Butler',
    releaseYear: 1979,
    cover: 'KI',
    genreIds: ['sci-fi', 'drama'],
    progressMaximum: 264,
    averageRating: 8.6,
  },
];

const initialEntries: LibraryEntryMockDto[] = [
  {
    id: 'entry-01',
    mediaItemId: 'media-game-01',
    media: mediaOptions[0],
    status: 'IN_PROGRESS',
    progress: 14,
    rating: null,
    isFavorite: true,
    notes: 'Explorar el mapa del lago.',
    startedAt: '2026-10-21T12:00:00.000Z', completedAt: null,
    addedAt: '2026-10-20T12:00:00.000Z', updatedAt: '2026-10-21T12:00:00.000Z',
  },
  {
    id: 'entry-02',
    mediaItemId: 'media-movie-01',
    media: mediaOptions[1],
    status: 'COMPLETED',
    progress: 116,
    rating: 9,
    isFavorite: false,
    notes: null,
    startedAt: '2026-10-18T12:00:00.000Z', completedAt: '2026-10-18T13:56:00.000Z',
    addedAt: '2026-10-18T12:00:00.000Z', updatedAt: '2026-10-18T13:56:00.000Z',
  },
  {
    id: 'entry-03',
    mediaItemId: 'media-book-01',
    media: mediaOptions[2],
    status: 'PENDING',
    progress: 0,
    rating: null,
    isFavorite: false,
    notes: null,
    startedAt: null, completedAt: null,
    addedAt: '2026-10-15T12:00:00.000Z', updatedAt: '2026-10-15T12:00:00.000Z',
  },
  {
    id: 'entry-04',
    mediaItemId: 'media-game-02',
    media: mediaOptions[3],
    status: 'DROPPED',
    progress: 3,
    rating: null,
    isFavorite: false,
    notes: 'Retomar cuando tenga más tiempo.',
    startedAt: '2026-10-11T12:00:00.000Z', completedAt: null,
    addedAt: '2026-10-10T12:00:00.000Z', updatedAt: '2026-10-11T12:00:00.000Z',
  },
  {
    id: 'entry-05',
    mediaItemId: 'media-book-02',
    media: mediaOptions[5],
    status: 'IN_PROGRESS',
    progress: 82,
    rating: 8,
    isFavorite: true,
    notes: null,
    startedAt: '2026-10-06T12:00:00.000Z', completedAt: null,
    addedAt: '2026-10-05T12:00:00.000Z', updatedAt: '2026-10-06T12:00:00.000Z',
  },
];

/** In-memory datasource used only by repository tests. */
export class LibraryMockDatasource
  implements LibraryDatasource
{
  private entries = initialEntries.map((entry) => ({
    ...entry,
    media: { ...entry.media },
  }));
  private nextId = 6;

  async fetchEntries(query: LibraryQueryDto) {
    let entries = [...this.entries];
    if (query.status)
      entries = entries.filter((entry) => entry.status === query.status);
    if (query.isFavorite !== undefined)
      entries = entries.filter(
        (entry) => entry.isFavorite === query.isFavorite,
      );
    if (query.type)
      entries = entries.filter((entry) => entry.media.type === query.type);
    const genreId = query.genreId;
    if (genreId)
      entries = entries.filter((entry) =>
        entry.media.genreIds.includes(genreId),
      );
    if (query.year)
      entries = entries.filter(
        (entry) => entry.media.releaseYear === query.year,
      );
    if (query.q?.trim()) {
      const term = query.q.trim().toLocaleLowerCase();
      entries = entries.filter(({ media }) =>
        `${media.title} ${media.creator}`.toLocaleLowerCase().includes(term),
      );
    }

    const key = query.sortBy ?? 'addedAt';
    const direction = query.order === 'ASC' ? 1 : -1;
    entries.sort((a, b) => {
      if (key === 'title')
        return a.media.title.localeCompare(b.media.title) * direction;
      if (key === 'releaseYear')
        return (a.media.releaseYear - b.media.releaseYear) * direction;
      if (key === 'averageRating')
        return (
          ((a.media.averageRating ?? 0) - (b.media.averageRating ?? 0)) *
          direction
        );
      return a.addedAt.localeCompare(b.addedAt) * direction;
    });

    const total = entries.length;
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const start = (page - 1) * limit;
    return {
      data: entries.slice(start, start + limit).map(toResponseDto),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async fetchEntry(id: string) {
    const entry = this.entries.find((item) => item.id === id);
    return entry ? toResponseDto(entry) : null;
  }

  async createEntry(dto: CreateLibraryEntryDto) {
    if (this.entries.some((entry) => entry.mediaItemId === dto.mediaItemId))
      throw new ConflictError('Este elemento ya está en tu biblioteca.');
    const media = mediaOptions.find((option) => option.id === dto.mediaItemId);
    if (!media) throw new NotFoundError('No se encontró un elemento multimedia disponible.');
    const entry: LibraryEntryMockDto = {
      id: `entry-${String(this.nextId++).padStart(2, '0')}`,
      mediaItemId: dto.mediaItemId,
      media,
      status: 'PENDING',
      progress: 0,
      rating: null,
      isFavorite: false,
      notes: null,
      startedAt: null,
      completedAt: null,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.entries = [...this.entries, entry];
    return { kind: 'created' as const, entry: toResponseDto(entry) };
  }

  async updateEntry(id: string, dto: UpdateLibraryEntryDto) {
    const current = this.entries.find((entry) => entry.id === id);
    if (!current) return null;
    const updated = { ...current, ...dto };
    this.entries = this.entries.map((entry) =>
      entry.id === id ? updated : entry,
    );
    return toResponseDto(updated);
  }

  async deleteEntry(id: string) {
    const next = this.entries.filter((entry) => entry.id !== id);
    if (next.length === this.entries.length) return false;
    this.entries = next;
    return true;
  }
}

function toResponseDto(entry: LibraryEntryProps): LibraryRestEntryDto {
  const media = entry.media;
  return {
    id: entry.id,
    status: entry.status,
    progress: entry.progress,
    rating: entry.rating,
    isFavorite: entry.isFavorite,
    notes: entry.notes,
    startedAt: entry.startedAt,
    completedAt: entry.completedAt,
    addedAt: entry.addedAt,
    updatedAt: entry.updatedAt,
    mediaItem: {
      id: media.id,
      title: media.title,
      type: media.type,
      description: media.description ?? null,
      releaseYear: media.releaseYear,
      creator: media.creator,
      coverUrl: media.coverUrl ?? null,
      platform: media.platform ?? null,
      durationMinutes: media.durationMinutes ?? null,
      pages: media.pages ?? null,
      isbn: media.isbn ?? null,
      approvalStatus: 'APPROVED',
      rejectionReason: null,
      averageRating: media.averageRating ?? 0,
      ratingsCount: media.ratingsCount ?? 0,
      genres: (media.genres ?? []).map(({ id, name }) => ({ id, name, description: null })),
      createdAt: entry.addedAt,
      updatedAt: entry.updatedAt,
    },
  };
}
