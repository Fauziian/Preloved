<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>@yield('title', 'Admin') – SherlyPreloved</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <style>
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#fdf7fb;color:#1a0a2e;min-height:100vh;}
        .form-inp{width:100%;padding:10px 14px;background:#fdf7fb;border:1px solid #fbcfe8;border-radius:10px;font-size:.875rem;outline:none;transition:border-color .2s;font-family:inherit;}
        .form-inp:focus{border-color:#f472b6;}
        textarea.form-inp{resize:vertical;}
        select.form-inp{cursor:pointer;}
        .btn-primary{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;font-weight:700;padding:10px 22px;border-radius:12px;border:none;cursor:pointer;transition:all .2s;text-decoration:none;font-size:.875rem;}
        .btn-primary:hover{box-shadow:0 8px 24px rgba(236,72,153,.3);transform:translateY(-1px);color:#fff;}
        .btn-danger{display:inline-flex;align-items:center;gap:6px;background:#fee2e2;color:#991b1b;font-weight:700;padding:8px 16px;border-radius:10px;border:none;cursor:pointer;font-size:.8125rem;transition:all .15s;text-decoration:none;}
        .btn-danger:hover{background:#fca5a5;color:#7f1d1d;}
        .btn-ghost{display:inline-flex;align-items:center;gap:6px;background:#f3f4f6;color:#374151;font-weight:700;padding:8px 16px;border-radius:10px;border:none;cursor:pointer;font-size:.8125rem;transition:all .15s;text-decoration:none;}
        .btn-ghost:hover{background:#e5e7eb;}
        .badge-green{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:.6875rem;font-weight:700;background:#dcfce7;color:#15803d;}
        .badge-amber{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:.6875rem;font-weight:700;background:#fef3c7;color:#92400e;}
        .badge-gray{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:.6875rem;font-weight:700;background:#f3f4f6;color:#374151;}
        .badge-red{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:.6875rem;font-weight:700;background:#fee2e2;color:#991b1b;}
        .alert-success{background:#dcfce7;border:1px solid #86efac;color:#15803d;padding:12px 16px;border-radius:12px;font-size:.875rem;font-weight:600;margin-bottom:16px;}
        .alert-error{background:#fee2e2;border:1px solid #fca5a5;color:#991b1b;padding:12px 16px;border-radius:12px;font-size:.875rem;font-weight:600;margin-bottom:16px;}
        .card{background:#fff;border-radius:16px;border:1px solid #fce7f3;box-shadow:0 2px 8px rgba(0,0,0,.04);}
        .sidebar{width:230px;background:#fff;border-right:1px solid #fce7f3;min-height:100vh;display:flex;flex-direction:column;flex-shrink:0;}
        .nav-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;font-size:.8125rem;font-weight:600;color:#6b7280;transition:all .15s;text-decoration:none;border:none;background:transparent;width:100%;text-align:left;cursor:pointer;position:relative;}
        .nav-item:hover{background:#fdf2f8;color:#ec4899;}
        .nav-item.active{background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;}
        .main-content{flex:1;padding:32px;overflow:auto;min-width:0;}
        @media(max-width:900px){
            .sidebar{display:none;position:fixed;inset:0;z-index:50;width:230px;max-width:80vw;}
            .sidebar.open{display:flex;}
            .mobile-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:49;}
            .mobile-overlay.open{display:block;}
            .main-content{padding:20px 16px;}
        }
        .stat-card{padding:20px;border-radius:16px;background:#fff;border:1px solid #fce7f3;}
        .table-wrap{overflow-x:auto;}
        table{width:100%;border-collapse:collapse;}
        th{text-align:left;padding:10px 16px;font-size:.6875rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;background:#fdf2f8;border-bottom:1px solid #fce7f3;}
        td{padding:12px 16px;border-bottom:1px solid #fdf2f8;font-size:.8125rem;vertical-align:middle;}
        tr:last-child td{border-bottom:none;}
        tr:hover td{background:#fdf9fd;}
        .chat-bubble-guest{background:#fff;border-radius:18px 18px 18px 4px;padding:10px 14px;max-width:78%;box-shadow:0 1px 4px rgba(0,0,0,.06);font-size:.8125rem;line-height:1.5;}
        .chat-bubble-admin{background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;border-radius:18px 18px 4px 18px;padding:10px 14px;max-width:78%;font-size:.8125rem;line-height:1.5;}
    </style>
    @stack('head')
</head>
<body style="display:flex;min-height:100vh;">

{{-- Mobile overlay --}}
<div id="mobile-overlay" class="mobile-overlay" onclick="closeSidebar()"></div>

{{-- Sidebar --}}
<nav class="sidebar" id="admin-sidebar">
    <div style="padding:20px 16px;border-bottom:1px solid #fce7f3;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#ec4899,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:.8rem;">✦</div>
            <span style="font-weight:800;font-size:.9rem;">SherlyPreloved</span>
        </div>
        <button onclick="closeSidebar()" style="display:none;background:none;border:none;cursor:pointer;font-size:1.2rem;color:#9ca3af;" id="sidebar-close">✕</button>
    </div>
    <div style="padding:8px 10px 4px;"><span style="font-size:.65rem;font-weight:700;background:#dcfce7;color:#15803d;padding:2px 8px;border-radius:999px;text-transform:uppercase;">Admin</span></div>
    <nav style="flex:1;padding:10px;">
        @php $cur = request()->routeIs('admin.*') ? request()->route()->getName() : ''; @endphp
        <a href="{{ route('admin.dashboard') }}" class="nav-item {{ Str::startsWith($cur,'admin.dashboard') ? 'active' : '' }}">📊 Dashboard</a>
        <a href="{{ route('admin.products') }}" class="nav-item {{ Str::startsWith($cur,'admin.products') ? 'active' : '' }}">📦 Produk</a>
        <a href="{{ route('admin.visitors') }}" class="nav-item {{ Str::startsWith($cur,'admin.visitors') ? 'active' : '' }}">👥 Pengunjung</a>
        <a href="{{ route('admin.chat') }}" class="nav-item {{ Str::startsWith($cur,'admin.chat') ? 'active' : '' }}" style="position:relative;">
            💬 Chat Tamu
            @if(isset($unreadChats) && $unreadChats > 0)
            <span style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:#ec4899;color:#fff;font-size:.6rem;font-weight:700;border-radius:999px;min-width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;padding:0 4px;">{{ $unreadChats }}</span>
            @endif
        </a>
    </nav>
    <div style="padding:10px;border-top:1px solid #fce7f3;">
        <a href="{{ route('catalog') }}" class="nav-item">🌐 Lihat Website</a>
        <form method="POST" action="{{ route('admin.logout') }}">
            @csrf
            <button type="submit" class="nav-item" style="color:#ef4444;" onmouseenter="this.style.background='#fff1f2'" onmouseleave="this.style.background='transparent'">🚪 Keluar</button>
        </form>
    </div>
</nav>

{{-- Main --}}
<div style="flex:1;display:flex;flex-direction:column;min-width:0;">
    {{-- Top bar --}}
    <div style="background:#fff;border-bottom:1px solid #fce7f3;padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:12px;">
            <button onclick="openSidebar()" id="sidebar-toggle" style="display:none;background:none;border:none;cursor:pointer;padding:4px;" aria-label="Menu">
                <svg width="22" height="22" fill="none" stroke="#374151" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <h2 style="font-size:1rem;font-weight:700;color:#1a0a2e;">@yield('page-title', 'Admin Panel')</h2>
        </div>
        <span style="font-size:.8125rem;color:#9ca3af;">Admin Sherly</span>
    </div>

    <div class="main-content">
        @if(session('success'))
        <div class="alert-success">✅ {{ session('success') }}</div>
        @endif
        @if($errors->has('login'))
        <div class="alert-error">❌ {{ $errors->first('login') }}</div>
        @endif

        @yield('content')
    </div>
</div>

<script>
function openSidebar(){
    document.getElementById('admin-sidebar').classList.add('open');
    document.getElementById('mobile-overlay').classList.add('open');
    document.getElementById('sidebar-close').style.display='block';
}
function closeSidebar(){
    document.getElementById('admin-sidebar').classList.remove('open');
    document.getElementById('mobile-overlay').classList.remove('open');
    document.getElementById('sidebar-close').style.display='none';
}
function checkLayout(){
    var btn=document.getElementById('sidebar-toggle');
    if(!btn)return;
    if(window.innerWidth<=900){btn.style.display='block';}
    else{btn.style.display='none';closeSidebar();}
}
checkLayout();
window.addEventListener('resize',checkLayout);
</script>

@stack('scripts')
</body>
</html>
