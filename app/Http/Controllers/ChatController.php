<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function reply(Request $request, $sessionId)
    {
        $request->validate(['message' => 'required|string|max:2000']);

        $chat = Chat::where('session_id', $sessionId)->firstOrFail();

        $messages   = $chat->messages ?? [];
        $messages[] = [
            'id'   => uniqid('admin_', true),
            'from' => 'admin',
            'text' => $request->message,
            'ts'   => round(microtime(true) * 1000),
        ];

        $chat->update([
            'messages'         => $messages,
            'last_activity'    => round(microtime(true) * 1000),
            'unread_by_admin'  => 0,
        ]);

        return redirect()->route('admin.chat')->with('success', 'Pesan berhasil dikirim.');
    }

    public function destroy($sessionId)
    {
        Chat::where('session_id', $sessionId)->delete();
        return redirect()->route('admin.chat')->with('success', 'Percakapan dihapus.');
    }

    public function markRead($sessionId)
    {
        Chat::where('session_id', $sessionId)->update(['unread_by_admin' => 0]);
        return response()->json(['status' => 'ok']);
    }
}
