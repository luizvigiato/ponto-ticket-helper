import { Head, Link, useForm } from '@inertiajs/react';
import { Camera, Download, Maximize2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import {
    create as timeTicketsCreate,
    download as downloadTicket,
    store as timeTicketsStore,
    update as updateTicket,
} from '@/routes/time-tickets';
import { type ChangeEvent, useMemo, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem, TimeTicket } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type PageProps = {
    timeTickets: TimeTicket[];
};

function formatDate(value: string) {
    const normalized = value.replace(' ', 'T');
    const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

    if (!match) return value;

    const [, year, month, day, hour, minute] = match;
    const localDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
    );

    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(localDate);
}

function formatDateTimeLocal(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toDateTimeLocalValue(value: string): string {
    return value.replace(' ', 'T').slice(0, 16);
}

function toComparableTimestamp(value: string): number {
    const normalized = value.replace(' ', 'T');
    const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

    if (!match) {
        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    const [, year, month, day, hour, minute] = match;

    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
    ).getTime();
}

export default function Dashboard({ timeTickets }: PageProps) {
    const [editingTicketId, setEditingTicketId] = useState<number | null>(null);
    const [initialEditDateValue, setInitialEditDateValue] = useState('');
    const galleryInputRef = useRef<HTMLInputElement | null>(null);
    const cameraInputRef = useRef<HTMLInputElement | null>(null);

    const orderedTickets = useMemo(
        () =>
            [...(timeTickets ?? [])].sort(
                (a, b) =>
                    toComparableTimestamp(b.taken_at) -
                    toComparableTimestamp(a.taken_at),
            ),
        [timeTickets],
    );

    const {
        setData: setUploadData,
        post,
        reset: resetUpload,
        processing: isUploading,
    } = useForm<{
        image: File | null;
        taken_at: string;
    }>({
        image: null,
        taken_at: '',
    });

    const {
        data: editData,
        setData: setEditData,
        patch: patchEdit,
        processing: isEditing,
        errors: editErrors,
        clearErrors: clearEditErrors,
    } = useForm<{
        taken_at: string;
    }>({
        taken_at: '',
    });

    const ticketImageUrl = (path: string) => `/storage/${path}`;

    const openGalleryUpload = () => {
        galleryInputRef.current?.click();
    };

    const openCameraUpload = () => {
        cameraInputRef.current?.click();
    };

    const handleQuickUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        if (!file) return;

        setUploadData({
            image: file,
            taken_at: formatDateTimeLocal(new Date()),
        });

        post(timeTicketsStore.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                resetUpload();
                if (galleryInputRef.current) galleryInputRef.current.value = '';
                if (cameraInputRef.current) cameraInputRef.current.value = '';
            },
        });
    };

    const handleEditSubmit = (ticketId: number) => {
        patchEdit(updateTicket({ timeTicket: ticketId }).url, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingTicketId(null);
                setInitialEditDateValue('');
                setEditData('taken_at', '');
                clearEditErrors();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleQuickUpload}
                    />
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleQuickUpload}
                    />
                    <Button
                        type="button"
                        onClick={openCameraUpload}
                        disabled={isUploading}
                        className="h-11 w-full gap-2 rounded-xl text-base font-semibold md:w-auto"
                    >
                        <Camera className="h-5 w-5" />
                        {isUploading ? 'Enviando foto...' : 'Tirar foto'}
                    </Button>
                    <Button
                        type="button"
                        onClick={openGalleryUpload}
                        disabled={isUploading}
                        variant="secondary"
                        className="h-11 w-full gap-2 rounded-xl text-base font-semibold md:w-auto"
                    >
                        {isUploading ? 'Enviando foto...' : 'Escolher da galeria'}
                    </Button>
                    <Link
                        href={timeTicketsCreate()}
                        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                        prefetch
                    >
                        Abrir tela completa (com ajuste manual de data/hora)
                    </Link>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold">
                            Últimas capturas
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Ordenado por data do registro
                        </p>
                    </div>

                    {orderedTickets.length === 0 ? (
                        <Card className="border-dashed">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">
                                    Nenhuma foto ainda
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Use “Tirar foto” ou “Escolher da galeria” para
                                enviar a primeira captura.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {orderedTickets.map((ticket) => (
                                <Dialog
                                    key={ticket.id}
                                    onOpenChange={(open) => {
                                        if (!open) {
                                            setEditingTicketId(null);
                                            setInitialEditDateValue('');
                                            setEditData('taken_at', '');
                                            clearEditErrors();
                                        }
                                    }}
                                >
                                    <DialogTrigger asChild>
                                        <button className="group relative overflow-hidden rounded-lg border text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                            <div className="aspect-video w-full bg-neutral-900/5 dark:bg-neutral-100/5">
                                                <img
                                                    src={ticketImageUrl(
                                                        ticket.path,
                                                    )}
                                                    alt={
                                                        ticket.original_name ??
                                                        'Ticket'
                                                    }
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between px-3 py-2">
                                                <div className="text-sm font-semibold">
                                                    {formatDate(
                                                        ticket.taken_at,
                                                    )}
                                                </div>
                                                <Maximize2 className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                                            </div>
                                        </button>
                                    </DialogTrigger>

                                    <DialogContent className="max-w-3xl">
                                        <DialogHeader>
                                            <DialogTitle>
                                                Ticket de ponto
                                            </DialogTitle>
                                            <DialogDescription>
                                                {formatDate(ticket.taken_at)} -{' '}
                                                {ticket.original_name ?? 'Foto'}
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="max-h-[70vh] overflow-auto rounded-lg border">
                                            <img
                                                src={ticketImageUrl(ticket.path)}
                                                alt={
                                                    ticket.original_name ??
                                                    'Ticket'
                                                }
                                                className="h-full w-full object-contain bg-neutral-50 dark:bg-neutral-900"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            {editingTicketId === ticket.id ? (
                                                <form
                                                    className="flex flex-wrap items-center gap-2"
                                                    onSubmit={(event) => {
                                                        event.preventDefault();
                                                        handleEditSubmit(
                                                            ticket.id,
                                                        );
                                                    }}
                                                >
                                                    <label className="text-sm text-muted-foreground">
                                                        Data/hora:
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        name="taken_at"
                                                        value={editData.taken_at}
                                                        onChange={(e) =>
                                                            setEditData(
                                                                'taken_at',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="rounded border px-2 py-1 text-sm shadow-sm"
                                                    />
                                                    <Button
                                                        type="submit"
                                                        size="sm"
                                                        variant="secondary"
                                                        disabled={
                                                            isEditing ||
                                                            !editData.taken_at ||
                                                            editData.taken_at ===
                                                                initialEditDateValue
                                                        }
                                                    >
                                                        Atualizar
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditingTicketId(
                                                                null,
                                                            );
                                                            setInitialEditDateValue(
                                                                '',
                                                            );
                                                            setEditData(
                                                                'taken_at',
                                                                '',
                                                            );
                                                            clearEditErrors();
                                                        }}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                    {editErrors.taken_at && (
                                                        <p className="w-full text-sm text-red-600 dark:text-red-400">
                                                            {
                                                                editErrors.taken_at
                                                            }
                                                        </p>
                                                    )}
                                                </form>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        const dateValue =
                                                            toDateTimeLocalValue(
                                                                ticket.taken_at,
                                                            );
                                                        setEditingTicketId(
                                                            ticket.id,
                                                        );
                                                        setInitialEditDateValue(
                                                            dateValue,
                                                        );
                                                        setEditData(
                                                            'taken_at',
                                                            dateValue,
                                                        );
                                                        clearEditErrors();
                                                    }}
                                                >
                                                    Alterar data/hora
                                                </Button>
                                            )}

                                            <Button
                                                asChild
                                                variant="outline"
                                                className="gap-2"
                                            >
                                                <a
                                                    href={
                                                        downloadTicket({
                                                            timeTicket:
                                                                ticket.id,
                                                        }).url
                                                    }
                                                    download
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Baixar foto
                                                </a>
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
