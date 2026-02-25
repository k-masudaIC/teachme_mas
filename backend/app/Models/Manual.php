<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Manual extends Model
{
    use HasFactory;

    /**
     * 作成者ユーザー
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
