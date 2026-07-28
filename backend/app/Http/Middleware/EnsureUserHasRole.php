<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Cek apakah user sudah login
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Cek apakah role user sesuai dengan yang diminta
        if ($request->user()->role !== $role) {
            return response()->json([
                'message' => 'Akses ditolak. Anda tidak memiliki hak akses ini.'
            ], 403); // 403 Forbidden
        }

        return $next($request);
    }
}