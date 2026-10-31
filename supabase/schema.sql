-- Jalankan sekali di Supabase → SQL Editor.
create table if not exists public.products (
  id          text primary key,
  name        text not null,
  tagline     text not null default '',
  description text not null default '',
  category    text not null default 'Lainnya',
  status      text not null default 'comingSoon' check (status in ('available','comingSoon','hidden')),
  icon        text not null default 'package',
  price       text not null default '',
  buy_url     text not null default '',
  image_url   text not null default '',
  featured    boolean not null default false,
  sort_order  integer not null default 100,
  highlights  text[] not null default '{}',
  updated_at  timestamptz not null default now()
);

-- Tabel ini hanya dibaca/ditulis dari server Next.js memakai service role key.
-- Aktifkan RLS tanpa policy publik supaya tidak bisa diakses langsung dari browser.
alter table public.products enable row level security;

-- (Opsional) isi data awal:
insert into public.products (id, name, tagline, description, category, status, icon, featured, sort_order) values
  ('habit-os',        'Habit OS',        'Catat dan pantau kebiasaan harian.', 'Workbook Excel untuk mencatat dan memantau kebiasaan serta rutinitas.', 'Habit',  'comingSoon', 'timer',   false, 10),
  ('money-os',        'Money OS',        'Lihat ke mana uangmu pergi.',        'Workbook Excel untuk membantu pencatatan pemasukan, pengeluaran, dan kondisi keuangan.', 'Money', 'comingSoon', 'wallet',  false, 20),
  ('focus-os',        'Focus OS',        'Atur fokus dan aktivitasmu.',        'Workbook Excel untuk pengelolaan fokus dan aktivitas.', 'Focus', 'comingSoon', 'layers',  false, 30),
  ('goals-os',        'Goals OS',        'Susun target, pantau progresnya.',   'Workbook Excel untuk perencanaan dan pemantauan target.', 'Goals', 'comingSoon', 'target',  false, 40),
  ('complete-bundle', 'Complete Bundle', 'Semua OS NATA dalam satu paket.',    'Bundel produk OS NATA dalam satu penawaran.', 'Bundle', 'comingSoon', 'package', true, 50)
on conflict (id) do nothing;
