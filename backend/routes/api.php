<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/


use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
        // フォルダ管理
        Route::get('/folders', [\App\Http\Controllers\ManualController::class, 'folders']);
        Route::post('/folders', [\App\Http\Controllers\ManualController::class, 'createFolder']);
        Route::put('/folders/{id}', [\App\Http\Controllers\ManualController::class, 'updateFolder']);
        Route::delete('/folders/{id}', [\App\Http\Controllers\ManualController::class, 'deleteFolder']);
        Route::post('/folders/reorder', [\App\Http\Controllers\ManualController::class, 'reorderFolders']);
        // フォルダ権限
        Route::get('/folders/{id}/permissions', [\App\Http\Controllers\ManualController::class, 'folderPermissions']);
        Route::post('/folders/{id}/permissions', [\App\Http\Controllers\ManualController::class, 'setFolderPermission']);
        Route::delete('/folders/{id}/permissions', [\App\Http\Controllers\ManualController::class, 'deleteFolderPermission']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // 動画アップロード
    Route::post('/manuals/{manual}/videos', [\App\Http\Controllers\ManualController::class, 'uploadVideo']);
    // 手順（ステップ）一覧取得
    Route::get('/manuals/{manual}/steps', [\App\Http\Controllers\ManualController::class, 'steps']);
    // ステップ追加
    Route::post('/manuals/{manual}/steps', [\App\Http\Controllers\ManualController::class, 'addStep']);
    // ステップ更新
    Route::put('/manuals/{manual}/steps/{step}', [\App\Http\Controllers\ManualController::class, 'updateStep']);
    // ステップ削除
    Route::delete('/manuals/{manual}/steps/{step}', [\App\Http\Controllers\ManualController::class, 'deleteStep']);
    // ステップ並び替え
    Route::post('/manuals/{manual}/steps/reorder', [\App\Http\Controllers\ManualController::class, 'reorderSteps']);
});
