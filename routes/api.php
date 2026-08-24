<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiChatController;
use App\Http\Controllers\ApiVisitorController;

// ── JSON API for Guest Chat (public) ─────────────────────────────────────────
Route::post('/chat/session',              [ApiChatController::class, 'createSession']);
Route::post('/chat/{sessionId}/message',  [ApiChatController::class, 'sendMessage']);
Route::get('/chat/{sessionId}/messages',  [ApiChatController::class, 'getMessages']);

// ── Visitor Tracking (public) ─────────────────────────────────────────────────
Route::post('/visitor/track', [ApiVisitorController::class, 'track']);
