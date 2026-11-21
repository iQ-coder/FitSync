<?php

namespace Database\Seeders;

use App\Models\Food;
use Illuminate\Database\Seeder;

class FoodSeeder extends Seeder
{
    public function run(): void
    {
        // All values are per 100 g (approximate, typical reference values).
        //
        // ESTIMATED = no reliable reference for these (brands / home dishes).
        // Replace them with the numbers printed on your package.
        //
        // unit / unitGrams = countable foods: "3 eggs" -> 3 x 50 g.
        // legacy           = old name of the same row, so existing logs keep their food_id.
        $foods = [
            $this->row('Chicken Breast', '🍗', 'cooked', 165, 31, 0, 3.6, legacy: 'Chicken breast (cooked)'),
            $this->row('Chicken Thigh', '🍖', 'cooked, skinless', 209, 26, 0, 10.9),
            $this->row('Beef (lean)', '🥩', 'cooked', 250, 26, 0, 15, legacy: 'Beef (cooked, lean)'),
            $this->row('Eggs', '🥚', 'boiled', 155, 13, 1.1, 11, 'egg', 50, 'Egg (boiled)'),
            $this->row('White Rice', '🍚', 'dry', 365, 7.1, 80, 0.7),
            $this->row('White Rice (cooked)', '🍚', 'cooked', 130, 2.7, 28, 0.3, legacy: 'White rice (cooked)'),
            $this->row('Pasta', '🍝', 'dry', 371, 13, 74.7, 1.5),
            $this->row('Pasta (cooked)', '🍝', 'cooked', 158, 5.8, 30.9, 0.9),
            $this->row('Potato', '🥔', 'boiled', 87, 1.9, 20.1, 0.1, legacy: 'Potato (boiled)'),
            $this->row('Instant Noodles', '🍜', 'dry', 450, 9, 62, 18),
            $this->row('Tortilla', '🫓', null, 312, 8.3, 51.6, 8),
            $this->row('Bread', '🍞', null, 265, 9, 49, 3.2),
            $this->row('Banana', '🍌', null, 89, 1.1, 22.8, 0.3),
            $this->row('Dates', '🌴', null, 277, 1.8, 75, 0.2),
            $this->row('Rice Cakes', '🍘', null, 387, 8.2, 81.5, 2.8),
            $this->row('Honey', '🍯', null, 304, 0.3, 82.4, 0),
            $this->row('Olive Oil', '🫒', null, 884, 0, 0, 100),
            $this->row('Butter', '🧈', null, 717, 0.9, 0.1, 81),

            // ---- from the old food list (estimated, check your package) ----
            $this->row('Mlookhye', '🍲', 'cooked', 55, 4, 6, 1.5),
            $this->row('Hawa Alsham', '🍽', null, 85, 3.5, 13, 2),
            $this->row('Zucchini', '🥒', null, 17, 1.2, 3.1, 0.3),
            $this->row('Yogart', '🥛', 'plain', 61, 3.5, 4.7, 3.3),
            $this->row('Magro Rice Cake', '🍘', null, 387, 8.2, 81.5, 2.8, 'rice cake', 9),
            $this->row('Watermelon', '🍉', null, 30, 0.6, 7.6, 0.2),
            $this->row('Hawa Alsham Low Sugar', '🍽', null, 65, 3.8, 8, 1.8),
            $this->row('Salty Rice Cakes', '🍘', null, 380, 8, 78, 3, 'cake', 8),
            $this->row('Hawa Alsham Yogartt', '🍽', null, 70, 4, 9, 2),
            $this->row('Indomie', '🍜', 'dry', 450, 9.5, 62, 18, 'indomie', 75),
            $this->row('Tuna', '🐟', 'canned in water', 116, 25.5, 0, 0.8, legacy: 'Tuna (canned in water)'),
            $this->row('Freakeh', '🌾', 'dry', 325, 12.5, 66, 2.5),
            $this->row('Jam', '🍓', null, 250, 0.4, 65, 0.1),
            $this->row('Turkish Protein Milk', '🥛', null, 55, 7.5, 4.5, 0.6),

            // ---- extra foods that were already in the database ----
            $this->row('Apple', '🍎', null, 52, 0.3, 13.8, 0.2),
            $this->row('Oats (dry)', '🥣', 'dry', 389, 16.9, 66.3, 6.9),
            $this->row('Pita bread', '🫓', null, 275, 9.1, 55.7, 1.2),
            $this->row('Lentils (cooked)', '🫘', 'cooked', 116, 9, 20.1, 0.4),
            $this->row('Chickpeas (cooked)', '🫘', 'cooked', 164, 8.9, 27.4, 2.6),
            $this->row('Whole milk', '🥛', null, 61, 3.2, 4.8, 3.3),
            $this->row('Greek yogurt (plain, nonfat)', '🥛', null, 59, 10.2, 3.6, 0.4),
            $this->row('Almonds', '🥜', null, 579, 21.2, 21.6, 49.9),
            $this->row('Hummus', '🧆', null, 166, 7.9, 14.3, 9.6),
        ];

        foreach ($foods as $row) {
            $food = Food::findByName($row['name'])
                ?? ($row['legacy'] ? Food::findByName($row['legacy']) : null)
                ?? new Food();

            $food->forceFill([
                'name' => $row['name'],
                'emoji' => $row['emoji'],
                'prep' => $row['prep'],
                'calories_per_100g' => $row['kcal'],
                'protein_per_100g' => $row['protein'],
                'carbs_per_100g' => $row['carbs'],
                'fat_per_100g' => $row['fat'],
                'serving_unit' => $row['unit'],
                'unit_grams' => $row['unitGrams'],
            ])->save();
        }
    }

    private function row(
        string $name,
        string $emoji,
        ?string $prep,
        float $kcal,
        float $protein,
        float $carbs,
        float $fat,
        ?string $unit = null,
        ?float $unitGrams = null,
        ?string $legacy = null,
    ): array {
        return compact(
            'name', 'emoji', 'prep', 'kcal', 'protein', 'carbs', 'fat',
            'unit', 'unitGrams', 'legacy'
        );
    }
}
