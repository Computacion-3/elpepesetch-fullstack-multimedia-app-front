'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Create__Feature__Params } from '../../domain/repositories/__feature-kebab__.repository';

interface __Feature__FormProps {
    onSubmit: (params: Create__Feature__Params) => Promise<boolean>;
    isSubmitting: boolean;
}

/**
 * Collects input and delegates. Business rules are NOT duplicated here: the use case validates
 * and its ValidationError message reaches the UI through the facade's errorMessage.
 */
export function __Feature__Form({ onSubmit, isSubmitting }: __Feature__FormProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const ok = await onSubmit({ name, description: description || undefined });
        if (ok) {
            setName('');
            setDescription('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
            <label className="flex flex-col gap-1 text-sm">
                Name
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="rounded border border-gray-300 px-3 py-2"
                />
            </label>
            <label className="flex flex-col gap-1 text-sm">
                Description (optional)
                <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                    className="rounded border border-gray-300 px-3 py-2"
                />
            </label>
            <button
                type="submit"
                disabled={isSubmitting}
                className="self-end rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
                {isSubmitting ? 'Saving…' : 'Save'}
            </button>
        </form>
    );
}
