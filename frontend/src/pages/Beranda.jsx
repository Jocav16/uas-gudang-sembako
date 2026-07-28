import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Package,
    FolderOpen,
    Boxes,
    TrendingUp,
    TrendingDown,
    Plus,
    ArrowDownToLine,
    ArrowUpFromLine,
    Zap,
    Loader2,
    Activity,
    BarChart3,
    ArrowRight,
    Warehouse,
    ClipboardList,
} from 'lucide-react';
import categoryService from '../api/categoryService';
import itemService from '../api/itemService';
import stockMutationService from '../api/stockMutationService';
import { useAuth } from '../context/AuthContext';

// Animated counter hook
function useCountUp(target, duration = 1200) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (target === 0) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setValue(target); clearInterval(timer); }
            else setValue(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return value;
}

function StatCard({ label, value, displayValue, icon: Icon, color, suffix = '' }) {
    const count = useCountUp(typeof value === 'number' ? value : 0);

    const colorMap = {
        blue:   { bg: 'from-blue-500/20 to-blue-600/5',   border: 'border-blue-500/30',   icon: 'bg-blue-500/20 text-blue-300',   glow: 'shadow-blue-500/20',  text: 'text-blue-300' },
        cyan:   { bg: 'from-cyan-500/20 to-cyan-600/5',   border: 'border-cyan-500/30',   icon: 'bg-cyan-500/20 text-cyan-300',   glow: 'shadow-cyan-500/20',  text: 'text-cyan-300' },
        emerald:{ bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/30', icon: 'bg-emerald-500/20 text-emerald-300', glow: 'shadow-emerald-500/20', text: 'text-emerald-300' },
        amber:  { bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/30', icon: 'bg-amber-500/20 text-amber-300', glow: 'shadow-amber-500/20',  text: 'text-amber-300' },
    };
    const c = colorMap[color];

    return (
        <div className={`relative overflow-hidden backdrop-blur-xl bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-6 shadow-lg ${c.glow} hover:scale-[1.02] transition-transform duration-300`}>
            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-30 bg-current ${c.text}`} />
            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-blue-200/60 text-sm font-medium mb-1">{label}</p>
                    <h3 className="text-3xl font-bold text-white tracking-tight">
                        {displayValue !== undefined
                            ? <span className="text-xl">{displayValue}</span>
                            : <>{count.toLocaleString('id-ID')}<span className="text-base font-normal text-blue-200/50 ml-1">{suffix}</span></>
                        }
                    </h3>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${c.icon} flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}

function QuickActionCard({ to, icon: Icon, label, desc, colorFrom, colorTo, glowColor }) {
    return (
        <Link
            to={to}
            className="group relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ '--glow': glowColor }}
        >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${colorFrom} ${colorTo}`} />
            <div className="relative">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorFrom} ${colorTo} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-1 group-hover:text-white transition-colors">{label}</h4>
                <p className="text-blue-200/60 text-sm group-hover:text-blue-200/80 transition-colors">{desc}</p>
                <ArrowRight className="absolute bottom-0 right-0 w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-300" />
            </div>
        </Link>
    );
}

function MutationBadge({ type }) {
    if (type === 'masuk') return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-300 text-xs font-medium border border-emerald-400/20">
            <ArrowDownToLine className="w-3 h-3" /> Masuk
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-400/15 text-red-300 text-xs font-medium border border-red-400/20">
            <ArrowUpFromLine className="w-3 h-3" /> Keluar
        </span>
    );
}

function Beranda() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalKategori: 0, totalBarang: 0, totalStok: 0, totalAset: 0 });
    const [recentMutations, setRecentMutations] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [catRes, itemRes, mutRes] = await Promise.all([
                categoryService.getAll(),
                itemService.getAll(),
                stockMutationService.getAll(),
            ]);

            const items = itemRes.data || [];
            const mutations = mutRes.data || [];

            setStats({
                totalKategori: (catRes.data || []).length,
                totalBarang: items.length,
                totalStok: items.reduce((a, i) => a + (Number(i.stock) || 0), 0),
                totalAset: items.reduce((a, i) => a + (Number(i.stock) || 0) * (Number(i.price) || 0), 0),
            });

            // 5 mutasi terbaru
            setRecentMutations(mutations.slice(0, 5));

            // Barang stok rendah (≤ 10)
            setLowStockItems(items.filter(i => Number(i.stock) <= 10).slice(0, 5));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (n) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-14 flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                        <Warehouse className="w-7 h-7 text-cyan-400 absolute inset-0 m-auto" />
                    </div>
                    <p className="text-blue-200/70 font-medium">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    const isAdmin = user?.role === 'admin';

    return (
        <div className="py-8 space-y-8">

            {/* ── Hero Banner ── */}
            <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-slate-800/80 via-blue-900/30 to-slate-800/80 border border-white/10 rounded-3xl p-8 sm:p-12">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="text-center lg:text-left max-w-2xl">
                        {/* Greeting pill */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-sm font-medium mb-5">
                            <Activity className="w-3.5 h-3.5" />
                            Selamat datang, <span className="font-bold">{user?.name ?? 'Pengguna'}</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                            Dashboard{' '}
                            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                Gudang Sembako
                            </span>
                        </h1>
                        <p className="text-blue-200/65 text-base sm:text-lg leading-relaxed mb-8">
                            Sistem manajemen inventaris modern. Pantau stok, harga, dan pergerakan barang secara real-time dari satu tempat.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
                            <Link
                                to="/items"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-0.5 transition-all font-semibold"
                            >
                                <Package className="w-4 h-4" />
                                Lihat Semua Barang
                            </Link>
                            <Link
                                to="/stock-mutations"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/15 hover:-translate-y-0.5 transition-all font-medium"
                            >
                                <BarChart3 className="w-4 h-4" />
                                Riwayat Mutasi
                            </Link>
                        </div>
                    </div>

                    {/* Big icon decoration */}
                    <div className="hidden lg:flex items-center justify-center shrink-0">
                        <div className="relative w-44 h-44">
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/20 backdrop-blur-xl flex items-center justify-center">
                                <Warehouse className="w-20 h-20 text-cyan-300/80" />
                            </div>
                            <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="absolute -bottom-3 -left-3 w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-amber-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Kategori"  value={stats.totalKategori} icon={FolderOpen} color="blue" />
                <StatCard label="Total Barang"     value={stats.totalBarang}   icon={Boxes}      color="cyan" />
                <StatCard label="Total Stok Fisik" value={stats.totalStok}     icon={Package}    color="emerald" suffix="Unit" />
                <StatCard label="Estimasi Nilai Aset" value={stats.totalAset} displayValue={formatRupiah(stats.totalAset)} icon={TrendingUp} color="amber" />
            </div>

            {/* ── Quick Actions ── */}
            {isAdmin && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-lg font-bold text-white">Aksi Cepat</h2>
                        <span className="text-xs text-blue-200/40 ml-1">Admin Only</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <QuickActionCard
                            to="/categories/create"
                            icon={Plus}
                            label="Tambah Kategori"
                            desc="Kelompokkan barang sembako"
                            colorFrom="from-blue-500/40"
                            colorTo="to-blue-600/20"
                        />
                        <QuickActionCard
                            to="/items/create"
                            icon={Boxes}
                            label="Tambah Barang"
                            desc="Input barang baru ke gudang"
                            colorFrom="from-cyan-500/40"
                            colorTo="to-cyan-600/20"
                        />
                        <QuickActionCard
                            to="/stock-mutations/create"
                            icon={ArrowDownToLine}
                            label="Barang Masuk"
                            desc="Catat stok masuk gudang"
                            colorFrom="from-emerald-500/40"
                            colorTo="to-emerald-600/20"
                        />
                        <QuickActionCard
                            to="/stock-mutations/create?type=keluar"
                            icon={ArrowUpFromLine}
                            label="Barang Keluar"
                            desc="Catat stok keluar gudang"
                            colorFrom="from-rose-500/40"
                            colorTo="to-rose-600/20"
                        />
                    </div>
                </div>
            )}

            {/* ── Bottom Grid: Recent Mutations + Low Stock ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Mutations */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-white font-bold">Mutasi Stok Terbaru</h3>
                        </div>
                        <Link to="/stock-mutations" className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1 transition-colors">
                            Lihat semua <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {recentMutations.length === 0 ? (
                        <div className="px-6 py-10 text-center text-blue-200/40 text-sm">Belum ada mutasi stok</div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {recentMutations.map((m) => (
                                <div key={m.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.type === 'masuk' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                            {m.type === 'masuk'
                                                ? <ArrowDownToLine className="w-4 h-4 text-emerald-300" />
                                                : <ArrowUpFromLine className="w-4 h-4 text-red-300" />
                                            }
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{m.item?.name ?? '—'}</p>
                                            <p className="text-blue-200/50 text-xs">{formatDate(m.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <MutationBadge type={m.type} />
                                        <p className="text-blue-200/60 text-xs mt-0.5">{m.quantity} unit</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Low Stock Alert */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-amber-400" />
                            <h3 className="text-white font-bold">Stok Hampir Habis</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/20">≤ 10 unit</span>
                        </div>
                        <Link to="/items" className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1 transition-colors">
                            Lihat semua <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {lowStockItems.length === 0 ? (
                        <div className="px-6 py-10 text-center">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
                                <TrendingUp className="w-6 h-6 text-emerald-400" />
                            </div>
                            <p className="text-blue-200/50 text-sm">Semua stok dalam kondisi aman 🎉</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {lowStockItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                                            <Package className="w-4 h-4 text-amber-300" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{item.name}</p>
                                            <p className="text-blue-200/50 text-xs">{item.category?.name ?? 'Tanpa kategori'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <p className={`text-sm font-bold ${Number(item.stock) === 0 ? 'text-red-400' : 'text-amber-300'}`}>
                                            {item.stock} unit
                                        </p>
                                        <p className="text-blue-200/50 text-xs">{formatRupiah(item.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Beranda;