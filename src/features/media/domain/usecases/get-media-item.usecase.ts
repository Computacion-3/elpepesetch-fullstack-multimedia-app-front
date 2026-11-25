import type { MediaItem } from '../entities/media-item';
import type { MediaRepository } from '../repositories/media.repository';

/** Obtiene un detalle, respetando la visibilidad comprobada por el backend. */
export class GetMediaItemUseCase {
    constructor(private readonly repository: MediaRepository) {}

    async execute(accessToken: string, id: string): Promise<MediaItem> {
        return this.repository.getById(accessToken, id);
    }
}
