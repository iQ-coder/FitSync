<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgressPhoto extends Model
{
    protected $fillable = ['athlete_id', 'date', 'label', 'path'];

    protected $casts = ['date' => 'date:Y-m-d'];

    protected $hidden = ['path'];

    public function athlete(): BelongsTo
    {
        return $this->belongsTo(Athlete::class, 'athlete_id', 'athlete_id');
    }
}
