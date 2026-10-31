import { useState } from "react";
import type { ShapeKind } from "../lib/shapes";
import { SHAPE_META, defaultDims, fmt, hitung } from "../lib/shapes";
import { Button, Icon, Slider, StepList } from "./ui";
import { cn } from "../utils/cn";

export function HitungPanel({
  kind, dims, setDims, onInteract, showAcak = true, tinggi = "normal",
}: {
  kind: ShapeKind;
  dims: Record<string, number>;
  setDims: (d: Record<string, number>) => void;
  onInteract?: () => void;
  showAcak?: boolean;
  tinggi?: "normal" | "compact";
}) {
  const meta = SHAPE_META[kind];
  const hasil = hitung(kind, dims);
  const [tab, setTab] = useState<"v" | "lp">("v");

  const acak = () => {
    const d = defaultDims(kind);
    meta.dims.forEach((dd) => {
      const range = dd.max - dd.min;
      d[dd.key] = Math.max(dd.min, dd.min + Math.round((Math.random() * range) / dd.step) * dd.step);
    });
    if (kind === "kerucut") {
      const pasangan: [number, number][] = [[7, 24], [21, 20], [5, 12], [10, 24], [14, 48], [28, 45]];
      const [r, t] = pasangan[Math.floor(Math.random() * pasangan.length)];
      d.r = r; d.t = t;
    }
    setDims(d);
    onInteract?.();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-laut-800/12 bg-laut-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-display text-sm font-extrabold text-laut-800">Ubah Ukuran {meta.name}</span>
            {showAcak && (
              <button onClick={acak} className="btn btn-sm" style={{ ["--btn-bg" as string]: "#0A3D49", ["--btn-fg" as string]: "#fff" }}>
                <Icon name="refresh" className="h-3.5 w-3.5" /> Acak
              </button>
            )}
          </div>
          <div className="space-y-2.5">
            {meta.dims.map((dd) => (
              <Slider
                key={dd.key}
                label={dd.label}
                value={dims[dd.key] ?? dd.def}
                min={dd.min}
                max={dd.max}
                step={dd.step}
                color={meta.color}
                onChange={(v) => { setDims({ ...dims, [dd.key]: v }); onInteract?.(); }}
              />
            ))}
          </div>
          {meta.dims.length === 1 && <p className="mt-1 text-[0.72rem] font-semibold text-laut-800/60">{meta.dims[0].desc}</p>}
        </div>

        <div className="grid content-start gap-2.5">
          <div className="rounded-2xl border-2 border-laut-600/25 bg-white p-3 shadow-[0_10px_20px_-16px_rgba(6,49,60,.8)]">
            <div className="flex items-center gap-2 text-laut-600">
              <Icon name="drop" className="h-4 w-4" />
              <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em]">Volume</span>
            </div>
            <div className="num text-3xl font-extrabold leading-tight text-laut-900">
              {fmt(hasil.volume)} <span className="text-lg text-laut-600">cm³</span>
            </div>
            <div className="num text-[0.78rem] font-bold text-laut-800/70">{meta.rumusV}</div>
          </div>
          <div className="rounded-2xl border-2 border-koral-500/30 bg-white p-3 shadow-[0_10px_20px_-16px_rgba(6,49,60,.8)]">
            <div className="flex items-center gap-2 text-koral-600">
              <Icon name="gift" className="h-4 w-4" />
              <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em]">Luas Permukaan</span>
            </div>
            <div className="num text-3xl font-extrabold leading-tight text-koral-600">
              {fmt(hasil.lp)} <span className="text-lg text-koral-500">cm²</span>
            </div>
            <div className="num text-[0.78rem] font-bold text-laut-800/70">{meta.rumusLP}</div>
          </div>
        </div>
      </div>

      {hasil.extras.length > 0 && tinggi === "normal" && (
        <div className="flex flex-wrap gap-2">
          {hasil.extras.map((e) => (
            <div key={e.label} className="rounded-xl border-2 border-laut-800/12 bg-white px-3 py-1.5">
              <div className="text-[0.65rem] font-extrabold uppercase tracking-wider text-laut-800/55">{e.label}</div>
              <div className="num text-sm font-extrabold text-laut-900">{e.value}</div>
              {e.note && <div className="text-[0.65rem] font-semibold text-koral-600">{e.note}</div>}
            </div>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border-2 border-laut-800/12 bg-white">
        <div className="flex gap-1 border-b-2 border-laut-800/10 bg-laut-50 p-1.5">
          {([["v", "Langkah Volume"], ["lp", "Langkah Luas Permukaan"]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn(
                "flex-1 rounded-xl px-3 py-2 font-display text-sm font-extrabold transition-all",
                tab === k ? "bg-white text-laut-900 shadow-[0_3px_0_rgba(10,61,73,.18)]" : "text-laut-800/60 hover:text-laut-800",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="p-4">
          <StepList steps={tab === "v" ? hasil.volSteps : hasil.lpSteps} tone={tab === "v" ? "#1491A8" : "#EC4A35"} />
        </div>
      </div>

      {hasil.catatan && tinggi === "normal" && (
        <div className="flex gap-2.5 rounded-2xl border-2 border-sun-500/45 bg-sun-500/12 p-3">
          <Icon name="bulb" className="mt-0.5 h-5 w-5 shrink-0 text-sun-700" />
          <p className="text-[0.88rem] font-semibold leading-relaxed text-laut-900">{hasil.catatan}</p>
        </div>
      )}
      {showAcak && (
        <Button variant="ghost" size="sm" onClick={() => { setDims(defaultDims(kind)); onInteract?.(); }}>
          <Icon name="refresh" className="h-4 w-4" /> Kembalikan ukuran contoh
        </Button>
      )}
    </div>
  );
}
