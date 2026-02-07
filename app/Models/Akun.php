<?php

namespace App\Models;

use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Model;

class Akun extends Model
{
    use BelongsToUser; // Trait

    protected $guarded = ['id'];

    // Relasi ke transaksi (biar bisa hitung saldo)
    public function pemasukans()
    {
        return $this->hasMany(Pemasukan::class);
    }

    public function pengeluarans()
    {
        return $this->hasMany(Pengeluaran::class);
    }
}
