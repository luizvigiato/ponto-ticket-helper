<?php

use App\Rules\ValidCpf;

it('accepts a valid CPF', function () {
    $rule = new ValidCpf;
    $failed = false;

    $rule->validate('cpf', '52998224725', function () use (&$failed) {
        $failed = true;
    });

    expect($failed)->toBeFalse();
});

it('rejects an invalid CPF', function () {
    $rule = new ValidCpf;
    $failed = false;

    $rule->validate('cpf', '11111111111', function () use (&$failed) {
        $failed = true;
    });

    expect($failed)->toBeTrue();
});
