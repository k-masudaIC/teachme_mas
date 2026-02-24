<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Storage;
use App\Models\Manual;
use App\Models\ManualVideo;

class ManualController extends Controller
{
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

        return response()->json($video, 201);
    }
}
