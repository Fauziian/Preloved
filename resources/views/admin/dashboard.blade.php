@extends('layouts.admin')
@section('title', 'Dashboard')
@section('page-title', 'Dashboard')

@section('content')
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px;">
    <div>
        <h1 style="font-size:1.5rem;font-weight:800;color:#1a0a2e;">Dashboard</h1>
        <p style="color:#9ca3af;font-size:.875rem;margin-top:4px;">Selamat datang kembali, Admin Sherly!</p>
    </div>
    <a href="{{ route('admin.products.add') }}" class="btn-primary">+ Tambah Produk</a>
</div>

{{-- Stats --}}
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:28px;">
    @foreach([
        ['Total Kunjungan', $stats['totalVisits'], '👥', '#fce7f3'],
        ['Page Views', $stats['totalPageViews'], '👁', '#ede9fe'],
        ['Produk Aktif', $stats['published'], '📦', '#dcfce7'],
        ['Stok Habis', $stats['soldOut'], '⚠️', '#fee2e2'],
    ] as $s)
    <div class="stat-card">
        <div style="width:40px;height:40px;background:{{ $s[3] }};border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;margin-bottom:12px;">{{ $s[2] }}</div>
        <p style="font-size:1.6rem;font-weight:800;color:#1a0a2e;">{{ number_format($s[1]) }}</p>
        <p style="font-size:.75rem;color:#9ca3af;margin-top:2px;">{{ $s[0] }}</p>
    </div>
    @endforeach
</div>

{{-- Chart (vanilla JS) --}}
<div class="card" style="padding:24px;margin-bottom:28px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <div>
            <h2 style="font-size:1rem;font-weight:700;color:#1a0a2e;">Grafik Kunjungan</h2>
            <p style="font-size:.75rem;color:#9ca3af;margin-top:2px;">7 hari terakhir</p>
        </div>
        <a href="{{ route('admin.visitors') }}" style="font-size:.8125rem;color:#ec4899;font-weight:600;text-decoration:none;">Lihat Detail →</a>
    </div>
    <canvas id="visitChart" height="80"></canvas>
</div>

{{-- Recent + Top viewed --}}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;flex-wrap:wrap;">
    <div class="card" style="overflow:hidden;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #fdf2f8;">
            <h2 style="font-size:.9rem;font-weight:700;color:#1a0a2e;">Produk Terbaru</h2>
            <a href="{{ route('admin.products') }}" style="font-size:.75rem;color:#ec4899;font-weight:600;text-decoration:none;">Semua →</a>
        </div>
        @foreach($recentProducts as $p)
        <div style="display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid #fdf2f8;">
            <div style="width:40px;height:40px;border-radius:10px;overflow:hidden;background:#fdf2f8;flex-shrink:0;">
                @if($p->photos && count($p->photos) > 0)<img src="{{ $p->photos[0] }}" alt="" style="width:100%;height:100%;object-fit:cover;" loading="lazy"/>@else<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1rem;">📦</div>@endif
            </div>
            <div style="flex:1;min-width:0;">
                <p style="font-size:.8125rem;font-weight:600;color:#1a0a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ $p->name }}</p>
                <p style="font-size:.7rem;color:#9ca3af;">Rp {{ number_format($p->price, 0, ',', '.') }}</p>
            </div>
            <span class="{{ $p->status === 'published' ? 'badge-green' : ($p->status === 'draft' ? 'badge-amber' : 'badge-gray') }}">
                {{ $p->status === 'published' ? 'Aktif' : ($p->status === 'draft' ? 'Draft' : 'Habis') }}
            </span>
        </div>
        @endforeach
        @if($recentProducts->isEmpty())<p style="padding:32px 20px;text-align:center;font-size:.8125rem;color:#d1d5db;">Belum ada produk</p>@endif
    </div>

    <div class="card" style="overflow:hidden;">
        <div style="padding:16px 20px;border-bottom:1px solid #fdf2f8;display:flex;align-items:center;justify-content:space-between;">
            <h2 style="font-size:.9rem;font-weight:700;color:#1a0a2e;">Produk Paling Dilihat</h2>
            <span style="font-size:1rem;">📈</span>
        </div>
        @if(count($topViewed) > 0)
        @php $i = 1; @endphp
        @foreach($topViewed as $pid => $views)
        @php $prod = $products->firstWhere('id', $pid); @endphp
        @if($prod)
        <div style="display:flex;align-items:center;gap:10px;padding:10px 20px;border-bottom:1px solid #fdf2f8;">
            <span style="width:20px;text-align:center;font-size:.75rem;font-weight:700;color:#8b5cf6;">{{ $i++ }}</span>
            <div style="width:36px;height:36px;border-radius:10px;overflow:hidden;background:#fdf2f8;flex-shrink:0;">
                @if($prod->photos && count($prod->photos) > 0)<img src="{{ $prod->photos[0] }}" alt="" style="width:100%;height:100%;object-fit:cover;" loading="lazy"/>@endif
            </div>
            <p style="flex:1;font-size:.8125rem;font-weight:600;color:#1a0a2e;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ $prod->name }}</p>
            <span style="font-size:.75rem;font-weight:700;color:#8b5cf6;background:#ede9fe;padding:2px 8px;border-radius:999px;flex-shrink:0;">{{ $views }}x</span>
        </div>
        @endif
        @endforeach
        @else
        <p style="padding:32px 20px;text-align:center;font-size:.8125rem;color:#d1d5db;">Belum ada data</p>
        @endif
    </div>
</div>

@push('scripts')
<script>
// Simple chart using Canvas API
(function() {
    var data = @json($chartData);
    var canvas = document.getElementById('visitChart');
    var ctx = canvas.getContext('2d');
    var W = canvas.parentElement.clientWidth - 48;
    canvas.width = W;
    canvas.height = 180;
    var maxV = Math.max(...data.map(d => Math.max(d.visits, d.pageViews)), 5);
    var padL = 32, padR = 16, padT = 16, padB = 40;
    var iW = W - padL - padR, iH = 180 - padT - padB;

    // Grid
    ctx.strokeStyle = '#fce7f3'; ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
        var y = padT + iH - (g / 4) * iH;
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + iW, y); ctx.stroke();
        ctx.fillStyle = '#9ca3af'; ctx.font = '10px Plus Jakarta Sans';
        ctx.fillText(Math.round((g / 4) * maxV), 2, y + 4);
    }

    function drawLine(key, color) {
        ctx.beginPath();
        data.forEach(function(d, i) {
            var x = padL + (i / (data.length - 1)) * iW;
            var y = padT + iH - (d[key] / maxV) * iH;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
        // Dots
        data.forEach(function(d, i) {
            var x = padL + (i / (data.length - 1)) * iW;
            var y = padT + iH - (d[key] / maxV) * iH;
            ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = color; ctx.fill();
        });
    }

    drawLine('visits', '#ec4899');
    drawLine('pageViews', '#8b5cf6');

    // Labels
    ctx.fillStyle = '#9ca3af'; ctx.font = '10px Plus Jakarta Sans'; ctx.textAlign = 'center';
    data.forEach(function(d, i) {
        var x = padL + (i / (data.length - 1)) * iW;
        ctx.fillText(d.label, x, padT + iH + 18);
    });

    // Legend
    ctx.textAlign = 'left'; ctx.font = '11px Plus Jakarta Sans';
    ctx.fillStyle = '#ec4899'; ctx.fillRect(padL, padT + iH + 32, 12, 3);
    ctx.fillStyle = '#374151'; ctx.fillText('Kunjungan', padL + 16, padT + iH + 37);
    ctx.fillStyle = '#8b5cf6'; ctx.fillRect(padL + 90, padT + iH + 32, 12, 3);
    ctx.fillStyle = '#374151'; ctx.fillText('Page Views', padL + 106, padT + iH + 37);
})();
</script>
@endpush

@endsection
