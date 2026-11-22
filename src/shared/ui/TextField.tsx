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
            <label htmlFor={id} className="text-sm font-medium">
                {label}
            </label>
            <input
                id={id}
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
