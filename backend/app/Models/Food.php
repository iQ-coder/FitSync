<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class Food extends Model
{
    protected $table = 'foods';

    protected $primaryKey = 'food_id';

    protected $fillable = [
        'name',
        'emoji',
        'prep',
        'calories_per_100g',
        'protein_per_100g',
        'carbs_per_100g',
        'fat_per_100g',
        'serving_unit',
        'unit_grams',
    ];

    protected $casts = [
        'calories_per_100g' => 'decimal:2',
        'protein_per_100g' => 'decimal:2',
        'carbs_per_100g' => 'decimal:2',
        'fat_per_100g' => 'decimal:2',
        'unit_grams' => 'decimal:2',
    ];

    private const MAX_GRAMS = 10000;
    private const MAX_UNITS = 100;

    /**
     * Case-insensitive lookup (SQLite is case-sensitive, MySQL is not).
     */
    public static function findByName(string $name): ?self
    {
        return static::query()
            ->whereRaw('LOWER(name) = ?', [mb_strtolower(trim($name))])
            ->first();
    }

    /**
     * Turns what the user typed into grams.
     *
     *   "200g", "200 grams", "0.2kg", "7oz"  -> weight
     *   "3 eggs", "2 rice cakes", "egg"      -> units (only for foods that have a unit)
     *
     * @throws ValidationException
     */
    public function gramsFromServing(string $serving): float
    {
        $text = mb_strtolower(trim($serving));

        if (preg_match(
            '/(\d+(?:[.,]\d+)?)\s*(kg|kilograms?|grams?|gr|g|oz)(?![a-z])/u',
            $text,
            $m
        )) {
            $value = (float) str_replace(',', '.', $m[1]);

            $grams = match (true) {
                str_starts_with($m[2], 'k') => $value * 1000,
                $m[2] === 'oz' => $value * 28.3495,
                default => $value,
            };

            return $this->checkGrams($grams);
        }

        if ($this->serving_unit && (float) $this->unit_grams > 0) {
            $unit = str_replace(
                ' ',
                '\s+',
                preg_quote(mb_strtolower($this->serving_unit), '/')
            );

            $hasUnitWord = (bool) preg_match(
                '/\b(?:' . $unit . '|piece|pc|unit)(?:s|es)?\b/u',
                $text
            );

            $hasNumber = preg_match('/(\d+(?:[.,]\d+)?)/', $text, $n);

            if ($hasNumber || $hasUnitWord) {
                $quantity = $hasNumber ? (float) str_replace(',', '.', $n[1]) : 1.0;

                if ($quantity <= 0 || $quantity > self::MAX_UNITS) {
                    throw ValidationException::withMessages([
                        'serving' => ['Quantity must be between 0 and ' . self::MAX_UNITS . '.'],
                    ]);
                }

                return $this->checkGrams($quantity * (float) $this->unit_grams);
            }
        }

        $example = $this->serving_unit
            ? "e.g. 200g or 3 {$this->serving_unit}s"
            : 'e.g. 200g';

        throw ValidationException::withMessages([
            'serving' => ["Could not read the serving size ({$example})."],
        ]);
    }

    private function checkGrams(float $grams): float
    {
        if ($grams <= 0 || $grams > self::MAX_GRAMS) {
            throw ValidationException::withMessages([
                'serving' => ['Serving must be between 0 and ' . self::MAX_GRAMS . ' g.'],
            ]);
        }

        return round($grams, 2);
    }

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
