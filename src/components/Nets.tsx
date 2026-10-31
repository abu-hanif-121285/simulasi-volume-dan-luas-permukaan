import type { ShapeKind } from "../lib/shapes";
import { FACE_COLORS, fmt } from "../lib/shapes";
import { cn } from "../utils/cn";

export type NetFace = {
  id: string;
  name: string;
  color: string;
  kind: "poly" | "path" | "circle";
  points?: string;
  d?: string;
  cx?: number;
  cy?: number;
  r?: number;
  area: number;
  areaText: string;
  dims: string;
  lx: number;
  ly: number;
  w: number;
  h: number;
  bbox: number[][];
};

export type Net = { faces: NetFace[]; viewBox: string };

const centroid = (pts: number[][]) => {
  const x = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const y = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return [x, y] as const;
};

const bboxOf = (pts: number[][]) => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
};

function polyFace(id: string, name: string, color: string, pts: number[][], area: number, areaText: string, dims: string): NetFace {
  const [cx, cy] = centroid(pts);
  const [x1, y1, x2, y2] = bboxOf(pts);
  return {
    id, name, color, kind: "poly",
    points: pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" "),
    area, areaText, dims, lx: cx, ly: cy, w: x2 - x1, h: y2 - y1, bbox: pts,
  };
}

export function buildNet(kind: ShapeKind, d: Record<string, number>): Net {
  const maxDim = Math.max(...Object.values(d), 1);
  const u = Math.min(20, 260 / maxDim);
  const faces: NetFace[] = [];

  if (kind === "kubus") {
    const q = d.s * u;
    const A = d.s * d.s;
    const txt = `${fmt(d.s)} × ${fmt(d.s)} = ${fmt(A)} cm²`;
    faces.push(polyFace("n0", "Atas", FACE_COLORS[0], [[q, 0], [2 * q, 0], [2 * q, q], [q, q]], A, txt, `${fmt(d.s)} cm`));
    faces.push(polyFace("n1", "Kiri", FACE_COLORS[1], [[0, q], [q, q], [q, 2 * q], [0, 2 * q]], A, txt, `${fmt(d.s)} cm`));
    faces.push(polyFace("n2", "Depan", FACE_COLORS[2], [[q, q], [2 * q, q], [2 * q, 2 * q], [q, 2 * q]], A, txt, `${fmt(d.s)} cm`));
    faces.push(polyFace("n3", "Kanan", FACE_COLORS[3], [[2 * q, q], [3 * q, q], [3 * q, 2 * q], [2 * q, 2 * q]], A, txt, `${fmt(d.s)} cm`));
    faces.push(polyFace("n4", "Belakang", FACE_COLORS[4], [[3 * q, q], [4 * q, q], [4 * q, 2 * q], [3 * q, 2 * q]], A, txt, `${fmt(d.s)} cm`));
    faces.push(polyFace("n5", "Alas", FACE_COLORS[5], [[q, 2 * q], [2 * q, 2 * q], [2 * q, 3 * q], [q, 3 * q]], A, txt, `${fmt(d.s)} cm`));
  } else if (kind === "balok") {
    const P = d.p * u, L = d.l * u, T = d.t * u;
    const a1 = d.p * d.l, a2 = d.p * d.t, a3 = d.l * d.t;
    faces.push(polyFace("n0", "Atas", FACE_COLORS[0], [[L, 0], [L + P, 0], [L + P, L], [L, L]], a1, `${fmt(d.p)} × ${fmt(d.l)} = ${fmt(a1)} cm²`, "p × l"));
    faces.push(polyFace("n1", "Kiri", FACE_COLORS[1], [[0, L], [L, L], [L, L + T], [0, L + T]], a3, `${fmt(d.l)} × ${fmt(d.t)} = ${fmt(a3)} cm²`, "l × t"));
    faces.push(polyFace("n2", "Depan", FACE_COLORS[2], [[L, L], [L + P, L], [L + P, L + T], [L, L + T]], a2, `${fmt(d.p)} × ${fmt(d.t)} = ${fmt(a2)} cm²`, "p × t"));
    faces.push(polyFace("n3", "Kanan", FACE_COLORS[3], [[L + P, L], [L + P + L, L], [L + P + L, L + T], [L + P, L + T]], a3, `${fmt(d.l)} × ${fmt(d.t)} = ${fmt(a3)} cm²`, "l × t"));
    faces.push(polyFace("n4", "Belakang", FACE_COLORS[4], [[L + P + L, L], [2 * L + 2 * P, L], [2 * L + 2 * P, L + T], [L + P + L, L + T]], a2, `${fmt(d.p)} × ${fmt(d.t)} = ${fmt(a2)} cm²`, "p × t"));
    faces.push(polyFace("n5", "Alas", FACE_COLORS[5], [[L, L + T], [L + P, L + T], [L + P, L + T + L], [L, L + T + L]], a1, `${fmt(d.p)} × ${fmt(d.l)} = ${fmt(a1)} cm²`, "p × l"));
  } else if (kind === "prisma") {
    const A = d.a * u, TS = d.ts * u, T = d.t * u;
    const m = Math.sqrt(d.ts ** 2 + (d.a / 2) ** 2);
    const M = m * u;
    const La = 0.5 * d.a * d.ts;
    faces.push(polyFace("n0", "Segitiga alas", FACE_COLORS[3], [[0, TS], [A, TS], [A / 2, 0]], La, `½ × ${fmt(d.a)} × ${fmt(d.ts)} = ${fmt(La)} cm²`, `a=${fmt(d.a)}, ts=${fmt(d.ts)}`));
    faces.push(polyFace("n1", "Sisi tegak 1", FACE_COLORS[0], [[0, TS], [A, TS], [A, TS + T], [0, TS + T]], d.a * d.t, `${fmt(d.a)} × ${fmt(d.t)} = ${fmt(d.a * d.t)} cm²`, "a × t"));
    faces.push(polyFace("n2", "Sisi tegak 2", FACE_COLORS[1], [[A, TS], [A + M, TS], [A + M, TS + T], [A, TS + T]], m * d.t, `${fmt(m)} × ${fmt(d.t)} = ${fmt(m * d.t)} cm²`, "sisi miring × t"));
    faces.push(polyFace("n3", "Sisi tegak 3", FACE_COLORS[2], [[A + M, TS], [A + 2 * M, TS], [A + 2 * M, TS + T], [A + M, TS + T]], m * d.t, `${fmt(m)} × ${fmt(d.t)} = ${fmt(m * d.t)} cm²`, "sisi miring × t"));
    faces.push(polyFace("n4", "Segitiga atap", FACE_COLORS[3], [[0, TS + T], [A, TS + T], [A / 2, TS + T + TS]], La, `½ × ${fmt(d.a)} × ${fmt(d.ts)} = ${fmt(La)} cm²`, `a=${fmt(d.a)}, ts=${fmt(d.ts)}`));
  } else if (kind === "limas") {
    const A = d.a * u;
    const tt = Math.sqrt(d.t ** 2 + (d.a / 2) ** 2);
    const S = tt * u;
    const La = d.a * d.a;
    const seg = 0.5 * d.a * tt;
    faces.push(polyFace("n0", "Alas persegi", FACE_COLORS[4], [[S, S], [S + A, S], [S + A, S + A], [S, S + A]], La, `${fmt(d.a)} × ${fmt(d.a)} = ${fmt(La)} cm²`, "a × a"));
    faces.push(polyFace("n1", "Segitiga depan", FACE_COLORS[0], [[S, S + A], [S + A, S + A], [S + A / 2, S + A + S]], seg, `½ × ${fmt(d.a)} × ${fmt(tt)} = ${fmt(seg)} cm²`, `alas ${fmt(d.a)}, tt ${fmt(tt)}`));
    faces.push(polyFace("n2", "Segitiga kanan", FACE_COLORS[1], [[S + A, S], [S + A, S + A], [S + A + S, S + A / 2]], seg, `½ × ${fmt(d.a)} × ${fmt(tt)} = ${fmt(seg)} cm²`, `alas ${fmt(d.a)}, tt ${fmt(tt)}`));
    faces.push(polyFace("n3", "Segitiga belakang", FACE_COLORS[2], [[S, S], [S + A, S], [S + A / 2, 0]], seg, `½ × ${fmt(d.a)} × ${fmt(tt)} = ${fmt(seg)} cm²`, `alas ${fmt(d.a)}, tt ${fmt(tt)}`));
    faces.push(polyFace("n4", "Segitiga kiri", FACE_COLORS[5], [[S, S], [S, S + A], [0, S + A / 2]], seg, `½ × ${fmt(d.a)} × ${fmt(tt)} = ${fmt(seg)} cm²`, `alas ${fmt(d.a)}, tt ${fmt(tt)}`));
  } else {
    const r = d.r, t = d.t;
    const s = Math.sqrt(r * r + t * t);
    const R = s * u;
    const th = (2 * Math.PI * r) / s;
    const ox = R + 14;
    const oy = 14;
    const a1 = Math.PI / 2 - th / 2;
    const a2 = Math.PI / 2 + th / 2;
    const p1 = [ox + R * Math.cos(a1), oy + R * Math.sin(a1)];
    const p2 = [ox + R * Math.cos(a2), oy + R * Math.sin(a2)];
    const large = th > Math.PI ? 1 : 0;
    const selimut = (r % 7 === 0 ? 22 / 7 : 3.14) * r * s;
    faces.push({
      id: "n1", name: "Selimut (juring)", color: FACE_COLORS[0], kind: "path",
      d: `M ${ox.toFixed(2)} ${oy.toFixed(2)} L ${p1[0].toFixed(2)} ${p1[1].toFixed(2)} A ${R.toFixed(2)} ${R.toFixed(2)} 0 ${large} 1 ${p2[0].toFixed(2)} ${p2[1].toFixed(2)} Z`,
      area: selimut, areaText: `π × ${fmt(r)} × ${fmt(s)} = ${fmt(selimut)} cm²`, dims: `s = ${fmt(s)} cm`,
      lx: ox, ly: oy + R * 0.52, w: 2 * R, h: R, bbox: [[ox, oy], p1, p2, [ox, oy + R]],
    });
    const La = (r % 7 === 0 ? 22 / 7 : 3.14) * r * r;
    faces.push({
      id: "n0", name: "Alas lingkaran", color: FACE_COLORS[5], kind: "circle",
      cx: ox, cy: oy + R + r * u + 16, r: r * u,
      area: La, areaText: `π × ${fmt(r)} × ${fmt(r)} = ${fmt(La)} cm²`, dims: `r = ${fmt(r)} cm`,
      lx: ox, ly: oy + R + r * u + 16, w: 2 * r * u, h: 2 * r * u,
      bbox: [[ox - r * u, oy + R + 16], [ox + r * u, oy + R + 2 * r * u + 16]],
    });
  }

  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  faces.forEach((f) => f.bbox.forEach(([x, y]) => { x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x); y2 = Math.max(y2, y); }));
  const pad = 26;
  return { faces, viewBox: `${x1 - pad} ${y1 - pad} ${x2 - x1 + pad * 2} ${y2 - y1 + pad * 2}` };
}

export function NetSvg({
  net, revealed = 99, active = null, onHover, showLabel = true, className,
}: {
  net: Net;
  revealed?: number;
  active?: string | null;
  onHover?: (id: string | null) => void;
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <svg viewBox={net.viewBox} className={cn("h-full w-full", className)} style={{ overflow: "visible" }}>
      {net.faces.map((f, i) => {
        const shown = i < revealed;
        const isActive = active === f.id;
        const fs = Math.max(8, Math.min(13, Math.min(f.w, f.h) * 0.16));
        const common = {
          fill: f.color,
          stroke: isActive ? "#0a2b34" : "rgba(8,43,52,.55)",
          strokeWidth: isActive ? 2.6 : 1.6,
          style: {
            transition: "opacity .45s ease, transform .45s cubic-bezier(.34,1.4,.64,1)",
            opacity: shown ? (active && !isActive ? 0.45 : 1) : 0,
            transformOrigin: `${f.lx}px ${f.ly}px`,
            transform: shown ? "scale(1)" : "scale(.82)",
            cursor: onHover ? "pointer" : "default",
            filter: isActive ? "drop-shadow(0 3px 5px rgba(6,49,60,.35))" : "none",
          } as React.CSSProperties,
        };
        return (
          <g key={f.id} onMouseEnter={() => onHover?.(f.id)} onMouseLeave={() => onHover?.(null)} onClick={() => onHover?.(f.id)}>
            {f.kind === "poly" && <polygon points={f.points} {...common} />}
            {f.kind === "path" && <path d={f.d} {...common} />}
            {f.kind === "circle" && <circle cx={f.cx} cy={f.cy} r={f.r} {...common} />}
            {shown && showLabel && (
              <g pointerEvents="none" style={{ opacity: shown ? 1 : 0, transition: "opacity .4s ease .12s" }}>
                <text x={f.lx} y={f.ly - fs * 0.85} textAnchor="middle" fontSize={fs} fontWeight={800} fill="#08303a" fontFamily="Baloo 2, sans-serif">
                  {f.name}
                </text>
                <text x={f.lx} y={f.ly + fs * 0.35} textAnchor="middle" fontSize={fs * 0.82} fontWeight={700} fill="#08303a" opacity={0.85} fontFamily="Nunito, sans-serif">
                  {f.dims}
                </text>
                <text x={f.lx} y={f.ly + fs * 1.45} textAnchor="middle" fontSize={fs * 0.86} fontWeight={800} fill="#08303a" fontFamily="Nunito, sans-serif">
                  {f.areaText}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
