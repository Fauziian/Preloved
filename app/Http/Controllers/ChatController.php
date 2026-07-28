<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function index()
    {
        // Return chats mapped to frontend naming (sessionId, guestLabel, unreadByAdmin, lastActivity, messages)
        $chats = Chat::all()->map(function ($chat) {
            return [
                'sessionId' => $chat->session_id,
                'guestLabel' => $chat->guest_label,
                'messages' => $chat->messages ?? [],
                'lastActivity' => $chat->last_activity,
                'unreadByAdmin' => $chat->unread_by_admin,
            ];
        });

        return response()->json($chats);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'sessionId' => 'required|string',
            'guestLabel' => 'required|string',
            'messages' => 'nullable|array',
            'lastActivity' => 'required|numeric',
            'unreadByAdmin' => 'required|integer',
        ]);

        $chat = Chat::updateOrCreate(
            ['session_id' => $data['sessionId']],
            [
                'guest_label' => $data['guestLabel'],
                'messages' => $data['messages'] ?? [],
                'last_activity' => $data['lastActivity'],
                'unread_by_admin' => $data['unreadByAdmin'],
            ]
        );

        return response()->json([
            'status' => 'success',
            'chat' => [
                'sessionId' => $chat->session_id,
                'guestLabel' => $chat->guest_label,
                'messages' => $chat->messages,
                'lastActivity' => $chat->last_activity,
                'unreadByAdmin' => $chat->unread_by_admin,
            ]
        ]);
    }

    public function appendMessage(Request $request, $sessionId)
    {
        $message = $request->validate([
            'id' => 'required|string',
            'from' => 'required|string|in:guest,admin',
            'text' => 'required|string',
            'ts' => 'required|numeric',
        ]);

        $chat = Chat::where('session_id', $sessionId)->first();

        if (!$chat) {
            $chat = Chat::create([
                'session_id' => $sessionId,
                'guest_label' => 'Guest #' . substr($sessionId, -4),
                'messages' => [$message],
                'last_activity' => time() * 1000,
                'unread_by_admin' => $message['from'] === 'guest' ? 1 : 0,
            ]);
        } else {
            $messages = $chat->messages ?? [];
            
            // Check if message already exists
            $exists = false;
            foreach ($messages as $m) {
                if (isset($m['id']) && $m['id'] === $message['id']) {
                    $exists = true;
                    break;
                }
            }

            if (!$exists) {
                $messages[] = $message;
            }

            $unread = $chat->unread_by_admin;
            if ($message['from'] === 'guest') {
                $unread += 1;
            }

            $chat->update([
                'messages' => $messages,
                'last_activity' => time() * 1000,
                'unread_by_admin' => $unread,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'chat' => [
                'sessionId' => $chat->session_id,
                'guestLabel' => $chat->guest_label,
                'messages' => $chat->messages,
                'lastActivity' => $chat->last_activity,
                'unreadByAdmin' => $chat->unread_by_admin,
            ]
        ]);
    }

    public function destroy($sessionId)
    {
        $chat = Chat::where('session_id', $sessionId)->first();
        if ($chat) {
            $chat->delete();
        }
        return response()->json(['status' => 'success']);
    }
}
