import type { __Feature__, __Feature__Draft } from '../entities/__feature-kebab__';

export type Create__Feature__Params = __Feature__Draft;

/**
 * Contract the domain needs. It speaks only domain types: no DTOs, no HTTP, no SDK classes.
 * Implemented in infrastructure/repositories/__feature-kebab__.repository.impl.ts.
 */
export interface __Feature__Repository {
    getAll(): Promise<__Feature__[]>;
    getById(id: string): Promise<__Feature__ | null>;
    create(params: Create__Feature__Params): Promise<__Feature__>;
}
