<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Storage;
use App\Models\Manual;
use App\Models\Folder;
use App\Models\ManualVideo;
use App\Jobs\VideoProcessingJob;

class ManualController extends Controller
{
    /**
     * マニュアル一覧・検索・フィルタ・ページング・ソートAPI
     * 検索: title, description, 作成者名, status, folder_id, created_at, updated_at
     * フルテキスト: MySQL FULLTEXT(title, description)
     * GET /api/manuals?query=xxx&status=published&folder_id=1&sort=created_at&order=desc&page=1&per_page=20
     */
    public function index(Request $request)
    {
        $query = Manual::query();

        // 検索ワード
        if ($request->filled('query')) {
            $q = $request->input('query');
            // MySQL FULLTEXT対応
            if (app('db')->getDriverName() === 'mysql') {
                $query->whereRaw('MATCH(title, description) AGAINST (? IN BOOLEAN MODE)', [$q]);
            } else {
                $query->where(function($sub) use ($q) {
                    $sub->where('title', 'like', "%$q%")
                        ->orWhere('description', 'like', "%$q%" );
                });
            }
        }

        // ステータス
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        // フォルダ
        if ($request->filled('folder_id')) {
            $query->where('folder_id', $request->input('folder_id'));
        }
        // 作成者
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }
        // 日付範囲
        if ($request->filled('created_from')) {
            $query->where('created_at', '>=', $request->input('created_from'));
        }
        if ($request->filled('created_to')) {
            $query->where('created_at', '<=', $request->input('created_to'));
        }

        // ソート
        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');
        $query->orderBy($sort, $order);

        // ページング
        $perPage = (int) $request->input('per_page', 20);
        $manuals = $query->with('user')->paginate($perPage);

        return response()->json($manuals);
    }
    /**
     * 動画アップロードAPI
     */
    public function uploadVideo($manualId, \Illuminate\Http\Request $request)
    {
        $manual = Manual::findOrFail($manualId);

        $request->validate([
            'video' => 'required|file|mimetypes:video/mp4,video/quicktime,video/x-msvideo,video/webm|max:2048000', // 2GB
        ]);

        $file = $request->file('video');
        $path = $file->store('videos', 'public');

        $video = ManualVideo::create([
            'manual_id' => $manual->id,
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'processing_status' => 'pending',
        ]);

        // 非同期ジョブをディスパッチ
        VideoProcessingJob::dispatch($video->id);

        return response()->json($video, 201);
    }

    /**
     * 指定マニュアルのステップ一覧取得
     */
    public function steps($manualId)
    {
        $steps = \App\Models\ManualStep::where('manual_id', $manualId)
            ->orderBy('step_number')
            ->get();
        return response()->json($steps);
    }

    /**
     * ステップ追加
     */
    public function addStep($manualId, \Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'step_number' => 'required|integer',
            'title' => 'required|string|max:255',
            'body' => 'nullable|string',
            'image_path' => 'nullable|string|max:500',
        ]);
        $step = \App\Models\ManualStep::create([
            'manual_id' => $manualId,
            'step_number' => $validated['step_number'],
            'title' => $validated['title'],
            'body' => $validated['body'] ?? null,
            'image_path' => $validated['image_path'] ?? null,
        ]);
        return response()->json($step, 201);
    }

    /**
     * ステップ更新
     */
    public function updateStep($manualId, $stepId, \Illuminate\Http\Request $request)
    {
        $step = \App\Models\ManualStep::where('manual_id', $manualId)->findOrFail($stepId);
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'body' => 'nullable|string',
            'image_path' => 'nullable|string|max:500',
        ]);
        $step->update($validated);
        return response()->json($step);
    }

    /**
     * ステップ削除
     */
    public function deleteStep($manualId, $stepId)
    {
        $step = \App\Models\ManualStep::where('manual_id', $manualId)->findOrFail($stepId);
        $step->delete();
        return response()->json(['message' => 'deleted']);
    }

    /**
     * ステップ並び替え
     */
    public function reorderSteps($manualId, \Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|integer',
            'orders.*.step_number' => 'required|integer',
        ]);
        foreach ($validated['orders'] as $order) {
            \App\Models\ManualStep::where('manual_id', $manualId)
                ->where('id', $order['id'])
                ->update(['step_number' => $order['step_number']]);
        }
        return response()->json(['message' => 'reordered']);
    }

    /**
     * フォルダ一覧取得
     */
    public function folders() {
        $folders = \App\Models\Folder::with('children')->whereNull('parent_id')->orderBy('sort_order')->get();
        return response()->json($folders);
    }

    /**
     * フォルダ作成
     */
    public function createFolder(\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'parent_id' => 'nullable|integer|exists:folders,id',
            'sort_order' => 'nullable|integer',
        ]);
        $folder = \App\Models\Folder::create([
            'name' => $validated['name'],
            'parent_id' => $validated['parent_id'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'created_by' => $request->user()->id,
        ]);
        return response()->json($folder, 201);
    }

    /**
     * フォルダ更新
     */
    public function updateFolder($id, \Illuminate\Http\Request $request) {
        $folder = \App\Models\Folder::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'parent_id' => 'nullable|integer|exists:folders,id',
            'sort_order' => 'nullable|integer',
        ]);
        $folder->update($validated);
        return response()->json($folder);
    }

    /**
     * フォルダ削除
     */
    public function deleteFolder($id) {
        $folder = \App\Models\Folder::findOrFail($id);
        $folder->delete();
        return response()->json(['message' => 'deleted']);
    }

    /**
     * フォルダ並び替え
     */
    public function reorderFolders(\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|integer',
            'orders.*.sort_order' => 'required|integer',
        ]);
        foreach ($validated['orders'] as $order) {
            \App\Models\Folder::where('id', $order['id'])->update(['sort_order' => $order['sort_order']]);
        }
        return response()->json(['message' => 'reordered']);
    }
        /**
     * フォルダ権限一覧取得
     */
    public function folderPermissions($folderId)
    {
        $folder = \App\Models\Folder::findOrFail($folderId);
        $permissions = $folder->folderPermissions()->with('user')->get();
        return response()->json($permissions);
    }

    /**
     * フォルダ権限追加・更新
     */
    public function setFolderPermission($folderId, \Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|integer|exists:users,id',
            'role' => 'nullable|string',
            'permission' => 'required|in:view,edit',
        ]);
        $folder = \App\Models\Folder::findOrFail($folderId);
        $perm = \App\Models\FolderPermission::updateOrCreate(
            [
                'folder_id' => $folder->id,
                'user_id' => $validated['user_id'] ?? null,
                'role' => $validated['role'] ?? null,
                'permission' => $validated['permission'],
            ],
            []
        );
        return response()->json($perm);
    }

    /**
     * フォルダ権限削除
     */
    public function deleteFolderPermission($folderId, \Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|integer|exists:users,id',
            'role' => 'nullable|string',
            'permission' => 'required|in:view,edit',
        ]);
        $folder = \App\Models\Folder::findOrFail($folderId);
        \App\Models\FolderPermission::where([
            'folder_id' => $folder->id,
            'user_id' => $validated['user_id'] ?? null,
            'role' => $validated['role'] ?? null,
            'permission' => $validated['permission'],
        ])->delete();
        return response()->json(['message' => 'deleted']);
    }
}
