import type { ReactNode } from 'react';

type AlertProps = {
    variant: 'error' | 'success';
    children: ReactNode;
};

const styles = {
    error: 'border-red-600 bg-red-50 text-red-800',
    success: 'border-green-600 bg-green-50 text-green-800',
};

/** Caja de aviso para errores o confirmaciones. */
export function Alert({ variant, children }: AlertProps) {
    return (
        <div
            role={variant === 'error' ? 'alert' : 'status'}
            className={`rounded-md border px-3 py-2 text-sm ${styles[variant]}`}
        >
            {children}
        </div>
    );
}
