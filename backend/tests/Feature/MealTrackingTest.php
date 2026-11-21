<?php

namespace Tests\Feature;

use App\Models\Athlete;
use App\Models\Food;
use App\Models\MealLog;
use App\Models\User;
use Database\Seeders\FoodSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MealTrackingTest extends TestCase
{
    use RefreshDatabase;

    private Athlete $athlete;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(FoodSeeder::class);

        $this->athlete = $this->makeAthlete();
        Sanctum::actingAs($this->athlete->user);
    }

    private function makeAthlete(): Athlete
    {
        $user = User::factory()->create()->fresh(); // fresh() = DB defaults (role, is_active)

        return Athlete::create(['user_id' => $user->id]);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Chicken Breast',
            'serving' => '200g',
            'meal_type' => 'lunch',
            'consumed_at' => now()->subMinute()->format('Y-m-d\TH:i:sP'),
        ], $overrides);
    }

    // ---------- catalog ----------

    public function test_catalog_returns_the_seeded_foods(): void
    {
        $names = collect($this->getJson('/api/foods')->assertOk()->json('data'))
            ->pluck('name');

        foreach (['Chicken Breast', 'Eggs', 'Mlookhye', 'Indomie', 'Turkish Protein Milk'] as $name) {
            $this->assertTrue($names->contains($name), "{$name} missing from catalog");
        }
    }

    public function test_catalog_search_is_a_filter(): void
    {
        $names = collect($this->getJson('/api/foods?q=rice')->assertOk()->json('data'))
            ->pluck('name');

        $this->assertTrue($names->contains('White Rice'));
        $this->assertFalse($names->contains('Chicken Breast'));
    }

    public function test_seeder_can_run_twice_without_duplicates(): void
    {
        $count = Food::count();

        $this->seed(FoodSeeder::class);

        $this->assertSame($count, Food::count());
    }

    // ---------- calculate ----------

    public function test_calculate_returns_nutrition_from_name_and_serving_only(): void
    {
        $this->postJson('/api/foods/calculate', ['name' => 'chicken breast', 'serving' => '200g'])
            ->assertOk()
            ->assertJsonPath('nutrition.grams', 200)
            ->assertJsonPath('nutrition.calories', 330)
            ->assertJsonPath('nutrition.protein_g', 62)
            ->assertJsonPath('nutrition.carbs_g', 0)
            ->assertJsonPath('nutrition.fat_g', 7.2);
    }

    public function test_calculate_understands_units(): void
    {
        // 3 eggs = 3 x 50 g = 150 g
        $this->postJson('/api/foods/calculate', ['name' => 'Eggs', 'serving' => '3 eggs'])
            ->assertOk()
            ->assertJsonPath('nutrition.grams', 150)
            ->assertJsonPath('nutrition.calories', 232.5);
    }

    public function test_calculate_rejects_unknown_food(): void
    {
        $this->postJson('/api/foods/calculate', ['name' => 'Moon cheese', 'serving' => '100g'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('name');
    }

    public function test_calculate_rejects_unreadable_serving(): void
    {
        $this->postJson('/api/foods/calculate', ['name' => 'Chicken Breast', 'serving' => 'a lot'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('serving');

        // "3" has no meaning for a food without a unit
        $this->postJson('/api/foods/calculate', ['name' => 'Chicken Breast', 'serving' => '3'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('serving');
    }

    // ---------- add ----------

    public function test_add_needs_only_name_and_serving_and_server_fills_the_rest(): void
    {
        $this->postJson('/api/meal-logs', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.name', 'Chicken Breast')
            ->assertJsonPath('data.serving', '200g')
            ->assertJsonPath('data.calories', '330.00')
            ->assertJsonPath('data.protein_g', '62.00');

        $this->assertDatabaseHas('meal_logs', [
            'athlete_id' => $this->athlete->athlete_id,
            'name' => 'Chicken Breast',
            'meal_type' => 'lunch',
        ]);
    }

    public function test_add_with_plain_grams_still_works(): void
    {
        $this->postJson('/api/meal-logs', $this->payload(['serving' => null, 'grams' => 100]))
            ->assertCreated()
            ->assertJsonPath('data.calories', '165.00');
    }

    public function test_client_cannot_send_nutrition_values(): void
    {
        $this->postJson('/api/meal-logs', $this->payload(['calories' => 1]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('calories');
    }

    public function test_add_requires_a_serving_or_grams(): void
    {
        $this->postJson('/api/meal-logs', $this->payload(['serving' => null]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('grams');
    }

    public function test_add_rejects_food_that_is_not_in_the_database(): void
    {
        $this->postJson('/api/meal-logs', $this->payload(['name' => 'Moon cheese']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('name');

        $this->assertDatabaseCount('meal_logs', 0);
    }

    // ---------- list + summary ----------

    public function test_summary_totals_come_from_the_logs(): void
    {
        $this->postJson('/api/meal-logs', $this->payload())->assertCreated();
        $this->postJson('/api/meal-logs', $this->payload(['name' => 'Eggs', 'serving' => '3 eggs']))->assertCreated();

        $date = now()->setTimezone(config('meal_tracking.timezone'))->toDateString();

        $this->getJson("/api/meal-logs?date={$date}")
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->getJson("/api/meal-logs/summary?date={$date}")
            ->assertOk()
            ->assertJsonPath('logged_meals_count', 2)
            ->assertJsonPath('logged_calories', 562.5);
    }

    // ---------- edit ----------

    public function test_edit_serving_recalculates_everything(): void
    {
        $id = $this->postJson('/api/meal-logs', $this->payload())->json('data.meal_log_id');

        $this->patchJson("/api/meal-logs/{$id}", ['serving' => '100g'])
            ->assertOk()
            ->assertJsonPath('data.serving', '100g')
            ->assertJsonPath('data.calories', '165.00')
            ->assertJsonPath('data.protein_g', '31.00');
    }

    public function test_edit_food_keeps_the_amount_and_recalculates(): void
    {
        $id = $this->postJson('/api/meal-logs', $this->payload())->json('data.meal_log_id');

        // 200 g of dry white rice: 365 * 2 = 730 kcal
        $this->patchJson("/api/meal-logs/{$id}", ['name' => 'White Rice'])
            ->assertOk()
            ->assertJsonPath('data.name', 'White Rice')
            ->assertJsonPath('data.grams', '200.00')
            ->assertJsonPath('data.calories', '730.00');
    }

    public function test_edit_cannot_touch_someone_elses_log(): void
    {
        $other = $this->makeAthlete();
        $log = MealLog::forceCreate([
            'athlete_id' => $other->athlete_id,
            'name' => 'Eggs',
            'meal_type' => 'breakfast',
            'calories' => 100,
            'consumed_at' => now()->subHour(),
        ]);

        $this->patchJson("/api/meal-logs/{$log->meal_log_id}", ['serving' => '1 egg'])
            ->assertNotFound();
    }

    // ---------- delete ----------

    public function test_delete_removes_the_log(): void
    {
        $id = $this->postJson('/api/meal-logs', $this->payload())->json('data.meal_log_id');

        $this->deleteJson("/api/meal-logs/{$id}")->assertNoContent();

        $this->assertDatabaseMissing('meal_logs', ['meal_log_id' => $id]);
    }

    public function test_delete_cannot_touch_someone_elses_log(): void
    {
        $other = $this->makeAthlete();
        $log = MealLog::forceCreate([
            'athlete_id' => $other->athlete_id,
            'name' => 'Eggs',
            'meal_type' => 'breakfast',
            'calories' => 100,
            'consumed_at' => now()->subHour(),
        ]);

        $this->deleteJson("/api/meal-logs/{$log->meal_log_id}")->assertNotFound();

        $this->assertDatabaseHas('meal_logs', ['meal_log_id' => $log->meal_log_id]);
    }
}
