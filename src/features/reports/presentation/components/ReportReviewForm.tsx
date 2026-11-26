'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { Select } from '@/src/shared/ui/Select';
import { TextArea } from '@/src/shared/ui/TextArea';
import type { ReportReason } from '../../domain/entities/report';
import { useReports } from '../hooks/use-reports';

type ReportReviewFormProps = {
    /** Identificador UUID de la reseña que se desea reportar. */
    reviewId: string;
    /** Título o resumen de la reseña mostrado como contexto al usuario. */
    reviewPreview: string;
    /** Callback invocado cuando el reporte se envía con éxito. */
    onDone: () => void;
};

const REASON_OPTIONS: { value: ReportReason; label: string }[] = [
    { value: 'SPOILER', label: 'Spoiler sin aviso' },
    { value: 'OFFENSIVE', label: 'Contenido ofensivo' },
    { value: 'SPAM', label: 'Spam o publicidad' },
    { value: 'OTHER', label: 'Otro motivo' },
];

/**
 * Formulario modal para reportar una reseña ajena.
 * Se reutiliza desde `ReviewsPanel` respetando el aislamiento entre features.
 */
export function ReportReviewForm({ reviewId, reviewPreview, onDone }: ReportReviewFormProps) {
    const { submitReport, isMutating, errorMessage, clearFeedback } = useReports();
    const [reason, setReason] = useState<ReportReason>('SPOILER');
    const [comment, setComment] = useState('');

    useEffect(() => {
        clearFeedback();
    }, [clearFeedback]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const ok = await submitReport(reviewId, {
            reason,
            comment: comment.trim() ? comment : undefined,
        });
        if (ok) onDone();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
            <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted">
                Reseña seleccionada: <span className="font-medium">{reviewPreview}</span>
            </p>
            <Select
                id="report-reason"
                label="Motivo del reporte"
                value={reason}
                options={REASON_OPTIONS}
                onChange={(e) => setReason(e.target.value as ReportReason)}
            />
            <TextArea
                id="report-comment"
                label="Comentario adicional (opcional)"
                rows={3}
                maxLength={255}
                placeholder="Describe brevemente por qué reportas esta reseña..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-end gap-2">
                <Button type="submit" loading={isMutating}>
                    Enviar reporte
                </Button>
            </div>
        </form>
    );
}
