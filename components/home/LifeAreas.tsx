"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { digitsOnly, formatDigitsDisplay, formatRupiah, parseRupiah } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const HABITS = ["Minum air", "Jalan kaki", "Baca buku"];

function HabitToy() {
  const [ticks, setTicks] = useState<boolean[][]>(() => HABITS.map(() => DAYS.map(() => false)));
  const done = ticks.flat().filter(Boolean).length;
  const total = HABITS.length * DAYS.length;
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[19rem] border-separate border-spacing-y-1.5 text-[13px]">
          <thead>
            <tr>
              <th className="w-24 text-left font-normal text-subtle" scope="col">
                <span className="sr-only">Kebiasaan</span>
              </th>
              {DAYS.map((d) => (
                <th key={d} scope="col" className="font-normal text-subtle">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HABITS.map((h, hi) => (
              <tr key={h}>
                <th scope="row" className="pr-2 text-left text-[14px] font-medium">
                  {h}
                </th>
                {DAYS.map((d, di) => (
                  <td key={d} className="text-center">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={ticks[hi][di]}
                      aria-label={`${h}, ${d}`}
                      onClick={() => setTicks((t) => t.map((row, r) => (r === hi ? row.map((v, c) => (c === di ? !v : v)) : row)))}
                      className={cn(
                        "size-9 rounded-full border transition-[background-color,transform] duration-200 active:scale-90",
                        ticks[hi][di] ? "border-fg bg-fg" : "border-line bg-white hover:border-fg/40",
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-fg transition-[width] duration-300" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <p className="text-[13px] font-medium tabular-nums">
          {done}/{total}
        </p>
      </div>
    </div>
  );
}

function MoneyToy() {
  const [income, setIncome] = useState("");
  const [spent, setSpent] = useState("");
  const inc = parseRupiah(income);
  const out = parseRupiah(spent);
  const left = inc - out;
  const pct = inc > 0 ? Math.min(100, (out / inc) * 100) : 0;
  const field = (id: string, label: string, value: string, set: (v: string) => void) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-subtle">Rp</span>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={formatDigitsDisplay(value)}
          onChange={(e) => set(digitsOnly(e.target.value))}
          placeholder="0"
          className="min-h-12 w-full rounded-xl border border-line bg-white pr-4 pl-11 text-base tabular-nums focus:border-fg focus:outline-none"
        />
      </div>
    </div>
  );
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {field("toy-income", "Pemasukan bulan ini", income, setIncome)}
        {field("toy-spent", "Pengeluaran", spent, setSpent)}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-line">
        <div className={cn("h-full rounded-full transition-[width] duration-300", left < 0 ? "bg-danger" : "bg-fg")} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-3 text-[15px]" aria-live="polite">
        {inc <= 0 ? (
          <span className="text-subtle">Isi pemasukan dulu untuk melihat sisanya.</span>
        ) : left >= 0 ? (
          <>
            Sisa <span className="font-semibold tabular-nums">{formatRupiah(left)}</span>{" "}
            <span className="text-subtle">· terpakai {Math.round(pct)}%</span>
          </>
        ) : (
          <>
            Defisit <span className="font-semibold text-danger tabular-nums">{formatRupiah(-left)}</span>
          </>
        )}
      </p>
    </div>
  );
}

const DURATIONS = [15, 25, 45];

function FocusToy() {
  const [mins, setMins] = useState(25);
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  const finished = left === 0;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const pct = (1 - left / (mins * 60)) * 100;

  return (
    <div className="text-center">
      <div className="flex justify-center gap-2" role="group" aria-label="Durasi fokus">
        {DURATIONS.map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={mins === d}
            onClick={() => {
              setMins(d);
              setLeft(d * 60);
              setRunning(false);
            }}
            className={cn("min-h-10 rounded-full px-4 text-sm font-medium transition-colors", mins === d ? "bg-fg text-white" : "bg-white hover:bg-white/60")}
          >
            {d} menit
          </button>
        ))}
      </div>
      <p className="mt-5 text-6xl font-semibold tracking-tighter tabular-nums sm:text-7xl" role="timer" aria-live="off">
        {mm}:{ss}
      </p>
      <div className="mx-auto mt-4 h-1.5 max-w-xs overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-fg transition-[width] duration-1000 ease-linear" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-3 min-h-5 text-[13px] text-subtle" aria-live="polite">
        {finished ? "Selesai. Istirahat sebentar." : running ? "Fokus…" : "Tekan mulai."}
      </p>
      <div className="mt-3 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => (finished ? (setLeft(mins * 60), setRunning(true)) : setRunning((r) => !r))}
          className="min-h-11 rounded-full bg-fg px-6 text-sm font-medium text-white active:scale-[0.98]"
        >
          {finished ? "Ulangi" : running ? "Jeda" : "Mulai"}
        </button>
        <button
          type="button"
          aria-label="Reset timer"
          onClick={() => {
            setRunning(false);
            setLeft(mins * 60);
          }}
          className="flex size-11 items-center justify-center rounded-full bg-white hover:bg-white/60"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function GoalsToy() {
  const [name, setName] = useState("");
  const [pct, setPct] = useState(30);
  return (
    <div>
      <label htmlFor="toy-goal" className="mb-1.5 block text-[13px] font-medium">
        Targetmu
      </label>
      <input
        id="toy-goal"
        value={name}
        maxLength={40}
        onChange={(e) => setName(e.target.value)}
        placeholder="Mis. Lulus tepat waktu"
        className="min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base focus:border-fg focus:outline-none"
      />
      <label htmlFor="toy-progress" className="mt-4 mb-1 block text-[13px] font-medium">
        Progres: <span className="tabular-nums">{pct}%</span>
      </label>
      <input
        id="toy-progress"
        type="range"
        min={0}
        max={100}
        step={5}
        value={pct}
        onChange={(e) => setPct(Number(e.target.value))}
        className="h-8 w-full cursor-pointer accent-[#111]"
      />
      <ol className="mt-2 grid grid-cols-4 gap-2" aria-label="Tonggak">
        {[25, 50, 75, 100].map((m) => (
          <li key={m} className="text-center">
            <span className={cn("mx-auto block h-1.5 rounded-full transition-colors duration-300", pct >= m ? "bg-fg" : "bg-line")} />
            <span className={cn("mt-1.5 block text-[12px] tabular-nums", pct >= m ? "font-medium" : "text-subtle")}>{m}%</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[15px]" aria-live="polite">
        <span className="font-semibold">{name.trim() || "Targetmu"}</span>{" "}
        <span className="text-subtle">{pct >= 100 ? "· tercapai." : `· tinggal ${100 - pct}% lagi.`}</span>
      </p>
    </div>
  );
}

const areas = [
  { id: "habit", name: "Habit", line: "Kebiasaan kecil yang dicatat tiap hari lebih mudah bertahan.", Toy: HabitToy },
  { id: "money", name: "Money", line: "Uang lebih tenang kalau kamu tahu sisanya.", Toy: MoneyToy },
  { id: "focus", name: "Focus", line: "Satu hal dulu. Tentukan waktunya, lalu jalan.", Toy: FocusToy },
  { id: "goals", name: "Goals", line: "Target besar dipecah jadi tonggak yang kelihatan.", Toy: GoalsToy },
];

export function LifeAreas() {
  const [active, setActive] = useState("habit");
  const area = areas.find((a) => a.id === active) ?? areas[0];
  const Toy = area.Toy;

  return (
    <section aria-labelledby="areas-title" className="pb-16 md:pb-24">
      <div className="container-x">
        <div className="rounded-[1.75rem] bg-muted p-3 sm:p-6 md:rounded-[2.25rem] md:p-8">
          <h2 id="areas-title" className="sr-only">
            Coba empat bagian hidup yang ditata NATA
          </h2>
          <div role="tablist" aria-label="Bagian hidup" className="grid grid-cols-4 gap-1 rounded-full bg-white/70 p-1 sm:mx-auto sm:max-w-md">
            {areas.map((a) => (
              <button
                key={a.id}
                id={`tab-${a.id}`}
                role="tab"
                type="button"
                aria-selected={active === a.id}
                aria-controls="area-panel"
                onClick={() => setActive(a.id)}
                className={cn(
                  "min-h-11 rounded-full text-sm font-medium transition-colors duration-200",
                  active === a.id ? "bg-fg text-white" : "text-subtle hover:text-fg",
                )}
              >
                {a.name}
              </button>
            ))}
          </div>

          <div
            id="area-panel"
            role="tabpanel"
            aria-labelledby={`tab-${area.id}`}
            className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-6 rounded-[1.25rem] bg-white p-5 sm:p-8 md:mt-6 md:grid-cols-[1fr_1.3fr] md:items-center md:gap-12"
          >
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-subtle uppercase">{area.name} OS</p>
              <p className="mt-3 text-2xl leading-snug font-semibold tracking-tight text-balance sm:text-3xl">{area.line}</p>
              <a href="#products" className="mt-5 inline-flex min-h-11 items-center text-[15px] font-medium underline underline-offset-4">
                Lihat produknya
              </a>
            </div>
            <div key={area.id} className="animate-pop-in min-w-0 rounded-2xl bg-muted p-4 sm:p-6">
              <Toy />
            </div>
          </div>
          <p className="mt-3 text-center text-[12px] text-subtle">Mainan kecil untuk dicoba — bukan tampilan produk yang sebenarnya.</p>
        </div>
      </div>
    </section>
  );
}
