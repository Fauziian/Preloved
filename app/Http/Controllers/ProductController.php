<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id' => 'required|string',
            'name' => 'required|string',
            'price' => 'required|integer',
            'originalPrice' => 'required|integer', // maps from camelCase in React
            'description' => 'nullable|string',
            'condition' => 'required|string',
            'brand' => 'nullable|string',
            'category' => 'required|string',
            'stock' => 'required|integer',
            'weight' => 'nullable|string',
            'material' => 'nullable|string',
            'tags' => 'nullable|array',
            'status' => 'required|string',
            'shopeeLink' => 'nullable|string', // maps from camelCase in React
            'photos' => 'nullable|array',
            'variants' => 'nullable|array',
        ]);

        // Map camelCase to snake_case for DB fields
        $dbData = [
            'id' => $data['id'],
            'name' => $data['name'],
            'price' => $data['price'],
            'original_price' => $data['originalPrice'],
            'description' => $data['description'] ?? null,
            'condition' => $data['condition'],
            'brand' => $data['brand'] ?? null,
            'category' => $data['category'],
            'stock' => $data['stock'],
            'weight' => $data['weight'] ?? null,
            'material' => $data['material'] ?? null,
            'tags' => $data['tags'] ?? [],
            'status' => $data['status'],
            'shopee_link' => $data['shopeeLink'] ?? null,
            'photos' => $data['photos'] ?? [],
            'variants' => $data['variants'] ?? [],
        ];

        $product = Product::updateOrCreate(
            ['id' => $dbData['id']],
            $dbData
        );

        return response()->json([
            'status' => 'success',
            'product' => $product
        ]);
    }

    public function destroy($id)
    {
        $product = Product::find($id);
        if ($product) {
            $product->delete();
        }
        return response()->json(['status' => 'success']);
    }
}
