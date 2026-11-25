import type { Page } from '@/src/shared/domain/page';
import type {
    Review,
    ReviewChanges,
    ReviewDraft,
    ReviewListQuery,
    ReviewMediaOption,
} from '../entities/review';

/**
 * Puerto de repositorio del dominio `reviews`.
 * Define las operaciones necesarias sin acoplarse a HTTP, DTOs ni detalles de red.
 */
export interface ReviewsRepository {
    /** Lista elementos multimedia disponibles en el catálogo para poder seleccionarlos en la vista. */
    listMediaOptions(token: string): Promise<ReviewMediaOption[]>;

    /** Obtiene una página de reseñas visibles asociadas a un elemento multimedia. */
    listByMediaItem(token: string, query: ReviewListQuery): Promise<Page<Review>>;

    /** Crea una nueva reseña sobre el elemento multimedia indicado. */
    create(token: string, mediaItemId: string, draft: ReviewDraft): Promise<Review>;

    /** Actualiza el título o contenido de una reseña existente. */
    update(token: string, id: string, changes: ReviewChanges): Promise<Review>;

    /** Elimina una reseña existente por su identificador UUID. */
    remove(token: string, id: string): Promise<void>;
}
