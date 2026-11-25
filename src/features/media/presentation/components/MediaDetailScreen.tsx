'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useMedia } from '../hooks/use-media';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';

const TYPE_LABELS = { GAME: 'Videojuego', MOVIE: 'Película', BOOK: 'Libro' };

type MediaDetailScreenProps = {
    id: string;
    canEditProposal: boolean;
};

/** Carga un detalle y muestra solo opciones de edición que también autoriza el servidor. */
export function MediaDetailScreen({ id, canEditProposal }: MediaDetailScreenProps) {
    const media = useMedia();

    useEffect(() => {
        void media.getById(id);
        return media.clearDetail;
    }, [id, media.getById, media.clearDetail]);

    const item = media.selectedItem?.id === id ? media.selectedItem : null;

    return (
        <section className="space-y-6">
            <Link href="/catalog" className="text-sm font-medium text-brand hover:underline">← Volver al catálogo</Link>
            {media.detailStatus === 'loading' && <p role="status">Cargando detalle…</p>}
            {media.errorMessage && <Alert variant="error">{media.errorMessage}</Alert>}
            {item && (
                <article className="grid gap-6 md:grid-cols-[minmax(0,1fr)_2fr]">
                    <div
                        role="img"
                        aria-label={item.coverUrl ? `Portada de ${item.title}` : 'Sin portada disponible'}
                        className="min-h-72 rounded-lg bg-gray-100 bg-cover bg-center"
                        style={item.coverUrl ? { backgroundImage: `url("${item.coverUrl}")` } : undefined}
                    />
                    <div className="space-y-4">
                        <p className="text-sm font-semibold uppercase tracking-wide text-brand">{TYPE_LABELS[item.type]}</p>
                        <h1 className="text-3xl font-bold">{item.title}</h1>
                        <p className="text-lg text-gray-600">{item.creator} · {item.releaseYear}</p>
                        <p>{item.description || 'Sin descripción.'}</p>
                        <p className="text-sm">Géneros: {item.genres.map((genre) => genre.name).join(', ') || 'Sin géneros'}</p>
                        <p>Calificación: ★ {item.averageRating.toFixed(1)} ({item.ratingsCount} calificaciones)</p>
                        <p>Estado: {item.approvalStatus === 'PENDING' ? 'Pendiente de revisión' : item.approvalStatus === 'APPROVED' ? 'Aprobado' : 'Rechazado'}</p>
                        {item.rejectionReason && <Alert variant="error">Motivo del rechazo: {item.rejectionReason}</Alert>}
                        {item.type === 'GAME' && item.platform && <p>Plataforma: {item.platform}</p>}
                        {item.type === 'MOVIE' && item.durationMinutes && <p>Duración: {item.durationMinutes} minutos</p>}
                        {item.type === 'BOOK' && <p>{item.pages ? `${item.pages} páginas` : ''}{item.pages && item.isbn ? ' · ' : ''}{item.isbn ? `ISBN ${item.isbn}` : ''}</p>}
                        {canEditProposal && item.approvalStatus === 'PENDING' && (
                            <Link
                                href={`/catalog/proponer?id=${encodeURIComponent(item.id)}`}
                                className="inline-flex rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
                            >
                                Editar propuesta pendiente
                            </Link>
                        )}
                        <div>
                            <Button variant="secondary" onClick={() => media.reload()}>Actualizar detalle</Button>
                        </div>
                    </div>
                </article>
            )}
        </section>
    );
}
