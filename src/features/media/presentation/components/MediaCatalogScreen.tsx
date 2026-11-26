'use client';

import Link from 'next/link';
import { useMedia } from '../hooks/use-media';
import { GenreFilter } from '@/src/features/genres/presentation/components/GenreFilter';
import { Alert } from '@/src/shared/ui/Alert';
import { Pagination } from '@/src/shared/ui/Pagination';
import { MediaCard } from './MediaCard';
import { MediaFilters } from './MediaFilters';

/** Catálogo interactivo; filtros y paginación delegan la consulta al hook fachada. */
export function MediaCatalogScreen() {
    const media = useMedia();

    return (
        <section className="space-y-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-brand">Descubre</p>
                    <h1 className="text-3xl font-bold">Catálogo multimedia</h1>
                    <p className="mt-2 text-muted">Juegos, películas y libros para explorar.</p>
                </div>
                <Link href="/catalog/proponer" className="inline-flex min-h-11 items-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-background transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">Proponer un elemento</Link>
            </header>

            <MediaFilters query={media.query} onChange={media.setFilters}>
                <GenreFilter value={media.query.genreId ?? ''} onChange={(genreId) => media.setFilters({ genreId: genreId || undefined })} />
            </MediaFilters>

            {media.errorMessage && <Alert variant="error">{media.errorMessage}</Alert>}
            {media.isLoading && <p role="status">Cargando catálogo…</p>}
            {!media.isLoading && media.listStatus === 'succeeded' && media.items.length === 0 && (
                <p className="rounded-2xl border border-dashed border-white/20 bg-surface p-8 text-center text-muted">No encontramos elementos con esos filtros.</p>
            )}

            {media.items.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {media.items.map((item) => <MediaCard key={item.id} item={item} />)}
                </div>
            )}

            <footer className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-muted">{media.meta.total} elementos</p>
                <Pagination page={media.meta.page} totalPages={media.meta.totalPages} onChange={(page) => media.setFilters({ page })} />
            </footer>
        </section>
    );
}
