<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('meal_logs', function (Blueprint $table) {
            $table->unsignedBigInteger('food_id')->nullable()->after('meal_id');
            $table->decimal('grams', 8, 2)->nullable()->after('meal_type');
            $table->decimal('protein_g', 8, 2)->nullable()->after('calories');
            $table->decimal('carbs_g', 8, 2)->nullable()->after('protein_g');
            $table->decimal('fat_g', 8, 2)->nullable()->after('carbs_g');

            $table->foreign('food_id')
                ->references('food_id')
                ->on('foods')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('meal_logs', function (Blueprint $table) {
            $table->dropForeign(['food_id']);
            $table->dropColumn([
                'food_id', 'grams', 'protein_g', 'carbs_g', 'fat_g',
            ]);
        });
    }
};
