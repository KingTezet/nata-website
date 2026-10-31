"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, destroySession, isAdmin, verifyPassword } from "@/lib/auth";
import { iconMap } from "@/lib/icons";
import { parseHighlights, sanitizeProduct } from "@/lib/products";
import { deleteProduct, listProductsStrict, upsertProduct } from "@/lib/store";

export type ActionState = { error?: string; values?: Record<string, string> };

const ICONS = Object.keys(iconMap);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const pw = typeof fd.get("password") === "string" ? (fd.get("password") as string) : "";
  if (!verifyPassword(pw)) {
    await sleep(800); // perlambat tebakan password
    return { error: "Password salah." };
  }
  await createSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin");
}

export async function saveProductAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return { error: "Sesi berakhir. Muat ulang dan login lagi." };

  const values: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") values[k] = v;
  const fail = (error: string): ActionState => ({ error, values });

  const raw: Record<string, unknown> = Object.fromEntries(fd.entries());
  raw.highlights = parseHighlights(typeof raw.highlights === "string" ? raw.highlights : "");
  const parsed = sanitizeProduct(raw, ICONS);
  if (!parsed.ok) return fail(parsed.error);

  const editingId = typeof raw.originalId === "string" ? raw.originalId : "";
  const product = editingId ? { ...parsed.product, id: editingId } : parsed.product;

  if (!editingId) {
    try {
      if ((await listProductsStrict()).some((p) => p.id === product.id)) {
        return fail(`Produk dengan ID “${product.id}” sudah ada. Ubah nama, atau edit produk yang lama.`);
      }
    } catch {
      /* lanjut — error penyimpanan akan muncul saat menyimpan */
    }
  }

  try {
    await upsertProduct(product);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Gagal menyimpan.");
  }
  revalidatePath("/");
  redirect(`/admin?saved=${encodeURIComponent(product.id)}`);
}

export async function deleteProductAction(fd: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin");
  const id = typeof fd.get("id") === "string" ? (fd.get("id") as string) : "";
  if (id) {
    try {
      await deleteProduct(id);
    } catch {
      redirect(`/admin?error=${encodeURIComponent("Gagal menghapus produk.")}`);
    }
    revalidatePath("/");
  }
  redirect("/admin?deleted=1");
}
