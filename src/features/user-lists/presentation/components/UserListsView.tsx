'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { ConfirmDialog } from '@/src/shared/ui/ConfirmDialog';
import { useUserLists } from '../hooks/use-user-lists';
import type { UserListViewModel } from '../viewmodels/user-list.viewmodel';
import { UserListCard } from './UserListCard';
import { UserListEditorDialog } from './UserListEditorDialog';

export function UserListsView() {
  const lists = useUserLists();
  const { ownStatus, reload } = lists;
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<UserListViewModel | null>(null);
  const [deleting, setDeleting] = useState<UserListViewModel | null>(null);
  useEffect(() => {
    if (ownStatus === 'idle') void reload();
  }, [ownStatus, reload]);

  async function save(value: Parameters<typeof lists.create>[0]) {
    return editing ? lists.update(editing.id, value) : lists.create(value);
  }
  async function confirmDelete() {
    if (deleting && (await lists.remove(deleting.id))) setDeleting(null);
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#3fd0c0]">
            Tu colección
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">Mis listas</h1>
          <p className="mt-2 max-w-xl text-[#c2bddc]">
            Organiza juegos, películas y libros para compartirlos o guardarlos
            en privado.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/community/lists"
            className="inline-flex min-h-11 items-center rounded-lg border border-white/20 px-4 text-sm font-semibold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#3fd0c0]"
          >
            Explorar comunidad
          </Link>
          <Button
            onClick={() => {
              setEditing(null);
              setEditorOpen(true);
            }}
          >
            Crear lista
          </Button>
        </div>
      </header>
      {lists.errorMessage && (
        <Alert variant="error">{lists.errorMessage}</Alert>
      )}
      {lists.ownStatus === 'loading' ? (
        <p role="status" className="py-12 text-center text-[#c2bddc]">
          Cargando tus listas…
        </p>
      ) : lists.ownStatus === 'failed' ? (
        <div className="rounded-xl border border-white/10 bg-[#241f42] p-8 text-center">
          <p className="mb-4 text-[#c2bddc]">
            No se pudieron cargar las listas.
          </p>
          <Button variant="secondary" onClick={() => void lists.reload()}>
            Reintentar
          </Button>
        </div>
      ) : lists.ownLists.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 p-10 text-center">
          <h2 className="text-xl font-bold">Todavía no tienes listas</h2>
          <p className="mt-2 text-sm text-[#c2bddc]">
            Crea una para empezar a organizar tus medios.
          </p>
          <Button
            className="mt-5"
            onClick={() => {
              setEditing(null);
              setEditorOpen(true);
            }}
          >
            Crear mi primera lista
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lists.ownLists.map((list) => (
            <UserListCard
              key={list.id}
              list={list}
              onEdit={() => {
                setEditing(list);
                setEditorOpen(true);
              }}
              onDelete={() => setDeleting(list)}
            />
          ))}
        </div>
      )}
      {editorOpen && <UserListEditorDialog
        list={editing}
        open={editorOpen}
        loading={lists.isMutating}
        error={lists.errorMessage}
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
        }}
        onSave={save}
      />}
      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar lista"
        message={`¿Eliminar “${deleting?.name ?? ''}”? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar lista"
        loading={lists.isMutating}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />
    </section>
  );
}
