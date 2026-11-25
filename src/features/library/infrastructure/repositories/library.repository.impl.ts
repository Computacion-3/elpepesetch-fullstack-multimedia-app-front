import { NotFoundError } from '../../../../shared/domain/errors';
import type {
  AddLibraryEntryParams,
  LibraryQuery,
  LibraryRepository,
} from '../../domain/repositories/library.repository';
import type { LibraryEntryChanges } from '../../domain/entities/library-entry';
import type { LibraryDatasource } from '../datasources/library.datasource';
import { LibraryEntryMapper } from '../mappers/library-entry.mapper';
import { toLibraryDomainError } from '../mappers/library-api-error.mapper';

export class LibraryRepositoryImpl implements LibraryRepository {
  constructor(private readonly datasource: LibraryDatasource) {}

  async getAll(query: LibraryQuery) {
    return this.run(async () => {
      const result = await this.datasource.fetchEntries(query);
      return { ...result, data: result.data.map(LibraryEntryMapper.toDomain) };
    });
  }

  async getById(id: string) {
    return this.run(async () => {
      const dto = await this.datasource.fetchEntry(id);
      return dto ? LibraryEntryMapper.toDomain(dto) : null;
    });
  }

  async add(params: AddLibraryEntryParams) {
    return this.run(async () => {
      const result = await this.datasource.createEntry(params);
      return LibraryEntryMapper.toDomain(result.entry);
    });
  }

  async update(id: string, changes: LibraryEntryChanges) {
    return this.run(async () => {
      const current = await this.getById(id);
      if (!current) throw new NotFoundError('No se encontró esta entrada.');
      current.withChanges(changes);
      const updated = await this.datasource.updateEntry(id, changes);
      if (!updated) throw new NotFoundError('No se encontró esta entrada.');
      return LibraryEntryMapper.toDomain(updated);
    });
  }

  async remove(id: string) {
    return this.run(async () => {
      if (!(await this.datasource.deleteEntry(id)))
        throw new NotFoundError('No se encontró esta entrada.');
    });
  }

  private async run<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw toLibraryDomainError(error);
    }
  }
}
