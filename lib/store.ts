import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import seed from "@/data/products.json";
import { iconMap } from "@/lib/icons";
import { productFromRow, productToRow, sanitizeProduct, sortProducts, type Product } from "@/lib/products";

/**
 * Penyimpanan produk.
 *  - Jika SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY diisi → tabel `products` di Supabase (disarankan untuk produksi/Vercel).
 *  - Jika tidak → file lokal data/products.json (cocok untuk dijalankan di laptop / VPS; di Vercel file bersifat read-only).
 */
const FILE = path.join(process.cwd(), "data", "products.json");
const ICONS = Object.keys(iconMap);

export type StorageMode = "supabase" | "file";

function supabase() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

export function storageMode(): StorageMode {
  return supabase() ? "supabase" : "file";
}

async function sb(pathAndQuery: string, init: RequestInit = {}) {
  const cfg = supabase();
  if (!cfg) throw new Error("Supabase belum dikonfigurasi.");
  const res = await fetch(`${cfg.url}/rest/v1/${pathAndQuery}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Supabase ${res.status}: ${body.slice(0, 200) || res.statusText}`);
  }
  return res;
}

function normalizeList(raw: unknown): Product[] {
  if (!Array.isArray(raw)) return [];
  const out: Product[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const r = sanitizeProduct(item as Record<string, unknown>, ICONS);
    if (r.ok) out.push(r.product);
  }
  return sortProducts(out);
}

async function readFileStore(): Promise<Product[]> {
  try {
    return normalizeList(JSON.parse(await fs.readFile(FILE, "utf8")));
  } catch {
    return normalizeList(seed);
  }
}

/** Untuk admin: error dilempar supaya terlihat. */
export async function listProductsStrict(): Promise<Product[]> {
  if (supabase()) {
    const res = await sb("products?select=*&order=sort_order.asc,name.asc");
    const rows = (await res.json()) as Parameters<typeof productFromRow>[0][];
    return sortProducts(rows.map(productFromRow));
  }
  return readFileStore();
}

/** Untuk landing page: tidak pernah melempar error; jatuh ke data awal. */
export async function listProducts(): Promise<Product[]> {
  try {
    return await listProductsStrict();
  } catch (e) {
    console.error("[store] gagal membaca produk, memakai data awal:", e);
    return normalizeList(seed);
  }
}

export async function upsertProduct(p: Product): Promise<void> {
  if (supabase()) {
    await sb("products?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(productToRow(p)),
    });
    return;
  }
  const list = await readFileStore();
  const next = sortProducts([...list.filter((x) => x.id !== p.id), p]);
  await writeFileStore(next);
}

export async function deleteProduct(id: string): Promise<void> {
  if (supabase()) {
    await sb(`products?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
    return;
  }
  const list = await readFileStore();
  await writeFileStore(list.filter((x) => x.id !== id));
}

async function writeFileStore(list: Product[]): Promise<void> {
  try {
    const tmp = `${FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(list, null, 2) + "\n", "utf8");
    await fs.rename(tmp, FILE);
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
      throw new Error("Hosting ini tidak mengizinkan menulis file. Pasang Supabase (lihat README) agar admin bisa menyimpan.");
    }
    throw e;
  }
}
