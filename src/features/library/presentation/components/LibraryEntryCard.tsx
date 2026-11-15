import type { LibraryEntryViewModel } from '../viewmodels/library-entry.viewmodel';
import styles from './library.module.css';

const statusText = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completado',
  DROPPED: 'Abandonado',
} as const;

const typeText = { GAME: 'JUEGO', MOVIE: 'PELÍCULA', BOOK: 'LIBRO' } as const;
const progressUnit = { GAME: 'h', MOVIE: 'min', BOOK: 'páginas' } as const;

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
  const coverClass =
    entry.type === 'GAME'
      ? styles.coverGame
      : entry.type === 'MOVIE'
        ? styles.coverMovie
        : styles.coverBook;
  const statusClass =
    entry.status === 'COMPLETED'
      ? styles.statusCompleted
      : entry.status === 'IN_PROGRESS'
        ? styles.statusProgress
        : entry.status === 'DROPPED'
          ? styles.statusDropped
          : '';
  const addedDate = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(entry.addedAt));

  return (
    <article className={styles.card}>
      <div className={`${styles.cover} ${coverClass}`}>
        <span className={styles.coverLabel} aria-hidden="true">
          {typeText[entry.type]}
        </span>
        <span className={styles.coverLetters} aria-hidden="true">
          {entry.cover}
        </span>
        <button
          type="button"
          className={`${styles.favorite} ${entry.isFavorite ? styles.favoriteOn : ''}`}
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
      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <h2 className={styles.cardTitle} title={entry.title}>
            {entry.title}
          </h2>
          <span className={`${styles.status} ${statusClass}`}>
            {statusText[entry.status]}
          </span>
        </div>
        <p className={styles.creator}>
          {entry.creator} · {entry.releaseYear}
        </p>
        <p className={styles.addedDate}>Agregado el {addedDate}</p>
        {progress !== null ? (
          <div>
            <div className={styles.meterLabel}>
              <span>Progreso</span>
              <span>
                {entry.progress} / {entry.progressMaximum}{' '}
                {progressUnit[entry.type]}
              </span>
            </div>
            <div
              className={styles.meter}
              role="progressbar"
              aria-label={`Progreso de ${entry.title}`}
              aria-valuemin={0}
              aria-valuemax={entry.progressMaximum ?? entry.progress}
              aria-valuenow={Math.min(
                entry.progress,
                entry.progressMaximum ?? entry.progress,
              )}
            >
              <div
                className={styles.meterFill}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className={styles.meterLabel}>
            <span>Progreso</span>
            <span>
              {entry.progress} {progressUnit[entry.type]}
            </span>
          </div>
        )}
        <div className={styles.cardFooter}>
          <span className={styles.count}>
            Promedio {entry.averageRating?.toFixed(1) ?? '—'}
          </span>
          <span className={styles.rating}>
            {entry.rating ? `★ ${entry.rating}/10` : 'Sin calificar'}
          </span>
          <button
            type="button"
            className={styles.cardAction}
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
