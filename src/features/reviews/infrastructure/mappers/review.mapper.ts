import type { Review } from '../../domain/entities/review';
import type { ReviewDto } from '../dtos/review.dto';

/** Mantiene fechas y nombres listos para Redux sin crear objetos de transporte. */
export class ReviewMapper {
  static toDomain(dto: ReviewDto): Review {
    return {
      ...dto,
      createdAt: new Date(dto.createdAt).toISOString(),
      updatedAt: new Date(dto.updatedAt).toISOString(),
      user: { id: dto.user.id, username: dto.user.username },
    };
  }
}
