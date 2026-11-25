'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { TextArea } from '@/src/shared/ui/TextArea';
import { TextField } from '@/src/shared/ui/TextField';
import type { ReviewChanges } from '../../domain/entities/review';
import { useReviews } from '../hooks/use-reviews';
import type { ReviewViewModel } from '../viewmodels/reviews.viewmodel';

type ReviewFormProps = {
    /** Identificador del elemento multimedia al que pertenece la reseña. */
    mediaItemId: string;
    /** Si está definido, el formulario opera en modo edición sobre esa reseña. */
    review?: ReviewViewModel;
    /** Callback ejecutado cuando la operación finaliza con éxito o el usuario guarda sin cambios. */
    onDone: () => void;
};

/**
 * Formulario reutilizable para crear o editar una reseña.
 * Delega la validación de invariantes al caso de uso/entidad vía el hook fachada `useReviews`.
 */
export function ReviewForm({ mediaItemId, review, onDone }: ReviewFormProps) {
    const { create, update, isMutating, errorMessage, clearFeedback } = useReviews();
    const [title, setTitle] = useState(review?.title ?? '');
    const [content, setContent] = useState(review?.content ?? '');

    useEffect(() => {
        clearFeedback();
    }, [clearFeedback]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let ok: boolean;

        if (!review) {
            ok = await create(mediaItemId, {
                title: title.trim() ? title : undefined,
                content,
            });
        } else {
            const changes: ReviewChanges = {};
            if (title !== review.title) changes.title = title;
            if (content !== review.content) changes.content = content;
            if (Object.keys(changes).length === 0) {
                onDone();
                return;
            }
            ok = await update(review.id, changes);
        }

        if (ok) onDone();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
            <TextField
                id="review-form-title"
                label="Título (opcional)"
                type="text"
                maxLength={100}
                placeholder="Ej. Una aventura inolvidable"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <TextArea
                id="review-form-content"
                label="Reseña"
                rows={5}
                maxLength={2000}
                placeholder="Comparte tu opinión (mínimo 10 caracteres)..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-end gap-2">
                <Button type="submit" loading={isMutating}>
                    {review ? 'Guardar cambios' : 'Publicar reseña'}
                </Button>
            </div>
        </form>
    );
}
