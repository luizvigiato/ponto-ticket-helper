<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\TimeTicketController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function (Request $request) {
    $timeTickets = $request->user()
        ? $request->user()
            ->timeTickets()
            ->latest('taken_at')
            ->limit(20)
            ->get()
            ->map(fn ($ticket) => [
                'id' => $ticket->id,
                'path' => $ticket->path,
                'taken_at' => optional($ticket->taken_at)
                    ?->timezone(config('app.timezone'))
                    ->format('Y-m-d H:i:s'),
                'original_name' => $ticket->original_name,
                'created_at' => optional($ticket->created_at)
                    ?->timezone(config('app.timezone'))
                    ->format('Y-m-d H:i:s'),
            ])
        : [];

    return Inertia::render('dashboard', [
        'timeTickets' => $timeTickets,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('time-tickets/create', [TimeTicketController::class, 'create'])
        ->name('time-tickets.create');
    Route::post('time-tickets', [TimeTicketController::class, 'store'])
        ->name('time-tickets.store');
    Route::patch('time-tickets/{timeTicket}', [TimeTicketController::class, 'update'])
        ->name('time-tickets.update');
    Route::get('time-tickets/{timeTicket}', [TimeTicketController::class, 'show'])
        ->name('time-tickets.show');
    Route::get('time-tickets/{timeTicket}/download', [TimeTicketController::class, 'download'])
        ->name('time-tickets.download');
});

require __DIR__.'/settings.php';
