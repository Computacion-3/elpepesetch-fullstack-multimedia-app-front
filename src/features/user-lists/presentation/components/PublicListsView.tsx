'use client';

import { useEffect, useState } from 'react';
import { Alert } from '@/src/shared/ui/Alert';
import { Pagination } from '@/src/shared/ui/Pagination';
import { useUserLists } from '../hooks/use-user-lists';
import { UserListCard } from './UserListCard';
import { Spinner } from '@/src/shared/ui/Spinner';

export function PublicListsView() {
  const lists = useUserLists();
  const { loadPublic } = lists;
  const [page, setPage] = useState(1);
  const limit = 10;
  useEffect(() => {
    void loadPublic({ page, limit });
  }, [loadPublic, page]);
  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-[#3fd0c0]">
          Comunidad
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">Listas públicas</h1>
        <p className="mt-2 text-[#c2bddc]">
          Descubre colecciones compartidas por otras personas.
        </p>
      </header>
      {lists.errorMessage && (
        <Alert variant="error">{lists.errorMessage}</Alert>
      )}
      {lists.publicStatus === 'loading' ? (
        <Spinner label="Cargando listas públicas" size="lg" className="py-12" />
      ) : lists.publicStatus === 'failed' ? (
        <div className="rounded-xl bg-[#241f42] p-8 text-center">
          <p className="mb-4 text-[#c2bddc]">
            No se pudieron cargar las listas públicas.
          </p>
          <button
            type="button"
            onClick={() => void lists.loadPublic({ page, limit })}
            className="min-h-10 rounded-lg border border-white/20 px-4"
          >
            Reintentar
          </button>
        </div>
      ) : lists.publicLists.items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/20 p-10 text-center text-[#c2bddc]">
          Todavía no hay listas públicas para explorar.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {lists.publicLists.items.map((list) => (
              <UserListCard key={list.id} list={list} />
            ))}
          </div>
          <Pagination
            page={lists.publicLists.page}
            totalPages={lists.publicLists.totalPages}
            onChange={setPage}
          />
        </>
      )}
    </section>
  );
}
