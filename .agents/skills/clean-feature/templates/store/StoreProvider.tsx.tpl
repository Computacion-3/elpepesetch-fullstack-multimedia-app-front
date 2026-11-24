'use client';

import { useState } from 'react';
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
    return <Provider store={store}>{children}</Provider>;
}
