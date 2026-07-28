<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'price',
        'original_price',
        'description',
        'condition',
        'brand',
        'category',
        'stock',
        'weight',
        'material',
        'tags',
        'status',
        'shopee_link',
        'photos',
        'variants',
    ];

    protected $casts = [
        'tags' => 'array',
        'photos' => 'array',
        'variants' => 'array',
        'price' => 'integer',
        'original_price' => 'integer',
        'stock' => 'integer',
    ];
}
