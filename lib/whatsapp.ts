import { WHATSAPP_NUMBER } from "@/config/whatsapp";

/** Data yang sudah di-resolve ke label yang bisa dibaca manusia. */
export type ResolvedOrder = {
  name: string;
  phone: string;
  campus: string;
  major: string;
  course: string;
  category: string;
  service: string;
  difficulty: string;
  scope: string;
  extras: string;
  tech: string;
  description: string;
  deadline: string;
  /** mis. "Rp150.000 (kisaran Rp135.000–Rp175.000)" */
  estimate: string;
  /** mis. "Rp120.000" atau "Minta review dulu" */
  budget: string;
  /** catatan dari meter, mis. "Di bawah rekomendasi" — boleh kosong */
  budgetNote: string;
  link: string;
  notes: string;
};

const dash = (v: string) => (v && v.trim() ? v.trim() : "-");

export function buildOrderMessage(o: ResolvedOrder): string {
  return [
    "Halo NATAcode! Saya ingin mengajukan kebutuhan bantuan.",
    "",
    "DATA PEMESAN",
    `Nama: ${dash(o.name)}`,
    `WhatsApp: ${dash(o.phone)}`,
    `Universitas: ${dash(o.campus)}`,
    `Program Studi: ${dash(o.major)}`,
    `Mata Kuliah: ${dash(o.course)}`,
    "",
    "DETAIL KEBUTUHAN",
    `Kategori: ${dash(o.category)}`,
    `Jenis Layanan: ${dash(o.service)}`,
    `Tingkat Kesulitan: ${dash(o.difficulty)}`,
    `Ukuran Pekerjaan: ${dash(o.scope)}`,
    `Teknologi: ${dash(o.tech)}`,
    `Deskripsi: ${dash(o.description)}`,
    `Deadline: ${dash(o.deadline)}`,
    `Tambahan: ${dash(o.extras)}`,
    "",
    "ESTIMASI DARI WEBSITE",
    `Rekomendasi: ${dash(o.estimate)}`,
    "",
    "PENGAJUAN BUDGET",
    `Budget yang saya ajukan: ${dash(o.budget)}${o.budgetNote ? ` (${o.budgetNote})` : ""}`,
    "",
    "FILE / REFERENSI",
    `Link: ${dash(o.link)}`,
    `Catatan: ${dash(o.notes)}`,
    "",
    "Mohon review kebutuhan saya dan informasikan apakah budget tersebut sesuai atau ada penawaran lain. Terima kasih.",
  ].join("\n");
}

export function buildWhatsAppUrl(message?: string, number: string = WHATSAPP_NUMBER): string {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
