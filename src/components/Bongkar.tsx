import { useEffect, useRef, useState } from "react";
import Shape3D from "./Shape3D";
import { buildNet, NetSvg } from "./Nets";
import { fmt, hitung, SHAPE_META } from "../lib/shapes";
import type { ShapeKind } from "../lib/shapes";
import { Button, Icon } from "./ui";
import { cn } from "../utils/cn";

export function BongkarStage({
  kind, dims, height = 340, onOpen, onProgress, labelSize = "md",
}: {
  kind: ShapeKind;
  dims: Record<string, number>;
  height?: number;
  onOpen?: (open: boolean) => void;
  onProgress?: (t: number) => void;
  labelSize?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [t, setT] = useState(0);
  const [spin, setSpin] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const raf = useRef(0);
  const tRef = useRef(0);
  const openCb = useRef(onOpen);
  openCb.current = onOpen;
  tRef.current = t;

  const net = buildNet(kind, dims);
  const hasil = hitung(kind, dims);

  useEffect(() => {
    const target = open ? 1 : 0;
    const from = tRef.current;
    const start = performance.now();
    const dur = 850;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const v = from + (target - from) * eased;
      setT(v);
      onProgress?.(v);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, JSON.stringify(dims), kind]);

  useEffect(() => { openCb.current?.(open); }, [open]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const revealed = Math.round(t * net.faces.length + 0.001);
  const jumlahSejauhIni = net.faces.slice(0, revealed).reduce((s, f) => s + f.area, 0);

  return (
    <div className="space-y-3">
      <div
        className="relative overflow-hidden rounded-2xl border-2 border-laut-800/12 bg-[radial-gradient(circle_at_50%_30%,#ffffff,#e2f2f6_70%,#cfe8ef)]"
        style={{ height }}
      >
        <div className="absolute inset-0 transition-opacity duration-300" style={{ opacity: Math.max(0, 1 - t * 1.5) }}>
          <Shape3D kind={kind} dims={dims} explode={t} autoRotate={spin && t < 0.05} showRusuk showTitik={false} className="h-full w-full" />
        </div>
        <div className="absolute inset-0 p-3 transition-opacity duration-300" style={{ opacity: Math.max(0, t * 1.6 - 0.55) }}>
          <NetSvg net={net} revealed={revealed} active={active} onHover={setActive} />
        </div>
        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-laut-900/80 px-3 py-1 text-[0.7rem] font-extrabold text-white">
          {t < 0.3 ? "Bangun ruang utuh — putar dengan menyeret model" : t < 0.75 ? "Sisi-sisi sedang dibuka…" : "Inilah jaring-jaring " + SHAPE_META[kind].name}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant={open ? "coral" : "teal"} size="sm" onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? "refresh" : "scissors"} className="h-4 w-4" />
          {open ? "SATUKAN" : "BONGKAR"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setSpin((s) => !s)}>
          <Icon name="refresh" className={cn("h-4 w-4", spin && "animate-spin")} />
          {spin ? "Hentikan Putaran" : "Putar Bangun"}
        </Button>
        <span className="ml-auto text-[0.72rem] font-bold text-laut-800/60">Geser model untuk memutar 🔍</span>
      </div>

      <div className="overflow-hidden rounded-xl border-2 border-laut-800/12">
        <table className={cn("w-full text-left", labelSize === "sm" ? "text-[0.76rem]" : "text-[0.85rem]")}>
          <thead className="bg-laut-900 text-white">
            <tr>
              <th className="px-3 py-2 font-display font-bold">Sisi</th>
              <th className="px-3 py-2 font-display font-bold">Perhitungan luas</th>
              <th className="px-3 py-2 text-right font-display font-bold">Luas</th>
            </tr>
          </thead>
          <tbody>
            {net.faces.map((f, i) => (
              <tr
                key={f.id + i}
                onMouseEnter={() => setActive(f.id)}
                onMouseLeave={() => setActive(null)}
                className={cn("border-t-2 border-laut-800/8 transition-colors", active === f.id ? "bg-sun-500/15" : "bg-white", i >= revealed && "opacity-35")}
              >
                <td className="px-3 py-1.5 font-bold">
                  <span className="mr-2 inline-block h-3.5 w-3.5 rounded" style={{ background: f.color }} />
                  {f.name}
                </td>
                <td className="num px-3 py-1.5 text-laut-900/85">{f.areaText}</td>
                <td className="num px-3 py-1.5 text-right font-extrabold text-laut-700">{fmt(f.area)} cm²</td>
              </tr>
            ))}
            <tr className="border-t-2 border-laut-800/15 bg-laut-50">
              <td className="px-3 py-2 font-display font-extrabold text-laut-900" colSpan={2}>
                {revealed < net.faces.length ? `Jumlah ${revealed} sisi pertama …` : "LUAS PERMUKAAN (semua sisi dijumlahkan)"}
              </td>
              <td className="num px-3 py-2 text-right font-display text-lg font-extrabold text-mint-600">
                {fmt(revealed < net.faces.length ? jumlahSejauhIni : hasil.lp)} cm²
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
