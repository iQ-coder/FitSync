<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveMealLogRequest extends FormRequest
{
   public function authorize(): bool
{
    return true;

    // return $this->user()?->is_active
    //     && $this->user()?->role === 'athlete'
    //     && $this->user()?->athlete !== null;
}

    public function rules(): array
    {
        $isCreate = $this->isMethod('POST');
        $presence = $isCreate ? 'required' : 'sometimes';

        return [
            'athlete_id' => ['prohibited'],
            'user_id' => ['prohibited'],

            // Nutrition values are calculated by the server only; clients may not send them
            'calories' => ['prohibited'],
            'protein_g' => ['prohibited'],
            'carbs_g' => ['prohibited'],
            'fat_g' => ['prohibited'],

           'meal_id' => [
    'sometimes',
    'nullable',
    'integer',
    $this->user()?->athlete
        ? Rule::exists('meals', 'meal_id')->whereIn(
            'nutrition_plan_id',
            $this->user()->athlete->nutritionPlans()->select('nutrition_plan_id')
        )
        : Rule::exists('meals', 'meal_id'),
    // Rule::exists('meals', 'meal_id')->whereIn(
    //     'nutrition_plan_id',
    //     $this->user()->athlete->nutritionPlans()->select('nutrition_plan_id')
    // ),
],
            // Either food_id or the food name
            'food_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('foods', 'food_id'),
            ],

            'name' => [
                $isCreate ? 'required_without:food_id' : 'sometimes',
                'string',
                'max:150',
            ],

            // What the user types: "200g", "3 eggs". The server turns it into grams.
            'serving' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],

            // Plain grams still work (used when no serving is sent)
            'grams' => [
                $isCreate ? 'required_without:serving' : 'sometimes',
                'numeric',
                'gt:0',
                'max:10000',
                'decimal:0,2',
            ],

            'meal_type' => [
                $presence,
                Rule::in([
                    'breakfast',
                    'lunch',
                    'dinner',
                    'snack',
                ]),
            ],

            'consumed_at' => [
                $presence,
                'date_format:Y-m-d\TH:i:sP',
                'before_or_equal:now',
            ],

            'notes' => [
                'sometimes',
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }
}
