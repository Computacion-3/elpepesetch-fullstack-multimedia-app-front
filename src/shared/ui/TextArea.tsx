import type { TextareaHTMLAttributes } from 'react';

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    /** Identificador único del control HTML para enlazar etiqueta y mensajes de error. */
    id: string;
    /** Etiqueta visible asociada al área de texto. */
    label: string;
    /** Mensaje de error opcional que activa el estado accesible `aria-invalid`. */
    error?: string;
};

/**
 * Área de texto multilínea reutilizable con etiqueta y mensaje de error accesible.
 * Mantiene la misma identidad visual y convenciones de accesibilidad que `TextField`.
 */
export function TextArea({ id, label, error, className = '', rows = 4, ...props }: TextAreaProps) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium">
                {label}
            </label>
            <textarea
                id={id}
                rows={rows}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-brand ${error ? 'border-red-600' : 'border-gray-400'} ${className}`}
                {...props}
            />
            {error && (
                <p id={`${id}-error`} className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
