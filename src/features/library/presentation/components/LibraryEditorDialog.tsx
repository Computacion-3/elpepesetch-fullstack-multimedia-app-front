'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { AddLibraryEntryParams } from '../../domain/repositories/library.repository';
import type { LibraryEntryChanges } from '../../domain/entities/library-entry';
import type { LibraryEntryViewModel } from '../viewmodels/library-entry.viewmodel';
import type { LibraryStatus } from '../../domain/entities/library-entry';
import type { LibraryMediaOptionViewModel } from '../viewmodels/library-entry.viewmodel';
import styles from './library.module.css';

const statuses: { value: LibraryStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'DROPPED', label: 'Abandonado' },
];

function isLibraryStatus(value: string): value is LibraryStatus {
  return statuses.some((item) => item.value === value);
}

const typeLabel = { GAME: 'Juego', MOVIE: 'Película', BOOK: 'Libro' } as const;

export function LibraryEditorDialog({
  entry,
  options,
  optionsLoading,
  busy,
  error,
  onClose,
  onAdd,
  onSave,
  onDelete,
}: {
  entry: LibraryEntryViewModel | null;
  options: LibraryMediaOptionViewModel[];
  optionsLoading: boolean;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onAdd: (params: AddLibraryEntryParams) => Promise<boolean>;
  onSave: (id: string, changes: LibraryEntryChanges) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mediaItemId, setMediaItemId] = useState(options[0]?.id ?? '');
  const [status, setStatus] = useState<LibraryStatus>(
    entry?.status ?? 'PENDING',
  );
  const [progress, setProgress] = useState(String(entry?.progress ?? 0));
  const [rating, setRating] = useState(
    entry?.rating == null ? '' : String(entry.rating),
  );
  const [isFavorite, setIsFavorite] = useState(entry?.isFavorite ?? false);
  const [notes, setNotes] = useState(entry?.notes ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!mediaItemId && options.length > 0) setMediaItemId(options[0].id);
  }, [mediaItemId, options]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericProgress = Number(progress);
    const numericRating = rating === '' ? null : Number(rating);
    const changes = {
      status,
      progress: numericProgress,
      rating: numericRating,
      isFavorite,
      notes: notes.trim() || null,
    };

    const succeeded = entry
      ? await onSave(entry.id, changes)
      : mediaItemId
        ? await onAdd({ mediaItemId, ...changes })
        : false;

    if (succeeded) onClose();
  }

  async function handleDelete() {
    if (entry && (await onDelete(entry.id))) onClose();
  }

  const titleId = 'library-dialog-title';

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className={styles.dialogHeader}>
        <div>
          <span className={styles.eyebrow}>
            {entry ? 'Tu colección' : 'Añadir a la colección'}
          </span>
          <h2 id={titleId} className={styles.dialogTitle}>
            {entry ? entry.title : 'Nuevo elemento'}
          </h2>
          <p className={styles.dialogCopy}>
            {entry
              ? `${typeLabel[entry.type]} · ${entry.creator} · ${entry.releaseYear}`
              : 'Selecciona una opción temporal del catálogo de muestra.'}
          </p>
        </div>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Cerrar"
          onClick={onClose}
        >
          ×
        </button>
      </header>

      {entry && confirmDelete ? (
        <section
          className={styles.confirmBox}
          aria-labelledby="delete-title"
          aria-describedby="delete-copy"
        >
          <h3 id="delete-title" className={styles.confirmTitle}>
            ¿Eliminar de tu biblioteca?
          </h3>
          <p id="delete-copy" className={styles.confirmCopy}>
            Se quitará “{entry.title}” de esta biblioteca de muestra.
          </p>
          {error && (
            <p className={styles.dialogError} role="alert">
              {error}
            </p>
          )}
          <div className={styles.actionGroup}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setConfirmDelete(false)}
            >
              Volver
            </button>
            <button
              type="button"
              className={styles.dangerButton}
              disabled={busy}
              onClick={handleDelete}
            >
              {busy ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
          </div>
        </section>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} aria-busy={busy}>
          {!entry && (
            <label className={styles.field}>
              Elemento multimedia
              <select
                className={styles.select}
                value={mediaItemId}
                onChange={(event) => setMediaItemId(event.target.value)}
                disabled={optionsLoading || options.length === 0}
                required
              >
                {options.length === 0 && (
                  <option value="">No hay opciones disponibles</option>
                )}
                {options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title} · {typeLabel[option.type]} · {option.creator}
                  </option>
                ))}
              </select>
              <span className={styles.help}>
                Opciones de demostración; se conectarán al catálogo Media.
              </span>
            </label>
          )}

          <div className={styles.formGrid}>
            <label className={styles.field}>
              Estado
              <select
                className={styles.select}
                value={status}
                onChange={(event) => {
                  if (isLibraryStatus(event.target.value))
                    setStatus(event.target.value);
                }}
              >
                {statuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              Progreso{' '}
              {entry
                ? `(${entry.type === 'BOOK' ? 'páginas' : entry.type === 'MOVIE' ? 'minutos' : 'horas'})`
                : ''}
              <input
                className={styles.input}
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={progress}
                onChange={(event) => setProgress(event.target.value)}
              />
            </label>
            <label className={styles.field}>
              Calificación
              <select
                className={styles.select}
                value={rating}
                onChange={(event) => setRating(event.target.value)}
              >
                <option value="">Sin calificar</option>
                {Array.from({ length: 10 }, (_, index) => index + 1).map(
                  (value) => (
                    <option key={value} value={value}>
                      {value} / 10
                    </option>
                  ),
                )}
              </select>
              {status === 'PENDING' && (
                <span className={styles.help}>
                  Las entradas pendientes no pueden tener calificación. Déjala
                  sin calificar para guardar este estado.
                </span>
              )}
            </label>
            <label className={styles.field}>
              <span>Favorito</span>
              <select
                className={styles.select}
                value={String(isFavorite)}
                onChange={(event) =>
                  setIsFavorite(event.target.value === 'true')
                }
              >
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </label>
          </div>

          <label className={styles.field}>
            Notas
            <textarea
              className={styles.textarea}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Una idea, una cita o dónde lo dejaste…"
            />
          </label>

          {error && (
            <p className={styles.dialogError} role="alert">
              {error}
            </p>
          )}

          <div className={styles.formActions}>
            {entry ? (
              <button
                type="button"
                className={styles.dangerButton}
                onClick={() => setConfirmDelete(true)}
              >
                Eliminar
              </button>
            ) : (
              <span className={styles.help}>
                Los cambios se guardan solo en esta sesión.
              </span>
            )}
            <div className={styles.actionGroup}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={
                  busy || (!entry && (optionsLoading || options.length === 0))
                }
              >
                {busy
                  ? 'Guardando…'
                  : entry
                    ? 'Guardar cambios'
                    : 'Agregar a mi biblioteca'}
              </button>
            </div>
          </div>
        </form>
      )}
    </dialog>
  );
}
