<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Food extends Model
{
    protected $table = 'foods';

    protected $primaryKey = 'food_id';

    protected $fillable = [
        'name',
        'calories_per_100g',
        'protein_per_100g',
        'carbs_per_100g',
        'fat_per_100g',
    ];

    protected $casts = [
        'calories_per_100g' => 'decimal:2',
        'protein_per_100g' => 'decimal:2',
        'carbs_per_100g' => 'decimal:2',
        'fat_per_100g' => 'decimal:2',
    ];

    /**
     * Nutrition values for a given amount in grams.
     */
    public function nutritionFor(float $grams): array
    {
        $factor = $grams / 100;

        return [
            'grams' => round($grams, 2),
            'calories' => round((float) $this->calories_per_100g * $factor, 2),
            'protein_g' => round((float) $this->protein_per_100g * $factor, 2),
            'carbs_g' => round((float) $this->carbs_per_100g * $factor, 2),
            'fat_g' => round((float) $this->fat_per_100g * $factor, 2),
        ];
    }
}
