<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'stock',
        'price',
        'unit',
        'status',
    ];

    protected $casts = [
        'stock' => 'integer',
        'price' => 'decimal:2',
    ];

    /**
     * Get the category that owns the item
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function mutations(): HasMany
    {
        return $this->hasMany(StockMutation::class)->latest();
    }
}