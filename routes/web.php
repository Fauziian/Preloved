<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\VisitorController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PageController;

// ── Public Pages ─────────────────────────────────────────────────────────────
Route::get('/',          [PageController::class, 'catalog'])->name('catalog');
Route::get('/produk/{id}', [PageController::class, 'detail'])->name('product.detail');
Route::get('/tentang',   [PageController::class, 'about'])->name('about');

// ── Admin Auth ────────────────────────────────────────────────────────────────
Route::get('/admin/login',  [AdminController::class, 'loginForm'])->name('admin.login');
Route::post('/admin/login', [AdminController::class, 'login'])->name('admin.login.post');
Route::post('/admin/logout', [AdminController::class, 'logout'])->name('admin.logout');

// ── Admin Panel (protected) ───────────────────────────────────────────────────
Route::prefix('admin')->name('admin.')->middleware('auth.admin')->group(function () {
    Route::get('/dashboard',   [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/products',    [AdminController::class, 'products'])->name('products');
    Route::get('/products/add',[AdminController::class, 'addProduct'])->name('products.add');
    Route::post('/products',   [ProductController::class, 'store'])->name('products.store');
    Route::get('/products/{id}/edit', [AdminController::class, 'editProduct'])->name('products.edit');
    Route::put('/products/{id}',      [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{id}',   [ProductController::class, 'destroy'])->name('products.destroy');
    Route::patch('/products/{id}/toggle', [ProductController::class, 'toggle'])->name('products.toggle');
    Route::get('/visitors',    [AdminController::class, 'visitors'])->name('visitors');
    Route::post('/visitors/reset', [VisitorController::class, 'reset'])->name('visitors.reset');
    Route::get('/chat',        [AdminController::class, 'chat'])->name('chat');
    Route::post('/chat/{sessionId}/reply', [ChatController::class, 'reply'])->name('chat.reply');
    Route::delete('/chat/{sessionId}',     [ChatController::class, 'destroy'])->name('chat.destroy');
    Route::post('/chat/{sessionId}/read',  [ChatController::class, 'markRead'])->name('chat.read');
});
