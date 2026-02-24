use App\Models\ManualVideo;
use App\Models\ManualStep;
use Illuminate\Support\Facades\Log;
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class VideoProcessingJob implements ShouldQueue
{
    use Queueable;

    protected $manualVideoId;

    public function __construct($manualVideoId)
    {
        $this->manualVideoId = $manualVideoId;
    }

    public function handle(): void
    {
        $video = ManualVideo::find($this->manualVideoId);
        if (!$video) {
            Log::error('ManualVideo not found', ['id' => $this->manualVideoId]);
            return;
        }

        // 1. FFmpegで音声抽出（例: storage/app/public/mp3s/xxx.mp3）
        $inputPath = storage_path('app/public/' . $video->file_path);
        $mp3Path = storage_path('app/public/mp3s/' . $video->id . '.mp3');
        @mkdir(dirname($mp3Path), 0777, true);
        $cmd = sprintf('ffmpeg -y -i %s -vn -acodec libmp3lame -ar 44100 -ac 2 -ab 192k -f mp3 %s', escapeshellarg($inputPath), escapeshellarg($mp3Path));
        exec($cmd, $out, $ret);
        if ($ret !== 0) {
            $video->processing_status = 'failed';
            $video->error_message = 'FFmpeg音声抽出失敗';
            $video->save();
            Log::error('FFmpeg failed', ['cmd' => $cmd, 'output' => $out]);
            return;
        }

        // 2. 音声文字起こしAPIにmp3送信（ダミー実装）
        $transcript = 'ダミー文字起こし結果';
        // 実際はAPI連携で取得

        // 3. テキスト整形APIで手順JSON取得（ダミー実装）
        $steps = [
            ["step_number" => 1, "title" => "サンプルステップ", "body" => $transcript],
        ];
        // 実際はAPI連携で取得

        // 4. manual_steps保存
        foreach ($steps as $step) {
            ManualStep::create([
                'manual_id' => $video->manual_id,
                'step_number' => $step['step_number'],
                'title' => $step['title'],
                'body' => $step['body'],
            ]);
        }

        $video->processing_status = 'completed';
        $video->save();
    }
}
