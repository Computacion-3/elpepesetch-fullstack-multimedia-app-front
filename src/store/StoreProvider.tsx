'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './store';
import type { AppStore } from './store';

/**
 * Redux needs React Context, so this is a Client Component. app/layout.tsx stays a Server
 * Component and just wraps {children} with it. useState(makeStore) creates the store once.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
    const [store] = useState<AppStore>(makeStore);

    // Solo en las pruebas E2E (NEXT_PUBLIC_E2E=true, lo pone playwright.config.ts): expone el
    // store para comprobar que el logout lo deja vacío. En un build normal no hace nada.
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_E2E !== 'true') return;
        (window as Window & { __APP_STORE__?: AppStore }).__APP_STORE__ = store;
    }, [store]);

    return <Provider store={store}>{children}</Provider>;
}
