<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserServicePreference;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Optional: Create a default test user and ensure preferences exist
        $user = User::firstOrCreate([
            'email' => 'test@test.com'
        ], [
            'name' => 'My Test',
            'password' => bcrypt('password'),
        ]);

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

        $defaultMotoServices = [
            ['id' => 1, 'name' => 'Engine Oil Change', 'interval_days' => 90, 'interval_odo' => 3000],
            ['id' => 2, 'name' => 'Spark Plug Inspection & Replacement', 'interval_days' => 365, 'interval_odo' => 12000],
            ['id' => 3, 'name' => 'Air Cleaner Element Replacement', 'interval_days' => 547, 'interval_odo' => 18000],
            ['id' => 4, 'name' => 'Drive Belt (CVT) Replacement', 'interval_days' => 730, 'interval_odo' => 24000],
            ['id' => 5, 'name' => 'Final Drive Gear Oil Change', 'interval_days' => 730, 'interval_odo' => 24000],
            ['id' => 6, 'name' => 'Brake Fluid Replacement', 'interval_days' => 730, 'interval_odo' => 24000],
            ['id' => 7, 'name' => 'Radiator Coolant Replacement', 'interval_days' => 1095, 'interval_odo' => 36000],
        ];

        UserServicePreference::firstOrCreate(
            ['user_id' => $user->id],
            [
                'car_services' => $defaultCarServices,
                'moto_services' => $defaultMotoServices,
            ]
        );
    }
}
