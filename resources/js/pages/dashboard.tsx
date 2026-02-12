import { Head, Link } from '@inertiajs/react';
import { Camera, Download, Maximize2 } from 'lucide-react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create as timeTicketsCreate, download as downloadTicket, update as updateTicket } from '@/routes/time-tickets';
import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export default function Dashboard({ timeTickets }: PageProps) {
    const [selected, setSelected] = useState<TimeTicket | null>(null);
    const [editingTicketId, setEditingTicketId] = useState<number | null>(null);
    const [editingDateValue, setEditingDateValue] = useState('');
    const orderedTickets = useMemo(
        () => [...(timeTickets ?? [])].sort((a, b) => +new Date(b.taken_at) - +new Date(a.taken_at)),
        [timeTickets],
    );
    const ticketImageUrl = (path: string) => `/storage/${path}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="md:hidden">
                    <Link
                        href={timeTicketsCreate()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-base font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 active:scale-[0.99]"
                        prefetch
                    >
                        <Camera className="h-5 w-5" />
                        Registrar ticket de ponto
                    </Link>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold">Últimas capturas</h2>
                        <p className="text-sm text-muted-foreground">Ordenado por data do registro</p>
                    </div>
                    {orderedTickets.length === 0 ? (
                        <Card className="border-dashed">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Nenhuma foto ainda</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Use o botão “Registrar ticket de ponto” para adicionar a primeira captura.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {orderedTickets.map((ticket) => (
                                <Dialog
                                    key={ticket.id}
                                    onOpenChange={(open) => {
                                        if (!open) {
                                            setSelected(null);
                                            setEditingTicketId(null);
                                            setEditingDateValue('');
                                        }
                                    }}
                                >
                                    <DialogTrigger asChild>
                                        <button
                                            onClick={() => setSelected(ticket)}
                                            className="group relative overflow-hidden rounded-lg border text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                        >
                                            <div className="aspect-video w-full bg-neutral-900/5 dark:bg-neutral-100/5">
                                                <img
                                                    src={ticketImageUrl(ticket.path)}
                                                    alt={ticket.original_name ?? 'Ticket'}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between px-3 py-2">
                                                <div className="text-sm font-semibold">{formatDate(ticket.taken_at)}</div>
                                                <Maximize2 className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                                            </div>
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl">
                                        <DialogHeader>
                                            <DialogTitle>Ticket de ponto</DialogTitle>
                                            <DialogDescription>
                                                {formatDate(ticket.taken_at)} — {ticket.original_name ?? 'Foto'}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="max-h-[70vh] overflow-auto rounded-lg border">
                                            <img
                                                src={ticketImageUrl(ticket.path)}
                                                alt={ticket.original_name ?? 'Ticket'}
                                                className="h-full w-full object-contain bg-neutral-50 dark:bg-neutral-900"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            {editingTicketId === ticket.id ? (
                                                <form
                                                    method="post"
                                                    action={updateTicket({ timeTicket: ticket.id }).url}
                                                    className="flex flex-wrap items-center gap-2"
                                                >
                                                    <input type="hidden" name="_method" value="PATCH" />
                                                    <label className="text-sm text-muted-foreground">
                                                        Data/hora:
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        name="taken_at"
                                                        value={editingDateValue}
                                                        onChange={(e) => setEditingDateValue(e.target.value)}
                                                        className="rounded border px-2 py-1 text-sm shadow-sm"
                                                    />
                                                    <Button
                                                        type="submit"
                                                        size="sm"
                                                        variant="secondary"
                                                        disabled={!editingDateValue || editingDateValue === ticket.taken_at.slice(0, 16)}
                                                    >
                                                        Atualizar
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditingTicketId(null);
                                                            setEditingDateValue('');
                                                        }}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                </form>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setEditingTicketId(ticket.id);
                                                        setEditingDateValue(ticket.taken_at.slice(0, 16));
                                                    }}
                                                >
                                                    Alterar data/hora
                                                </Button>
                                            )}
                                            <Button asChild variant="outline" className="gap-2">
                                                <a href={downloadTicket({ timeTicket: ticket.id }).url} download>
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
