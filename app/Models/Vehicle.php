<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'make',
        'model',
        'year',
        'description',
        'current_odo',
        'odo_updated_at',
        'photo',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function maintenanceLogs()
    {
        return $this->hasMany(VehicleMaintenanceLog::class)->latest('date');
    }
}