<?php

use App\Models\User;

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'cpf' => '52998224725',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('new users can register with formatted cpf', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Formatted CPF User',
        'email' => 'formatted@example.com',
        'cpf' => '529.982.247-25',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));

    expect(User::query()->where('email', 'formatted@example.com')->first()?->cpf)->toBe('52998224725');
});
