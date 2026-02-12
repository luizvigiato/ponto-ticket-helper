<?php

namespace App\Http\Requests\TimeTicket;

use Illuminate\Foundation\Http\FormRequest;

class StoreTimeTicketRequest extends FormRequest
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
            'image' => ['required', 'file', 'image', 'max:20480'],
            'taken_at' => ['nullable', 'date'],
        ];
    }
}
