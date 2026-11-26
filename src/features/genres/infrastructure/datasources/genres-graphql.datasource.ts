import type { GraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import type { CreateGenreDto, GenreDto, UpdateGenreDto } from '../dtos/genre.dto';
import type { GenresDatasource } from './genres.datasource';

// Contrato provisional de frontend; requiere resolvers de media/genres en el backend.
const LIST_GENRES = `query Genres { genres { id name description } }`;
const CREATE_GENRE = `mutation CreateGenre($input: CreateGenreInput!) { createGenre(input: $input) { id name description } }`;
const UPDATE_GENRE = `mutation UpdateGenre($id: ID!, $input: UpdateGenreInput!) { updateGenre(id: $id, input: $input) { id name description } }`;
const DELETE_GENRE = `mutation RemoveGenre($id: ID!) { removeGenre(id: $id) }`;

/** DataSource GraphQL con las mismas firmas del transporte REST. */
export class GenresGraphQLDatasource implements GenresDatasource {
    constructor(private readonly graphql: GraphQLClient) {}

    async fetchAll(token: string): Promise<GenreDto[]> {
        return (await this.graphql.execute<{ genres: GenreDto[] }>(LIST_GENRES, undefined, token)).genres;
    }

    async create(token: string, body: CreateGenreDto): Promise<GenreDto> {
        return (await this.graphql.execute<{ createGenre: GenreDto }>(CREATE_GENRE, { input: body }, token)).createGenre;
    }

    async update(token: string, id: string, body: UpdateGenreDto): Promise<GenreDto> {
        return (await this.graphql.execute<{ updateGenre: GenreDto }>(UPDATE_GENRE, { id, input: body }, token)).updateGenre;
    }

    async delete(token: string, id: string): Promise<void> {
        await this.graphql.execute<{ removeGenre: boolean }>(DELETE_GENRE, { id }, token);
    }
}
