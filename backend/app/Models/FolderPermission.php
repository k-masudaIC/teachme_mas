<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FolderPermission extends Model
{
    protected $fillable = [
        'folder_id',
        'user_id',
        'role',
        'permission',
    ];

    public function folder()
    {
        return $this->belongsTo(Folder::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
