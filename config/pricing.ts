/**
 * Konfigurasi harga NATAcode — edit angka di sini, seluruh website ikut berubah.
 *
 * Rumus estimasi (lihat lib/pricing.ts):
 *   harga = dasar(level) × ukuran pekerjaan × deadline × (1 + tambahan)
 * lalu dibulatkan (kelipatan Rp5.000 (Rp10.000 di atas Rp500.000)) dan tidak pernah di bawah MIN_PRICE.
 */
export const MIN_PRICE = 50000;

export type Level = 1 | 2 | 3 | 4 | 5;

export const levels: Record<Level, { label: string; base: number; blurb: string }> = {
  1: { label: "Dasar", base: 50000, blurb: "Satu masalah kecil dan jelas." },
  2: { label: "Menengah", base: 75000, blurb: "Beberapa langkah, perlu sedikit analisis." },
  3: { label: "Lanjut", base: 150000, blurb: "Beberapa komponen yang saling terhubung." },
  4: { label: "Kompleks", base: 300000, blurb: "Banyak bagian, perlu perancangan dan pendampingan." },
  5: { label: "Proyek besar", base: 500000, blurb: "Aplikasi utuh dengan banyak fitur dan integrasi." },
};

export type ScopeOption = { id: string; label: string; mult: number; hint: string };
export const scopeOptions: ScopeOption[] = [
  { id: "light", label: "Ringan", mult: 0.8, hint: "Satu hal kecil: 1 fitur, 1 soal, atau 1 halaman." },
  { id: "standard", label: "Standar", mult: 1, hint: "Beberapa bagian dalam satu topik yang sama." },
  { id: "large", label: "Besar", mult: 1.5, hint: "Banyak bagian, atau bagian-bagiannya saling terhubung." },
];
export const DEFAULT_SCOPE = "standard";

export type DeadlineOption = { id: string; label: string; mult: number; urgent?: boolean };
export const deadlineOptions: DeadlineOption[] = [
  { id: "relaxed", label: "Tidak terburu-buru", mult: 1 },
  { id: "3-7", label: "3–7 hari", mult: 1 },
  { id: "1-2", label: "1–2 hari", mult: 1.25 },
  { id: "urgent", label: "Hari ini / urgent", mult: 1.5, urgent: true },
];

export type ExtraOption = { id: string; label: string; pct: number; hint: string };
export const extraOptions: ExtraOption[] = [
  { id: "explain", label: "Sesi penjelasan", pct: 0.15, hint: "Dijelaskan langkah demi langkah supaya kamu paham." },
  { id: "docs", label: "Dokumentasi / laporan teknis", pct: 0.15, hint: "Catatan atau dokumen pendukung." },
  { id: "revision", label: "Revisi tambahan", pct: 0.1, hint: "Jatah revisi lebih banyak dari standar." },
];

/** Rentang di sekitar harga rekomendasi. */
export const RANGE_LOW = 0.9;
export const RANGE_HIGH = 1.15;

export const pricingNote =
  "Ini estimasi otomatis dari website. Harga final dikonfirmasi setelah brief-mu dibaca. Kalau ternyata pekerjaannya lebih besar dari yang dipilih, kami kabari sebelum mulai — tidak ada tagihan kejutan.";

export const priceFactors = [
  { title: "Tingkat kesulitan", text: "Setiap layanan punya level 1–5. Level menentukan harga dasar." },
  { title: "Ukuran pekerjaan", text: "Ringan, standar, atau besar. Makin banyak bagian, makin tinggi." },
  { title: "Deadline", text: "Mepet butuh waktu lebih fokus, jadi ada tambahan." },
  { title: "Tambahan", text: "Sesi penjelasan, dokumentasi, atau revisi ekstra — opsional." },
];
