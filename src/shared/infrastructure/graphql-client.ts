import { HttpError, type HttpClient } from './http-client';

/** Respuesta estándar del protocolo GraphQL, que puede incluir datos y errores. */
interface GraphQLResponse<T> {
    data?: T;
    errors?: {
        message: string;
        extensions?: {
            status?: number;
            originalError?: { statusCode?: number; message?: string | string[] };
        };
    }[];
}

/** Contrato mínimo compartido para ejecutar operaciones GraphQL desde infraestructura. */
export interface GraphQLClient {
    execute<T>(document: string, variables?: Record<string, unknown>, token?: string): Promise<T>;
}

/** Reutiliza HttpClient para enviar operaciones y conservar autenticación y errores comunes. */
export function createGraphQLClient(http: HttpClient): GraphQLClient {
    return {
        async execute<T>(document: string, variables?: Record<string, unknown>, token?: string): Promise<T> {
            const response = await http.post<GraphQLResponse<T>>('/graphql', { query: document, variables }, token);
            // Nest puede devolver errores GraphQL con HTTP 200; se conservan como errores HTTP tipados.
            if (response.errors?.length) {
                const error = response.errors[0];
                const original = error.extensions?.originalError;
                throw new HttpError(
                    original?.statusCode ?? error.extensions?.status ?? 500,
                    [original?.message ?? error.message].flat().join('. '),
                    response,
                );
            }
            if (!response.data) throw new HttpError(500, 'La respuesta GraphQL no contiene datos', response);
            return response.data;
        },
    };
}
