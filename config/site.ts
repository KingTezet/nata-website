/**
 * Konfigurasi brand & situs. Edit di sini untuk mengganti nama, tagline, dan metadata.
 */
export const siteConfig = {
  name: "NATA",
  wordmark: "NATA.",
  tagline: "Digital products & practical solutions.",
  description:
    "NATA menghadirkan digital products dan solusi praktis untuk membantu produktivitas, aktivitas, dan kebutuhan teknologi.",
  /** URL produksi (opsional). Diatur lewat env NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  /**
   * Social links — isi HANYA jika URL sudah ada. Array kosong = tidak ditampilkan.
   * Contoh: { label: "Instagram", href: "https://instagram.com/akunkamu" }
   */
  socials: [] as { label: string; href: string }[],
} as const;

export const codeConfig = {
  name: "NATAcode",
  descriptor: "Bantuan tugas & project",
  tagline: "Pilih pekerjaan, lihat harganya, tawar kalau perlu.",
  title: "NATAcode — Bantuan Tugas & Project, Harga Jelas",
  description:
    "Marketplace bantuan tugas dan project: coding, database, desain, presentasi, sampai tugas custom. Estimasi harga otomatis, bisa ditawar, mulai Rp50.000.",
} as const;
