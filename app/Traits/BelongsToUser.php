<?php

namespace App\Traits;

use App\Models\Scopes\UserScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait BelongsToUser
{
    protected static function bootBelongsToUser()
    {
        // 1. Saat QUERY (Get Data): Otomatis filter punya user yang login saja
        static::addGlobalScope('user', function (Builder $builder) {
            if (Auth::check()) {
                $builder->where('user_id', Auth::id());
            }
        });

        // 2. Saat CREATE (Simpan Data): Otomatis isi user_id
        static::creating(function ($model) {
            if (Auth::check()) {
                $model->user_id = Auth::id();
            }
        });
    }

    // Definisi relasi balik ke User (Opsional, buat jaga-jaga)
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
