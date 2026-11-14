<?php

namespace Database\Seeders;

use App\Models\Food;
use Illuminate\Database\Seeder;

class FoodSeeder extends Seeder
{
    public function run(): void
    {
        // [name, kcal, protein, carbs, fat] per 100 g (approximate values)
        $foods = [
            ['Chicken breast (cooked)', 165, 31, 0, 3.6],
            ['White rice (cooked)', 130, 2.7, 28, 0.3],
            ['Egg (boiled)', 155, 13, 1.1, 11],
            ['Banana', 89, 1.1, 22.8, 0.3],
            ['Apple', 52, 0.3, 13.8, 0.2],
            ['Oats (dry)', 389, 16.9, 66.3, 6.9],
            ['Pita bread', 275, 9.1, 55.7, 1.2],
            ['Olive oil', 884, 0, 0, 100],
            ['Lentils (cooked)', 116, 9, 20.1, 0.4],
            ['Chickpeas (cooked)', 164, 8.9, 27.4, 2.6],
            ['Tuna (canned in water)', 116, 25.5, 0, 0.8],
            ['Whole milk', 61, 3.2, 4.8, 3.3],
            ['Greek yogurt (plain, nonfat)', 59, 10.2, 3.6, 0.4],
            ['Potato (boiled)', 87, 1.9, 20.1, 0.1],
            ['Beef (cooked, lean)', 250, 26, 0, 15],
            ['Almonds', 579, 21.2, 21.6, 49.9],
            ['Hummus', 166, 7.9, 14.3, 9.6],
        ];

        foreach ($foods as [$name, $kcal, $p, $c, $f]) {
            Food::updateOrCreate(
                ['name' => $name],
                [
                    'calories_per_100g' => $kcal,
                    'protein_per_100g' => $p,
                    'carbs_per_100g' => $c,
                    'fat_per_100g' => $f,
                ]
            );
        }
    }
}
