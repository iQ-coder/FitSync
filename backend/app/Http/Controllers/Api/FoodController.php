<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Food;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FoodController extends Controller
{
    /**
     * Search foods by name (for autocomplete).
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
            ->limit(20)
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
            'grams' => ['required', 'numeric', 'gt:0', 'max:10000'],
        ]);

        $food = self::resolveFood($data);

        return response()->json([
            'food' => [
                'food_id' => $food->food_id,
                'name' => $food->name,
            ],
            'nutrition' => $food->nutritionFor((float) $data['grams']),
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

        $name = trim($data['name'] ?? '');

        $food = Food::where('name', $name)->first();

        if (!$food) {
            throw ValidationException::withMessages([
                'name' => ['Food not found. Search for it using /api/foods?q=.'],
            ]);
        }

        return $food;
    }
}
