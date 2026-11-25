import { LibraryEntry } from '../../domain/entities/library-entry';
import type {
  LibraryEntryDto,
  LibraryEntryResponseDto,
} from '../dtos/library.dto';

export class LibraryEntryMapper {
  static toDomain(dto: LibraryEntryDto): LibraryEntry {
    return LibraryEntryMapper.toDomainFromResponse(dto);
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
      startedAt: dto.startedAt,
      completedAt: dto.completedAt,
      addedAt: dto.addedAt,
      updatedAt: dto.updatedAt,
      media: {
        id: mediaItem.id,
        title: mediaItem.title,
        type: mediaItem.type,
        creator: mediaItem.creator,
        releaseYear: mediaItem.releaseYear,
        description: 'description' in mediaItem ? mediaItem.description : undefined,
        cover: mediaItem.title.slice(0, 2).toUpperCase() || '??',
        coverUrl: mediaItem.coverUrl,
        pages: mediaItem.pages,
        durationMinutes: mediaItem.durationMinutes,
        platform: mediaItem.platform,
        isbn: 'isbn' in mediaItem ? mediaItem.isbn : undefined,
        ratingsCount: mediaItem.ratingsCount,
        approvalStatus: 'approvalStatus' in mediaItem ? mediaItem.approvalStatus : undefined,
        rejectionReason: 'rejectionReason' in mediaItem ? mediaItem.rejectionReason : undefined,
        createdAt: 'createdAt' in mediaItem ? mediaItem.createdAt : undefined,
        updatedAt: 'updatedAt' in mediaItem ? mediaItem.updatedAt : undefined,
        genreIds: mediaItem.genres?.map((genre) => genre.id) ?? [],
        genres: mediaItem.genres?.map((genre) => ({
          id: genre.id,
          name: genre.name,
          description: 'description' in genre ? genre.description : undefined,
        })) ?? [],
        ...(progressMaximum !== null ? { progressMaximum } : {}),
        averageRating: Number(mediaItem.averageRating),
      },
    });
  }
}
