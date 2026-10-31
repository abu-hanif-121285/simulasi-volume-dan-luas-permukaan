import { useEffect, useState } from "react";
import type { ShapeKind } from "../lib/shapes";
import { SHAPE_META, SHAPE_ORDER, fmt, hitung } from "../lib/shapes";
import { BongkarStage } from "../components/Bongkar";
import { TuangLimas, UnitCubeStage, useFillAnim } from "../components/FillDemo";
import { HitungPanel } from "../components/HitungPanel";
import Shape3D from "../components/Shape3D";
import { RobotTalk } from "../components/Robot";
import { Button, Card, Icon, Kicker, Slider, StepList, useReveal } from "../components/ui";
import { useProgress } from "../lib/store";
import { sfx, useSpeech } from "../lib/media";
import { cn } from "../utils/cn";

type SectionId = "konsep-volume" | "konsep-lp" | "jangan-tertukar" | ShapeKind;

const SECTIONS: { id: SectionId; no: string; title: string; icon: string; color: string; blurb: string }[] = [
  { id: "konsep-volume", no: "MATERI 1", title: "Memahami Volume", icon: "layers", color: "#1491A8", blurb: "Apa arti volume dan dari mana rumusnya datang." },
  { id: "konsep-lp", no: "MATERI 2", title: "Memahami Luas Permukaan", icon: "gift", color: "#FF6B57", blurb: "Membungkus kotak, membuka jaring-jaring, menjumlahkan sisi." },
  { id: "jangan-tertukar", no: "PENTING", title: "Jangan Sampai Tertukar!", icon: "bulb", color: "#F5A623", blurb: "Tabel pembanding + tes cepat volume vs luas permukaan." },
  { id: "kubus", no: "BANGUN 1", title: "Kubus", icon: "cube", color: "#1491A8", blurb: "6 sisi persegi, 12 rusuk sama panjang." },
  { id: "balok", no: "BANGUN 2", title: "Balok", icon: "box", color: "#FF8A72", blurb: "Panjang, lebar, dan tinggi yang berbeda." },
  { id: "prisma", no: "BANGUN 3", title: "Prisma Segitiga", icon: "prism", color: "#21C3A4", blurb: "Alas & atap segitiga, tiga sisi tegak." },
  { id: "limas", no: "BANGUN 4", title: "Limas Segiempat", icon: "pyramid", color: "#7A55F0", blurb: "Bukti kenapa volumenya ⅓ dari prisma." },
  { id: "kerucut", no: "BANGUN 5", title: "Kerucut", icon: "cone", color: "#F5A623", blurb: "Alas lingkaran, tinggi dan garis pelukis berbeda." },
];

/* ------------------------------ asal-usul rumus ------------------------------ */

const ASAL: Record<ShapeKind, { v: string[]; lp: string[]; simbol: { s: string; arti: string }[] }> = {
  kubus: {
    v: [
      "Volume artinya banyak ruang di DALAM bangun. Ruang itu bisa kita isi dengan kubus satuan berukuran 1 cm × 1 cm × 1 cm.",
      "Sepanjang rusuk bawah muat s kubus satuan. Ke arah lebar juga muat s kubus. Jadi satu lapisan = s × s kubus satuan.",
      "Ke arah atas muat s lapisan. Total kubus satuan = s × s × s.",
      "Karena itulah rumus volume kubus ditulis V = s³.",
    ],
    lp: [
      "Buka kubus menjadi jaring-jaring. Terlihat 6 buah persegi yang ukurannya sama persis.",
      "Luas satu persegi = s × s.",
      "Karena ada 6 persegi, maka LP = 6 × (s × s) = 6s².",
    ],
    simbol: [
      { s: "V", arti: "Volume, satuannya cm³ (kubik)" },
      { s: "LP", arti: "Luas permukaan, satuannya cm² (persegi)" },
      { s: "s", arti: "panjang rusuk kubus (semua rusuk sama panjang)" },
    ],
  },
  balok: {
    v: [
      "Susun kubus satuan di alas balok: sepanjang p muat p kubus, sepanjang l muat l kubus.",
      "Satu lapisan = p × l kubus satuan.",
      "Tumpuk sampai setinggi t, berarti ada t lapisan.",
      "Total = p × l × t. Itulah V balok.",
    ],
    lp: [
      "Balok punya 3 PASANG sisi yang ukurannya sama: atas & alas (p × l), depan & belakang (p × t), kiri & kanan (l × t).",
      "Jumlahkan satu dari tiap pasang, lalu kalikan 2 karena setiap sisi punya pasangan.",
      "Maka LP = 2 × (p×l + p×t + l×t).",
    ],
    simbol: [
      { s: "p", arti: "panjang balok" },
      { s: "l", arti: "lebar balok" },
      { s: "t", arti: "tinggi balok" },
    ],
  },
  prisma: {
    v: [
      "Alas prisma berbentuk segitiga. Luas segitiga = ½ × alas × tinggi segitiga.",
      "Bayangkan prisma tersusun dari lapisan-lapisan segitiga tipis yang ditumpuk setinggi t.",
      "Banyak lapisan sebanding dengan tinggi prisma, sehingga V = luas alas × tinggi prisma.",
      "Rumus ini berlaku untuk SEMUA prisma, apa pun bentuk alasnya.",
    ],
    lp: [
      "Buka prisma segitiga: muncul 2 segitiga (alas dan atap) serta 3 persegi panjang (selimut).",
      "Kalau ketiga persegi panjang itu dijajarkan, total lebarnya sama dengan keliling alas segitiga.",
      "Jadi luas selimut = keliling alas × tinggi prisma. Ini berlaku untuk PRISMA TEGAK (sisi tegaknya persegi panjang).",
      "LP = (2 × luas alas) + (keliling alas × t).",
    ],
    simbol: [
      { s: "a", arti: "alas segitiga" },
      { s: "ts", arti: "tinggi segitiga (bukan tinggi prisma!)" },
      { s: "t", arti: "tinggi prisma (jarak alas ke atap)" },
    ],
  },
  limas: {
    v: [
      "Siapkan prisma yang luas alas dan tingginya SAMA dengan limas.",
      "Isi limas dengan pasir, lalu tuangkan ke dalam prisma. Ternyata butuh TEPAT 3 kali tuangan sampai prisma penuh.",
      "Berarti isi limas hanya sepertiga isi prisma: V = ⅓ × luas alas × tinggi.",
      "Coba sendiri buktinya pada simulasi di bawah ini!",
    ],
    lp: [
      "Jaring-jaring limas segiempat: 1 persegi (alas) + 4 segitiga (sisi tegak).",
      "Luas segitiga = ½ × alas × tinggi. Tinggi yang dipakai adalah TINGGI SISI TEGAK (tt), bukan tinggi limas (t).",
      "tt selalu lebih panjang dari t, dan bisa dicari dengan Pythagoras: tt = √(t² + (a÷2)²).",
      "LP = luas alas + 4 × (½ × a × tt).",
    ],
    simbol: [
      { s: "a", arti: "panjang sisi alas persegi" },
      { s: "t", arti: "tinggi limas: puncak ke alas, tegak lurus" },
      { s: "tt", arti: "tinggi sisi tegak: rusuk alas ke puncak, lewat permukaan segitiga" },
    ],
  },
  kerucut: {
    v: [
      "Kerucut mirip limas, hanya alasnya berbentuk lingkaran.",
      "Sama seperti limas, isi kerucut hanya ⅓ dari tabung yang alas dan tingginya sama.",
      "Luas lingkaran = π × r², sehingga V = ⅓ × π × r² × t.",
      "Gunakan π = 22/7 bila jari-jari kelipatan 7, selain itu pakai π = 3,14.",
    ],
    lp: [
      "Buka kerucut: alasnya tetap lingkaran, sedangkan sisi lengkungnya menjadi JURING lingkaran.",
      "Juring itu berjari-jari s (garis pelukis) dan panjang busurnya sama dengan keliling alas, yaitu 2πr.",
      "Luas juring = ½ × panjang busur × jari-jari = ½ × 2πr × s = π r s.",
      "LP = luas alas + luas selimut = πr² + πrs = π × r × (r + s).",
    ],
    simbol: [
      { s: "r", arti: "jari-jari lingkaran alas" },
      { s: "t", arti: "tinggi kerucut (puncak ke pusat alas, tegak lurus)" },
      { s: "s", arti: "garis pelukis (puncak ke tepi alas) = √(r² + t²)" },
      { s: "π", arti: "22/7 atau 3,14" },
    ],
  },
};

const CONTOH_DIMS: Record<ShapeKind, Record<string, number>> = {
  kubus: { s: 6 },
  balok: { p: 8, l: 4, t: 3 },
  prisma: { a: 6, ts: 4, t: 10 },
  limas: { a: 6, t: 4 },
  kerucut: { r: 7, t: 24 },
};

/* --------------------------------- komponen --------------------------------- */

function TandaiSelesai({ id }: { id: string }) {
  const { state, markMateri } = useProgress();
  const done = !!state.materi[id];
  return (
    <Button variant={done ? "mint" : "sun"} onClick={() => { markMateri(id); sfx.pop(); }}>
      <Icon name={done ? "check" : "flag"} className="h-4 w-4" />
      {done ? "Bagian ini sudah kamu selesaikan" : "Tandai Sudah Dipahami"}
    </Button>
  );
}

function Model3D({ kind, dims, height = 300 }: { kind: ShapeKind; dims: Record<string, number>; height?: number }) {
  const [rusuk, setRusuk] = useState(true);
  const [titik, setTitik] = useState(false);
  const [putar, setPutar] = useState(true);
  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border-2 border-laut-800/12 bg-[radial-gradient(circle_at_50%_30%,#ffffff,#e2f2f6_72%,#cbe6ee)]" style={{ height }}>
        <Shape3D kind={kind} dims={dims} showRusuk={rusuk} showTitik={titik} autoRotate={putar} className="absolute inset-0" />
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-white/85 px-2 py-1 text-[0.68rem] font-extrabold uppercase tracking-wider text-laut-700 backdrop-blur">
          Seret untuk memutar 🔍
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {[
          { on: putar, set: () => setPutar((v) => !v), label: putar ? "Putar: ON" : "Putar: OFF", icon: "refresh" },
          { on: rusuk, set: () => setRusuk((v) => !v), label: "Rusuk", icon: "cube" },
          { on: titik, set: () => setTitik((v) => !v), label: "Titik sudut", icon: "target" },
        ].map((b) => (
          <button
            key={b.label}
            onClick={() => { b.set(); sfx.click(); }}
            className={cn("btn btn-sm", b.on ? "" : "opacity-55")}
            style={{ ["--btn-bg" as string]: b.on ? SHAPE_META[kind].color : "#fff", ["--btn-fg" as string]: b.on ? "#fff" : "#0A3D49" }}
          >
            <Icon name={b.icon} className="h-3.5 w-3.5" /> {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DiagramKerucut({ r, t }: { r: number; t: number }) {
  const s = Math.sqrt(r * r + t * t);
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-sun-500/35 bg-sun-500/8 p-3">
      <svg viewBox="0 0 220 190" className="h-44 w-full max-w-[260px]">
        <ellipse cx="110" cy="150" rx="66" ry="17" fill="#FFF1D6" stroke="#0a2b34" strokeWidth="2.5" />
        <path d="M110 22 L44 150" stroke="#0a2b34" strokeWidth="2.5" fill="none" />
        <path d="M110 22 L176 150" stroke="#F5A623" strokeWidth="4" fill="none" strokeLinecap="round" />
        <line x1="110" y1="22" x2="110" y2="150" stroke="#EC4A35" strokeWidth="3" strokeDasharray="6 5" />
        <line x1="110" y1="150" x2="176" y2="150" stroke="#1491A8" strokeWidth="3" />
        <path d="M110 142 h8 v8" stroke="#0a2b34" strokeWidth="2" fill="none" />
        <circle cx="110" cy="22" r="4" fill="#0a2b34" />
        <text x="152" y="88" fontSize="15" fontWeight="800" fill="#B87503" fontFamily="Baloo 2">s = {fmt(s)}</text>
        <text x="60" y="92" fontSize="15" fontWeight="800" fill="#0a2b34" fontFamily="Baloo 2">selimut</text>
        <text x="114" y="92" fontSize="15" fontWeight="800" fill="#EC4A35" fontFamily="Baloo 2">t = {fmt(t)}</text>
        <text x="128" y="168" fontSize="15" fontWeight="800" fill="#1491A8" fontFamily="Baloo 2">r = {fmt(r)}</text>
      </svg>
      <p className="text-center text-[0.82rem] font-semibold text-laut-900">
        <b className="text-koral-600">t</b> = tinggi tegak (untuk volume) &nbsp;•&nbsp; <b className="text-sun-700">s</b> = garis pelukis (untuk luas selimut)
        <br />
        <span className="num">s = √(r² + t²) = √({fmt(r * r)} + {fmt(t * t)}) = {fmt(s)} cm</span>
      </p>
    </div>
  );
}

/* ------------------------------ MATERI 1: VOLUME ------------------------------ */

const LANGKAH_VOLUME = [
  { teks: "Ini wadah berbentuk kubus dengan panjang rusuk 6 cm. Kita punya banyak kubus kecil berusuk 1 cm. Berapa banyak yang muat sampai penuh?", fill: 0, layer: null as number | null },
  { teks: "Langkah 1 — Pada bagian alas, ke arah panjang dapat disusun 6 kubus kecil.", fill: 6 / 216, layer: 0 },
  { teks: "Langkah 2 — Ke arah lebar juga muat 6 kubus kecil.", fill: 12 / 216, layer: 0 },
  { teks: "Langkah 3 — Berarti satu lapisan penuh berisi 6 × 6 = 36 kubus kecil.", fill: 36 / 216, layer: 0 },
  { teks: "Langkah 4 — Tinggi wadah 6 cm, jadi kita bisa menumpuk 6 lapisan seperti ini.", fill: 1, layer: null },
  { teks: "Langkah 5 — Jumlah seluruh kubus kecil = 36 × 6 = 216 kubus satuan.", fill: 1, layer: null },
  { teks: "Kesimpulan: wadah itu dapat memuat 216 kubus satuan. Jadi VOLUME kubus tersebut = 216 cm³. Satu kubus satuan volumenya tepat 1 cm³.", fill: 1, layer: null },
];

function MateriVolume() {
  const [i, setI] = useState(0);
  const [s2, setS2] = useState(6);
  const anim = useFillAnim(3600);
  const [cycle, setCycle] = useState<number | null>(null);
  const langkah = LANGKAH_VOLUME[i];

  useEffect(() => {
    anim.set(langkah.fill);
    if (i === 4) {
      let n = 0;
      const id = setInterval(() => { setCycle(n % 6); n++; if (n > 12) { clearInterval(id); setCycle(null); } }, 700);
      return () => { clearInterval(id); setCycle(null); };
    }
    setCycle(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const perLapisan = s2 * s2;
  const total = s2 * s2 * s2;

  return (
    <div className="space-y-5">
      <RobotTalk
        title="Robot Matematika"
        mood="think"
        text="Coba bayangkan sebuah wadah kosong. Volume adalah ukuran seberapa BANYAK ruang di dalam wadah itu yang bisa diisi — misalnya diisi air, pasir, atau kubus-kubus kecil. Ayo kita isi wadah ini bersama-sama!"
      />

      <Card>
        <Kicker tone="#1491A8">Apa itu volume?</Kicker>
        <p className="mt-2 text-[1.02rem] font-semibold leading-relaxed text-laut-900">
          <b>Volume</b> adalah ukuran banyaknya ruang yang dapat <b>ditempati atau diisi</b> oleh suatu bangun ruang.
          Satuan volume selalu berpangkat tiga (kubik), misalnya <span className="num font-extrabold">cm³</span>, <span className="num font-extrabold">m³</span>, atau <span className="num font-extrabold">liter</span>.
        </p>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-laut-800/85">
          Satu <b>sentimeter kubik (1 cm³)</b> adalah volume sebuah kubus kecil yang panjang rusuknya tepat 1 cm. Kalau sebuah bangun
          dapat memuat 216 kubus kecil seperti itu sampai penuh, maka volumenya 216 cm³.
        </p>
      </Card>

      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Kicker tone="#EC4A35">Contoh konkret: wadah kubus rusuk 6 cm</Kicker>
          <span className="rounded-full bg-laut-100 px-3 py-1 text-[0.72rem] font-extrabold text-laut-700">Langkah {i + 1} dari {LANGKAH_VOLUME.length}</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <UnitCubeStage s={6} fill={anim.fill} highlightLayer={cycle} height={300} autoRotate={i === 4} />
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Button size="sm" variant="teal" onClick={() => setI((v) => Math.min(LANGKAH_VOLUME.length - 1, v + 1))} disabled={i >= LANGKAH_VOLUME.length - 1}>
                Lanjut <Icon name="right" className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>
                <Icon name="left" className="h-4 w-4" /> Kembali
              </Button>
              <Button size="sm" variant="mint" onClick={() => { setI(5); anim.isi(); }}>Isi Penuh</Button>
              <Button size="sm" variant="coral" onClick={() => { setI(0); anim.reset(); }}>Kosongkan</Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {Array.from({ length: 6 }, (_, k) => (
                <button key={k} className="btn btn-sm" style={{ ["--btn-bg" as string]: cycle === k ? "#F5A623" : "#fff" }} onClick={() => { setCycle(cycle === k ? null : k); anim.set((k + 1) / 6); sfx.click(); }}>
                  Lapisan {k + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border-2 border-laut-600/25 bg-laut-50 p-4">
              <div className="mb-1 flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-wider text-laut-600">
                <Icon name="robot" className="h-4 w-4" /> Penjelasan langkah ini
              </div>
              <p key={i} className="bubble-in text-[0.98rem] font-semibold leading-relaxed text-laut-900">{langkah.teks}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { l: "Kubus per lapisan", v: fmt(36), c: "#1491A8" },
                { l: "Banyak lapisan", v: "6", c: "#21C3A4" },
                { l: "Total kubus", v: fmt(216), c: "#EC4A35" },
              ].map((x) => (
                <div key={x.l} className="rounded-xl border-2 border-laut-800/12 bg-white p-2">
                  <div className="num text-xl font-extrabold" style={{ color: x.c }}>{x.v}</div>
                  <div className="text-[0.66rem] font-bold uppercase tracking-wide text-laut-800/60">{x.l}</div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border-2 border-dashed border-mint-500/50 bg-mint-500/10 p-3">
              <div className="num text-[0.95rem] font-extrabold text-mint-600">6 × 6 = 36 (satu lapisan)</div>
              <div className="num text-[0.95rem] font-extrabold text-mint-600">36 × 6 = 216 (enam lapisan)</div>
              <div className="mt-1 text-[0.85rem] font-bold text-laut-900">Volume = 216 cm³ ✅</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <Kicker tone="#21C3A4">Hubungan ukuran wadah dengan banyak kubus satuan</Kicker>
        <p className="mt-2 text-[0.95rem] font-semibold text-laut-900">
          Geser slider untuk mengubah panjang rusuk wadah. Perhatikan bagaimana banyak kubus satuan berubah!
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-[220px_1fr]">
          <div className="space-y-3">
            <Slider label="Panjang rusuk wadah (s)" value={s2} min={1} max={10} color="#21C3A4" onChange={(v) => { setS2(v); sfx.slide(); }} />
            <UnitCubeStage s={s2} fill={1} height={200} showOverlay={false} autoRotate />
          </div>
          <div className="overflow-hidden rounded-xl border-2 border-laut-800/12">
            <table className="w-full text-[0.86rem]">
              <thead className="bg-laut-900 text-white">
                <tr>
                  {["Rusuk (s)", "Kubus ke panjang", "Kubus ke lebar", "Kubus per lapisan", "Banyak lapisan", "Total kubus satuan"].map((h) => (
                    <th key={h} className="px-2 py-2 text-center font-display font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((n) => n === s2 || n % 2 === 0).map((n) => (
                  <tr key={n} className={cn("border-t-2 border-laut-800/8 text-center", n === s2 ? "bg-mint-500/15 font-extrabold" : "bg-white")}>
                    <td className="num px-2 py-1.5">{n} cm</td>
                    <td className="num px-2 py-1.5">{n}</td>
                    <td className="num px-2 py-1.5">{n}</td>
                    <td className="num px-2 py-1.5">{fmt(n * n)}</td>
                    <td className="num px-2 py-1.5">{n}</td>
                    <td className="num px-2 py-1.5 font-extrabold text-mint-600">{fmt(n * n * n)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-laut-900 p-4 text-white">
          <div className="num font-display text-2xl font-extrabold text-sun-500">V = s × s × s = s³</div>
          <div className="text-[0.85rem] font-semibold text-laut-100">
            s = panjang rusuk (cm) &nbsp;•&nbsp; V = volume (cm³) &nbsp;•&nbsp; contoh s = {s2} → V = {s2} × {s2} × {s2} = <b className="text-sun-500">{fmt(total)} cm³</b>
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[3, 5, 6, 10].map((n) => (
            <div key={n} className="card-lift rounded-xl border-2 border-laut-800/12 bg-white p-3">
              <div className="text-[0.72rem] font-extrabold uppercase tracking-wider text-laut-800/55">Rusuk {n} cm</div>
              <div className="num text-lg font-extrabold text-laut-900">{n} × {n} × {n} = {fmt(n ** 3)}</div>
              <div className="num text-sm font-bold text-mint-600">V = {fmt(n ** 3)} cm³</div>
            </div>
          ))}
        </div>
      </Card>
      <div className="text-sm text-laut-800/70">per lapisan {perLapisan} • total {total}</div>
      <TandaiSelesai id="konsep-volume" />
    </div>
  );
}

/* --------------------------- MATERI 2: LUAS PERMUKAAN --------------------------- */

function MateriLP() {
  const [q, setQ] = useState<number | null>(null);
  const hasil = hitung("kubus", { s: 6 });
  const anim = useFillAnim(3000);

  return (
    <div className="space-y-5">
      <RobotTalk
        title="Robot Matematika"
        mood="wave"
        text="Bayangkan kamu punya sebuah kotak hadiah. Kamu ingin membungkus SELURUH bagian luar kotak itu dengan kertas kado. Berapa luas kertas yang kamu perlukan? Nah, itulah yang disebut luas permukaan!"
      />

      <Card>
        <Kicker tone="#EC4A35">Apa itu luas permukaan?</Kicker>
        <p className="mt-2 text-[1.02rem] font-semibold leading-relaxed text-laut-900">
          <b>Luas permukaan</b> adalah jumlah luas <b>seluruh bidang sisi</b> yang membatasi bagian luar suatu bangun ruang.
          Kita TIDAK menghitung isi bangunnya, tetapi menghitung seluruh "kulit" luarnya.
        </p>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-laut-800/85">
          Satuannya selalu berpangkat dua (persegi): <span className="num font-extrabold">cm²</span>, <span className="num font-extrabold">m²</span>.
          Bukan cm³ ya!
        </p>
      </Card>

      <Card>
        <Kicker tone="#FF6B57">Animasi: kubus dibuka menjadi jaring-jaring</Kicker>
        <p className="mt-1 mb-3 text-[0.92rem] font-semibold text-laut-800/80">
          Tekan tombol <b>BONGKAR</b>. Perhatikan keenam sisi kubus terbuka, setiap sisi diberi warna berbeda, lalu kita hitung luasnya satu per satu.
        </p>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <BongkarStage kind="kubus" dims={{ s: 6 }} height={330} />
          <div className="space-y-3">
            <div className="rounded-2xl bg-laut-900 p-4 text-white">
              <div className="mb-2 font-display text-sm font-extrabold uppercase tracking-wider text-sun-500">Contoh: kubus rusuk 6 cm</div>
              <StepList steps={hasil.lpSteps} tone="#7fd2de" />
            </div>
            <div className="rounded-2xl border-2 border-sun-500/45 bg-sun-500/12 p-3 text-[0.88rem] font-semibold text-laut-900">
              <Icon name="bulb" className="mr-1 inline h-4 w-4 text-sun-700" />
              Keenam sisi itu masing-masing bernilai <b className="num">36 cm²</b>. Dijumlahkan: 36 + 36 + 36 + 36 + 36 + 36 = <b className="num">216 cm²</b>.
            </div>
            <div className="rounded-2xl border-2 border-koral-500/30 bg-koral-500/8 p-3 text-[0.88rem] font-semibold text-laut-900">
              Ingat: luas permukaan memakai satuan <b className="num">cm²</b> (persegi), sedangkan volume memakai <b className="num">cm³</b> (kubik).
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <Kicker tone="#1491A8">Perbandingan: isi vs bungkus</Kicker>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-laut-600/25 bg-laut-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display font-extrabold text-laut-700">VOLUME — diisi kubus satuan</span>
              <Button size="sm" variant="teal" onClick={() => (anim.fill >= 1 ? anim.reset() : anim.isi())}>
                {anim.fill >= 1 ? "Kosongkan" : "Isi"}
              </Button>
            </div>
            <UnitCubeStage s={4} fill={anim.fill} height={210} showOverlay={false} autoRotate={false} />
            <p className="mt-2 text-[0.86rem] font-semibold text-laut-900">
              Kita menghitung ruang DI DALAM bangun: <span className="num font-extrabold">4 × 4 × 4 = 64 kubus satuan = 64 cm³</span>.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-koral-500/30 bg-koral-500/8 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display font-extrabold text-koral-600">LUAS PERMUKAAN — dibungkus kertas</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[0.68rem] font-extrabold text-koral-600">6 sisi</span>
            </div>
            <div className="relative overflow-hidden rounded-2xl border-2 border-laut-800/12 bg-[radial-gradient(circle_at_50%_35%,#fff,#ffe7e1_75%)]" style={{ height: 210 }}>
              <Shape3D kind="kubus" dims={{ s: 4 }} autoRotate showRusuk className="absolute inset-0" />
            </div>
            <p className="mt-2 text-[0.86rem] font-semibold text-laut-900">
              Kita menghitung kertas yang menutupi bagian LUAR: <span className="num font-extrabold">6 × (4 × 4) = 96 cm²</span>.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-laut-800/12 bg-white p-3">
            <div className="mb-1 flex items-center gap-2 font-display font-extrabold text-laut-700"><Icon name="drop" className="h-4 w-4" /> Analogi Volume</div>
            <p className="text-[0.9rem] font-semibold text-laut-900">Berapa banyak <b>air</b> yang dapat ditampung, atau berapa banyak <b>benda</b> yang dapat dimasukkan ke dalam wadah.</p>
          </div>
          <div className="rounded-2xl border-2 border-laut-800/12 bg-white p-3">
            <div className="mb-1 flex items-center gap-2 font-display font-extrabold text-koral-600"><Icon name="gift" className="h-4 w-4" /> Analogi Luas Permukaan</div>
            <p className="text-[0.9rem] font-semibold text-laut-900">Berapa banyak <b>kertas</b> yang dibutuhkan untuk membungkus seluruh bagian luar benda.</p>
          </div>
        </div>
      </Card>

      <Card>
        <Kicker tone="#7A55F0">Cek pemahaman cepat</Kicker>
        <p className="mt-2 mb-3 text-[0.95rem] font-semibold text-laut-900">Sebuah kubus memiliki rusuk 6 cm. Manakah pernyataan yang benar?</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { t: "Volume = 216 cm³ dan luas permukaan = 216 cm²", benar: true, fb: "Benar! Angka kebetulan sama karena rusuknya 6 cm, tetapi satuannya berbeda: cm³ untuk volume, cm² untuk luas permukaan." },
            { t: "Volume = 216 cm² dan luas permukaan = 216 cm³", benar: false, fb: "Kurang tepat. Satuannya tertukar. Volume selalu kubik (cm³), luas permukaan selalu persegi (cm²)." },
            { t: "Volume = 36 cm³ karena 6 × 6", benar: false, fb: "Itu baru luas SATU sisi. Volume kubus = 6 × 6 × 6 = 216 cm³." },
            { t: "Luas permukaan = 6 × 36 = 216 cm²", benar: true, fb: "Benar! Ada 6 sisi dan masing-masing luasnya 36 cm²." },
          ].map((o, k) => (
            <button
              key={k}
              onClick={() => { setQ(k); o.benar ? sfx.correct() : sfx.wrong(); }}
              className={cn(
                "card-lift rounded-xl border-2 p-3 text-left text-[0.9rem] font-semibold transition",
                q === k ? (o.benar ? "border-mint-500 bg-mint-500/12" : "border-koral-500 bg-koral-500/10 shake") : "border-laut-800/12 bg-white",
              )}
            >
              {o.t}
              {q === k && <span className={cn("mt-1.5 block text-[0.82rem] font-bold", o.benar ? "text-mint-600" : "text-koral-600")}>{o.benar ? "✓ " : "✗ "}{o.fb}</span>}
            </button>
          ))}
        </div>
      </Card>
      <TandaiSelesai id="konsep-lp" />
    </div>
  );
}

/* ------------------------------ JANGAN TERTUKAR ------------------------------ */

const TABEL_BEDA = [
  { aspek: "Apa yang diukur?", vol: "Ruang bagian DALAM bangun", lp: "Seluruh bidang bagian LUAR bangun" },
  { aspek: "Alat bantu membayangkan", vol: "Kubus satuan yang disusun sampai penuh", lp: "Kertas kado / cat yang menutupi semua sisi" },
  { aspek: "Satuan", vol: "cm³, m³, liter (kubik)", lp: "cm², m² (persegi)" },
  { aspek: "Contoh sehari-hari", vol: "Isi air dalam akuarium, isi pasir dalam kotak", lp: "Kertas untuk membungkus kotak, cat untuk peti" },
  { aspek: "Kata kunci soal", vol: "diisi, dituang, ditampung, memuat", lp: "dibungkus, dicat, dilapisi, ditutup kertas" },
];

const TEBAK: { soal: string; jawab: "Volume" | "Luas Permukaan"; fb: string }[] = [
  { soal: "Sebuah kotak diisi pasir sampai penuh.", jawab: "Volume", fb: "Pasir mengisi ruang di dalam kotak, jadi yang dihitung volumenya." },
  { soal: "Sebuah kotak akan dibungkus kertas kado.", jawab: "Luas Permukaan", fb: "Kertas menutupi seluruh sisi luar kotak, jadi yang dihitung luas permukaannya." },
  { soal: "Ibu mengecat bagian luar lemari agar warnanya bagus.", jawab: "Luas Permukaan", fb: "Cat menutupi permukaan luar → luas permukaan." },
  { soal: "Berapa banyak air yang muat di dalam botol?", jawab: "Volume", fb: "Air menempati ruang di dalam botol → volume." },
  { soal: "Pabrik membuat kardus, berapa luas karton yang dibutuhkan?", jawab: "Luas Permukaan", fb: "Karton membentuk seluruh sisi luar kardus → luas permukaan." },
  { soal: "Bak mandi diisi air setinggi 40 cm.", jawab: "Volume", fb: "Air berada di dalam bak → volume (pakai tinggi airnya ya)." },
];

function JanganTertukar() {
  const [pilih, setPilih] = useState<Record<number, string>>({});
  const benar = Object.entries(pilih).filter(([k, v]) => TEBAK[Number(k)].jawab === v).length;

  return (
    <div className="space-y-5">
      <RobotTalk mood="cheer" title="Robot Matematika" text="Ini bagian paling penting! Banyak temanmu tertukar antara volume dan luas permukaan. Kalau kamu paham bedanya, kamu sudah selangkah lebih jago. Yuk kita buat tabel pembandingnya!" />

      <Card>
        <Kicker tone="#F5A623">Tabel pembanding</Kicker>
        <div className="mt-3 overflow-x-auto thin-scroll">
          <table className="w-full min-w-[560px] border-separate border-spacing-0 text-[0.88rem]">
            <thead>
              <tr>
                <th className="w-[26%] rounded-tl-xl bg-laut-900 px-3 py-2.5 text-left font-display font-extrabold text-white">Aspek</th>
                <th className="bg-laut-600 px-3 py-2.5 text-left font-display font-extrabold text-white">VOLUME</th>
                <th className="rounded-tr-xl bg-koral-600 px-3 py-2.5 text-left font-display font-extrabold text-white">LUAS PERMUKAAN</th>
              </tr>
            </thead>
            <tbody>
              {TABEL_BEDA.map((r, i) => (
                <tr key={r.aspek}>
                  <td className={cn("border-t-2 border-laut-800/10 px-3 py-2 font-extrabold text-laut-900", i % 2 ? "bg-laut-50" : "bg-white")}>{r.aspek}</td>
                  <td className={cn("border-t-2 border-laut-800/10 px-3 py-2 font-semibold text-laut-900", i % 2 ? "bg-laut-50" : "bg-white")}>{r.vol}</td>
                  <td className={cn("border-t-2 border-laut-800/10 px-3 py-2 font-semibold text-laut-900", i % 2 ? "bg-laut-50" : "bg-white")}>{r.lp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Kicker tone="#7A55F0">Tebak cepat: volume atau luas permukaan?</Kicker>
          <span className="num rounded-full bg-laut-900 px-3 py-1 text-[0.78rem] font-extrabold text-white">Benar: {benar} / {TEBAK.length}</span>
        </div>
        <div className="space-y-2">
          {TEBAK.map((t, i) => {
            const chosen = pilih[i];
            const ok = chosen === t.jawab;
            return (
              <div key={i} className={cn("rounded-xl border-2 p-3 transition", chosen ? (ok ? "border-mint-500 bg-mint-500/10" : "border-koral-500 bg-koral-500/8") : "border-laut-800/12 bg-white")}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[0.92rem] font-bold text-laut-900">{i + 1}. {t.soal}</p>
                  <div className="flex gap-1.5">
                    {(["Volume", "Luas Permukaan"] as const).map((o) => (
                      <button
                        key={o}
                        disabled={!!chosen}
                        onClick={() => { setPilih((p) => ({ ...p, [i]: o })); o === t.jawab ? sfx.correct() : sfx.wrong(); }}
                        className={cn("btn btn-sm", chosen === o && o === t.jawab && "ring-burst text-mint-600")}
                        style={{ ["--btn-bg" as string]: chosen === o ? (ok ? "#21C3A4" : "#FF6B57") : "#fff", ["--btn-fg" as string]: chosen === o ? "#fff" : "#0A3D49" }}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
                {chosen && (
                  <p className={cn("bubble-in mt-2 text-[0.85rem] font-bold", ok ? "text-mint-600" : "text-koral-600")}>
                    {ok ? "✓ Tepat! " : "✗ Belum tepat. "}
                    {t.fb}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {benar === TEBAK.length && <div className="pop-in mt-3 rounded-xl bg-mint-500/15 p-3 text-center font-display text-lg font-extrabold text-mint-600">Luar biasa! Kamu sudah tidak tertukar lagi 🎉</div>}
      </Card>
      <TandaiSelesai id="jangan-tertukar" />
    </div>
  );
}

/* ------------------------------- MATERI BANGUN ------------------------------- */

function MateriBangun({ kind }: { kind: ShapeKind }) {
  const meta = SHAPE_META[kind];
  const asal = ASAL[kind];
  const [dims, setDims] = useState<Record<string, number>>(CONTOH_DIMS[kind]);
  const { markSim } = useProgress();
  const [sKubus, setSKubus] = useState(5);

  const teksNarasi = `${meta.name}. ${meta.tagline} Banyak sisi: ${meta.facts[0].value}. Banyak rusuk: ${meta.facts[1].value}. Titik sudut: ${meta.facts[2].value}. Rumus volume: ${meta.rumusV}. Rumus luas permukaan: ${meta.rumusLP}.`;

  return (
    <div className="space-y-5">
      <RobotTalk title={`Materi ${meta.name}`} mood="happy" text={teksNarasi} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="space-y-3">
          <Kicker tone={meta.color}>Model 3D — putar dan amati</Kicker>
          <Model3D kind={kind} dims={CONTOH_DIMS[kind]} height={320} />
          <div className="grid grid-cols-3 gap-2">
            {meta.facts.map((f) => (
              <div key={f.label} className="rounded-xl border-2 p-2 text-center" style={{ borderColor: `${meta.color}55`, background: meta.soft }}>
                <div className="text-[0.66rem] font-extrabold uppercase tracking-wider text-laut-800/60">{f.label}</div>
                <div className="font-display text-[0.92rem] font-extrabold text-laut-900">{f.value}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          <Card>
            <Kicker tone={meta.color}>Unsur-unsurnya</Kicker>
            <ul className="mt-2 space-y-2">
              {meta.unsur.map((u) => (
                <li key={u.name} className="rounded-xl border-2 border-laut-800/10 bg-laut-50/70 p-2.5">
                  <div className="font-display text-[0.92rem] font-extrabold text-laut-900">{u.name}</div>
                  <div className="text-[0.84rem] font-semibold leading-relaxed text-laut-800/80">{u.desc}</div>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <Kicker tone="#F5A623">Benda di sekitarmu</Kicker>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {meta.kehidupan.map((k) => (
                <span key={k} className="rounded-full border-2 border-laut-800/12 bg-white px-2.5 py-1 text-[0.78rem] font-bold text-laut-800">{k}</span>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <Kicker tone={meta.color}>Dari mana rumusnya berasal?</Kicker>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-laut-600/25 bg-laut-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Icon name="drop" className="h-5 w-5 text-laut-600" />
              <span className="font-display font-extrabold text-laut-800">VOLUME</span>
            </div>
            <div className="mb-2 rounded-xl bg-laut-900 px-3 py-2 text-center">
              <span className="num font-display text-xl font-extrabold text-sun-500">{meta.rumusV}</span>
            </div>
            <ol className="space-y-1.5">
              {asal.v.map((t, i) => (
                <li key={i} className="flex gap-2 text-[0.9rem] font-semibold leading-relaxed text-laut-900">
                  <span className="num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-laut-500 text-[0.7rem] font-extrabold text-white">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border-2 border-koral-500/25 bg-koral-500/6 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Icon name="gift" className="h-5 w-5 text-koral-600" />
              <span className="font-display font-extrabold text-koral-600">LUAS PERMUKAAN</span>
            </div>
            <div className="mb-2 rounded-xl bg-koral-600 px-3 py-2 text-center">
              <span className="num font-display text-xl font-extrabold text-white">{meta.rumusLP}</span>
            </div>
            <ol className="space-y-1.5">
              {asal.lp.map((t, i) => (
                <li key={i} className="flex gap-2 text-[0.9rem] font-semibold leading-relaxed text-laut-900">
                  <span className="num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-koral-500 text-[0.7rem] font-extrabold text-white">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {asal.simbol.map((s) => (
            <div key={s.s} className="rounded-xl border-2 border-laut-800/12 bg-white p-2.5">
              <span className="num font-display text-lg font-extrabold" style={{ color: meta.color }}>{s.s}</span>
              <span className="ml-2 text-[0.82rem] font-semibold text-laut-900">{s.arti}</span>
            </div>
          ))}
        </div>
      </Card>

      {kind === "kubus" && (
        <Card>
          <Kicker tone="#1491A8">Bukti dengan kubus satuan</Kicker>
          <div className="mt-3 grid gap-4 md:grid-cols-[240px_1fr]">
            <div className="space-y-2">
              <Slider label="Rusuk kubus satuan besar" value={sKubus} min={1} max={8} color="#1491A8" onChange={setSKubus} />
              <div className="rounded-xl bg-laut-900 p-3 text-white">
                <div className="text-[0.7rem] font-extrabold uppercase tracking-wider text-laut-300">Hasil</div>
                <div className="num text-lg font-extrabold">{sKubus} × {sKubus} × {sKubus} = {fmt(sKubus ** 3)} cm³</div>
              </div>
            </div>
            <UnitCubeStage s={sKubus} fill={1} height={250} autoRotate />
          </div>
        </Card>
      )}

      {kind === "limas" && (
        <Card>
          <Kicker tone="#7A55F0">Bukti visual: 3 limas = 1 prisma</Kicker>
          <p className="mt-1 mb-3 text-[0.92rem] font-semibold text-laut-800/85">
            Limas dan prisma di bawah punya <b>luas alas dan tinggi yang sama</b>. Tekan tombol tuang sampai 3 kali dan lihat prisma menjadi penuh.
          </p>
          <TuangLimas a={CONTOH_DIMS.limas.a} t={CONTOH_DIMS.limas.t} />
        </Card>
      )}

      {kind === "kerucut" && (
        <Card>
          <Kicker tone="#F5A623">Bedakan tinggi (t) dan garis pelukis (s)</Kicker>
          <div className="mt-3 grid gap-4 md:grid-cols-[280px_1fr]">
            <DiagramKerucut r={CONTOH_DIMS.kerucut.r} t={CONTOH_DIMS.kerucut.t} />
            <div className="space-y-2 text-[0.92rem] font-semibold leading-relaxed text-laut-900">
              <p><b className="text-koral-600">Tinggi (t)</b> ditarik lurus dari titik puncak ke <b>pusat</b> lingkaran alas. Inilah yang dipakai menghitung volume.</p>
              <p><b className="text-sun-700">Garis pelukis (s)</b> ditarik dari titik puncak ke <b>tepi</b> lingkaran alas, menempel pada sisi lengkung. Inilah yang dipakai menghitung luas selimut.</p>
              <p>Ketiganya membentuk segitiga siku-siku, sehingga berlaku Pythagoras: <span className="num font-extrabold">s² = r² + t²</span>.</p>
              <p className="rounded-xl border-2 border-sun-500/40 bg-sun-500/10 p-2.5">
                Untuk kerucut contoh ini: r = 7 cm, t = 24 cm → s = √(49 + 576) = √625 = <b className="num">25 cm</b>.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <Kicker tone={meta.color}>Contoh perhitungan (geser ukurannya!)</Kicker>
            <p className="mt-1 text-[0.92rem] font-semibold text-laut-800/80">
              Ukuran contoh: {meta.dims.map((d) => `${d.short} = ${CONTOH_DIMS[kind][d.key]} cm`).join(", ")}. Semua angka di bawah dihitung langsung oleh aplikasi.
            </p>
          </div>
        </div>
        <HitungPanel kind={kind} dims={dims} setDims={setDims} onInteract={() => markSim("ubah-ukuran")} />
      </Card>

      <Card>
        <Kicker tone="#21C3A4">Jaring-jaring {meta.name}</Kicker>
        <p className="mt-1 mb-3 text-[0.92rem] font-semibold text-laut-800/80">
          Bongkar bangunnya menjadi bidang datar. Setiap warna adalah satu sisi. Jumlahkan semua luasnya untuk mendapat luas permukaan.
        </p>
        <BongkarStage kind={kind} dims={CONTOH_DIMS[kind]} height={340} />
        <div className="mt-3 rounded-2xl bg-laut-900 p-4 text-white">
          <div className="mb-2 font-display text-sm font-extrabold uppercase tracking-wider text-sun-500">Ringkasan contoh</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-[0.72rem] font-extrabold uppercase tracking-wider text-laut-300">Volume</div>
              <StepList steps={hitung(kind, CONTOH_DIMS[kind]).volSteps} tone="#7fd2de" />
            </div>
            <div>
              <div className="text-[0.72rem] font-extrabold uppercase tracking-wider text-laut-300">Luas Permukaan</div>
              <StepList steps={hitung(kind, CONTOH_DIMS[kind]).lpSteps} tone="#FF8A72" />
            </div>
          </div>
        </div>
      </Card>

      <TandaiSelesai id={kind} />
    </div>
  );
}

/* ---------------------------------- halaman ---------------------------------- */

export default function Materi({ fokus, go }: { fokus?: string; go: (p: string, arg?: string) => void }) {
  const { state } = useProgress();
  const [aktif, setAktif] = useState<SectionId>(
    (SECTIONS.find((s) => s.id === fokus)?.id ?? "konsep-volume") as SectionId,
  );
  const ref = useReveal([aktif]);
  const { baca, speaking, stop } = useSpeech();

  useEffect(() => {
    if (fokus && SECTIONS.some((s) => s.id === fokus)) setAktif(fokus as SectionId);
  }, [fokus]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktif]);

  const selesai = SECTIONS.filter((s) => state.materi[s.id]).length;
  const narasi: Record<string, string> = {
    "konsep-volume": "Volume adalah ukuran banyaknya ruang yang dapat diisi oleh suatu bangun ruang. Bayangkan sebuah wadah berbentuk kubus dengan rusuk enam sentimeter. Kita isi dengan kubus satuan berukuran satu sentimeter. Pada satu lapisan muat enam kali enam sama dengan tiga puluh enam kubus. Karena tingginya enam sentimeter, ada enam lapisan. Jadi seluruhnya tiga puluh enam kali enam sama dengan dua ratus enam belas kubus satuan. Volume kubus itu dua ratus enam belas sentimeter kubik.",
    "konsep-lp": "Luas permukaan adalah jumlah luas seluruh bidang sisi yang membatasi bagian luar bangun ruang. Bayangkan kamu membungkus kotak hadiah dengan kertas kado. Sebuah kubus dengan rusuk enam sentimeter memiliki enam sisi berbentuk persegi. Luas satu sisi adalah enam kali enam sama dengan tiga puluh enam sentimeter persegi. Karena ada enam sisi, luas permukaannya enam kali tiga puluh enam sama dengan dua ratus enam belas sentimeter persegi.",
    "jangan-tertukar": "Jangan sampai tertukar! Volume mengukur ruang bagian dalam dan satuannya sentimeter kubik. Luas permukaan mengukur seluruh bagian luar dan satuannya sentimeter persegi. Kalau soal bercerita tentang mengisi air atau pasir, itu volume. Kalau soal bercerita tentang membungkus, mengecat, atau melapisi, itu luas permukaan.",
  };

  return (
    <div ref={ref} className="mx-auto w-full max-w-7xl px-3 pb-24 pt-4 sm:px-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Kicker tone="#0c586a">Menu 1</Kicker>
          <h1 className="font-display text-3xl font-extrabold leading-none text-laut-900 sm:text-4xl">Materi Pembelajaran</h1>
          <p className="mt-1.5 max-w-2xl text-[0.95rem] font-semibold text-laut-800/75">
            Baca berurutan: pahami dulu artinya, lihat visualisasinya, baru kenali rumusnya.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl border-2 border-laut-800/12 bg-white px-3 py-2 text-center">
            <div className="num text-xl font-extrabold text-laut-900">{selesai}/{SECTIONS.length}</div>
            <div className="text-[0.62rem] font-extrabold uppercase tracking-wider text-laut-800/55">Bagian selesai</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => go("home")}>
            <Icon name="home" className="h-4 w-4" /> Menu Utama
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav className="no-print lg:sticky lg:top-24 lg:self-start">
          <div className="thin-scroll -mx-3 flex gap-2 overflow-x-auto px-3 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {SECTIONS.map((s) => {
              const on = s.id === aktif;
              const done = !!state.materi[s.id];
              return (
                <button
                  key={s.id}
                  onClick={() => { setAktif(s.id); sfx.click(); stop(); }}
                  className={cn(
                    "group flex min-w-[210px] shrink-0 items-center gap-2.5 rounded-2xl border-2 p-2.5 text-left transition-all lg:min-w-0",
                    on ? "border-transparent text-white shadow-[0_10px_20px_-14px_rgba(6,49,60,.9)]" : "border-laut-800/12 bg-white hover:-translate-y-0.5 hover:border-laut-600/40",
                  )}
                  style={on ? { background: s.color } : undefined}
                >
                  <span
                    className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2", on ? "border-white/40 bg-white/20 text-white" : "border-laut-800/10 text-laut-700")}
                    style={!on ? { background: `${s.color}14` } : undefined}
                  >
                    <Icon name={s.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block text-[0.6rem] font-extrabold uppercase tracking-[0.16em]", on ? "text-white/75" : "text-laut-800/50")}>{s.no}</span>
                    <span className={cn("block truncate font-display text-[0.95rem] font-extrabold", on ? "text-white" : "text-laut-900")}>{s.title}</span>
                  </span>
                  {done && <span className={cn("ml-auto shrink-0 text-xs font-extrabold", on ? "text-white" : "text-mint-600")}>✓</span>}
                </button>
              );
            })}
          </div>
          <div className="mt-3 hidden rounded-2xl border-2 border-dashed border-laut-800/18 bg-white/70 p-3 lg:block">
            <p className="text-[0.8rem] font-bold leading-relaxed text-laut-800/80">
              💡 <b>Tips:</b> jangan langsung menghafal rumus. Pahami dulu dari mana rumus itu datang, lalu coba ubah ukurannya di simulasi.
            </p>
          </div>
        </nav>

        <div className="reveal min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-laut-800/12 bg-white/80 p-3">
            <div>
              <div className="font-display text-xl font-extrabold text-laut-900">{SECTIONS.find((s) => s.id === aktif)?.title}</div>
              <div className="text-[0.82rem] font-semibold text-laut-800/65">{SECTIONS.find((s) => s.id === aktif)?.blurb}</div>
            </div>
            <div className="flex gap-2">
              {(narasi[aktif] || null) && (
                <Button size="sm" variant={speaking ? "coral" : "grape"} onClick={() => (speaking ? stop() : baca(narasi[aktif]))}>
                  <Icon name={speaking ? "pause" : "sound"} className="h-4 w-4" />
                  {speaking ? "Berhenti" : "Dengarkan"}
                </Button>
              )}
            </div>
          </div>

          {aktif === "konsep-volume" && <MateriVolume />}
          {aktif === "konsep-lp" && <MateriLP />}
          {aktif === "jangan-tertukar" && <JanganTertukar />}
          {SHAPE_ORDER.includes(aktif as ShapeKind) && <MateriBangun key={aktif} kind={aktif as ShapeKind} />}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                const idx = SECTIONS.findIndex((s) => s.id === aktif);
                if (idx > 0) setAktif(SECTIONS[idx - 1].id);
              }}
              disabled={aktif === SECTIONS[0].id}
            >
              <Icon name="left" className="h-4 w-4" /> Sebelumnya
            </Button>
            <Button
              variant="teal"
              onClick={() => {
                const idx = SECTIONS.findIndex((s) => s.id === aktif);
                if (idx < SECTIONS.length - 1) setAktif(SECTIONS[idx + 1].id);
                else go("simulasi");
              }}
            >
              {aktif === SECTIONS[SECTIONS.length - 1].id ? "Lanjut ke Simulasi" : "Bagian berikutnya"} <Icon name="right" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
