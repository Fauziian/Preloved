<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Visitor;
use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class AdminController extends Controller
{
    private const ADMIN_USER = 'admin';
    private const ADMIN_PASS = 'sherly2004';

    // ── Auth ──────────────────────────────────────────────────────────────────
    public function loginForm()
    {
        if (Session::get('admin_logged_in')) {
            return redirect()->route('admin.dashboard');
        }
        return view('admin.login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($request->username === self::ADMIN_USER && $request->password === self::ADMIN_PASS) {
            Session::put('admin_logged_in', true);
            return redirect()->route('admin.dashboard')->with('success', 'Selamat datang kembali, Admin Sherly!');
        }

        return back()->withErrors(['login' => 'Username atau password salah.'])->withInput();
    }

    public function logout()
    {
        Session::forget('admin_logged_in');
        return redirect()->route('admin.login');
    }

    // ── Dashboard ─────────────────────────────────────────────────────────────
    public function dashboard()
    {
        $products  = Product::all();
        $visitorRec = Visitor::find('global');
        $vd = $visitorRec ? ($visitorRec->data ?? []) : [];

        $stats = [
            'totalVisits'     => $vd['totalVisits']    ?? 0,
            'totalPageViews'  => $vd['totalPageViews'] ?? 0,
            'published'       => $products->where('status', 'published')->count(),
            'draft'           => $products->where('status', 'draft')->count(),
            'soldOut'         => $products->where('stock', 0)->count(),
            'total'           => $products->count(),
        ];

        // Chart: last 7 days
        $daily = collect($vd['daily'] ?? []);
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $day  = $daily->firstWhere('date', $date);
            $chartData[] = [
                'date'      => $date,
                'label'     => now()->subDays($i)->locale('id')->isoFormat('ddd'),
                'visits'    => $day['visits']    ?? 0,
                'pageViews' => $day['pageViews'] ?? 0,
            ];
        }

        // Top viewed products
        $productViews = $vd['productViews'] ?? [];
        arsort($productViews);
        $topViewed = array_slice($productViews, 0, 5, true);

        $recentProducts = $products->sortByDesc('created_at')->take(5);

        $unreadChats = Chat::where('unread_by_admin', '>', 0)->count();

        return view('admin.dashboard', compact(
            'stats', 'chartData', 'topViewed', 'recentProducts', 'products', 'unreadChats'
        ));
    }

    // ── Products ──────────────────────────────────────────────────────────────
    public function products(Request $request)
    {
        $query   = Product::query();
        $search  = $request->get('search', '');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }
        $products    = $query->orderBy('created_at', 'desc')->get();
        $unreadChats = Chat::where('unread_by_admin', '>', 0)->count();

        return view('admin.products', compact('products', 'search', 'unreadChats'));
    }

    public function addProduct()
    {
        $unreadChats = Chat::where('unread_by_admin', '>', 0)->count();
        return view('admin.product-form', ['product' => null, 'unreadChats' => $unreadChats]);
    }

    public function editProduct($id)
    {
        $product     = Product::findOrFail($id);
        $unreadChats = Chat::where('unread_by_admin', '>', 0)->count();
        return view('admin.product-form', compact('product', 'unreadChats'));
    }

    // ── Visitors ──────────────────────────────────────────────────────────────
    public function visitors()
    {
        $visitorRec = Visitor::find('global');
        $vd = $visitorRec ? ($visitorRec->data ?? []) : [
            'totalVisits'    => 0,
            'totalPageViews' => 0,
            'daily'          => [],
            'productViews'   => [],
            'referrers'      => [],
            'devices'        => [],
        ];

        $daily = collect($vd['daily'] ?? []);
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $day  = $daily->firstWhere('date', $date);
            $chartData[] = [
                'date'      => $date,
                'label'     => now()->subDays($i)->locale('id')->isoFormat('ddd D MMM'),
                'visits'    => $day['visits']    ?? 0,
                'pageViews' => $day['pageViews'] ?? 0,
            ];
        }

        $productViews = $vd['productViews'] ?? [];
        arsort($productViews);
        $topViewed = array_slice($productViews, 0, 5, true);

        $allProducts = Product::all()->keyBy('id');
        $unreadChats = Chat::where('unread_by_admin', '>', 0)->count();

        return view('admin.visitors', compact('vd', 'chartData', 'topViewed', 'allProducts', 'unreadChats'));
    }

    // ── Chat ──────────────────────────────────────────────────────────────────
    public function chat()
    {
        $sessions = Chat::orderBy('last_activity', 'desc')->get();
        $unreadChats = Chat::where('unread_by_admin', '>', 0)->count();
        return view('admin.chat', compact('sessions', 'unreadChats'));
    }
}
