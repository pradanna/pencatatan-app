<?php

namespace App\Models;

use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pengeluaran extends Model
{
    use BelongsToUser;
    protected $guarded = ['id'];

    public function akun()
    {
        return $this->belongsTo(Akun::class);
    }

    public function pemasukanRef()
    {
        return $this->belongsTo(Pemasukan::class, 'pemasukan_ref_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class); // Relasi ke Supplier
    }

    public function supplierItem()
    {
        return $this->belongsTo(SupplierItem::class);
    }

    public function pemasukan()
    {
        // Kita beri tahu Laravel bahwa foreign key-nya adalah 'pemasukan_ref_id'
        return $this->belongsTo(Pemasukan::class, 'pemasukan_ref_id');
    }

    public function hutangPiutang(): BelongsTo
    {
        // Pastikan kolom di tabel pengeluarans namanya 'hutang_piutang_id'
        return $this->belongsTo(HutangPiutang::class, 'hutang_piutang_id');
    }
}
