@extends('layouts.app')
@section('title', $product['name'] . ' – SherlyPreloved')
@section('description', Str::limit($product['description'], 160))

@push('head')
<meta property="og:title" content="{{ $product['name'] }} – SherlyPreloved" />
<meta property="og:description" content="{{ Str::limit($product['description'], 160) }}" />
@if($product['photos'][0] ?? null)
<meta property="og:image" content="{{ $product['photos'][0] }}" />
@endif
@endpush

@section('body')
@include('partials.navbar')

<div class="container" style="padding:40px 20px 60px;">
    <a href="{{ route('catalog') }}" style="display:inline-flex;align-items:center;gap:6px;font-size:.875rem;color:#6b7280;text-decoration:none;font-weight:600;margin-bottom:32px;transition:color .15s;" onmouseenter="this.style.color='#ec4899'" onmouseleave="this.style.color='#6b7280'">
        ← Kembali ke Katalog
    </a>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;">
        {{-- Photo Gallery --}}
        <div>
            <div id="main-photo" style="position:relative;border-radius:28px;overflow:hidden;aspect-ratio:1;background:linear-gradient(145deg,#f1f9f4,#fff7fb);">
                @php $photos = $product['photos']; $photo = $photos[0] ?? null; @endphp
                @if($photo)
                <img src="{{ $photo }}" alt="{{ $product['name'] }}" id="main-img" style="width:100%;height:100%;object-fit:cover;{{ $product['isSoldOut'] ? 'filter:grayscale(1);' : '' }}" />
                @else
                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;">📦</div>
                @endif
                @if($product['isSoldOut'])
                <div class="sold-out-overlay" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.38);">
                    <span class="sold-out-text" style="font-size:clamp(24px,5vw,48px);">Sold Out</span>
                </div>
                @elseif($product['discount'] > 0)
                <div style="position:absolute;top:16px;left:16px;background:linear-gradient(135deg,#ec4899,#f43f5e);color:#fff;font-size:.8125rem;font-weight:700;padding:6px 14px;border-radius:999px;box-shadow:0 2px 8px rgba(236,72,153,.4);">HEMAT {{ $product['discount'] }}%</div>
                @endif
            </div>
            @if(count($photos) > 1)
            <div style="display:flex;gap:10px;margin-top:14px;overflow-x:auto;padding-bottom:4px;">
                @foreach($photos as $i => $ph)
                <button onclick="document.getElementById('main-img').src='{{ $ph }}';document.querySelectorAll('.thumb-btn').forEach(b=>b.style.borderColor='transparent');this.style.borderColor='#ec4899';"
                    class="thumb-btn" style="flex-shrink:0;width:72px;height:72px;border-radius:14px;overflow:hidden;border:2px solid {{ $i===0 ? '#ec4899' : 'transparent' }};background:none;cursor:pointer;padding:0;transition:border-color .15s;">
                    <img src="{{ $ph }}" alt="" style="width:100%;height:100%;object-fit:cover;{{ $product['isSoldOut'] ? 'filter:grayscale(1);' : '' }}" />
                </button>
                @endforeach
            </div>
            @endif
        </div>

        {{-- Info --}}
        <div style="padding-top:4px;">
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
                <span class="badge-pink">{{ $product['category'] }}</span>
                @if($product['brand'])<span class="badge-pink">{{ $product['brand'] }}</span>@endif
                <span class="{{ in_array($product['condition'],['Sangat Baik','Baru']) ? 'badge-green' : 'badge-gray' }}">{{ $product['condition'] }}</span>
                @if($product['isSoldOut'])<span class="badge-gray" style="background:#1f2937;color:#fff;">Sold Out</span>@endif
            </div>

            <h1 style="font-size:1.6rem;font-weight:800;color:#1a0a2e;line-height:1.25;margin-bottom:16px;">{{ $product['name'] }}</h1>

            <div style="margin-bottom:20px;">
                <p style="font-size:2rem;font-weight:800;color:{{ $product['isSoldOut'] ? '#9ca3af' : '#ec4899' }};{{ $product['isSoldOut'] ? 'text-decoration:line-through;' : '' }}">
                    Rp {{ number_format($product['price'], 0, ',', '.') }}
                </p>
                @if(!$product['isSoldOut'] && $product['originalPrice'] > $product['price'])
                <p style="font-size:.9rem;color:#9ca3af;text-decoration:line-through;margin-top:2px;">Rp {{ number_format($product['originalPrice'], 0, ',', '.') }}</p>
                @endif
            </div>

            {{-- Variants --}}
            @foreach($product['variants'] as $v)
            <div style="margin-bottom:16px;">
                <p style="font-size:.875rem;font-weight:700;color:#1a0a2e;margin-bottom:8px;">{{ $v['name'] }}</p>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    @foreach($v['options'] as $opt)
                    <button style="padding:8px 18px;border-radius:12px;font-size:.875rem;font-weight:600;border:2px solid #fce7f3;color:#6b7280;background:#fff;cursor:pointer;transition:all .15s;"
                        onmouseenter="this.style.borderColor='#f472b6';this.style.color='#be185d';"
                        onmouseleave="this.style.borderColor='#fce7f3';this.style.color='#6b7280';">{{ $opt }}</button>
                    @endforeach
                </div>
            </div>
            @endforeach

            {{-- Info grid --}}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:20px 0;border-top:1px solid #fce7f3;border-bottom:1px solid #fce7f3;margin-bottom:20px;">
                @foreach([['Kondisi',$product['condition']],['Stok',$product['stock']>0?$product['stock'].' pcs':'Habis'],['Berat',$product['weight']??'-'],['Material',$product['material']??'-']] as $row)
                <div>
                    <p style="font-size:.75rem;color:#9ca3af;font-weight:500;margin-bottom:2px;">{{ $row[0] }}</p>
                    <p style="font-size:.875rem;font-weight:700;color:#1a0a2e;">{{ $row[1] }}</p>
                </div>
                @endforeach
            </div>

            @if($product['description'])
            <div style="margin-bottom:20px;">
                <p style="font-size:.875rem;font-weight:700;color:#1a0a2e;margin-bottom:8px;">Deskripsi</p>
                <p style="font-size:.875rem;color:#4b5563;line-height:1.75;white-space:pre-wrap;">{{ $product['description'] }}</p>
            </div>
            @endif

            @if(count($product['tags']) > 0)
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px;">
                @foreach($product['tags'] as $tag)<span style="font-size:.75rem;color:#6b7280;background:#f3f4f6;padding:4px 10px;border-radius:999px;">#{{ $tag }}</span>@endforeach
            </div>
            @endif

            {{-- CTA --}}
            @if($product['isSoldOut'])
            <div style="text-align:center;padding:20px;background:#f9fafb;border-radius:16px;">
                <p style="font-size:1.1rem;font-weight:800;color:#6b7280;font-style:italic;">Sold Out</p>
                <p style="font-size:.8125rem;color:#9ca3af;margin-top:4px;">Stok sudah habis · Barang tidak tersedia</p>
            </div>
            @elseif($product['shopeeLink'])
            <a href="{{ $product['shopeeLink'] }}" target="_blank" rel="noopener" class="btn-shopee" style="width:100%;justify-content:center;font-size:1rem;padding:16px;border-radius:16px;">
                🛍 Beli di Shopee
            </a>
            @else
            <div style="text-align:center;padding:16px;background:#f9fafb;border-radius:16px;color:#9ca3af;font-size:.875rem;font-weight:600;">
                ⚠ Link Shopee belum tersedia
            </div>
            @endif

            <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:16px;font-size:.75rem;color:#9ca3af;">
                🛡️ Foto asli produk · Kondisi sesuai deskripsi
            </div>
        </div>
    </div>

    {{-- Related Products --}}
    @if($related->count() > 0)
    <div style="margin-top:64px;">
        <h2 style="font-size:1.5rem;font-weight:800;color:#1a0a2e;margin-bottom:24px;">Produk Serupa</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:20px;">
            @foreach($related as $rp)
            @php $rso = $rp['isSoldOut']; @endphp
            <a href="{{ route('product.detail', $rp['id']) }}" style="text-decoration:none;">
                <div class="luxury-card" style="border-radius:20px;overflow:hidden;border:1px solid rgba(45,106,79,.1);background:#fff;{{ $rso ? 'opacity:.75;' : '' }}">
                    <div style="position:relative;aspect-ratio:3/4;background:#f9fafb;">
                        @if($rp['photos'][0] ?? null)
                        <img src="{{ $rp['photos'][0] }}" alt="{{ $rp['name'] }}" style="width:100%;height:100%;object-fit:cover;{{ $rso ? 'filter:grayscale(1);' : '' }}" loading="lazy" />
                        @endif
                        @if($rso)<div class="sold-out-overlay"><span class="sold-out-text" style="font-size:1.2rem;">Sold Out</span></div>@endif
                    </div>
                    <div style="padding:12px;">
                        <p style="font-size:.8125rem;font-weight:600;color:#1a0a2e;line-height:1.4;" class="line-clamp-2">{{ $rp['name'] }}</p>
                        <p style="font-size:.9rem;font-weight:800;color:{{ $rso ? '#9ca3af' : '#ec4899' }};margin-top:6px;">Rp {{ number_format($rp['price'], 0, ',', '.') }}</p>
                    </div>
                </div>
            </a>
            @endforeach
        </div>
    </div>
    @endif
</div>

@include('partials.footer')
@include('partials.chat-widget')

@push('scripts')
<script>
// Track product view
fetch('/api/visitor/track', {
    method: 'POST',
    headers: {'Content-Type':'application/json','X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content},
    body: JSON.stringify({is_new_session: false, product_id: '{{ $product['id'] }}'})
}).catch(function(){});
</script>
@endpush

@endsection
