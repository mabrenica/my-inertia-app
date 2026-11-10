<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SettingsController;


Route::get('/', function () {
    return Inertia::render('Login', [
        'title' => 'Marnel' 
    ]);
})->name('login');

Route::post('/login', [AuthController::class, 'login']);

Route::get('/create-account', function () {
    return Inertia::render('CreateAccount');
})->name('register');

Route::post('/create-account', [AuthController::class, 'register']);

Route::get('/home', function () {
    return Inertia::render('Home', [
        'vehicles' => Auth::user()->vehicles()->latest()->get(),
    ]);
})->middleware('auth')->name('home');

Route::get('/profile', function () {
    return Inertia::render('Profile', [
        'auth' => [
            'user' => Auth::user(),
        ]
    ]);
})->middleware('auth')->name('profile');

// Handle profile text details update
Route::patch('/profile', [AuthController::class, 'updateProfile'])->middleware('auth');

// Handle profile avatar photo update
Route::post('/profile/avatar', [AuthController::class, 'updateAvatar'])->middleware('auth');

Route::delete('/profile/avatar', [AuthController::class, 'removeAvatar'])->middleware('auth');

Route::post('/logout', function (Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect('/');
});

Route::middleware(['auth'])->group(function () {
    Route::post('/vehicles', [AuthController::class, 'storeVehicle']);
    Route::post('/vehicles/{vehicle}', [AuthController::class, 'updateVehicle']);
    Route::delete('/vehicles/{vehicle}', [AuthController::class, 'destroyVehicle']); 
});

Route::middleware(['auth'])->group(function () {
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::post('/settings/services', [SettingsController::class, 'update']);
});

Route::get('/vehicles/{vehicle}', [AuthController::class, 'showVehicle'])->middleware(['auth']);

Route::middleware(['auth'])->group(function () {
    Route::post('/vehicles/{vehicle}/maintenance-logs', [AuthController::class, 'storeMaintenanceLog']);
    Route::put('/maintenance-logs/{id}', [AuthController::class, 'updateMaintenanceLog']);
    Route::delete('/maintenance-logs/{id}', [AuthController::class, 'destroyMaintenanceLog']);
});