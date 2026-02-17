<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidCpf implements ValidationRule
{
    /**
     * Validate a CPF number (numbers only or formatted).
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $cpf = preg_replace('/\D/', '', (string) $value);

        if ($cpf === null || strlen($cpf) !== 11) {
            $fail('O CPF informado é inválido.');
            return;
        }

        // Reject repeated digits (e.g., 00000000000)
        if (preg_match('/^(\\d)\\1{10}$/', $cpf)) {
            $fail('O CPF informado é inválido.');
            return;
        }

        if (!$this->hasValidDigits($cpf)) {
            $fail('O CPF informado é inválido.');
        }
    }

    protected function hasValidDigits(string $cpf): bool
    {
        $digits = array_map('intval', str_split($cpf));

        $firstCheck = $this->calculateCheckDigit(array_slice($digits, 0, 9), 10);
        $secondCheck = $this->calculateCheckDigit(array_slice($digits, 0, 10), 11);

        return $digits[9] === $firstCheck && $digits[10] === $secondCheck;
    }

    protected function calculateCheckDigit(array $digits, int $startMultiplier): int
    {
        $sum = 0;

        foreach ($digits as $index => $digit) {
            $sum += $digit * ($startMultiplier - $index);
        }

        $remainder = $sum % 11;

        return $remainder < 2 ? 0 : 11 - $remainder;
    }
}
