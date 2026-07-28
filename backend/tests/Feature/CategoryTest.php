<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_category(): void
    {
        $response = $this->postJson('/api/categories', [
            'name' => 'Bumbu Dapur',
            'description' => 'Berbagai macam bumbu dapur'
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'data' => [
                         'id',
                         'name',
                         'description',
                         'created_at',
                         'updated_at'
                     ]
                 ]);
    }

    public function test_can_update_category(): void
    {
        $category = Category::create([
            'name' => 'Makanan Ringan',
            'description' => 'Camilan dan snack'
        ]);

        $response = $this->putJson("/api/categories/{$category->id}", [
            'name' => 'Makanan Ringan & Camilan',
            'description' => 'Berbagai macam snack'
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Kategori berhasil diperbarui',
                     'data' => [
                         'id' => $category->id,
                         'name' => 'Makanan Ringan & Camilan',
                         'description' => 'Berbagai macam snack'
                     ]
                 ]);
    }
}
