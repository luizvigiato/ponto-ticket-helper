import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthIllustration from '@/components/auth-illustration';
import { formatCpf } from '@/lib/utils';
import { home } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <>
            <Head title="Registro" />

            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
                <div className="grid w-full max-w-5xl grid-cols-1 gap-4 rounded-xl border bg-card md:grid-cols-5">
                    <AuthIllustration />

                    <div className="col-span-1 flex items-center justify-center p-6 md:col-span-2">
                        <div className="flex w-full max-w-md min-w-[300px] flex-col gap-4 rounded-xl border bg-background p-6 shadow-sm dark:bg-[#111111]">
                            <div className="flex flex-col gap-2 text-center">
                                <h1 className="text-justify text-xl font-semibold">
                                    Crie sua conta
                                </h1>
                                <p className="text-justify text-sm text-muted-foreground">
                                    Preencha os dados para começar.
                                </p>
                            </div>

                            <Form
                                {...store.form()}
                                resetOnSuccess={[
                                    'password',
                                    'password_confirmation',
                                ]}
                                disableWhileProcessing
                                className="flex flex-col gap-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Nome</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="name"
                                                name="name"
                                                placeholder="Seu nome completo"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                tabIndex={2}
                                                autoComplete="email"
                                                name="email"
                                                placeholder="email@example.com"
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="cpf">CPF</Label>
                                            <Input
                                                id="cpf"
                                                type="text"
                                                required
                                                tabIndex={3}
                                                name="cpf"
                                                inputMode="numeric"
                                                maxLength={14}
                                                placeholder="000.000.000-00"
                                                onInput={(event) => {
                                                    event.currentTarget.value =
                                                        formatCpf(
                                                            event.currentTarget
                                                                .value,
                                                        );
                                                }}
                                            />
                                            <InputError message={errors.cpf} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password">
                                                Senha
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                name="password"
                                                placeholder="Senha"
                                            />
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                                <Label htmlFor="password_confirmation">
                                                    Confirmar senha
                                                </Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type="password"
                                                    required
                                                    tabIndex={5}
                                                    autoComplete="new-password"
                                                    name="password_confirmation"
                                                    placeholder="Repita a senha"
                                                />
                                            <InputError
                                                message={
                                                    errors.password_confirmation
                                                }
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="mt-1 w-full"
                                            tabIndex={6}
                                            data-test="register-user-button"
                                            disabled={processing}
                                        >
                                            {processing && <Spinner />}
                                            Criar conta
                                        </Button>
                                    </>
                                )}
                            </Form>

                            <div className="text-center text-justify text-sm text-muted-foreground">
                                Já tem conta?{' '}
                                <TextLink href={home()} tabIndex={6}>
                                    Voltar ao início
                                </TextLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
