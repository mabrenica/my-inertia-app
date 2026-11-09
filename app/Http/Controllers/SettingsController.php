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

        // Default common car maintenance services
        $defaultCarServices = [
            ['id' => 1, 'name' => 'Oil Change & Filter'],
            ['id' => 2, 'name' => 'Brake Pad Replacement'],
            ['id' => 3, 'name' => 'Tire Rotation & Balance'],
            ['id' => 4, 'name' => 'Battery Inspection & Replacement'],
            ['id' => 5, 'name' => 'Air Filter Replacement'],
            ['id' => 6, 'name' => 'Coolant Flush'],
        ];

        // Default common motorbike maintenance services
        $defaultMotoServices = [
            ['id' => 1, 'name' => 'Chain Cleaning & Lube'],
            ['id' => 2, 'name' => 'Oil Change'],
            ['id' => 3, 'name' => 'Tire Pressure & Tread Check'],
            ['id' => 4, 'name' => 'Brake Fluid & Pad Inspection'],
            ['id' => 5, 'name' => 'Spark Plug Replacement'],
        ];

        // Retrieve user preferences or create with defaults if it doesn't exist yet
        $preference = UserServicePreference::firstOrCreate(
            ['user_id' => $user->id],
            [
                'car_services' => $defaultCarServices,
                'moto_services' => $defaultMotoServices,
            ]
        );

        return Inertia::render('Settings', [
            'carServices' => $preference->car_services ?? [],
            'motoServices' => $preference->moto_services ?? [],
        ]);
    }

    public function update(Request $request)
    {
        // Changed 'required' to 'nullable' to allow completely empty arrays
        $request->validate([
            'car_services' => 'nullable|array',
            'moto_services' => 'nullable|array',
        ]);

        $user = $request->user();

        UserServicePreference::updateOrCreate(
            ['user_id' => $user->id],
            [
                'car_services' => $request->car_services ?? [],
                'moto_services' => $request->moto_services ?? [],
            ]
        );

        return redirect()->back()->with('success', 'Settings updated successfully!');
    }
}