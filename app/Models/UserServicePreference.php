<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserServicePreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'car_services',
        'moto_services',
    ];

    protected $casts = [
        'car_services' => 'array',
        'moto_services' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}