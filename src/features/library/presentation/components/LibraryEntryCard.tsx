import type { LibraryEntryViewModel } from '../viewmodels/library-entry.viewmodel';

const statusText = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completado',
  DROPPED: 'Abandonado',
} as const;

const statusClass = {
  PENDING: 'bg-white/10 text-white/80',
  IN_PROGRESS: 'bg-brand/15 text-brand',
  COMPLETED: 'bg-emerald-400/15 text-emerald-300',
  DROPPED: 'bg-[#f07ba3]/15 text-[#f59ab7]',
} as const;

const typeText = { GAME: 'JUEGO', MOVIE: 'PELÍCULA', BOOK: 'LIBRO' } as const;
const progressUnit = { GAME: 'h', MOVIE: 'min', BOOK: 'páginas' } as const;
const coverClass = {
  GAME: 'bg-linear-to-br from-[#c9dfad] to-[#829e64]',
  MOVIE: 'bg-linear-to-br from-[#e7c6a6] to-[#c37d5c]',
  BOOK: 'bg-linear-to-br from-[#c7d9e4] to-[#778ea0]',
} as const;

export function LibraryEntryCard({
  entry,
  onOpen,
  onToggleFavorite,
  disabled,
  opening,
}: {
  entry: LibraryEntryViewModel;
  onOpen: (id: string) => void;
  onToggleFavorite: (entry: LibraryEntryViewModel) => void;
  disabled: boolean;
  opening: boolean;
}) {
  const progress = entry.progressMaximum
    ? Math.min(100, (entry.progress / entry.progressMaximum) * 100)
    : null;
  const addedDate = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(entry.addedAt));

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-sm transition-shadow hover:border-white/20 hover:shadow-lg">
      <div
        className={`relative flex min-h-48 items-end overflow-hidden p-4 ${entry.coverUrl ? 'bg-background' : coverClass[entry.type]}`}
      >
        {entry.coverUrl && <img src={entry.coverUrl} alt={`Portada de ${entry.title}`} className="absolute inset-0 h-full w-full object-cover" />}
        {entry.coverUrl && <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />}
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-bold">
          {typeText[entry.type]}
        </span>
        {!entry.coverUrl && <span
          className="relative z-10 text-5xl font-extrabold tracking-tight text-white [text-shadow:0_2px_14px_#17201844]"
          aria-hidden="true"
        >
          {entry.cover}
        </span>}
        <button
          type="button"
          className={`absolute right-3 top-3 grid size-10 place-items-center rounded-full border border-white/30 bg-background/80 text-xl transition hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${entry.isFavorite ? 'text-[#f07ba3]' : 'text-white'}`}
          aria-label={
            entry.isFavorite
              ? `Quitar ${entry.title} de favoritos`
              : `Marcar ${entry.title} como favorito`
          }
          aria-pressed={entry.isFavorite}
          disabled={disabled}
          onClick={() => onToggleFavorite(entry)}
        >
          {entry.isFavorite ? '♥' : '♡'}
        </button>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <h2 className="truncate font-bold tracking-tight" title={entry.title}>
            {entry.title}
          </h2>
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-xs ${statusClass[entry.status]}`}
          >
            {statusText[entry.status]}
          </span>
        </div>
        <p className="text-sm text-muted">
          {entry.creator} · {entry.releaseYear}
        </p>
        {entry.genres.length > 0 && <div className="flex flex-wrap gap-1.5" aria-label="Géneros">
          {entry.genres.slice(0, 3).map((genre) => <span key={genre.id} className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-muted">{genre.name}</span>)}
        </div>}
        <p className="-mt-2 text-xs text-muted">
          Agregado el {addedDate}
        </p>
        <div>
          <div className="mb-2 flex justify-between gap-2 text-xs text-muted">
            <span>Progreso</span>
            <span>
              {entry.progress}
              {entry.progressMaximum ? ` / ${entry.progressMaximum}` : ''}{' '}
              {progressUnit[entry.type]}
            </span>
          </div>
          {progress !== null && (
            <progress
              className="h-2 w-full accent-brand"
              value={progress}
              max="100"
              aria-label={`Progreso de ${entry.title}`}
            />
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
          <span className="text-xs text-muted">
            Promedio {entry.averageRating?.toFixed(1) ?? '—'}
          </span>
          <span className="text-sm font-semibold text-amber-300">
            {entry.rating ? `★ ${entry.rating}/10` : 'Sin calificar'}
          </span>
          <button
            type="button"
            className="min-h-10 rounded-lg px-3 text-sm font-semibold text-brand hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50"
            disabled={opening}
            onClick={() => onOpen(entry.id)}
          >
            {opening ? 'Abriendo…' : 'Ver detalle'}{' '}
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </article>
  );
}
