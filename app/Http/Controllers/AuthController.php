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
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2100'],
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            if ($user->avatar && !filter_var($user->avatar, FILTER_VALIDATE_URL) === false) {
                $this->deleteStoredFile($user->avatar);
            }

            $path = $request->file('avatar')->store('avatars', 'supabase');

            if (!$path) {
                abort(500, 'File upload failed.');
            }

            $url = Storage::disk('supabase')->url($path);

            $user->update(['avatar' => $url]);
        }

        return back();
    }

    public function removeAvatar(Request $request)
    {
        $user = $request->user();
        $user->update(['avatar' => null]);

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

        $photoUrl = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('vehicles', 'supabase');
            if ($path) {
                $photoUrl = Storage::disk('supabase')->url($path);
            }
        }

        $request->user()->vehicles()->create([
            'type' => $validated['type'],
            'make' => $validated['make'],
            'model' => $validated['model'],
            'year' => $validated['year'],
            'description' => $validated['description'] ?? null,
            'photo' => $photoUrl,
        ]);

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
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2100'],
            'remove_photo' => ['nullable', 'boolean'],
        ]);

        $photoUrl = $vehicle->photo;

        if ($request->boolean('remove_photo')) {
            if ($vehicle->photo && !filter_var($vehicle->photo, FILTER_VALIDATE_URL) === false) {
                $this->deleteStoredFile($vehicle->photo);
            }
            $photoUrl = null;
        }

        if ($request->hasFile('photo')) {
            if ($vehicle->photo && !filter_var($vehicle->photo, FILTER_VALIDATE_URL) === false) {
                $this->deleteStoredFile($vehicle->photo);
            }

            $path = $request->file('photo')->store('vehicles', 'supabase');
            if ($path) {
                $photoUrl = Storage::disk('supabase')->url($path);
            }
        }

        $vehicle->update([
            'type' => $validated['type'],
            'make' => $validated['make'],
            'model' => $validated['model'],
            'year' => $validated['year'],
            'description' => $validated['description'] ?? null,
            'photo' => $photoUrl,
        ]);

        return back()->with('success', 'Vehicle successfully updated!');
    }

    public function destroyVehicle(Request $request, $id)
    {
        $vehicle = Vehicle::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($vehicle->photo && !filter_var($vehicle->photo, FILTER_VALIDATE_URL) === false) {
            $this->deleteStoredFile($vehicle->photo);
        }

        $vehicle->delete();

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

    protected function deleteStoredFile($url)
    {
        $parsedUrl = parse_url($url, PHP_URL_PATH);
        $prefix = '/storage/v1/object/public/fleetflow/';
        
        if (str_starts_with($parsedUrl, $prefix)) {
            $path = substr($parsedUrl, strlen($prefix));
            Storage::disk('supabase')->delete($path);
        }
    }
}