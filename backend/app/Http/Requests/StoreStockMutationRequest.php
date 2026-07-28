<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStockMutationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'item_id'   => 'required|exists:items,id',
            'type'      => 'required|in:masuk,keluar',
            'quantity'  => 'required|integer|min:1',
            'note'      => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'item_id.required'   => 'Barang wajib dipilih',
            'item_id.exists'     => 'Barang tidak ditemukan',
            'type.required'      => 'Tipe transaksi wajib dipilih',
            'type.in'            => 'Tipe harus masuk atau keluar',
            'quantity.required'  => 'Jumlah wajib diisi',
            'quantity.integer'   => 'Jumlah harus berupa angka',
            'quantity.min'       => 'Jumlah minimal 1',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->type === 'keluar') {
                $item = \App\Models\Item::find($this->item_id);
                if ($item && $item->stock < $this->quantity) {
                    $validator->errors()->add('quantity', 
                        "Stok tidak mencukupi. Stok tersedia: {$item->stock}");
                }
            }
        });
    }
}