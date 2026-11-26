'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import type { MediaItemDraft, MediaType } from '../../domain/entities/media-item';
import { useMedia } from '../hooks/use-media';
import { GenreChecklist } from '@/src/features/genres/presentation/components/GenreChecklist';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { Select } from '@/src/shared/ui/Select';
import { TextField } from '@/src/shared/ui/TextField';

type ProposalFormValues = {
    title: string;
    type: MediaType;
    description: string;
    releaseYear: string;
    creator: string;
    coverUrl: string;
    platform: string;
    durationMinutes: string;
    pages: string;
    isbn: string;
    genreIds: string[];
};

const EMPTY_FORM: ProposalFormValues = {
    title: '', type: 'GAME', description: '', releaseYear: '', creator: '', coverUrl: '',
    platform: '', durationMinutes: '', pages: '', isbn: '', genreIds: [],
};

type MediaProposalFormProps = { mediaId?: string };

/** Formulario compartido de propuesta nueva y edición de pendiente propia/autorizada. */
export function MediaProposalForm({ mediaId }: MediaProposalFormProps) {
    const router = useRouter();
    const media = useMedia();
    const [form, setForm] = useState(EMPTY_FORM);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (mediaId) void media.getById(mediaId);
        else media.clearDetail();
        // Limpia el detalle al salir para no reutilizarlo al navegar desde el formulario.
        return () => {
            media.clearDetail();
        };
    }, [mediaId, media.getById, media.clearDetail]);

    useEffect(() => {
        const item = media.selectedItem;
        if (!mediaId || item?.id !== mediaId) return;
        setForm({
            title: item.title,
            type: item.type,
            description: item.description ?? '',
            releaseYear: String(item.releaseYear),
            creator: item.creator,
            coverUrl: item.coverUrl ?? '',
            platform: item.platform ?? '',
            durationMinutes: item.durationMinutes ? String(item.durationMinutes) : '',
            pages: item.pages ? String(item.pages) : '',
            isbn: item.isbn ?? '',
            genreIds: item.genres.map((genre) => genre.id),
        });
    }, [mediaId, media.selectedItem]);

    const isReady = !mediaId || (media.selectedItem?.id === mediaId && media.detailStatus === 'succeeded');

    function toggleGenre(id: string) {
        setForm((current) => ({
            ...current,
            genreIds: current.genreIds.includes(id)
                ? current.genreIds.filter((genreId) => genreId !== id)
                : [...current.genreIds, id],
        }));
    }

    function toDraft(): MediaItemDraft {
        const draft: MediaItemDraft = {
            title: form.title,
            type: form.type,
            description: form.description || undefined,
            releaseYear: Number(form.releaseYear),
            creator: form.creator,
            coverUrl: form.coverUrl || undefined,
            genreIds: form.genreIds,
        };
        // Campos específicos solo se envían para el tipo que los utiliza.
        if (form.type === 'GAME' && form.platform) draft.platform = form.platform;
        if (form.type === 'MOVIE' && form.durationMinutes) draft.durationMinutes = Number(form.durationMinutes);
        if (form.type === 'BOOK') {
            if (form.pages) draft.pages = Number(form.pages);
            if (form.isbn) draft.isbn = form.isbn;
        }
        return draft;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaved(false);
        const draft = toDraft();
        const succeeded = mediaId
            ? await media.updateProposal(mediaId, draft)
            : await media.propose(draft);
        if (!succeeded) return;
        if (mediaId) router.push(`/catalog/${mediaId}`);
        else setSaved(true);
    }

    return (
        <section className="mx-auto max-w-3xl space-y-6">
            <header>
                <p className="text-sm font-semibold uppercase tracking-wide text-brand">Catálogo</p>
                <h1 className="text-3xl font-bold">{mediaId ? 'Editar propuesta pendiente' : 'Proponer un elemento'}</h1>
                <p className="mt-2 text-muted">Las propuestas nuevas quedan pendientes hasta que un moderador las revise.</p>
            </header>
            {media.errorMessage && <Alert variant="error">{media.errorMessage}</Alert>}
            {saved && <Alert variant="success">Propuesta enviada. Puedes consultar su estado desde el catálogo.</Alert>}
            {!isReady && <p role="status">Cargando propuesta…</p>}
            {isReady && (
                <form className="space-y-5 rounded-2xl border border-white/10 bg-surface p-5 sm:p-7" onSubmit={handleSubmit}>
                    <TextField id="proposal-title" label="Título" required maxLength={150} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
                    <Select id="proposal-type" label="Tipo" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as MediaType })} options={[
                        { value: 'GAME', label: 'Videojuego' }, { value: 'MOVIE', label: 'Película' }, { value: 'BOOK', label: 'Libro' },
                    ]} />
                    <TextField id="proposal-creator" label="Creador" required maxLength={120} value={form.creator} onChange={(event) => setForm({ ...form, creator: event.target.value })} />
                    <TextField id="proposal-year" label="Año de lanzamiento" type="number" required min={1900} max={2100} value={form.releaseYear} onChange={(event) => setForm({ ...form, releaseYear: event.target.value })} />
                    <TextField id="proposal-cover" label="URL de portada" type="url" maxLength={500} value={form.coverUrl} onChange={(event) => setForm({ ...form, coverUrl: event.target.value })} />
                    <div className="flex flex-col gap-1">
                        <label htmlFor="proposal-description" className="text-sm font-medium text-foreground">Descripción</label>
                        <textarea id="proposal-description" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" />
                    </div>
                    {form.type === 'GAME' && <TextField id="proposal-platform" label="Plataforma" maxLength={60} value={form.platform} onChange={(event) => setForm({ ...form, platform: event.target.value })} />}
                    {form.type === 'MOVIE' && <TextField id="proposal-duration" label="Duración en minutos" type="number" min={1} value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })} />}
                    {form.type === 'BOOK' && <div className="grid gap-4 sm:grid-cols-2">
                        <TextField id="proposal-pages" label="Páginas" type="number" min={1} value={form.pages} onChange={(event) => setForm({ ...form, pages: event.target.value })} />
                        <TextField id="proposal-isbn" label="ISBN" maxLength={20} value={form.isbn} onChange={(event) => setForm({ ...form, isbn: event.target.value })} />
                    </div>}
                    <GenreChecklist selectedIds={form.genreIds} onToggle={toggleGenre} />
                    <div className="flex flex-wrap gap-3">
                        <Button type="submit" loading={media.isMutating} disabled={!form.genreIds.length}>
                            {mediaId ? 'Guardar cambios' : 'Enviar propuesta'}
                        </Button>
                        <Button variant="secondary" onClick={() => router.push(mediaId ? `/catalog/${mediaId}` : '/catalog')}>Cancelar</Button>
                    </div>
                </form>
            )}
        </section>
    );
}
