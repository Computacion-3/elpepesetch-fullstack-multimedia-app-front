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
import styles from './library.module.css';

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
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.topline}>
          <Link
            className={styles.brand}
            href="/"
            aria-label="Elpepesetch, inicio"
          >
            <span className={styles.brandMark} aria-hidden="true">
              e
            </span>
            <span>elpepesetch</span>
          </Link>
          <span className={styles.topNote}>
            Colección personal · datos de demostración
          </span>
        </div>

        <header className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>Tu espacio multimedia</span>
            <h1 className={styles.title}>Tu biblioteca</h1>
            <p className={styles.subtitle}>
              Juegos, películas y libros que estás descubriendo, disfrutando o
              guardando para después.
            </p>
          </div>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => setIsAdding(true)}
          >
            <span aria-hidden="true">＋</span> Añadir elemento
          </button>
        </header>

        <form
          className={styles.filters}
          onSubmit={applyFilters}
          aria-label="Filtrar biblioteca"
        >
          <label className={`${styles.searchWrap} ${styles.field}`}>
            <span className={styles.searchIcon} aria-hidden="true">
              ⌕
            </span>
            <span className="sr-only">Buscar por título o creador</span>
            <input
              className={`${styles.input} ${styles.searchInput}`}
              type="search"
              placeholder="Buscar por título o creador"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Filtrar por estado</span>
            <select
              className={styles.select}
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
              className={styles.select}
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
              className={styles.select}
              value={sortBy}
              onChange={(event) => {
                const value = event.target.value;
                if (sortOptions.some((option) => option === value))
                  setSortBy(value as LibrarySortBy);
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
            className={styles.secondaryButton}
            aria-label={`Orden ${sortOrder === 'ASC' ? 'ascendente' : 'descendente'}`}
            onClick={() =>
              setSortOrder((order) => (order === 'ASC' ? 'DESC' : 'ASC'))
            }
          >
            {sortOrder === 'ASC' ? '↑ ASC' : '↓ DESC'}
          </button>
          <button
            type="submit"
            className={`${styles.secondaryButton} ${styles.filterButton}`}
          >
            Aplicar
          </button>
        </form>

        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Todos tus elementos</h2>
          <span className={styles.count}>
            {library.meta.total} en tu biblioteca
          </span>
        </div>

        {library.errorMessage && library.status === 'failed' ? (
          <div className={styles.error} role="alert">
            <p className={styles.errorText}>{library.errorMessage}</p>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => library.reload()}
            >
              Intentar de nuevo
            </button>
          </div>
        ) : isLoading ? (
          <div
            className={styles.loadingGrid}
            role="status"
            aria-label="Cargando tu biblioteca"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className={styles.skeleton} />
            ))}
          </div>
        ) : library.items.length === 0 ? (
          <section className={styles.empty} aria-labelledby="empty-title">
            <span className={styles.emptyMark} aria-hidden="true">
              ✳
            </span>
            <h2 id="empty-title" className={styles.emptyTitle}>
              Tu próxima historia empieza aquí
            </h2>
            <p className={styles.emptyCopy}>
              No encontramos elementos con estos filtros. Prueba con otra
              búsqueda o añade algo a tu colección.
            </p>
            <div
              className={styles.actionGroup}
              style={{ justifyContent: 'center' }}
            >
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={resetFilters}
              >
                Limpiar filtros
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setIsAdding(true)}
              >
                Añadir elemento
              </button>
            </div>
          </section>
        ) : (
          <>
            <div className={styles.grid}>
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
              className={styles.pagination}
              aria-label="Paginación de biblioteca"
            >
              <button
                type="button"
                className={styles.secondaryButton}
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
                className={styles.secondaryButton}
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
          <div className={styles.error} role="alert" style={{ marginTop: 18 }}>
            <p className={styles.errorText}>{library.errorMessage}</p>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={library.clearError}
            >
              Cerrar aviso
            </button>
          </div>
        )}

        <p className={styles.todo}>
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
