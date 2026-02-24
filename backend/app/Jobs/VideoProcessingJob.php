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
        // ここでFFmpegやAI API連携などの処理を実装予定
        // $video = ManualVideo::find($this->manualVideoId);
    }
}
