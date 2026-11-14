<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(FoodSeeder::class);

        // المستخدمين التجريبيين: local/testing فقط
        if (app()->environment('local', 'testing')) {
            $this->call(MealTrackingSeeder::class);
        }
    }
}
