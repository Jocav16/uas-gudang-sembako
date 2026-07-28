<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Category;
use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ItemController extends Controller
{

        public function index(Request $request): JsonResponse
    {
        $query = Item::with('category');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $items = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    public function store(StoreItemRequest $request): JsonResponse
    {
        $data = $request->validated();

        $nextId = 1;
        $existingIds = Item::pluck('id')->toArray();
        while (in_array($nextId, $existingIds)) {
            $nextId++;
        }

        $item = new Item($data);
        $item->id = $nextId;
        $item->save();
        
        $item->load('category');

        return response()->json([
            'success' => true,
            'message' => 'Barang berhasil ditambahkan',
            'data' => $item
        ], 201);
    }

    public function show(Item $item): JsonResponse
    {
        $item->load('category');

        return response()->json([
            'success' => true,
            'data' => $item
        ]);
    }

    public function update(UpdateItemRequest $request, Item $item): JsonResponse
    {
        $item->update($request->validated());
        $item->load('category');

        return response()->json([
            'success' => true,
            'message' => 'Barang berhasil diperbarui',
            'data' => $item
        ]);
    }

    public function destroy(Item $item): JsonResponse
    {
        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Barang berhasil dihapus'
        ]);
    }
}