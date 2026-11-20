<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Athlete extends Model
{
    protected $primaryKey = 'athlete_id';

    protected $fillable = ['user_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function nutritionPlans(): HasMany
    {
        return $this->hasMany(NutritionPlan::class, 'athlete_id', 'athlete_id');
    }

    public function mealLogs(): HasMany
    {
        return $this->hasMany(MealLog::class, 'athlete_id', 'athlete_id');
    }

    // Progress API relationships

    public function progressWeights(): HasMany
    {
        return $this->hasMany(ProgressWeight::class, 'athlete_id', 'athlete_id');
    }

    public function progressGoal(): HasOne
    {
        return $this->hasOne(ProgressGoal::class, 'athlete_id', 'athlete_id');
    }

    public function progressMeasurements(): HasMany
    {
        return $this->hasMany(ProgressMeasurement::class, 'athlete_id', 'athlete_id');
    }

    public function progressPhotos(): HasMany
    {
        return $this->hasMany(ProgressPhoto::class, 'athlete_id', 'athlete_id');
    }
}
