<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FoodController;
use App\Http\Controllers\Api\MealLogController;
use App\Http\Controllers\Api\ProgressController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

// مؤقتاً للتجربة بدون auth:sanctum (الأصل داخل المجموعة أدناه معلق):
// Foods
Route::get('/foods', [FoodController::class, 'index']);
Route::post('/foods/calculate', [FoodController::class, 'calculate']);

// Meal Logs
Route::get('/meal-logs/summary', [
    MealLogController::class,
    'summary',
]);

Route::get('/meal-logs', [
    MealLogController::class,
    'index',
]);

Route::post('/meal-logs', [
    MealLogController::class,
    'store',
]);

Route::patch('/meal-logs/{id}', [
    MealLogController::class,
    'update',
])->whereNumber('id');

Route::delete('/meal-logs/{id}', [
    MealLogController::class,
    'destroy',
])->whereNumber('id');

Route::middleware('auth:sanctum')->group(function () {

    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);

    // Foods (معلقة مؤقتاً لأنها نُقلت للأعلى للتجربة)
    // Route::get('/foods', [FoodController::class, 'index']);
    // Route::post('/foods/calculate', [FoodController::class, 'calculate']);

    // Planned Meals
    Route::get('/planned-meals', [
        MealLogController::class,
        'plannedMeals',
    ]);

    // Meal Logs (معلقة مؤقتاً لأنها نُقلت للأعلى للتجربة)
    // Route::get('/meal-logs/summary', [
    //     MealLogController::class,
    //     'summary',
    // ]);
    //
    // Route::get('/meal-logs', [
    //     MealLogController::class,
    //     'index',
    // ]);
    //
    // Route::post('/meal-logs', [
    //     MealLogController::class,
    //     'store',
    // ]);
    //
    // Route::patch('/meal-logs/{id}', [
    //     MealLogController::class,
    //     'update',
    // ])->whereNumber('id');
    //
    // Route::delete('/meal-logs/{id}', [
    //     MealLogController::class,
    //     'destroy',
    // ])->whereNumber('id');

    // Progress API
    Route::get('/progress', [
        ProgressController::class,
        'index',
    ]);

    Route::get('/progress/weights', [
        ProgressController::class,
        'weights',
    ]);

    Route::post('/progress/weights', [
        ProgressController::class,
        'storeWeight',
    ]);

    Route::delete('/progress/weights/{date}', [
        ProgressController::class,
        'destroyWeight',
    ])->where('date', '\d{4}-\d{2}-\d{2}');

    Route::get('/progress/goal', [
        ProgressController::class,
        'showGoal',
    ]);

    Route::put('/progress/goal', [
        ProgressController::class,
        'saveGoal',
    ]);

    Route::get('/progress/measurements', [
        ProgressController::class,
        'measurements',
    ]);

    Route::post('/progress/measurements', [
        ProgressController::class,
        'storeMeasurement',
    ]);

    Route::get('/progress/photos', [
        ProgressController::class,
        'photos',
    ]);

    Route::post('/progress/photos', [
        ProgressController::class,
        'storePhoto',
    ]);

    Route::delete('/progress/photos/{id}', [
        ProgressController::class,
        'destroyPhoto',
    ])->whereNumber('id');

    // Nutritionist
    Route::get('/nutritionist/athletes/{athleteId}/meal-logs', [
        MealLogController::class,
        'nutritionistIndex',
    ])->whereNumber('athleteId');

});