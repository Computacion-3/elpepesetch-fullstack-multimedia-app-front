import { NotFoundError } from '../../../../shared/domain/errors';
import type { LibraryRepository } from '../repositories/library.repository';

export class GetLibraryEntryUseCase {
  constructor(private readonly repository: LibraryRepository) {}

  async execute(id: string) {
    const entry = await this.repository.getById(id);
    if (!entry) throw new NotFoundError('No se encontró esta entrada.');
    return entry;
  }
}
