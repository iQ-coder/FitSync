<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('progress_weights', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('athlete_id');
            $table->date('date');
            $table->decimal('weight', 5, 1);
            $table->timestamps();
            $table->foreign('athlete_id')->references('athlete_id')->on('athletes')->cascadeOnDelete();
            $table->unique(['athlete_id', 'date']);
        });

        Schema::create('progress_goals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('athlete_id')->unique();
            $table->decimal('goal_weight', 5, 1);
            $table->timestamps();
            $table->foreign('athlete_id')->references('athlete_id')->on('athletes')->cascadeOnDelete();
        });

        Schema::create('progress_measurements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('athlete_id');
            $table->date('date');
            $table->decimal('chest', 5, 1)->nullable();
            $table->decimal('waist', 5, 1)->nullable();
            $table->decimal('hips', 5, 1)->nullable();
            $table->decimal('arm', 5, 1)->nullable();
            $table->decimal('thigh', 5, 1)->nullable();
            $table->timestamps();
            $table->foreign('athlete_id')->references('athlete_id')->on('athletes')->cascadeOnDelete();
            $table->unique(['athlete_id', 'date']);
        });

        Schema::create('progress_photos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('athlete_id');
            $table->date('date');
            $table->string('label', 80);
            $table->string('path');
            $table->timestamps();
            $table->foreign('athlete_id')->references('athlete_id')->on('athletes')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('progress_photos');
        Schema::dropIfExists('progress_measurements');
        Schema::dropIfExists('progress_goals');
        Schema::dropIfExists('progress_weights');
    }
};
