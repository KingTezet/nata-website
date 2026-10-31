/** Tipe dan fungsi murni untuk produk NATA (aman dipakai di server maupun client). */
export const PRODUCT_STATUSES = ["available", "comingSoon", "hidden"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const STATUS_LABEL: Record<ProductStatus, string> = {
  available: "Tersedia",
  comingSoon: "Segera tersedia",
  hidden: "Disembunyikan",
};

export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  status: ProductStatus;
  /** nama ikon di lib/icons.tsx */
  icon: string;
  /** teks bebas, mis. "Rp49.000". Kosong = tidak tampil. */
  price: string;
  buyUrl: string;
  imageUrl: string;
  featured: boolean;
  sortOrder: number;
  highlights: string[];
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** URL aman: kosong, path relatif "/…", atau http(s). */
export function isSafeUrl(v: string): boolean {
  if (!v) return true;
  if (v.startsWith("/") && !v.startsWith("//")) return true;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function parseHighlights(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-•*\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 6)
    .map((l) => l.slice(0, 120));
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max) : "");

export type ParseResult = { ok: true; product: Product } | { ok: false; error: string };

/** Validasi + normalisasi input mentah (dari form admin atau baris database). */
export function sanitizeProduct(input: Record<string, unknown>, validIcons: string[]): ParseResult {
  const name = str(input.name, 80);
  if (!name) return { ok: false, error: "Nama produk wajib diisi." };

  const id = slugify(str(input.id, 60) || name);
  if (!id) return { ok: false, error: "ID produk tidak valid." };

  const description = str(input.description, 600);
  if (!description) return { ok: false, error: "Deskripsi wajib diisi." };

  const category = str(input.category, 40) || "Lainnya";
  const statusRaw = str(input.status, 20);
  if (!PRODUCT_STATUSES.includes(statusRaw as ProductStatus)) return { ok: false, error: "Status tidak valid." };

  const icon = validIcons.includes(str(input.icon, 30)) ? str(input.icon, 30) : "package";

  const buyUrl = str(input.buyUrl, 400);
  const imageUrl = str(input.imageUrl, 400);
  if (!isSafeUrl(buyUrl)) return { ok: false, error: "URL beli harus diawali https:// (atau http://)." };
  if (!isSafeUrl(imageUrl)) return { ok: false, error: "URL gambar harus diawali https://, http://, atau / (file di public)." };

  const sortRaw = Number(input.sortOrder);
  const sortOrder = Number.isFinite(sortRaw) ? Math.max(-9999, Math.min(9999, Math.round(sortRaw))) : 100;

  const hl = input.highlights;
  const highlights = Array.isArray(hl) ? hl.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean).slice(0, 6) : parseHighlights(str(hl, 1000).length ? String(hl) : "");

  return {
    ok: true,
    product: {
      id,
      name,
      tagline: str(input.tagline, 120),
      description,
      category,
      status: statusRaw as ProductStatus,
      icon,
      price: str(input.price, 40),
      buyUrl,
      imageUrl,
      featured: input.featured === true || input.featured === "on" || input.featured === "true",
      sortOrder,
      highlights,
    },
  };
}

type Row = {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category: string | null;
  status: string | null;
  icon: string | null;
  price: string | null;
  buy_url: string | null;
  image_url: string | null;
  featured: boolean | null;
  sort_order: number | null;
  highlights: string[] | null;
};

export function productFromRow(r: Row): Product {
  return {
    id: r.id,
    name: r.name,
    tagline: r.tagline ?? "",
    description: r.description ?? "",
    category: r.category ?? "Lainnya",
    status: PRODUCT_STATUSES.includes(r.status as ProductStatus) ? (r.status as ProductStatus) : "hidden",
    icon: r.icon ?? "package",
    price: r.price ?? "",
    buyUrl: r.buy_url ?? "",
    imageUrl: r.image_url ?? "",
    featured: Boolean(r.featured),
    sortOrder: r.sort_order ?? 100,
    highlights: Array.isArray(r.highlights) ? r.highlights : [],
  };
}

export function productToRow(p: Product): Row {
  return {
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    category: p.category,
    status: p.status,
    icon: p.icon,
    price: p.price,
    buy_url: p.buyUrl,
    image_url: p.imageUrl,
    featured: p.featured,
    sort_order: p.sortOrder,
    highlights: p.highlights,
  };
}

export function sortProducts(list: Product[]): Product[] {
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}
