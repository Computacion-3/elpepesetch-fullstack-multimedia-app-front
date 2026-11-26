/** Clases de los enlaces de navegación (módulo sin 'use client' para usarlas también en el servidor). */
export const sidebarLinkClass =
    'flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-[current=page]:bg-white/10 aria-[current=page]:text-foreground';

export const topLinkClass =
    'shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-[current=page]:bg-brand/15 aria-[current=page]:text-brand';

/** Bloque de la barra lateral: en móvil es una fila desplazable, en escritorio una columna con título. */
export const sidebarSectionClass = 'flex shrink-0 items-center gap-1 lg:flex-col lg:items-stretch';

export const sidebarSectionTitleClass =
    'hidden px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted/70 uppercase lg:block';
