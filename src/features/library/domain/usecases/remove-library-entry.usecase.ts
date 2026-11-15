import type { LibraryRepository } from '../repositories/library.repository';

export class RemoveLibraryEntryUseCase {
  constructor(private readonly repository: LibraryRepository) {}

  execute(id: string) {
    return this.repository.remove(id);
  }
}
