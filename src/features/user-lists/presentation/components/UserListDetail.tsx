'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { ConfirmDialog } from '@/src/shared/ui/ConfirmDialog';
import { useUserLists } from '../hooks/use-user-lists';
import { AddMediaToListDialog } from './AddMediaToListDialog';
import { UserListEditorDialog } from './UserListEditorDialog';
import { UserListItems } from './UserListItems';

export function UserListDetail({
  id,
  ownerId,
}: {
  id: string;
  ownerId: number;
}) {
  const lists = useUserLists();
  const { openList, closeList } = lists;
  const router = useRouter();
  const [editorOpen, setEditorOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => {
    void openList(id);
    return () => {
      closeList();
    };
  }, [id, openList, closeList]);
  const list = lists.selectedList?.id === id ? lists.selectedList : null;
  const isOwner = list?.owner.id === ownerId;

  async function save(value: Parameters<typeof lists.create>[0]) {
    return list ? lists.update(list.id, value) : false;
  }
  async function removeList() {
    if (list && (await lists.remove(list.id))) router.push('/lists');
  }

  return (
    <section className="space-y-6">
      <Link
        href={isOwner ? '/lists' : '/community/lists'}
        className="inline-flex min-h-10 items-center text-sm font-semibold text-[#3fd0c0] hover:underline"
      >
        ← Volver a las listas
      </Link>
      {lists.errorMessage && (
        <Alert variant="error">{lists.errorMessage}</Alert>
      )}
      {lists.detailStatus === 'loading' || !list ? (
        lists.detailStatus === 'failed' ? (
          <div>
            <p role="alert" className="text-red-200">
              No se pudo encontrar o consultar esta lista.
            </p>
            <Link
              href="/community/lists"
              className="mt-3 inline-block text-[#3fd0c0]"
            >
              Volver
            </Link>
          </div>
        ) : (
          <p role="status" className="py-12 text-center text-[#c2bddc]">
            Cargando lista…
          </p>
        )
      ) : (
        <>
          <header className="rounded-2xl border border-white/10 bg-[#241f42] p-5 sm:p-7">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-extrabold">{list.name}</h1>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-xs">
                    {list.visibility === 'PUBLIC' ? 'Pública' : 'Privada'}
                  </span>
                </div>
                <p className="mt-2 text-[#c2bddc]">
                  {list.description || 'Sin descripción.'}
                </p>
                <p className="mt-3 text-sm text-[#a8a1cf]">
                  Creada por{' '}
                  <span className="font-semibold text-[#f3f0ff]">
                    {list.owner.username}
                  </span>{' '}
                  · {list.items.length}{' '}
                  {list.items.length === 1 ? 'medio' : 'medios'}
                </p>
              </div>
              {isOwner && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setEditorOpen(true)}
                  >
                    Editar
                  </Button>
                  <Button onClick={() => setPickerOpen(true)}>
                    Agregar medio
                  </Button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="min-h-11 rounded-lg border border-red-300/40 px-4 text-sm font-semibold text-red-200 hover:bg-red-300/10"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </header>
          <UserListItems
            list={list}
            editable={Boolean(isOwner)}
            loading={lists.isMutating}
            onRemove={(mediaItemId) =>
              void lists.removeItem(list.id, mediaItemId)
            }
          />
        </>
      )}
      {list && (
        <>
          {editorOpen && <UserListEditorDialog
            list={list}
            open={editorOpen}
            loading={lists.isMutating}
            error={lists.errorMessage}
            onClose={() => setEditorOpen(false)}
            onSave={save}
          />}
          {pickerOpen && (
            <AddMediaToListDialog
              open={pickerOpen}
              loading={lists.isMutating}
              error={lists.errorMessage}
              existingIds={list.items.map((item) => item.id)}
              onClose={() => setPickerOpen(false)}
              onAdd={(mediaItemId) => lists.addItem(list.id, mediaItemId)}
            />
          )}
          <ConfirmDialog
            open={confirmDelete}
            title="Eliminar lista"
            message={`¿Eliminar “${list.name}”? Esta acción no se puede deshacer.`}
            confirmLabel="Eliminar lista"
            loading={lists.isMutating}
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => void removeList()}
          />
        </>
      )}
    </section>
  );
}
