import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { StoreProvider } from '@/src/store/StoreProvider';
import { SessionHydrator } from '@/src/features/auth/presentation/components/SessionHydrator';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Elpepesetch',
    description: 'Plataforma multimedia',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col">
                <StoreProvider>
                    {children}
                    <Suspense fallback={null}>
                        <SessionHydrator />
                    </Suspense>
                </StoreProvider>
            </body>
        </html>
    );
}
