<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>@yield('title', 'SherlyPreloved – Nature Collection')</title>
    <meta name="description" content="@yield('description', 'Toko preloved terpercaya dengan koleksi fashion berkualitas. Foto asli, kondisi terawat, harga terjangkau.')" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@400;600;700&display=swap" rel="stylesheet" />
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #fefdf8; color: #1a0a2e; min-height: 100vh; }

        /* ─── Nature Navbar ─── */
        .nature-navbar {
            background: rgba(254,253,248,.96);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(45,106,79,.08);
            box-shadow: 0 1px 24px rgba(45,106,79,.06);
        }

        /* ─── Nature Hero ─── */
        .nature-hero-bg {
            background: linear-gradient(155deg,#fefdf8 0%,#f0f9f4 30%,#fdf5fb 65%,#f5f0ff 100%);
        }

        /* ─── Nature Glass ─── */
        .nature-glass {
            background: rgba(255,255,255,.75);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(45,106,79,.12);
        }

        /* ─── Nature Badge ─── */
        .nature-badge {
            background: linear-gradient(135deg,rgba(45,106,79,.1),rgba(201,168,76,.1));
            border: 1px solid rgba(45,106,79,.2);
            color: #2d6a4f;
        }

        /* ─── Gold Divider ─── */
        .gold-divider {
            height: 1px;
            background: linear-gradient(90deg,transparent,rgba(201,168,76,.4),rgba(201,168,76,.7),rgba(201,168,76,.4),transparent);
        }

        /* ─── Luxury Card ─── */
        .luxury-card {
            box-shadow: 0 2px 16px rgba(45,106,79,.06), 0 1px 4px rgba(201,168,76,.08);
            transition: box-shadow 0.3s ease;
        }
        .luxury-card:hover {
            box-shadow: 0 12px 40px rgba(45,106,79,.12), 0 4px 16px rgba(201,168,76,.1);
        }

        /* ─── Nature Footer ─── */
        .nature-footer {
            background: linear-gradient(160deg,#0d2a1a 0%,#1a0a2e 50%,#12102a 100%);
        }

        /* ─── Leaf Rain ─── */
        .leaf-rain { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        @keyframes leafFall {
            0%   { transform: translateY(-100px) translateX(0) rotate(0deg); opacity: 0; }
            10%  { opacity: 0.8; }
            90%  { opacity: 0.6; }
            100% { transform: translateY(110vh) translateX(var(--dx,60px)) rotate(var(--rot,580deg)); opacity: 0; }
        }
        @keyframes petalFall {
            0%   { transform: translateY(-80px) translateX(0) rotate(0deg) scale(1); opacity: 0; }
            10%  { opacity: 0.7; }
            50%  { transform: translateY(50vh) translateX(var(--dx2,40px)) rotate(180deg) scale(0.9); }
            90%  { opacity: 0.5; }
            100% { transform: translateY(110vh) translateX(calc(var(--dx2,40px)*-0.5)) rotate(360deg) scale(0.8); opacity: 0; }
        }
        .leaf-item  { position: absolute; top: -100px; animation: leafFall var(--dur,9s) var(--delay,0s) ease-in infinite; }
        .petal-item { position: absolute; top: -80px;  animation: petalFall var(--dur,12s) var(--delay,0s) ease-in-out infinite; }

        /* ─── Btn ─── */
        .btn-primary { display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#2d6a4f,#4a9e6a);color:#fff;font-weight:700;padding:12px 28px;border-radius:999px;border:none;cursor:pointer;transition:all .2s;text-decoration:none; }
        .btn-primary:hover { box-shadow:0 8px 24px rgba(45,106,79,.3);transform:translateY(-2px);color:#fff; }
        .btn-shopee { display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#f97316,#fb923c);color:#fff;font-weight:700;padding:12px 28px;border-radius:999px;border:none;cursor:pointer;transition:all .2s;text-decoration:none; }
        .btn-shopee:hover { box-shadow:0 8px 24px rgba(249,115,22,.35);transform:translateY(-2px);color:#fff; }
        .btn-admin { display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;font-weight:700;padding:10px 22px;border-radius:12px;border:none;cursor:pointer;transition:all .2s;text-decoration:none;font-size:.875rem; }
        .btn-admin:hover { box-shadow:0 8px 24px rgba(236,72,153,.3);transform:translateY(-1px);color:#fff; }

        /* ─── Form inputs ─── */
        .form-inp { width:100%;padding:12px 16px;background:#fdf7fb;border:1px solid #fbcfe8;border-radius:12px;font-size:.875rem;outline:none;transition:border-color .2s;font-family:inherit; }
        .form-inp:focus { border-color:#f472b6; }
        textarea.form-inp { resize:vertical; }
        select.form-inp { cursor:pointer; }

        /* ─── Admin Sidebar ─── */
        .admin-sidebar { width:240px;background:#fff;border-right:1px solid #fce7f3;min-height:100vh;display:flex;flex-direction:column;flex-shrink:0; }
        .admin-nav-item { display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;font-size:.875rem;font-weight:600;color:#6b7280;transition:all .15s;text-decoration:none;cursor:pointer;border:none;background:transparent;width:100%;text-align:left; }
        .admin-nav-item:hover { background:#fdf2f8;color:#ec4899; }
        .admin-nav-item.active { background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff; }

        /* ─── Badge ─── */
        .badge-green  { display:inline-flex;align-items:center;padding:2px 10px;border-radius:999px;font-size:.7rem;font-weight:700;background:#dcfce7;color:#15803d; }
        .badge-amber  { display:inline-flex;align-items:center;padding:2px 10px;border-radius:999px;font-size:.7rem;font-weight:700;background:#fef3c7;color:#92400e; }
        .badge-gray   { display:inline-flex;align-items:center;padding:2px 10px;border-radius:999px;font-size:.7rem;font-weight:700;background:#f3f4f6;color:#374151; }
        .badge-red    { display:inline-flex;align-items:center;padding:2px 10px;border-radius:999px;font-size:.7rem;font-weight:700;background:#fee2e2;color:#991b1b; }
        .badge-pink   { display:inline-flex;align-items:center;padding:2px 10px;border-radius:999px;font-size:.7rem;font-weight:700;background:#fce7f3;color:#be185d; }

        /* ─── Alert ─── */
        .alert-success { background:#dcfce7;border:1px solid #86efac;color:#15803d;padding:12px 16px;border-radius:12px;font-size:.875rem;font-weight:600;margin-bottom:16px; }
        .alert-error   { background:#fee2e2;border:1px solid #fca5a5;color:#991b1b;padding:12px 16px;border-radius:12px;font-size:.875rem;font-weight:600;margin-bottom:16px; }

        /* ─── Chat bubble ─── */
        .chat-bubble-guest { background:#fff;border-radius:18px 18px 18px 4px;padding:10px 14px;max-width:78%;box-shadow:0 1px 4px rgba(0,0,0,.06); }
        .chat-bubble-admin { background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;border-radius:18px 18px 4px 18px;padding:10px 14px;max-width:78%;box-shadow:0 2px 8px rgba(139,92,246,.25); }

        /* ─── Pagination ─── */
        .pagination { display:flex;align-items:center;gap:6px;flex-wrap:wrap; }
        .page-btn { display:inline-flex;align-items:center;justify-content:center;min-width:38px;height:38px;padding:0 12px;border-radius:10px;font-size:.8125rem;font-weight:600;border:1px solid #d1fae5;background:#fff;color:#374151;text-decoration:none;transition:all .15s; }
        .page-btn:hover { background:#ecfdf5;color:#065f46; }
        .page-btn.active { background:#2d6a4f;color:#fff;border-color:#2d6a4f; }
        .page-btn.disabled { opacity:.4;pointer-events:none; }

        /* ─── Responsive ─── */
        @media (max-width:768px) {
            .admin-sidebar { display:none; }
            .admin-sidebar.mobile-open { display:flex;position:fixed;inset:0;z-index:50;width:240px; }
        }

        /* ─── Sold-out overlay ─── */
        .sold-out-overlay { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.38); }
        .sold-out-text { color:#fff;font-weight:900;font-style:italic;transform:rotate(-30deg);text-shadow:0 2px 12px rgba(0,0,0,.6);letter-spacing:.12em;white-space:nowrap;text-transform:uppercase;font-size:clamp(18px,5vw,30px); }

        /* ─── Utility ─── */
        .line-clamp-2 { display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden; }
        .truncate { overflow:hidden;white-space:nowrap;text-overflow:ellipsis; }
        .container { max-width:1280px;margin:0 auto;padding:0 20px; }
        .sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0; }
    </style>
    @stack('head')
</head>
<body>
    @yield('body')

    {{-- Visitor Tracker --}}
    <script>
    (function() {
        var SESSION_KEY = 'sp_session';
        var isNew = !sessionStorage.getItem(SESSION_KEY);
        if (isNew) sessionStorage.setItem(SESSION_KEY, '1');

        var ua = navigator.userAgent;
        var device = /tablet|ipad/i.test(ua) ? 'Tablet' : /mobile|android|iphone/i.test(ua) ? 'Mobile' : 'Desktop';
        var ref = document.referrer;
        var refLabel = 'Direct';
        if (ref) {
            try {
                var h = new URL(ref).hostname.replace('www.','');
                refLabel = h || 'Direct';
            } catch(e) {}
        }

        fetch('/api/visitor/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
            body: JSON.stringify({ device: device, referrer: refLabel, is_new_session: isNew, product_id: null })
        }).catch(function(){});
    })();
    </script>

    @stack('scripts')
</body>
</html>
