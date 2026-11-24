'use client';

import { use__Features__ } from '../hooks/use-__features-kebab__';
import { __Feature__Card } from './__Feature__Card';
import { __Feature__Form } from './__Feature__Form';

/** Client screen composed from the facade hook. The route (app/) only renders this. */
export function __Features__Screen() {
    const { items, isLoading, isMutating, errorMessage, create__Feature__ } = use__Features__();

    return (
        <main className="mx-auto max-w-3xl space-y-6 p-6">
            <h1 className="text-2xl font-bold">__Features__</h1>

            <__Feature__Form onSubmit={create__Feature__} isSubmitting={isMutating} />

            {errorMessage && (
                <p role="alert" className="rounded bg-red-100 px-3 py-2 text-sm text-red-800">
                    {errorMessage}
                </p>
            )}

            {isLoading && items.length === 0 ? (
                <p className="text-sm opacity-60">Loading…</p>
            ) : items.length === 0 ? (
                <p className="text-sm opacity-60">Nothing here yet.</p>
            ) : (
                <section className="grid gap-3">
                    {items.map((item) => (
                        <__Feature__Card key={item.id} item={item} />
                    ))}
                </section>
            )}
        </main>
    );
}
