<?php

namespace App\Http\Controllers;

use App\Actions\Dashboard\BuildDashboardPayloadAction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, BuildDashboardPayloadAction $buildDashboardPayload): Response
    {
        $payload = $buildDashboardPayload->handle(
            $request->user(),
            $request->query('start_date'),
            $request->query('end_date')
        );

        return Inertia::render('dashboard', $payload);
    }
}
