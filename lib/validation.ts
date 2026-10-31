import { MIN_PRICE, deadlineOptions, extraOptions, scopeOptions } from "@/config/pricing";
import { digitsOnly, parseRupiah } from "@/lib/format-currency";

export type OfferMode = "" | "recommended" | "custom" | "review";

export type OrderFormData = {
  categoryId: string;
  serviceId: string;
  scope: string;
  deadline: string;
  extras: string[];
  tech: string;
  description: string;
  link: string;
  notes: string;
  offerMode: OfferMode;
  offerAmount: string;
  name: string;
  phone: string;
  campus: string;
  major: string;
  course: string;
};

export const emptyOrder: OrderFormData = {
  categoryId: "",
  serviceId: "",
  scope: "standard",
  deadline: "",
  extras: [],
  tech: "",
  description: "",
  link: "",
  notes: "",
  offerMode: "recommended",
  offerAmount: "",
  name: "",
  phone: "",
  campus: "",
  major: "",
  course: "",
};

export type OrderErrors = Partial<Record<keyof OrderFormData, string>>;

const LIMITS = {
  name: 80,
  phone: 20,
  campus: 100,
  major: 100,
  course: 100,
  tech: 120,
  description: 2000,
  link: 300,
  notes: 1000,
} as const;

/** Hapus karakter kontrol, rapikan spasi. `multiline` mempertahankan baris baru (maks 2 berturut-turut). */
export function cleanText(value: string, max: number, multiline = false): string {
  let v = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/\r\n?/g, "\n");
  if (multiline) {
    v = v
      .split("\n")
      .map((l) => l.replace(/[ \t]+/g, " ").trimEnd())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
  } else {
    v = v.replace(/\s+/g, " ");
  }
  return v.trim().slice(0, max);
}

export function sanitizeOrder(d: OrderFormData): OrderFormData {
  return {
    ...d,
    extras: d.extras.filter((e) => extraOptions.some((o) => o.id === e)),
    name: cleanText(d.name, LIMITS.name),
    phone: cleanText(d.phone, LIMITS.phone),
    campus: cleanText(d.campus, LIMITS.campus),
    major: cleanText(d.major, LIMITS.major),
    course: cleanText(d.course, LIMITS.course),
    tech: cleanText(d.tech, LIMITS.tech),
    description: cleanText(d.description, LIMITS.description, true),
    link: cleanText(d.link, LIMITS.link),
    notes: cleanText(d.notes, LIMITS.notes, true),
    offerAmount: digitsOnly(d.offerAmount),
  };
}

/** Normalisasi nomor Indonesia ke digit saja; terima 08xx, 628xx, +628xx. */
export function normalizePhone(value: string): string {
  const digits = value.replace(/[^\d+]/g, "").replace(/\+/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("8")) return "62" + digits;
  return digits;
}

export function isValidPhone(value: string): boolean {
  if (!/^[\d\s+\-()]+$/.test(value)) return false;
  const n = normalizePhone(value);
  return /^62\d{8,13}$/.test(n) && n.startsWith("628");
}

export function isValidUrl(value: string): boolean {
  try {
    const u = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".");
  } catch {
    return false;
  }
}

export type StepNo = 1 | 2 | 3 | 4;

/** Validasi per langkah wizard. Langkah 4 = data kontak. */
export function validateStep(step: StepNo, raw: OrderFormData): OrderErrors {
  const d = sanitizeOrder(raw);
  const e: OrderErrors = {};

  if (step === 1) {
    if (!d.categoryId) e.categoryId = "Pilih kategori layanan.";
    if (!d.serviceId) e.serviceId = "Pilih jenis pekerjaan.";
  }

  if (step === 2) {
    if (!d.description) e.description = "Ceritakan kebutuhanmu terlebih dahulu.";
    else if (d.description.length < 10) e.description = "Deskripsi terlalu singkat. Tambahkan sedikit detail.";
    if (!scopeOptions.some((s) => s.id === d.scope)) e.scope = "Pilih ukuran pekerjaan.";
    if (!deadlineOptions.some((x) => x.id === d.deadline)) e.deadline = "Pilih deadline.";
    if (d.link && !isValidUrl(d.link)) e.link = "Link tidak valid. Gunakan URL Google Drive/GitHub, mis. https://…";
  }

  if (step === 3) {
    if (!d.offerMode) e.offerMode = "Pilih salah satu.";
    if (d.offerMode === "custom") {
      const amount = parseRupiah(d.offerAmount);
      if (!d.offerAmount) e.offerAmount = "Isi nominal penawaran.";
      else if (amount < MIN_PRICE) e.offerAmount = "Minimal Rp50.000.";
    }
  }

  if (step === 4) {
    if (!d.name) e.name = "Nama wajib diisi.";
    else if (d.name.length < 2) e.name = "Nama terlalu pendek.";
    if (!d.phone) e.phone = "Nomor WhatsApp wajib diisi.";
    else if (!isValidPhone(d.phone)) e.phone = "Nomor tidak valid. Contoh: 08123456789.";
  }

  return e;
}

export function validateOrder(raw: OrderFormData): OrderErrors {
  return { ...validateStep(1, raw), ...validateStep(2, raw), ...validateStep(3, raw), ...validateStep(4, raw) };
}
