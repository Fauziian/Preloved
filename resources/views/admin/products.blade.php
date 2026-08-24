@extends('layouts.admin')
@section('title', 'Manajemen Produk')
@section('page-title', 'Manajemen Produk')

@section('content')
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
    <div>
        <h1 style="font-size:1.5rem;font-weight:800;color:#1a0a2e;">Manajemen Produk</h1>
        <p style="font-size:.875rem;color:#9ca3af;margin-top:4px;">
            {{ $products->count() }} total · {{ $products->where('status','published')->count() }} aktif · {{ $products->where('status','draft')->count() }} draft
        </p>
    </div>
    <a href="{{ route('admin.products.add') }}" class="btn-primary">+ Tambah Produk</a>
</div>

<form method="GET" action="{{ route('admin.products') }}" style="margin-bottom:20px;display:flex;gap:10px;flex-wrap:wrap;">
    <div style="flex:1;min-width:220px;display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #fce7f3;border-radius:12px;padding:10px 14px;">
        <svg width="15" height="15" fill="none" stroke="#f472b6" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" name="search" value="{{ $search }}" placeholder="Cari nama, kategori, brand..." style="flex:1;border:none;outline:none;font-size:.875rem;font-family:inherit;background:transparent;" />
    </div>
    <button type="submit" class="btn-primary" style="padding:10px 20px;">Cari</button>
    @if($search)<a href="{{ route('admin.products') }}" class="btn-ghost">Reset</a>@endif
</form>

<div class="card" style="overflow:hidden;">
    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th style="width:52px;">Foto</th>
                    <th>Produk</th>
                    <th>Harga</th>
                    <th>Status</th>
                    <th style="width:120px;">Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($products as $p)
                <tr>
                    <td>
                        <div style="width:44px;height:44px;border-radius:10px;overflow:hidden;background:#fdf2f8;flex-shrink:0;">
                            @if($p->photos && count($p->photos) > 0)
                            <img src="{{ $p->photos[0] }}" alt="{{ $p->name }}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" />
                            @else
                            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">📦</div>
                            @endif
                        </div>
                    </td>
                    <td>
                        <p style="font-size:.875rem;font-weight:600;color:#1a0a2e;">{{ $p->name }}</p>
                        <p style="font-size:.75rem;color:#9ca3af;margin-top:2px;">{{ $p->category }} · {{ $p->brand }} · {{ $p->condition }}</p>
                        @if($p->shopee_link)<p style="font-size:.7rem;color:#15803d;margin-top:2px;">✓ Link Shopee</p>@endif
                    </td>
                    <td>
                        <p style="font-size:.875rem;font-weight:700;color:#ec4899;">Rp {{ number_format($p->price, 0, ',', '.') }}</p>
                        @if($p->original_price > $p->price)<p style="font-size:.7rem;color:#9ca3af;text-decoration:line-through;">Rp {{ number_format($p->original_price, 0, ',', '.') }}</p>@endif
                    </td>
                    <td>
                        <form method="POST" action="{{ route('admin.products.toggle', $p->id) }}" style="display:inline;">
                            @csrf @method('PATCH')
                            <button type="submit" class="{{ $p->status === 'published' ? 'badge-green' : ($p->status === 'draft' ? 'badge-amber' : 'badge-gray') }}" style="cursor:pointer;border:none;" title="Klik untuk toggle status">
                                {{ $p->status === 'published' ? '✓ Aktif' : ($p->status === 'draft' ? '○ Draft' : '✕ Habis') }}
                            </button>
                        </form>
                    </td>
                    <td>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <a href="{{ route('admin.products.edit', $p->id) }}" style="width:32px;height:32px;border-radius:8px;background:#ede9fe;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:.85rem;" title="Edit">✏️</a>
                            <form method="POST" action="{{ route('admin.products.destroy', $p->id) }}" onsubmit="return confirm('Hapus produk {{ addslashes($p->name) }}?')">
                                @csrf @method('DELETE')
                                <button type="submit" style="width:32px;height:32px;border-radius:8px;background:#fee2e2;border:none;cursor:pointer;font-size:.85rem;" title="Hapus">🗑</button>
                            </form>
                        </div>
                    </td>
                </tr>
                @empty
                <tr><td colspan="5" style="text-align:center;padding:48px;color:#d1d5db;font-size:.9rem;">
                    📦 Belum ada produk. <a href="{{ route('admin.products.add') }}" style="color:#ec4899;">Tambah sekarang</a>
                </td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
