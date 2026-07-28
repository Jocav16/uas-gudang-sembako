<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\StockMutationController;
use App\Http\Controllers\UserController;

// 1. Route Publik
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// 2. Route Terproteksi (Wajib Login)
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // ✅ STAFF & ADMIN: CRUD Biasa + Update Status
    Route::apiResource('categories', CategoryController::class)->except(['destroy']);
    Route::apiResource('items', ItemController::class);
    Route::apiResource('stock-mutations', StockMutationController::class)->only(['index', 'store']);

    // 🔒 KHUSUS ADMIN: Hak Hapus (DELETE)
    Route::middleware('role:admin')->group(function () {
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
        Route::delete('/items/{item}', [ItemController::class, 'destroy']);
        Route::delete('/stock-mutations/{stockMutation}', [StockMutationController::class, 'destroy']);

        Route::get('/admin/users', [UserController::class, 'index']);
        Route::patch('/admin/users/{user}/role', [UserController::class, 'updateRole']);
        Route::patch('/admin/users/{user}', [UserController::class, 'update']);
        Route::delete('/admin/users/{user}', [UserController::class, 'destroy']);
    });
});