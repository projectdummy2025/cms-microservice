# PRD Spec — Artikel dan Informasi Publik

## 1. Tujuan Dokumen

Dokumen ini adalah spesifikasi utama untuk agen kode yang membuat CMS artikel. Semua informasi harus menjadi konteks yang langsung dipahami.

- Tujuan: menjelaskan domain CMS artikel, struktur data, route, dan aturan implementasi.
- Sasaran: agen mampu membuat kode yang benar tanpa menebak logika bisnis.
- Prinsip: ringkas, jelas, linear, dan menjaga logika bisnis 100%.

## 2. Konteks Proyek Saat Ini

- Platform: Laravel dengan Livewire dan Filament.
- Database: PostgreSQL.
- Techstack database: PostgreSQL dengan Drizzle ORM untuk schema dan query builder.
- Installer saat ini: struktur file dan route sudah dipasang.
- Perubahan harus kompatibel dengan kondisi sekarang.

## 3. Konsep Employee dan Database

Employee adalah entitas penulis artikel.

- `articles.author_id` menunjuk ke `employees.id`.
- Employee adalah tabel penulis, bukan user umum.
- Semua artikel publik bisa terkait dengan employee.

### 3.1 Konfigurasi `.env`

Gunakan konfigurasi berikut:

```env
DATABASE_URL=postgresql://postgres:admin0123@127.0.0.1:5432/ls_news
```

Catatan Drizzle:
- Drizzle digunakan untuk mendefinisikan schema dan query secara type-safe.
- Konfigurasi lokal Drizzle harus diabaikan di Git jika berisi data environment-specific.
- Tambahkan entri yang relevan ke `.gitignore`, seperti `.drizzle` dan file client yang di-generate.

## 4. Struktur Database Lengkap

### 4.1 `articles`

Kolom utama:
- `id`
- `article_type_id` (FK ke `article_types.id`)
- `category_id` (FK ke `categories.id`, nullable untuk `page`)
- `author_id` (FK ke `employees.id`)
- `image` (string nullable)
- `title` (json)
- `summary` (json nullable)
- `content` (json nullable)
- `hit` (int default 0)
- `is_active` (boolean)
- `published_at` (datetime nullable)
- `sort` (int default 0)
- `year` (year nullable)
- `files` (longtext nullable)
- `original_files` (longtext nullable)
- `created_at`, `updated_at`

Aturan:
- Hanya artikel dengan `is_active = true` dan `published_at <= now()` tampil.
- Slug harus dibentuk dari judul plus id.

### 4.2 `article_types`

Kolom:
- `id`
- `name`
- `slug`

Tipe yang tersedia:
- `news`
- `gallery`
- `page`
- `information`

### 4.3 `categories`

Kolom:
- `id`
- `category_type_id` (FK ke `category_types.id`)
- `parent_id` (nullable self reference)
- `name` (json)
- `sort` (int default 0)
- `is_root` (boolean)
- `is_active` (boolean)
- `created_at`, `updated_at`

Aturan:
- Kategori bersifat hierarkis.
- Digunakan oleh `news`, `gallery`, dan `information`.
- `page` tidak wajib kategori.
- Jika kategori dihapus, artikel dipindahkan ke root kategori.

### 4.4 `employees`

Kolom:
- `id`
- `name`
- `email`
- `position`
- `created_at`, `updated_at`

Fungsi:
- Menyimpan data penulis.
- `articles.author_id` mengacu ke `employees.id`.

### 4.5 `images`

Kolom:
- `id`
- `article_id` (FK ke `articles.id`)
- `path`
- `description` (json nullable)
- `sort` (int default 0)
- `created_at`, `updated_at`

Fungsi:
- Menyimpan gambar untuk galeri.
- `articles.image` tetap dapat menjadi cover.

### 4.6 `tags`

Kolom:
- `id`
- `name` (json)
- `is_active` (boolean)
- `created_at`, `updated_at`

Relasi:
- `article_tag` menghubungkan `articles` dan `tags`.

### 4.7 `category_types`

Kolom:
- `id`
- `name`
- `slug`

Fungsi:
- Memisahkan pohon kategori berdasarkan jenis penggunaan.
- Contoh: `Article`, `Information`.

## 5. Alur Frontend CMS Artikel

### 5.1 Daftar artikel

URL:
- `/{article_type}` untuk `news`, `gallery`, `page`

Fungsi:
- Menampilkan daftar artikel sesuai tipe.
- Menyediakan filter kategori, tag, penulis, arsip, dan pencarian.
- Menyimpan preferensi tampilan grid atau list di session.

### 5.2 Detail artikel

URL:
- `/{article_type}/{slug}`

Fungsi:
- Memuat artikel berdasar slug.
- Menampilkan kategori, penulis, tag, dan gambar.
- Menaikkan `hit` saat halaman dibuka.

### 5.3 Kategori dan tipe artikel

- Tipe `information` tetap termasuk sebagai tipe artikel dalam CMS jika digunakan.
- Prioritas utama adalah alur artikel, bukan fitur publik selain daftar dan detail.
- Fokus pada `news`, `gallery`, dan `page` dalam implementasi halaman CMS.

### 5.4 Endpoint API CMS Artikel

Rute API publik yang harus disiapkan:
- `GET /api/v1/articles` — daftar artikel published.
- `GET /api/v1/articles/{id}` — detail artikel berdasarkan id.
- `GET /api/v1/articles/slug/{slug}` — detail artikel berdasarkan slug.
- `GET /api/v1/categories` — daftar kategori aktif.
- `GET /api/v1/categories/{id}` — detail kategori.

Aturan API:
- Semua endpoint hanya menampilkan data `published`.
- Responses harus konsisten dengan struktur CMS artikel.
- Gunakan relasi `category`, `author`, `tags`, dan `images` pada response detail.

## 6. Aturan Kode untuk Agen

Kode harus:
- Mengikuti gaya `Humane Compression`.
- Menjaga logika bisnis tetap sama.
- Ringkas sekaligus mudah dibaca.
- Linear dan tanpa abstraksi rumit.
- Menggunakan nama variabel/fungsi English camelCase.
- Tanpa singkatan.
- Maksimal dua kata per nama.
- Menyertakan komentar singkat.

Contoh nama yang benar:
- `authorName`
- `articleType`
- `categoryList`
- `publishedAt`
- `imagePath`

## 7. Standar Proyek dan Perombakan Cepat

Struktur proyek harus:
- Rapi.
- Mudah dihafal.
- Mudah ditelusuri.
- Mengikuti standar industri.
- Dapat dirombak cepat tanpa mengubah logika bisnis.

## 8. Catatan Agen Kode

- Spesifikasi ini adalah konteks utama.
- Jangan membuat asumsi di luar tabel dan aturan yang tertulis.
- Jika diperlukan, gunakan struktur tabel dan route yang ada sebagai referensi.
- Fokus pada implementasi yang jelas dan langsung.
