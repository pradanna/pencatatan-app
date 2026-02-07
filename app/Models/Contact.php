<?php

namespace App\Models;

use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use BelongsToUser;
    protected $guarded = ['id'];

    public function supplierItems()
    {
        return $this->hasMany(SupplierItem::class);
    }
}
