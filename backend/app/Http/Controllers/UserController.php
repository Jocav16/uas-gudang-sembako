<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Daftar semua user (Admin Only)
     */
    public function index(): JsonResponse
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')
                     ->latest()
                     ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Ubah role user (Admin Only)
     */
    public function updateRole(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'role' => 'required|in:admin,staff'
        ]);

        // Cegah admin menurunkan role dirinya sendiri
        if ($request->user()->id === $user->id && $data['role'] === 'staff') {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menurunkan role akun Anda sendiri.'
            ], 403);
        }

        $user->update(['role' => $data['role']]);

        return response()->json([
            'success' => true,
            'message' => "Role {$user->name} berhasil diubah menjadi {$data['role']}",
            'data' => $user
        ]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role'  => 'required|in:admin,staff',
        ]);

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Data user berhasil diperbarui',
            'data' => $user
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Tidak dapat menghapus akun Anda sendiri'], 403);
        }

        $user->delete();

        return response()->json(['success' => true, 'message' => 'User berhasil dihapus']);
    }
}