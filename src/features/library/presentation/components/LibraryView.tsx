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
    <main className="min-h-screen bg-[#17132b] px-4 py-6 text-[#f3f0ff] sm:px-6 sm:py-9">
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 flex items-center justify-between gap-4">
          <Link
            className="flex items-center gap-3 font-bold"
            href="/"
            aria-label="Elpepesetch, inicio"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-[#3fd0c0] text-[#17132b]">
              e
            </span>
            <span>elpepesetch</span>
          </Link>
          <span className="text-right text-sm text-[#a8a1cf]">
            Tu colección multimedia
          </span>
        </div>

        <header className="mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.13em] text-[#a8a1cf]">
              Tu espacio multimedia
            </span>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Mi biblioteca
            </h1>
            <p className="mt-3 max-w-2xl text-[#a8a1cf]">
              Juegos, películas y libros que estás descubriendo, disfrutando o
              guardando para después.
            </p>
          </div>
          <button
            type="button"
            className="min-h-11 rounded-xl bg-[#3fd0c0] px-5 font-bold text-[#17132b] transition hover:bg-[#67dfd1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9b3ff]"
            onClick={openAddDialog}
            disabled={isPreparingAdd}
          >
          <span aria-hidden="true">＋</span> {isPreparingAdd ? 'Preparando catálogo…' : 'Agregar elemento'}
          </button>
        </header>

        <form
          className="mb-7 grid gap-3 rounded-2xl border border-white/10 bg-[#241f42] p-4 sm:grid-cols-2 xl:grid-cols-4"
          onSubmit={applyFilters}
          aria-label="Filtrar biblioteca"
        >
          <label className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 xl:col-span-2">
            <span aria-hidden="true" className="text-[#a8a1cf]">
              ⌕
            </span>
            <span className="sr-only">Buscar por título o creador</span>
            <input
              className="w-full bg-transparent text-[#f3f0ff] outline-none placeholder:text-[#a8a1cf]"
              type="search"
              placeholder="Buscar por título o creador"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Filtrar por estado</span>
            <select
              className="min-h-11 w-full rounded-xl border border-white/15 bg-[#17132b] px-3 text-[#f3f0ff]"
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
              className="min-h-11 w-full rounded-xl border border-white/15 bg-[#17132b] px-3 text-[#f3f0ff]"
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
              className="min-h-11 w-full rounded-xl border border-white/15 bg-[#17132b] px-3 text-[#f3f0ff]"
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
            <select className="min-h-11 w-full rounded-xl border border-white/15 bg-[#17132b] px-3 text-[#f3f0ff]" value={genreFilter} onChange={(event) => setGenreFilter(event.target.value)}>
              <option value="">Todos los géneros</option>
              {genres.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
            </select>
          </label>
          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-[#17132b] px-3 text-sm">
            <input type="checkbox" checked={favoriteOnly} onChange={(event) => setFavoriteOnly(event.target.checked)} /> Favoritos
          </label>
          <label>
            <span className="sr-only">Filtrar por año</span>
            <input className="min-h-11 w-full rounded-xl border border-white/15 bg-[#17132b] px-3 text-[#f3f0ff]" type="number" min="1900" max="2100" placeholder="Año" value={yearFilter} onChange={(event) => setYearFilter(event.target.value)} />
          </label>
          <button
            type="button"
            className="min-h-11 rounded-xl border border-white/20 px-4"
            aria-label={`Orden ${sortOrder === 'ASC' ? 'ascendente' : 'descendente'}`}
            onClick={() =>
              setSortOrder((order) => (order === 'ASC' ? 'DESC' : 'ASC'))
            }
          >
            {sortOrder === 'ASC' ? '↑ ASC' : '↓ DESC'}
          </button>
          <button type="submit" className="min-h-11 rounded-xl bg-[#b9b3ff] px-4 font-bold text-[#17132b]">
            Aplicar
          </button>
        </form>

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label="Resumen de la página actual">
          {summary.map((stat) => <div key={stat.label} className="rounded-2xl border border-white/10 bg-[#241f42] p-4"><p className="text-2xl font-bold">{stat.value}</p><p className="mt-1 text-xs text-[#a8a1cf]">{stat.label}</p></div>)}
        </section>

        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-bold">Tus elementos</h2>
          <span className="text-sm text-[#a8a1cf]">
            {library.meta.total} en total
          </span>
        </div>

        {successMessage && <p className="mb-4 text-sm text-[#72e6d9]" role="status">{successMessage}</p>}

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
