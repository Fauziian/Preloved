<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin Login – SherlyPreloved</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
    <style>
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#fff7fb,#f5f0ff);}
        .form-inp{width:100%;padding:12px 16px;background:#fdf7fb;border:1px solid #fbcfe8;border-radius:12px;font-size:.875rem;outline:none;transition:border-color .2s;font-family:inherit;}
        .form-inp:focus{border-color:#f472b6;}
    </style>
</head>
<body>
    <div style="width:100%;max-width:400px;padding:20px;">
        <div style="background:#fff;border-radius:24px;box-shadow:0 16px 48px rgba(236,72,153,.1);border:1px solid #fce7f3;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#ec4899,#8b5cf6);padding:40px 32px;text-align:center;">
                <div style="width:64px;height:64px;background:rgba(255,255,255,.2);border-radius:20px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:1.8rem;">✦</div>
                <h1 style="font-size:1.5rem;font-weight:800;color:#fff;">SherlyPreloved</h1>
                <p style="color:rgba(255,255,255,.7);font-size:.875rem;margin-top:4px;">Admin Panel · Masuk untuk mengelola produk</p>
            </div>
            <div style="padding:32px;">
                @if($errors->has('login'))
                <div style="background:#fee2e2;border:1px solid #fca5a5;color:#991b1b;padding:12px 16px;border-radius:12px;font-size:.875rem;font-weight:600;margin-bottom:16px;">❌ {{ $errors->first('login') }}</div>
                @endif

                <form method="POST" action="{{ route('admin.login.post') }}">
                    @csrf
                    <div style="margin-bottom:18px;">
                        <label style="display:block;font-size:.75rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Username</label>
                        <input type="text" name="username" value="{{ old('username') }}" required placeholder="admin" class="form-inp" />
                        @error('username')<p style="color:#ef4444;font-size:.75rem;margin-top:4px;">{{ $message }}</p>@enderror
                    </div>
                    <div style="margin-bottom:24px;position:relative;">
                        <label style="display:block;font-size:.75rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Password</label>
                        <input type="password" name="password" id="pw-field" required placeholder="••••••••••" class="form-inp" style="padding-right:44px;" />
                        <button type="button" onclick="var f=document.getElementById('pw-field');f.type=f.type==='password'?'text':'password';" style="position:absolute;right:12px;top:34px;background:none;border:none;cursor:pointer;font-size:.85rem;color:#f472b6;">👁</button>
                    </div>
                    <button type="submit" style="width:100%;padding:14px;background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;font-weight:800;font-size:.875rem;border:none;border-radius:14px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;" onmouseenter="this.style.boxShadow='0 8px 24px rgba(236,72,153,.35)'" onmouseleave="this.style.boxShadow='none'">
                        → Masuk ke Admin Panel
                    </button>
                </form>

                <div style="text-align:center;margin-top:20px;">
                    <a href="{{ route('catalog') }}" style="font-size:.8125rem;color:#9ca3af;text-decoration:none;" onmouseenter="this.style.color='#ec4899'" onmouseleave="this.style.color='#9ca3af'">← Kembali ke Website</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
