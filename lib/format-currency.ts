/** Format angka ke Rupiah, mis. 50000 → "Rp50.000". Deterministik (tanpa Intl) agar SSR = client. */
export function formatRupiah(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  return "Rp" + String(safe).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Ambil hanya digit dari input bebas, mis. "Rp 50.000" → "50000". Dibatasi 9 digit. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 9);
}

/** Format digit mentah untuk tampilan input, mis. "50000" → "50.000". */
export function formatDigitsDisplay(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseRupiah(value: string): number {
  const d = digitsOnly(value);
  return d ? Number(d) : 0;
}
