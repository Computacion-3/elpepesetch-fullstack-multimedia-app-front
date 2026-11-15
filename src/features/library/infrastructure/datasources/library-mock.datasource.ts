import type {
  LibraryEntryMockDto,
  LibraryMediaOptionDto,
} from '../dtos/library.dto';
import type {
  LibraryDatasource,
  LibraryCatalogDatasource,
} from './library.datasource';
import type {
  CreateLibraryEntryDto,
  LibraryQueryDto,
  UpdateLibraryEntryDto,
} from '../dtos/library.dto';

const mediaOptions: LibraryMediaOptionDto[] = [
  {
    id: 'media-game-01',
    title: 'Hollow Knight',
    type: 'GAME',
    creator: 'Team Cherry',
    releaseYear: 2017,
    cover: 'HK',
    genreIds: ['action', 'indie'],
    progressMaximum: 32,
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
    progressMaximum: 12,
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
    addedAt: '2026-10-20T12:00:00.000Z',
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
    addedAt: '2026-10-18T12:00:00.000Z',
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
    addedAt: '2026-10-15T12:00:00.000Z',
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
    addedAt: '2026-10-10T12:00:00.000Z',
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
    addedAt: '2026-10-05T12:00:00.000Z',
  },
];

/** In-memory demo data only; replace in the container after shared HTTP/auth integration exists. */
export class LibraryMockDatasource
  implements LibraryDatasource, LibraryCatalogDatasource
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
      data: entries.slice(start, start + limit),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async fetchEntry(id: string) {
    return this.entries.find((entry) => entry.id === id) ?? null;
  }

  async createEntry(dto: CreateLibraryEntryDto) {
    if (this.entries.some((entry) => entry.mediaItemId === dto.mediaItemId))
      return { kind: 'duplicate' as const };
    const media = mediaOptions.find((option) => option.id === dto.mediaItemId);
    if (!media) return { kind: 'unavailable' as const };
    const entry: LibraryEntryMockDto = {
      id: `entry-${String(this.nextId++).padStart(2, '0')}`,
      mediaItemId: dto.mediaItemId,
      media,
      status: dto.status ?? 'PENDING',
      progress: dto.progress ?? 0,
      rating: dto.rating ?? null,
      isFavorite: dto.isFavorite ?? false,
      notes: dto.notes ?? null,
      addedAt: new Date().toISOString(),
    };
    this.entries = [...this.entries, entry];
    return { kind: 'created' as const, entry };
  }

  async updateEntry(id: string, dto: UpdateLibraryEntryDto) {
    const current = this.entries.find((entry) => entry.id === id);
    if (!current) return false;
    const updated = { ...current, ...dto };
    this.entries = this.entries.map((entry) =>
      entry.id === id ? updated : entry,
    );
    return true;
  }

  async deleteEntry(id: string) {
    const next = this.entries.filter((entry) => entry.id !== id);
    if (next.length === this.entries.length) return false;
    this.entries = next;
    return true;
  }

  async fetchSelectableItems() {
    return mediaOptions.filter(
      (option) =>
        !this.entries.some((entry) => entry.mediaItemId === option.id),
    );
  }
}
