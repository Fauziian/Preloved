<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use Illuminate\Http\Request;

class ApiVisitorController extends Controller
{
    public function track(Request $request)
    {
        $request->validate([
            'device'   => 'nullable|string|in:Desktop,Mobile,Tablet',
            'referrer' => 'nullable|string|max:100',
            'is_new_session' => 'nullable|boolean',
            'product_id'     => 'nullable|string',
        ]);

        $visitor = Visitor::firstOrCreate(['id' => 'global'], [
            'data' => [
                'totalVisits'    => 0,
                'totalPageViews' => 0,
                'daily'          => [],
                'productViews'   => [],
                'referrers'      => [],
                'devices'        => [],
            ]
        ]);

        $data = $visitor->data ?? [
            'totalVisits'    => 0,
            'totalPageViews' => 0,
            'daily'          => [],
            'productViews'   => [],
            'referrers'      => [],
            'devices'        => [],
        ];

        // New session (unique visit)
        if ($request->boolean('is_new_session')) {
            $data['totalVisits'] = ($data['totalVisits'] ?? 0) + 1;

            $device = $request->input('device', 'Desktop');
            $data['devices'] = $data['devices'] ?? [];
            $data['devices'][$device] = ($data['devices'][$device] ?? 0) + 1;

            $ref = $request->input('referrer', 'Direct');
            $data['referrers'] = $data['referrers'] ?? [];
            $data['referrers'][$ref] = ($data['referrers'][$ref] ?? 0) + 1;
        }

        // Always count page view
        $data['totalPageViews'] = ($data['totalPageViews'] ?? 0) + 1;

        // Daily
        $today = now()->toDateString();
        $data['daily'] = $data['daily'] ?? [];
        $found = false;
        foreach ($data['daily'] as &$day) {
            if ($day['date'] === $today) {
                if ($request->boolean('is_new_session')) {
                    $day['visits'] = ($day['visits'] ?? 0) + 1;
                }
                $day['pageViews'] = ($day['pageViews'] ?? 0) + 1;
                $found = true;
                break;
            }
        }
        unset($day);
        if (!$found) {
            $data['daily'][] = [
                'date'      => $today,
                'visits'    => $request->boolean('is_new_session') ? 1 : 0,
                'pageViews' => 1,
            ];
        }
        // Keep last 30 days
        if (count($data['daily']) > 30) {
            $data['daily'] = array_slice($data['daily'], -30);
        }

        // Product view
        if ($pid = $request->input('product_id')) {
            $data['productViews'] = $data['productViews'] ?? [];
            $data['productViews'][$pid] = ($data['productViews'][$pid] ?? 0) + 1;
        }

        $visitor->update(['data' => $data]);

        return response()->json(['status' => 'ok']);
    }
}
