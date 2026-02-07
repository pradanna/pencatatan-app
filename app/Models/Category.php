<?php

namespace App\Models;

use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use BelongsToUser;

    protected $guarded = ['id'];

    // Relasi ke Pemasukan
    public function pemasukans()
    {
        return $this->hasMany(Pemasukan::class);
    }

    // Relasi ke Pengeluaran
    public function pengeluarans()
    {
        return $this->hasMany(Pengeluaran::class);
    }
}
