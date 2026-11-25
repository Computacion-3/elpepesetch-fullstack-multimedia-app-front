import type { LibraryMediaOptionDto } from '../dtos/library.dto';
import type { LibraryCatalogDatasource, LibraryMediaCatalogPort } from './library.datasource';

/** Lee todos los elementos visibles del catálogo con el transporte configurado. */
export class LibraryMediaCatalogDatasource implements LibraryCatalogDatasource {
  constructor(private readonly catalog: LibraryMediaCatalogPort, private readonly token: string) {}

  async fetchSelectableItems(): Promise<LibraryMediaOptionDto[]> {
    const options: LibraryMediaOptionDto[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const result = await this.catalog.fetchAll(this.token, {
        page,
        limit: 50,
        sortBy: 'title',
        order: 'ASC',
      });
      totalPages = result.meta.totalPages;
      options.push(...result.data.map((media) => ({
        id: media.id,
        title: media.title,
        type: media.type,
        creator: media.creator,
        releaseYear: media.releaseYear,
        cover: media.title.slice(0, 2).toUpperCase() || '??',
        coverUrl: media.coverUrl ?? null,
        genreIds: media.genres?.map((genre) => genre.id) ?? [],
        ...(media.type === 'BOOK' && media.pages != null ? { progressMaximum: media.pages } : {}),
        ...(media.type === 'MOVIE' && media.durationMinutes != null
          ? { progressMaximum: media.durationMinutes }
          : {}),
        averageRating: Number(media.averageRating ?? 0),
      })));
      page += 1;
    }

    return options;
  }
}
