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

        Auth::login($user);

        return redirect('/home');
    }

    public function home(Request $request)
    {
        $user = $request->user();
        
        // Load vehicles along with their maintenance logs
        $vehicles = $user->vehicles()->with('maintenanceLogs')->get();
        
        // Retrieve or create service preferences for the user
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
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2100'],
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->update(['avatar' => $path]);
        }

        return back();
    }

    public function removeAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->avatar) {
            if (Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->update(['avatar' => null]);
        }

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
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2100'],
        ]);

        $path = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('vehicles', 'public');
        }

        $request->user()->vehicles()->create([
            'type' => $validated['type'],
            'make' => $validated['make'],
            'model' => $validated['model'],
            'year' => $validated['year'],
            'description' => $validated['description'] ?? null,
            'photo' => $path,
        ]);

        return back()->with('success', 'Vehicle successfully added!');
    }

    public function updateVehicle(Request $request, Vehicle $vehicle)
    {
        if ($vehicle->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => ['required', 'string', 'in:Car,Motorbike'],
            'make' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'year' => ['required', 'string', 'max:10'],
            'description' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2100'],
            'remove_photo' => ['nullable', 'boolean'],
        ]);

        $path = $vehicle->photo;

        if ($request->boolean('remove_photo')) {
            if ($vehicle->photo && Storage::disk('public')->exists($vehicle->photo)) {
                Storage::disk('public')->delete($vehicle->photo);
            }
            $path = null;
        }

        if ($request->hasFile('photo')) {
            if ($vehicle->photo && Storage::disk('public')->exists($vehicle->photo)) {
                Storage::disk('public')->delete($vehicle->photo);
            }
            $path = $request->file('photo')->store('vehicles', 'public');
        }

        $vehicle->update([
            'type' => $validated['type'],
            'make' => $validated['make'],
            'model' => $validated['model'],
            'year' => $validated['year'],
            'description' => $validated['description'] ?? null,
            'photo' => $path,
        ]);

        return back()->with('success', 'Vehicle successfully updated!');
    }

    public function destroyVehicle(Request $request, Vehicle $vehicle)
    {
        if ($vehicle->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($vehicle->photo && Storage::disk('public')->exists($vehicle->photo)) {
            Storage::disk('public')->delete($vehicle->photo);
        }

        $vehicle->delete();

        return back()->with('success', 'Vehicle successfully deleted!');
    }

    public function showVehicle(Vehicle $vehicle)
    {
        // Ensure the authenticated user owns this vehicle
        if ($vehicle->user_id !== auth()->id()) {
            abort(403);
        }

        // Retrieve user service preferences to prepopulate options based on vehicle type
        $preference = UserServicePreference::where('user_id', auth()->id())->first();

        $services = [];
        if ($preference) {
            if (strtolower($vehicle->type) === 'car') {
                $services = $preference->car_services ?? [];
            } else {
                $services = $preference->moto_services ?? [];
            }
        }

        // Fetch maintenance logs sorted by date descending (latest first)
        $logs = $vehicle->maintenanceLogs()->latest('date')->get();

        return Inertia::render('VehicleShow', [
            'vehicle' => $vehicle,
            'servicePreferences' => $services,
            'maintenanceLogs' => $logs,
        ]);
    }

    public function storeMaintenanceLog(Request $request, Vehicle $vehicle)
    {
        // Ensure the authenticated user owns this vehicle
        if ($vehicle->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'services' => 'required|array|min:1',
            'odo' => 'required|string',
            'date' => 'required|date',
            'cost' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        // Create an individual record for each selected service
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

        if ($log->vehicle->user_id !== auth()->id()) {
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

    public function destroyMaintenanceLog($id)
    {
        $log = VehicleMaintenanceLog::findOrFail($id);

        if ($log->vehicle->user_id !== auth()->id()) {
            abort(403);
        }

        $log->delete();

        return redirect()->back()->with('success', 'Maintenance log deleted successfully!');
    }

    public function updateVehicleOdo(Request $request, Vehicle $vehicle)
    {
        if ($vehicle->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'current_odo' => ['required', 'string', 'max:50'],
        ]);

        $vehicle->update([
            'current_odo' => $validated['current_odo'],
            'odo_updated_at' => now(),
        ]);

        return back()->with('success', 'Current ODO updated successfully!');
    }

    // Helper function to calculate maintenance statuses for a vehicle
    private function getVehicleServiceStatuses($vehicle)
    {
        $servicePreferences = $vehicle->user->servicePreferences ?? []; 
        $maintenanceLogs = $vehicle->maintenanceLogs;
        
        // Determine service list based on vehicle type (Car vs Motorbike)
        $preferences = (strtolower($vehicle->type) === 'car') 
            ? ($servicePreferences->car_services ?? []) 
            : ($servicePreferences->moto_services ?? []);

        $today = now()->format('Y-m-d');
        $currentOdo = (int) ($vehicle->current_odo ?? 0);
        
        $statuses = [];

        foreach ($preferences as $pref) {
            $name = $pref['name'];
            $intervalDays = isset($pref['interval_days']) ? (int) $pref['interval_days'] : null;
            $intervalOdo = isset($pref['interval_odo']) ? (int) $pref['interval_odo'] : null;

            // Find matching logs for this service
            $matchingLogs = $maintenanceLogs->filter(function ($log) use ($name) {
                return $log->services && in_array($name, $log->services);
            });

            $latestDate = $matchingLogs->max('date');
            $highestOdo = $matchingLogs->max(fn($l) => (int) $l->odo);

            // Calculate next target date
            $nextDate = null;
            $dateStatus = null; // 'past_due', 'upcoming', or 'normal'
            if ($latestDate && $intervalDays) {
                $nextDate = \Carbon\Carbon::parse($latestDate)->addDays($intervalDays)->format('Y-m-d');
                $diffDays = now()->startOfDay()->diffInDays(\Carbon\Carbon::parse($nextDate), false);

                if ($diffDays < 0) {
                    $dateStatus = 'past_due';
                } elseif ($diffDays <= 15) {
                    $dateStatus = 'upcoming';
                }
            }

            // Calculate next target ODO
            $nextOdo = null;
            $odoStatus = null; // 'past_due', 'upcoming', or 'normal'
            if ($highestOdo !== null && $intervalOdo !== null) {
                $nextOdo = $highestOdo + $intervalOdo;
                $odoDiff = $nextOdo - $currentOdo;

                if ($odoDiff <= 0) {
                    $odoStatus = 'past_due'; 
                } elseif ($odoDiff <= 1000) {
                    $odoStatus = 'upcoming'; 
                }
            }

            // If either metric is past due or upcoming, record it
            if ($dateStatus || $odoStatus) {
                $statuses[] = [
                    'service_name' => $name,
                    'date_status' => $dateStatus, 
                    'next_date' => $nextDate,
                    'odo_status' => $odoStatus,   
                    'next_odo' => $nextOdo,
                ];
            }
        }

        return $statuses;
    }
}