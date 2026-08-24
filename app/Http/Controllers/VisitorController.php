<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use Illuminate\Http\Request;

class VisitorController extends Controller
{
    public function reset()
    {
        $blank = [
            'totalVisits'    => 0,
            'totalPageViews' => 0,
            'daily'          => [],
            'productViews'   => [],
            'referrers'      => [],
            'devices'        => [],
        ];
        Visitor::updateOrCreate(['id' => 'global'], ['data' => $blank]);
        return redirect()->route('admin.visitors')->with('success', 'Data pengunjung berhasil direset.');
    }
}
