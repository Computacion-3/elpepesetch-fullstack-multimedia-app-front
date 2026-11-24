import { LibraryEntry } from '../entities/library-entry';
import type {
  AddLibraryEntryParams,
  LibraryRepository,
} from '../repositories/library.repository';

export class AddLibraryEntryUseCase {
  constructor(private readonly repository: Pick<LibraryRepository, 'add'>) {}

  async execute(params: AddLibraryEntryParams) {
    LibraryEntry.validateState(
      params.status ?? 'PENDING',
      params.progress ?? 0,
      params.rating ?? null,
    );
    return this.repository.add(params);
  }
}
