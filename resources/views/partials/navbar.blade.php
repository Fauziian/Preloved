<nav class="nature-navbar sticky top-0 z-40">
    <div class="container" style="height:68px;display:flex;align-items:center;justify-content:space-between;">
        <a href="{{ route('catalog') }}" style="display:flex;align-items:center;gap:10px;text-decoration:none;" id="logo-btn-nav">
            <div style="width:36px;height:36px;border-radius:14px;background:linear-gradient(135deg,#10b981,#2d6a4f);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(45,106,79,.3);">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="white"/></svg>
            </div>
            <span style="font-weight:800;font-size:1.2rem;color:#1a0a2e;">Sherly<span style="background:linear-gradient(135deg,#ec4899,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Preloved</span>
                <span style="display:block;font-size:9px;font-weight:600;letter-spacing:.2em;color:rgba(45,106,79,.7);text-transform:uppercase;margin-top:-2px;">✦ Nature Collection ✦</span>
            </span>
        </a>
        <div class="nav-links-partial" style="display:flex;align-items:center;gap:28px;">
            <a href="{{ route('catalog') }}" style="font-size:.875rem;font-weight:600;color:{{ request()->routeIs('catalog') ? '#2d6a4f' : '#6b7280' }};text-decoration:none;">Katalog</a>
            <a href="{{ route('about') }}" style="font-size:.875rem;font-weight:600;color:{{ request()->routeIs('about') ? '#2d6a4f' : '#6b7280' }};text-decoration:none;">Tentang</a>
            <a href="https://s.shopee.co.id/gOm3vwsWI?share_channel_code=1" target="_blank" rel="noopener" class="btn-shopee" style="font-size:.8125rem;padding:9px 20px;">
                🛍 Shopee Kami
            </a>
        </div>
        <button id="nav-toggle-partial" style="display:none;background:none;border:none;cursor:pointer;padding:8px;">
            <svg width="22" height="22" fill="none" stroke="#2d6a4f" stroke-width="2.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
    </div>
    <div id="mobile-menu-partial" style="display:none;background:rgba(254,253,248,.97);border-top:1px solid rgba(45,106,79,.08);padding:16px 20px;flex-direction:column;gap:12px;">
        <a href="{{ route('catalog') }}" style="font-size:.9rem;font-weight:600;color:#374151;text-decoration:none;">Katalog</a>
        <a href="{{ route('about') }}" style="font-size:.9rem;font-weight:600;color:#374151;text-decoration:none;">Tentang</a>
        <a href="https://s.shopee.co.id/gOm3vwsWI?share_channel_code=1" target="_blank" rel="noopener" class="btn-shopee" style="font-size:.8125rem;padding:10px 20px;width:fit-content;">🛍 Shopee Kami</a>
    </div>
</nav>

<script>
(function(){
    var toggle = document.getElementById('nav-toggle-partial');
    var links  = document.querySelector('.nav-links-partial');
    var menu   = document.getElementById('mobile-menu-partial');
    if (!toggle) return;
    toggle.addEventListener('click', function() { menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex'; });
    function check() {
        if (window.innerWidth < 768) { toggle.style.display='block'; links.style.display='none'; }
        else { toggle.style.display='none'; links.style.display='flex'; menu.style.display='none'; }
    }
    check();
    window.addEventListener('resize', check);
})();
</script>
