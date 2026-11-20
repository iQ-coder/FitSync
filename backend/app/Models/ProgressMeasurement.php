<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgressMeasurement extends Model
{
    protected $fillable = [
        'athlete_id', 'date', 'chest', 'waist', 'hips', 'arm', 'thigh',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'chest' => 'decimal:1',
        'waist' => 'decimal:1',
        'hips' => 'decimal:1',
        'arm' => 'decimal:1',
        'thigh' => 'decimal:1',
    ];

    public function athlete(): BelongsTo
    {
        return $this->belongsTo(Athlete::class, 'athlete_id', 'athlete_id');
    }
}
