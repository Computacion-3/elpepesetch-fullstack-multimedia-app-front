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
            <label htmlFor={id} className="text-sm font-medium text-foreground">
                {label}
            </label>
            <textarea
                id={id}
                rows={rows}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`w-full rounded-lg border bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${error ? 'border-red-400' : 'border-white/20'} ${className}`}
                {...props}
            />
            {error && (
                <p id={`${id}-error`} className="text-sm text-red-300">
                    {error}
                </p>
            )}
        </div>
    );
}
