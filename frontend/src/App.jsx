import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  Home,
  FolderOpen,
  Plus,
  Package,
  ArrowDownToLine,
  Menu,
  X,
  LogOut,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages Import
import Beranda from './pages/Beranda';
import CategoryList from './pages/CategoryList';
import CategoryForm from './pages/CategoryForm';
import ItemList from './pages/ItemList';
import ItemForm from './pages/ItemForm';
import ItemDetail from './pages/ItemDetail';
import StockMutationList from './pages/StockMutationList';
import StockMutationForm from './pages/StockMutationForm';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserManagement from './pages/UserManagement';
import EditUser from './pages/EditUser';

// ─── Logo Component ───────────────────────────────────────────────────────────
function Logo({ onClick }) {
  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-3 shrink-0 group">
      {/* Icon Mark with glow */}
      <div className="relative">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
          {/* Warehouse SVG */}
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10L12 4l9 6v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10z" />
            <path d="M9 21V13h6v8" />
          </svg>
        </div>
      </div>

      {/* Text Mark — desktop */}
      <div className="hidden sm:block leading-none select-none">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/70 mb-0.5">
          Gudang
        </div>
        <div className="text-[16px] font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
          Sembako
        </div>
      </div>

      {/* Text Mark — mobile */}
      <span className="sm:hidden text-base font-extrabold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent select-none">
        GS
      </span>
    </Link>
  );
}

// ─── NavLink ──────────────────────────────────────────────────────────────────
function NavLink({ to, children, icon: Icon, mobile = false, onClick }) {
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    (to !== '/' && location.pathname.startsWith(to + '/'));

  const base = mobile
    ? 'flex items-center gap-3 px-4 py-2.5 rounded-xl text-blue-100/80 hover:text-white hover:bg-white/10 transition-all text-sm'
    : 'flex items-center gap-2 px-3 py-2 rounded-xl text-blue-100/80 hover:text-white hover:bg-white/10 transition-all text-sm';

  return (
    <Link to={to} className={`${base} ${isActive ? 'bg-white/10 text-white' : ''}`} onClick={onClick}>
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </Link>
  );
}

// ─── DropdownGroup ────────────────────────────────────────────────────────────
function DropdownGroup({ label, icon: Icon, isActive, children }) {
  const [open, setOpen] = useState(false);
  let timer;

  const enter = () => { clearTimeout(timer); setOpen(true); };
  const leave = () => { timer = setTimeout(() => setOpen(false), 120); };

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all
          ${isActive ? 'bg-white/10 text-white' : 'text-blue-100/80 hover:text-white hover:bg-white/10'}`}
      >
        {Icon && <Icon className="w-4 h-4" />}
        {label}
        <ChevronDown className={`w-3.5 h-3.5 ml-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div className={`absolute top-full left-0 mt-2 w-52 backdrop-blur-xl bg-slate-800/95 border border-white/10
        rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 transition-all duration-200
        ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <div className="p-1.5 flex flex-col gap-0.5">{children}</div>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ user, onLogout, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu }) {
  const location = useLocation();
  const [userOpen, setUserOpen] = useState(false);
  let userTimer;

  const isCatActive   = location.pathname.startsWith('/categories');
  const isItemActive  = location.pathname.startsWith('/items');
  const isAdminActive = location.pathname.startsWith('/admin');

  const userEnter = () => { clearTimeout(userTimer); setUserOpen(true); };
  const userLeave = () => { userTimer = setTimeout(() => setUserOpen(false), 120); };

  return (
    <nav className="backdrop-blur-xl bg-slate-800/60 border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center">

          <Logo onClick={closeMobileMenu} />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5 font-medium">
            <NavLink to="/" icon={Home}>Beranda</NavLink>

            <DropdownGroup label="Kategori" icon={FolderOpen} isActive={isCatActive}>
              <NavLink to="/categories" icon={FolderOpen}>Daftar Kategori</NavLink>
              {user?.role === 'admin' && (
                <NavLink to="/categories/create" icon={Plus}>Buat Kategori</NavLink>
              )}
            </DropdownGroup>

            <DropdownGroup label="Barang" icon={Package} isActive={isItemActive}>
              <NavLink to="/items" icon={Package}>Daftar Barang</NavLink>
              {user?.role === 'admin' && (
                <NavLink to="/items/create" icon={Plus}>Tambah Barang</NavLink>
              )}
            </DropdownGroup>

            <NavLink to="/stock-mutations" icon={ArrowDownToLine}>Mutasi Stok</NavLink>

            {user?.role === 'admin' && (
              <DropdownGroup label="Admin" icon={Shield} isActive={isAdminActive}>
                <NavLink to="/admin/users" icon={Shield}>Manajemen User</NavLink>
              </DropdownGroup>
            )}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="relative" onMouseEnter={userEnter} onMouseLeave={userLeave}>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white/90 max-w-[110px] truncate">{user.name}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-medium shrink-0">
                    {user.role}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-blue-200/40 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className={`absolute top-full right-0 mt-2 w-48 backdrop-blur-xl bg-slate-800/95 border border-white/10
                  rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 transition-all duration-200
                  ${userOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                  <div className="p-1.5">
                    <div className="px-3 py-2 text-xs text-blue-200/50 border-b border-white/10 mb-1 truncate">
                      {user.email}
                    </div>
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:text-red-200 hover:bg-red-400/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm text-blue-100/80 hover:text-white hover:bg-white/10 rounded-xl transition-all">Login</Link>
                <Link to="/register" className="px-4 py-2 text-sm bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all">Register</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-blue-100/80 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} user={user} onLogout={onLogout} />
      </div>
    </nav>
  );
}

// ─── MobileMenu ───────────────────────────────────────────────────────────────
function MobileMenu({ isOpen, onClose, user, onLogout }) {
  const [openGroup, setOpenGroup] = useState(null);
  if (!isOpen) return null;

  const toggle = (name) => setOpenGroup(prev => (prev === name ? null : name));

  const AccordionGroup = ({ name, icon: Icon, label, children }) => (
    <div>
      <button
        onClick={() => toggle(name)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-blue-100/80 hover:text-white hover:bg-white/10 transition-all text-sm"
      >
        <span className="flex items-center gap-3"><Icon className="w-4 h-4" />{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openGroup === name ? 'rotate-180' : ''}`} />
      </button>
      {openGroup === name && (
        <div className="pl-4 mt-0.5 flex flex-col gap-0.5">{children}</div>
      )}
    </div>
  );

  return (
    <div className="md:hidden mt-3 pb-4 border-t border-white/10 animate-fadeIn">
      <div className="flex flex-col gap-0.5 pt-3">
        <NavLink to="/" icon={Home} mobile onClick={onClose}>Beranda</NavLink>

        <AccordionGroup name="kategori" icon={FolderOpen} label="Kategori">
          <NavLink to="/categories" icon={FolderOpen} mobile onClick={onClose}>Daftar Kategori</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/categories/create" icon={Plus} mobile onClick={onClose}>Buat Kategori</NavLink>
          )}
        </AccordionGroup>

        <AccordionGroup name="barang" icon={Package} label="Barang">
          <NavLink to="/items" icon={Package} mobile onClick={onClose}>Daftar Barang</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/items/create" icon={Plus} mobile onClick={onClose}>Tambah Barang</NavLink>
          )}
        </AccordionGroup>

        <NavLink to="/stock-mutations" icon={ArrowDownToLine} mobile onClick={onClose}>Mutasi Stok</NavLink>

        {user?.role === 'admin' && (
          <NavLink to="/admin/users" icon={Shield} mobile onClick={onClose}>Manajemen User</NavLink>
        )}

        <div className="border-t border-white/10 mt-2 pt-2">
          {user ? (
            <>
              <div className="px-4 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{user.name}</p>
                  <p className="text-xs text-blue-200/50 capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={() => { onLogout(); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-300 hover:text-red-200 hover:bg-red-400/10 transition-all"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" mobile onClick={onClose}>Login</NavLink>
              <NavLink to="/register" mobile onClick={onClose}>Register</NavLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AppContent ───────────────────────────────────────────────────────────────
function AppContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-blue-400/20 border-t-cyan-400 animate-spin mx-auto"></div>
          <p className="mt-4 text-blue-200/70">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          },
        }}
      />

      <Navbar
        user={user}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
        closeMobileMenu={closeMobileMenu}
      />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={<ProtectedRoute><Beranda /></ProtectedRoute>} />

          <Route path="/categories" element={<ProtectedRoute><CategoryList /></ProtectedRoute>} />
          <Route path="/categories/create" element={<ProtectedRoute><CategoryForm /></ProtectedRoute>} />
          <Route path="/categories/:id/edit" element={<ProtectedRoute><CategoryForm /></ProtectedRoute>} />

          <Route path="/items" element={<ProtectedRoute><ItemList /></ProtectedRoute>} />
          <Route path="/items/create" element={<ProtectedRoute><ItemForm /></ProtectedRoute>} />
          <Route path="/items/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
          <Route path="/items/:id/edit" element={<ProtectedRoute><ItemForm /></ProtectedRoute>} />

          <Route path="/stock-mutations" element={<ProtectedRoute><StockMutationList /></ProtectedRoute>} />
          <Route path="/stock-mutations/create" element={<ProtectedRoute><StockMutationForm /></ProtectedRoute>} />

          <Route path="/admin/users" element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/users/:id/edit" element={<ProtectedRoute role="admin"><EditUser /></ProtectedRoute>} />

          <Route path="*" element={
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-white mb-2">Halaman Tidak Ditemukan</h2>
              <Link to="/" className="text-cyan-300 hover:text-cyan-200">← Kembali ke Beranda</Link>
            </div>
          } />
        </Routes>
      </main>

      <footer className="backdrop-blur-xl bg-slate-800/50 border-t border-white/10 mt-10">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <p className="text-center text-blue-200/60 text-sm">
            &copy; {new Date().getFullYear()} Gudang Sembako App. Built with
            <span className="text-cyan-400 mx-1">Laravel</span>
            &
            <span className="text-blue-400 mx-1">React</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;