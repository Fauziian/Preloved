<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'          => 'required|string|max:255',
            'price'         => 'required|integer|min:0',
            'original_price'=> 'nullable|integer|min:0',
            'description'   => 'required|string',
            'condition'     => 'required|string',
            'brand'         => 'required|string|max:255',
            'category'      => 'required|string',
            'stock'         => 'required|integer|min:0',
            'weight'        => 'required|string|max:100',
            'material'      => 'required|string|max:255',
            'status'        => 'required|in:published,draft,sold-out',
            'shopee_link'   => 'nullable|string',
            'tags'          => 'nullable|string',
            'photos'        => 'nullable|array',
            'photos.*'      => 'nullable|string',
            'variants'      => 'nullable|string',
        ]);

        $product = Product::create([
            'id'             => (string) Str::uuid(),
            'name'           => $data['name'],
            'price'          => $data['price'],
            'original_price' => $data['original_price'] ?? $data['price'],
            'description'    => $data['description'],
            'condition'      => $data['condition'],
            'brand'          => $data['brand'],
            'category'       => $data['category'],
            'stock'          => $data['stock'],
            'weight'         => $data['weight'],
            'material'       => $data['material'],
            'status'         => $data['status'],
            'shopee_link'    => $data['shopee_link'] ?? null,
            'tags'           => $data['tags'] ? array_filter(array_map('trim', explode(',', $data['tags']))) : [],
            'photos'         => $data['photos'] ?? [],
            'variants'       => $data['variants'] ? json_decode($data['variants'], true) : [],
        ]);

        return redirect()->route('admin.products')->with('success', "Produk \"{$product->name}\" berhasil ditambahkan!");
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'price'          => 'required|integer|min:0',
            'original_price' => 'nullable|integer|min:0',
            'description'    => 'required|string',
            'condition'      => 'required|string',
            'brand'          => 'required|string|max:255',
            'category'       => 'required|string',
            'stock'          => 'required|integer|min:0',
            'weight'         => 'required|string|max:100',
            'material'       => 'required|string|max:255',
            'status'         => 'required|in:published,draft,sold-out',
            'shopee_link'    => 'nullable|string',
            'tags'           => 'nullable|string',
            'photos'         => 'nullable|array',
            'photos.*'       => 'nullable|string',
            'variants'       => 'nullable|string',
        ]);

        $product->update([
            'name'           => $data['name'],
            'price'          => $data['price'],
            'original_price' => $data['original_price'] ?? $data['price'],
            'description'    => $data['description'],
            'condition'      => $data['condition'],
            'brand'          => $data['brand'],
            'category'       => $data['category'],
            'stock'          => $data['stock'],
            'weight'         => $data['weight'],
            'material'       => $data['material'],
            'status'         => $data['status'],
            'shopee_link'    => $data['shopee_link'] ?? null,
            'tags'           => $data['tags'] ? array_filter(array_map('trim', explode(',', $data['tags']))) : [],
            'photos'         => $data['photos'] ?? ($product->photos ?? []),
            'variants'       => $data['variants'] ? json_decode($data['variants'], true) : [],
        ]);

        return redirect()->route('admin.products')->with('success', "Produk \"{$product->name}\" berhasil diperbarui!");
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $name    = $product->name;
        $product->delete();
        return redirect()->route('admin.products')->with('success', "Produk \"{$name}\" berhasil dihapus.");
    }

    public function toggle($id)
    {
        $product = Product::findOrFail($id);
        if ($product->status === 'published') {
            $product->update(['status' => 'draft']);
            $msg = "Produk \"{$product->name}\" disembunyikan (draft).";
        } elseif ($product->status === 'draft') {
            $product->update(['status' => 'published', 'stock' => max($product->stock, 1)]);
            $msg = "Produk \"{$product->name}\" diaktifkan.";
        } else {
            $product->update(['status' => 'published', 'stock' => 1]);
            $msg = "Produk \"{$product->name}\" diaktifkan kembali.";
        }
        return redirect()->route('admin.products')->with('success', $msg);
    }
}
