<?php

namespace App\Models;

use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Model;

class StockMutation extends Model
{
    protected $guarded = ['id'];

    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }
}
