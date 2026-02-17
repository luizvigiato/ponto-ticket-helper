<?php

use App\Http\Controllers\TimeTicketController;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function (Request $request) {
    $user = $request->user();
    $timeTickets = [];
    $showMonthFallbackNotice = false;
    $timezone = config('app.timezone');
    $now = Carbon::now($timezone);
    $selectedStartDate = trim((string) $request->query('start_date', ''));
    if ($selectedStartDate !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $selectedStartDate) !== 1) {
        $selectedStartDate = '';
    }

    $selectedEndDate = trim((string) $request->query('end_date', ''));
    if ($selectedEndDate !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $selectedEndDate) !== 1) {
        $selectedEndDate = '';
    }

    if ($selectedStartDate !== '' && $selectedEndDate !== '' && $selectedStartDate > $selectedEndDate) {
        [$selectedStartDate, $selectedEndDate] = [$selectedEndDate, $selectedStartDate];
    }

    if ($user) {
        $monthStart = (clone $now)->startOfMonth()->startOfDay();
        $monthEnd = (clone $now)->endOfMonth()->endOfDay();
        $rangeStart = clone $monthStart;
        $rangeEnd = clone $monthEnd;

        $hasExplicitFilter = $selectedStartDate !== '' || $selectedEndDate !== '';
        if ($hasExplicitFilter) {
            if ($selectedStartDate === '') {
                $selectedStartDate = $selectedEndDate;
            }

            if ($selectedEndDate === '') {
                $selectedEndDate = $selectedStartDate;
            }

            $rangeStart = Carbon::createFromFormat('Y-m-d H:i:s', $selectedStartDate.' 00:00:00', $timezone);
            $rangeEnd = Carbon::createFromFormat('Y-m-d H:i:s', $selectedEndDate.' 23:59:59', $timezone);
        }

        $query = $user->timeTickets()
            ->whereBetween('taken_at', [
                $rangeStart->format('Y-m-d H:i:s'),
                $rangeEnd->format('Y-m-d H:i:s'),
            ]);

        $timeTickets = $query
            ->latest('taken_at')
            ->limit(100)
            ->get()
            ->map(fn ($ticket) => [
                'id' => $ticket->id,
                'path' => $ticket->path,
                'taken_at' => optional($ticket->taken_at)
                    ?->timezone($timezone)
                    ->format('Y-m-d H:i:s'),
                'original_name' => $ticket->original_name,
                'created_at' => optional($ticket->created_at)
                    ?->timezone($timezone)
                    ->format('Y-m-d H:i:s'),
            ]);

        if ($hasExplicitFilter === false && $timeTickets->isEmpty()) {
            $hasOlderTickets = $user->timeTickets()
                ->where('taken_at', '<', $monthStart->format('Y-m-d H:i:s'))
                ->exists();

            $showMonthFallbackNotice = $hasOlderTickets;
        }
    }

    return Inertia::render('dashboard', [
        'timeTickets' => $timeTickets,
        'filters' => [
            'start_date' => $selectedStartDate,
            'end_date' => $selectedEndDate,
        ],
        'showMonthFallbackNotice' => $showMonthFallbackNotice,
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
