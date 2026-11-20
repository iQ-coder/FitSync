<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgressWeight extends Model
{
    protected $fillable = ['athlete_id', 'date', 'weight'];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'weight' => 'decimal:1',
    ];

    public function athlete(): BelongsTo
    {
        return $this->belongsTo(Athlete::class, 'athlete_id', 'athlete_id');
    }
}
