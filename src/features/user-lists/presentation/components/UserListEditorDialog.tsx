'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { Modal } from '@/src/shared/ui/Modal';
import type { UserListDraft } from '../../domain/entities/user-list';
import type { UserListViewModel } from '../viewmodels/user-list.viewmodel';

export function UserListEditorDialog({
  list,
  open,
  loading,
  error,
  onClose,
  onSave,
}: {
  list: UserListViewModel | null;
  open: boolean;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (value: UserListDraft) => Promise<boolean>;
}) {
  const [name, setName] = useState(list?.name ?? '');
  const [description, setDescription] = useState(list?.description ?? '');
  const [visibility, setVisibility] = useState(list?.visibility ?? 'PRIVATE');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onSave({
      name: name.trim(),
      description: description.trim() || null,
      visibility,
    });
    if (saved) onClose();
  }

  return (
    <Modal
      open={open}
      title={list ? 'Editar lista' : 'Crear lista'}
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={submit}>
        {error && <Alert variant="error">{error}</Alert>}
        <label className="block text-sm font-semibold">
          Nombre
          <input
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-lg border border-white/20 bg-[#17132b] px-3 text-[#f3f0ff]"
          />
          <span className="mt-1 block text-right text-xs text-[#a8a1cf]">
            {name.length}/80
          </span>
        </label>
        <label className="block text-sm font-semibold">
          Descripción
          <textarea
            maxLength={255}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="mt-1 w-full resize-y rounded-lg border border-white/20 bg-[#17132b] px-3 py-2 text-[#f3f0ff]"
          />
          <span className="mt-1 block text-right text-xs text-[#a8a1cf]">
            {description.length}/255
          </span>
        </label>
        <label className="block text-sm font-semibold">
          Visibilidad
          <select
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as 'PRIVATE' | 'PUBLIC')
            }
            className="mt-1 min-h-11 w-full rounded-lg border border-white/20 bg-[#17132b] px-3 text-[#f3f0ff]"
          >
            <option value="PRIVATE">Privada</option>
            <option value="PUBLIC">Pública</option>
          </select>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {list ? 'Guardar cambios' : 'Crear lista'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
