import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const inputBase =
  "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base text-fg placeholder:text-subtle/70 transition-colors focus:border-fg focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-danger";

export const selectBase = cn(
  inputBase,
  "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%236e6e73%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m4 6 4 4 4-4%22/></svg>')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10 disabled:opacity-50",
);

export function ErrorText({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-start gap-1.5 text-[13px] text-danger">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

export function Field({
  id,
  label,
  required,
  optional = true,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
        {required ? (
          <span className="text-subtle" aria-hidden="true">
            {" "}
            *
          </span>
        ) : optional ? (
          <span className="font-normal text-subtle"> (opsional)</span>
        ) : null}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-subtle">
          {hint}
        </p>
      )}
      {error && <ErrorText id={`${id}-error`}>{error}</ErrorText>}
    </div>
  );
}

export function ChipGroup({
  legend,
  name,
  options,
  value,
  onChange,
  error,
  columns = "grid-cols-2",
  required = true,
  children,
}: {
  legend: string;
  name: string;
  options: { id: string; label: string; hint?: string }[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
  columns?: string;
  required?: boolean;
  children?: ReactNode;
}) {
  return (
    <fieldset
      tabIndex={-1}
      data-invalid={error ? "true" : undefined}
      aria-describedby={error ? `${name}-error` : undefined}
      className="min-w-0 border-0 p-0 focus:outline-none"
    >
      <legend className="mb-2 text-sm font-medium">
        {legend}
        {required && (
          <span className="text-subtle" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </legend>
      <div className={cn("grid gap-2", columns)}>
        {options.map((o) => (
          <label key={o.id} className="relative block">
            <input
              type="radio"
              name={name}
              value={o.id}
              checked={value === o.id}
              onChange={() => onChange(o.id)}
              className="peer sr-only"
            />
            <span className="flex min-h-12 flex-col items-center justify-center rounded-xl border border-line bg-white px-3 py-2 text-center text-[15px] leading-tight transition-colors peer-checked:border-fg peer-checked:bg-fg peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fg">
              {o.label}
              {o.hint && <span className="mt-1 text-[12px] leading-snug font-normal opacity-70">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
      {children}
      {error && <ErrorText id={`${name}-error`}>{error}</ErrorText>}
    </fieldset>
  );
}

export function LevelDots({ level, className }: { level: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} role="img" aria-label={`Tingkat kesulitan ${level} dari 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cn("size-1.5 rounded-full", i <= level ? "bg-fg" : "bg-line")} />
      ))}
    </span>
  );
}
