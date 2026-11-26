'use client';

import { useCallback, useEffect, useState } from 'react';
import type { MediaApprovalDraft, MediaQuery } from '../../domain/entities/media-item';
import { useMedia } from '../hooks/use-media';
import { GenreFilter } from '@/src/features/genres/presentation/components/GenreFilter';
import { Alert } from '@/src/shared/ui/Alert';
import { Pagination } from '@/src/shared/ui/Pagination';
import { MediaFilters } from './MediaFilters';
import { MediaApprovalCard } from './MediaApprovalCard';
import { useAppSelector } from '@/src/store/hooks';
import { selectModerationQueueCounts } from '@/src/features/realtime/presentation/store/realtime.selectors';
import { Spinner } from '@/src/shared/ui/Spinner';

const INITIAL_QUERY: MediaQuery = { page: 1, limit: 12, sortBy: 'title', order: 'ASC' };

/** Cola paginada de moderación; el permiso se vuelve a comprobar en cada Server Action. */
export function MediaApprovalScreen() {
    const media = useMedia();
    const [query, setQuery] = useState(INITIAL_QUERY);
    const loadPending = media.loadPending;
    const queueCounts = useAppSelector(selectModerationQueueCounts);

    useEffect(() => {
        loadPending(query);
    }, [loadPending, query]);

    const setFilters = useCallback((changes: Partial<MediaQuery>) => {
        setQuery((current) => ({ ...current, ...changes, page: changes.page ?? 1 }));
    }, []);

    const decide = useCallback((id: string, decision: MediaApprovalDraft) =>
        media.decide(id, decision, query), [media.decide, query]);

    return (
        <section className="space-y-6">
            <header>
                <p className="text-sm font-semibold uppercase tracking-wide text-brand">Administración</p>
                <h1 className="text-3xl font-bold">Propuestas pendientes</h1>
                <p className="mt-2 text-muted">Revisa cada propuesta y apruébala o indica el motivo del rechazo.</p>
            </header>
            {queueCounts && (
                <p className="rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-muted" role="status">
                    Cola en vivo: {queueCounts.pendingMedia} propuestas y {queueCounts.openReports} reportes abiertos.
                </p>
            )}
            <MediaFilters query={query} onChange={setFilters}>
                <GenreFilter value={query.genreId ?? ''} onChange={(genreId) => setFilters({ genreId: genreId || undefined })} />
            </MediaFilters>
            {media.errorMessage && <Alert variant="error">{media.errorMessage}</Alert>}
            {media.pendingStatus === 'loading' && <Spinner label="Cargando propuestas" size="lg" className="py-12" />}
            {media.pendingStatus === 'succeeded' && media.pendingItems.length === 0 && (
                <p className="rounded-2xl border border-dashed border-white/20 bg-surface px-6 py-10 text-center text-muted">No hay propuestas pendientes.</p>
            )}
            <div className="space-y-4">
                {media.pendingItems.map((item) => (
                    <MediaApprovalCard
                        key={item.id}
                        item={item}
                        loading={media.isMutating}
                        onDecision={(decision) => decide(item.id, decision)}
                    />
                ))}
            </div>
            <Pagination page={media.pendingMeta.page} totalPages={media.pendingMeta.totalPages} onChange={(page) => setFilters({ page })} />
        </section>
    );
}
