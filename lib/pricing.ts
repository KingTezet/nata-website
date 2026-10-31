import {
  DEFAULT_SCOPE,
  MIN_PRICE,
  RANGE_HIGH,
  RANGE_LOW,
  deadlineOptions,
  extraOptions,
  levels,
  scopeOptions,
  type Level,
} from "@/config/pricing";

export function roundPrice(n: number): number {
  const step = n < 500000 ? 5000 : 10000;
  return Math.round(n / step) * step;
}

export type Estimate = {
  level: Level;
  levelLabel: string;
  base: number;
  scopeLabel: string;
  scopeMult: number;
  deadlineLabel: string;
  deadlineMult: number;
  extrasPct: number;
  extrasLabels: string[];
  raw: number;
  recommended: number;
  low: number;
  high: number;
};

export type EstimateInput = {
  level: Level;
  scope?: string;
  deadline?: string;
  extras?: string[];
};

export function estimate({ level, scope = DEFAULT_SCOPE, deadline = "3-7", extras = [] }: EstimateInput): Estimate {
  const lv = levels[level];
  const sc = scopeOptions.find((s) => s.id === scope) ?? scopeOptions.find((s) => s.id === DEFAULT_SCOPE)!;
  const dl = deadlineOptions.find((d) => d.id === deadline) ?? deadlineOptions[1];
  const ex = extraOptions.filter((e) => extras.includes(e.id));
  const extrasPct = ex.reduce((sum, e) => sum + e.pct, 0);

  const raw = lv.base * sc.mult * dl.mult * (1 + extrasPct);
  const recommended = Math.max(MIN_PRICE, roundPrice(raw));
  const low = Math.max(MIN_PRICE, Math.min(recommended, roundPrice(raw * RANGE_LOW)));
  const high = Math.max(recommended, roundPrice(raw * RANGE_HIGH));

  return {
    level,
    levelLabel: lv.label,
    base: lv.base,
    scopeLabel: sc.label,
    scopeMult: sc.mult,
    deadlineLabel: dl.label,
    deadlineMult: dl.mult,
    extrasPct,
    extrasLabels: ex.map((e) => e.label),
    raw,
    recommended,
    low,
    high,
  };
}

export type VerdictTone = "great" | "ok" | "low" | "far";
export type Verdict = { tone: VerdictTone; title: string; text: string; ratio: number };

export function verdict(offer: number, recommended: number): Verdict {
  const ratio = recommended > 0 ? offer / recommended : 1;
  if (ratio >= 0.95)
    return { tone: "great", ratio, title: "Sesuai rekomendasi", text: "Besar kemungkinan langsung cocok dengan scope yang kamu pilih." };
  if (ratio >= 0.8)
    return { tone: "ok", ratio, title: "Sedikit di bawah", text: "Masih bisa dibahas. Mungkin ada bagian kecil yang disesuaikan." };
  if (ratio >= 0.6)
    return { tone: "low", ratio, title: "Di bawah rekomendasi", text: "Biasanya scope perlu dikurangi supaya pas dengan budget ini." };
  return { tone: "far", ratio, title: "Jauh di bawah rekomendasi", text: "Scope harus dipangkas banyak. Pertimbangkan naikkan budget atau pilih ukuran lebih kecil." };
}

/** Batas atas slider penawaran. */
export function offerMax(recommended: number): number {
  return Math.max(150000, roundPrice(recommended * 1.5));
}
