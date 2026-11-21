<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MealLog extends Model
{
    protected $primaryKey = 'meal_log_id';

    protected $fillable = [
        'meal_id',
        'food_id',
        'name',
        'meal_type',
        'grams',
        'serving',
        'calories',
        'protein_g',
        'carbs_g',
        'fat_g',
        'consumed_at',
        'notes',
    ];

    protected $casts = [
        'grams' => 'decimal:2',
        'calories' => 'decimal:2',
        'protein_g' => 'decimal:2',
        'carbs_g' => 'decimal:2',
        'fat_g' => 'decimal:2',
        'consumed_at' => 'datetime',
    ];

    public function athlete(): BelongsTo
    {
        return $this->belongsTo(
            Athlete::class,
            'athlete_id',
            'athlete_id'
        );
    }

    public function meal(): BelongsTo
    {
        return $this->belongsTo(Meal::class, 'meal_id', 'meal_id');
    }

    public function food(): BelongsTo
    {
        return $this->belongsTo(Food::class, 'food_id', 'food_id');
    }
}
