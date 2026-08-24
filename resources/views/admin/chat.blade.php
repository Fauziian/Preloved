@extends('layouts.admin')
@section('title', 'Chat Tamu')
@section('page-title', 'Chat Tamu')

@section('content')
<div style="margin-bottom:20px;">
    <h1 style="font-size:1.5rem;font-weight:800;color:#1a0a2e;">Chat Tamu</h1>
    <p style="font-size:.875rem;color:#9ca3af;margin-top:4px;">{{ $sessions->count() }} percakapan · Balas pesan dari pengunjung website</p>
</div>

@if($sessions->isEmpty())
<div class="card" style="padding:48px;text-align:center;">
    <div style="font-size:2.5rem;margin-bottom:16px;">💬</div>
    <p style="color:#d1d5db;font-size:.9rem;">Belum ada pesan dari tamu</p>
</div>
@else

<div style="display:grid;grid-template-columns:300px 1fr;gap:16px;height:calc(100vh - 140px);min-height:400px;">
    {{-- Session list --}}
    <div class="card" style="overflow:hidden;display:flex;flex-direction:column;">
        <div style="padding:12px 16px;border-bottom:1px solid #fdf2f8;display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:.8125rem;font-weight:700;color:#1a0a2e;">Percakapan</span>
            <span style="font-size:.7rem;color:#9ca3af;">{{ $sessions->count() }} total</span>
        </div>
        <div style="overflow-y:auto;flex:1;">
            @foreach($sessions as $s)
            @php $lastMsg = ($s->messages && count($s->messages)) ? $s->messages[count($s->messages)-1] : null; @endphp
            <div class="session-item" data-sid="{{ $s->session_id }}" onclick="openSession('{{ $s->session_id }}')"
                style="padding:14px 16px;border-bottom:1px solid #fdf2f8;cursor:pointer;transition:background .1s;{{ $s->unread_by_admin > 0 ? 'background:#fdf2f8;' : '' }}">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;font-weight:700;flex-shrink:0;">
                        {{ strtoupper(substr($s->guest_label,-2)) }}
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
                            <span style="font-size:.8125rem;font-weight:{{ $s->unread_by_admin ? '700' : '600' }};color:#1a0a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;">{{ $s->guest_label }}</span>
                            @if($s->unread_by_admin > 0)
                            <span style="background:#ec4899;color:#fff;font-size:.6rem;font-weight:700;border-radius:999px;min-width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;padding:0 4px;flex-shrink:0;">{{ $s->unread_by_admin }}</span>
                            @endif
                        </div>
                        <p style="font-size:.7rem;color:#9ca3af;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ $lastMsg ? Str::limit($lastMsg['text'],40) : 'Belum ada pesan' }}</p>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
    </div>

    {{-- Chat detail --}}
    <div id="chat-detail" class="card" style="overflow:hidden;display:flex;flex-direction:column;">
        <div style="padding:48px;text-align:center;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;" id="chat-placeholder">
            <div style="font-size:2rem;margin-bottom:12px;">👈</div>
            <p style="color:#d1d5db;font-size:.9rem;">Pilih percakapan untuk melihat detail</p>
        </div>

        <div id="chat-content" style="display:none;flex-direction:column;height:100%;">
            {{-- Header --}}
            <div id="chat-header" style="padding:14px 20px;border-bottom:1px solid #fdf2f8;display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div id="chat-avatar" style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.75rem;font-weight:700;"></div>
                    <div>
                        <p id="chat-guest-name" style="font-size:.875rem;font-weight:700;color:#1a0a2e;"></p>
                        <p id="chat-msg-count" style="font-size:.7rem;color:#9ca3af;"></p>
                    </div>
                </div>
                <form method="POST" id="delete-form" onsubmit="return confirm('Hapus percakapan ini?')">
                    @csrf @method('DELETE')
                    <button type="submit" class="btn-danger">🗑 Hapus</button>
                </form>
            </div>
            {{-- Messages --}}
            <div id="chat-messages" style="flex:1;overflow-y:auto;padding:16px;background:#f9f4fd;display:flex;flex-direction:column;gap:10px;min-height:0;"></div>
            {{-- Reply --}}
            <form id="reply-form" method="POST" style="padding:12px 16px;border-top:1px solid #fdf2f8;display:flex;gap:8px;background:#fff;">
                @csrf
                <input type="text" name="message" id="reply-input" required placeholder="Balas pesan..." maxlength="2000"
                    style="flex:1;border:1px solid #fbcfe8;border-radius:12px;padding:9px 14px;font-size:.8125rem;outline:none;font-family:inherit;transition:border-color .15s;"
                    onfocus="this.style.borderColor='#f472b6'" onblur="this.style.borderColor='#fbcfe8'" />
                <button type="submit" style="padding:0 18px;background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;font-size:.8125rem;">Kirim</button>
            </form>
        </div>
    </div>
</div>
@endif

@push('scripts')
<script>
var sessions = @json($sessions->keyBy('session_id'));

function openSession(sid) {
    // Mark active
    document.querySelectorAll('.session-item').forEach(function(el){
        el.style.background = el.dataset.sid === sid ? '#fdf2f8' : '';
    });

    var s = sessions[sid];
    if (!s) return;

    // Update header
    document.getElementById('chat-avatar').textContent = s.guest_label.slice(-2).toUpperCase();
    document.getElementById('chat-guest-name').textContent = s.guest_label;
    document.getElementById('chat-msg-count').textContent = (s.messages ? s.messages.length : 0) + ' pesan';
    document.getElementById('delete-form').action = '/admin/chat/' + sid;
    document.getElementById('reply-form').action = '/admin/chat/' + sid + '/reply';

    // Messages
    var msgs = document.getElementById('chat-messages');
    msgs.innerHTML = '';
    if (s.messages && s.messages.length > 0) {
        s.messages.forEach(function(m) {
            var isAdmin = m.from === 'admin';
            var div = document.createElement('div');
            div.style.cssText = 'display:flex;gap:6px;align-items:flex-end;' + (isAdmin ? 'flex-direction:row-reverse;' : '');
            var av = document.createElement('div');
            av.style.cssText = 'width:24px;height:24px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;color:#fff;' + (isAdmin ? 'background:linear-gradient(135deg,#ec4899,#8b5cf6);' : 'background:#d1d5db;');
            av.textContent = isAdmin ? 'A' : s.guest_label.slice(-2).toUpperCase();
            var bubble = document.createElement('div');
            bubble.className = isAdmin ? 'chat-bubble-admin' : 'chat-bubble-guest';
            var time = new Date(m.ts).toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'});
            bubble.innerHTML = '<p>' + esc(m.text) + '</p><p style="font-size:.6rem;margin-top:3px;opacity:.6;text-align:right;">' + time + '</p>';
            div.appendChild(av); div.appendChild(bubble);
            msgs.appendChild(div);
        });
    } else {
        msgs.innerHTML = '<p style="text-align:center;color:#d1d5db;font-size:.8rem;padding:16px;">Belum ada pesan</p>';
    }
    msgs.scrollTop = msgs.scrollHeight;

    document.getElementById('chat-placeholder').style.display = 'none';
    var cc = document.getElementById('chat-content');
    cc.style.display = 'flex';
    cc.style.flexDirection = 'column';
    cc.style.height = '100%';

    document.getElementById('reply-input').focus();
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
</script>
@endpush

@endsection
