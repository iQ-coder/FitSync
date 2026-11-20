<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgressGoal extends Model
{
    protected $fillable = ['athlete_id', 'goal_weight'];

    protected $casts = ['goal_weight' => 'decimal:1'];

    public function athlete(): BelongsTo
    {
        return $this->belongsTo(Athlete::class, 'athlete_id', 'athlete_id');
    }
}
