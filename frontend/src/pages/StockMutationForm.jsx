import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import itemService from '../api/itemService';
import stockMutationService from '../api/stockMutationService';

function StockMutationForm() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        item_id: '',
        type: 'masuk',
        quantity: 1,
        note: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await itemService.getAll();
            setItems(response.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value) || 1 : value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        try {
            setLoading(true);
            await stockMutationService.create(formData);
            toast.success(`Barang ${formData.type} berhasil dicatat!`);
            navigate('/stock-mutations');
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
                toast.error('Mohon periksa kembali form Anda.');
            } else {
                toast.error('Gagal mencatat transaksi');
            }
        } finally {
            setLoading(false);
        }
    };

    const selectedItem = items.find(item => item.id == formData.item_id);

    return (
        <div className="max-w-2xl mx-auto py-10">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">Input Barang Masuk/Keluar</h2>
                <p className="text-blue-200/60 text-sm mt-2">Catat pergerakan stok barang gudang</p>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block text-blue-100/90 text-sm font-semibold mb-3">
                            Tipe Transaksi <span className="text-cyan-400">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: 'masuk' }))}
                                className={`py-3 rounded-xl border-2 font-semibold transition-all ${formData.type === 'masuk'
                                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                                    : 'bg-white/5 border-white/10 text-blue-200/60 hover:border-white/20'
                                    }`}
                            >
                                Barang Masuk
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: 'keluar' }))}
                                className={`py-3 rounded-xl border-2 font-semibold transition-all ${formData.type === 'keluar'
                                    ? 'bg-red-500/20 border-red-400 text-red-300'
                                    : 'bg-white/5 border-white/10 text-blue-200/60 hover:border-white/20'
                                    }`}
                            >
                                Barang Keluar
                            </button>
                        </div>
                        {errors.type && <p className="text-red-300 text-xs mt-2">{errors.type[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-blue-100/90 text-sm font-semibold mb-2">
                            Pilih Barang <span className="text-cyan-400">*</span>
                        </label>
                        <select
                            name="item_id"
                            value={formData.item_id}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.item_id ? 'border-red-400/50' : 'border-white/10 focus:border-cyan-400/50'
                                } text-white focus:outline-none focus:ring-4 focus:ring-cyan-400/20 transition-all`}
                        >
                            <option value="" className="bg-slate-800">-- Pilih Barang --</option>
                            {items.map((item) => (
                                <option key={item.id} value={item.id} className="bg-slate-800">
                                    {item.name} (Stok: {item.stock} {item.unit})
                                </option>
                            ))}
                        </select>
                        {errors.item_id && <p className="text-red-300 text-xs mt-2">{errors.item_id[0]}</p>}

                        {selectedItem && (
                            <div className="mt-3 px-4 py-3 bg-blue-500/10 border border-blue-400/20 rounded-xl">
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-200/70">Stok Saat Ini:</span>
                                    <span className="text-white font-bold">
                                        {selectedItem.stock} {selectedItem.unit}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-blue-200/70">Status:</span>
                                    <span className="text-cyan-300 font-medium capitalize">{selectedItem.status}</span>
                                </div>
                                {formData.type === 'keluar' && (
                                    <div className="flex justify-between text-sm mt-1">
                                        <span className="text-blue-200/70">Sisa Setelah Keluar:</span>
                                        <span className={`font-bold ${selectedItem.stock - formData.quantity < 0
                                            ? 'text-red-300'
                                            : 'text-green-300'
                                            }`}>
                                            {selectedItem.stock - formData.quantity} {selectedItem.unit}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-blue-100/90 text-sm font-semibold mb-2">
                            Jumlah <span className="text-cyan-400">*</span>
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="1"
                            className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.quantity ? 'border-red-400/50' : 'border-white/10 focus:border-cyan-400/50'
                                } text-white focus:outline-none focus:ring-4 focus:ring-cyan-400/20 transition-all`}
                        />
                        {errors.quantity && <p className="text-red-300 text-xs mt-2">{errors.quantity[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-blue-100/90 text-sm font-semibold mb-2">
                            Catatan <span className="text-blue-200/50 font-normal">(Opsional)</span>
                        </label>
                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-200/40 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 focus:border-cyan-400/50 transition-all resize-none"
                            placeholder="Contoh: Pembelian dari supplier A, Penjualan ke toko B, dll..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                        <button
                            type="button"
                            onClick={() => navigate('/stock-mutations')}
                            className="px-6 py-3 rounded-xl bg-white/5 border border-white/20 text-blue-100 font-medium hover:bg-white/10 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.item_id}
                            className={`px-8 py-3 rounded-xl text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 ${formData.type === 'masuk'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-500/25'
                                : 'bg-gradient-to-r from-red-500 to-orange-500 shadow-red-500/25'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <span>{formData.type === 'masuk' ? 'Catat Masuk' : 'Catat Keluar'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StockMutationForm;