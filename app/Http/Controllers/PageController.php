<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function catalog(Request $request)
    {
        $query = Product::whereIn('status', ['published', 'sold-out'])
            ->orderBy('created_at', 'desc');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        if (($cat = $request->get('category')) && $cat !== 'Semua') {
            $query->where('category', $cat);
        }

        if ($cond = $request->get('condition')) {
            $query->where('condition', $cond);
        }

        // Paginate and map to array (keeping pagination metadata)
        $paginated = $query->paginate(12)->withQueryString();
        $products  = $paginated->through(fn($p) => $this->formatProduct($p));

        return view('catalog', compact('products'));
    }

    public function detail($id)
    {
        $product = Product::findOrFail($id);
        $related = Product::whereIn('status', ['published', 'sold-out'])
            ->where('category', $product->category)
            ->where('id', '!=', $id)
            ->limit(4)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));

        return view('detail', [
            'product' => $this->formatProduct($product),
            'related' => $related,
        ]);
    }

    public function about()
    {
        return view('about');
    }

    private function formatProduct($p): array
    {
        return [
            'id'            => $p->id,
            'name'          => $p->name,
            'price'         => $p->price,
            'originalPrice' => $p->original_price,
            'description'   => $p->description,
            'condition'     => $p->condition,
            'brand'         => $p->brand,
            'category'      => $p->category,
            'stock'         => $p->stock,
            'weight'        => $p->weight,
            'material'      => $p->material,
            'tags'          => $p->tags ?? [],
            'status'        => $p->status,
            'shopeeLink'    => $p->shopee_link,
            'photos'        => $p->photos ?? [],
            'variants'      => $p->variants ?? [],
            'createdAt'     => $p->created_at?->toDateString() ?? now()->toDateString(),
            'discount'      => $p->original_price > $p->price
                ? round((($p->original_price - $p->price) / $p->original_price) * 100)
                : 0,
            'isSoldOut'     => $p->status === 'sold-out' || $p->stock === 0,
        ];
    }
}
