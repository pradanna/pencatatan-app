<?php

namespace App\Models;

use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Model;

class HutangPiutang extends Model
{
    use BelongsToUser;
    protected $guarded = ['id'];

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }
}
