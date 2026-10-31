"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveProductAction, deleteProductAction, type ActionState } from "@/app/admin/actions";
import { PRODUCT_STATUSES, STATUS_LABEL, type Product } from "@/lib/products";
import { Button } from "@/components/ui/Button";
import { ErrorText, Field, inputBase, selectBase } from "@/components/ui/Form";
import { cn } from "@/lib/utils";

export function ProductForm({ product, icons, categories }: { product: Product | null; icons: string[]; categories: string[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveProductAction, {});
  const isNew = product === null;
  const v = (key: string, fallback: string) => state.values?.[key] ?? fallback;

  return (
    <div className="rounded-[1.5rem] border border-line bg-white p-5 sm:p-7">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">{isNew ? "Produk baru" : `Edit: ${product.name}`}</h2>
        <Link href="/admin" className="inline-flex min-h-10 items-center rounded-full px-4 text-sm text-subtle hover:bg-muted">
          Tutup
        </Link>
      </div>

      <form action={action} className="space-y-5">
        {!isNew && <input type="hidden" name="originalId" value={product.id} />}
        <input type="hidden" name="id" value={product?.id ?? ""} />

        <Field id="name" label="Nama produk" required>
          <input id="name" name="name" required maxLength={80} defaultValue={v("name", product?.name ?? "")} className={inputBase} placeholder="Contoh: Habit OS" />
        </Field>
        <Field id="tagline" label="Tagline singkat" hint="Satu kalimat di bawah nama produk.">
          <input id="tagline" name="tagline" maxLength={120} defaultValue={v("tagline", product?.tagline ?? "")} className={inputBase} />
        </Field>
        <Field id="description" label="Deskripsi" required hint="Tulis yang benar-benar ada di produk. Jangan klaim fitur yang belum ada.">
          <textarea id="description" name="description" required rows={4} maxLength={600} defaultValue={v("description", product?.description ?? "")} className={cn(inputBase, "resize-y py-3 leading-relaxed")} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="category" label="Kategori" required hint="Dipakai sebagai filter di landing page.">
            <input id="category" name="category" required list="cat-list" maxLength={40} defaultValue={v("category", product?.category ?? "")} className={inputBase} placeholder="Habit, Money, …" />
            <datalist id="cat-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field id="status" label="Status" required>
            <select key={`status-${state.values?.status ?? "init"}`} id="status" name="status" defaultValue={v("status", product?.status ?? "comingSoon")} className={selectBase}>
              {PRODUCT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field id="icon" label="Ikon" required={false} optional={false}>
            <select key={`icon-${state.values?.icon ?? "init"}`} id="icon" name="icon" defaultValue={v("icon", product?.icon ?? "package")} className={selectBase}>
              {icons.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </Field>
          <Field id="sortOrder" label="Urutan" hint="Angka kecil tampil lebih dulu.">
            <input id="sortOrder" name="sortOrder" type="number" inputMode="numeric" defaultValue={v("sortOrder", String(product?.sortOrder ?? 100))} className={inputBase} />
          </Field>
          <Field id="price" label="Harga" hint="Teks bebas, mis. Rp49.000. Kosong = tidak tampil.">
            <input id="price" name="price" maxLength={40} defaultValue={v("price", product?.price ?? "")} className={inputBase} />
          </Field>
          <Field id="buyUrl" label="URL beli" hint="Link checkout asli (mis. Lynk.id). Kosong = tombol nonaktif.">
            <input id="buyUrl" name="buyUrl" type="url" inputMode="url" maxLength={400} defaultValue={v("buyUrl", product?.buyUrl ?? "")} className={inputBase} placeholder="https://" />
          </Field>
        </div>

        <Field id="imageUrl" label="URL gambar" hint="https://… atau /images/nama-file.png (file di folder public/images).">
          <input id="imageUrl" name="imageUrl" maxLength={400} defaultValue={v("imageUrl", product?.imageUrl ?? "")} className={inputBase} />
        </Field>
        <Field id="highlights" label="Poin unggulan" hint="Satu poin per baris, maksimal 6. Kosongkan jika belum ada.">
          <textarea id="highlights" name="highlights" rows={4} defaultValue={v("highlights", product?.highlights.join("\n") ?? "")} className={cn(inputBase, "resize-y py-3 leading-relaxed")} />
        </Field>

        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line px-4">
          <input type="checkbox" name="featured" defaultChecked={state.values ? "featured" in state.values : (product?.featured ?? false)} className="size-5 accent-[#111]" />
          <span className="text-[15px] font-medium">Tampilkan sebagai produk unggulan (kartu besar)</span>
        </label>

        {state.error && <ErrorText id="save-error">{state.error}</ErrorText>}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={pending} className="sm:flex-1">
            {pending ? "Menyimpan…" : isNew ? "Tambah produk" : "Simpan perubahan"}
          </Button>
        </div>
      </form>

      {!isNew && (
        <form action={deleteProductAction} className="mt-4 border-t border-line pt-4">
          <input type="hidden" name="id" value={product.id} />
          <button
            type="submit"
            onClick={(e) => {
              if (!window.confirm(`Hapus “${product.name}” secara permanen?`)) e.preventDefault();
            }}
            className="min-h-11 rounded-full px-4 text-sm font-medium text-danger hover:bg-danger/8"
          >
            Hapus produk ini
          </button>
        </form>
      )}
    </div>
  );
}
