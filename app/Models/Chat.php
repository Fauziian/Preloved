<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    protected $primaryKey = 'session_id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'session_id',
        'guest_label',
        'messages',
        'last_activity',
        'unread_by_admin',
    ];

    protected $casts = [
        'messages' => 'array',
        'last_activity' => 'integer',
        'unread_by_admin' => 'integer',
    ];
}
