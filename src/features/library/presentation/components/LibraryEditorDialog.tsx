'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useMedia } from '@/src/features/media/presentation/hooks/use-media';
import type { AddLibraryEntryParams } from '../../domain/repositories/library.repository';
import type {
  LibraryEntryChanges,
  MediaType,
  LibraryStatus,
} from '../../domain/entities/library-entry';
import type {
  LibraryEntryViewModel,
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

function isMediaType(value: string): value is MediaType {
  return value === 'GAME' || value === 'MOVIE' || value === 'BOOK';
}

const typeLabel = { GAME: 'Juego', MOVIE: 'Película', BOOK: 'Libro' } as const;

export function LibraryEditorDialog({
  entry,
  existingMediaItemIds,
  busy,
  error,
  onClose,
  onAdd,
  onSave,
  onDelete,
}: {
  entry: LibraryEntryViewModel | null;
  existingMediaItemIds: string[];
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onAdd: (params: AddLibraryEntryParams) => Promise<boolean>;
  onSave: (id: string, changes: LibraryEntryChanges) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mediaItemId, setMediaItemId] = useState('');
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
    const succeeded = entry
      ? await onSave(entry.id, {
          status,
          progress: Number(progress),
          rating: rating === '' ? null : Number(rating),
          isFavorite,
          notes: notes.trim() || null,
        })
      : selectedMediaItemId
        ? await onAdd({ mediaItemId: selectedMediaItemId })
        : false;
    if (succeeded) onClose();
  }

  async function handleDelete() {
    if (entry && (await onDelete(entry.id))) onClose();
  }

  const titleId = 'library-dialog-title';
  const selectedMediaItemId = mediaItemId;

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
                : 'Elige un elemento del catálogo para agregarlo.'}
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
              <LibraryMediaPicker
                selectedId={selectedMediaItemId}
                onSelect={setMediaItemId}
                existingMediaItemIds={existingMediaItemIds}
              />
            )}

            {entry && <div className="grid gap-4 sm:grid-cols-2">
              <label className="fieldset">
                <span className="fieldset-legend">Estado</span>
                <select
                  className="select w-full"
                  aria-label="Estado"
                  value={status}
                  onChange={(event) => {
                    if (isLibraryStatus(event.target.value)) {
                      setStatus(event.target.value);
                      if (event.target.value === 'PENDING') setRating('');
                    }
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
                  aria-label="Progreso"
                  type="number"
                  min="0"
                  max={entry?.progressMaximum}
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
                  aria-label="Calificación"
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                  disabled={status === 'PENDING'}
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
                  aria-label="Favorito"
                  value={String(isFavorite)}
                  onChange={(event) =>
                    setIsFavorite(event.target.value === 'true')
                  }
                >
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </label>
            </div>}

            {entry && <label className="fieldset">
              <span className="fieldset-legend">Notas</span>
              <textarea
                className="textarea min-h-24 w-full resize-y"
                aria-label="Notas"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Una idea, una cita o dónde lo dejaste…"
              />
            </label>}

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
              ) : <span />}
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
                    busy || (!entry && !selectedMediaItemId)
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

function LibraryMediaPicker({
  selectedId,
  onSelect,
  existingMediaItemIds,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  existingMediaItemIds: string[];
}) {
  const media = useMedia();
  const setMediaFilters = media.setFilters;
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    setMediaFilters({ q: undefined, type: undefined, page: 1, limit: 12, sortBy: 'title', order: 'ASC' });
  }, [setMediaFilters]);

  const existing = new Set(existingMediaItemIds);
  const options = media.items.filter((item) => item.approvalStatus === 'APPROVED' && !existing.has(item.id));
  const selected = options.find((item) => item.id === selectedId);

  function applyCatalogFilters() {
    onSelect('');
    setMediaFilters({ q: search.trim() || undefined, type: isMediaType(type) ? type : undefined, page: 1 });
  }

  return (
    <section className="grid gap-3" aria-label="Seleccionar del catálogo multimedia">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <label className="fieldset">
          <span className="fieldset-legend">Buscar en el catálogo</span>
          <input className="input w-full" type="search" aria-label="Buscar en el catálogo" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <label className="fieldset">
          <span className="fieldset-legend">Tipo</span>
          <select className="select w-full" aria-label="Tipo de catálogo" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">Todos</option>
            <option value="GAME">Juegos</option>
            <option value="MOVIE">Películas</option>
            <option value="BOOK">Libros</option>
          </select>
        </label>
        <button className="btn btn-secondary self-end" type="button" onClick={applyCatalogFilters}>Buscar</button>
      </div>

      {media.errorMessage && <div role="alert" className="alert alert-error">{media.errorMessage}</div>}
      {media.isLoading ? <p role="status">Cargando catálogo…</p> : options.length === 0 ? (
        <p className="rounded-xl border border-dashed border-base-300 p-4 text-sm text-base-content/70">No hay elementos disponibles con esta búsqueda.</p>
      ) : (
        <>
          <label className="fieldset">
            <span className="fieldset-legend">Elemento multimedia</span>
            <select className="select w-full" aria-label="Elemento multimedia" value={selectedId} onChange={(event) => onSelect(event.target.value)} required>
              <option value="">Selecciona un elemento</option>
              {options.map((item) => <option key={item.id} value={item.id}>{item.title} · {typeLabel[item.type]} · {item.creator}</option>)}
            </select>
          </label>
          {selected && <p className="text-sm text-base-content/70">{selected.releaseYear} · {selected.genres.map((genre) => genre.name).join(', ')}</p>}
          <nav className="flex items-center justify-between text-sm" aria-label="Paginación del catálogo">
            <button type="button" className="btn btn-ghost btn-sm" disabled={media.meta.page <= 1 || media.isLoading} onClick={() => { onSelect(''); setMediaFilters({ page: media.meta.page - 1 }); }}>Anterior</button>
            <span>Página {media.meta.page} de {Math.max(1, media.meta.totalPages)}</span>
            <button type="button" className="btn btn-ghost btn-sm" disabled={media.meta.page >= media.meta.totalPages || media.isLoading} onClick={() => { onSelect(''); setMediaFilters({ page: media.meta.page + 1 }); }}>Siguiente</button>
          </nav>
        </>
      )}
    </section>
  );
}
