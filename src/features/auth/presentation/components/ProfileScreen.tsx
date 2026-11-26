'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import type { FormEvent } from 'react';
import { Mail, ShieldCheck } from 'lucide-react';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';
import { Spinner } from '@/src/shared/ui/Spinner';
import { TextArea } from '@/src/shared/ui/TextArea';
import { TextField } from '@/src/shared/ui/TextField';
import type { ProfileDraft } from '../../domain/entities/user';
import { useAuth } from '../hooks/use-auth';
import type { AuthUserViewModel } from '../viewmodels/auth.viewmodel';

const BIO_MAX_LENGTH = 200;
const subscribeNoop = () => () => {};

type ProfileForm = {
    fullName: string;
    username: string;
    email: string;
    bio: string;
    password: string;
    confirmPassword: string;
};

function formFrom(user: AuthUserViewModel): ProfileForm {
    return {
        fullName: user.fullName ?? '',
        username: user.username,
        email: user.email,
        bio: user.bio ?? '',
        password: '',
        confirmPassword: '',
    };
}

/** Solo viajan los campos distintos a los guardados; la contraseña, solo si se escribió una nueva. */
function draftFrom(form: ProfileForm, user: AuthUserViewModel): ProfileDraft {
    const saved = formFrom(user);
    const draft: ProfileDraft = {};
    if (form.fullName.trim() !== saved.fullName) draft.fullName = form.fullName;
    if (form.username.trim() !== saved.username) draft.username = form.username.trim();
    if (form.email.trim() !== saved.email) draft.email = form.email.trim();
    if (form.bio.trim() !== saved.bio) draft.bio = form.bio;
    if (form.password) draft.password = form.password;
    return draft;
}

/** Perfil propio: resumen de la cuenta y formulario para editar datos y contraseña (PATCH /users/me). */
export function ProfileScreen() {
    const { user } = useAuth();
    // El store se llena en el cliente (SessionHydrator): antes de hidratar se pinta lo mismo que en el servidor.
    const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);

    if (!hydrated || !user) return <Spinner label="Cargando tu perfil" size="lg" className="py-20" />;
    return <ProfileContent user={user} />;
}

function ProfileContent({ user }: { user: AuthUserViewModel }) {
    const { updateProfile, profileStatus, profileError, resetProfileFeedback } = useAuth();
    const [form, setForm] = useState<ProfileForm>(() => formFrom(user));
    const [localError, setLocalError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        resetProfileFeedback();
    }, [resetProfileFeedback]);

    const draft = draftFrom(form, user);
    const hasChanges = Object.keys(draft).length > 0;
    const saving = profileStatus === 'loading';

    const change = (field: keyof ProfileForm) => (value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
        setSaved(false);
        setLocalError(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (form.password && form.password !== form.confirmPassword) {
            setLocalError('Las contraseñas no coinciden');
            return;
        }
        if (await updateProfile(draft)) {
            setForm((current) => ({
                ...current,
                fullName: current.fullName.trim(),
                username: current.username.trim(),
                email: current.email.trim(),
                bio: current.bio.trim(),
                password: '',
                confirmPassword: '',
            }));
            setSaved(true);
        }
    };

    const discard = () => {
        setForm(formFrom(user));
        setLocalError(null);
        setSaved(false);
        resetProfileFeedback();
    };

    return (
        <section aria-labelledby="profile-title" className="space-y-6">
            <header>
                <h1 id="profile-title" className="text-3xl font-bold">
                    Mi perfil
                </h1>
                <p className="mt-2 text-muted">Tus datos de cuenta y cómo te ven los demás en listas y reseñas.</p>
            </header>

            <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
                <aside className="rounded-2xl border border-white/10 bg-surface p-6 text-center">
                    <span
                        aria-hidden="true"
                        className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand text-2xl font-bold text-[#17132b]"
                    >
                        {user.initials || '?'}
                    </span>
                    <p className="mt-4 text-xl font-semibold break-words">{user.displayName}</p>
                    <p className="text-sm text-muted">@{user.username}</p>
                    <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold tracking-wide text-brand">
                        <ShieldCheck size={14} aria-hidden="true" />
                        {user.role}
                    </p>
                    <p className="mt-4 flex items-center justify-center gap-2 text-sm break-all text-muted">
                        <Mail size={15} aria-hidden="true" className="shrink-0" />
                        {user.email}
                    </p>
                    <p className={`mt-4 text-sm ${user.bio ? '' : 'text-muted italic'}`}>
                        {user.bio ?? 'Todavía no escribiste una biografía.'}
                    </p>
                    {user.permissions.length > 0 && (
                        <div className="mt-6 border-t border-white/10 pt-4 text-left">
                            <p className="text-xs font-semibold tracking-wider text-muted uppercase">
                                Permisos ({user.permissions.length})
                            </p>
                            <ul className="mt-2 flex flex-wrap gap-1.5">
                                {user.permissions.map((permission) => (
                                    <li
                                        key={permission}
                                        className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] text-muted"
                                    >
                                        {permission}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </aside>

                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-8 rounded-2xl border border-white/10 bg-surface p-6 sm:p-7"
                >
                    <fieldset className="space-y-4">
                        <legend className="text-lg font-semibold">Datos de la cuenta</legend>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <TextField
                                id="profile-full-name"
                                label="Nombre completo"
                                autoComplete="name"
                                maxLength={100}
                                value={form.fullName}
                                onChange={(event) => change('fullName')(event.target.value)}
                            />
                            <TextField
                                id="profile-username"
                                label="Nombre de usuario"
                                autoComplete="username"
                                required
                                maxLength={30}
                                value={form.username}
                                onChange={(event) => change('username')(event.target.value)}
                            />
                        </div>
                        <TextField
                            id="profile-email"
                            label="Correo electrónico"
                            type="email"
                            autoComplete="email"
                            required
                            value={form.email}
                            onChange={(event) => change('email')(event.target.value)}
                        />
                        <div>
                            <TextArea
                                id="profile-bio"
                                label="Biografía"
                                rows={3}
                                maxLength={BIO_MAX_LENGTH}
                                value={form.bio}
                                onChange={(event) => change('bio')(event.target.value)}
                            />
                            <p className="mt-1 text-right text-xs text-muted" aria-live="polite">
                                {form.bio.length}/{BIO_MAX_LENGTH}
                            </p>
                        </div>
                    </fieldset>

                    <fieldset className="space-y-4 border-t border-white/10 pt-6">
                        <legend className="text-lg font-semibold">Cambiar contraseña</legend>
                        <p className="text-sm text-muted">
                            Déjala vacía para conservar la actual. Mínimo 8 caracteres, con mayúscula, minúscula y número.
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <TextField
                                id="profile-password"
                                label="Nueva contraseña"
                                type="password"
                                autoComplete="new-password"
                                value={form.password}
                                onChange={(event) => change('password')(event.target.value)}
                            />
                            <TextField
                                id="profile-password-confirm"
                                label="Confirmar contraseña"
                                type="password"
                                autoComplete="new-password"
                                value={form.confirmPassword}
                                onChange={(event) => change('confirmPassword')(event.target.value)}
                            />
                        </div>
                    </fieldset>

                    {(localError ?? profileError) && <Alert variant="error">{localError ?? profileError}</Alert>}
                    {saved && !hasChanges && <Alert variant="success">Perfil actualizado.</Alert>}

                    <div className="flex flex-wrap justify-end gap-3">
                        <Button variant="secondary" onClick={discard} disabled={!hasChanges || saving}>
                            Descartar cambios
                        </Button>
                        <Button type="submit" loading={saving} disabled={!hasChanges}>
                            Guardar cambios
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    );
}
