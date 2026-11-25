# Job Tracker — Dokumen Requirement

Aplikasi web pribadi untuk mencatat dan memantau lamaran kerja.
Dokumen ini adalah sumber acuan utama proyek. Ikuti keputusan teknis di dalamnya dan jangan menambahkan fitur di luar cakupan tanpa konfirmasi.

---

## 1. Ringkasan

| Item | Keterangan |
|---|---|
| Nama proyek | Job Tracker |
| Tujuan | Mencatat lamaran kerja, memantau status, dan mengingat jadwal psikotes/wawancara |
| Pengguna | Satu orang (penggunaan pribadi) |
| Bahasa antarmuka | Indonesia |
| Deployment | Vercel |

### Di luar cakupan (JANGAN dikerjakan)

- Mode offline / PWA / service worker
- Sistem login, registrasi, atau multi-user
- Push notification, email pengingat, Telegram bot, dan Vercel Cron
- Panel admin atau fitur kolaborasi

---

## 2. Tech Stack

| Bagian | Pilihan |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + `next-themes` (dark/light mode) |
| Font | Poppins via `next/font/google` |
| Database | Neon Postgres (alternatif: Supabase sebagai Postgres saja) |
| ORM | Drizzle ORM |
| Akses data | Server Actions / Route Handlers (database tidak pernah diakses dari client) |
| Form & validasi | React Hook Form + Zod |
| Data fetching | TanStack Query |
| Diagram | Recharts |
| Animasi | Framer Motion + react-countup |
| Ikon | Lucide React |
| Tanggal | date-fns (locale `id`) |
| Pengingat | Link Google Calendar + file `.ics` + banner "Jadwal terdekat" |
| Deploy | Vercel |

### Environment variable

```
DATABASE_URL=            # connection string Postgres
APP_PASSCODE=            # opsional, lihat bagian 9
```

---

## 3. Fitur

### 3.1 CRUD Lamaran

Data yang diinput:

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| Nama perusahaan | teks | Ya | |
| Posisi yang dilamar | teks | Ya | |
| Nomor lamaran | integer | Otomatis | Unik; format tampilan `#0001`, urutan berdasarkan waktu data lama dibackfill |
| Link lowongan | URL | Tidak | Validasi format URL |
| Tanggal melamar | tanggal | Ya | Default: hari ini |
| Tanggal & jam pengingat | tanggal + jam | Tidak | Untuk jadwal psikotes/wawancara. Gunakan input `datetime-local` |
| Status | pilihan | Ya | Default: Dikirim |
| Catatan | teks panjang | Tidak | |

Perilaku:

- Tambah, lihat detail, ubah, dan hapus lamaran.
- Hapus harus melalui dialog konfirmasi.
- Setelah simpan atau hapus, daftar dan statistik langsung ter-update tanpa reload halaman.
- Tampilkan toast untuk sukses atau gagal.

### 3.2 Status Lamaran

Pilihan status (urutan tetap):

1. Dikirim
2. Psikotes
3. Wawancara
4. Diterima
5. Ditolak

Setiap status punya badge warna yang konsisten di seluruh aplikasi.

### 3.3 Dashboard (halaman utama)

- Kartu statistik: **Total lamaran, Dikirim, Wawancara, Psikotes, Diterima, Ditolak**. Angka beranimasi menghitung naik saat halaman dimuat.
- Diagram:
  - Donut chart: distribusi lamaran per status.
  - Bar atau line chart: jumlah lamaran per bulan (6–12 bulan terakhir).
- Ringkasan lamaran terbaru (5 data terakhir).
- Banner **"Jadwal terdekat"** untuk psikotes/wawancara yang belum lewat (tampilkan yang paling dekat).
- Tampilan harus terasa profesional dan elegan.

### 3.4 Filter dan Pencarian

- Filter status: **Semua, Dikirim, Wawancara, Psikotes, Diterima, Ditolak**.
- Pencarian berdasarkan **nama perusahaan** dan **posisi**.
- Pencarian juga dapat menggunakan nomor lamaran, seperti `12` atau `#0012`.
- Filter dan pencarian bisa dikombinasikan.
- Pencarian memakai debounce (sekitar 300 ms).
- Tampilkan empty state yang ramah jika tidak ada hasil.

### 3.5 Pengingat Jadwal (Kalender)

Untuk lamaran yang memiliki tanggal & jam pengingat:

1. **Tombol "Tambah ke Google Calendar"**: membuka URL template Google Calendar yang sudah terisi (judul, waktu, link lowongan di deskripsi).
2. **Tombol "Unduh .ics"**: memanggil route handler `GET /api/ics/[id]` yang mengembalikan file kalender dengan alarm (`VALARM`) 1 jam sebelum acara.
3. Tombol ditampilkan di halaman detail lamaran dan sebagai ikon kecil di kartu lamaran.

Catatan teknis:

- Durasi event default 1 jam.
- Judul event: `{Status}: {Posisi} - {Perusahaan}`.
- Escape karakter khusus di file `.ics`: `\`, `,`, `;`, dan baris baru (`\n`).
- Format waktu `.ics` dan Google Calendar memakai UTC (`YYYYMMDDTHHmmssZ`).
- Waktu diinput dalam WIB, jadi pastikan konversi ke UTC benar (selisih 7 jam).
- Perubahan jadwal di aplikasi tidak otomatis mengubah event di kalender. Ini disengaja.

### 3.6 Dark Mode dan Light Mode

- Toggle tema di navigasi.
- Mengikuti preferensi sistem sebagai default, dan pilihan pengguna disimpan.
- Tidak boleh ada flash tema yang salah saat pertama dimuat.

---

## 4. Skema Database

Satu tabel. Tidak ada `user_id` karena aplikasi satu pengguna.

```ts
// src/db/schema.ts
import { pgTable, uuid, integer, text, timestamp, pgEnum, date } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", [
  "dikirim",
  "psikotes",
  "wawancara",
  "diterima",
  "ditolak",
]);

export const applications = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  applicationNumber: integer("application_number")
    .generatedByDefaultAsIdentity()
    .notNull()
    .unique(),
  company: text("company").notNull(),
  position: text("position").notNull(),
  jobUrl: text("job_url"),
  appliedAt: date("applied_at").notNull(),
  reminderAt: timestamp("reminder_at", { withTimezone: true }),
  status: statusEnum("status").notNull().default("dikirim"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

Ketentuan:

- `updatedAt` diperbarui setiap kali data diubah.
- Setiap lamaran memiliki `application_number` integer unik berbasis identity; nomor lama ditentukan dengan urutan `created_at` terlama lalu `id`, dan tampilan memakai format `#0001`.
- Tambahkan index pada `status` dan `appliedAt`.
- Pencarian memakai `ILIKE` pada `company` dan `position`, serta pencocokan nomor pada `application_number`.

---

## 5. Halaman dan Navigasi

| Rute | Halaman |
|---|---|
| `/` | Dashboard |
| `/lamaran` | Daftar lamaran (filter + pencarian) |
| `/lamaran/baru` | Form tambah lamaran |
| `/lamaran/[id]` | Detail lamaran (+ tombol kalender) |
| `/lamaran/[id]/ubah` | Form ubah lamaran |

Form tambah dan ubah boleh berupa modal atau drawer selama alurnya nyaman di mobile.

### Pola navigasi (responsif)

- **Mobile (di bawah `md`)**: **Bottom Tab Bar**, `fixed bottom-0`, dengan ikon + label. Tab: Beranda, Lamaran, Tambah, Tema.
- **Desktop (`md` ke atas)**: **Floating Pill**, bar melayang di tengah atas dengan `backdrop-blur`, sudut membulat penuh, dan bayangan halus.
- Gunakan satu komponen navigasi dengan breakpoint Tailwind.
- Beri padding bawah pada konten di mobile agar tidak tertutup tab bar. Perhatikan `safe-area-inset-bottom` untuk perangkat dengan notch.
- Aplikasi harus berfungsi baik di mobile, tablet, dan desktop.

---

## 6. Panduan Desain

### Palet warna

| Warna | Hex | Penggunaan |
|---|---|---|
| Biru utama | `#2563EB` | Tombol utama, link aktif, aksen utama |
| Biru sekunder | `#3B82F6` | Hover, grafik, elemen pendukung |
| Biru muda | `#93C5FD` | Aksen lembut, grafik, border aktif |
| Biru sangat muda | `#E0F2FE` | Latar badge, kartu sorotan (light mode) |
| Abu terang | `#F1F5F9` | Latar halaman (light mode) |
| Navy gelap | `#0F172A` | Latar halaman (dark mode), teks utama (light mode) |

Daftarkan semua warna di `tailwind.config` sebagai token, dan gunakan CSS variable untuk tema. Pastikan kontras teks memadai di kedua mode.

Warna status (badge) boleh memakai turunan yang selaras dengan palet, dan harus konsisten di seluruh aplikasi.

### Tipografi

- Font: **Poppins** (bobot 400, 500, 600, 700).
- Gunakan `next/font/google` dengan `display: swap`.

### Gaya visual

- Profesional, modern, elegan, dan cocok untuk kalangan muda.
- Sudut membulat (`rounded-2xl` untuk kartu), bayangan halus, dan ruang kosong yang lega.
- Konsisten dalam spacing dan ukuran ikon.

### Animasi

Animasi harus halus, bermakna, dan tidak berlebihan:

- Angka statistik menghitung naik (react-countup).
- Diagram beranimasi saat pertama muncul.
- Efek scroll reveal (fade + slide ringan) dengan Framer Motion.
- Transisi halaman dan hover yang halus.
- Hormati `prefers-reduced-motion`: nonaktifkan atau kurangi animasi jika diminta sistem.

---

## 7. Struktur Folder (usulan)

```
.
├─ docs/
│  └─ REQUIREMENTS.md
├─ drizzle/                     # migrasi
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx               # dashboard
│  │  ├─ lamaran/
│  │  │  ├─ page.tsx
│  │  │  ├─ baru/page.tsx
│  │  │  └─ [id]/
│  │  │     ├─ page.tsx
│  │  │     └─ ubah/page.tsx
│  │  └─ api/
│  │     └─ ics/[id]/route.ts
│  ├─ components/
│  │  ├─ nav/                   # BottomTabBar, FloatingPill
│  │  ├─ dashboard/             # StatCard, StatusChart, MonthlyChart, UpcomingBanner
│  │  ├─ applications/          # ApplicationCard, ApplicationForm, FilterBar
│  │  └─ ui/                    # Button, Badge, Dialog, Toast, dll.
│  ├─ db/
│  │  ├─ index.ts
│  │  └─ schema.ts
│  ├─ lib/
│  │  ├─ calendar.ts            # googleCalendarUrl, helper ics
│  │  ├─ validators.ts          # skema Zod
│  │  └─ utils.ts
│  └─ actions/
│     └─ applications.ts        # Server Actions CRUD
├─ drizzle.config.ts
├─ tailwind.config.ts
└─ .env.local
```

---

## 8. Tahapan Pengerjaan

Kerjakan berurutan. Selesaikan dan uji satu tahap sebelum lanjut.

1. **Setup**: inisialisasi Next.js + TypeScript + Tailwind, token warna, font Poppins, tema dark/light, dan komponen navigasi responsif.
2. **Database dan CRUD**: skema Drizzle, migrasi, koneksi Neon, Server Actions, form dengan validasi Zod, halaman daftar dan detail.
3. **Dashboard**: kartu statistik, donut chart, grafik bulanan, lamaran terbaru, dan banner jadwal terdekat.
4. **Filter dan pencarian**: filter status, pencarian perusahaan/posisi, dan empty state.
5. **Pengingat kalender**: helper Google Calendar, route handler `.ics`, dan tombol di kartu serta halaman detail.
6. **Animasi dan polesan**: count-up, animasi diagram, scroll reveal, transisi, dukungan `prefers-reduced-motion`, dan pengecekan responsif.
7. **Deploy**: pasang environment variable di Vercel, jalankan migrasi, dan uji di perangkat nyata.

---

## 9. Opsional: Passcode Sederhana

Karena tidak ada login, siapa pun yang mengetahui URL bisa melihat dan mengubah data. Jika ingin melindungi data tanpa membangun sistem auth:

- Simpan satu password di `APP_PASSCODE`.
- Buat middleware Next.js yang memeriksa cookie. Jika belum ada, arahkan ke halaman `/masuk` berisi satu input passcode.
- Cookie bersifat `httpOnly` dan `secure`.
- Tidak ada tabel user dan tidak ada registrasi.

Bagian ini opsional dan bisa ditambahkan setelah semua fitur utama selesai.

---

## 10. Kriteria Selesai

- [ ] CRUD lamaran berfungsi dan data tersimpan di Postgres
- [ ] Lima status berfungsi dengan badge yang konsisten
- [ ] Dashboard menampilkan enam angka statistik, dua diagram, lamaran terbaru, dan banner jadwal
- [ ] Filter status dan pencarian bekerja serta bisa dikombinasikan
- [ ] Tombol Google Calendar dan unduh `.ics` menghasilkan event dengan jam yang benar (WIB)
- [ ] Dark mode dan light mode berfungsi tanpa flash
- [ ] Navigasi bottom tab bar (mobile) dan floating pill (desktop) berfungsi
- [ ] Tampilan responsif di mobile, tablet, dan desktop
- [ ] Palet warna dan font Poppins sesuai panduan
- [ ] Animasi berjalan halus dan menghormati `prefers-reduced-motion`
- [ ] `npm run build` berhasil tanpa error
- [ ] Berhasil di-deploy ke Vercel
