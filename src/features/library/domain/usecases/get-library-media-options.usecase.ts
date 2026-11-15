import type { MediaCatalogRepository } from '../repositories/library.repository';

export class GetLibraryMediaOptionsUseCase {
  constructor(private readonly repository: MediaCatalogRepository) {}

  execute() {
    return this.repository.getSelectableItems();
  }
}
