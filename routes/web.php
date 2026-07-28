<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\VisitorController;

Route::prefix('api')->group(function () {
    // Products
    Route::get('products', [ProductController::class, 'index']);
    Route::post('products', [ProductController::class, 'store']);
    Route::delete('products/{id}', [ProductController::class, 'destroy']);

    // Chats
    Route::get('chats', [ChatController::class, 'index']);
    Route::post('chats', [ChatController::class, 'store']);
    Route::post('chats/{sessionId}/message', [ChatController::class, 'appendMessage']);
    Route::delete('chats/{sessionId}', [ChatController::class, 'destroy']);

    // Visitors
    Route::get('visitors', [VisitorController::class, 'index']);
    Route::post('visitors', [VisitorController::class, 'store']);
});

Route::fallback(function () {
    $path = public_path('app/index.html');
    if (!file_exists($path)) {
        return response("Frontend not built yet. Please run 'npm run build' first.", 404);
    }
    return file_get_contents($path);
});

