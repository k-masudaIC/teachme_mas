<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ManualVideo extends Model
{
    protected $fillable = [
        'manual_id',
        'file_path',
        'original_filename',
        'duration',
        'file_size',
        'processing_status',
        'error_message',
        'retry_count',
    ];
}
