'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useLibrary } from '../hooks/use-library';
import type { LibraryEntryViewModel } from '../viewmodels/library-entry.viewmodel';
import type {
  LibraryQuery,
  LibrarySortBy,
} from '../../domain/repositories/library.repository';
import type {
  LibraryStatus,
  MediaType,
} from '../../domain/entities/library-entry';
import { LibraryEditorDialog } from './LibraryEditorDialog';
import { LibraryEntryCard } from './LibraryEntryCard';

const baseQuery = {
  page: 1,
  limit: 10,
  sortBy: 'addedAt' as const,
  order: 'DESC' as const,
};
const statuses: LibraryStatus[] = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'DROPPED',
];
const mediaTypes: MediaType[] = ['GAME', 'MOVIE', 'BOOK'];
const sortOptions: LibrarySortBy[] = [
  'title',
  'releaseYear',
  'averageRating',
  'addedAt',
];

function isLibraryStatus(value: string): value is LibraryStatus {
  return statuses.some((status) => status === value);
}

function isMediaType(value: string): value is MediaType {
  return mediaTypes.some((type) => type === value);
}

export function LibraryView() {
  const library = useLibrary();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LibraryStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<MediaType | ''>('');
  const [sortBy, setSortBy] = useState<LibrarySortBy>('addedAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [isAdding, setIsAdding] = useState(false);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [openingEntry, setOpeningEntry] = useState(false);
  const activeEntry =
    library.selectedEntry?.id === activeEntryId ? library.selectedEntry : null;

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery: LibraryQuery = {
      ...baseQuery,
      q: search.trim() || undefined,
      status: statusFilter || undefined,
      type: typeFilter || undefined,
      sortBy,
      order: sortOrder,
    };
    library.reload(nextQuery);
  }

  function resetFilters() {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setSortBy('addedAt');
    setSortOrder('DESC');
    library.reload(baseQuery);
  }

  async function openEntry(entryId: string) {
    setOpeningEntry(true);
    const opened = await library.openEntry(entryId);
    setOpeningEntry(false);
    if (opened) setActiveEntryId(entryId);
  }

  function closeEditor() {
    setIsAdding(false);
    setActiveEntryId(null);
    library.closeEntry();
  }

  async function toggleFavorite(entry: LibraryEntryViewModel) {
    await library.updateEntry(entry.id, { isFavorite: !entry.isFavorite });
  }

  const editorOpen = isAdding || activeEntryId !== null;
  const isLoading = library.status === 'idle' || library.status === 'loading';

  return (
    <main className="min-h-screen bg-base-200 px-4 py-6 text-base-content sm:px-6 sm:py-9">
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 flex items-center justify-between gap-4">
          <Link
            className="flex items-center gap-3 font-bold"
            href="/"
            aria-label="Elpepesetch, inicio"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-content">
              e
            </span>
            <span>elpepesetch</span>
          </Link>
          <span className="text-right text-sm text-base-content/60">
            Colección personal · datos de demostración
          </span>
        </div>

        <header className="mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.13em] text-base-content/60">
              Tu espacio multimedia
            </span>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Tu biblioteca
            </h1>
            <p className="mt-3 max-w-2xl text-base-content/70">
              Juegos, películas y libros que estás descubriendo, disfrutando o
              guardando para después.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAdding(true)}
          >
            <span aria-hidden="true">＋</span> Añadir elemento
          </button>
        </header>

        <form
          className="mb-7 grid gap-3 rounded-box border border-base-300 bg-base-100 p-4 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.7fr)_repeat(3,minmax(140px,0.8fr))_auto_auto]"
          onSubmit={applyFilters}
          aria-label="Filtrar biblioteca"
        >
          <label className="input flex w-full items-center gap-2 xl:min-w-0">
            <span aria-hidden="true" className="text-base-content/50">
              ⌕
            </span>
            <span className="sr-only">Buscar por título o creador</span>
            <input
              className="grow"
              type="search"
              placeholder="Buscar por título o creador"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Filtrar por estado</span>
            <select
              className="select w-full"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  isLibraryStatus(event.target.value) ? event.target.value : '',
                )
              }
            >
              <option value="">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="COMPLETED">Completado</option>
              <option value="DROPPED">Abandonado</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filtrar por tipo</span>
            <select
              className="select w-full"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  isMediaType(event.target.value) ? event.target.value : '',
                )
              }
            >
              <option value="">Todos los tipos</option>
              <option value="GAME">Juegos</option>
              <option value="MOVIE">Películas</option>
              <option value="BOOK">Libros</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Ordenar por</span>
            <select
              className="select w-full"
              value={sortBy}
              onChange={(event) => {
                if (sortOptions.some((option) => option === event.target.value))
                  setSortBy(event.target.value as LibrarySortBy);
              }}
            >
              <option value="addedAt">Fecha de incorporación</option>
              <option value="title">Título</option>
              <option value="releaseYear">Año</option>
              <option value="averageRating">Calificación</option>
            </select>
          </label>
          <button
            type="button"
            className="btn btn-outline"
            aria-label={`Orden ${sortOrder === 'ASC' ? 'ascendente' : 'descendente'}`}
            onClick={() =>
              setSortOrder((order) => (order === 'ASC' ? 'DESC' : 'ASC'))
            }
          >
            {sortOrder === 'ASC' ? '↑ ASC' : '↓ DESC'}
          </button>
          <button type="submit" className="btn btn-secondary">
            Aplicar
          </button>
        </form>

        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-bold">Todos tus elementos</h2>
          <span className="text-sm text-base-content/60">
            {library.meta.total} en tu biblioteca
          </span>
        </div>

        {library.errorMessage && library.status === 'failed' ? (
          <div className="alert alert-error" role="alert">
            <span>{library.errorMessage}</span>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => library.reload()}
            >
              Intentar de nuevo
            </button>
          </div>
        ) : isLoading ? (
          <div
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            role="status"
            aria-label="Cargando tu biblioteca"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="card bg-base-100">
                <div className="skeleton h-40 w-full" />
                <div className="card-body gap-3">
                  <div className="skeleton h-5 w-3/4" />
                  <div className="skeleton h-4 w-1/2" />
                  <div className="skeleton h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : library.items.length === 0 ? (
          <section
            className="rounded-box border border-dashed border-base-300 bg-base-100 px-5 py-10 text-center"
            aria-labelledby="empty-title"
          >
            <span
              className="badge badge-primary badge-lg mb-4"
              aria-hidden="true"
            >
              ✳
            </span>
            <h2 id="empty-title" className="text-lg font-bold">
              Tu próxima historia empieza aquí
            </h2>
            <p className="mx-auto mb-5 mt-2 max-w-lg text-sm text-base-content/70">
              No encontramos elementos con estos filtros. Prueba con otra
              búsqueda o añade algo a tu colección.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className="btn btn-outline"
                onClick={resetFilters}
              >
                Limpiar filtros
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsAdding(true)}
              >
                Añadir elemento
              </button>
            </div>
          </section>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {library.items.map((entry) => (
                <LibraryEntryCard
                  key={entry.id}
                  entry={entry}
                  disabled={library.isMutating}
                  opening={openingEntry}
                  onOpen={openEntry}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
            <nav
              className="mt-6 flex items-center justify-center gap-4 text-sm"
              aria-label="Paginación de biblioteca"
            >
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={(library.meta.page ?? 1) <= 1 || isLoading}
                onClick={() =>
                  library.reload({
                    ...library.query,
                    page: library.meta.page - 1,
                  })
                }
              >
                Anterior
              </button>
              <span>
                Página {library.meta.page} de{' '}
                {Math.max(1, library.meta.totalPages)}
              </span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={
                  library.meta.page >= library.meta.totalPages || isLoading
                }
                onClick={() =>
                  library.reload({
                    ...library.query,
                    page: library.meta.page + 1,
                  })
                }
              >
                Siguiente
              </button>
            </nav>
          </>
        )}

        {library.errorMessage && library.status !== 'failed' && (
          <div className="alert alert-warning mt-5" role="alert">
            <span>{library.errorMessage}</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={library.clearError}
            >
              Cerrar aviso
            </button>
          </div>
        )}

        <p className="mt-7 border-t border-base-300 pt-4 text-xs leading-relaxed text-base-content/60">
          Modo de demostración: los cambios viven en memoria durante esta
          sesión. La autenticación, el transporte HTTP y el catálogo real se
          integrarán desde sus módulos compartidos.
        </p>
      </div>

      {editorOpen && (isAdding || activeEntry) && (
        <LibraryEditorDialog
          key={isAdding ? 'new' : activeEntry!.id}
          entry={isAdding ? null : activeEntry}
          options={library.mediaOptions}
          optionsLoading={
            library.optionsStatus === 'loading' ||
            library.optionsStatus === 'idle'
          }
          busy={library.isMutating}
          error={library.errorMessage}
          onClose={closeEditor}
          onAdd={library.addEntry}
          onSave={library.updateEntry}
          onDelete={library.deleteEntry}
        />
      )}
      {openingEntry && (
        <p className="sr-only" role="status">
          Cargando detalle…
        </p>
      )}
    </main>
  );
}
