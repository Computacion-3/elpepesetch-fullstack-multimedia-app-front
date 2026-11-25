import type {
  AddLibraryEntryParams,
  LibraryRepository,
} from '../repositories/library.repository';

export class AddLibraryEntryUseCase {
  constructor(private readonly repository: Pick<LibraryRepository, 'add'>) {}

  async execute(params: AddLibraryEntryParams) {
    return this.repository.add(params);
  }
}
