import { getSession } from '@/src/lib/dal';
import { AuthViewModelMapper } from '../viewmodels/auth.viewmodel';
import { AuthHydrator } from './AuthHydrator';

/** Server Component: resolves the session on the server and hydrates the client store. */
export async function SessionHydrator() {
    const session = await getSession();
    return <AuthHydrator user={session ? AuthViewModelMapper.toViewModel(session.user) : null} />;
}
