'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
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
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sortBy, setSortBy] = useState<LibrarySortBy>('addedAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [isAdding, setIsAdding] = useState(false);
  const [isPreparingAdd, setIsPreparingAdd] = useState(false);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [openingEntry, setOpeningEntry] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const activeEntry =
    library.selectedEntry?.id === activeEntryId ? library.selectedEntry : null;

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery: LibraryQuery = {
      ...baseQuery,
      q: search.trim() || undefined,
      status: statusFilter || undefined,
      type: typeFilter || undefined,
      isFavorite: favoriteOnly ? true : undefined,
      genreId: genreFilter || undefined,
      year: yearFilter ? Number(yearFilter) : undefined,
      sortBy,
      order: sortOrder,
    };
    library.reload(nextQuery);
  }

  function resetFilters() {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setFavoriteOnly(false);
    setGenreFilter('');
    setYearFilter('');
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

  async function addEntry(params: { mediaItemId: string }) {
    const added = await library.addEntry(params);
    if (added) setSuccessMessage('Elemento agregado a tu biblioteca.');
    return added;
  }

  async function openAddDialog() {
    setIsPreparingAdd(true);
    const ready = await library.loadExistingMediaItemIds();
    setIsPreparingAdd(false);
    if (ready) setIsAdding(true);
  }

  const editorOpen = isAdding || activeEntryId !== null;
  const isLoading = library.status === 'idle' || library.status === 'loading';
  const summary = [
    { label: 'En esta página', value: library.items.length },
    { label: 'Pendientes', value: library.items.filter((entry) => entry.status === 'PENDING').length },
    { label: 'En progreso', value: library.items.filter((entry) => entry.status === 'IN_PROGRESS').length },
    { label: 'Completados', value: library.items.filter((entry) => entry.status === 'COMPLETED').length },
    { label: 'Favoritos', value: library.items.filter((entry) => entry.isFavorite).length },
  ];
  const genres = Array.from(new Map(library.items.flatMap((entry) => entry.genres).map((genre) => [genre.id, genre])).values());

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 sm:py-9">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.13em] text-muted">
              Tu espacio multimedia
            </span>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Mi biblioteca
            </h1>
            <p className="mt-3 max-w-2xl text-muted">
              Juegos, películas y libros que estás descubriendo, disfrutando o
              guardando para después.
            </p>
          </div>
          <button
            type="button"
            className="min-h-11 rounded-xl bg-brand px-5 font-bold text-background transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={openAddDialog}
            disabled={isPreparingAdd}
          >
          <span aria-hidden="true">＋</span> {isPreparingAdd ? 'Preparando catálogo…' : 'Agregar elemento'}
          </button>
        </header>

        <form
          className="mb-7 grid gap-3 rounded-2xl border border-white/10 bg-surface p-4 sm:grid-cols-2 xl:grid-cols-4"
          onSubmit={applyFilters}
          aria-label="Filtrar biblioteca"
        >
          <label className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 xl:col-span-2">
            <span aria-hidden="true" className="text-muted">
              ⌕
            </span>
            <span className="sr-only">Buscar por título o creador</span>
            <input
              className="w-full bg-transparent text-foreground outline-none placeholder:text-muted"
              type="search"
              placeholder="Buscar por título o creador"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Filtrar por estado</span>
            <select
              className="min-h-11 w-full rounded-xl border border-white/15 bg-background px-3 text-foreground"
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
              className="min-h-11 w-full rounded-xl border border-white/15 bg-background px-3 text-foreground"
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
              className="min-h-11 w-full rounded-xl border border-white/15 bg-background px-3 text-foreground"
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
          <label>
            <span className="sr-only">Filtrar por género</span>
            <select className="min-h-11 w-full rounded-xl border border-white/15 bg-background px-3 text-foreground" value={genreFilter} onChange={(event) => setGenreFilter(event.target.value)}>
              <option value="">Todos los géneros</option>
              {genres.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
            </select>
          </label>
          <label           className="flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-background px-3 text-sm">
            <input type="checkbox" checked={favoriteOnly} onChange={(event) => setFavoriteOnly(event.target.checked)} /> Favoritos
          </label>
          <label>
            <span className="sr-only">Filtrar por año</span>
            <input className="min-h-11 w-full rounded-xl border border-white/15 bg-background px-3 text-foreground placeholder:text-muted" type="number" min="1900" max="2100" placeholder="Año" value={yearFilter} onChange={(event) => setYearFilter(event.target.value)} />
          </label>
          <button
            type="button"
            className="min-h-11 rounded-xl border border-white/20 px-4 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            aria-label={`Orden ${sortOrder === 'ASC' ? 'ascendente' : 'descendente'}`}
            onClick={() =>
              setSortOrder((order) => (order === 'ASC' ? 'DESC' : 'ASC'))
            }
          >
            {sortOrder === 'ASC' ? '↑ ASC' : '↓ DESC'}
          </button>
          <button type="submit" className="min-h-11 rounded-xl bg-brand px-4 font-bold text-background hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
            Aplicar
          </button>
        </form>

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label="Resumen de la página actual">
          {summary.map((stat) => <div key={stat.label} className="rounded-2xl border border-white/10 bg-surface p-4"><p className="text-2xl font-bold">{stat.value}</p><p className="mt-1 text-xs text-muted">{stat.label}</p></div>)}
        </section>

        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-bold">Tus elementos</h2>
          <span className="text-sm text-muted">
            {library.meta.total} en total
          </span>
        </div>

        {successMessage && <p className="mb-4 text-sm text-emerald-300" role="status">{successMessage}</p>}

        {library.errorMessage && library.status === 'failed' ? (
          <div className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-red-200" role="alert">
            <span>{library.errorMessage}</span>
            <button
              type="button"
              className="min-h-9 rounded-lg border border-white/20 px-3 text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand"
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
              <div key={index} className="card bg-surface text-foreground">
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
            className="rounded-2xl border border-dashed border-white/20 bg-surface px-5 py-10 text-center"
            aria-labelledby="empty-title"
          >
            <span
              className="mb-4 inline-flex rounded-full bg-brand/15 px-4 py-2 font-semibold text-brand"
              aria-hidden="true"
            >
              ✳
            </span>
            <h2 id="empty-title" className="text-lg font-bold">
              Tu próxima historia empieza aquí
            </h2>
            <p className="mx-auto mb-5 mt-2 max-w-lg text-sm text-muted">
              No encontramos elementos con estos filtros. Prueba con otra
              búsqueda o añade algo a tu colección.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className="min-h-10 rounded-lg border border-white/20 px-4 text-sm font-medium hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand"
                onClick={resetFilters}
              >
                Limpiar filtros
              </button>
              <button
                type="button"
                className="min-h-10 rounded-lg bg-brand px-4 text-sm font-semibold text-background hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-brand"
                onClick={openAddDialog}
                disabled={isPreparingAdd}
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
                className="min-h-9 rounded-lg border border-white/20 px-3 font-medium hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand"
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
                className="min-h-9 rounded-lg border border-white/20 px-3 font-medium hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand"
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
          <div className="mt-5 rounded-xl border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-amber-100" role="alert">
            <span>{library.errorMessage}</span>
            <button
              type="button"
              className="min-h-9 rounded-lg px-3 text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand"
              onClick={library.clearError}
            >
              Cerrar aviso
            </button>
          </div>
        )}

      </div>

      {editorOpen && (isAdding || activeEntry) && (
        <LibraryEditorDialog
          key={isAdding ? 'new' : activeEntry!.id}
          entry={isAdding ? null : activeEntry}
          existingMediaItemIds={library.existingMediaItemIds}
          busy={library.isMutating}
          error={library.errorMessage}
          onClose={closeEditor}
          onAdd={addEntry}
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
