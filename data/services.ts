import type { IconName } from "@/lib/icons";
import type { Level } from "@/config/pricing";

/**
 * Katalog layanan NATAcode — edit file ini untuk menambah/menghapus kategori & layanan.
 *
 * level 1–5 menentukan tingkat kesulitan dan harga dasar (lihat config/pricing.ts).
 * enabled: false → layanan hilang dari marketplace dan dari pilihan di form.
 * rough: true → estimasi ditandai "perkiraan kasar" (cocok untuk tugas custom yang belum jelas).
 */
export type ServiceCategory = {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  enabled: boolean;
};

export type Service = {
  id: string;
  name: string;
  category: string;
  description: string;
  level: Level;
  icon: IconName;
  enabled: boolean;
  rough?: boolean;
};

export const serviceCategories: ServiceCategory[] = [
  { id: "programming", name: "Programming", description: "Bahasa pemrograman, debugging, dan code review.", icon: "code", enabled: true },
  { id: "database", name: "Database", description: "Query, desain, dan integrasi database.", icon: "database", enabled: true },
  { id: "system", name: "Analisis Sistem", description: "Diagram, analisis kebutuhan, dan dokumentasi sistem.", icon: "workflow", enabled: true },
  { id: "web", name: "Web Development", description: "Dari setup project sampai aplikasi fullstack.", icon: "globe", enabled: true },
  { id: "uiux", name: "UI/UX", description: "Wireframe, desain UI, dan prototype.", icon: "pen", enabled: true },
  { id: "consulting", name: "Konsultasi & Mentoring", description: "Diskusi, penjelasan, dan pendampingan teknis.", icon: "message", enabled: true },
  { id: "custom", name: "Custom / Lainnya", description: "Tugas di luar coding — ceritakan saja, kami bantu cari bentuknya.", icon: "wand", enabled: true },
];

type Seed = [id: string, name: string, level: Level, description: string, icon: IconName, rough?: boolean];

function make(category: string, seeds: Seed[]): Service[] {
  return seeds.map(([id, name, level, description, icon, rough]) => ({
    id,
    name,
    category,
    description,
    level,
    icon,
    rough,
    enabled: true,
  }));
}

export const services: Service[] = [
  ...make("programming", [
    ["html-css", "HTML & CSS", 1, "Struktur halaman dan styling.", "template"],
    ["javascript", "JavaScript", 2, "Logika, DOM, dan fungsi JavaScript.", "braces"],
    ["php", "PHP", 2, "Bantuan pemrograman PHP.", "fileCode"],
    ["laravel", "Laravel", 3, "Bantuan project berbasis Laravel.", "server"],
    ["python", "Python", 2, "Bantuan pemrograman Python.", "terminal"],
    ["java", "Java", 2, "Bantuan pemrograman Java.", "code"],
    ["react", "React", 3, "Komponen, state, dan struktur project React.", "layers"],
    ["nextjs", "Next.js", 3, "Bantuan project Next.js.", "rocket"],
    ["debugging", "Debugging", 1, "Cari dan pahami penyebab error pada kodemu.", "bug"],
    ["code-review", "Code review", 2, "Tinjauan kode beserta saran perbaikan.", "review"],
    ["concept-explain", "Penjelasan konsep pemrograman", 1, "Konsep dijelaskan sampai kamu paham.", "book"],
    ["practice", "Latihan pemrograman", 1, "Latihan soal dan praktik bersama.", "terminal"],
  ]),
  ...make("database", [
    ["sql-query", "SQL query", 1, "Menyusun dan memperbaiki query SQL.", "database"],
    ["mysql", "MySQL", 2, "Bantuan database MySQL.", "database"],
    ["postgresql", "PostgreSQL", 2, "Bantuan database PostgreSQL.", "database"],
    ["erd", "ERD", 2, "Entity Relationship Diagram.", "network"],
    ["normalization", "Normalisasi database", 2, "Normalisasi tabel langkah demi langkah.", "table"],
    ["db-design", "Desain database", 3, "Perancangan struktur database.", "layers"],
    ["table-relations", "Relasi tabel", 2, "Relasi antar tabel dan foreign key.", "network"],
    ["db-integration", "Integrasi database", 3, "Menghubungkan aplikasi dengan database.", "server"],
  ]),
  ...make("system", [
    ["flowchart", "Flowchart", 1, "Alur proses yang rapi dan mudah dibaca.", "workflow"],
    ["dfd", "DFD", 2, "Data Flow Diagram.", "workflow"],
    ["use-case", "Use Case Diagram", 2, "Aktor dan kebutuhan fungsional sistem.", "users"],
    ["activity-diagram", "Activity Diagram", 2, "Alur aktivitas sistem.", "workflow"],
    ["sequence-diagram", "Sequence Diagram", 2, "Interaksi antar objek berdasarkan urutan.", "workflow"],
    ["class-diagram", "Class Diagram", 2, "Struktur kelas dan relasinya.", "network"],
    ["requirements", "Analisis kebutuhan sistem", 3, "Menggali dan merumuskan kebutuhan sistem.", "search"],
    ["system-docs", "Dokumentasi sistem", 2, "Dokumentasi teknis yang terstruktur.", "fileText"],
  ]),
  ...make("web", [
    ["project-setup", "Setup project", 1, "Menyiapkan environment dan struktur project.", "wrench"],
    ["landing-page", "Landing page", 2, "Halaman landing yang rapi dan responsif.", "template"],
    ["website-ui", "UI website", 2, "Implementasi tampilan website.", "template"],
    ["crud", "CRUD", 3, "Create, read, update, delete.", "table"],
    ["auth", "Authentication", 3, "Login, register, dan manajemen sesi.", "key"],
    ["rest-api", "Integrasi REST API", 3, "Menghubungkan aplikasi dengan REST API.", "network"],
    ["dashboard-ui", "Dashboard UI", 3, "Tampilan dashboard.", "dashboard"],
    ["bug-fixing", "Bug fixing", 2, "Memperbaiki bug pada aplikasi web.", "bug"],
    ["deployment", "Deployment", 2, "Menayangkan project ke hosting.", "rocket"],
    ["git-github", "Git & GitHub", 1, "Version control dan kolaborasi.", "git"],
    ["fullstack", "Aplikasi web fullstack", 5, "Frontend, backend, database, dan auth dalam satu aplikasi.", "layers"],
  ]),
  ...make("uiux", [
    ["wireframe", "Wireframe", 1, "Kerangka tata letak antarmuka.", "template"],
    ["ui-design", "Desain UI", 2, "Desain antarmuka yang konsisten.", "pen"],
    ["dashboard-design", "Desain dashboard", 3, "Desain tampilan dashboard.", "dashboard"],
    ["figma-prototype", "Figma prototype", 3, "Prototype interaktif di Figma.", "pen"],
    ["ui-redesign", "Review / redesign UI", 2, "Tinjau dan rapikan desain yang sudah ada.", "review"],
  ]),
  ...make("consulting", [
    ["consult-coding", "Konsultasi coding", 1, "Diskusi singkat soal kendala coding.", "message"],
    ["explain-error", "Penjelasan error", 1, "Memahami pesan error dan cara memperbaikinya.", "bug"],
    ["consult-review", "Review lewat diskusi", 2, "Tinjauan kode melalui sesi tanya jawab.", "review"],
    ["project-mentoring", "Pendampingan project", 4, "Dampingi project dari rancangan sampai selesai.", "users"],
    ["demo-prep", "Persiapan demo / presentasi project", 2, "Latihan demo dan menjelaskan project.", "presentation"],
    ["tech-mentoring", "Technical mentoring", 2, "Mentoring teknis berkelanjutan.", "book"],
  ]),
  ...make("custom", [
    ["custom-task", "Tugas custom", 2, "Punya tugas yang tidak ada di daftar? Ceritakan dulu.", "wand", true],
    ["presentation", "Presentasi / PPT", 2, "Susunan slide dan visual presentasi.", "presentation", true],
    ["document", "Dokumen & laporan", 2, "Merapikan format, struktur, dan tata letak dokumen.", "fileText", true],
    ["spreadsheet", "Olah data & Excel", 2, "Rumus, tabel, dan rekap data.", "table", true],
    ["graphic", "Desain grafis", 2, "Poster, infografis, atau materi visual.", "pen", true],
  ]),
];

export function getEnabledServices(): Service[] {
  const activeCats = new Set(serviceCategories.filter((c) => c.enabled).map((c) => c.id));
  return services.filter((s) => s.enabled && activeCats.has(s.category));
}

export function getEnabledCategories(): ServiceCategory[] {
  const withServices = new Set(getEnabledServices().map((s) => s.category));
  return serviceCategories.filter((c) => c.enabled && withServices.has(c.id));
}
