@extends('layouts.admin')
@section('title', $product ? 'Edit Produk' : 'Tambah Produk')
@section('page-title', $product ? 'Edit Produk' : 'Tambah Produk Baru')

@section('content')
<div style="display:flex;align-items:center;gap:12px;margin-bottom:28px;">
    <a href="{{ route('admin.products') }}" style="width:32px;height:32px;border-radius:10px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:.9rem;">←</a>
    <h1 style="font-size:1.5rem;font-weight:800;color:#1a0a2e;">{{ $product ? 'Edit: '.Str::limit($product->name,40) : 'Tambah Produk Baru' }}</h1>
</div>

@if($errors->any())
<div class="alert-error">❌ Terdapat {{ $errors->count() }} kesalahan:<ul style="margin-top:6px;padding-left:20px;">@foreach($errors->all() as $e)<li>{{ $e }}</li>@endforeach</ul></div>
@endif

<form method="POST"
      action="{{ $product ? route('admin.products.update', $product->id) : route('admin.products.store') }}"
      enctype="multipart/form-data"
      id="product-form">
    @csrf
    @if($product) @method('PUT') @endif

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;">

        {{-- Left column --}}
        <div style="display:flex;flex-direction:column;gap:16px;">
            {{-- Photos --}}
            <div class="card" style="padding:20px;">
                <h2 style="font-size:.9rem;font-weight:700;color:#1a0a2e;margin-bottom:14px;">📷 Foto Produk *</h2>
                <div id="photo-preview" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
                    @if($product && $product->photos)
                    @foreach($product->photos as $i => $ph)
                    <div class="photo-item" style="position:relative;width:80px;height:80px;border-radius:12px;overflow:hidden;border:2px solid #fce7f3;">
                        <img src="{{ $ph }}" alt="" style="width:100%;height:100%;object-fit:cover;" />
                        @if($i === 0)<span style="position:absolute;bottom:2px;left:2px;font-size:.55rem;background:rgba(0,0,0,.6);color:#fff;padding:2px 4px;border-radius:4px;">Cover</span>@endif
                        <input type="hidden" name="photos[]" value="{{ $ph }}" />
                    </div>
                    @endforeach
                    @endif
                </div>
                <div id="new-photos-preview" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px;"></div>
                <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;background:#fdf2f8;border:2px dashed #fbcfe8;border-radius:12px;padding:12px 20px;font-size:.8125rem;font-weight:600;color:#ec4899;transition:all .15s;" onmouseenter="this.style.background='#fce7f3'" onmouseleave="this.style.background='#fdf2f8'">
                    📤 Upload Foto
                    <input type="file" accept="image/*" multiple id="photo-upload" style="display:none;" onchange="handlePhotos(this)" />
                </label>
                <p style="font-size:.7rem;color:#9ca3af;margin-top:8px;">Foto pertama = cover. Upload minimal 1. Foto akan dikompresi otomatis.</p>
            </div>

            {{-- Status --}}
            <div class="card" style="padding:20px;">
                <h2 style="font-size:.9rem;font-weight:700;color:#1a0a2e;margin-bottom:14px;">Status Produk</h2>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    @foreach([['published','✓ Aktif — Tampil di Katalog','#dcfce7','#15803d'],['draft','○ Draft — Tersembunyi','#fef3c7','#92400e'],['sold-out','✕ Sold Out / Habis','#f3f4f6','#374151']] as $s)
                    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                        <input type="radio" name="status" value="{{ $s[0] }}" {{ ($product ? $product->status : 'published') === $s[0] ? 'checked' : '' }} style="accent-color:#ec4899;" />
                        <span style="font-size:.8125rem;font-weight:700;padding:6px 14px;border-radius:10px;background:{{ $s[2] }};color:{{ $s[3] }};">{{ $s[1] }}</span>
                    </label>
                    @endforeach
                </div>
            </div>

            {{-- Variants --}}
            <div class="card" style="padding:20px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
                    <h2 style="font-size:.9rem;font-weight:700;color:#1a0a2e;">🏷 Variasi Produk</h2>
                    <button type="button" onclick="addVariant()" style="font-size:.75rem;font-weight:700;color:#ec4899;background:#fdf2f8;border:none;padding:6px 12px;border-radius:8px;cursor:pointer;">+ Tambah Variasi</button>
                </div>
                <div id="variants-container">
                    @if($product && $product->variants)
                    @foreach($product->variants as $v)
                    <div class="variant-row" style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
                        <input type="text" name="variant_name[]" value="{{ $v['name'] }}" placeholder="Nama (Ukuran)" class="form-inp" style="flex:1;" />
                        <input type="text" name="variant_options[]" value="{{ implode(', ', $v['options']) }}" placeholder="Opsi: S, M, L" class="form-inp" style="flex:1;" />
                        <button type="button" onclick="this.closest('.variant-row').remove()" style="width:32px;height:32px;background:#fee2e2;border:none;border-radius:8px;cursor:pointer;flex-shrink:0;">✕</button>
                    </div>
                    @endforeach
                    @endif
                </div>
                <p style="font-size:.7rem;color:#9ca3af;margin-top:4px;">Contoh: Nama=Ukuran, Opsi=S, M, L</p>
            </div>

            {{-- Tags --}}
            <div class="card" style="padding:20px;">
                <h2 style="font-size:.9rem;font-weight:700;color:#1a0a2e;margin-bottom:12px;"># Tag Produk</h2>
                <input type="text" name="tags" value="{{ $product ? implode(', ', $product->tags ?? []) : '' }}" placeholder="sweater, pink, rajut (pisah dengan koma)" class="form-inp" />
                <p style="font-size:.7rem;color:#9ca3af;margin-top:4px;">Pisahkan tag dengan koma</p>
            </div>
        </div>

        {{-- Right column --}}
        <div style="display:flex;flex-direction:column;gap:16px;">
            <div class="card" style="padding:20px;">
                <h2 style="font-size:.9rem;font-weight:700;color:#1a0a2e;margin-bottom:16px;">ℹ️ Informasi Produk</h2>
                <div style="display:flex;flex-direction:column;gap:14px;">
                    <div>
                        <label style="display:block;font-size:.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;">Nama Produk *</label>
                        <input type="text" name="name" value="{{ old('name', $product?->name) }}" required placeholder="Cth: Sweater Rajut Pink Oversize" class="form-inp" />
                        @error('name')<p style="color:#ef4444;font-size:.7rem;margin-top:3px;">{{ $message }}</p>@enderror
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        <div>
                            <label style="display:block;font-size:.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:5px;">Harga Jual *</label>
                            <input type="number" name="price" value="{{ old('price', $product?->price) }}" required min="0" placeholder="85000" class="form-inp" />
                        </div>
                        <div>
                            <label style="display:block;font-size:.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:5px;">Harga Coret</label>
                            <input type="number" name="original_price" value="{{ old('original_price', $product?->original_price) }}" min="0" placeholder="320000" class="form-inp" />
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        <div>
                            <label style="display:block;font-size:.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:5px;">Kondisi *</label>
                            <select name="condition" class="form-inp">
                                @foreach(['Baru','Bekas','Baik','Sangat Baik'] as $c)
                                <option {{ old('condition',$product?->condition)===$c?'selected':'' }}>{{ $c }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div>
                            <label style="display:block;font-size:.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:5px;">Kategori *</label>
                            <select name="category" class="form-inp">
                                @foreach(['Fashion Wanita','Fashion Pria','Tas','Sepatu','Aksesoris','Elektronik','Koleksi','Beauty','Rumah Tangga','Lainnya'] as $c)
                                <option {{ old('category',$product?->category)===$c?'selected':'' }}>{{ $c }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
                        <div>
                            <label style="display:block;font-size:.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:5px;">Brand *</label>
                            <input type="text" name="brand" value="{{ old('brand',$product?->brand) }}" required placeholder="Zara, H&M..." class="form-inp" />
                        </div>
                        <div>
                            <label style="display:block;font-size:.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:5px;">Stok *</label>
                            <input type="number" name="stock" value="{{ old('stock',$product?->stock ?? 1) }}" required min="0" class="form-inp" />
                        </div>
                        <div>
                            <label style="display:block;font-size:.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:5px;">Berat *</label>
                            <input type="text" name="weight" value="{{ old('weight',$product?->weight) }}" required placeholder="300g" class="form-inp" />
                        </div>
                    </div>
                    <div>
                        <label style="display:block;font-size:.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:5px;">Material *</label>
                        <input type="text" name="material" value="{{ old('material',$product?->material) }}" required placeholder="Cotton, Chiffon, Rajut..." class="form-inp" />
                    </div>
                    <div>
                        <label style="display:block;font-size:.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:5px;">Deskripsi *</label>
                        <textarea name="description" required rows="4" placeholder="Deskripsikan produk secara lengkap dan jujur..." class="form-inp">{{ old('description',$product?->description) }}</textarea>
                    </div>
                    <div>
                        <label style="display:block;font-size:.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:5px;">Link Shopee</label>
                        <input type="text" name="shopee_link" value="{{ old('shopee_link',$product?->shopee_link) }}" placeholder="https://shopee.co.id/..." class="form-inp" />
                        <p style="font-size:.7rem;color:#9ca3af;margin-top:3px;">Tombol 'Beli di Shopee' hanya muncul jika link diisi</p>
                    </div>
                </div>
            </div>

            {{-- Submit --}}
            <div class="card" style="padding:16px;display:flex;gap:10px;justify-content:flex-end;align-items:center;flex-wrap:wrap;">
                <a href="{{ route('admin.products') }}" class="btn-ghost">Batal</a>
                <button type="submit" class="btn-primary" id="submit-btn">
                    {{ $product ? '💾 Simpan Perubahan' : '✚ Simpan Produk' }}
                </button>
            </div>
        </div>
    </div>

    {{-- Hidden field for variants JSON --}}
    <input type="hidden" name="variants" id="variants-json" />
</form>

@push('scripts')
<script>
var newPhotosBase64 = [];

function addVariant() {
    var c = document.getElementById('variants-container');
    var row = document.createElement('div');
    row.className = 'variant-row';
    row.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:8px;';
    row.innerHTML = '<input type="text" name="variant_name[]" placeholder="Nama (Ukuran)" class="form-inp" style="flex:1;"><input type="text" name="variant_options[]" placeholder="Opsi: S, M, L" class="form-inp" style="flex:1;"><button type="button" onclick="this.closest(\'.variant-row\').remove()" style="width:32px;height:32px;background:#fee2e2;border:none;border-radius:8px;cursor:pointer;flex-shrink:0;">✕</button>';
    c.appendChild(row);
}

function handlePhotos(input) {
    var files = Array.from(input.files);
    if (!files.length) return;
    files.forEach(function(file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            // Compress
            var img = new Image();
            img.onload = function() {
                var canvas = document.createElement('canvas');
                var maxW = 800, maxH = 800;
                var w = img.width, h = img.height;
                if (w > h) { if (w > maxW) { h = Math.round(h*maxW/w); w = maxW; } }
                else { if (h > maxH) { w = Math.round(w*maxH/h); h = maxH; } }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                var b64 = canvas.toDataURL('image/jpeg', 0.75);
                newPhotosBase64.push(b64);
                // Preview
                var prev = document.getElementById('new-photos-preview');
                var wrap = document.createElement('div');
                wrap.style.cssText = 'position:relative;width:80px;height:80px;border-radius:12px;overflow:hidden;border:2px solid #fce7f3;';
                var im = document.createElement('img');
                im.src = b64; im.style.cssText = 'width:100%;height:100%;object-fit:cover;';
                var inp = document.createElement('input');
                inp.type = 'hidden'; inp.name = 'photos[]'; inp.value = b64;
                var rm = document.createElement('button');
                rm.type = 'button'; rm.textContent = '✕';
                rm.style.cssText = 'position:absolute;top:2px;right:2px;width:18px;height:18px;background:rgba(239,68,68,.9);color:#fff;border:none;border-radius:50%;cursor:pointer;font-size:.6rem;line-height:1;';
                rm.onclick = function() { wrap.remove(); var idx = newPhotosBase64.indexOf(b64); if(idx>-1) newPhotosBase64.splice(idx,1); };
                wrap.appendChild(im); wrap.appendChild(inp); wrap.appendChild(rm);
                prev.appendChild(wrap);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
    input.value = '';
}

document.getElementById('product-form').addEventListener('submit', function() {
    // Build variants JSON
    var names = document.getElementsByName('variant_name[]');
    var opts  = document.getElementsByName('variant_options[]');
    var variants = [];
    for (var i = 0; i < names.length; i++) {
        if (names[i].value.trim()) {
            variants.push({name: names[i].value.trim(), options: opts[i].value.split(',').map(s=>s.trim()).filter(Boolean)});
        }
    }
    document.getElementById('variants-json').value = JSON.stringify(variants);

    var btn = document.getElementById('submit-btn');
    btn.textContent = 'Menyimpan...';
    btn.disabled = true;
});
</script>
@endpush

@endsection
