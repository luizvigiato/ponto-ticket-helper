<?php

namespace App\Http\Controllers;

use App\Http\Requests\TimeTicket\StoreTimeTicketRequest;
use App\Http\Requests\TimeTicket\UpdateTimeTicketRequest;
use App\Models\TimeTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TimeTicketController extends Controller
{
    /**
     * Show the capture/upload screen.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('time-tickets/create', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Store a new time ticket photo for the authenticated user.
     */
    public function store(StoreTimeTicketRequest $request): RedirectResponse
    {
        $user = $request->user();
        $takenAt = $request->date('taken_at') ?? Carbon::now();

        // Save on the public disk so it is web-accessible via storage symlink.
        $path = $request->file('image')->store(
            'time-tickets/'.$user->id,
            'public'
        );

        $user->timeTickets()->create([
            'path' => $path,
            'original_name' => $request->file('image')->getClientOriginalName(),
            'taken_at' => $takenAt,
        ]);

        return back()->with('status', 'time-ticket.saved');
    }

    /**
     * Update the taken_at timestamp (only owner).
     */
    public function update(UpdateTimeTicketRequest $request, TimeTicket $timeTicket): RedirectResponse
    {
        $this->assertOwner($request, $timeTicket);

        $timeTicket->update([
            'taken_at' => $request->date('taken_at') ?? Carbon::now(),
        ]);

        return back()->with('status', 'time-ticket.updated');
    }

    /**
     * Display a ticket inline (only owner).
     */
    public function show(Request $request, TimeTicket $timeTicket)
    {
        $this->assertOwner($request, $timeTicket);

        if (!Storage::disk('public')->exists($timeTicket->path)) {
            abort(404);
        }

        return Storage::disk('public')->response(
            $timeTicket->path,
            $timeTicket->original_name ?? basename($timeTicket->path),
            [
                'Content-Disposition' => 'inline; filename="'.($timeTicket->original_name ?? basename($timeTicket->path)).'"',
            ]
        );
    }

    /**
     * Download a ticket file (only owner).
     */
    public function download(Request $request, TimeTicket $timeTicket)
    {
        $this->assertOwner($request, $timeTicket);

        if (!Storage::disk('public')->exists($timeTicket->path)) {
            abort(404);
        }

        $filename = $timeTicket->original_name ?? basename($timeTicket->path);

        return Storage::disk('public')->download($timeTicket->path, $filename);
    }

    protected function assertOwner(Request $request, TimeTicket $timeTicket): void
    {
        if ($request->user()->id !== $timeTicket->user_id) {
            throw new HttpResponseException(response()->json(['message' => 'Not Found.'], 404));
        }
    }
}
