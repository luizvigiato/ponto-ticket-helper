<?php

use App\Models\TimeTicket;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('home'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard shows only current month tickets by default', function () {
    Carbon::setTestNow(Carbon::create(2026, 2, 17, 10, 0, 0));

    $user = User::factory()->create();
    TimeTicket::query()->create([
        'user_id' => $user->id,
        'path' => 'time-tickets/'.$user->id.'/current.jpg',
        'original_name' => 'current.jpg',
        'taken_at' => '2026-02-16 08:00:00',
    ]);
    TimeTicket::query()->create([
        'user_id' => $user->id,
        'path' => 'time-tickets/'.$user->id.'/old.jpg',
        'original_name' => 'old.jpg',
        'taken_at' => '2026-01-16 08:00:00',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('timeTickets', 1)
            ->where('timeTickets.0.original_name', 'current.jpg')
            ->where('filters.start_date', '')
            ->where('filters.end_date', '')
            ->where('showMonthFallbackNotice', false)
        );

    Carbon::setTestNow();
});

test('dashboard shows fallback notice when current month is empty but old tickets exist', function () {
    Carbon::setTestNow(Carbon::create(2026, 2, 17, 10, 0, 0));

    $user = User::factory()->create();
    TimeTicket::query()->create([
        'user_id' => $user->id,
        'path' => 'time-tickets/'.$user->id.'/old.jpg',
        'original_name' => 'old.jpg',
        'taken_at' => '2026-01-16 08:00:00',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('timeTickets', 0)
            ->where('showMonthFallbackNotice', true)
        );

    Carbon::setTestNow();
});
