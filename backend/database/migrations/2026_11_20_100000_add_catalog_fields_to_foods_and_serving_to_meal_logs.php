<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('foods', function (Blueprint $table) {
            // Shown on the food picker in the UI
            $table->string('emoji', 16)->nullable()->after('name');

            // What the per-100g values describe: "cooked", "dry", "boiled"...
            $table->string('prep', 40)->nullable()->after('emoji');

            // Countable foods: "3 eggs", "2 rice cakes".
            // unit_grams = weight of ONE unit in grams.
            $table->string('serving_unit', 40)->nullable()->after('fat_per_100g');
            $table->decimal('unit_grams', 8, 2)->nullable()->after('serving_unit');
        });

        Schema::table('meal_logs', function (Blueprint $table) {
            // What the user typed ("200g", "3 eggs"), kept for display.
            $table->string('serving', 100)->nullable()->after('grams');
        });
    }

    public function down(): void
    {
        Schema::table('meal_logs', function (Blueprint $table) {
            $table->dropColumn('serving');
        });

        Schema::table('foods', function (Blueprint $table) {
            $table->dropColumn(['emoji', 'prep', 'serving_unit', 'unit_grams']);
        });
    }
};
