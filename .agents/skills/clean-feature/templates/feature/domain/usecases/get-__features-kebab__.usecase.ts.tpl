import type { __Feature__ } from '../entities/__feature-kebab__';
import type { __Feature__Repository } from '../repositories/__feature-kebab__.repository';

export class Get__Features__UseCase {
    constructor(private readonly repository: __Feature__Repository) { }

    async execute(): Promise<__Feature__[]> {
        const items = await this.repository.getAll();
        return [...items].sort((a, b) => a.name.localeCompare(b.name));
    }
}
