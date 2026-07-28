<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use Illuminate\Http\Request;

class VisitorController extends Controller
{
    public function index()
    {
        $visitor = Visitor::find('global');
        if (!$visitor) {
            return response()->json([
                'totalVisits' => 0,
                'totalPageViews' => 0,
                'daily' => [],
                'productViews' => new \stdClass(),
                'referrers' => new \stdClass(),
                'devices' => new \stdClass(),
            ]);
        }
        return response()->json($visitor->data);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'totalVisits' => 'required|integer',
            'totalPageViews' => 'required|integer',
            'daily' => 'nullable|array',
            'productViews' => 'nullable|array',
            'referrers' => 'nullable|array',
            'devices' => 'nullable|array',
        ]);

        $visitor = Visitor::updateOrCreate(
            ['id' => 'global'],
            ['data' => $data]
        );

        return response()->json([
            'status' => 'success',
            'data' => $visitor->data
        ]);
    }
}
