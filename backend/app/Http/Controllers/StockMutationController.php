<?php

namespace App\Http\Controllers;

use App\Models\StockMutation;
use App\Models\Item;
use App\Http\Requests\StoreStockMutationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockMutationController extends Controller
{

    public function index(Request $request): JsonResponse
    {
        $query = StockMutation::with('item.category');

        if ($request->filled('item_id')) {
            $query->where('item_id', $request->item_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $mutations = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $mutations
        ]);
    }

    public function store(StoreStockMutationRequest $request): JsonResponse
    {
        $data = $request->validated();
        $item = Item::findOrFail($data['item_id']);

        if ($data['type'] === 'masuk') {
            $item->stock += $data['quantity'];
            if ($item->stock > 0 && $item->status === 'habis') {
                $item->status = 'tersedia';
            }
        } else {
            if ($item->stock < $data['quantity']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stok tidak mencukupi untuk transaksi keluar'
                ], 422);
            }
            $item->stock -= $data['quantity'];
            if ($item->stock === 0) {
                $item->status = 'habis';
            }
        }

        $item->save();

        $mutation = StockMutation::create($data);
        $mutation->load('item.category');

        return response()->json([
            'success' => true,
            'message' => "Barang {$data['type']} berhasil dicatat",
            'data' => $mutation,
            'new_stock' => $item->stock
        ], 201);
    }

    public function destroy(StockMutation $stockMutation): JsonResponse
    {
        $item = $stockMutation->item;
        if ($stockMutation->type === 'masuk') {
            $item->stock -= $stockMutation->quantity;
        } else {
            $item->stock += $stockMutation->quantity;
        }
        $item->save();

        $stockMutation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Record mutasi berhasil dihapus dan stok dikembalikan'
        ]);
    }
}