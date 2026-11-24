import type { Metadata } from 'next';
import { __Features__Screen } from '@/src/features/__features-kebab__/presentation/components/__Features__Screen';

export const metadata: Metadata = {
    title: '__Features__',
};

// Route stays a Server Component: thin, no state, no data access. The client screen does the rest.
export default function __Features__Page() {
    return <__Features__Screen />;
}
