<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ManualController;

// 認証不要
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // ── フォルダ管理 ──────────────────────────────
    Route::get('/folders',           [ManualController::class, 'folders']);
    Route::post('/folders',          [ManualController::class, 'createFolder']);
    // ⚠️ /reorder は {id} より前に置く（順序重要）
    Route::post('/folders/reorder',  [ManualController::class, 'reorderFolders']);
    Route::put('/folders/{id}',      [ManualController::class, 'updateFolder']);
    Route::delete('/folders/{id}',   [ManualController::class, 'deleteFolder']);

    // ── フォルダ権限 ──────────────────────────────
    Route::get('/folders/{id}/permissions',    [ManualController::class, 'folderPermissions']);
    Route::post('/folders/{id}/permissions',   [ManualController::class, 'setFolderPermission']);
    Route::delete('/folders/{id}/permissions', [ManualController::class, 'deleteFolderPermission']);

    // ── マニュアル ────────────────────────────────
    Route::get('/manuals',                      [ManualController::class, 'index']);
    Route::post('/manuals/{manual}/videos',     [ManualController::class, 'uploadVideo']);

    // ── ステップ ──────────────────────────────────
    Route::get('/manuals/{manual}/steps',                      [ManualController::class, 'steps']);
    Route::post('/manuals/{manual}/steps',                     [ManualController::class, 'addStep']);
    // ⚠️ /reorder は {step} より前に置く（順序重要）
    Route::post('/manuals/{manual}/steps/reorder',             [ManualController::class, 'reorderSteps']);
    Route::put('/manuals/{manual}/steps/{step}',               [ManualController::class, 'updateStep']);
    Route::delete('/manuals/{manual}/steps/{step}',            [ManualController::class, 'deleteStep']);
});
