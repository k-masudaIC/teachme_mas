<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ManualStep extends Model
{
    protected $fillable = [
        'manual_id',
        'step_number',
        'title',
        'body',
        'image_path',
    ];
}
