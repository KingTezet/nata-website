"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { MIN_PRICE, deadlineOptions, extraOptions, levels, pricingNote, scopeOptions } from "@/config/pricing";
import { getEnabledCategories, getEnabledServices } from "@/data/services";
import { digitsOnly, formatDigitsDisplay, formatRupiah, parseRupiah } from "@/lib/format-currency";
import { estimate, offerMax, verdict, type Estimate } from "@/lib/pricing";
import { buildOrderMessage, buildWhatsAppUrl, type ResolvedOrder } from "@/lib/whatsapp";
import {
  emptyOrder,
  sanitizeOrder,
  validateStep,
  type OfferMode,
  type OrderErrors,
  type OrderFormData,
  type StepNo,
} from "@/lib/validation";
import { SELECT_SERVICE_EVENT, type SelectServiceDetail } from "@/lib/events";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ChipGroup, ErrorText, Field, LevelDots, inputBase, selectBase } from "@/components/ui/Form";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "nata:order-draft:v2";
const STEPS: { n: StepNo; label: string }[] = [
  { n: 1, label: "Layanan" },
  { n: 2, label: "Detail" },
  { n: 3, label: "Harga" },
  { n: 4, label: "Kirim" },
];

type Phase = "form" | "review" | "opened";

const rangeText = (e: Estimate) =>
  e.low === e.high ? formatRupiah(e.recommended) : `${formatRupiah(e.low)}–${formatRupiah(e.high).replace("Rp", "")}`;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function StepBar({ step, onGo }: { step: StepNo; onGo: (n: StepNo) => void }) {
  return (
    <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Langkah pemesanan">
      {STEPS.map((s) => {
        const done = s.n < step;
        const current = s.n === step;
        return (
          <li key={s.n} aria-current={current ? "step" : undefined}>
            <button
              type="button"
              disabled={!done}
              onClick={() => onGo(s.n)}
              className="group block min-h-11 w-full text-left disabled:cursor-default"
            >
              <span className={cn("block h-1 rounded-full transition-colors duration-500", done || current ? "bg-fg" : "bg-line")} />
              <span className={cn("mt-2 flex items-center gap-1.5 text-[12px] font-medium", current ? "text-fg" : "text-subtle")}>
                {done ? <Check className="size-3" strokeWidth={3} aria-hidden="true" /> : <span className="tabular-nums">{s.n}</span>}
                {s.label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function OfferMeter({ offer, recommended }: { offer: number; recommended: number }) {
  const max = offerMax(recommended);
  const v = verdict(offer, recommended);
  const pct = Math.min(100, (offer / max) * 100);
  const tick = Math.min(100, (recommended / max) * 100);
  return (
    <div>
      <div className="relative mt-8 h-2 rounded-full bg-line" aria-hidden="true">
        <div className="absolute inset-y-0 left-0 rounded-full bg-fg transition-[width] duration-300" style={{ width: `${pct}%` }} />
        <div className="absolute -top-1.5 h-5 w-px bg-fg/40" style={{ left: `${tick}%` }} />
        <span
          className="absolute -top-8 -translate-x-1/2 text-[11px] font-medium whitespace-nowrap text-subtle"
          style={{ left: `${Math.min(88, Math.max(12, tick))}%` }}
        >
          Rekomendasi
        </span>
      </div>
      <div className="mt-4 flex items-start gap-3 rounded-xl bg-muted px-4 py-3" role="status" aria-live="polite">
        <span
          className={cn(
            "mt-1.5 size-2 shrink-0 rounded-full",
            v.tone === "great" && "bg-success",
            (v.tone === "ok" || v.tone === "low") && "bg-subtle",
            v.tone === "far" && "bg-danger",
          )}
          aria-hidden="true"
        />
        <p className="text-[14px] leading-relaxed">
          <span className="font-semibold">{v.title}.</span> <span className="text-subtle">{v.text}</span>
        </p>
      </div>
    </div>
  );
}

export function OrderWizard() {
  const categories = useMemo(() => getEnabledCategories(), []);
  const enabledServices = useMemo(() => getEnabledServices(), []);

  const [form, setForm] = useState<OrderFormData>(emptyOrder);
  const [step, setStep] = useState<StepNo>(1);
  const [phase, setPhase] = useState<Phase>("form");
  const [showErrors, setShowErrors] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [restored, setRestored] = useState(false);
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  const formRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const set = useCallback(<K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const scrollTop = () => requestAnimationFrame(() => topRef.current?.scrollIntoView({ block: "start" }));

  /* Pulihkan draft (sekali, setelah hydration). */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isRecord(parsed)) {
          const next: OrderFormData = { ...emptyOrder };
          (Object.keys(emptyOrder) as (keyof OrderFormData)[]).forEach((k) => {
            const v = parsed[k];
            if (k === "extras") {
              if (Array.isArray(v)) next.extras = v.filter((x): x is string => typeof x === "string");
            } else if (k === "offerMode") {
              if (v === "" || v === "recommended" || v === "custom" || v === "review") next.offerMode = v as OfferMode;
            } else if (typeof v === "string") {
              (next[k] as string) = v;
            }
          });
          if (JSON.stringify(next) !== JSON.stringify(emptyOrder)) {
            setForm(next);
            setRestored(true);
          }
        }
      }
    } catch {
      /* localStorage tidak tersedia */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (JSON.stringify(form) === JSON.stringify(emptyOrder)) window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      /* abaikan */
    }
  }, [form, hydrated]);

  /* Klik kartu di marketplace → pilih layanan, loncat ke langkah Detail. */
  useEffect(() => {
    const onSelect = (e: Event) => {
      const d = (e as CustomEvent<SelectServiceDetail>).detail;
      const svc = enabledServices.find((s) => s.id === d?.serviceId);
      if (!svc) return;
      setForm((f) => ({ ...f, categoryId: svc.category, serviceId: svc.id }));
      setShowErrors(false);
      setPhase("form");
      setStep(2);
    };
    window.addEventListener(SELECT_SERVICE_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_SERVICE_EVENT, onSelect);
  }, [enabledServices]);

  const service = enabledServices.find((s) => s.id === form.serviceId);
  const servicesInCategory = enabledServices.filter((s) => s.category === form.categoryId);
  const est = useMemo(
    () => (service ? estimate({ level: service.level, scope: form.scope, deadline: form.deadline || "3-7", extras: form.extras }) : null),
    [service, form.scope, form.deadline, form.extras],
  );
  const deadline = deadlineOptions.find((d) => d.id === form.deadline);

  const errors: OrderErrors = useMemo(() => validateStep(step, form), [step, form]);
  const err = (k: keyof OrderFormData) => (showErrors ? errors[k] : undefined);

  const offerAmt = est
    ? form.offerMode === "recommended"
      ? est.recommended
      : form.offerMode === "custom"
        ? parseRupiah(form.offerAmount)
        : 0
    : 0;

  const resolved: ResolvedOrder = useMemo(() => {
    const c = sanitizeOrder(form);
    const cat = categories.find((x) => x.id === c.categoryId)?.name ?? "";
    const e = est;
    let budget = "";
    let budgetNote = "";
    if (e) {
      if (c.offerMode === "recommended") {
        budget = formatRupiah(e.recommended);
        budgetNote = "mengikuti rekomendasi";
      } else if (c.offerMode === "custom") {
        const amt = parseRupiah(c.offerAmount);
        budget = amt ? formatRupiah(amt) : "";
        budgetNote = amt ? verdict(amt, e.recommended).title.toLowerCase() : "";
      } else if (c.offerMode === "review") {
        budget = "Minta review dulu";
      }
    }
    return {
      name: c.name,
      phone: c.phone,
      campus: c.campus,
      major: c.major,
      course: c.course,
      category: cat,
      service: service?.name ?? "",
      difficulty: e ? `${e.levelLabel} (${e.level}/5)` : "",
      scope: e?.scopeLabel ?? "",
      extras: e?.extrasLabels.join(", ") ?? "",
      tech: c.tech,
      description: c.description,
      deadline: deadlineOptions.find((d) => d.id === c.deadline)?.label ?? "",
      estimate: e ? (e.low === e.high ? formatRupiah(e.recommended) : `${formatRupiah(e.recommended)} (kisaran ${rangeText(e)})`) : "",
      budget,
      budgetNote,
      link: c.link,
      notes: c.notes,
    };
  }, [form, categories, est, service]);

  const message = useMemo(() => buildOrderMessage(resolved), [resolved]);
  const waUrl = useMemo(() => buildWhatsAppUrl(message), [message]);

  const focusFirstInvalid = () =>
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus());

  const next = (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowErrors(true);
    if (Object.keys(errors).length > 0) return focusFirstInvalid();
    setShowErrors(false);
    if (step === 4) {
      setPhase("review");
      setCopied("idle");
    } else {
      setStep((s) => (s + 1) as StepNo);
    }
    scrollTop();
  };

  const back = () => {
    setShowErrors(false);
    if (step === 4 && phase !== "form") setPhase("form");
    else if (step > 1) setStep((s) => (s - 1) as StepNo);
    scrollTop();
  };

  const goTo = (n: StepNo) => {
    setShowErrors(false);
    setPhase("form");
    setStep(n);
    scrollTop();
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied("ok");
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = message;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(ok ? "ok" : "fail");
      } catch {
        setCopied("fail");
      }
    }
    window.setTimeout(() => setCopied("idle"), 2500);
  };

  const clearDraft = () => {
    setForm(emptyOrder);
    setShowErrors(false);
    setRestored(false);
    setStep(1);
    setPhase("form");
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* abaikan */
    }
  };

  const hasContent = JSON.stringify(form) !== JSON.stringify(emptyOrder);
  const setOfferMode = (m: OfferMode) =>
    setForm((f) => ({
      ...f,
      offerMode: m,
      offerAmount: m === "custom" && !f.offerAmount && est ? String(est.recommended) : f.offerAmount,
    }));

  const sliderMax = est ? offerMax(est.recommended) : 150000;

  return (
    <section id="order" className="section-y">
      <div className="container-x">
        <div ref={topRef} className="mx-auto max-w-2xl scroll-mt-20">
          <div className="text-center">
            <h2 className="text-[2rem] leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">Hitung & pesan.</h2>
            <p className="mt-4 text-base leading-relaxed text-pretty text-subtle sm:text-lg">
              Empat langkah singkat. Harga estimasi muncul sebelum kamu mengirim apa pun.
            </p>
          </div>

          <div className="mt-10 rounded-[1.75rem] border border-line bg-white p-5 sm:p-8">
            {phase === "opened" ? (
              <div className="animate-pop-in text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
                  <Check className="size-7" strokeWidth={2.25} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight">WhatsApp dibuka.</h3>
                <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-subtle">
                  Pesanmu sudah terisi. Tekan <span className="font-medium text-fg">Send</span> di WhatsApp untuk mengirimnya. Kami baca brief-mu, lalu
                  konfirmasi scope dan harga.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <ButtonLink href={waUrl} className="w-full">
                    <MessageCircle className="size-4" aria-hidden="true" />
                    Buka WhatsApp lagi
                  </ButtonLink>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="secondary" onClick={copyMessage}>
                      {copied === "ok" ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                      {copied === "ok" ? "Tersalin" : "Salin pesan"}
                    </Button>
                    <Button variant="secondary" onClick={() => setPhase("review")}>
                      <ArrowLeft className="size-4" aria-hidden="true" />
                      Kembali
                    </Button>
                  </div>
                  <Button variant="ghost" onClick={clearDraft}>
                    Buat pesanan baru
                  </Button>
                </div>
              </div>
            ) : (
              <div ref={formRef}>
                <StepBar step={step} onGo={goTo} />

                {restored && step === 1 && phase === "form" && (
                  <div className="mb-6 flex items-start justify-between gap-3 rounded-xl bg-muted px-4 py-3 text-[13px]">
                    <p className="pt-1 text-subtle">Draft sebelumnya dipulihkan dari browser ini.</p>
                    <button
                      type="button"
                      onClick={clearDraft}
                      className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 font-medium hover:bg-white"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Hapus draft
                    </button>
                  </div>
                )}

                {/* Ringkasan layanan terpilih + estimasi sementara */}
                {service && est && phase === "form" && step !== 1 && (
                  <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-muted px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold tracking-tight">{service.name}</p>
                      <p className="mt-1 flex items-center gap-2 text-[12px] text-subtle">
                        <LevelDots level={service.level} />
                        {est.levelLabel}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] text-subtle">{step === 3 ? "Estimasi" : "Estimasi sementara"}</p>
                      <p key={est.recommended} className="animate-pop-in text-[17px] font-semibold tracking-tight tabular-nums">
                        {formatRupiah(est.recommended)}
                      </p>
                    </div>
                  </div>
                )}

                {/* ===== LANGKAH 1: LAYANAN ===== */}
                {step === 1 && phase === "form" && (
                  <form onSubmit={next} noValidate className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">Pekerjaan apa yang kamu butuhkan?</h3>
                      <p className="mt-1 text-[15px] text-subtle">Sudah pilih dari kartu di atas? Langkah ini otomatis terlewati.</p>
                    </div>
                    <Field id="categoryId" label="Kategori" required error={err("categoryId")}>
                      <select
                        id="categoryId"
                        className={selectBase}
                        value={form.categoryId}
                        onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value, serviceId: "" }))}
                        aria-invalid={err("categoryId") ? true : undefined}
                        aria-describedby={err("categoryId") ? "categoryId-error" : undefined}
                      >
                        <option value="">Pilih kategori</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field id="serviceId" label="Jenis pekerjaan" required error={err("serviceId")}>
                      <select
                        id="serviceId"
                        className={selectBase}
                        value={form.serviceId}
                        onChange={(e) => set("serviceId", e.target.value)}
                        disabled={!form.categoryId}
                        aria-invalid={err("serviceId") ? true : undefined}
                        aria-describedby={err("serviceId") ? "serviceId-error" : undefined}
                      >
                        <option value="">{form.categoryId ? "Pilih jenis pekerjaan" : "Pilih kategori dulu"}</option>
                        {servicesInCategory.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    {service && est && (
                      <div className="animate-pop-in rounded-2xl bg-muted p-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[13px] font-medium text-subtle">Tingkat kesulitan</p>
                          <LevelDots level={service.level} />
                        </div>
                        <p className="mt-1 text-lg font-semibold tracking-tight">
                          {levels[service.level].label}
                          <span className="ml-2 text-[14px] font-normal text-subtle">{levels[service.level].blurb}</span>
                        </p>
                        <div className="mt-4 border-t border-line pt-4">
                          <p className="text-[13px] text-subtle">{service.rough ? "Perkiraan kasar" : "Rekomendasi awal"} (ukuran standar)</p>
                          <p key={est.recommended} className="animate-pop-in mt-0.5 text-3xl font-semibold tracking-tight tabular-nums">
                            {rangeText(estimate({ level: service.level }))}
                          </p>
                          <p className="mt-2 text-[13px] text-subtle">Angka final dihitung di langkah Harga, setelah kamu mengisi detail.</p>
                        </div>
                      </div>
                    )}

                    <Button type="submit" className="w-full">
                      Lanjut <ArrowRight className="size-4" aria-hidden="true" />
                    </Button>
                  </form>
                )}

                {/* ===== LANGKAH 2: DETAIL ===== */}
                {step === 2 && phase === "form" && (
                  <form onSubmit={next} noValidate className="space-y-6">
                    <Field id="description" label="Ceritakan kebutuhanmu" required error={err("description")}>
                      <textarea
                        id="description"
                        rows={6}
                        className={cn(inputBase, "min-h-40 resize-y py-3 leading-relaxed")}
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        maxLength={2000}
                        aria-invalid={err("description") ? true : undefined}
                        aria-describedby={err("description") ? "description-error" : undefined}
                        placeholder="Jelaskan tugas atau project-mu: fitur yang dibutuhkan, error yang muncul, instruksi dari dosen, atau kendala lain."
                      />
                    </Field>

                    <ChipGroup
                      legend="Ukuran pekerjaan"
                      name="scope"
                      options={scopeOptions}
                      value={form.scope}
                      onChange={(v) => set("scope", v)}
                      error={err("scope")}
                      columns="grid-cols-1 sm:grid-cols-3"
                    />

                    <ChipGroup
                      legend="Deadline"
                      name="deadline"
                      options={deadlineOptions.map((d) => ({ id: d.id, label: d.label, hint: d.mult > 1 ? `+${Math.round((d.mult - 1) * 100)}%` : undefined }))}
                      value={form.deadline}
                      onChange={(v) => set("deadline", v)}
                      error={err("deadline")}
                    >
                      {deadline?.urgent && (
                        <p className="mt-3 rounded-xl bg-muted px-4 py-3 text-[13px] leading-relaxed text-subtle">
                          Deadline mendesak menambah harga dan perlu dikonfirmasi ketersediaannya terlebih dahulu.
                        </p>
                      )}
                    </ChipGroup>

                    <fieldset className="min-w-0 border-0 p-0">
                      <legend className="mb-2 text-sm font-medium">
                        Tambahan <span className="font-normal text-subtle">(opsional)</span>
                      </legend>
                      <div className="grid gap-2">
                        {extraOptions.map((x) => (
                          <label key={x.id} className="relative block">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={form.extras.includes(x.id)}
                              onChange={(e) =>
                                set("extras", e.target.checked ? [...form.extras, x.id] : form.extras.filter((id) => id !== x.id))
                              }
                            />
                            <span className="flex min-h-14 items-center gap-3 rounded-xl border border-line bg-white px-4 py-2 transition-colors peer-checked:border-fg peer-checked:bg-muted peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fg">
                              <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-line bg-white peer-checked:border-fg">
                                {form.extras.includes(x.id) && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
                              </span>
                              <span className="flex-1">
                                <span className="block text-[15px] font-medium">{x.label}</span>
                                <span className="block text-[12px] leading-snug text-subtle">{x.hint}</span>
                              </span>
                              <span className="text-[13px] font-medium text-subtle tabular-nums">+{Math.round(x.pct * 100)}%</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <Field id="tech" label="Bahasa pemrograman / teknologi / alat">
                      <input id="tech" className={inputBase} value={form.tech} onChange={(e) => set("tech", e.target.value)} maxLength={120} placeholder="Mis. Laravel, MySQL" />
                    </Field>
                    <Field id="link" label="Link Google Drive / GitHub / referensi" hint="File juga bisa dilampirkan langsung setelah WhatsApp terbuka." error={err("link")}>
                      <input
                        id="link"
                        className={inputBase}
                        type="url"
                        inputMode="url"
                        value={form.link}
                        onChange={(e) => set("link", e.target.value)}
                        maxLength={300}
                        aria-invalid={err("link") ? true : undefined}
                        aria-describedby={err("link") ? "link-error" : "link-hint"}
                        placeholder="https://"
                      />
                    </Field>
                    <Field id="notes" label="Catatan tambahan">
                      <textarea id="notes" rows={3} className={cn(inputBase, "resize-y py-3 leading-relaxed")} value={form.notes} onChange={(e) => set("notes", e.target.value)} maxLength={1000} />
                    </Field>

                    <div className="grid grid-cols-[auto_1fr] gap-3">
                      <Button variant="secondary" onClick={back} aria-label="Kembali">
                        <ArrowLeft className="size-4" aria-hidden="true" />
                      </Button>
                      <Button type="submit">
                        Lihat harga <ArrowRight className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* ===== LANGKAH 3: HARGA ===== */}
                {step === 3 && phase === "form" && est && (
                  <form onSubmit={next} noValidate className="space-y-6">
                    <div className="rounded-2xl bg-fg p-6 text-white">
                      <p className="text-[13px] text-white/60">Estimasi harga untuk pekerjaanmu</p>
                      <p key={est.recommended} className="animate-pop-in mt-1 text-5xl font-semibold tracking-tighter tabular-nums sm:text-6xl">
                        {formatRupiah(est.recommended)}
                      </p>
                      {est.low !== est.high && <p className="mt-2 text-[14px] text-white/60">Kisaran {rangeText(est)}</p>}
                      {service?.rough && (
                        <p className="mt-3 text-[13px] leading-relaxed text-white/60">
                          Ini perkiraan kasar karena tugas custom. Setelah brief dibaca, angkanya dikonfirmasi.
                        </p>
                      )}
                    </div>

                    <dl className="divide-y divide-line rounded-2xl border border-line px-4 text-[14px]">
                      <div className="flex items-center justify-between gap-4 py-3">
                        <dt className="text-subtle">Dasar · {est.levelLabel}</dt>
                        <dd className="font-medium tabular-nums">{formatRupiah(est.base)}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 py-3">
                        <dt className="text-subtle">Ukuran · {est.scopeLabel}</dt>
                        <dd className="font-medium tabular-nums">× {est.scopeMult}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 py-3">
                        <dt className="text-subtle">Deadline · {est.deadlineLabel}</dt>
                        <dd className="font-medium tabular-nums">× {est.deadlineMult}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 py-3">
                        <dt className="text-subtle">Tambahan{est.extrasLabels.length ? ` · ${est.extrasLabels.join(", ")}` : ""}</dt>
                        <dd className="font-medium tabular-nums">{est.extrasPct ? `+ ${Math.round(est.extrasPct * 100)}%` : "—"}</dd>
                      </div>
                    </dl>

                    <fieldset
                      tabIndex={-1}
                      data-invalid={err("offerMode") ? "true" : undefined}
                      className="min-w-0 border-0 p-0 focus:outline-none"
                    >
                      <legend className="mb-1 text-lg font-semibold tracking-tight">Mau bagaimana?</legend>
                      <p className="mb-3 text-[14px] text-subtle">Ikuti rekomendasi, atau ajukan budgetmu sendiri.</p>
                      <div className="grid gap-2">
                        {(
                          [
                            ["recommended", "Ikuti rekomendasi", formatRupiah(est.recommended)],
                            ["custom", "Tawar sendiri", `Minimal ${formatRupiah(MIN_PRICE)}`],
                            ["review", "Belum yakin", "Review dulu, kabari harganya"],
                          ] as [OfferMode, string, string][]
                        ).map(([id, title, sub]) => (
                          <label key={id} className="relative block">
                            <input
                              type="radio"
                              name="offerMode"
                              className="peer sr-only"
                              checked={form.offerMode === id}
                              onChange={() => setOfferMode(id)}
                            />
                            <span className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-2 transition-colors peer-checked:border-fg peer-checked:bg-muted peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fg">
                              <span className="text-[15px] font-medium">{title}</span>
                              <span className="text-[13px] text-subtle tabular-nums">{sub}</span>
                            </span>
                          </label>
                        ))}
                      </div>

                      {form.offerMode === "custom" && (
                        <div className="animate-pop-in mt-4 rounded-2xl bg-muted p-5">
                          <label htmlFor="offerAmount" className="mb-2 block text-sm font-medium">
                            Budget yang kamu ajukan
                          </label>
                          <div className="relative">
                            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-subtle">Rp</span>
                            <input
                              id="offerAmount"
                              className={cn(inputBase, "pl-11 tabular-nums")}
                              inputMode="numeric"
                              autoComplete="off"
                              value={formatDigitsDisplay(digitsOnly(form.offerAmount))}
                              onChange={(e) => set("offerAmount", digitsOnly(e.target.value))}
                              aria-invalid={err("offerAmount") ? true : undefined}
                              aria-describedby={err("offerAmount") ? "offerAmount-error" : undefined}
                              placeholder={formatDigitsDisplay(String(est.recommended))}
                            />
                          </div>
                          {err("offerAmount") && <ErrorText id="offerAmount-error">{err("offerAmount")}</ErrorText>}
                          <label htmlFor="offerRange" className="sr-only">
                            Geser untuk mengatur budget
                          </label>
                          <input
                            id="offerRange"
                            type="range"
                            min={MIN_PRICE}
                            max={sliderMax}
                            step={5000}
                            value={Math.min(sliderMax, Math.max(MIN_PRICE, parseRupiah(form.offerAmount) || est.recommended))}
                            onChange={(e) => set("offerAmount", e.target.value)}
                            className="mt-5 h-8 w-full cursor-pointer accent-[#111]"
                          />
                          <div className="flex justify-between text-[11px] text-subtle tabular-nums">
                            <span>{formatRupiah(MIN_PRICE)}</span>
                            <span>{formatRupiah(sliderMax)}</span>
                          </div>
                          {offerAmt >= MIN_PRICE && <OfferMeter offer={offerAmt} recommended={est.recommended} />}
                        </div>
                      )}
                      {form.offerMode === "review" && (
                        <p className="animate-pop-in mt-3 rounded-xl bg-muted px-4 py-3 text-[13px] leading-relaxed text-subtle">
                          Oke. Tanpa angka dari kamu — kami baca brief-nya dulu lalu kabari harga lewat WhatsApp.
                        </p>
                      )}
                    </fieldset>

                    <p className="text-[13px] leading-relaxed text-subtle">{pricingNote}</p>

                    <div className="grid grid-cols-[auto_1fr] gap-3">
                      <Button variant="secondary" onClick={back} aria-label="Kembali">
                        <ArrowLeft className="size-4" aria-hidden="true" />
                      </Button>
                      <Button type="submit">
                        Lanjut <ArrowRight className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* ===== LANGKAH 4: KIRIM ===== */}
                {step === 4 && phase === "form" && (
                  <form onSubmit={next} noValidate className="space-y-5">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">Terakhir, datamu.</h3>
                      <p className="mt-1 text-[15px] text-subtle">Supaya kami tahu siapa yang dihubungi di WhatsApp.</p>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="name" label="Nama" required error={err("name")}>
                        <input
                          id="name"
                          className={inputBase}
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          autoComplete="name"
                          maxLength={80}
                          aria-invalid={err("name") ? true : undefined}
                          aria-describedby={err("name") ? "name-error" : undefined}
                          placeholder="Nama lengkap"
                        />
                      </Field>
                      <Field id="phone" label="Nomor WhatsApp" required hint="Contoh: 08123456789" error={err("phone")}>
                        <input
                          id="phone"
                          className={inputBase}
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          maxLength={20}
                          aria-invalid={err("phone") ? true : undefined}
                          aria-describedby={err("phone") ? "phone-error" : "phone-hint"}
                          placeholder="08xxxxxxxxxx"
                        />
                      </Field>
                      <Field id="campus" label="Kampus / universitas">
                        <input id="campus" className={inputBase} value={form.campus} onChange={(e) => set("campus", e.target.value)} maxLength={100} />
                      </Field>
                      <Field id="major" label="Program studi">
                        <input id="major" className={inputBase} value={form.major} onChange={(e) => set("major", e.target.value)} maxLength={100} />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field id="course" label="Mata kuliah">
                          <input id="course" className={inputBase} value={form.course} onChange={(e) => set("course", e.target.value)} maxLength={100} />
                        </Field>
                      </div>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-3 pt-1">
                      <Button variant="secondary" onClick={back} aria-label="Kembali">
                        <ArrowLeft className="size-4" aria-hidden="true" />
                      </Button>
                      <Button type="submit">Periksa ringkasan</Button>
                    </div>
                    {hasContent && (
                      <div className="text-center">
                        <button type="button" onClick={clearDraft} className="inline-flex min-h-11 items-center gap-1.5 text-[13px] text-subtle hover:text-fg">
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          Hapus draft
                        </button>
                      </div>
                    )}
                    <p className="text-center text-xs leading-relaxed text-subtle">
                      Draft tersimpan otomatis di browser ini (localStorage). Data tidak dikirim ke server NATA — hanya disusun menjadi pesan WhatsApp.
                    </p>
                  </form>
                )}

                {step === 4 && phase === "review" && (
                  <div className="animate-pop-in">
                    <h3 className="text-2xl font-semibold tracking-tight">Periksa ringkasan</h3>
                    <p className="mt-2 text-[15px] text-subtle">Pastikan semuanya benar sebelum membuka WhatsApp.</p>

                    <dl className="mt-6 divide-y divide-line rounded-2xl bg-muted px-4 text-[15px]">
                      {(
                        [
                          ["Layanan", resolved.service],
                          ["Kesulitan", resolved.difficulty],
                          ["Ukuran", resolved.scope],
                          ["Deadline", resolved.deadline],
                          ["Tambahan", resolved.extras],
                          ["Teknologi", resolved.tech],
                          ["Deskripsi", resolved.description],
                          ["Estimasi", resolved.estimate],
                          ["Budget", resolved.budget + (resolved.budgetNote ? ` · ${resolved.budgetNote}` : "")],
                          ["Link", resolved.link],
                          ["Catatan", resolved.notes],
                          ["Nama", resolved.name],
                          ["WhatsApp", resolved.phone],
                          ["Universitas", resolved.campus],
                          ["Program studi", resolved.major],
                          ["Mata kuliah", resolved.course],
                        ] as const
                      )
                        .filter(([, v]) => v)
                        .map(([k, v]) => (
                          <div key={k} className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4">
                            <dt className="text-subtle">{k}</dt>
                            <dd className="font-medium break-words whitespace-pre-wrap">{v}</dd>
                          </div>
                        ))}
                    </dl>

                    <p className="mt-5 text-[13px] leading-relaxed text-subtle">
                      Permintaan ini belum menjadi pesanan yang disetujui. Scope dan harga dikonfirmasi lewat WhatsApp; pengerjaan dimulai setelah kedua
                      pihak sepakat.
                    </p>

                    <div className="mt-6 flex flex-col gap-3">
                      <ButtonLink
                        href={waUrl}
                        onClick={() => {
                          setPhase("opened");
                          scrollTop();
                        }}
                        className="w-full"
                      >
                        <MessageCircle className="size-4" aria-hidden="true" />
                        Kirim Permintaan via WhatsApp
                      </ButtonLink>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="secondary" onClick={back}>
                          <Pencil className="size-4" aria-hidden="true" />
                          Edit
                        </Button>
                        <Button variant="secondary" onClick={copyMessage}>
                          {copied === "ok" ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                          {copied === "ok" ? "Tersalin" : "Salin pesan"}
                        </Button>
                      </div>
                      {copied === "fail" && (
                        <p role="alert" className="text-center text-[13px] text-danger">
                          Gagal menyalin otomatis. Buka “Pratinjau pesan” lalu salin manual.
                        </p>
                      )}
                    </div>

                    <details className="mt-5 rounded-2xl border border-line">
                      <summary className="flex min-h-12 cursor-pointer items-center px-4 text-sm font-medium">Pratinjau pesan WhatsApp</summary>
                      <pre className="max-h-72 overflow-auto border-t border-line p-4 font-sans text-[13px] leading-relaxed break-words whitespace-pre-wrap text-subtle">
                        {message}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
