'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import type { CreateReviewDraft } from '../../domain/entities/review';
import { Button } from '@/src/shared/ui/Button';

/** Formulario breve; las reglas finales también se validan en dominio y backend. */
export function ReviewForm({ busy, onSubmit }: { busy: boolean; onSubmit: (draft: CreateReviewDraft) => Promise<boolean> }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = { ...(title.trim() ? { title: title.trim() } : {}), content: content.trim() };
    if (draft.content.length < 10) {
      setMessage('Escribe al menos 10 caracteres.');
      return;
    }
    if (await onSubmit(draft)) {
      setTitle('');
      setContent('');
      setMessage('Tu reseña fue publicada.');
    } else setMessage('No se pudo publicar. Revisa el aviso de error.');
  }

  return (
    <form className="grid gap-3 rounded-lg border border-gray-300 p-4" onSubmit={submit}>
      <h3 className="font-semibold">Escribe una reseña</h3>
      <label className="grid gap-1 text-sm">
        <span>Título (opcional)</span>
        <input className="rounded-md border border-gray-400 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-brand" maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label className="grid gap-1 text-sm">
        <span>Tu opinión</span>
        <textarea className="min-h-28 rounded-md border border-gray-400 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-brand" minLength={10} maxLength={2000} required value={content} onChange={(event) => setContent(event.target.value)} />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-gray-500">{content.length}/2000</span>
        <Button type="submit" disabled={busy}>{busy ? 'Publicando…' : 'Publicar reseña'}</Button>
      </div>
      {message && <p role="status" className="text-sm text-gray-600">{message}</p>}
    </form>
  );
}
