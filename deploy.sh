#!/bin/bash
# =====================================================================
# deploy.sh — Script Deployment Otomatis Gudang Sembako App
# =====================================================================
# Cara pakai di VPS (jalankan dari root folder proyek):
#   chmod +x deploy.sh
#   ./deploy.sh
# =====================================================================

set -e  # Hentikan script jika ada error

echo "======================================================"
echo "  🚀 Deployment Gudang Sembako App"
echo "======================================================"

# --- Konfigurasi ---
PROJECT_DIR="/var/www/gudang-sembako-app"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
WWW_USER="www-data"

echo ""
echo "📦 [1/7] Pull perubahan terbaru dari GitLab..."
cd "$PROJECT_DIR"
git pull origin main

# ============================================================
# BACKEND — Laravel
# ============================================================
echo ""
echo "🐘 [2/7] Install dependensi PHP (tanpa dev packages)..."
cd "$BACKEND_DIR"
composer install --no-dev --optimize-autoloader --no-interaction

echo ""
echo "🔧 [3/7] Konfigurasi environment Laravel..."
# Salin .env jika belum ada
if [ ! -f ".env" ]; then
    cp .env.example .env
    php artisan key:generate
    echo "  ✅ File .env dibuat. HARAP UPDATE isi .env sebelum lanjut!"
    exit 1
fi

echo ""
echo "🗄️  [4/7] Menjalankan migrasi database..."
php artisan migrate --force

echo ""
echo "⚡ [5/7] Optimasi produksi Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo ""
echo "🔐 [6/7] Mengatur permission folder storage & cache..."
chmod -R 775 storage bootstrap/cache
chown -R "$WWW_USER":"$WWW_USER" storage bootstrap/cache

# ============================================================
# FRONTEND — React + Vite
# ============================================================
echo ""
echo "⚛️  [7/7] Build frontend React untuk produksi..."
cd "$FRONTEND_DIR"

# Salin .env jika belum ada
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "  ⚠️  File frontend/.env dibuat. Pastikan VITE_API_URL sudah benar!"
fi

npm install --production=false
npm run build

echo ""
echo "🔄 Reload Nginx..."
sudo systemctl reload nginx

echo ""
echo "======================================================"
echo "  ✅ Deployment selesai!"
echo "======================================================"
echo ""
echo "📋 Checklist pasca-deploy:"
echo "  [ ] Pastikan .env backend sudah: APP_ENV=production, APP_DEBUG=false"
echo "  [ ] Pastikan FRONTEND_URL di .env backend = domain Anda"
echo "  [ ] Pastikan VITE_API_URL di frontend/.env = URL API Anda"
echo "  [ ] (Nilai Plus) Aktifkan HTTPS: sudo certbot --nginx -d yourdomain.com"
echo ""
