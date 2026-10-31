import { useEffect, useRef, useState } from "react";
import type { ReactNode, CSSProperties } from "react";
import { cn } from "../utils/cn";

/* --------------------------------- ikon --------------------------------- */

const PATHS: Record<string, ReactNode> = {
  cube: (
    <>
      <path d="M12 2.6 21 7.3v9.4L12 21.4 3 16.7V7.3z" />
      <path d="M3 7.3 12 12l9-4.7M12 12v9.4" />
    </>
  ),
  box: (
    <>
      <path d="M2.8 6.4 8.4 4h12.8v13.6L15.6 20H2.8z" />
      <path d="M8.4 4v13.6M8.4 17.6 2.8 20M15.6 6.4 21.2 4" />
    </>
  ),
  prism: (
    <>
      <path d="M4 17.5 12 4l8 13.5z" />
      <path d="M4 17.5 7 20h13l1-2.5" />
      <path d="m12 4 8 13.5" />
    </>
  ),
  pyramid: (
    <>
      <path d="M12 3 21 18H3z" />
      <path d="M12 3v15M3 18l9-3 9 3" />
    </>
  ),
  cone: (
    <>
      <path d="M12 3 5 17" />
      <path d="m12 3 7 14" />
      <ellipse cx="12" cy="17.5" rx="7" ry="3" />
      <path d="M12 3v11.5" />
    </>
  ),
  book: (
    <>
      <path d="M4 4.5h6a3 3 0 0 1 3 3V20a2.4 2.4 0 0 0-2.4-2.4H4z" />
      <path d="M20 4.5h-6a3 3 0 0 0-3 3V20a2.4 2.4 0 0 1 2.4-2.4H20z" />
    </>
  ),
  flask: (
    <>
      <path d="M9.5 3v6L4.6 17a2.4 2.4 0 0 0 2 3.7h10.8a2.4 2.4 0 0 0 2-3.7L14.5 9V3" />
      <path d="M8.2 3h7.6M7.4 14.5h9.2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1.2" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V9.5M10 20V4M16 20v-7.5M22 20H2" />
    </>
  ),
  home: (
    <>
      <path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1h-5v-6H9.5v6h-5a1 1 0 0 1-1-1z" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.4 9.2a2.7 2.7 0 1 1 3.4 2.6c-.5.2-.8.7-.8 1.2v.6" />
      <path d="M12 17.2h.01" />
    </>
  ),
  sound: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
      <path d="M15.6 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8" />
    </>
  ),
  mute: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
      <path d="m16 9.5 5 5M21 9.5l-5 5" />
    </>
  ),
  expand: (
    <>
      <path d="M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5" />
    </>
  ),
  shrink: (
    <>
      <path d="M9 4v5H4M15 20v-5h5M20 9h-5V4M4 15h5v5" />
    </>
  ),
  print: (
    <>
      <path d="M7 9V3.5h10V9" />
      <path d="M5 9h14a2 2 0 0 1 2 2v5h-4v4.5H7V16H3v-5a2 2 0 0 1 2-2z" />
      <path d="M7 16h10" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 6.5h15M9.5 6.5V4h5v2.5M6.5 6.5 7.5 20h9l1-13.5M10 10v6M14 10v6" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  cross: <path d="M6 6l12 12M18 6 6 18" />,
  right: <path d="M5 12h13m-5-6 6 6-6 6" />,
  left: <path d="M19 12H6m5 6-6-6 6-6" />,
  down: <path d="M12 5v13m-6-5 6 6 6-6" />,
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4v5h-5" />
    </>
  ),
  star: <path d="m12 3.5 2.7 5.6 6.1.9-4.4 4.3 1 6.2-5.4-2.9-5.4 2.9 1-6.2L3.2 10l6.1-.9z" />,
  bulb: (
    <>
      <path d="M9 17.5h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .8 1.7h5.6c0-.7.3-1.3.8-1.7A6 6 0 0 0 12 3z" />
    </>
  ),
  calc: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.4" />
      <path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" />
    </>
  ),
  abc: (
    <>
      <path d="M3 19 8 5l5 14M4.8 14.5h6.4" />
      <path d="M16 9h3.2a2.4 2.4 0 0 1 0 4.8H16zm0 4.8h3.6a2.6 2.6 0 0 1 0 5.2H16z" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  play: <path d="M7 4.5 19 12 7 19.5z" />,
  pause: <path d="M8.5 5v14M15.5 5v14" />,
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 5.5H4.5V8a3 3 0 0 0 3 3M17 5.5h2.5V8a3 3 0 0 1-3 3" />
      <path d="M12 14v3.5M8.5 20.5h7l-.8-3h-5.4z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.2V12l3.2 2" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="6" r="2.6" />
      <circle cx="6" cy="18" r="2.6" />
      <path d="M8.2 7.4 20 18M20 6 8.2 16.6" />
    </>
  ),
  drop: <path d="M12 3.5s6 6.4 6 10.2a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5z" />,
  gift: (
    <>
      <rect x="3.5" y="9" width="17" height="11.5" rx="1.6" />
      <path d="M3.5 13.2h17M12 9v11.5" />
      <path d="M12 9S10.8 4 8.4 4a2.2 2.2 0 0 0 0 5zM12 9s1.2-5 3.6-5a2.2 2.2 0 0 1 0 5z" />
    </>
  ),
  robot: (
    <>
      <rect x="4" y="8" width="16" height="11" rx="3.2" />
      <path d="M12 4.2V8M8.5 13h.01M15.5 13h.01M9.5 16.2h5" />
      <circle cx="12" cy="3.4" r="1.2" />
      <path d="M2.4 12v3.4M21.6 12v3.4" />
    </>
  ),
  flag: <path d="M6 21V4h11l-2 3.6L17 11H6" />,
};

export function Icon({ name, className = "h-5 w-5", strokeWidth = 1.9 }: { name: string; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {PATHS[name] ?? PATHS.cube}
    </svg>
  );
}

/* --------------------------------- tombol --------------------------------- */

type Variant = "teal" | "sun" | "coral" | "mint" | "grape" | "ink" | "ghost";

const VARIANTS: Record<Variant, CSSProperties> = {
  teal: { ["--btn-bg" as string]: "#1491A8", ["--btn-fg" as string]: "#fff", ["--btn-line" as string]: "#0a5f70", ["--btn-shadow" as string]: "rgba(10,95,112,.55)" },
  sun: { ["--btn-bg" as string]: "#FFC24B", ["--btn-fg" as string]: "#4a3204", ["--btn-line" as string]: "#d3950d", ["--btn-shadow" as string]: "rgba(190,135,10,.5)" },
  coral: { ["--btn-bg" as string]: "#FF6B57", ["--btn-fg" as string]: "#fff", ["--btn-line" as string]: "#cf4230", ["--btn-shadow" as string]: "rgba(196,60,42,.5)" },
  mint: { ["--btn-bg" as string]: "#21C3A4", ["--btn-fg" as string]: "#04352c", ["--btn-line" as string]: "#0f8e77", ["--btn-shadow" as string]: "rgba(12,124,104,.5)" },
  grape: { ["--btn-bg" as string]: "#7A55F0", ["--btn-fg" as string]: "#fff", ["--btn-line" as string]: "#5534b8", ["--btn-shadow" as string]: "rgba(75,48,160,.5)" },
  ink: { ["--btn-bg" as string]: "#0A3D49", ["--btn-fg" as string]: "#e8f7fa", ["--btn-line" as string]: "#04222a", ["--btn-shadow" as string]: "rgba(4,34,42,.55)" },
  ghost: { ["--btn-bg" as string]: "#ffffff", ["--btn-fg" as string]: "#0A3D49", ["--btn-line" as string]: "rgba(10,61,73,.22)", ["--btn-shadow" as string]: "rgba(10,61,73,.28)" },
};

export function Button({
  children, variant = "teal", size = "md", className, style, ...rest
}: {
  children: ReactNode; variant?: Variant; size?: "sm" | "md" | "lg"; className?: string; style?: CSSProperties;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cn("btn", size === "sm" && "btn-sm", size === "lg" && "btn-lg", className)}
      style={{ ...VARIANTS[variant], ...style }}
    >
      {children}
    </button>
  );
}

/* --------------------------------- wadah --------------------------------- */

export function Card({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={cn("card p-4 sm:p-5", className)} style={style}>
      {children}
    </div>
  );
}

export function Kicker({ children, tone = "#0c586a" }: { children: ReactNode; tone?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.18em]" style={{ color: tone }}>
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: tone }} />
      {children}
    </span>
  );
}

export function SectionTitle({ kicker, title, sub, tone }: { kicker?: string; title: ReactNode; sub?: ReactNode; tone?: string }) {
  return (
    <div className="mb-5">
      {kicker && <Kicker tone={tone}>{kicker}</Kicker>}
      <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight text-laut-900 sm:text-3xl">{title}</h2>
      {sub && <p className="mt-1.5 max-w-3xl text-[0.95rem] leading-relaxed text-laut-800/80">{sub}</p>}
    </div>
  );
}

/* --------------------------------- slider --------------------------------- */

export function Slider({
  label, value, min, max, step = 1, unit = "cm", onChange, color = "#1491A8",
}: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void; color?: string;
}) {
  return (
    <label className="block select-none">
      <span className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-display text-[0.95rem] font-bold text-laut-900">{label}</span>
        <span className="num rounded-lg px-2 py-0.5 text-sm font-extrabold text-white" style={{ background: color }}>
          {value} {unit}
        </span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
      <span className="flex justify-between text-[0.68rem] font-semibold text-laut-800/55">
        <span>{min}</span>
        <span>{max}</span>
      </span>
    </label>
  );
}

/* -------------------------------- progres -------------------------------- */

export function Progress({ value, color = "#1491A8", height = 12, className }: { value: number; color?: string; height?: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-laut-900/12", className)} style={{ height }}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }}
      />
    </div>
  );
}

export function Ring({ value, size = 108, color = "#1491A8", label }: { value: number; size?: number; color?: string; label?: string }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(10,61,73,.13)" strokeWidth={10} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100}
          style={{ transition: "stroke-dashoffset .9s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-2xl font-extrabold text-laut-900">{Math.round(pct)}%</span>
        {label && <span className="text-[0.62rem] font-bold uppercase tracking-wider text-laut-800/60">{label}</span>}
      </div>
    </div>
  );
}

/* --------------------------------- modal --------------------------------- */

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-laut-950/55 p-0 backdrop-blur-[3px] sm:items-center sm:p-6" onMouseDown={onClose}>
      <div
        className={cn("pop-in max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl thin-scroll", wide ? "sm:max-w-3xl" : "sm:max-w-lg")}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-extrabold text-laut-900">{title}</h3>
          <button onClick={onClose} className="btn btn-sm shrink-0" style={VARIANTS.ghost} aria-label="Tutup">
            <Icon name="cross" className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* -------------------------------- langkah -------------------------------- */

export function StepList({ steps, tone = "#0c586a" }: { steps: string[]; tone?: string }) {
  return (
    <ol className="space-y-1.5">
      {steps.map((s, i) => {
        const isResult = s.includes("=") && i === steps.length - 1;
        return (
          <li key={i} className="flex gap-2.5">
            <span
              className="num mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white"
              style={{ background: isResult ? "#21C3A4" : tone }}
            >
              {i + 1}
            </span>
            <span className={cn("num text-[0.95rem] leading-relaxed", isResult ? "font-extrabold text-mint-600" : "text-laut-900/90")}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function Pill({ children, color = "#1491A8" }: { children: ReactNode; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-extrabold" style={{ background: `${color}1f`, color }}>
      {children}
    </span>
  );
}

/* ------------------------------ scroll reveal ----------------------------- */

export function useReveal(deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((e, i) => {
      e.style.transitionDelay = `${Math.min(i, 6) * 55}ms`;
      io.observe(e);
    });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

export function Accordion({ title, children, defaultOpen = false, color = "#1491A8" }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean; color?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 p-4 text-left" aria-expanded={open}>
        <span className="font-display text-[1.02rem] font-bold text-laut-900">{title}</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300" style={{ background: color, transform: open ? "rotate(180deg)" : "none" }}>
          <Icon name="down" className="h-4 w-4" strokeWidth={2.4} />
        </span>
      </button>
      <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="border-t-2 border-dashed border-laut-900/10 p-4 pt-3.5">{children}</div>
        </div>
      </div>
    </div>
  );
}
