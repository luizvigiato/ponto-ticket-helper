<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TimeTicketController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

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
