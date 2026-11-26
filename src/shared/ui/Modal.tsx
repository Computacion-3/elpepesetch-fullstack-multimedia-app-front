'use client';

import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

type ModalProps = {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
};

/** Modal sobre el elemento nativo dialog (Escape cierra y llama a onClose). */
export function Modal({ open, title, onClose, children }: ModalProps) {
    const ref = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            aria-labelledby={titleId}
            onClose={() => {
                if (open) onClose();
            }}
            className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-surface p-6 text-foreground shadow-2xl backdrop:bg-[#0a0818]/80"
        >
            <h2 id={titleId} className="mb-4 text-lg font-semibold">
                {title}
            </h2>
            {open && children}
        </dialog>
    );
}
