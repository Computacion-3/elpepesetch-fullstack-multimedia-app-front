import { assertValid__Feature__Draft } from '../entities/__feature-kebab__';
import type { __Feature__ } from '../entities/__feature-kebab__';
import type { Create__Feature__Params, __Feature__Repository } from '../repositories/__feature-kebab__.repository';

export class Create__Feature__UseCase {
    constructor(private readonly repository: __Feature__Repository) { }

    async execute(params: Create__Feature__Params): Promise<__Feature__> {
        // Validate invariants before touching the network.
        assertValid__Feature__Draft(params);
        return this.repository.create({
            name: params.name.trim(),
            description: params.description?.trim() || undefined,
        });
    }
}
