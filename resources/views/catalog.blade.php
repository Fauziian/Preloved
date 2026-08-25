@extends('layouts.app')

@section('title', 'SherlyPreloved – Katalog Fashion Preloved Berkualitas')
@section('description', 'Temukan preloved berkualitas pilihan Sherly. Foto asli, kondisi terawat, harga terjangkau. Beli langsung di Shopee.')

@section('body')

{{-- Nature Particles --}}
<div class="leaf-rain" aria-hidden="true">
    @php $leaves = [
        ['8%','9s','0s','70px','580deg','#4a9e6a'],['22%','11s','2.5s','-55px','-620deg','#7fbf7f'],
        ['40%','8s','1s','90px','720deg','#3d8b5e'],['58%','13s','4s','-70px','-480deg','#a8d8a8'],
        ['72%','10s','0.5s','50px','640deg','#5aad7a'],['85%','12s','6s','-60px','-560deg','#6bbf8a'],
    ]; @endphp
    @foreach($leaves as $l)
    <div class="leaf-item" style="left:{{$l[0]}};--dur:{{$l[1]}};--delay:{{$l[2]}};--dx:{{$l[3]}};--rot:{{$l[4]}}">
        <svg width="18" height="22" viewBox="0 0 18 22"><path d="M9 0 C14 4,18 11,9 22 C0 11,4 4,9 0Z" fill="{{$l[5]}}"/><path d="M9 0 L9 22" stroke="rgba(255,255,255,.35)" stroke-width="0.7" fill="none"/></svg>
    </div>
    @endforeach
    @foreach([[30,12,'1.5s','40px','#f9a8d4'],[50,10,'5s','-35px','#fda4af'],[65,14,'2s','55px','#fbcfe8']] as $p)
    <div class="petal-item" style="left:{{$p[0]}}%;--dur:{{$p[1]}}s;--delay:{{$p[2]}};--dx2:{{$p[3]}}">
        <svg width="14" height="16" viewBox="0 0 14 16"><ellipse cx="7" cy="8" rx="5" ry="8" fill="{{$p[4]}}" transform="rotate(-20 7 8)" opacity=".7"/></svg>
    </div>
    @endforeach
</div>

{{-- Navbar --}}
<nav class="nature-navbar sticky top-0 z-40">
    <div class="container" style="height:68px;display:flex;align-items:center;justify-content:space-between;">
        <a href="{{ route('catalog') }}" class="logo-link" style="display:flex;align-items:center;gap:10px;text-decoration:none;" id="logo-btn">
            <img src="{{ asset('images/logo.png') }}" style="width:36px;height:36px;object-fit:contain;" alt="SherlyPreloved Logo" />
            <span style="font-weight:800;font-size:1.2rem;color:#1a0a2e;">Sherly<span style="background:linear-gradient(135deg,#ec4899,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Preloved</span>
                <span style="display:block;font-size:9px;font-weight:600;letter-spacing:.2em;color:rgba(45,106,79,.7);text-transform:uppercase;margin-top:-2px;">✦ Nature Collection ✦</span>
            </span>
        </a>
        <div class="nav-links" style="display:flex;align-items:center;gap:28px;">
            <a href="{{ route('catalog') }}" style="font-size:.875rem;font-weight:600;color:{{ request()->routeIs('catalog') ? '#2d6a4f' : '#6b7280' }};text-decoration:none;transition:color .15s;">Katalog</a>
            <a href="{{ route('about') }}" style="font-size:.875rem;font-weight:600;color:{{ request()->routeIs('about') ? '#2d6a4f' : '#6b7280' }};text-decoration:none;transition:color .15s;">Tentang</a>
            <a href="https://s.shopee.co.id/gOm3vwsWI?share_channel_code=1" target="_blank" rel="noopener" class="btn-shopee" style="font-size:.8125rem;padding:9px 20px;">
                🛍 Shopee Kami
            </a>
        </div>
        <button id="nav-toggle" style="display:none;background:none;border:none;cursor:pointer;padding:8px;" aria-label="Menu">
            <svg width="22" height="22" fill="none" stroke="#2d6a4f" stroke-width="2.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
    </div>
    <div id="mobile-menu" style="display:none;background:rgba(254,253,248,.97);border-top:1px solid rgba(45,106,79,.08);padding:16px 20px;flex-direction:column;gap:12px;">
        <a href="{{ route('catalog') }}" style="font-size:.9rem;font-weight:600;color:#374151;text-decoration:none;">Katalog</a>
        <a href="{{ route('about') }}" style="font-size:.9rem;font-weight:600;color:#374151;text-decoration:none;">Tentang</a>
        <a href="https://s.shopee.co.id/gOm3vwsWI?share_channel_code=1" target="_blank" rel="noopener" class="btn-shopee" style="font-size:.8125rem;padding:10px 20px;width:fit-content;">🛍 Shopee Kami</a>
    </div>
</nav>

{{-- Hero --}}
<section class="nature-hero-bg" style="padding:80px 0 60px;border-bottom:1px solid rgba(45,106,79,.08);position:relative;overflow:hidden;">
    <div style="position:absolute;top:-100px;right:-100px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(45,106,79,.07) 0%,transparent 70%);filter:blur(50px);pointer-events:none;"></div>
    <div class="container" style="text-align:center;position:relative;">
        <div class="nature-badge" style="display:inline-flex;align-items:center;gap:8px;font-size:.75rem;font-weight:700;padding:8px 20px;border-radius:999px;margin-bottom:24px;">
            <svg width="12" height="14" viewBox="0 0 12 14"><path d="M6 0C9 2,12 6,6 14C0 6,3 2,6 0Z" fill="#2d6a4f"/></svg>
            Official Preloved Store Indonesia – Nature Collection
        </div>
        <h1 style="font-family:'Cormorant Garamond',serif;font-size:clamp(2.4rem,6vw,4rem);font-weight:700;color:#1a0a2e;line-height:1.15;margin-bottom:16px;">
            Temukan Preloved <br>
            <span style="background:linear-gradient(135deg,#2d6a4f,#0d9488,#92400e);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Berkualitas</span>
        </h1>
        <p style="color:#6b7280;font-size:1.05rem;max-width:520px;margin:0 auto 28px;line-height:1.7;">Barang pilihan, kondisi terawat, foto asli, dan langsung bisa dibeli melalui Shopee.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:48px;">
            <a href="#katalog" class="btn-primary">
                <svg width="14" height="16" viewBox="0 0 14 16"><path d="M7 0C11 3,14 8,7 16C0 8,3 3,7 0Z" fill="white"/></svg>
                Lihat Koleksi
            </a>
            <a href="https://s.shopee.co.id/gOm3vwsWI?share_channel_code=1" target="_blank" rel="noopener" class="btn-shopee">🛍 Belanja di Shopee</a>
        </div>
        {{-- Trust badges --}}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;max-width:700px;margin:0 auto;">
            @foreach([['📷','Foto Asli Produk'],['✅','Kondisi Terawat'],['🛡️','Terpercaya'],['🚚','Kirim via Shopee']] as $b)
            <div class="nature-glass" style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:16px;font-size:.8125rem;font-weight:600;">
                <span style="font-size:1.1rem;">{{ $b[0] }}</span> {{ $b[1] }}
            </div>
            @endforeach
        </div>
    </div>
    <div class="gold-divider" style="margin-top:48px;"></div>
</section>

{{-- Catalog --}}
<section id="katalog" class="container" style="padding:56px 20px;">
    {{-- Filters --}}
    <form method="GET" action="{{ route('catalog') }}" id="filter-form">
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
            <div style="flex:1;min-width:240px;display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #fbcfe8;border-radius:16px;padding:12px 16px;">
                <svg width="16" height="16" fill="none" stroke="#f472b6" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari nama, brand, atau tag..." style="flex:1;background:transparent;border:none;outline:none;font-size:.875rem;font-family:inherit;" />
                @if(request('search'))<a href="{{ route('catalog') }}" style="color:#f472b6;text-decoration:none;font-size:1.2rem;line-height:1;">&times;</a>@endif
            </div>
            <select name="category" class="form-inp" style="width:auto;min-width:160px;" onchange="this.form.submit()">
                @foreach(['Semua','Fashion Wanita','Fashion Pria','Tas','Sepatu','Aksesoris','Elektronik','Koleksi','Beauty','Rumah Tangga','Lainnya'] as $cat)
                <option value="{{ $cat }}" {{ request('category', 'Semua') === $cat ? 'selected' : '' }}>{{ $cat }}</option>
                @endforeach
            </select>
            <select name="condition" class="form-inp" style="width:auto;" onchange="this.form.submit()">
                <option value="">Semua Kondisi</option>
                @foreach(['Baru','Bekas','Baik','Sangat Baik'] as $c)
                <option value="{{ $c }}" {{ request('condition') === $c ? 'selected' : '' }}>{{ $c }}</option>
                @endforeach
            </select>
            <button type="submit" class="btn-primary" style="padding:12px 22px;font-size:.875rem;">Cari</button>
        </div>
        {{-- Category chips --}}
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
            @foreach(['Semua','Fashion Wanita','Fashion Pria','Tas','Sepatu','Aksesoris','Elektronik','Koleksi','Beauty','Rumah Tangga','Lainnya'] as $cat)
            <a href="{{ route('catalog', array_merge(request()->except('category','page'), ['category'=>$cat])) }}"
               style="padding:7px 16px;border-radius:999px;font-size:.8125rem;font-weight:600;text-decoration:none;transition:all .15s;
               {{ request('category','Semua')===$cat ? 'background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;box-shadow:0 4px 12px rgba(236,72,153,.25);' : 'background:#fff;color:#6b7280;border:1px solid #fce7f3;' }}">
                {{ $cat }}
            </a>
            @endforeach
        </div>
    </form>

    <p style="font-size:.875rem;color:#9ca3af;margin-bottom:20px;">{{ $products->total() }} produk ditemukan</p>

    @if($products->count() > 0)
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:20px;">
        @foreach($products as $p)
        @php $d = $p['discount']; $so = $p['isSoldOut']; $photo = $p['photos'][0] ?? null; @endphp
        <a href="{{ route('product.detail', $p['id']) }}" style="text-decoration:none;" class="product-card-link">
            <div class="luxury-card" style="border-radius:22px;overflow:hidden;border:1px solid {{ $so ? '#e5e7eb' : 'rgba(45,106,79,.12)' }};background:#fff;{{ $so ? 'opacity:.8;' : '' }}cursor:pointer;">
                <div style="position:relative;overflow:hidden;aspect-ratio:3/4;background:linear-gradient(145deg,#f1f9f4,#fff7fb);">
                    @if($photo)
                        <img src="{{ $photo }}" alt="{{ $p['name'] }}" style="width:100%;height:100%;object-fit:cover;{{ $so ? 'filter:grayscale(1);' : '' }}transition:transform .5s;" class="prod-img" loading="lazy" />
                    @else
                        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#fdf2f8;">📦</div>
                    @endif
                    @if($so)
                    <div class="sold-out-overlay"><span class="sold-out-text">Sold Out</span></div>
                    @endif
                    @if(!$so && $d > 0)
                    <div style="position:absolute;top:10px;left:10px;background:linear-gradient(135deg,#c9a84c,#f0d060);color:#fff;font-size:.6875rem;font-weight:700;padding:4px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(201,168,76,.5);">HEMAT {{ $d }}%</div>
                    @endif
                    @if(!$so)
                    <div style="position:absolute;top:10px;right:10px;">
                        <span style="font-size:.625rem;font-weight:700;padding:3px 8px;border-radius:999px;backdrop-filter:blur(8px);{{ in_array($p['condition'],['Sangat Baik','Baru']) ? 'background:rgba(220,252,231,.9);color:#15803d;' : 'background:rgba(219,234,254,.9);color:#1d4ed8;' }}">{{ $p['condition'] }}</span>
                    </div>
                    @endif
                </div>
                <div style="padding:14px 14px 16px;">
                    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;">
                        <span style="font-size:.625rem;font-weight:600;color:#2d6a4f;background:#ecfdf5;padding:2px 8px;border-radius:999px;">{{ $p['category'] }}</span>
                        @if($p['brand'] && $p['brand'] !== 'Unbranded')
                        <span style="font-size:.625rem;font-weight:600;color:#be185d;background:#fce7f3;padding:2px 8px;border-radius:999px;">{{ $p['brand'] }}</span>
                        @endif
                    </div>
                    <p style="font-size:.875rem;font-weight:600;color:{{ $so ? '#9ca3af' : '#1a0a2e' }};line-height:1.4;" class="line-clamp-2">{{ $p['name'] }}</p>
                    <div style="margin-top:8px;">
                        <p style="font-size:1rem;font-weight:800;color:{{ $so ? '#9ca3af' : '#ec4899' }};{{ $so ? 'text-decoration:line-through;' : '' }}">Rp {{ number_format($p['price'], 0, ',', '.') }}</p>
                        @if(!$so && $p['originalPrice'] > $p['price'])
                        <p style="font-size:.75rem;color:#9ca3af;text-decoration:line-through;">Rp {{ number_format($p['originalPrice'], 0, ',', '.') }}</p>
                        @endif
                    </div>
                </div>
            </div>
        </a>
        @endforeach
    </div>

    {{-- Pagination --}}
    @if($products->hasPages())
    <div style="margin-top:48px;padding-top:32px;border-top:1px solid rgba(45,106,79,.08);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;">
        <div class="pagination">
            @if($products->onFirstPage())
            <span class="page-btn disabled">&larr; Sebelumnya</span>
            @else
            <a href="{{ $products->previousPageUrl() }}" class="page-btn">&larr; Sebelumnya</a>
            @endif
            @foreach($products->getUrlRange(1, $products->lastPage()) as $page => $url)
                @if($page == $products->currentPage())
                <span class="page-btn active">{{ $page }}</span>
                @else
                <a href="{{ $url }}" class="page-btn">{{ $page }}</a>
                @endif
            @endforeach
            @if($products->hasMorePages())
            <a href="{{ $products->nextPageUrl() }}" class="page-btn">Selanjutnya &rarr;</a>
            @else
            <span class="page-btn disabled">Selanjutnya &rarr;</span>
            @endif
        </div>
        <p style="font-size:.875rem;color:#6b7280;">Menampilkan <strong>{{ $products->firstItem() }}–{{ $products->lastItem() }}</strong> dari <strong>{{ $products->total() }}</strong> hasil</p>
    </div>
    @endif

    @else
    <div style="text-align:center;padding:80px 20px;">
        <div style="font-size:3rem;margin-bottom:16px;">📦</div>
        <p style="font-size:1.1rem;font-weight:600;color:#9ca3af;">Produk tidak ditemukan</p>
        <a href="{{ route('catalog') }}" style="display:inline-block;margin-top:16px;color:#2d6a4f;font-weight:600;text-decoration:none;">Reset filter</a>
    </div>
    @endif
</section>

{{-- Testimonials --}}
<section style="background:linear-gradient(135deg,#fff7fb,#f5f0ff);padding:56px 20px;">
    <div class="container">
        <div style="text-align:center;margin-bottom:40px;">
            <h2 style="font-size:1.875rem;font-weight:800;color:#1a0a2e;">Kata Mereka</h2>
            <p style="color:#6b7280;margin-top:8px;">Pembeli yang sudah berbelanja di SherlyPreloved</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;">
            @foreach([
                ['Anisa R.','Jakarta','Barangnya sesuai foto dan deskripsi! Sweater pink masih bagus banget. Langsung checkout di Shopee, cepat!','Sweater Rajut Pink'],
                ['Bela S.','Bandung','Suka banget sama blouse ruffle-nya, bahan premium banget. Foto asli, kondisi oke, harga terjangkau!','Blouse Ruffle Putih'],
                ['Citra D.','Surabaya','Udah beli 3x dari SherlyPreloved, selalu puas! Admin responsif, barang dikemas rapi. Sangat recommended!','Berbagai Produk'],
            ] as $t)
            <div style="background:#fff;border-radius:20px;padding:24px;border:1px solid #fce7f3;box-shadow:0 2px 8px rgba(0,0,0,.04);">
                <div style="display:flex;gap:2px;margin-bottom:12px;">⭐⭐⭐⭐⭐</div>
                <p style="font-size:.875rem;color:#374151;line-height:1.7;">&ldquo;{{ $t[2] }}&rdquo;</p>
                <div style="margin-top:16px;padding-top:12px;border-top:1px solid #fdf2f8;">
                    <p style="font-size:.875rem;font-weight:700;color:#1a0a2e;">{{ $t[0] }}</p>
                    <p style="font-size:.75rem;color:#9ca3af;">{{ $t[1] }} · {{ $t[3] }}</p>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</section>

@include('partials.footer')
@include('partials.chat-widget')

@push('scripts')
<script>
// Navbar mobile toggle
document.getElementById('nav-toggle').addEventListener('click', function() {
    var m = document.getElementById('mobile-menu');
    m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
});
// Responsive nav
function checkNav() {
    var toggle = document.getElementById('nav-toggle');
    var links = document.querySelector('.nav-links');
    if (window.innerWidth < 768) {
        toggle.style.display = 'block';
        links.style.display = 'none';
    } else {
        toggle.style.display = 'none';
        links.style.display = 'flex';
        document.getElementById('mobile-menu').style.display = 'none';
    }
}
checkNav();
window.addEventListener('resize', checkNav);
// Logo secret admin (5 clicks)
var _lc = 0, _lt;
document.getElementById('logo-btn').addEventListener('click', function(e) {
    _lc++;
    clearTimeout(_lt);
    if (_lc >= 5) { _lc = 0; window.location.href = '/admin/login'; e.preventDefault(); return; }
    _lt = setTimeout(function(){ _lc = 0; }, 1500);
});
// Product card hover
document.querySelectorAll('.product-card-link').forEach(function(link) {
    var img = link.querySelector('.prod-img');
    if (!img) return;
    link.addEventListener('mouseenter', function() { img.style.transform = 'scale(1.07)'; });
    link.addEventListener('mouseleave', function() { img.style.transform = 'scale(1)'; });
});
</script>
@endpush

@endsection
