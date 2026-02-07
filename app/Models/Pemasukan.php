<?php

namespace App\Models;

use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Model;

class Pemasukan extends Model
{
    use BelongsToUser;
    protected $guarded = ['id'];

    protected $appends = ['profit'];

    public function akun()
    {
        return $this->belongsTo(Akun::class);
    }

    // Relasi ke Pengeluaran (Sebagai modal projek ini)
    public function pengeluaranProject()
    {
        return $this->hasMany(Pengeluaran::class, 'pemasukan_ref_id');
    }

    // Helper: Hitung Profit Project ini
    // (Nominal Pemasukan - Total Pengeluaran yg nempel ke sini)
    public function getProfitAttribute()
    {
        return $this->nominal - $this->pengeluaranProject()->sum('nominal');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class); // Relasi ke Customer
    }
}
