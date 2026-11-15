import { ValidationError } from '@/src/shared/domain/errors';

/** Data the user provides to create a __Feature__ (no id, no server timestamps). */
export interface __Feature__Draft {
    readonly name: string;
    readonly description?: string;
}

export interface __Feature__Props extends __Feature__Draft {
    readonly id: string;
    readonly createdAt: Date;
}

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 100;

/**
 * Business invariants live here, once. The create use case calls this BEFORE persisting,
 * and the entity constructor calls it again so no invalid __Feature__ can exist in memory.
 */
export function assertValid__Feature__Draft(draft: __Feature__Draft): void {
    const name = draft.name?.trim() ?? '';
    if (name.length < NAME_MIN_LENGTH) {
        throw new ValidationError(`Name must have at least ${NAME_MIN_LENGTH} characters.`);
    }
    if (name.length > NAME_MAX_LENGTH) {
        throw new ValidationError(`Name cannot exceed ${NAME_MAX_LENGTH} characters.`);
    }
}

export class __Feature__ {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly createdAt: Date;

    constructor(props: __Feature__Props) {
        assertValid__Feature__Draft(props);
        this.id = props.id;
        this.name = props.name.trim();
        this.description = props.description?.trim() || undefined;
        this.createdAt = props.createdAt;
    }

    hasDescription(): boolean {
        return Boolean(this.description);
    }
}
