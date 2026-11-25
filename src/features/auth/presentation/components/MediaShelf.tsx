import type { CSSProperties } from 'react';

type MediaKind = 'game' | 'movie' | 'book';

type Spine = {
    title: string;
    kind: MediaKind;
    /** Alto relativo al estante (0–1). */
    height: number;
    /** Ancho en rem. */
    width: number;
    /** Inclinación en grados: un lomo recostado sobre el vecino. */
    tilt?: number;
};

const SPINES: Spine[] = [
    { title: 'Blood Meridian', kind: 'book', height: 0.78, width: 2.4 },
    { title: 'Grand Theft Auto 6', kind: 'game', height: 0.92, width: 3.1 },
    { title: 'Avengers: Doomsday', kind: 'movie', height: 0.86, width: 2.7 },
    { title: 'Black Clover Vol.29', kind: 'book', height: 0.64, width: 2 },
    { title: 'Blade Runner 2049', kind: 'movie', height: 0.95, width: 2.5 },
    { title: 'FarCry 5', kind: 'game', height: 0.74, width: 2.9 },
    { title: 'The Shining', kind: 'book', height: 0.88, width: 2.6 },
    { title: 'Spiderman: Brand New Day', kind: 'movie', height: 0.7, width: 2.2, tilt: -7 },
];

const KIND_LABEL: Record<MediaKind, string> = { game: 'Juego', movie: 'Película', book: 'Libro' };

const KIND_CLASS: Record<MediaKind, string> = {
    // Libro: bandas en la cabeza y el pie del lomo.
    book: 'bg-[#f07ba3] rounded-[3px] shadow-[inset_0_10px_0_-6px_#c4537a,inset_0_-10px_0_-6px_#c4537a]',
    // Película: perforaciones de rollo en ambos bordes.
    movie: 'bg-[#f2b544] rounded-[2px] bg-[radial-gradient(circle,#17132b_1.5px,transparent_2px),radial-gradient(circle,#17132b_1.5px,transparent_2px)] bg-[length:8px_10px,8px_10px] bg-[position:2px_4px,right_2px_top_4px] bg-repeat-y',
    // Juego: estuche con la estría superior.
    game: 'bg-[#3fd0c0] rounded-t-md rounded-b-[3px] shadow-[inset_0_18px_0_-12px_#1b8a7f,inset_0_-8px_0_-5px_#1b8a7f]',
};

/**
 * Estante decorativo de la pantalla de acceso. Cada lomo es un juego, una película o un libro;
 * el color indica el tipo (la leyenda lo explica). Es solo ilustración: aria-hidden.
 */
export function MediaShelf({ compact = false }: { compact?: boolean }) {
    const shelfHeight = compact ? 7 : 17; // rem

    return (
        <figure aria-hidden="true" className="w-full">
            <div className="flex items-end gap-1.5 px-2" style={{ height: `${shelfHeight}rem` }}>
                {SPINES.map((spine, index) => (
                    <div
                        key={spine.title}
                        className={`relative flex items-center justify-center motion-safe:animate-[spine-rise_700ms_cubic-bezier(0.2,0.8,0.2,1)_both] ${KIND_CLASS[spine.kind]}`}
                        style={
                            {
                                height: `${spine.height * 100}%`,
                                // Crecen en proporción a su grosor para llenar todo el estante
                                flex: `${spine.width} 1 0`,
                                minWidth: `${compact ? spine.width * 0.5 : spine.width * 0.8}rem`,
                                marginLeft: spine.tilt ? '0.75rem' : undefined,
                                transform: spine.tilt ? `rotate(${spine.tilt}deg)` : undefined,
                                transformOrigin: 'bottom left',
                                animationDelay: `${index * 70}ms`,
                            } as CSSProperties
                        }
                    >
                        {!compact && (
                            <span className="rotate-180 font-(family-name:--font-display) text-[0.82rem] font-bold leading-none tracking-tight text-[#17132b] [writing-mode:vertical-rl]">
                                {spine.title}
                            </span>
                        )}
                    </div>
                ))}
            </div>
            <div className="h-3 rounded-sm bg-[#2f2955] shadow-[inset_0_2px_0_#433b78]" />
            {!compact && (
                <figcaption className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#a8a1cf]">
                    {(Object.keys(KIND_LABEL) as MediaKind[]).map((kind) => (
                        <span key={kind} className="flex items-center gap-2">
                            <span className={`inline-block size-3 rounded-xs ${KIND_CLASS[kind].split(' ')[0]}`} />
                            {KIND_LABEL[kind]}
                        </span>
                    ))}
                </figcaption>
            )}
        </figure>
    );
}
