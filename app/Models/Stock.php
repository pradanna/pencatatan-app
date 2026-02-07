<?php

namespace App\Models;

use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use BelongsToUser;
    protected $guarded = ['id'];

    public function mutations()
    {
        return $this->hasMany(StockMutation::class);
    }
}
