<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|exists:categories,id',
            'name'        => 'required|string|max:150|unique:items,name',
            'description' => 'nullable|string',
            'stock'       => 'required|integer|min:0',
            'price'       => 'required|numeric|min:0',
            'unit'        => 'required|string|max:20',
            'status'      => 'required|in:tersedia,habis,promo',
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Kategori wajib dipilih',
            'category_id.exists'   => 'Kategori tidak ditemukan',
            'name.required'        => 'Nama barang wajib diisi',
            'name.unique'          => 'Nama barang sudah digunakan',
            'stock.required'       => 'Stok wajib diisi',
            'stock.min'            => 'Stok tidak boleh negatif',
            'price.required'       => 'Harga wajib diisi',
            'price.min'            => 'Harga tidak boleh negatif',
            'unit.required'        => 'Satuan wajib diisi',
            'status.required'      => 'Status wajib diisi',
            'status.in'            => 'Status tidak valid',
        ];
    }
}