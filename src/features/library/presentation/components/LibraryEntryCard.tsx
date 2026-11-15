import type { LibraryEntryViewModel } from '../viewmodels/library-entry.viewmodel';

const statusText = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completado',
  DROPPED: 'Abandonado',
} as const;

const statusClass = {
  PENDING: 'badge-ghost',
  IN_PROGRESS: 'badge-info',
  COMPLETED: 'badge-success',
  DROPPED: 'badge-error',
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
    <article className="card min-w-0 overflow-hidden border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`relative flex min-h-40 items-end overflow-hidden p-4 ${coverClass[entry.type]}`}
      >
        <span className="badge badge-ghost absolute left-3 top-3 bg-base-100/75 text-xs font-bold">
          {typeText[entry.type]}
        </span>
        <span
          className="relative z-10 text-5xl font-extrabold tracking-tight text-white [text-shadow:0_2px_14px_#17201844]"
          aria-hidden="true"
        >
          {entry.cover}
        </span>
        <button
          type="button"
          className={`btn btn-circle btn-sm absolute right-3 top-3 border-base-100/60 bg-base-100/80 text-lg ${entry.isFavorite ? 'text-error' : 'text-base-content'}`}
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
      <div className="card-body gap-3 p-4">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <h2 className="truncate font-bold tracking-tight" title={entry.title}>
            {entry.title}
          </h2>
          <span
            className={`badge badge-sm shrink-0 ${statusClass[entry.status]}`}
          >
            {statusText[entry.status]}
          </span>
        </div>
        <p className="text-sm text-base-content/70">
          {entry.creator} · {entry.releaseYear}
        </p>
        <p className="-mt-2 text-xs text-base-content/50">
          Agregado el {addedDate}
        </p>
        <div>
          <div className="mb-2 flex justify-between gap-2 text-xs text-base-content/70">
            <span>Progreso</span>
            <span>
              {entry.progress}
              {entry.progressMaximum ? ` / ${entry.progressMaximum}` : ''}{' '}
              {progressUnit[entry.type]}
            </span>
          </div>
          {progress !== null && (
            <progress
              className="progress progress-primary w-full"
              value={progress}
              max="100"
              aria-label={`Progreso de ${entry.title}`}
            />
          )}
        </div>
        <div className="card-actions mt-1 flex-wrap items-center justify-between border-t border-base-300 pt-3">
          <span className="text-xs text-base-content/60">
            Promedio {entry.averageRating?.toFixed(1) ?? '—'}
          </span>
          <span className="text-sm font-semibold text-warning">
            {entry.rating ? `★ ${entry.rating}/10` : 'Sin calificar'}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
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
