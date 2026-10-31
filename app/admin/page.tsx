import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { adminEnabled, isAdmin } from "@/lib/auth";
import { listProductsStrict, storageMode } from "@/lib/store";
import { iconMap } from "@/lib/icons";
import { STATUS_LABEL, type Product } from "@/lib/products";
import { logoutAction } from "./actions";
import { LoginForm } from "@/components/admin/LoginForm";
import { ProductForm } from "@/components/admin/ProductForm";
import { buttonClass } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Admin — NATA",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type SP = { edit?: string; new?: string; saved?: string; deleted?: string; error?: string };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="min-h-svh bg-muted py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-14">
      <div className="container-x max-w-3xl">{children}</div>
    </main>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;

  if (!adminEnabled()) {
    return (
      <Shell>
        <div className="rounded-[1.5rem] bg-white p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Admin belum aktif</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-subtle">
            Buat file <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">.env.local</code> di root project, isi:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-muted p-4 font-mono text-[13px]">ADMIN_PASSWORD=ganti-dengan-password-panjang</pre>
          <p className="mt-3 text-[13px] text-subtle">Minimal 8 karakter. Restart <code className="font-mono">npm run dev</code> setelah menyimpan.</p>
        </div>
      </Shell>
    );
  }

  if (!(await isAdmin())) {
    return (
      <Shell>
        <div className="mx-auto max-w-sm rounded-[1.5rem] bg-white p-6 sm:p-8">
          <p className="text-xl font-semibold tracking-tight">NATA.</p>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Masuk admin</h1>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </Shell>
    );
  }

  let products: Product[] = [];
  let loadError = "";
  try {
    products = await listProductsStrict();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Gagal memuat produk.";
  }

  const mode = storageMode();
  const editing = sp.new ? null : products.find((p) => p.id === sp.edit);
  const showForm = Boolean(sp.new) || Boolean(editing);
  const categories = [...new Set(products.map((p) => p.category))];
  const readOnlyHost = mode === "file" && Boolean(process.env.VERCEL);

  return (
    <Shell>
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin NATA</h1>
          <p className="mt-1 text-[13px] text-subtle">Penyimpanan: {mode === "supabase" ? "Supabase" : "File lokal (data/products.json)"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="inline-flex min-h-10 items-center rounded-full px-4 text-sm text-subtle hover:bg-white">
            Lihat situs
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="min-h-10 rounded-full bg-white px-4 text-sm font-medium hover:bg-white/70">
              Keluar
            </button>
          </form>
        </div>
      </header>

      {readOnlyHost && (
        <p role="alert" className="mt-5 rounded-xl bg-white px-4 py-3 text-[14px] leading-relaxed text-danger">
          Kamu di Vercel tanpa Supabase: file tidak bisa ditulis, jadi perubahan tidak akan tersimpan. Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY (lihat README).
        </p>
      )}
      {loadError && (
        <p role="alert" className="mt-5 rounded-xl bg-white px-4 py-3 text-[14px] leading-relaxed text-danger">
          {loadError}
        </p>
      )}
      {sp.saved && <p role="status" className="mt-5 rounded-xl bg-white px-4 py-3 text-[14px] text-success">Tersimpan. Landing page diperbarui.</p>}
      {sp.deleted && <p role="status" className="mt-5 rounded-xl bg-white px-4 py-3 text-[14px] text-success">Produk dihapus.</p>}
      {sp.error && <p role="alert" className="mt-5 rounded-xl bg-white px-4 py-3 text-[14px] text-danger">{sp.error}</p>}

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Produk ({products.length})</h2>
        {!showForm && (
          <Link href="/admin?new=1" className={buttonClass("primary", "min-h-10 px-4 text-sm")}>
            <Plus className="size-4" aria-hidden="true" />
            Tambah produk
          </Link>
        )}
      </div>

      {showForm ? (
        <div className="mt-4">
          <ProductForm key={editing?.id ?? "new"} product={editing ?? null} icons={Object.keys(iconMap)} categories={categories} />
        </div>
      ) : (
        <ul className="mt-4 grid gap-2">
          {products.length === 0 && <li className="rounded-2xl bg-white p-6 text-subtle">Belum ada produk.</li>}
          {products.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin?edit=${encodeURIComponent(p.id)}`}
                className="flex min-h-16 items-center justify-between gap-4 rounded-2xl bg-white px-5 py-3 transition-shadow hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold tracking-tight">
                    {p.name}
                    {p.featured && <span className="ml-2 text-[12px] font-normal text-subtle">· unggulan</span>}
                  </span>
                  <span className="block truncate text-[13px] text-subtle">
                    {p.category} · {STATUS_LABEL[p.status]}
                    {p.price ? ` · ${p.price}` : ""}
                  </span>
                </span>
                <span className="text-sm text-subtle">Edit</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
