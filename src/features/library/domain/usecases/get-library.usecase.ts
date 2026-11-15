import type {
  LibraryQuery,
  LibraryRepository,
} from '../repositories/library.repository';

export class GetLibraryUseCase {
  constructor(private readonly repository: LibraryRepository) {}

  execute(query: LibraryQuery) {
    return this.repository.getAll(query);
  }
}
