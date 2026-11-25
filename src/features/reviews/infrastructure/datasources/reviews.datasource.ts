import type {
    CatalogMediaDto,
    CreateReviewRequestDto,
    PaginatedReviewsDto,
    ReviewDto,
    UpdateReviewRequestDto,
} from '../dtos/reviews.dto';

/**
 * Contrato de fuente de datos para el módulo `reviews`.
 * Permite intercambiar implementaciones (REST, GraphQL o Mock) sin alterar repositorio, dominio ni UI.
 */
export interface ReviewsDatasource {
    /** Consulta el catálogo multimedia para poblar el selector de reseñas. */
    listMediaOptions(token: string): Promise<CatalogMediaDto[]>;

    /** Obtiene las reseñas paginadas de un elemento multimedia específico. */
    listByMediaItem(token: string, mediaItemId: string, query: string): Promise<PaginatedReviewsDto>;

    /** Envía la creación de una reseña al backend. */
    create(token: string, mediaItemId: string, body: CreateReviewRequestDto): Promise<ReviewDto>;

    /** Envía la edición de una reseña existente al backend. */
    update(token: string, id: string, body: UpdateReviewRequestDto): Promise<ReviewDto>;

    /** Solicita la eliminación de una reseña por su identificador UUID. */
    remove(token: string, id: string): Promise<void>;
}
