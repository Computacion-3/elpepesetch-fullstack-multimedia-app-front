import type { Review } from '../../domain/entities/review';

/** Datos de reseña que se pueden serializar desde una Server Action a Redux. */
export interface ReviewViewModel extends Review {
  dateLabel: string;
}

export class ReviewViewModelMapper {
  static toViewModel(review: Review): ReviewViewModel {
    return { ...review, dateLabel: new Date(review.createdAt).toLocaleDateString('es-CO') };
  }
}
