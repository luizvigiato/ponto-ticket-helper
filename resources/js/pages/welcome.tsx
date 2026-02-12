import { Form, Head, Link, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthIllustration from '@/components/auth-illustration';
import { dashboard, register } from '@/routes';
import { store as loginStore } from '@/routes/login';
import type { SharedData } from '@/types';
export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Inico" />

            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
                <div className="w-full max-w-5xl rounded-xl border bg-card">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        <AuthIllustration className="min-h-80" />

                        <div className="col-span-1 flex items-center justify-center p-6 md:col-span-2">
                            <div className="flex w-full max-w-md min-w-[300px] flex-col gap-4 rounded-xl border bg-background p-6 shadow-sm dark:bg-[#111111]">
                                <div className="flex flex-col gap-2 text-center">
                                    <h2 className="text-justify text-lg font-semibold">
                                        Bem-vindo
                                    </h2>
                                    <p className="text-justify text-sm text-muted-foreground">
                                        {auth?.user ? (
                                            "Acesse o dashboard."
                                        ) : (
                                            "Acesse sua conta ou crie uma nova."
                                        )}
                                    </p>
                                </div>

                                {auth?.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="w-full rounded-md bg-primary px-4 py-2 text-center text-primary-foreground hover:brightness-95"
                                    >
                                        Acessar Dashboard
                                    </Link>
                                ) : (
                                    <Form
                                        {...loginStore.form()}
                                        resetOnSuccess={['password']}
                                        className="flex flex-col gap-4"
                                    >
                                        {({ processing, errors }) => (
                                            <>
                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor="email">
                                                        Email
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        required
                                                        autoComplete="email"
                                                        placeholder="seu@email.com"
                                                    />
                                                    <InputError
                                                        message={errors.email}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor="password">
                                                        Senha
                                                    </Label>
                                                    <Input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        required
                                                        autoComplete="current-password"
                                                        placeholder="••••••••"
                                                    />
                                                    <InputError
                                                        message={errors.password}
                                                    />
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="w-full"
                                                    disabled={processing}
                                                >
                                                    {processing && <Spinner />}
                                                    Entrar
                                                </Button>

                                                {canRegister && (
                                                    <p className="text-center text-justify text-sm text-muted-foreground">
                                                        Crie sua conta{' '}
                                                        <Link
                                                            href={register()}
                                                            className="font-medium text-primary underline-offset-4 hover:underline"
                                                        >
                                                            aqui
                                                        </Link>
                                                        .
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </Form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
