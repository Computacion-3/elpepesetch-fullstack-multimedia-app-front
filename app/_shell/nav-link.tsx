'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { sidebarLinkClass, topLinkClass } from './nav-styles';

type NavLinkProps = {
    href: string;
    variant?: 'sidebar' | 'top';
    children: ReactNode;
};

/** Enlace que se marca con aria-current="page" cuando la ruta actual le pertenece. */
export function NavLink({ href, variant = 'sidebar', children }: NavLinkProps) {
    const pathname = usePathname();
    const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
    return (
        <Link
            href={href}
            aria-current={active ? 'page' : undefined}
            className={variant === 'top' ? topLinkClass : sidebarLinkClass}
        >
            {children}
        </Link>
    );
}
