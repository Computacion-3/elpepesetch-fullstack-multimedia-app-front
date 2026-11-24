'use client';

import { Button } from './Button';
import { Modal } from './Modal';

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

/** Diálogo de confirmación con acciones Cancelar y confirmar. */
export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <Modal open={open} title={title} onClose={onCancel}>
            <p className="text-sm">{message}</p>
            <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={onConfirm} loading={loading}>
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    );
}
