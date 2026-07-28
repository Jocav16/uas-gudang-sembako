# Gudang Sembako App

Aplikasi manajemen gudang sembako berbasis web dengan:
- **Backend**: Laravel 13 + PostgreSQL + Laravel Sanctum (REST API)
- **Frontend**: React 19 + Vite + Tailwind CSS

---

## ⚡ Quick Start (Development Lokal)

### Backend (Laravel)

```bash
cd backend

# 1. Install dependensi PHP
composer install

# 2. Salin dan edit file environment
cp .env.example .env
php artisan key:generate

# 3. Sesuaikan konfigurasi database di .env, lalu jalankan migrasi
php artisan migrate

# 4. Jalankan server development
php artisan serve
```

### Frontend (React)

```bash
cd frontend

# 1. Install dependensi Node
npm install

# 2. Salin file environment
cp .env.example .env
# (opsional) Edit VITE_API_URL jika backend bukan di localhost:8000

# 3. Jalankan server development
npm run dev
```

---

## 🚀 Deployment ke VPS (Production)

### Prasyarat di VPS (Ubuntu/Linux)

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y

# Install PHP 8.3 + ekstensi yang diperlukan
sudo apt install php8.3 php8.3-fpm php8.3-pgsql php8.3-mbstring \
    php8.3-xml php8.3-curl php8.3-zip php8.3-bcmath php8.3-tokenizer -y

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
```

### Setup Database PostgreSQL

```bash
# Masuk sebagai user postgres
sudo -u postgres psql

-- Di dalam psql:
CREATE DATABASE gudang_sembako;
CREATE USER gudang_user WITH PASSWORD 'password_aman_anda';
GRANT ALL PRIVILEGES ON DATABASE gudang_sembako TO gudang_user;
\q
```

### Deploy Aplikasi

```bash
# Clone repositori
git clone https://gitlab.com/username/gudang-sembako-app.git /var/www/gudang-sembako-app
cd /var/www/gudang-sembako-app

# --- Backend ---
cd backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate

# Edit .env: sesuaikan DB_*, APP_URL, FRONTEND_URL, APP_ENV=production, APP_DEBUG=false
nano .env

php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
chmod -R 775 storage bootstrap/cache
sudo chown -R www-data:www-data storage bootstrap/cache

# --- Frontend ---
cd ../frontend
npm install
cp .env.example .env
# Edit .env: sesuaikan VITE_API_URL
nano .env

npm run build

# --- Nginx ---
cd ..
sudo cp nginx.conf /etc/nginx/sites-available/gudang-sembako
sudo ln -s /etc/nginx/sites-available/gudang-sembako /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Konfigurasi .env Backend (Production)

```env
APP_NAME=GudangSembako
APP_ENV=production          # ← Wajib production
APP_DEBUG=false             # ← Wajib false
APP_URL=https://yourdomain.com

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=gudang_sembako
DB_USERNAME=gudang_user
DB_PASSWORD=password_aman_anda

FRONTEND_URL=https://yourdomain.com   # ← Untuk CORS
```

### (Nilai Plus) HTTPS dengan Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Dapatkan sertifikat SSL (otomatis update nginx.conf)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot akan setup auto-renewal otomatis
sudo systemctl status certbot.timer
```

### Deploy Ulang (Update)

Gunakan script otomatis yang tersedia:

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📁 Struktur Proyek

```
gudang-sembako-app/
├── backend/          # Laravel API
│   ├── app/
│   ├── config/
│   ├── database/migrations/
│   ├── routes/api.php
│   └── .env.example
├── frontend/         # React + Vite
│   ├── src/
│   └── .env.example
├── nginx.conf        # Contoh konfigurasi Nginx
└── deploy.sh         # Script deployment otomatis
```

---

## 🔑 Akun Default (Seeder)

Jalankan seeder jika tersedia:
```bash
php artisan db:seed
```

---

## 📄 Lisensi

MIT License
