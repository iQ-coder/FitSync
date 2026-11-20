<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Athlete;
use App\Models\ProgressGoal;
use App\Models\ProgressMeasurement;
use App\Models\ProgressPhoto;
use App\Models\ProgressWeight;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProgressController extends Controller
{
    /** Return the authenticated athlete, following the project's existing access rules. */
    private function athlete(Request $request): Athlete
    {
        abort_unless(
            $request->user()->is_active && $request->user()->role === 'athlete',
            403,
            'Only active athletes can access progress data.'
        );

        $athlete = $request->user()->athlete;
        abort_unless($athlete, 403, 'Athlete profile was not found.');

        return $athlete;
    }

    /** Initial data required by the Progress page. */
    public function index(Request $request)
    {
        $athlete = $this->athlete($request);

        return response()->json([
            'weights' => $athlete->progressWeights()
                ->orderBy('date')->get(['id', 'date', 'weight']),
            'goal' => $athlete->progressGoal?->goal_weight,
            'measurements' => $athlete->progressMeasurements()
                ->orderBy('date')->get(['id', 'date', 'chest', 'waist', 'hips', 'arm', 'thigh']),
            'photos' => $athlete->progressPhotos()
                ->orderBy('date')->get()
                ->map(fn (ProgressPhoto $photo) => $this->photoData($photo)),
        ]);
    }

    public function weights(Request $request)
    {
        $athlete = $this->athlete($request);

        return response()->json([
            'data' => $athlete->progressWeights()->orderBy('date')->get(['id', 'date', 'weight']),
        ]);
    }

    public function storeWeight(Request $request)
    {
        $athlete = $this->athlete($request);
        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'weight' => ['required', 'numeric', 'gt:0', 'lte:500'],
        ]);

        // One weight record per day, matching the frontend's date-based replacement behavior.
        $weight = $athlete->progressWeights()->updateOrCreate(
            ['date' => $data['date']],
            ['weight' => $data['weight']]
        );

        return response()->json([
            'message' => 'Weight saved successfully.',
            'data' => [
                'id' => $weight->id,
                'date' => $weight->date->format('Y-m-d'),
                'weight' => (float) $weight->weight,
            ],
        ], 201);
    }

    public function destroyWeight(Request $request, string $date)
    {
        $athlete = $this->athlete($request);
        abort_unless(preg_match('/^\d{4}-\d{2}-\d{2}$/', $date), 422, 'Invalid date.');

        $deleted = $athlete->progressWeights()->whereDate('date', $date)->delete();
        abort_unless($deleted, 404, 'Weight record not found.');

        return response()->json(['message' => 'Weight deleted successfully.']);
    }

    public function showGoal(Request $request)
    {
        $athlete = $this->athlete($request);

        return response()->json([
            'goal' => $athlete->progressGoal?->goal_weight,
        ]);
    }

    public function saveGoal(Request $request)
    {
        $athlete = $this->athlete($request);
        $data = $request->validate([
            'goal_weight' => ['required', 'numeric', 'gt:0', 'lte:500'],
        ]);

        $goal = $athlete->progressGoal()->updateOrCreate(
            ['athlete_id' => $athlete->athlete_id],
            ['goal_weight' => $data['goal_weight']]
        );

        return response()->json([
            'message' => 'Goal saved successfully.',
            'goal' => (float) $goal->goal_weight,
        ]);
    }

    public function measurements(Request $request)
    {
        $athlete = $this->athlete($request);

        return response()->json([
            'data' => $athlete->progressMeasurements()->orderBy('date')->get([
                'id', 'date', 'chest', 'waist', 'hips', 'arm', 'thigh',
            ]),
        ]);
    }

    public function storeMeasurement(Request $request)
    {
        $athlete = $this->athlete($request);
        $data = $request->validate([
            'date' => ['sometimes', 'date_format:Y-m-d', 'before_or_equal:today'],
            'chest' => ['nullable', 'numeric', 'gt:0', 'lte:300'],
            'waist' => ['nullable', 'numeric', 'gt:0', 'lte:300'],
            'hips' => ['nullable', 'numeric', 'gt:0', 'lte:300'],
            'arm' => ['nullable', 'numeric', 'gt:0', 'lte:150'],
            'thigh' => ['nullable', 'numeric', 'gt:0', 'lte:200'],
        ]);

        $date = $data['date'] ?? now()->toDateString();
        $keys = ['chest', 'waist', 'hips', 'arm', 'thigh'];
        $previous = $athlete->progressMeasurements()
            ->whereDate('date', '<=', $date)
            ->orderByDesc('date')
            ->first();
        $values = [];
        $hasInput = false;

        foreach ($keys as $key) {
            if (array_key_exists($key, $data) && $data[$key] !== null) {
                $values[$key] = $data[$key];
                $hasInput = true;
            } else {
                $values[$key] = $previous?->{$key};
            }
        }

        abort_unless($hasInput, 422, 'Enter at least one body measurement.');

        $measurement = $athlete->progressMeasurements()->updateOrCreate(
            ['date' => $date],
            $values
        );

        return response()->json([
            'message' => 'Measurements saved successfully.',
            'data' => $measurement->fresh()->only([
                'id', 'date', 'chest', 'waist', 'hips', 'arm', 'thigh',
            ]),
        ], 201);
    }

    public function photos(Request $request)
    {
        $athlete = $this->athlete($request);

        return response()->json([
            'data' => $athlete->progressPhotos()->orderBy('date')->get()
                ->map(fn (ProgressPhoto $photo) => $this->photoData($photo)),
        ]);
    }

    
public function storePhoto(Request $request)
{
    $athlete = $this->athlete($request);

    $data = $request->validate([
        'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
        'date' => ['sometimes', 'date_format:Y-m-d', 'before_or_equal:today'],
        'label' => ['nullable', 'string', 'max:80'],
    ]);

    $path = $request->file('image')->store(
        'progress-photos/'.$athlete->athlete_id,
        'public'
    );

    try {
        $count = $athlete->progressPhotos()->count() + 1;

        $photo = $athlete->progressPhotos()->create([
            'date' => $data['date'] ?? now()->toDateString(),
            'label' => $data['label'] ?? 'Photo '.$count,
            'path' => $path,
        ]);
    } catch (\Throwable $exception) {
        Storage::disk('public')->delete($path);
        throw $exception;
    }

    return response()->json([
        'message' => 'Progress photo uploaded successfully.',
        'data' => $this->photoData($photo),
    ], 201);
}


    public function destroyPhoto(Request $request, int $id)
    {
        $athlete = $this->athlete($request);
        $photo = $athlete->progressPhotos()->findOrFail($id);

        Storage::disk('public')->delete($photo->path);
        $photo->delete();

        return response()->json(['message' => 'Progress photo deleted successfully.']);
    }

    private function photoData(ProgressPhoto $photo): array
    {
        return [
            'id' => $photo->id,
            'date' => $photo->date->format('Y-m-d'),
            'label' => $photo->label,
            'url' => Storage::disk('public')->url($photo->path),
        ];
    }
}
