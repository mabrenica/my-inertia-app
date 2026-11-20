<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use App\Models\Vehicle;
use App\Models\UserServicePreference;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\VehicleMaintenanceLog;
use App\Support\OptimizedImageUploader;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->intended('/home');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $defaultCarServices = [
            ['id' => 1, 'name' => 'Engine Oil & Filter Change', 'interval_days' => 90, 'interval_odo' => 5000],
            ['id' => 2, 'name' => 'Tire Rotation & Balance', 'interval_days' => 180, 'interval_odo' => 10000],
            ['id' => 3, 'name' => 'Air Cleaner Filter Element Replacement', 'interval_days' => 365, 'interval_odo' => 20000],
            ['id' => 4, 'name' => 'Brake Fluid Replacement', 'interval_days' => 730, 'interval_odo' => 40000],
            ['id' => 5, 'name' => 'Fuel Filter Replacement', 'interval_days' => 730, 'interval_odo' => 40000],
            ['id' => 6, 'name' => 'CVT Fluid Replacement', 'interval_days' => 1460, 'interval_odo' => 80000],
            ['id' => 7, 'name' => 'Iridium Spark Plugs Replacement', 'interval_days' => 1825, 'interval_odo' => 100000],
            ['id' => 8, 'name' => 'Engine Coolant Flush (SLLC)', 'interval_days' => 2920, 'interval_odo' => 160000],
        ];

        $defaultMotoServices = [
            ['id' => 1, 'name' => 'Engine Oil Change', 'interval_days' => 90, 'interval_odo' => 3000],
            ['id' => 2, 'name' => 'Spark Plug Inspection & Replacement', 'interval_days' => 365, 'interval_odo' => 12000],
            ['id' => 3, 'name' => 'Air Cleaner Element Replacement', 'interval_days' => 547, 'interval_odo' => 18000],
            ['id' => 4, 'name' => 'Drive Belt (CVT) Replacement', 'interval_days' => 730, 'interval_odo' => 24000],
            ['id' => 5, 'name' => 'Final Drive Gear Oil Change', 'interval_days' => 730, 'interval_odo' => 24000],
            ['id' => 6, 'name' => 'Brake Fluid Replacement', 'interval_days' => 730, 'interval_odo' => 24000],
            ['id' => 7, 'name' => 'Radiator Coolant Replacement', 'interval_days' => 1095, 'interval_odo' => 36000],
        ];

        UserServicePreference::create([
            'user_id' => $user->id,
            'car_services' => $defaultCarServices,
            'moto_services' => $defaultMotoServices,
        ]);

        Auth::login($user);

        return redirect('/home');
    }

    public function home(Request $request)
    {
        $user = $request->user();
        $vehicles = $user->vehicles()->with('maintenanceLogs')->get();
        
        $preference = UserServicePreference::firstOrCreate(
            ['user_id' => $user->id],
            [
                'car_services' => [],
                'moto_services' => [],
            ]
        );

        return Inertia::render('Home', [
            'vehicles' => $vehicles,
            'servicePreferences' => [
                'car_services' => $preference->car_services ?? [],
                'moto_services' => $preference->moto_services ?? [],
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'max:255'],
            'nationality' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:255'],
        ]);

        $user->update($request->only([
            'name',
            'date_of_birth',
            'gender',
            'nationality',
            'address',
            'phone_number',
        ]));

        return back();
    }   

    public function updateAvatar(Request $request)
    {
        // 2,100 KB limit removed. React sends an optimized image, while
        // this 20 MB post-optimization safety cap protects the Wasmer runtime.
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:20480'],
        ]);

        $user = $request->user();
        $oldAvatar = $user->avatar;
        $newPath = null;

        try {
            $newPath = OptimizedImageUploader::store($request->file('avatar'), 'avatars', 'avatar', 640);
            $newUrl = Storage::disk('supabase')->url($newPath);
            $user->update(['avatar' => $newUrl]);
        } catch (\Throwable $exception) {
            if ($newPath !== null) {
                try {
                    Storage::disk('supabase')->delete($newPath);
                } catch (\Throwable $cleanupException) {
                    Log::warning('Unable to roll back uploaded avatar after failure', [
                        'message' => $cleanupException->getMessage(),
                    ]);
                }
            }

            Log::error('Failed to update user avatar', [
                'user_id' => $user->id,
                'message' => $exception->getMessage(),
            ]);

            return back()->withErrors([
                'avatar' => 'Something went wrong',
            ]);
        }

        // Delete the old file only after the new avatar is stored and saved.
        $this->deleteStoredFile($oldAvatar);

        return back();
    }

    public function removeAvatar(Request $request)
    {
        $user = $request->user();
        $oldAvatar = $user->avatar;

        try {
            $user->update(['avatar' => null]);
        } catch (\Throwable $exception) {
            Log::error('Failed to remove user avatar', [
                'user_id' => $user->id,
                'message' => $exception->getMessage(),
            ]);

            return back()->withErrors([
                'avatar' => 'Something went wrong',
            ]);
        }

        $this->deleteStoredFile($oldAvatar);

        return back();
    }

    public function storeVehicle(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:Car,Motorbike'],
            'make' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'year' => ['required', 'string', 'max:10'],
            'description' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:20480'],
        ]);

        $newPath = null;
        $photoUrl = null;

        if ($request->hasFile('photo')) {
            $newPath = OptimizedImageUploader::store($request->file('photo'), 'vehicles', 'photo', 1600);
            $photoUrl = Storage::disk('supabase')->url($newPath);
        }

        try {
            $request->user()->vehicles()->create([
                'type' => $validated['type'],
                'make' => $validated['make'],
                'model' => $validated['model'],
                'year' => $validated['year'],
                'description' => $validated['description'] ?? null,
                'photo' => $photoUrl,
            ]);
        } catch (\Throwable $exception) {
            if ($newPath !== null) {
                Storage::disk('supabase')->delete($newPath);
            }
            throw $exception;
        }

        return back()->with('success', 'Vehicle successfully added!');
    }

    public function updateVehicle(Request $request, $id)
    {
        $vehicle = Vehicle::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'type' => ['required', 'string', 'in:Car,Motorbike'],
            'make' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'year' => ['required', 'string', 'max:10'],
            'description' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:20480'],
            'remove_photo' => ['nullable', 'boolean'],
        ]);

        $oldPhotoUrl = $vehicle->photo;
        $photoUrl = $oldPhotoUrl;
        $newPath = null;

        if ($request->boolean('remove_photo')) {
            $photoUrl = null;
        }

        // A newly selected photo takes precedence over remove_photo.
        if ($request->hasFile('photo')) {
            $newPath = OptimizedImageUploader::store($request->file('photo'), 'vehicles', 'photo', 1600);
            $photoUrl = Storage::disk('supabase')->url($newPath);
        }

        try {
            $vehicle->update([
                'type' => $validated['type'],
                'make' => $validated['make'],
                'model' => $validated['model'],
                'year' => $validated['year'],
                'description' => $validated['description'] ?? null,
                'photo' => $photoUrl,
            ]);
        } catch (\Throwable $exception) {
            if ($newPath !== null) {
                Storage::disk('supabase')->delete($newPath);
            }
            throw $exception;
        }

        // Never delete the previous photo before the database update succeeds.
        if ($oldPhotoUrl && $oldPhotoUrl !== $photoUrl) {
            $this->deleteStoredFile($oldPhotoUrl);
        }

        return back()->with('success', 'Vehicle successfully updated!');
    }

    public function destroyVehicle(Request $request, $id)
    {
        $vehicle = Vehicle::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $photoUrl = $vehicle->photo;
        $vehicle->delete();
        $this->deleteStoredFile($photoUrl);

        return back()->with('success', 'Vehicle successfully deleted!');
    }

    public function showVehicle(Request $request, $id)
    {
        $vehicle = Vehicle::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $preference = UserServicePreference::where('user_id', $request->user()->id)->first();

        $services = [];
        if ($preference) {
            if (strtolower($vehicle->type) === 'car') {
                $services = $preference->car_services ?? [];
            } else {
                $services = $preference->moto_services ?? [];
            }
        }

        $logs = $vehicle->maintenanceLogs()->latest('date')->get();

        return Inertia::render('VehicleShow', [
            'vehicle' => $vehicle,
            'servicePreferences' => $services,
            'maintenanceLogs' => $logs,
        ]);
    }

    public function storeMaintenanceLog(Request $request, $id)
    {
        $vehicle = Vehicle::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $request->validate([
            'services' => 'required|array|min:1',
            'odo' => 'required|string',
            'date' => 'required|date',
            'cost' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        foreach ($request->services as $serviceName) {
            VehicleMaintenanceLog::create([
                'vehicle_id' => $vehicle->id,
                'services' => [$serviceName],
                'odo' => $request->odo,
                'date' => $request->date,
                'cost' => $request->cost,
                'notes' => $request->notes,
            ]);
        }

        return redirect()->back()->with('success', 'Maintenance logs added successfully!');
    }

    public function updateMaintenanceLog(Request $request, $id)
    {
        $log = VehicleMaintenanceLog::findOrFail($id);

        // Directly verify the vehicle belongs to the authenticated user
        $isOwner = Vehicle::where('id', $log->vehicle_id)
            ->where('user_id', $request->user()->id)
            ->exists();

        if (!$isOwner) {
            abort(403);
        }

        $request->validate([
            'services' => 'required|array|min:1',
            'odo' => 'required|string',
            'date' => 'required|date',
            'cost' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $log->update([
            'services' => $request->services,
            'odo' => $request->odo,
            'date' => $request->date,
            'cost' => $request->cost,
            'notes' => $request->notes,
        ]);

        return redirect()->back()->with('success', 'Maintenance log updated successfully!');
    }

    public function destroyMaintenanceLog(Request $request, $id)
    {
        $log = VehicleMaintenanceLog::findOrFail($id);

        // Directly verify the vehicle belongs to the authenticated user
        $isOwner = Vehicle::where('id', $log->vehicle_id)
            ->where('user_id', $request->user()->id)
            ->exists();

        if (!$isOwner) {
            abort(403);
        }

        $log->delete();

        return redirect()->back()->with('success', 'Maintenance log deleted successfully!');
    }

    public function updateVehicleOdo(Request $request, $id)
    {
        $vehicle = Vehicle::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'current_odo' => ['required', 'string', 'max:50'],
        ]);

        $vehicle->update([
            'current_odo' => $validated['current_odo'],
            'odo_updated_at' => now(),
        ]);

        return back()->with('success', 'Current ODO updated successfully!');
    }

    protected function deleteStoredFile(?string $url): void
    {
        if (!$url) {
            return;
        }

        // Derive the URL prefix from the active Supabase disk. This works
        // with BOTH production (fleetflow) and development (fleetflow-dev).
        $marker = 'fleetflow-path-check-marker';

        try {
            $exampleUrl = Storage::disk('supabase')->url($marker);
            $position = strpos($exampleUrl, $marker);

            if ($position === false) {
                return;
            }

            $prefix = substr($exampleUrl, 0, $position);
            if (!str_starts_with($url, $prefix)) {
                return; // Never delete files outside our configured bucket.
            }

            $relativeUrl = substr($url, strlen($prefix));
            $path = rawurldecode(parse_url($relativeUrl, PHP_URL_PATH) ?: '');

            // Only remove files managed by FleetFlow's photo upload paths.
            if (!preg_match('~^(avatars|vehicles)/[A-Za-z0-9._-]+\.(webp|png|jpe?g)$~i', $path)) {
                return;
            }

            Storage::disk('supabase')->delete($path);
        } catch (\Throwable $exception) {
            // A failed object cleanup must not undo a successful DB update.
            Log::warning('Unable to clean up a FleetFlow image', [
                'message' => $exception->getMessage(),
            ]);
        }
    }

}
