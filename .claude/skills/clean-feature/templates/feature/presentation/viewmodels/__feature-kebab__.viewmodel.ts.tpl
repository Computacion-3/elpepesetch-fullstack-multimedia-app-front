import type { __Feature__ } from '../../domain/entities/__feature-kebab__';

/**
 * Plain, serializable data shaped for the UI. This (not the entity) is what goes into Redux:
 * class instances and Date objects break serialization and SSR hydration.
 */
export interface __Feature__ItemViewModel {
    readonly id: string;
    readonly title: string;
    readonly descriptionText: string;
    readonly createdAtIso: string;
    readonly createdAtLabel: string;
}

export class __Feature__ViewModelMapper {
    static toViewModel(entity: __Feature__): __Feature__ItemViewModel {
        return {
            id: entity.id,
            title: entity.name,
            descriptionText: entity.hasDescription() ? entity.description! : 'No description.',
            createdAtIso: entity.createdAt.toISOString(),
            createdAtLabel: entity.createdAt.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }),
        };
    }
}
