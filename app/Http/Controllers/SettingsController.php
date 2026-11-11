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

        // Recommended PMS intervals for Toyota Veloz V (1.5L Dual VVT-i / D-CVT)
        $defaultCarServices = [
            ['id' => 1, 'name' => 'Engine Oil & Filter Change', 'interval_days' => 180, 'interval_odo' => 5000],
            ['id' => 2, 'name' => 'Tire Rotation & Balance', 'interval_days' => 180, 'interval_odo' => 10000],
            ['id' => 3, 'name' => 'Air Cleaner Filter Element Replacement', 'interval_days' => 365, 'interval_odo' => 20000],
            ['id' => 4, 'name' => 'Brake Fluid Replacement', 'interval_days' => 730, 'interval_odo' => 40000],
            ['id' => 5, 'name' => 'Fuel Filter Replacement', 'interval_days' => 730, 'interval_odo' => 40000],
            ['id' => 6, 'name' => 'CVT Fluid Replacement', 'interval_days' => 1460, 'interval_odo' => 80000],
            ['id' => 7, 'name' => 'Iridium Spark Plugs Replacement', 'interval_days' => 1825, 'interval_odo' => 100000],
            ['id' => 8, 'name' => 'Engine Coolant Flush (SLLC)', 'interval_days' => 2920, 'interval_odo' => 160000],
        ];

        // Recommended PMS intervals for Honda ADV 160 (160cc eSP+)
        $defaultMotoServices = [
            ['id' => 1, 'name' => 'Engine Oil Change', 'interval_days' => 180, 'interval_odo' => 3000],
            ['id' => 2, 'name' => 'Spark Plug Inspection & Replacement', 'interval_days' => 365, 'interval_odo' => 12000],
            ['id' => 3, 'name' => 'Air Cleaner Element Replacement', 'interval_days' => 547, 'interval_odo' => 18000],
            ['id' => 4, 'name' => 'Drive Belt (CVT) Replacement', 'interval_days' => 730, 'interval_odo' => 24000],
            ['id' => 5, 'name' => 'Final Drive Gear Oil Change', 'interval_days' => 730, 'interval_odo' => 24000],
            ['id' => 6, 'name' => 'Brake Fluid Replacement', 'interval_days' => 730, 'interval_odo' => 24000],
            ['id' => 7, 'name' => 'Radiator Coolant Replacement', 'interval_days' => 1095, 'interval_odo' => 36000],
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