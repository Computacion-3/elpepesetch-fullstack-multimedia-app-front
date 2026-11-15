import type { LibraryEntryChanges } from '../entities/library-entry';
import type { LibraryRepository } from '../repositories/library.repository';

export class UpdateLibraryEntryUseCase {
  constructor(private readonly repository: LibraryRepository) {}

  execute(id: string, changes: LibraryEntryChanges) {
    return this.repository.update(id, changes);
  }
}
