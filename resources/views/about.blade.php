@extends('layouts.app')
@section('title', 'Tentang Kami – SherlyPreloved')
@section('description', 'SherlyPreloved – toko preloved terpercaya di Indonesia. Koleksi fashion berkualitas, foto asli, kondisi terawat.')

@section('body')
@include('partials.navbar')

<div class="container" style="padding:56px 20px;max-width:800px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
        <div style="display:inline-flex;align-items:center;gap:8px;background:#fce7f3;color:#be185d;font-size:.75rem;font-weight:700;padding:6px 16px;border-radius:999px;margin-bottom:16px;">❤️ Tentang Kami</div>
        <h1 style="font-size:2.25rem;font-weight:800;color:#1a0a2e;margin-bottom:12px;">SherlyPreloved</h1>
        <p style="color:#6b7280;max-width:520px;margin:0 auto;line-height:1.7;">Toko preloved terpercaya yang menyediakan koleksi fashion berkualitas dengan harga terjangkau. Setiap produk dipilih dengan teliti untuk kondisi terbaik.</p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:48px;">
        @foreach([
            ['📷','bg:#fce7f3','Foto Asli','Semua foto adalah foto nyata produk, diambil langsung oleh kami.'],
            ['✅','bg:#dcfce7','Barang Terawat','Setiap produk diseleksi ketat dan dipastikan dalam kondisi layak pakai.'],
            ['🛡️','bg:#ede9fe','Terpercaya','Transaksi aman melalui Shopee dengan sistem perlindungan pembeli resmi.'],
        ] as $f)
        <div style="background:linear-gradient(135deg,#fff7fb,#fff);border:1px solid #fce7f3;border-radius:20px;padding:24px;text-align:center;">
            <div style="width:56px;height:56px;background:#fdf2f8;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:1.6rem;">{{ $f[0] }}</div>
            <h3 style="font-weight:700;color:#1a0a2e;margin-bottom:8px;">{{ $f[2] }}</h3>
            <p style="font-size:.875rem;color:#6b7280;line-height:1.6;">{{ $f[3] }}</p>
        </div>
        @endforeach
    </div>

    {{-- FAQ --}}
    <h2 style="font-size:1.5rem;font-weight:800;color:#1a0a2e;text-align:center;margin-bottom:24px;">Pertanyaan Umum</h2>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:48px;">
        @php $faqs = [
            ['Apakah barang original?','Ya, semua barang adalah preloved original dari berbagai brand lokal dan internasional. Kami menjamin keaslian setiap produk.'],
            ['Apakah foto asli produk?','Tentu! Semua foto di katalog ini adalah foto nyata barang kami. Apa yang kamu lihat adalah kondisi nyata produk.'],
            ['Bagaimana cara membeli?','Temukan produk yang kamu suka, klik \'Beli di Shopee\' pada halaman detail, lalu lakukan pembelian langsung di Shopee.'],
            ['Mengapa diarahkan ke Shopee?','Semua transaksi dilakukan di Shopee untuk keamanan berbelanja, termasuk pembayaran, pengiriman, dan perlindungan pembeli.'],
            ['Bagaimana pengiriman dilakukan?','Pengiriman diproses sepenuhnya melalui Shopee dengan berbagai pilihan kurir. Kami mengemas barang dengan sangat hati-hati.'],
            ['Bisakah melakukan negosiasi harga?','Harga sudah sangat kompetitif. Untuk info lebih lanjut, hubungi kami melalui Shopee atau Instagram.'],
        ]; @endphp
        @foreach($faqs as $i => $faq)
        <div style="background:#fff;border:1px solid #fce7f3;border-radius:16px;overflow:hidden;">
            <button onclick="toggleFaq({{ $i }})" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:none;border:none;cursor:pointer;text-align:left;font-size:.9rem;font-weight:600;color:#1a0a2e;font-family:inherit;">
                {{ $faq[0] }}
                <span id="faq-icon-{{ $i }}" style="font-size:1.2rem;color:#ec4899;transition:transform .2s;flex-shrink:0;margin-left:12px;">+</span>
            </button>
            <div id="faq-answer-{{ $i }}" style="display:none;padding:0 20px 16px;font-size:.875rem;color:#6b7280;line-height:1.7;border-top:1px solid #fdf2f8;">{{ $faq[1] }}</div>
        </div>
        @endforeach
    </div>

    {{-- Contact CTA --}}
    <div style="background:linear-gradient(135deg,#ec4899,#8b5cf6);border-radius:24px;padding:32px;text-align:center;color:#fff;">
        <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:16px;">Hubungi Kami</h2>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;">
            <a href="https://s.shopee.co.id/gOm3vwsWI?share_channel_code=1" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.2);color:#fff;padding:10px 20px;border-radius:999px;font-size:.875rem;font-weight:700;text-decoration:none;transition:background .15s;" onmouseenter="this.style.background='rgba(255,255,255,.3)'" onmouseleave="this.style.background='rgba(255,255,255,.2)'">🛍 Shopee</a>
            <a href="https://www.instagram.com/shrlyagg/" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.2);color:#fff;padding:10px 20px;border-radius:999px;font-size:.875rem;font-weight:700;text-decoration:none;transition:background .15s;" onmouseenter="this.style.background='rgba(255,255,255,.3)'" onmouseleave="this.style.background='rgba(255,255,255,.2)'">📷 Instagram</a>
        </div>
    </div>
</div>

@include('partials.footer')
@include('partials.chat-widget')

@push('scripts')
<script>
function toggleFaq(i) {
    var ans = document.getElementById('faq-answer-' + i);
    var icon = document.getElementById('faq-icon-' + i);
    var open = ans.style.display !== 'none';
    ans.style.display = open ? 'none' : 'block';
    icon.textContent = open ? '+' : '−';
}
</script>
@endpush
@endsection
