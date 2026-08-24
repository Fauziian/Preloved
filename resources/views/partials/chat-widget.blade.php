{{-- Guest Chat Widget --}}
<div id="chat-fab-container" style="position:fixed;bottom:24px;right:24px;z-index:999;">
    <button id="chat-fab" onclick="toggleChat()" style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#ec4899);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(139,92,246,.4);display:flex;align-items:center;justify-content:center;transition:all .2s;position:relative;" title="Chat dengan kami">
        <svg id="chat-icon" width="24" height="24" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <svg id="close-icon" width="22" height="22" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24" style="display:none;"><path d="M18 6L6 18M6 6l12 12"/></svg>
        <span id="chat-unread-dot" style="display:none;position:absolute;top:-4px;right:-4px;width:14px;height:14px;background:#ef4444;border-radius:50%;border:2px solid #fff;"></span>
    </button>

    <div id="chat-box" style="display:none;position:absolute;bottom:68px;right:0;width:320px;height:460px;background:#fff;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,.16);border:1px solid #fce7f3;overflow:hidden;flex-direction:column;">
        {{-- Header --}}
        <div style="background:linear-gradient(135deg,#8b5cf6,#ec4899);padding:16px;display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;background:rgba(255,255,255,.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">💬</div>
            <div>
                <p style="color:#fff;font-weight:700;font-size:.9rem;">SherlyPreloved</p>
                <p style="color:rgba(255,255,255,.75);font-size:.7rem;display:flex;align-items:center;gap:4px;">
                    <span style="width:7px;height:7px;background:#4ade80;border-radius:50%;display:inline-block;animation:pulse 2s infinite;"></span>
                    Siap melayani
                </p>
            </div>
        </div>
        {{-- Messages --}}
        <div id="chat-messages" style="flex:1;overflow-y:auto;padding:14px;background:#f9f4fd;display:flex;flex-direction:column;gap:10px;min-height:0;">
            <div style="text-align:center;font-size:.75rem;color:#9ca3af;padding:8px 0;">👋 Halo! Ada yang bisa kami bantu?</div>
        </div>
        {{-- Input --}}
        <div style="background:#fff;border-top:1px solid #fce7f3;padding:12px;display:flex;gap:8px;">
            <input id="chat-input" type="text" placeholder="Ketik pesan..." maxlength="500"
                style="flex:1;border:1px solid #fbcfe8;border-radius:12px;padding:8px 12px;font-size:.8125rem;outline:none;font-family:inherit;transition:border-color .15s;"
                onfocus="this.style.borderColor='#f472b6'" onblur="this.style.borderColor='#fbcfe8'"
                onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChatMsg();}" />
            <button onclick="sendChatMsg()" style="width:36px;height:36px;background:linear-gradient(135deg,#ec4899,#8b5cf6);border:none;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <svg width="14" height="14" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
        </div>
    </div>
</div>

<style>
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
</style>

<script>
var CHAT_SID_KEY = 'sp_chat_sid';
var CHAT_LABEL_KEY = 'sp_chat_label';
var chatOpen = false;
var chatSessionId = null;
var pollInterval = null;
var lastMsgCount = 0;

function toggleChat() {
    chatOpen = !chatOpen;
    var box = document.getElementById('chat-box');
    var ci = document.getElementById('chat-icon');
    var xi = document.getElementById('close-icon');
    box.style.display = chatOpen ? 'flex' : 'none';
    box.style.flexDirection = 'column';
    ci.style.display = chatOpen ? 'none' : 'block';
    xi.style.display = chatOpen ? 'block' : 'none';
    document.getElementById('chat-unread-dot').style.display = 'none';
    if (chatOpen) { initChat(); document.getElementById('chat-input').focus(); }
    else { stopPoll(); }
}

function initChat() {
    chatSessionId = sessionStorage.getItem(CHAT_SID_KEY);
    var label = sessionStorage.getItem(CHAT_LABEL_KEY);
    if (!chatSessionId) {
        chatSessionId = 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
        label = 'Guest #' + Math.floor(1000 + Math.random() * 9000);
        sessionStorage.setItem(CHAT_SID_KEY, chatSessionId);
        sessionStorage.setItem(CHAT_LABEL_KEY, label);
    }
    fetch('/api/chat/session', {
        method: 'POST',
        headers: {'Content-Type':'application/json','X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content},
        body: JSON.stringify({session_id: chatSessionId, guest_label: label})
    }).then(r => r.json()).then(function(data) {
        if (data.messages && data.messages.length > 0) {
            var msgs = document.getElementById('chat-messages');
            msgs.innerHTML = '<div style="text-align:center;font-size:.75rem;color:#9ca3af;padding:8px 0;">👋 Halo! Ada yang bisa kami bantu?</div>';
            data.messages.forEach(appendMsg);
            lastMsgCount = data.messages.length;
        }
        startPoll();
    }).catch(function(){});
}

function sendChatMsg() {
    var input = document.getElementById('chat-input');
    var text = input.value.trim();
    if (!text || !chatSessionId) return;
    input.value = '';
    appendMsg({from:'guest', text: text, ts: Date.now()});
    fetch('/api/chat/' + chatSessionId + '/message', {
        method: 'POST',
        headers: {'Content-Type':'application/json','X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content},
        body: JSON.stringify({text: text})
    }).catch(function(){});
}

function appendMsg(m) {
    var msgs = document.getElementById('chat-messages');
    var div = document.createElement('div');
    div.style.cssText = 'display:flex;gap:6px;align-items:flex-end;' + (m.from==='admin' ? 'flex-direction:row-reverse;' : '');
    var avatar = document.createElement('div');
    avatar.style.cssText = 'width:22px;height:22px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;color:#fff;' + (m.from==='admin' ? 'background:linear-gradient(135deg,#ec4899,#8b5cf6);' : 'background:#d1d5db;');
    avatar.textContent = m.from === 'admin' ? 'A' : '✦';
    var bubble = document.createElement('div');
    bubble.className = m.from === 'admin' ? 'chat-bubble-admin' : 'chat-bubble-guest';
    var time = new Date(m.ts).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
    bubble.innerHTML = '<p style="font-size:.8125rem;line-height:1.5;">' + escHtml(m.text) + '</p><p style="font-size:.65rem;margin-top:3px;opacity:.6;text-align:right;">' + time + '</p>';
    div.appendChild(avatar); div.appendChild(bubble);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function startPoll() {
    stopPoll();
    pollInterval = setInterval(function() {
        if (!chatSessionId || !chatOpen) return;
        fetch('/api/chat/' + chatSessionId + '/messages').then(r=>r.json()).then(function(data) {
            var msgs = data.messages || [];
            if (msgs.length > lastMsgCount) {
                var newMsgs = msgs.slice(lastMsgCount);
                var hasAdminMsg = newMsgs.some(function(m){return m.from==='admin';});
                var msgEl = document.getElementById('chat-messages');
                msgEl.innerHTML = '<div style="text-align:center;font-size:.75rem;color:#9ca3af;padding:8px 0;">👋 Halo! Ada yang bisa kami bantu?</div>';
                msgs.forEach(appendMsg);
                lastMsgCount = msgs.length;
                if (hasAdminMsg && !chatOpen) {
                    document.getElementById('chat-unread-dot').style.display = 'block';
                }
            }
        }).catch(function(){});
    }, 5000);
}

function stopPoll() { if (pollInterval) { clearInterval(pollInterval); pollInterval = null; } }
</script>
