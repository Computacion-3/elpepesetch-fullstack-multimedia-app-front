import type { ReactNode } from 'react';
import { Bricolage_Grotesque } from 'next/font/google';
import { MediaShelf } from './MediaShelf';

const display = Bricolage_Grotesque({
    subsets: ['latin'],
    weight: ['600', '800'],
    variable: '--font-display',
});

type AuthShellProps = {
    title: string;
    description: string;
    children: ReactNode;
};

/**
 * Marco de las pantallas de acceso (login y registro): formulario a la izquierda y el estante
 * de juegos, películas y libros a la derecha (arriba, en compacto, en pantallas pequeñas).
 *
 * Ajusta los controles compartidos (TextField, Button, enlaces) al fondo oscuro desde aquí,
 * sin cambiar los componentes de src/shared/ui que usa el resto del equipo.
 */
export function AuthShell({ title, description, children }: AuthShellProps) {
    return (
        <main
            className={`${display.variable} flex min-h-screen flex-1 flex-col bg-[#17132b] text-[#f3f0ff] lg:flex-row`}
        >
            {/* Estante compacto: solo en pantallas pequeñas */}
            <div className="bg-[#241f42] px-6 pt-8 lg:hidden">
                <MediaShelf compact />
            </div>

            <section className="flex flex-1 flex-col px-6 py-10 sm:px-12 lg:max-w-xl lg:justify-center lg:px-16">
                <p className="mb-8 font-[family-name:var(--font-display)] lg:mb-12 text-2xl font-extrabold tracking-tight">
                    elpepesetch
                </p>
                <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1.05] tracking-tight">
                    {title}
                </h1>
                <p className="mt-3 mb-8 max-w-sm text-base leading-relaxed text-[#a8a1cf]">{description}</p>

                <div
                    className={[
                        'w-full max-w-sm',
                        // Campos sobre fondo oscuro
                        '[&_input]:border-white/20 [&_input]:bg-white/5 [&_input]:py-2.5 [&_input]:text-[#f3f0ff]',
                        '[&_input:hover]:border-white/35 [&_input:focus-visible]:border-[#b9b3ff]',
                        // Foco visible con contraste suficiente sobre el violeta oscuro
                        '[&_input:focus-visible]:outline-[#b9b3ff] [&_button:focus-visible]:outline-[#b9b3ff] [&_a:focus-visible]:outline-[#b9b3ff]',
                        '[&_button[type=submit]]:mt-2 [&_button[type=submit]]:py-3',
                        '[&_a]:text-[#b9b3ff]',
                        // Avisos (Alert) en versión oscura: error y confirmación
                        '[&_[role=alert]]:border-red-400/60 [&_[role=alert]]:bg-red-500/10 [&_[role=alert]]:text-red-200',
                        '[&_[role=status]]:border-emerald-400/60 [&_[role=status]]:bg-emerald-500/10 [&_[role=status]]:text-emerald-200',
                    ].join(' ')}
                >
                    {children}
                </div>
            </section>

            {/* Estante completo: pantallas grandes */}
            <aside className="relative hidden flex-1 flex-col justify-center overflow-hidden bg-[#241f42] px-14 py-16 lg:flex">
                <p className="mb-14 max-w-md font-[family-name:var(--font-display)] text-5xl leading-[1.02] font-extrabold tracking-tight text-[#f3f0ff]">
                    Lo que juegas, ves y lees, en un mismo estante.
                </p>
                <div className="max-w-xl">
                    <MediaShelf />
                </div>
            </aside>
        </main>
    );
}
