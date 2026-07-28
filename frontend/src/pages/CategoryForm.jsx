import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import categoryService from '../api/categoryService';
import toast from 'react-hot-toast';

function CategoryForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const response = await categoryService.getById(id);
            setFormData({
                name: response.data.name,
                description: response.data.description || '',
            });
        } catch (err) {
            setSubmitError('Gagal memuat data kategori');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        setErrors({});

        try {
            setLoading(true);
            if (isEditMode) {
                await categoryService.update(id, formData);
                toast.success('Kategori berhasil diperbarui!');
            } else {
                await categoryService.create(formData);
                toast.success('Kategori berhasil ditambahkan!');
            }
            navigate('/');
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
                toast.error('Mohon periksa kembali form Anda.');
            } else {
                toast.error('Terjadi kesalahan pada server.');
                setSubmitError(isEditMode ? 'Gagal memperbarui kategori' : 'Gagal menambahkan kategori');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-400/20 border-t-cyan-400 animate-spin"></div>
                    <p className="mt-4 text-blue-200/70">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    {isEditMode ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                </h2>
                <p className="text-blue-200/60 text-sm mt-2">
                    {isEditMode ? 'Perbarui informasi kategori' : 'Isi form di bawah untuk menambah kategori baru'}
                </p>
            </div>

            {submitError && (
                <div className="backdrop-blur-xl bg-red-500/10 border border-red-400/30 text-red-200 px-6 py-4 rounded-2xl mb-6 flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {submitError}
                </div>
            )}

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-blue-100/90 text-sm font-semibold mb-2" htmlFor="name">
                            Nama Kategori
                            <span className="text-cyan-400 ml-1">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.name
                                ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20'
                                : 'border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/20'
                                } text-white placeholder-blue-200/40 focus:outline-none focus:ring-4 transition-all duration-200`}
                            placeholder="Contoh: Bumbu Dapur"
                        />
                        {errors.name && (
                            <p className="text-red-300 text-xs mt-2 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-red-300"></span>
                                {errors.name[0]}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-blue-100/90 text-sm font-semibold mb-2" htmlFor="description">
                            Deskripsi
                            <span className="text-blue-200/50 ml-1 font-normal">(Opsional)</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.description
                                ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20'
                                : 'border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/20'
                                } text-white placeholder-blue-200/40 focus:outline-none focus:ring-4 transition-all duration-200 resize-none`}
                            placeholder="Tambahkan deskripsi singkat tentang kategori ini..."
                        />
                        {errors.description && (
                            <p className="text-red-300 text-xs mt-2 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-red-300"></span>
                                {errors.description[0]}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-6 py-3 rounded-xl bg-white/5 border border-white/20 text-blue-100 font-medium hover:bg-white/10 hover:border-white/30 transition-all duration-200"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <span>{isEditMode ? 'Perbarui' : 'Simpan'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-6 backdrop-blur-xl bg-blue-500/5 border border-blue-400/20 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-200/70">
                        <p className="font-medium text-blue-100 mb-1">Informasi</p>
                        <p>Nama kategori harus unik dan tidak boleh sama dengan kategori yang sudah ada.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CategoryForm;