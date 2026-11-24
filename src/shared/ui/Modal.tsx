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
            onClose={onClose}
            className="m-auto w-full max-w-lg rounded-md border border-gray-400 p-6 backdrop:bg-black/40"
        >
            <h2 id={titleId} className="mb-4 text-lg font-semibold">
                {title}
            </h2>
            {open && children}
        </dialog>
    );
}
