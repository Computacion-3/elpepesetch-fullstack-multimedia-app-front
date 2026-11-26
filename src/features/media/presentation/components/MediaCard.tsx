import Link from 'next/link';
import type { MediaItemViewModel } from '../viewmodels/media.viewmodel';

const TYPE_LABELS = { GAME: 'Videojuego', MOVIE: 'Película', BOOK: 'Libro' };

/** Tarjeta compacta del catálogo que lleva al detalle del elemento. */
export function MediaCard({ item }: { item: MediaItemViewModel }) {
    return (
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-xl">
            <Link href={`/catalog/${item.id}`} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                <div
                    role="img"
                    aria-label={item.coverUrl ? `Portada de ${item.title}` : 'Sin portada disponible'}
                    className="h-44 bg-surface-raised bg-cover bg-center"
                    style={item.coverUrl ? { backgroundImage: `url("${item.coverUrl}")` } : undefined}
                />
                <div className="space-y-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand">{TYPE_LABELS[item.type]}</p>
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p className="text-sm text-muted">{item.creator} · {item.releaseYear}</p>
                    <p className="line-clamp-2 text-sm text-muted">{item.description || 'Sin descripción.'}</p>
                    <p className="text-sm">★ {item.averageRating.toFixed(1)} ({item.ratingsCount} calificaciones)</p>
                    <p className="text-sm text-brand">Ver detalles</p>
                </div>
            </Link>
        </article>
    );
}
