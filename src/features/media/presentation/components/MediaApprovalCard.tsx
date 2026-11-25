'use client';

import { useState } from 'react';
import type { MediaItemViewModel } from '../viewmodels/media.viewmodel';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';

type MediaApprovalCardProps = {
    item: MediaItemViewModel;
    loading: boolean;
    onDecision: (decision: { approvalStatus: 'APPROVED' | 'REJECTED'; rejectionReason?: string }) => Promise<boolean>;
};

/** Tarjeta de revisión con validación visible del motivo de rechazo. */
export function MediaApprovalCard({ item, loading, onDecision }: MediaApprovalCardProps) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    async function reject() {
        const value = reason.trim();
        if (!value) {
            setError('Escribe un motivo para rechazar esta propuesta.');
            return;
        }
        if (value.length > 255) {
            setError('El motivo no puede superar 255 caracteres.');
            return;
        }
        setError(null);
        await onDecision({ approvalStatus: 'REJECTED', rejectionReason: value });
    }

    return (
        <article className="space-y-4 rounded-lg border border-gray-300 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold">{item.title}</h2>
                    <p className="text-sm text-gray-600">{item.type} · {item.creator} · {item.releaseYear}</p>
                    <p className="mt-1 text-sm">Propuesto por {item.createdBy?.username ?? 'usuario'}</p>
                </div>
                <p className="text-sm text-gray-600">{item.genres.map((genre) => genre.name).join(', ')}</p>
            </div>
            <p className="text-sm">{item.description || 'Sin descripción.'}</p>
            {error && <Alert variant="error">{error}</Alert>}
            <div className="flex flex-col gap-2">
                <label htmlFor={`reason-${item.id}`} className="text-sm font-medium">Motivo si se rechaza (máximo 255 caracteres)</label>
                <textarea
                    id={`reason-${item.id}`}
                    rows={2}
                    maxLength={255}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    className="rounded-md border border-gray-400 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-brand"
                />
                <div className="flex flex-wrap gap-2">
                    <Button loading={loading} onClick={() => void onDecision({ approvalStatus: 'APPROVED' })}>Aprobar</Button>
                    <Button variant="secondary" loading={loading} onClick={() => void reject()}>Rechazar</Button>
                </div>
            </div>
        </article>
    );
}
