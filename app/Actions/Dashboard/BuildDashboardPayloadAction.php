<?php

namespace App\Actions\Dashboard;

use App\Models\User;
use Illuminate\Support\Carbon;

class BuildDashboardPayloadAction
{
    /**
     * @return array{timeTickets: \Illuminate\Support\Collection<int, array<string, mixed>>, filters: array{start_date: string, end_date: string}, showMonthFallbackNotice: bool}
     */
    public function handle(User $user, ?string $startDateInput, ?string $endDateInput): array
    {
        $timezone = config('app.timezone');
        $now = Carbon::now($timezone);

        $selectedStartDate = $this->sanitizeDate($startDateInput);
        $selectedEndDate = $this->sanitizeDate($endDateInput);

        if ($selectedStartDate !== '' && $selectedEndDate !== '' && $selectedStartDate > $selectedEndDate) {
            [$selectedStartDate, $selectedEndDate] = [$selectedEndDate, $selectedStartDate];
        }

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

        $timeTickets = $user->timeTickets()
            ->whereBetween('taken_at', [
                $rangeStart->format('Y-m-d H:i:s'),
                $rangeEnd->format('Y-m-d H:i:s'),
            ])
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

        $showMonthFallbackNotice = false;
        if ($hasExplicitFilter === false && $timeTickets->isEmpty()) {
            $showMonthFallbackNotice = $user->timeTickets()
                ->where('taken_at', '<', $monthStart->format('Y-m-d H:i:s'))
                ->exists();
        }

        return [
            'timeTickets' => $timeTickets,
            'filters' => [
                'start_date' => $selectedStartDate,
                'end_date' => $selectedEndDate,
            ],
            'showMonthFallbackNotice' => $showMonthFallbackNotice,
        ];
    }

    private function sanitizeDate(?string $value): string
    {
        $date = trim((string) $value);

        if ($date === '' || preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) !== 1) {
            return '';
        }

        return $date;
    }
}
