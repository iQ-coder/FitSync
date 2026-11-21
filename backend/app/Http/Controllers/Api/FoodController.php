<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Food;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FoodController extends Controller
{
    /**
     * Food catalog. No q = the whole catalog (for the food picker);
     * with q = search by name.
     * GET /api/foods?q=chicken
     */
    public function index(Request $request)
    {
        $data = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $q = trim($data['q'] ?? '');

        $foods = Food::query()
            ->when($q !== '', function ($query) use ($q) {
                $like = '%' . addcslashes($q, '%_\\') . '%';

                $query->where('name', 'like', $like);
            })
            ->orderBy('name')
            ->limit($q === '' ? 200 : 50)
            ->get();

        return response()->json(['data' => $foods]);
    }

    /**
     * Preview nutrition values before saving.
     * POST /api/foods/calculate  { "name": "...", "grams": 150 }
     */
        public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'calories_per_100g' => ['required', 'numeric', 'min:0'],
            'protein_per_100g' => ['required', 'numeric', 'min:0'],
            'carbs_per_100g' => ['required', 'numeric', 'min:0'],
            'fat_per_100g' => ['required', 'numeric', 'min:0'],
        ]);

        $name = trim($data['name']);

        $food = Food::where('name', $name)->first() ?: new Food();
        $food->forceFill(array_merge($data, ['name' => $name]))->save();

        return response()->json(['data' => $food], 201);
    }
    public function calculate(Request $request)
    {
        $data = $request->validate([
            'food_id' => ['nullable', 'integer', 'exists:foods,food_id'],
            'name' => ['required_without:food_id', 'string', 'max:150'],
            // Either a free-text serving ("200g", "3 eggs") or plain grams
            'serving' => ['required_without:grams', 'nullable', 'string', 'max:100'],
            'grams' => ['required_without:serving', 'numeric', 'gt:0', 'max:10000'],
        ]);

        $food = self::resolveFood($data);

        return response()->json([
            'food' => [
                'food_id' => $food->food_id,
                'name' => $food->name,
                'emoji' => $food->emoji,
                'prep' => $food->prep,
            ],
            'nutrition' => $food->nutritionFor(self::resolveGrams($data, $food)),
        ]);
    }

    /**
     * Returns the food by food_id or name, or throws a 422 if not found.
     */
    public static function resolveFood(array $data): Food
    {
        if (!empty($data['food_id'])) {
            return Food::findOrFail($data['food_id']);
        }

        $food = Food::findByName($data['name'] ?? '');

        if (!$food) {
            throw ValidationException::withMessages([
                'name' => ['Food not found in the database. Pick one from /api/foods.'],
            ]);
        }

        return $food;
    }

    /**
     * Grams from the typed serving ("3 eggs") if present, otherwise the plain grams.
     */
    public static function resolveGrams(array $data, Food $food): float
    {
        if (isset($data['serving']) && trim($data['serving']) !== '') {
            return $food->gramsFromServing($data['serving']);
        }

        return (float) $data['grams'];
    }
}
