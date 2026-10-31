# NATA — website

Rumah untuk semua produk NATA (Habit OS, Money OS, Focus OS, Goals OS, dan produk berikutnya) + **NATAcode**, layanan bantuan tugas & project dengan harga estimasi otomatis.

- `/` — landing NATA (payung semua produk, showcase dari admin)
- `/code` — NATAcode: marketplace layanan → wizard 4 langkah → kirim lewat WhatsApp
- `/admin` — kelola produk showcase (login password)

Stack: Next.js (App Router) · TypeScript · Tailwind CSS v4 · lucide-react. Tanpa database wajib (Supabase opsional).

---

## Jalankan di komputer

Butuh Node.js 20.9+ (cek: `node -v`).

```bash
npm install
cp .env.example .env.local     # lalu isi ADMIN_PASSWORD di .env.local
npm run dev                    # buka http://localhost:3000
```

Perintah lain: `npm run lint` · `npm run build` · `npm start`

---

## Ganti project lama dengan zip ini (VS Code terminal, Mac)

Anggap project lama ada di `~/Projects/nata-website` dan zip baru ada di `~/Downloads/nata-website.zip`. Sesuaikan path-nya.

1. Buka folder project lama di VS Code, lalu buka terminal: **Terminal → New Terminal** (atau `` Ctrl+` ``).
2. Matikan dev server lama kalau masih jalan (`Ctrl+C`).
3. Backup dulu (jaga-jaga):
   ```bash
   cd ..
   cp -R nata-website nata-website-backup
   cd nata-website
   ```
4. Simpan file rahasia & riwayat git. Ini **tidak ada di zip**, jadi jangan dihapus:
   `.git/`, `.env.local`, `.vercel/` (kalau ada).
5. Hapus isi project lama **kecuali** yang di langkah 4:
   ```bash
   find . -mindepth 1 -maxdepth 1 \
     ! -name '.git' ! -name '.env.local' ! -name '.vercel' \
     -exec rm -rf {} +
   ```
6. Ekstrak zip baru ke folder sementara, lalu salin isinya:
   ```bash
   unzip -q ~/Downloads/nata-website.zip -d /tmp/nata-new
   cp -R /tmp/nata-new/nata-website/. .
   rm -rf /tmp/nata-new
   ```
   Kalau `ls /tmp/nata-new` ternyata langsung berisi `package.json` (tanpa folder `nata-website`), pakai `cp -R /tmp/nata-new/. .`.
7. Pasang dependensi dan cek:
   ```bash
   npm install
   npm run lint && npm run build
   ```
8. Tambahkan variabel baru ke `.env.local` (lihat `.env.example`). Minimal:
   ```
   ADMIN_PASSWORD=password-panjang-kamu
   ```
9. Jalankan: `npm run dev` → cek `/`, `/code`, `/admin`.
10. Commit kalau pakai git:
    ```bash
    git add -A && git commit -m "NATA v2: landing payung, marketplace NATAcode, admin"
    ```

Kalau ada yang salah: `cd .. && rm -rf nata-website && mv nata-website-backup nata-website`.

---

## Admin: tambah produk showcase

1. Isi `ADMIN_PASSWORD` di `.env.local`, restart `npm run dev`.
2. Buka `/admin`, login.
3. **Tambah produk**: nama, deskripsi, kategori, status, (opsional) harga, link beli, poin unggulan.
   - Status **Segera tersedia** → tombol beli nonaktif.
   - Status **Tersedia** + link beli → tombol "Beli sekarang" aktif.
   - Status **Sembunyikan** → tidak tampil di landing.
   - **Unggulan** → ditandai di landing.
4. Landing ter-update otomatis setelah simpan.

Semua produk bawaan berstatus *Segera tersedia*. Isi harga & link beli lewat admin saat sudah siap jual.

### Penyimpanan

| Mode | Syarat | Catatan |
|---|---|---|
| File lokal | `SUPABASE_*` kosong | Tulis ke `data/products.json`. Hanya untuk lokal. Di Vercel file read-only, admin menampilkan peringatan. |
| Supabase | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Disarankan untuk produksi. |

Setup Supabase: buat project → SQL Editor → tempel & jalankan `supabase/schema.sql` → salin Project URL dan service_role key ke env. RLS aktif tanpa policy publik; hanya server (service role) yang bisa baca/tulis.

Keamanan admin: password dari env, sesi cookie httpOnly bertanda tangan (7 hari), jeda 800ms saat password salah, URL produk divalidasi (hanya http/https), halaman `noindex`.

---

## Harga NATAcode

Semua angka ada di `config/pricing.ts`.

```
harga = dasar(level) × ukuran × deadline × (1 + tambahan%)
```

- Minimum **Rp50.000**. Level: Dasar 50k · Menengah 75k · Lanjut 150k · Kompleks 300k · Proyek besar 500k.
- Ukuran: ringan ×0.8, standar ×1, besar ×1.5. Deadline urgent ×1.5.
- Tambahan: penjelasan +15%, dokumentasi +15%, revisi +10%.
- Rentang tampil: −10% sampai +15% dari rekomendasi.
- Pelanggan bisa ikut rekomendasi atau menawar (min Rp50.000). Meter menunjukkan seberapa dekat tawaran dengan rekomendasi, sebelum kirim, supaya tidak ada kejutan di WhatsApp.
- Harga final tetap dikonfirmasi lewat WhatsApp.

Tambah/ubah layanan: `data/services.ts`. FAQ: `data/faq.ts`.

## Di mana mengubah apa

| Yang diubah | File |
|---|---|
| Nomor WhatsApp | `config/whatsapp.ts` (satu-satunya tempat) |
| Nama, deskripsi, SEO | `config/site.ts` |
| Harga & faktor | `config/pricing.ts` |
| Daftar layanan | `data/services.ts` |
| Produk awal (seed) | `data/products.json` |
| Warna, font | `app/globals.css` |

## Deploy ke Vercel

1. Push ke GitHub, import di Vercel.
2. Set env: `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
3. **Wajib pakai Supabase** kalau mau admin bisa menyimpan di Vercel.
4. Deploy.

## Catatan

- NATAcode membantu mengerjakan, menjelaskan, dan membimbing tugas/project. Tidak menerima joki ujian/quiz berjalan dan tidak mempromosikan plagiarisme; kategori "Custom / Lainnya" mengikuti aturan yang sama.
- WhatsApp dibuka lewat link `wa.me` dengan pesan terisi; pelanggan tetap menekan kirim sendiri.
