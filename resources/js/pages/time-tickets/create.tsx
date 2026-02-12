import { FormEvent, useMemo, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { create as timeTicketsCreate, store as timeTicketsStore } from '@/routes/time-tickets';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Capturar Ponto',
        href: timeTicketsCreate().url,
    },
];

function formatDateTimeLocal(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type PageProps = SharedData & {
    status?: string;
};

export default function TimeTicketCreate() {
    const defaultDateTime = useMemo(() => formatDateTimeLocal(new Date()), []);
    const [preview, setPreview] = useState<string | null>(null);
    const { status } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors, reset, progress } = useForm<{
        image: File | null;
        taken_at: string;
    }>({
        image: null,
        taken_at: defaultDateTime,
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        post(timeTicketsStore.url(), {
            forceFormData: true,
            onSuccess: () => {
                setPreview(null);
                reset();
                setData('taken_at', formatDateTimeLocal(new Date()));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Capturar ponto" />

            <div className="flex h-full flex-col gap-4 p-4">
                <Heading
                    variant="small"
                    title="Registrar ticket de ponto"
                    description="Use a câmera ou galeria para enviar o comprovante."
                />

                {status === 'time-ticket.saved' && (
                    <Alert variant="default" className="flex items-start gap-2 border-green-200 bg-green-50 text-green-900 dark:border-green-900/50 dark:bg-green-950">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                        <AlertDescription className="space-y-1">
                            <p><strong>Registro concluído.</strong> A foto foi salva e fica visível só para você.</p>
                            <p className="text-sm text-green-800/80 dark:text-green-200/80">Precisa ajustar a data/hora? Basta editar antes de enviar a próxima foto.</p>
                        </AlertDescription>
                    </Alert>
                )}

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Nova captura</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                            encType="multipart/form-data"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="image">Foto do ticket</Label>
                                <Input
                                    id="image"
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    required
                                    onChange={(event) => {
                                        const file =
                                            event.target.files?.[0] ?? null;
                                        setData('image', file);
                                        setPreview(
                                            file
                                                ? URL.createObjectURL(file)
                                                : null,
                                        );
                                    }}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Você pode tirar uma foto ou selecionar da
                                    galeria. Máx. 16 MB.
                                </p>
                                <InputError message={errors.image} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="taken_at">
                                    Data e hora do registro
                                </Label>
                                <Input
                                    id="taken_at"
                                    name="taken_at"
                                    type="datetime-local"
                                    value={data.taken_at}
                                    onChange={(event) =>
                                        setData('taken_at', event.target.value)
                                    }
                                />
                                <p className="text-sm text-muted-foreground">
                                    Preenchemos com o agora, mas você pode
                                    ajustar para salvar tickets anteriores.
                                </p>
                                <InputError message={errors.taken_at} />
                            </div>

                            {preview && (
                                <div className="space-y-2">
                                    <Label className="text-sm">
                                        Pré-visualização
                                    </Label>
                                    <img
                                        src={preview}
                                        alt="Pré-visualização do ticket"
                                        className="max-h-80 w-full rounded-lg border object-contain"
                                    />
                                </div>
                            )}

                            {progress && (
                                <div className="text-sm text-muted-foreground">
                                    Enviando: {progress.percentage}%
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <Button
                                    type="submit"
                                    disabled={processing || data.image === null}
                                >
                                    Salvar foto
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
