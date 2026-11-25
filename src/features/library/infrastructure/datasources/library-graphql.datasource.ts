import type { GraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import type {
  CreateLibraryEntryDto,
  LibraryEntryResponseDto,
  LibraryQueryDto,
  PaginatedLibraryResponseDto,
  UpdateLibraryEntryDto,
} from '../dtos/library.dto';
import type { LibraryDatasource } from './library.datasource';

const ENTRY_FIELDS = `
  id status progress rating isFavorite notes startedAt completedAt addedAt updatedAt
  mediaItem {
    id title type coverUrl releaseYear creator pages durationMinutes averageRating ratingsCount
    genres { id name }
  }
`;

/** Implementa las mismas operaciones de biblioteca sobre el contrato GraphQL. */
export class LibraryGraphQLDatasource implements LibraryDatasource {
  constructor(private readonly client: GraphQLClient, private readonly token: string) {}

  async fetchEntries(query: LibraryQueryDto): Promise<PaginatedLibraryResponseDto> {
    const filter = {
      ...query,
      // GraphQL recibe los nombres del enum, aunque el dominio use los valores REST.
      ...(query.sortBy ? { sortBy: SORT_BY_GRAPHQL_VALUE[query.sortBy] } : {}),
    };
    const data = await this.client.execute<{ myLibrary: PaginatedLibraryResponseDto }>(
      `query MyLibrary($filter: LibraryFilterInput) {
        myLibrary(filter: $filter) {
          data { ${ENTRY_FIELDS} }
          meta { total page limit totalPages }
        }
      }`,
      { filter },
      this.token,
    );
    return data.myLibrary;
  }

  async fetchEntry(id: string): Promise<LibraryEntryResponseDto | null> {
    const data = await this.client.execute<{ libraryEntry: LibraryEntryResponseDto | null }>(
      `query LibraryEntry($id: ID!) { libraryEntry(id: $id) { ${ENTRY_FIELDS} } }`,
      { id },
      this.token,
    );
    return data.libraryEntry;
  }

  async createEntry(dto: CreateLibraryEntryDto) {
    const data = await this.client.execute<{ addToLibrary: LibraryEntryResponseDto }>(
      `mutation AddToLibrary($input: AddLibraryEntryInput!) {
        addToLibrary(input: $input) { ${ENTRY_FIELDS} }
      }`,
      { input: dto },
      this.token,
    );
    return { kind: 'created' as const, entry: data.addToLibrary };
  }

  async updateEntry(id: string, dto: UpdateLibraryEntryDto) {
    const data = await this.client.execute<{ updateLibraryEntry: LibraryEntryResponseDto }>(
      `mutation UpdateLibraryEntry($id: ID!, $input: UpdateLibraryEntryInput!) {
        updateLibraryEntry(id: $id, input: $input) { ${ENTRY_FIELDS} }
      }`,
      { id, input: dto },
      this.token,
    );
    return data.updateLibraryEntry;
  }

  async deleteEntry(id: string): Promise<boolean> {
    const data = await this.client.execute<{ removeLibraryEntry: boolean }>(
      'mutation RemoveLibraryEntry($id: ID!) { removeLibraryEntry(id: $id) }',
      { id },
      this.token,
    );
    return data.removeLibraryEntry;
  }
}

const SORT_BY_GRAPHQL_VALUE = {
  title: 'TITLE',
  releaseYear: 'RELEASE_YEAR',
  averageRating: 'AVERAGE_RATING',
  addedAt: 'ADDED_AT',
} as const;
