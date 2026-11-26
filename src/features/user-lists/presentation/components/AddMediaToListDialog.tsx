'use client';

import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useMedia } from '@/src/features/media/presentation/hooks/use-media';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { Modal } from '@/src/shared/ui/Modal';
import { Pagination } from '@/src/shared/ui/Pagination';

export function AddMediaToListDialog({
  open,
  loading,
  error,
  existingIds,
  onClose,
  onAdd,
}: {
  open: boolean;
  loading: boolean;
  error: string | null;
  existingIds: string[];
  onClose: () => void;
  onAdd: (mediaItemId: string) => Promise<boolean>;
}) {
  const catalog = useMedia();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const existing = useMemo(() => new Set(existingIds), [existingIds]);
  const available = catalog.items.filter(
    (item) => item.approvalStatus === 'APPROVED' && !existing.has(item.id),
  );

  async function searchCatalog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(search.trim());
    catalog.setFilters({ q: search.trim() || undefined, page: 1 });
  }

  return (
    <Modal open={open} title="Agregar medio" onClose={onClose}>
      <div className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        <form onSubmit={searchCatalog} className="flex gap-2">
          <label className="sr-only" htmlFor="list-media-search">
            Buscar medios
          </label>
          <input
            id="list-media-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Título o creador"
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-white/20 bg-[#17132b] px-3 text-[#f3f0ff]"
          />
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>
        <p className="text-xs text-[#a8a1cf]">
          Solo se muestran medios aprobados que aún no están en la lista.
        </p>
        {catalog.listStatus === 'failed' && (
          <Alert variant="error">
            {catalog.errorMessage ?? 'No se pudo buscar en el catálogo.'}
          </Alert>
        )}
        {catalog.listStatus === 'loading' ? (
          <p role="status">Buscando medios…</p>
        ) : available.length ? (
          <ul className="max-h-[50vh] space-y-2 overflow-y-auto">
            {available.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{item.title}</p>
                  <p className="truncate text-sm text-[#c2bddc]">
                    {item.creator} · {item.releaseYear}
                  </p>
                </div>
                <Button
                  loading={loading}
                  onClick={async () => {
                    if (await onAdd(item.id)) onClose();
                  }}
                >
                  Agregar
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg bg-white/5 p-4 text-sm text-[#c2bddc]">
            {query
              ? 'No hay medios aprobados disponibles para esta búsqueda.'
              : 'No hay medios aprobados disponibles.'}
          </p>
        )}
        {catalog.listStatus !== 'failed' && (
          <Pagination
            page={catalog.meta.page}
            totalPages={catalog.meta.totalPages}
            onChange={(page) => catalog.setFilters({ page })}
          />
        )}
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
