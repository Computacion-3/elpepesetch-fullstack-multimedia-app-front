import type { InputHTMLAttributes } from 'react';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    id: string;
    label: string;
    error?: string;
};

/** Campo de texto con etiqueta y mensaje de error accesible. */
export function TextField({ id, label, error, className = '', ...props }: TextFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium text-foreground">
                {label}
            </label>
            <input
                id={id}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`min-h-11 w-full rounded-lg border bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${error ? 'border-red-400' : 'border-white/20'} ${className}`}
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
