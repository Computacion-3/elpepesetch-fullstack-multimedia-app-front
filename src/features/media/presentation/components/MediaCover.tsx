'use client';

import { useState } from 'react';
import { BookOpen, Clapperboard, Gamepad2 } from 'lucide-react';
import type { MediaItemViewModel } from '../viewmodels/media.viewmodel';

type MediaCoverProps = {
    item: Pick<MediaItemViewModel, 'title' | 'type' | 'coverUrl'>;
    className?: string;
};

const FALLBACK = {
    GAME: { icon: Gamepad2, label: 'Videojuego', tint: 'from-[#3a2f7a] via-[#2b2459] to-[#1f1a40]', accent: 'text-[#b9b3ff]' },
    MOVIE: { icon: Clapperboard, label: 'Película', tint: 'from-[#5a2346] via-[#3b1e3f] to-[#21182f]', accent: 'text-[#ffb3d1]' },
    BOOK: { icon: BookOpen, label: 'Libro', tint: 'from-[#1f4a4a] via-[#1e3540] to-[#19212f]', accent: 'text-[#8fe3d4]' },
} as const;

/**
 * Portada de un elemento del catálogo. Usa la URL guardada; si no hay o falla al cargar,
 * dibuja una portada genérica según el tipo (juego, película o libro). No repite el título: ya
 * lo muestra la tarjeta o el detalle.
 */
export function MediaCover({ item, className = '' }: MediaCoverProps) {
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const fallback = FALLBACK[item.type];
    const Icon = fallback.icon;

    if (item.coverUrl && failedUrl !== item.coverUrl) {
        const src = item.coverUrl;
        return (
            <div className={`relative overflow-hidden bg-surface-raised ${className}`}>
                {/* Las portadas vienen de cualquier dominio (URL libre en la propuesta), por eso no se usa next/image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={`Portada de ${item.title}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => setFailedUrl(src)}
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </div>
        );
    }

    return (
        <div
            role="img"
            aria-label={`Sin portada: ${fallback.label.toLowerCase()} «${item.title}»`}
            className={`relative grid place-items-center overflow-hidden bg-linear-to-br ${fallback.tint} ${className}`}
        >
            <Icon
                aria-hidden="true"
                size={160}
                strokeWidth={0.9}
                className={`pointer-events-none absolute -right-8 -bottom-10 opacity-10 ${fallback.accent}`}
            />
            <Icon aria-hidden="true" size={44} strokeWidth={1.4} className={fallback.accent} />
        </div>
    );
}
