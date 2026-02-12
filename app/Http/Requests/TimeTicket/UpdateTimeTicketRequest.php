<?php

namespace App\Http\Requests\TimeTicket;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTimeTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'taken_at' => ['required', 'date'],
        ];
    }
}
