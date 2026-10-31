import { useEffect, useRef, useState } from "react";
import Shape3D from "./Shape3D";
import { fmt } from "../lib/shapes";
import { cn } from "../utils/cn";

export function useFillAnim(duration = 4200) {
  const [fill, setFill] = useState(0);
  const [playing, setPlaying] = useState(false);
  const fillRef = useRef(0);
  fillRef.current = fill;
  const raf = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const from = fillRef.current;
    if (from >= 1) { setPlaying(false); return; }
    const start = performance.now();
    const dur = Math.max(500, duration * (1 - from));
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setFill(from + (1 - from) * (1 - Math.pow(1 - p, 2)));
      if (p < 1) raf.current = requestAnimationFrame(step);
      else { setFill(1); setPlaying(false); }
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, duration]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return {
    fill,
    playing,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    reset: () => { setPlaying(false); setFill(0); },
    isi: () => { setPlaying(false); setFill(1); },
    set: (v: number) => { setPlaying(false); setFill(Math.max(0, Math.min(1, v))); },
  };
}

export function UnitCubeStage({
  s, fill, highlightLayer = null, autoRotate = true, height = 330, className, showOverlay = true,
}: {
  s: number; fill: number; highlightLayer?: number | null; autoRotate?: boolean;
  height?: number; className?: string; showOverlay?: boolean;
}) {
  const perLayer = s * s;
  const total = s * s * s;
  const shown = Math.round(fill * total);
  const layersDone = Math.min(s, Math.floor(shown / perLayer));
  const inLayer = shown - layersDone * perLayer;

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border-2 border-laut-800/12 bg-[radial-gradient(circle_at_50%_35%,#ffffff,#dff1f5_72%,#c9e7ee)]", className)} style={{ height }}>
      <Shape3D kind="kubus" dims={{ s }} fill={fill} highlightLayer={highlightLayer} ghost autoRotate={autoRotate} className="absolute inset-0" />
      {showOverlay && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3">
          <div className="rounded-xl border-2 border-laut-800/15 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
            <div className="text-[0.62rem] font-extrabold uppercase tracking-widest text-laut-600">Kubus satuan terpasang</div>
            <div className="num text-2xl font-extrabold leading-none text-laut-900">{fmt(shown)}</div>
            <div className="text-[0.7rem] font-bold text-laut-800/65">dari {fmt(total)} kubus</div>
          </div>
          <div className="space-y-1 rounded-xl border-2 border-laut-800/15 bg-white/90 px-3 py-2 text-[0.74rem] font-bold text-laut-900 shadow-sm backdrop-blur">
            <div>Per lapisan: <span className="num text-laut-600">{fmt(perLayer)}</span></div>
            <div>Lapisan penuh: <span className="num text-laut-600">{layersDone} / {s}</span></div>
            {highlightLayer !== null && <div className="text-koral-600">Sedang dilihat: lapisan ke-{highlightLayer + 1}</div>}
          </div>
        </div>
      )}
      {shown > 0 && inLayer > 0 && layersDone < s && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-laut-900/85 px-3 py-1 text-[0.72rem] font-extrabold text-white">
          Lapisan ke-{layersDone + 1} sedang terisi: {inLayer} / {perLayer}
        </div>
      )}
    </div>
  );
}

export function TuangLimas({ a, t, className }: { a: number; t: number; className?: string }) {
  const [tuang, setTuang] = useState(0);
  const volumePrisma = a * a * t;
  const volumeLimas = volumePrisma / 3;
  const terisi = Math.min(volumePrisma, tuang * volumeLimas);
  const fillPrisma = terisi / volumePrisma;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-center font-display text-sm font-extrabold text-anggur-500">Limas (⅓ bagian)</div>
          <div className="relative overflow-hidden rounded-2xl border-2 border-laut-800/12 bg-[radial-gradient(circle_at_50%_35%,#fff,#ECE6FF_75%)]" style={{ height: 220 }}>
            <Shape3D kind="limas" dims={{ a, t }} ghost={tuang > 0} autoRotate={false} className="absolute inset-0" />
          </div>
        </div>
        <div>
          <div className="mb-1 text-center font-display text-sm font-extrabold text-mint-600">Prisma pembanding</div>
          <div className="relative overflow-hidden rounded-2xl border-2 border-laut-800/12 bg-[radial-gradient(circle_at_50%_35%,#fff,#DFF8F2_75%)]" style={{ height: 220 }}>
            <Shape3D kind="balok" dims={{ p: a, l: a, t }} fill={fillPrisma} ghost autoRotate={false} className="absolute inset-0" />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[1, 2, 3].map((n) => (
          <button key={n} className={cn("btn btn-sm", tuang >= n ? "" : "opacity-70")} style={{ ["--btn-bg" as string]: tuang >= n ? "#21C3A4" : "#fff", ["--btn-fg" as string]: tuang >= n ? "#fff" : "#0A3D49" }} onClick={() => setTuang(n)}>
            Tuang {n}×
          </button>
        ))}
        <button className="btn btn-sm" onClick={() => setTuang(0)}>Kosongkan</button>
      </div>
      <div className="rounded-xl border-2 border-dashed border-laut-800/20 bg-laut-50 p-3 text-center text-sm font-semibold text-laut-900">
        Prisma terisi <span className="num font-extrabold text-mint-600">{fmt(terisi)} cm³</span> dari{" "}
        <span className="num font-extrabold">{fmt(volumePrisma)} cm³</span>
        {tuang === 3 && <span className="mt-1 block font-display text-base font-extrabold text-koral-600">Tepat penuh! Berarti volume limas = ⅓ × volume prisma 🎉</span>}
      </div>
    </div>
  );
}
