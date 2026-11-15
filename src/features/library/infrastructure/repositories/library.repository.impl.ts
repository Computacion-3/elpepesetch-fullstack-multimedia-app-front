import { ConflictError, NotFoundError } from '../../../../shared/domain/errors';
import type {
  AddLibraryEntryParams,
  LibraryQuery,
  LibraryRepository,
  MediaCatalogRepository,
} from '../../domain/repositories/library.repository';
import type { LibraryEntryChanges } from '../../domain/entities/library-entry';
import type {
  LibraryCatalogDatasource,
  LibraryDatasource,
} from '../datasources/library.datasource';
import { LibraryEntryMapper } from '../mappers/library-entry.mapper';

export class LibraryRepositoryImpl implements LibraryRepository {
  constructor(private readonly datasource: LibraryDatasource) {}

  async getAll(query: LibraryQuery) {
    const result = await this.datasource.fetchEntries(query);
    return { ...result, data: result.data.map(LibraryEntryMapper.toDomain) };
  }

  async getById(id: string) {
    const dto = await this.datasource.fetchEntry(id);
    return dto ? LibraryEntryMapper.toDomain(dto) : null;
  }

  async add(params: AddLibraryEntryParams) {
    const result = await this.datasource.createEntry(params);
    if (result.kind === 'duplicate')
      throw new ConflictError('Este elemento ya está en tu biblioteca.');
    if (result.kind === 'unavailable')
      throw new NotFoundError(
        'No se encontró el elemento multimedia de ejemplo.',
      );
    return LibraryEntryMapper.toDomain(result.entry);
  }

  async update(id: string, changes: LibraryEntryChanges) {
    const current = await this.getById(id);
    if (!current) throw new NotFoundError('No se encontró esta entrada.');
    const updated = current.withChanges(changes);
    if (!(await this.datasource.updateEntry(id, changes)))
      throw new NotFoundError('No se encontró esta entrada.');
    return updated;
  }

  async remove(id: string) {
    if (!(await this.datasource.deleteEntry(id)))
      throw new NotFoundError('No se encontró esta entrada.');
  }
}

export class LibraryCatalogRepositoryImpl implements MediaCatalogRepository {
  constructor(private readonly datasource: LibraryCatalogDatasource) {}

  getSelectableItems() {
    return this.datasource.fetchSelectableItems();
  }
}
