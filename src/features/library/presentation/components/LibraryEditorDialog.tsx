'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { AddLibraryEntryParams } from '../../domain/repositories/library.repository';
import type {
  LibraryEntryChanges,
  LibraryStatus,
} from '../../domain/entities/library-entry';
import type {
  LibraryEntryViewModel,
  LibraryMediaOptionViewModel,
} from '../viewmodels/library-entry.viewmodel';

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
    const changes: LibraryEntryChanges = {
      status,
      progress: numericProgress,
      rating: numericRating,
      isFavorite,
      notes: notes.trim() || null,
    };

    const selectedMediaItemId = mediaItemId || options[0]?.id || '';
    const succeeded = entry
      ? await onSave(entry.id, changes)
      : selectedMediaItemId
        ? await onAdd({ mediaItemId: selectedMediaItemId, ...changes })
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
      className="modal"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <section className="modal-box max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-7">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              {entry ? 'Tu colección' : 'Añadir a la colección'}
            </span>
            <h2 id={titleId} className="mt-1 text-2xl font-bold tracking-tight">
              {entry ? entry.title : 'Nuevo elemento'}
            </h2>
            <p className="mt-2 text-sm text-base-content/70">
              {entry
                ? `${typeLabel[entry.type]} · ${entry.creator} · ${entry.releaseYear}`
                : 'Selecciona un elemento visible del catálogo multimedia.'}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-circle btn-ghost btn-sm"
            aria-label="Cerrar"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {entry && confirmDelete ? (
          <section
            className="rounded-box border border-error/30 bg-error/5 p-4"
            aria-labelledby="delete-title"
            aria-describedby="delete-copy"
          >
            <h3 id="delete-title" className="font-bold">
              ¿Eliminar de tu biblioteca?
            </h3>
            <p id="delete-copy" className="mt-1 text-sm text-base-content/70">
              Se quitará “{entry.title}” de tu biblioteca.
            </p>
            {error && (
              <div className="alert alert-error mt-3" role="alert">
                {error}
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setConfirmDelete(false)}
              >
                Volver
              </button>
              <button
                type="button"
                className="btn btn-error"
                disabled={busy}
                onClick={handleDelete}
              >
                {busy && (
                  <span
                    className="loading loading-spinner loading-sm"
                    aria-hidden="true"
                  />
                )}
                {busy ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </section>
        ) : (
          <form className="grid gap-4" onSubmit={handleSubmit} aria-busy={busy}>
            {!entry && (
              <label className="fieldset">
                <span className="fieldset-legend">Elemento multimedia</span>
                <select
                  className="select w-full"
                  value={mediaItemId || options[0]?.id || ''}
                  onChange={(event) => setMediaItemId(event.target.value)}
                  disabled={optionsLoading || options.length === 0}
                  required
                >
                  {options.length === 0 && (
                    <option value="">No hay opciones disponibles</option>
                  )}
                  {options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title} · {typeLabel[option.type]} ·{' '}
                      {option.creator}
                    </option>
                  ))}
                </select>
                <span className="label text-xs text-base-content/60">
                  Opciones sincronizadas con el catálogo multimedia.
                </span>
              </label>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="fieldset">
                <span className="fieldset-legend">Estado</span>
                <select
                  className="select w-full"
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
              <label className="fieldset">
                <span className="fieldset-legend">
                  Progreso
                  {entry
                    ? ` (${entry.type === 'BOOK' ? 'páginas' : entry.type === 'MOVIE' ? 'minutos' : 'horas'})`
                    : ''}
                </span>
                <input
                  className="input w-full"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={progress}
                  onChange={(event) => setProgress(event.target.value)}
                />
              </label>
              <label className="fieldset">
                <span className="fieldset-legend">Calificación</span>
                <select
                  className="select w-full"
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
                  <span className="label text-xs text-base-content/60">
                    Las entradas pendientes no pueden tener calificación. Déjala
                    sin calificar para guardar este estado.
                  </span>
                )}
              </label>
              <label className="fieldset">
                <span className="fieldset-legend">Favorito</span>
                <select
                  className="select w-full"
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

            <label className="fieldset">
              <span className="fieldset-legend">Notas</span>
              <textarea
                className="textarea min-h-24 w-full resize-y"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Una idea, una cita o dónde lo dejaste…"
              />
            </label>

            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}

            <footer className="flex flex-col-reverse justify-between gap-3 pt-2 sm:flex-row sm:items-center">
              {entry ? (
                <button
                  type="button"
                  className="btn btn-error btn-outline"
                  onClick={() => setConfirmDelete(true)}
                >
                  Eliminar
                </button>
              ) : (
                <span className="text-xs text-base-content/60">
                  Los cambios se guardarán en tu cuenta.
                </span>
              )}
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    busy || (!entry && (optionsLoading || options.length === 0))
                  }
                >
                  {busy && (
                    <span
                      className="loading loading-spinner loading-sm"
                      aria-hidden="true"
                    />
                  )}
                  {busy
                    ? 'Guardando…'
                    : entry
                      ? 'Guardar cambios'
                      : 'Agregar a mi biblioteca'}
                </button>
              </div>
            </footer>
          </form>
        )}
      </section>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Cerrar" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  );
}
