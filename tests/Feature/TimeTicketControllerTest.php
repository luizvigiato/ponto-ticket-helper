<?php

use App\Models\TimeTicket;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('authenticated user can access time ticket create page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('time-tickets.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('time-tickets/create'));
});

test('user can store a time ticket image', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $imageContent = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5nQ1cAAAAASUVORK5CYII=');

    $response = $this->actingAs($user)
        ->from(route('time-tickets.create'))
        ->post(route('time-tickets.store'), [
            'image' => UploadedFile::fake()->createWithContent('ponto.png', $imageContent),
            'taken_at' => '2026-02-10 08:30:00',
        ]);

    $response->assertRedirect(route('time-tickets.create'));
    $response->assertSessionHas('status', 'time-ticket.saved');

    $ticket = TimeTicket::query()->where('user_id', $user->id)->first();

    expect($ticket)->not->toBeNull();
    expect($ticket->original_name)->toBe('ponto.png');
    expect($ticket->taken_at?->format('Y-m-d H:i:s'))->toBe('2026-02-10 08:30:00');

    Storage::disk('public')->assertExists($ticket->path);
});

test('store validates required image field', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->from(route('time-tickets.create'))
        ->post(route('time-tickets.store'), [
            'taken_at' => '2026-02-10 08:30:00',
        ]);

    $response->assertRedirect(route('time-tickets.create'));
    $response->assertSessionHasErrors('image');
});

test('owner can update taken at from an existing ticket', function () {
    $user = User::factory()->create();
    $ticket = TimeTicket::query()->create([
        'user_id' => $user->id,
        'path' => 'time-tickets/'.$user->id.'/ticket.jpg',
        'original_name' => 'ticket.jpg',
        'taken_at' => '2026-02-10 08:30:00',
    ]);

    $response = $this->actingAs($user)
        ->patch(route('time-tickets.update', $ticket), [
            'taken_at' => '2026-02-10 17:45:00',
        ]);

    $response->assertSessionHas('status', 'time-ticket.updated');
    $ticket->refresh();

    expect($ticket->taken_at?->format('Y-m-d H:i:s'))->toBe('2026-02-10 17:45:00');
});

test('non owner gets 404 when updating ticket', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();

    $ticket = TimeTicket::query()->create([
        'user_id' => $owner->id,
        'path' => 'time-tickets/'.$owner->id.'/ticket.jpg',
        'original_name' => 'ticket.jpg',
        'taken_at' => '2026-02-10 08:30:00',
    ]);

    $this->actingAs($intruder)
        ->patch(route('time-tickets.update', $ticket), [
            'taken_at' => '2026-02-10 17:45:00',
        ])
        ->assertNotFound();
});

test('owner can show and download own ticket', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $path = 'time-tickets/'.$user->id.'/ticket.jpg';

    Storage::disk('public')->put($path, 'image-content');

    $ticket = TimeTicket::query()->create([
        'user_id' => $user->id,
        'path' => $path,
        'original_name' => 'ticket.jpg',
        'taken_at' => '2026-02-10 08:30:00',
    ]);

    $this->actingAs($user)
        ->get(route('time-tickets.show', $ticket))
        ->assertOk()
        ->assertHeader('Content-Disposition', 'inline; filename="ticket.jpg"');

    $this->actingAs($user)
        ->get(route('time-tickets.download', $ticket))
        ->assertOk()
        ->assertDownload('ticket.jpg');
});

test('show and download return 404 for missing file', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $ticket = TimeTicket::query()->create([
        'user_id' => $user->id,
        'path' => 'time-tickets/'.$user->id.'/missing.jpg',
        'original_name' => 'missing.jpg',
        'taken_at' => '2026-02-10 08:30:00',
    ]);

    $this->actingAs($user)
        ->get(route('time-tickets.show', $ticket))
        ->assertNotFound();

    $this->actingAs($user)
        ->get(route('time-tickets.download', $ticket))
        ->assertNotFound();
});

test('dashboard filters by start and end dates ordered by taken at desc', function () {
    $user = User::factory()->create();

    foreach (range(1, 25) as $index) {
        $day = $index <= 12 ? 10 : 20;
        $minute = str_pad((string) $index, 2, '0', STR_PAD_LEFT);
        TimeTicket::query()->create([
            'user_id' => $user->id,
            'path' => 'time-tickets/'.$user->id."/ticket-{$index}.jpg",
            'original_name' => "ticket-{$index}.jpg",
            'taken_at' => "2026-02-{$day} 10:{$minute}:00",
        ]);
    }
    TimeTicket::query()->create([
        'user_id' => $user->id,
        'path' => 'time-tickets/'.$user->id.'/old-ticket.jpg',
        'original_name' => 'old-ticket.jpg',
        'taken_at' => '2026-01-15 10:00:00',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard', [
            'start_date' => '2026-02-11',
            'end_date' => '2026-02-21',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('timeTickets', 13)
            ->where('timeTickets.0.original_name', 'ticket-25.jpg')
            ->where('timeTickets.12.original_name', 'ticket-13.jpg')
            ->where('filters.start_date', '2026-02-11')
            ->where('filters.end_date', '2026-02-21')
            ->where('showMonthFallbackNotice', false)
        );
});
