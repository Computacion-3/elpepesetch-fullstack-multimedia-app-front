import { LibraryEntry } from '../../domain/entities/library-entry';
import type {
  LibraryEntryDto,
  LibraryEntryResponseDto,
} from '../dtos/library.dto';

export class LibraryEntryMapper {
  static toDomain(dto: LibraryEntryDto): LibraryEntry {
    return 'mediaItem' in dto
      ? LibraryEntryMapper.toDomainFromResponse(dto)
      : new LibraryEntry(dto);
  }

  private static toDomainFromResponse(
    dto: LibraryEntryResponseDto,
  ): LibraryEntry {
    const { mediaItem } = dto;
    const progressMaximum =
      mediaItem.type === 'BOOK'
        ? mediaItem.pages
        : mediaItem.type === 'MOVIE'
          ? mediaItem.durationMinutes
          : null;

    return new LibraryEntry({
      id: dto.id,
      mediaItemId: mediaItem.id,
      status: dto.status,
      progress: dto.progress,
      rating: dto.rating,
      isFavorite: dto.isFavorite,
      notes: dto.notes,
      addedAt: dto.addedAt,
      media: {
        id: mediaItem.id,
        title: mediaItem.title,
        type: mediaItem.type,
        creator: mediaItem.creator,
        releaseYear: mediaItem.releaseYear,
        cover: mediaItem.title.slice(0, 2).toUpperCase() || '??',
        coverUrl: mediaItem.coverUrl,
        genreIds: mediaItem.genres?.map((genre) => genre.id) ?? [],
        ...(progressMaximum !== null ? { progressMaximum } : {}),
        averageRating: Number(mediaItem.averageRating ?? 0),
      },
    });
  }
}
