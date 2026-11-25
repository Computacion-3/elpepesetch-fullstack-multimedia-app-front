import type { GraphQLClient } from '../../../../shared/infrastructure/graphql-client';
import type {
  CreateLibraryEntryDto,
  LibraryEntryResponseDto,
  LibraryQueryDto,
  PaginatedLibraryResponseDto,
  UpdateLibraryEntryDto,
} from '../dtos/library.dto';
import type { LibraryDatasource } from './library.datasource';

const FIELDS = `id status progress rating isFavorite notes startedAt completedAt addedAt updatedAt mediaItem { id title type coverUrl releaseYear creator pages durationMinutes platform averageRating ratingsCount genres { id name } }`;
const LIST = `query MyLibrary($filter: LibraryFilterInput) { myLibrary(filter: $filter) { data { ${FIELDS} } meta { total page limit totalPages } } }`;
const GET = `query LibraryEntry($id: ID!) { libraryEntry(id: $id) { ${FIELDS} } }`;
const ADD = `mutation AddEntry($input: AddLibraryEntryInput!) { addToLibrary(input: $input) { ${FIELDS} } }`;
const UPDATE = `mutation UpdateEntry($id: ID!, $input: UpdateLibraryEntryInput!) { updateLibraryEntry(id: $id, input: $input) { ${FIELDS} } }`;
const REMOVE = `mutation RemoveEntry($id: ID!) { removeLibraryEntry(id: $id) }`;

/** GraphQL implementation of the Library domain port. */
export class LibraryGraphQLDatasource implements LibraryDatasource {
  constructor(private readonly graphql: GraphQLClient) {}

  async fetchEntries(filter: LibraryQueryDto): Promise<PaginatedLibraryResponseDto> {
    const sortBy = filter.sortBy ? ({
      title: 'TITLE',
      releaseYear: 'RELEASE_YEAR',
      averageRating: 'AVERAGE_RATING',
      addedAt: 'ADDED_AT',
    } as const)[filter.sortBy] : undefined;
    const graphqlFilter = { ...filter, sortBy };
    return (await this.graphql.execute<{ myLibrary: PaginatedLibraryResponseDto }>(LIST, { filter: graphqlFilter })).myLibrary;
  }

  async fetchEntry(id: string): Promise<LibraryEntryResponseDto | null> {
    return (await this.graphql.execute<{ libraryEntry: LibraryEntryResponseDto | null }>(GET, { id })).libraryEntry;
  }

  async createEntry(input: CreateLibraryEntryDto) {
    const entry = (await this.graphql.execute<{ addToLibrary: LibraryEntryResponseDto }>(ADD, { input })).addToLibrary;
    return { kind: 'created' as const, entry };
  }

  async updateEntry(id: string, input: UpdateLibraryEntryDto) {
    return (await this.graphql.execute<{ updateLibraryEntry: LibraryEntryResponseDto }>(UPDATE, { id, input })).updateLibraryEntry;
  }

  async deleteEntry(id: string) {
    return (await this.graphql.execute<{ removeLibraryEntry: boolean }>(REMOVE, { id })).removeLibraryEntry;
  }
}
