@extends('layouts.admin')
@section('title', 'Analitik Pengunjung')
@section('page-title', 'Analitik Pengunjung')

@section('content')
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
    <div>
        <h1 style="font-size:1.5rem;font-weight:800;color:#1a0a2e;">Analitik Pengunjung</h1>
        <p style="font-size:.875rem;color:#9ca3af;margin-top:4px;">Data pengunjung website SherlyPreloved</p>
    </div>
    <form method="POST" action="{{ route('admin.visitors.reset') }}" onsubmit="return confirm('Reset semua data pengunjung?')">
        @csrf
        <button type="submit" class="btn-ghost" style="color:#ef4444;border:1px solid #fca5a5;">🔄 Reset Data</button>
    </form>
</div>

{{-- Stats --}}
@php
$weekVisits = array_sum(array_column($chartData,'visits'));
$todayVisits = end($chartData)['visits'] ?? 0;
@endphp
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;margin-bottom:24px;">
    @foreach([
        ['Total Pengunjung',$vd['totalVisits']??0,'👥','#fce7f3'],
        ['Total Page Views',$vd['totalPageViews']??0,'👁','#ede9fe'],
        ['Hari Ini',$todayVisits,'🕐','#dbeafe'],
        ['Minggu Ini',$weekVisits,'📅','#dcfce7'],
    ] as $s)
    <div class="stat-card">
        <div style="width:36px;height:36px;background:{{ $s[3] }};border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1rem;margin-bottom:10px;">{{ $s[2] }}</div>
        <p style="font-size:1.5rem;font-weight:800;color:#1a0a2e;">{{ number_format($s[1]) }}</p>
        <p style="font-size:.7rem;color:#9ca3af;margin-top:2px;">{{ $s[0] }}</p>
    </div>
    @endforeach
</div>

{{-- Chart --}}
<div class="card" style="padding:24px;margin-bottom:24px;">
    <h2 style="font-size:.9rem;font-weight:700;color:#1a0a2e;margin-bottom:4px;">Grafik Kunjungan 7 Hari Terakhir</h2>
    <p style="font-size:.75rem;color:#9ca3af;margin-bottom:16px;">Pengunjung dan page views per hari</p>
    <canvas id="visitChart2" height="80"></canvas>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px;">
    {{-- Devices --}}
    <div class="card" style="padding:20px;">
        <h2 style="font-size:.9rem;font-weight:700;color:#1a0a2e;margin-bottom:4px;">Perangkat</h2>
        <p style="font-size:.7rem;color:#9ca3af;margin-bottom:16px;">Jenis perangkat pengunjung</p>
        @php $devices = $vd['devices'] ?? []; $totalDev = array_sum($devices) ?: 1; @endphp
        @if(array_sum($devices) > 0)
        @foreach($devices as $name => $cnt)
        <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;font-size:.75rem;margin-bottom:4px;">
                <span style="font-weight:600;color:#374151;">{{ $name }}</span>
                <span style="font-weight:700;color:#1a0a2e;">{{ $cnt }}</span>
            </div>
            <div style="height:6px;background:#fce7f3;border-radius:999px;overflow:hidden;">
                <div style="height:100%;border-radius:999px;background:{{ $name==='Desktop'?'#ec4899':($name==='Mobile'?'#8b5cf6':'#3b82f6') }};width:{{ round($cnt/$totalDev*100) }}%;"></div>
            </div>
        </div>
        @endforeach
        @else<p style="font-size:.8rem;color:#d1d5db;text-align:center;padding:24px 0;">Belum ada data</p>@endif
    </div>

    {{-- Referrers --}}
    <div class="card" style="padding:20px;">
        <h2 style="font-size:.9rem;font-weight:700;color:#1a0a2e;margin-bottom:4px;">Sumber Trafik</h2>
        <p style="font-size:.7rem;color:#9ca3af;margin-bottom:16px;">Dari mana pengunjung datang</p>
        @php $refs = $vd['referrers'] ?? []; arsort($refs); $totalRef = array_sum($refs) ?: 1; @endphp
        @if(array_sum($refs) > 0)
        @php $colors = ['#ec4899','#8b5cf6','#3b82f6','#10b981','#f59e0b']; $ci = 0; @endphp
        @foreach($refs as $ref => $cnt)
        <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;font-size:.75rem;margin-bottom:4px;">
                <span style="font-weight:600;color:#374151;">{{ $ref }}</span>
                <span style="font-weight:700;color:#1a0a2e;">{{ $cnt }} ({{ round($cnt/$totalRef*100) }}%)</span>
            </div>
            <div style="height:6px;background:#fce7f3;border-radius:999px;overflow:hidden;">
                <div style="height:100%;border-radius:999px;background:{{ $colors[$ci%5] }};width:{{ round($cnt/$totalRef*100) }}%;"></div>
            </div>
        </div>
        @php $ci++; @endphp
        @endforeach
        @else<p style="font-size:.8rem;color:#d1d5db;text-align:center;padding:24px 0;">Belum ada data</p>@endif
    </div>

    {{-- Top products --}}
    <div class="card" style="overflow:hidden;">
        <div style="padding:16px 20px;border-bottom:1px solid #fdf2f8;">
            <h2 style="font-size:.9rem;font-weight:700;color:#1a0a2e;">Produk Terpopuler</h2>
            <p style="font-size:.7rem;color:#9ca3af;margin-top:2px;">Paling banyak dilihat</p>
        </div>
        @if(count($topViewed) > 0)
        @php $ri = 1; @endphp
        @foreach($topViewed as $pid => $views)
        @php $prod = $allProducts->get($pid); @endphp
        @if($prod)
        <div style="display:flex;align-items:center;gap:8px;padding:10px 16px;border-bottom:1px solid #fdf2f8;">
            <span style="font-size:.7rem;font-weight:800;color:#8b5cf6;width:16px;text-align:center;">{{ $ri++ }}</span>
            <p style="flex:1;font-size:.75rem;font-weight:600;color:#1a0a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ $prod->name }}</p>
            <span style="font-size:.7rem;font-weight:700;color:#ec4899;background:#fce7f3;padding:2px 6px;border-radius:999px;">{{ $views }}x</span>
        </div>
        @endif
        @endforeach
        @else<p style="padding:24px;text-align:center;font-size:.8rem;color:#d1d5db;">Belum ada data</p>@endif
    </div>
</div>

{{-- Daily table --}}
<div class="card" style="overflow:hidden;">
    <div style="padding:16px 20px;border-bottom:1px solid #fdf2f8;">
        <h2 style="font-size:.9rem;font-weight:700;color:#1a0a2e;">Riwayat Kunjungan Harian</h2>
        <p style="font-size:.7rem;color:#9ca3af;margin-top:2px;">7 hari terakhir (terbaru di atas)</p>
    </div>
    <div class="table-wrap">
        <table>
            <thead><tr>
                <th>Tanggal</th><th>Pengunjung</th><th>Page Views</th><th>PV/Pengunjung</th>
            </tr></thead>
            <tbody>
                @foreach(array_reverse($chartData) as $d)
                <tr>
                    <td style="font-weight:600;color:#1a0a2e;">{{ $d['label'] }} <span style="color:#9ca3af;font-size:.7rem;">({{ $d['date'] }})</span></td>
                    <td><span style="font-weight:700;color:#ec4899;">{{ $d['visits'] }}</span></td>
                    <td><span style="font-weight:700;color:#8b5cf6;">{{ $d['pageViews'] }}</span></td>
                    <td style="color:#6b7280;">{{ $d['visits'] > 0 ? number_format($d['pageViews']/$d['visits'],1) : '-' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>

@push('scripts')
<script>
(function(){
    var data = @json($chartData);
    var canvas = document.getElementById('visitChart2');
    var ctx = canvas.getContext('2d');
    var W = canvas.parentElement.clientWidth - 48;
    canvas.width = W; canvas.height = 180;
    var maxV = Math.max(...data.map(d=>Math.max(d.visits,d.pageViews)),5);
    var padL=32,padR=16,padT=16,padB=40,iW=W-padL-padR,iH=160-padT-padB;
    ctx.strokeStyle='#fce7f3';ctx.lineWidth=1;
    for(var g=0;g<=4;g++){var y=padT+iH-(g/4)*iH;ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(padL+iW,y);ctx.stroke();ctx.fillStyle='#9ca3af';ctx.font='10px sans-serif';ctx.fillText(Math.round(g/4*maxV),2,y+4);}
    function line(key,color){ctx.beginPath();data.forEach(function(d,i){var x=padL+(i/(data.length-1))*iW;var y=padT+iH-(d[key]/maxV)*iH;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.lineJoin='round';ctx.stroke();data.forEach(function(d,i){var x=padL+(i/(data.length-1))*iW;var y=padT+iH-(d[key]/maxV)*iH;ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();});}
    line('visits','#ec4899');line('pageViews','#8b5cf6');
    ctx.fillStyle='#9ca3af';ctx.font='10px sans-serif';ctx.textAlign='center';
    data.forEach(function(d,i){var x=padL+(i/(data.length-1))*iW;ctx.fillText(d.label,x,padT+iH+18);});
})();
</script>
@endpush
@endsection
