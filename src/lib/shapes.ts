/**
 * Inti matematika aplikasi: definisi bangun ruang, rumus, dan perhitungan bertahap.
 * Semua angka pada contoh/soal dihitung lewat fungsi di file ini agar tidak ada kunci yang keliru.
 */

export type ShapeKind = "kubus" | "balok" | "prisma" | "limas" | "kerucut";

export type DimDef = {
  key: string;
  label: string;
  short: string;
  min: number;
  max: number;
  step: number;
  def: number;
  desc: string;
};

export type FaceInfo = {
  id: string;
  label: string;
  area: number;
  areaText: string;
  dims: string;
  color: string;
  count?: number;
};

export type Result = {
  volume: number;
  lp: number;
  volSteps: string[];
  lpSteps: string[];
  extras: { label: string; value: string; note?: string }[];
  faces: FaceInfo[];
  piLabel?: string;
  catatan?: string;
};

/* ----------------------------- util angka ----------------------------- */

export const round = (n: number, d = 2) => {
  const f = Math.pow(10, d);
  return Math.round((n + Number.EPSILON) * f) / f;
};

/** Format angka gaya Indonesia: 1234.5 -> "1.234,5" */
export const fmt = (n: number): string => {
  if (!isFinite(n)) return "–";
  const r = round(n, 2);
  if (Number.isInteger(r)) return r.toLocaleString("id-ID");
  return r.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
};

export const piFor = (r: number) =>
  r % 7 === 0 ? { label: "22/7", value: 22 / 7, ket: "r kelipatan 7, jadi π = 22/7" } : { label: "3,14", value: 3.14, ket: "r bukan kelipatan 7, jadi π = 3,14" };

export const FACE_COLORS = ["#FFC24B", "#FF8A72", "#21C3A4", "#1491A8", "#7A55F0", "#F26DA0"];

/* ------------------------------ metadata ------------------------------ */

export const SHAPE_META: Record<
  ShapeKind,
  {
    name: string;
    icon: string;
    color: string;
    soft: string;
    tagline: string;
    facts: { label: string; value: string }[];
    unsur: { name: string; desc: string }[];
    rumusV: string;
    rumusLP: string;
    dims: DimDef[];
    kehidupan: string[];
  }
> = {
  kubus: {
    name: "Kubus",
    icon: "cube",
    color: "#1491A8",
    soft: "#E0F4F7",
    tagline: "Semua rusuknya sama panjang, semua sisinya persegi yang kongruen.",
    facts: [
      { label: "Sisi", value: "6 persegi sama besar" },
      { label: "Rusuk", value: "12 sama panjang" },
      { label: "Titik sudut", value: "8" },
    ],
    unsur: [
      { name: "Sisi / bidang", desc: "6 buah persegi yang menutupi kubus. Semua ukurannya sama persis." },
      { name: "Rusuk (s)", desc: "12 garis pertemuan dua sisi. Pada kubus, panjang semua rusuk sama — inilah yang kita sebut rusuk atau sisi (s)." },
      { name: "Titik sudut", desc: "8 pojok tempat tiga rusuk bertemu." },
      { name: "Diagonal sisi", desc: "Garis penghubung dua titik sudut yang berhadapan pada satu sisi, panjangnya s√2." },
    ],
    rumusV: "V = s × s × s = s³",
    rumusLP: "LP = 6 × s × s = 6s²",
    dims: [{ key: "s", label: "Panjang rusuk (s)", short: "s", min: 1, max: 14, step: 1, def: 6, desc: "Semua rusuk kubus sama panjang." }],
    kehidupan: ["Dadu permainan", "Kotak kado", "Rubik", "Akuarium berbentuk kubus", "Es batu"],
  },
  balok: {
    name: "Balok",
    icon: "box",
    color: "#FF8A72",
    soft: "#FFEBE5",
    tagline: "Punya tiga ukuran berbeda: panjang, lebar, dan tinggi.",
    facts: [
      { label: "Sisi", value: "6 persegi panjang" },
      { label: "Rusuk", value: "12 (3 kelompok × 4)" },
      { label: "Titik sudut", value: "8" },
    ],
    unsur: [
      { name: "Panjang (p)", desc: "Ukuran sisi terpanjang pada alas balok." },
      { name: "Lebar (l)", desc: "Ukuran sisi yang lebih pendek pada alas balok." },
      { name: "Tinggi (t)", desc: "Jarak dari alas ke atap balok." },
      { name: "Sisi berhadapan", desc: "Ada 3 pasang sisi yang sama bentuk dan ukurannya: atas-bawah, depan-belakang, kiri-kanan." },
    ],
    rumusV: "V = p × l × t",
    rumusLP: "LP = 2 × (p×l + p×t + l×t)",
    dims: [
      { key: "p", label: "Panjang (p)", short: "p", min: 1, max: 20, step: 1, def: 8, desc: "Ukuran arah memanjang." },
      { key: "l", label: "Lebar (l)", short: "l", min: 1, max: 20, step: 1, def: 4, desc: "Ukuran arah melebar." },
      { key: "t", label: "Tinggi (t)", short: "t", min: 1, max: 20, step: 1, def: 3, desc: "Ukuran arah atas." },
    ],
    kehidupan: ["Kardus mie instan", "Akuarium", "Lemari", "Kotak sepatu", "Bak mandi"],
  },
  prisma: {
    name: "Prisma Segitiga",
    icon: "prism",
    color: "#21C3A4",
    soft: "#DFF8F2",
    tagline: "Alas dan atapnya sama bentuk & ukuran, dihubungkan sisi-sisi tegak.",
    facts: [
      { label: "Sisi", value: "5 (2 segitiga + 3 persegi panjang)" },
      { label: "Rusuk", value: "9" },
      { label: "Titik sudut", value: "6" },
    ],
    unsur: [
      { name: "Alas & atap", desc: "Dua segitiga yang kongruen (sama bentuk dan ukuran) dan sejajar." },
      { name: "Sisi tegak / selimut", desc: "3 persegi panjang yang menghubungkan alas dan atap. Pada prisma tegak, tingginya sama dengan tinggi prisma." },
      { name: "Tinggi prisma (t)", desc: "Jarak tegak lurus antara bidang alas dan bidang atap." },
      { name: "Tinggi segitiga (ts)", desc: "Tinggi dari alas segitiga ke puncak segitiga — berbeda dengan tinggi prisma!" },
    ],
    rumusV: "V = luas alas × tinggi prisma",
    rumusLP: "LP = (2 × luas alas) + (keliling alas × tinggi prisma)",
    dims: [
      { key: "a", label: "Alas segitiga (a)", short: "a", min: 2, max: 16, step: 1, def: 6, desc: "Panjang alas segitiga." },
      { key: "ts", label: "Tinggi segitiga (ts)", short: "ts", min: 2, max: 16, step: 1, def: 4, desc: "Tinggi segitiga, dari alas ke puncak segitiga." },
      { key: "t", label: "Tinggi prisma (t)", short: "t", min: 2, max: 20, step: 1, def: 10, desc: "Jarak alas prisma ke atap prisma." },
    ],
    kehidupan: ["Tenda pramuka", "Atap rumah", "Kemasan cokelat Toblerone", "Potongan kue"],
  },
  limas: {
    name: "Limas Segiempat",
    icon: "pyramid",
    color: "#7A55F0",
    soft: "#ECE6FF",
    tagline: "Satu alas, empat sisi segitiga yang bertemu di satu titik puncak.",
    facts: [
      { label: "Sisi", value: "5 (1 persegi + 4 segitiga)" },
      { label: "Rusuk", value: "8" },
      { label: "Titik sudut", value: "5" },
    ],
    unsur: [
      { name: "Alas", desc: "Berbentuk persegi (pada limas segiempat beraturan)." },
      { name: "Titik puncak", desc: "Titik di atas alas tempat semua sisi tegak bertemu." },
      { name: "Tinggi limas (t)", desc: "Jarak tegak lurus dari titik puncak ke bidang alas." },
      { name: "Tinggi sisi tegak (tt)", desc: "Tinggi segitiga pada sisi tegak, diukur dari rusuk alas ke titik puncak. Nilainya LEBIH PANJANG dari tinggi limas." },
    ],
    rumusV: "V = ⅓ × luas alas × tinggi limas",
    rumusLP: "LP = luas alas + (4 × luas segitiga sisi tegak)",
    dims: [
      { key: "a", label: "Sisi alas persegi (a)", short: "a", min: 2, max: 16, step: 1, def: 6, desc: "Panjang sisi persegi pada alas." },
      { key: "t", label: "Tinggi limas (t)", short: "t", min: 2, max: 16, step: 1, def: 4, desc: "Jarak puncak ke alas (tegak lurus)." },
    ],
    kehidupan: ["Piramida Mesir", "Atap menara", "Tenda berbentuk limas", "Hiasan puncak gedung"],
  },
  kerucut: {
    name: "Kerucut",
    icon: "cone",
    color: "#F5A623",
    soft: "#FFF1D6",
    tagline: "Alasnya lingkaran, punya satu titik puncak dan satu sisi lengkung.",
    facts: [
      { label: "Sisi", value: "2 (lingkaran + selimut lengkung)" },
      { label: "Rusuk", value: "1 (lingkaran alas)" },
      { label: "Titik sudut", value: "1 (titik puncak)" },
    ],
    unsur: [
      { name: "Alas lingkaran", desc: "Bidang datar berbentuk lingkaran dengan jari-jari r." },
      { name: "Jari-jari (r)", desc: "Jarak dari pusat lingkaran alas ke tepi lingkaran." },
      { name: "Tinggi (t)", desc: "Jarak tegak lurus dari titik puncak ke pusat lingkaran alas." },
      { name: "Garis pelukis (s)", desc: "Jarak dari titik puncak ke tepi lingkaran alas mengikuti sisi lengkung. s = √(r² + t²)." },
      { name: "Selimut kerucut", desc: "Sisi lengkung yang jika dibuka menjadi juring lingkaran." },
    ],
    rumusV: "V = ⅓ × π × r² × t",
    rumusLP: "LP = π × r × (r + s)",
    dims: [
      { key: "r", label: "Jari-jari alas (r)", short: "r", min: 1, max: 21, step: 1, def: 7, desc: "Setengah diameter lingkaran alas." },
      { key: "t", label: "Tinggi kerucut (t)", short: "t", min: 2, max: 30, step: 1, def: 24, desc: "Tegak lurus dari puncak ke pusat alas." },
    ],
    kehidupan: ["Cone es krim", "Topi ulang tahun", "Corong minyak", "Tumpeng", "Cone pembatas jalan"],
  },
};

export const SHAPE_ORDER: ShapeKind[] = ["kubus", "balok", "prisma", "limas", "kerucut"];

/* ------------------------------ perhitungan ------------------------------ */

export function hitungKubus(d: { s: number }): Result {
  const s = d.s;
  const V = s * s * s;
  const ls = s * s;
  const LP = 6 * ls;
  return {
    volume: V,
    lp: LP,
    volSteps: [
      "Volume = rusuk × rusuk × rusuk",
      `V = ${fmt(s)} × ${fmt(s)} × ${fmt(s)}`,
      `V = ${fmt(V)} cm³`,
    ],
    lpSteps: [
      `Luas satu sisi (persegi) = s × s = ${fmt(s)} × ${fmt(s)} = ${fmt(ls)} cm²`,
      "Kubus memiliki 6 sisi yang sama besar",
      `LP = 6 × ${fmt(ls)} = ${fmt(LP)} cm²`,
    ],
    extras: [
      { label: "Luas satu sisi", value: `${fmt(ls)} cm²` },
      { label: "Keliling satu sisi", value: `${fmt(4 * s)} cm` },
    ],
    faces: Array.from({ length: 6 }, (_, i) => ({
      id: `k${i}`,
      label: ["Atas", "Depan", "Kanan", "Belakang", "Kiri", "Alas"][i],
      area: ls,
      areaText: `${fmt(s)} × ${fmt(s)} = ${fmt(ls)} cm²`,
      dims: `${fmt(s)} cm × ${fmt(s)} cm`,
      color: FACE_COLORS[i],
    })),
    catatan: "Angka volume dan luas permukaan bisa sama (216 dan 216), tetapi satuannya BERBEDA: cm³ untuk volume, cm² untuk luas permukaan.",
  };
}

export function hitungBalok(d: { p: number; l: number; t: number }): Result {
  const { p, l, t } = d;
  const V = p * l * t;
  const a1 = p * l;
  const a2 = p * t;
  const a3 = l * t;
  const LP = 2 * (a1 + a2 + a3);
  return {
    volume: V,
    lp: LP,
    volSteps: ["Volume = panjang × lebar × tinggi", `V = ${fmt(p)} × ${fmt(l)} × ${fmt(t)}`, `V = ${fmt(V)} cm³`],
    lpSteps: [
      `Pasangan 1 — sisi atas & alas (p × l) = ${fmt(p)} × ${fmt(l)} = ${fmt(a1)} cm²  →  2 × ${fmt(a1)} = ${fmt(2 * a1)} cm²`,
      `Pasangan 2 — sisi depan & belakang (p × t) = ${fmt(p)} × ${fmt(t)} = ${fmt(a2)} cm²  →  2 × ${fmt(a2)} = ${fmt(2 * a2)} cm²`,
      `Pasangan 3 — sisi kiri & kanan (l × t) = ${fmt(l)} × ${fmt(t)} = ${fmt(a3)} cm²  →  2 × ${fmt(a3)} = ${fmt(2 * a3)} cm²`,
      `LP = 2 × (${fmt(a1)} + ${fmt(a2)} + ${fmt(a3)}) = 2 × ${fmt(a1 + a2 + a3)} = ${fmt(LP)} cm²`,
    ],
    extras: [
      { label: "Luas alas", value: `${fmt(a1)} cm²` },
      { label: "Keliling alas", value: `${fmt(2 * (p + l))} cm` },
      { label: "Diagonal ruang", value: `${fmt(Math.sqrt(p * p + l * l + t * t))} cm` },
    ],
    faces: [
      { id: "b0", label: "Alas", area: a1, areaText: `${fmt(p)} × ${fmt(l)} = ${fmt(a1)} cm²`, dims: `${fmt(p)} × ${fmt(l)} cm`, color: FACE_COLORS[0], count: 2 },
      { id: "b1", label: "Atas", area: a1, areaText: `${fmt(p)} × ${fmt(l)} = ${fmt(a1)} cm²`, dims: `${fmt(p)} × ${fmt(l)} cm`, color: FACE_COLORS[0], count: 2 },
      { id: "b2", label: "Depan", area: a2, areaText: `${fmt(p)} × ${fmt(t)} = ${fmt(a2)} cm²`, dims: `${fmt(p)} × ${fmt(t)} cm`, color: FACE_COLORS[1], count: 2 },
      { id: "b3", label: "Belakang", area: a2, areaText: `${fmt(p)} × ${fmt(t)} = ${fmt(a2)} cm²`, dims: `${fmt(p)} × ${fmt(t)} cm`, color: FACE_COLORS[1], count: 2 },
      { id: "b4", label: "Kiri", area: a3, areaText: `${fmt(l)} × ${fmt(t)} = ${fmt(a3)} cm²`, dims: `${fmt(l)} × ${fmt(t)} cm`, color: FACE_COLORS[2], count: 2 },
      { id: "b5", label: "Kanan", area: a3, areaText: `${fmt(l)} × ${fmt(t)} = ${fmt(a3)} cm²`, dims: `${fmt(l)} × ${fmt(t)} cm`, color: FACE_COLORS[2], count: 2 },
    ],
    catatan: "Rumus LP balok berasal dari 3 PASANG sisi yang ukurannya sama. Itulah sebabnya ada angka 2 di depan kurung.",
  };
}

export function hitungPrisma(d: { a: number; ts: number; t: number }): Result {
  const { a, ts, t } = d;
  const La = 0.5 * a * ts;
  const sisiMiring = Math.sqrt(ts * ts + (a / 2) * (a / 2));
  const K = a + 2 * sisiMiring;
  const V = La * t;
  const selimut = K * t;
  const LP = 2 * La + selimut;
  return {
    volume: V,
    lp: LP,
    volSteps: [
      "Langkah 1 — cari luas alas (segitiga)",
      `Luas alas = ½ × a × ts = ½ × ${fmt(a)} × ${fmt(ts)} = ${fmt(La)} cm²`,
      "Langkah 2 — kalikan dengan tinggi prisma",
      `V = ${fmt(La)} × ${fmt(t)} = ${fmt(V)} cm³`,
    ],
    lpSteps: [
      `Sisi miring segitiga = √(ts² + (a÷2)²) = √(${fmt(ts * ts)} + ${fmt((a / 2) * (a / 2))}) = ${fmt(sisiMiring)} cm`,
      `Keliling alas = ${fmt(a)} + ${fmt(sisiMiring)} + ${fmt(sisiMiring)} = ${fmt(K)} cm`,
      `Luas selimut (3 sisi tegak) = K × t = ${fmt(K)} × ${fmt(t)} = ${fmt(selimut)} cm²`,
      `Luas 2 segitiga = 2 × ${fmt(La)} = ${fmt(2 * La)} cm²`,
      `LP = ${fmt(2 * La)} + ${fmt(selimut)} = ${fmt(LP)} cm²`,
    ],
    extras: [
      { label: "Luas alas segitiga", value: `${fmt(La)} cm²` },
      { label: "Keliling alas", value: `${fmt(K)} cm` },
      { label: "Luas selimut", value: `${fmt(selimut)} cm²`, note: "Berlaku untuk prisma tegak" },
    ],
    faces: [
      { id: "p0", label: "Segitiga alas", area: La, areaText: `½ × ${fmt(a)} × ${fmt(ts)} = ${fmt(La)} cm²`, dims: `a=${fmt(a)}, ts=${fmt(ts)}`, color: FACE_COLORS[3] },
      { id: "p1", label: "Segitiga atap", area: La, areaText: `½ × ${fmt(a)} × ${fmt(ts)} = ${fmt(La)} cm²`, dims: `a=${fmt(a)}, ts=${fmt(ts)}`, color: FACE_COLORS[3] },
      { id: "p2", label: "Sisi tegak (alas a)", area: a * t, areaText: `${fmt(a)} × ${fmt(t)} = ${fmt(a * t)} cm²`, dims: `${fmt(a)} × ${fmt(t)} cm`, color: FACE_COLORS[0] },
      { id: "p3", label: "Sisi tegak (miring)", area: sisiMiring * t, areaText: `${fmt(sisiMiring)} × ${fmt(t)} = ${fmt(sisiMiring * t)} cm²`, dims: `${fmt(sisiMiring)} × ${fmt(t)} cm`, color: FACE_COLORS[1] },
      { id: "p4", label: "Sisi tegak (miring)", area: sisiMiring * t, areaText: `${fmt(sisiMiring)} × ${fmt(t)} = ${fmt(sisiMiring * t)} cm²`, dims: `${fmt(sisiMiring)} × ${fmt(t)} cm`, color: FACE_COLORS[1] },
    ],
    catatan: "Rumus selimut = keliling alas × tinggi hanya berlaku pada PRISMA TEGAK, yaitu sisi tegaknya berbentuk persegi panjang.",
  };
}

export function hitungLimas(d: { a: number; t: number }): Result {
  const { a, t } = d;
  const La = a * a;
  const tt = Math.sqrt(t * t + (a / 2) * (a / 2));
  const V = (La * t) / 3;
  const satuSegitiga = 0.5 * a * tt;
  const LP = La + 4 * satuSegitiga;
  return {
    volume: V,
    lp: LP,
    volSteps: [
      `Luas alas (persegi) = ${fmt(a)} × ${fmt(a)} = ${fmt(La)} cm²`,
      "Volume limas = ⅓ × luas alas × tinggi limas",
      `V = ⅓ × ${fmt(La)} × ${fmt(t)}`,
      `V = ${fmt((La * t) / 1)} ÷ 3 = ${fmt(V)} cm³`,
    ],
    lpSteps: [
      `Tinggi sisi tegak (tt) = √(t² + (a÷2)²) = √(${fmt(t * t)} + ${fmt((a / 2) * (a / 2))}) = ${fmt(tt)} cm`,
      `Luas satu segitiga = ½ × ${fmt(a)} × ${fmt(tt)} = ${fmt(satuSegitiga)} cm²`,
      `Luas 4 segitiga = 4 × ${fmt(satuSegitiga)} = ${fmt(4 * satuSegitiga)} cm²`,
      `LP = luas alas + 4 segitiga = ${fmt(La)} + ${fmt(4 * satuSegitiga)} = ${fmt(LP)} cm²`,
    ],
    extras: [
      { label: "Luas alas", value: `${fmt(La)} cm²` },
      { label: "Tinggi limas (t)", value: `${fmt(t)} cm`, note: "Puncak ke alas" },
      { label: "Tinggi sisi tegak (tt)", value: `${fmt(tt)} cm`, note: "Selalu lebih panjang dari t" },
    ],
    faces: [
      { id: "l0", label: "Alas persegi", area: La, areaText: `${fmt(a)} × ${fmt(a)} = ${fmt(La)} cm²`, dims: `${fmt(a)} × ${fmt(a)} cm`, color: FACE_COLORS[4] },
      ...[0, 1, 2, 3].map((i) => ({
        id: `l${i + 1}`,
        label: `Segitiga tegak ${i + 1}`,
        area: satuSegitiga,
        areaText: `½ × ${fmt(a)} × ${fmt(tt)} = ${fmt(satuSegitiga)} cm²`,
        dims: `alas ${fmt(a)}, tinggi ${fmt(tt)} cm`,
        color: FACE_COLORS[i],
      })),
    ],
    catatan: "Volume limas hanya SEPERTIGA volume prisma yang alas dan tingginya sama. Coba buktikan di menu Simulasi!",
  };
}

export function hitungKerucut(d: { r: number; t: number; pi?: number; piLabel?: string }): Result {
  const r = d.r;
  const t = d.t;
  const p = d.pi ?? piFor(r).value;
  const pLabel = d.piLabel ?? piFor(r).label;
  const s = Math.sqrt(r * r + t * t);
  const V = (p * r * r * t) / 3;
  const La = p * r * r;
  const selimut = p * r * s;
  const LP = p * r * (r + s);
  const piTeks = pLabel === "22/7" ? "22/7" : "3,14";
  return {
    volume: V,
    lp: LP,
    volSteps: [
      `π = ${piTeks} (${piFor(r).ket})`,
      "Volume kerucut = ⅓ × π × r × r × t",
      `V = ⅓ × ${piTeks} × ${fmt(r)} × ${fmt(r)} × ${fmt(t)}`,
      `V = ${fmt(V)} cm³`,
    ],
    lpSteps: [
      `Garis pelukis s = √(r² + t²) = √(${fmt(r * r)} + ${fmt(t * t)}) = √${fmt(r * r + t * t)} = ${fmt(s)} cm`,
      `Luas alas (lingkaran) = π × r × r = ${piTeks} × ${fmt(r)} × ${fmt(r)} = ${fmt(La)} cm²`,
      `Luas selimut = π × r × s = ${piTeks} × ${fmt(r)} × ${fmt(s)} = ${fmt(selimut)} cm²`,
      `LP = π × r × (r + s) = ${fmt(La)} + ${fmt(selimut)} = ${fmt(LP)} cm²`,
    ],
    extras: [
      { label: "Jari-jari (r)", value: `${fmt(r)} cm` },
      { label: "Tinggi (t)", value: `${fmt(t)} cm`, note: "Tegak lurus" },
      { label: "Garis pelukis (s)", value: `${fmt(s)} cm`, note: "s = √(r² + t²)" },
      { label: "Nilai π", value: piTeks },
    ],
    faces: [
      { id: "c0", label: "Alas lingkaran", area: La, areaText: `π × ${fmt(r)} × ${fmt(r)} = ${fmt(La)} cm²`, dims: `r = ${fmt(r)} cm`, color: FACE_COLORS[5] },
      { id: "c1", label: "Selimut (juring)", area: selimut, areaText: `π × ${fmt(r)} × ${fmt(s)} = ${fmt(selimut)} cm²`, dims: `r = ${fmt(r)}, s = ${fmt(s)} cm`, color: FACE_COLORS[0] },
    ],
    catatan: "Hati-hati! Tinggi kerucut (t) dan garis pelukis (s) adalah dua ukuran yang BERBEDA. Untuk volume pakai t, untuk luas selimut pakai s.",
  };
}

export function hitung(kind: ShapeKind, d: Record<string, number>): Result {
  switch (kind) {
    case "kubus":
      return hitungKubus({ s: d.s });
    case "balok":
      return hitungBalok({ p: d.p, l: d.l, t: d.t });
    case "prisma":
      return hitungPrisma({ a: d.a, ts: d.ts, t: d.t });
    case "limas":
      return hitungLimas({ a: d.a, t: d.t });
    case "kerucut":
      return hitungKerucut({ r: d.r, t: d.t });
  }
}

export const defaultDims = (kind: ShapeKind): Record<string, number> =>
  Object.fromEntries(SHAPE_META[kind].dims.map((d) => [d.key, d.def]));

/* --------- pintasan untuk bank soal (agar kunci selalu terverifikasi) --------- */

export const V = {
  kubus: (s: number) => s * s * s,
  balok: (p: number, l: number, t: number) => p * l * t,
  prisma: (a: number, ts: number, t: number) => 0.5 * a * ts * t,
  limas: (a: number, t: number) => (a * a * t) / 3,
  kerucut: (r: number, t: number) => (piFor(r).value * r * r * t) / 3,
};

export const LP = {
  kubus: (s: number) => 6 * s * s,
  balok: (p: number, l: number, t: number) => 2 * (p * l + p * t + l * t),
  prisma: (a: number, ts: number, t: number) => {
    const La = 0.5 * a * ts;
    const m = Math.sqrt(ts * ts + (a / 2) * (a / 2));
    return 2 * La + (a + 2 * m) * t;
  },
  limas: (a: number, t: number) => {
    const tt = Math.sqrt(t * t + (a / 2) * (a / 2));
    return a * a + 4 * (0.5 * a * tt);
  },
  kerucut: (r: number, t: number) => {
    const s = Math.sqrt(r * r + t * t);
    return piFor(r).value * r * (r + s);
  },
};

export const selimutKerucut = (r: number, t: number) => {
  const s = Math.sqrt(r * r + t * t);
  return piFor(r).value * r * s;
};
