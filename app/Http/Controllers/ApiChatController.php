<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use Illuminate\Http\Request;

class ApiChatController extends Controller
{
    /** Guest creates or fetches their chat session */
    public function createSession(Request $request)
    {
        $request->validate(['session_id' => 'required|string', 'guest_label' => 'required|string']);

        $chat = Chat::firstOrCreate(
            ['session_id' => $request->session_id],
            [
                'guest_label'      => $request->guest_label,
                'messages'         => [],
                'last_activity'    => round(microtime(true) * 1000),
                'unread_by_admin'  => 0,
            ]
        );

        return response()->json([
            'sessionId'      => $chat->session_id,
            'guestLabel'     => $chat->guest_label,
            'messages'       => $chat->messages ?? [],
            'lastActivity'   => $chat->last_activity,
            'unreadByAdmin'  => $chat->unread_by_admin,
        ]);
    }

    /** Guest sends a message */
    public function sendMessage(Request $request, $sessionId)
    {
        $request->validate(['text' => 'required|string|max:2000']);

        $chat = Chat::where('session_id', $sessionId)->first();
        if (!$chat) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        $messages   = $chat->messages ?? [];
        $messages[] = [
            'id'   => uniqid('guest_', true),
            'from' => 'guest',
            'text' => $request->text,
            'ts'   => round(microtime(true) * 1000),
        ];

        $chat->update([
            'messages'        => $messages,
            'last_activity'   => round(microtime(true) * 1000),
            'unread_by_admin' => $chat->unread_by_admin + 1,
        ]);

        return response()->json(['status' => 'ok', 'messages' => $messages]);
    }

    /** Guest polls for new messages (includes admin replies) */
    public function getMessages($sessionId)
    {
        $chat = Chat::where('session_id', $sessionId)->first();
        if (!$chat) {
            return response()->json(['messages' => []]);
        }
        return response()->json(['messages' => $chat->messages ?? []]);
    }
}
