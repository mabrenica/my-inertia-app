<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\UserServicePreference;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Default car services with day and ODO interval fields
        $defaultCarServices = [
            ['id' => 1, 'name' => 'Oil Change & Filter', 'interval_days' => 180, 'interval_odo' => 5000],
            ['id' => 2, 'name' => 'Brake Pad Replacement', 'interval_days' => 365, 'interval_odo' => 20000],
            ['id' => 3, 'name' => 'Tire Rotation & Balance', 'interval_days' => 180, 'interval_odo' => 7500],
            ['id' => 4, 'name' => 'Battery Inspection & Replacement', 'interval_days' => 730, 'interval_odo' => 30000],
            ['id' => 5, 'name' => 'Air Filter Replacement', 'interval_days' => 365, 'interval_odo' => 12000],
            ['id' => 6, 'name' => 'Coolant Flush', 'interval_days' => 730, 'interval_odo' => 30000],
        ];

        // Default motorbike services with day and ODO interval fields
        $defaultMotoServices = [
            ['id' => 1, 'name' => 'Chain Cleaning & Lube', 'interval_days' => 30, 'interval_odo' => 500],
            ['id' => 2, 'name' => 'Oil Change', 'interval_days' => 90, 'interval_odo' => 3000],
            ['id' => 3, 'name' => 'Tire Pressure & Tread Check', 'interval_days' => 30, 'interval_odo' => 1000],
            ['id' => 4, 'name' => 'Brake Fluid & Pad Inspection', 'interval_days' => 180, 'interval_odo' => 6000],
            ['id' => 5, 'name' => 'Spark Plug Replacement', 'interval_days' => 365, 'interval_odo' => 10000],
        ];

        // Sort defaults alphabetically by service name
        usort($defaultCarServices, fn($a, $b) => strcasecmp($a['name'], $b['name']));
        usort($defaultMotoServices, fn($a, $b) => strcasecmp($a['name'], $b['name']));

        $preference = UserServicePreference::firstOrCreate(
            ['user_id' => $user->id],
            [
                'car_services' => $defaultCarServices,
                'moto_services' => $defaultMotoServices,
            ]
        );

        $carServices = $preference->car_services ?? [];
        $motoServices = $preference->moto_services ?? [];

        usort($carServices, fn($a, $b) => strcasecmp($a['name'], $b['name']));
        usort($motoServices, fn($a, $b) => strcasecmp($a['name'], $b['name']));

        return Inertia::render('Settings', [
            'carServices' => $carServices,
            'motoServices' => $motoServices,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'car_services' => 'nullable|array',
            'moto_services' => 'nullable|array',
        ]);

        $user = $request->user();

        $carServices = $request->car_services ?? [];
        $motoServices = $request->moto_services ?? [];

        usort($carServices, fn($a, $b) => strcasecmp($a['name'], $b['name']));
        usort($motoServices, fn($a, $b) => strcasecmp($a['name'], $b['name']));

        UserServicePreference::updateOrCreate(
            ['user_id' => $user->id],
            [
                'car_services' => $carServices,
                'moto_services' => $motoServices,
            ]
        );

        return redirect()->back()->with('success', 'Services updated successfully!');
    }
}