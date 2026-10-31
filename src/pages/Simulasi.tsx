import { useMemo, useState } from "react";
import type { ShapeKind } from "../lib/shapes";
import { FACE_COLORS, SHAPE_META, SHAPE_ORDER, defaultDims, fmt, hitung } from "../lib/shapes";
import { BongkarStage } from "../components/Bongkar";
import { UnitCubeStage, useFillAnim } from "../components/FillDemo";
import { HitungPanel } from "../components/HitungPanel";
import Shape3D from "../components/Shape3D";
import { NetSvg, buildNet } from "../components/Nets";
import { RobotTalk } from "../components/Robot";
import { Button, Card, Icon, Kicker, Progress, Ring, Slider } from "../components/ui";
import { useProgress } from "../lib/store";
import { sfx } from "../lib/media";
import { cn } from "../utils/cn";

type SimId = "kubus-satuan" | "bongkar" | "bedakan" | "ubah-ukuran";

const SIMS: { id: SimId; no: number; title: string; icon: string; color: string; desc: string }[] = [
  { id: "kubus-satuan", no: 1, title: "Kubus Satuan", icon: "layers", color: "#1491A8", desc: "Isi wadah dengan kubus satuan dan temukan arti volume." },
  { id: "bongkar", no: 2, title: "Bongkar Bangun Ruang", icon: "scissors", color: "#FF6B57", desc: "Uraikan bangun menjadi jaring-jaring, hitung luas tiap sisi." },
  { id: "bedakan", no: 3, title: "Volume vs Luas Permukaan", icon: "gift", color: "#21C3A4", desc: "Dua eksperimen: mengisi wadah dan membungkus permukaan." },
  { id: "ubah-ukuran", no: 4, title: "Ubah Ukuran Bangun", icon: "calc", color: "#7A55F0", desc: "Geser ukurannya, lihat volume & luas permukaan berubah." },
];

function ShapePicker({ value, onChange, sizes = "md" }: { value: ShapeKind; onChange: (k: ShapeKind) => void; sizes?: "sm" | "md" }) {
  return (
    <div className="flex flex-wrap gap-2">
      {SHAPE_ORDER.map((k) => {
        const on = k === value;
        return (
          <button
            key={k}
            onClick={() => { onChange(k); sfx.click(); }}
            className={cn("btn", sizes === "sm" ? "btn-sm" : "", on ? "" : "opacity-70")}
            style={{ ["--btn-bg" as string]: on ? SHAPE_META[k].color : "#fff", ["--btn-fg" as string]: on ? "#fff" : "#0A3D49" }}
          >
            <Icon name={SHAPE_META[k].icon} className="h-4 w-4" /> {SHAPE_META[k].name}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------ SIMULASI 1 ------------------------------ */

function SimKubusSatuan() {
  const { markSim } = useProgress();
  const [s, setS] = useState(6);
  const [spin, setSpin] = useState(false);
  const [layer, setLayer] = useState<number | null>(null);
  const anim = useFillAnim(4200);
  const perLapisan = s * s;
  const total = s * s * s;

  const ubah = (v: number) => { setS(v); anim.set(Math.min(anim.fill, 1)); setLayer(null); markSim("kubus-satuan"); sfx.slide(); };

  return (
    <div className="space-y-4">
      <RobotTalk mood="think" title="Simulasi 1" text="Geser slider untuk mengubah rusuk wadah, lalu tekan ISI WADAH. Perhatikan kubus satuan tersusun lapis demi lapis. Banyak kubus satuan itulah yang disebut VOLUME!" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div>
          <UnitCubeStage s={s} fill={anim.fill} highlightLayer={layer} autoRotate={spin} height={380} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="teal" size="sm" onClick={() => { anim.isi(); markSim("kubus-satuan"); sfx.fill(3); }}>
              <Icon name="drop" className="h-4 w-4" /> Isi Wadah
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { anim.play(); markSim("kubus-satuan"); }}>
              <Icon name="play" className="h-4 w-4" /> {anim.playing ? "Mengisi…" : "Isi Perlahan"}
            </Button>
            <Button variant="coral" size="sm" onClick={() => { anim.reset(); setLayer(null); sfx.click(); }}>
              <Icon name="trash" className="h-4 w-4" /> Kosongkan
            </Button>
            <Button variant="sun" size="sm" onClick={() => { setLayer(layer === null ? 0 : (layer + 1) % s); anim.isi(); markSim("kubus-satuan"); sfx.pop(); }}>
              <Icon name="layers" className="h-4 w-4" /> Lihat Lapisan
            </Button>
            <Button variant="mint" size="sm" onClick={() => { setSpin((v) => !v); sfx.click(); }}>
              <Icon name="refresh" className="h-4 w-4" /> {spin ? "Hentikan Putaran" : "Putar Bangun"}
            </Button>
          </div>
          {layer !== null && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[0.78rem] font-extrabold text-laut-800/70">Pilih lapisan:</span>
              {Array.from({ length: s }, (_, i) => (
                <button key={i} className="btn btn-sm" style={{ ["--btn-bg" as string]: layer === i ? "#F5A623" : "#fff" }} onClick={() => setLayer(i)}>
                  {i + 1}
                </button>
              ))}
              <button className="btn btn-sm" onClick={() => setLayer(null)}>Tampilkan semua</button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Card>
            <Slider label="Panjang rusuk wadah (s)" value={s} min={1} max={10} color="#1491A8" onChange={ubah} />
            <p className="mt-1 text-[0.76rem] font-semibold text-laut-800/65">
              {total > 1400 ? "Kubus satuan terlalu banyak, jadi ditampilkan sebagai kelompok lapisan." : `Aplikasi menampilkan ${fmt(total)} kubus satuan satu per satu.`}
            </p>
          </Card>
          <Card className="space-y-2.5">
            <Kicker tone="#1491A8">Hasil pengamatan</Kicker>
            {[
              { l: "Kubus per lapisan", v: `${s} × ${s} = ${fmt(perLapisan)}`, c: "#1491A8" },
              { l: "Banyak lapisan", v: `${s} lapisan`, c: "#21C3A4" },
              { l: "Total kubus satuan", v: `${fmt(perLapisan)} × ${s} = ${fmt(total)}`, c: "#F5A623" },
            ].map((x) => (
              <div key={x.l} className="rounded-xl border-2 border-laut-800/10 bg-laut-50/70 p-2.5">
                <div className="text-[0.66rem] font-extrabold uppercase tracking-wider text-laut-800/55">{x.l}</div>
                <div className="num text-[1.05rem] font-extrabold" style={{ color: x.c }}>{x.v}</div>
              </div>
            ))}
            <div className="rounded-xl bg-laut-900 p-3 text-white">
              <div className="text-[0.66rem] font-extrabold uppercase tracking-wider text-laut-300">Volume kubus</div>
              <div className="num font-display text-2xl font-extrabold text-sun-500">{fmt(total)} cm³</div>
              <div className="num text-[0.8rem] font-bold text-laut-100">V = {s} × {s} × {s} = {fmt(total)}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ SIMULASI 2 ------------------------------ */

function SimBongkar() {
  const { markSim } = useProgress();
  const [kind, setKind] = useState<ShapeKind>("kubus");
  const [dims, setDims] = useState<Record<string, number>>(defaultDims("kubus"));
  const hasil = hitung(kind, dims);

  const pilih = (k: ShapeKind) => { setKind(k); setDims(defaultDims(k)); markSim("bongkar"); };

  return (
    <div className="space-y-4">
      <RobotTalk mood="happy" title="Simulasi 2" text="Tekan BONGKAR untuk membuka bangun ruang menjadi jaring-jaring. Setiap sisi diberi warna berbeda dan luasnya dihitung. Jumlahkan semuanya — itulah luas permukaan!" />
      <ShapePicker value={kind} onChange={pilih} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
        <BongkarStage kind={kind} dims={dims} height={400} onOpen={() => markSim("bongkar")} />
        <div className="space-y-3">
          <Card>
            <Kicker tone={SHAPE_META[kind].color}>Ubah ukuran</Kicker>
            <div className="mt-2 space-y-2.5">
              {SHAPE_META[kind].dims.map((d) => (
                <Slider key={d.key} label={d.label} value={dims[d.key] ?? d.def} min={d.min} max={d.max} color={SHAPE_META[kind].color} onChange={(v) => { setDims({ ...dims, [d.key]: v }); markSim("bongkar"); }} />
              ))}
            </div>
          </Card>
          <Card>
            <Kicker tone="#EC4A35">Hasil</Kicker>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-xl border-2 border-laut-600/25 bg-laut-50 p-2.5">
                <div className="text-[0.64rem] font-extrabold uppercase tracking-wider text-laut-700">Volume</div>
                <div className="num text-xl font-extrabold text-laut-900">{fmt(hasil.volume)}</div>
                <div className="text-[0.72rem] font-bold text-laut-800/60">cm³</div>
              </div>
              <div className="rounded-xl border-2 border-koral-500/30 bg-koral-500/8 p-2.5">
                <div className="text-[0.64rem] font-extrabold uppercase tracking-wider text-koral-600">Luas Permukaan</div>
                <div className="num text-xl font-extrabold text-koral-600">{fmt(hasil.lp)}</div>
                <div className="text-[0.72rem] font-bold text-laut-800/60">cm²</div>
              </div>
            </div>
            <p className="mt-2 text-[0.82rem] font-semibold text-laut-800/75">{SHAPE_META[kind].rumusLP}</p>
          </Card>
          <Card>
            <Kicker tone="#0c586a">Unsur yang terlihat</Kicker>
            <ul className="mt-2 space-y-1 text-[0.85rem] font-semibold text-laut-900">
              {SHAPE_META[kind].facts.map((f) => (
                <li key={f.label} className="flex items-start gap-2">
                  <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-mint-600" strokeWidth={2.6} />
                  <span><b>{f.label}:</b> {f.value}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ SIMULASI 3 ------------------------------ */

const TANTANGAN = [
  { soal: "Mengisi akuarium dengan air sampai penuh", jawab: "Volume", fb: "Air mengisi ruang di dalam akuarium → VOLUME akuarium." },
  { soal: "Membungkus kotak hadiah dengan kertas kado", jawab: "Luas Permukaan", fb: "Kertas menutupi seluruh sisi luar kotak → LUAS PERMUKAAN." },
  { soal: "Mengisi kotak penyimpanan dengan bola-bola kecil", jawab: "Volume", fb: "Bola menempati ruang di dalam kotak → VOLUME." },
  { soal: "Mengecat bagian luar kotak kayu", jawab: "Luas Permukaan", fb: "Cat menutupi permukaan luar → LUAS PERMUKAAN." },
  { soal: "Membuat kemasan produk dari karton", jawab: "Luas Permukaan", fb: "Karton adalah bahan pembentuk seluruh sisi luar kemasan → LUAS PERMUKAAN." },
  { soal: "Mengisi wadah berbentuk kerucut dengan es krim", jawab: "Volume", fb: "Es krim mengisi ruang di dalam kerucut → VOLUME kerucut." },
  { soal: "Melapisi topi ulang tahun berbentuk kerucut dengan kertas warna", jawab: "Luas Permukaan", fb: "Kertas menempel di permukaan luar topi → LUAS PERMUKAAN (selimut)." },
  { soal: "Menentukan banyak air dalam bak mandi yang terisi setengah", jawab: "Volume", fb: "Air berada di dalam bak → VOLUME, pakai tinggi airnya." },
];

function SimBedakan() {
  const { markSim } = useProgress();
  const [p, l, t] = [8, 5, 4];
  const [tinggiAir, setTinggiAir] = useState(4);
  const [bungkus, setBungkus] = useState<boolean[]>([false, false, false, false, false, false]);
  const [pilih, setPilih] = useState<Record<number, string>>({});
  const anim = useFillAnim(2600);

  const volume = p * l * t;
  const volumeAir = p * l * tinggiAir;
  const hasil = hitung("balok", { p, l, t });
  const net = useMemo(() => buildNet("balok", { p, l, t }), []);
  const luasTerbungkus = hasil.faces.reduce((sum, f, i) => (bungkus[i] ? sum + f.area : sum), 0);
  const benar = Object.entries(pilih).filter(([k, v]) => TANTANGAN[Number(k)].jawab === v).length;

  const colors = hasil.faces.map((f, i) => (bungkus[i] ? f.color : "#e3ecee"));

  const toggle = (i: number) => {
    const next = [...bungkus];
    next[i] = !next[i];
    setBungkus(next);
    markSim("bedakan");
    next[i] ? sfx.pop() : sfx.click();
  };

  return (
    <div className="space-y-4">
      <RobotTalk mood="cheer" title="Simulasi 3" text="Ayo lakukan dua eksperimen! Eksperimen A: mengisi wadah dengan air (volume). Eksperimen B: membungkus permukaan wadah dengan kertas kado (luas permukaan). Bandingkan hasilnya berdampingan!" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center justify-between gap-2">
            <Kicker tone="#1491A8">Eksperimen A — Mengisi wadah</Kicker>
            <span className="rounded-full bg-laut-100 px-2.5 py-1 text-[0.68rem] font-extrabold text-laut-700">VOLUME</span>
          </div>
          <div className="relative overflow-hidden rounded-2xl border-2 border-laut-800/12 bg-[radial-gradient(circle_at_50%_30%,#fff,#dff1f5_75%)]" style={{ height: 260 }}>
            <Shape3D kind="balok" dims={{ p, l, t }} fill={tinggiAir / t} ghost autoRotate={false} className="absolute inset-0" />
          </div>
          <div className="mt-3 space-y-2">
            <Slider label="Tinggi air dalam wadah" value={tinggiAir} min={0} max={t} color="#1491A8" onChange={(v) => { setTinggiAir(v); markSim("bedakan"); }} />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="teal" onClick={() => { anim.isi(); setTinggiAir(t); markSim("bedakan"); }}>Isi sampai penuh</Button>
              <Button size="sm" variant="ghost" onClick={() => { anim.reset(); setTinggiAir(0); }}>Kosongkan</Button>
            </div>
          </div>
          <div className="mt-3 rounded-2xl bg-laut-900 p-3 text-white">
            <div className="text-[0.66rem] font-extrabold uppercase tracking-wider text-laut-300">Hasil pengukuran A</div>
            <div className="num font-display text-2xl font-extrabold text-sun-500">{fmt(volumeAir)} cm³</div>
            <div className="num text-[0.8rem] font-bold text-laut-100">
              = {p} × {l} × {tinggiAir} &nbsp;•&nbsp; wadah penuh = {fmt(volume)} cm³ = {fmt(volume / 1000)} liter
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between gap-2">
            <Kicker tone="#EC4A35">Eksperimen B — Membungkus permukaan</Kicker>
            <span className="rounded-full bg-koral-500/15 px-2.5 py-1 text-[0.68rem] font-extrabold text-koral-600">LUAS PERMUKAAN</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_150px]">
            <div className="relative overflow-hidden rounded-2xl border-2 border-laut-800/12 bg-[radial-gradient(circle_at_50%_30%,#fff,#ffe9e4_75%)]" style={{ height: 260 }}>
              <Shape3D kind="balok" dims={{ p, l, t }} colors={colors} autoRotate={false} className="absolute inset-0" />
            </div>
            <div className="thin-scroll max-h-[260px] overflow-y-auto rounded-xl border-2 border-laut-800/12 bg-white p-1.5">
              {hasil.faces.map((f, i) => (
                <button key={f.id + i} onClick={() => toggle(i)} className={cn("mb-1 flex w-full items-center gap-1.5 rounded-lg border-2 px-2 py-1 text-left text-[0.72rem] font-bold transition", bungkus[i] ? "border-mint-500 bg-mint-500/12 text-mint-600" : "border-laut-800/12 text-laut-800/75 hover:border-koral-500")}>
                  <span className="h-3.5 w-3.5 shrink-0 rounded" style={{ background: bungkus[i] ? f.color : "#e3ecee" }} />
                  <span className="min-w-0 flex-1 truncate">{f.label}</span>
                  <span className="num shrink-0">{bungkus[i] ? "✓" : fmt(f.area)}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="coral" onClick={() => { setBungkus([true, true, true, true, true, true]); markSim("bedakan"); sfx.correct(); }}>Bungkus semua sisi</Button>
            <Button size="sm" variant="ghost" onClick={() => setBungkus([false, false, false, false, false, false])}>Lepas kertas</Button>
          </div>
          <div className="mt-3 rounded-2xl bg-koral-600 p-3 text-white">
            <div className="text-[0.66rem] font-extrabold uppercase tracking-wider text-koral-400/70">Hasil pengukuran B</div>
            <div className="num font-display text-2xl font-extrabold">{fmt(luasTerbungkus)} cm²</div>
            <div className="text-[0.8rem] font-bold text-white/85">
              kertas terpakai dari total {fmt(hasil.lp)} cm²
            </div>
            <Progress value={(luasTerbungkus / hasil.lp) * 100} color="#fff" height={8} className="mt-2 bg-white/25!" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
          <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-laut-800/18 bg-laut-50 p-3 text-center">
            <Ring value={Math.min(100, (volumeAir / volume) * 100)} color="#1491A8" size={92} label="wadah terisi" />
            <div className="text-[0.78rem] font-bold text-laut-800/75">Eksperimen A</div>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-koral-500/30 bg-koral-500/6 p-3 text-center md:flex-row md:justify-around">
            <Ring value={(luasTerbungkus / hasil.lp) * 100} color="#EC4A35" size={92} label="permukaan tertutup" />
            <div className="text-[0.86rem] font-semibold leading-relaxed text-laut-900">
              Wadah yang <b>sama</b> memberi dua hasil yang <b>berbeda satuan</b>:<br />
              <span className="num font-extrabold text-laut-700">{fmt(volumeAir)} cm³</span> (isi) versus{" "}
              <span className="num font-extrabold text-koral-600">{fmt(luasTerbungkus)} cm²</span> (kulit luar).
            </div>
          </div>
          <div className="hidden md:block" />
          <div className="md:hidden">
            <div className="rounded-xl bg-white p-2">
              <NetSvg net={net} revealed={99} showLabel={false} />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Kicker tone="#7A55F0">Tantangan: pilih konsep yang tepat</Kicker>
          <span className="num rounded-full bg-laut-900 px-3 py-1 text-[0.78rem] font-extrabold text-white">{benar} / {TANTANGAN.length} benar</span>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {TANTANGAN.map((c, i) => {
            const chosen = pilih[i];
            const ok = chosen === c.jawab;
            return (
              <div key={i} className={cn("rounded-xl border-2 p-3 transition", chosen ? (ok ? "border-mint-500 bg-mint-500/10" : "border-koral-500 bg-koral-500/8") : "border-laut-800/12 bg-white")}>
                <p className="text-[0.9rem] font-bold text-laut-900">{i + 1}. {c.soal}</p>
                <div className="mt-2 flex gap-1.5">
                  {["Volume", "Luas Permukaan"].map((o) => (
                    <button
                      key={o}
                      disabled={!!chosen}
                      onClick={() => { setPilih((pp) => ({ ...pp, [i]: o })); markSim("bedakan"); o === c.jawab ? sfx.correct() : sfx.wrong(); }}
                      className="btn btn-sm"
                      style={{ ["--btn-bg" as string]: chosen === o ? (ok ? "#21C3A4" : "#FF6B57") : "#fff", ["--btn-fg" as string]: chosen === o ? "#fff" : "#0A3D49" }}
                    >
                      <Icon name={o === "Volume" ? "drop" : "gift"} className="h-3.5 w-3.5" /> {o}
                    </button>
                  ))}
                </div>
                {chosen && <p className={cn("bubble-in mt-2 text-[0.82rem] font-bold", ok ? "text-mint-600" : "text-koral-600")}>{ok ? "✓ Tepat! " : "✗ Belum tepat. "}{c.fb}</p>}
              </div>
            );
          })}
        </div>
        {benar === TANTANGAN.length && <div className="pop-in mt-3 rounded-xl bg-mint-500/15 p-3 text-center font-display text-lg font-extrabold text-mint-600">Sempurna! Kamu sudah bisa membedakan volume dan luas permukaan 🏆</div>}
      </Card>
    </div>
  );
}

/* ------------------------------ SIMULASI 4 ------------------------------ */

function SimUbahUkuran() {
  const { markSim } = useProgress();
  const [kind, setKind] = useState<ShapeKind>("balok");
  const [dims, setDims] = useState<Record<string, number>>(defaultDims("balok"));
  const net = buildNet(kind, dims);

  return (
    <div className="space-y-4">
      <RobotTalk mood="happy" title="Simulasi 4" text="Pilih bangun, lalu ubah ukurannya. Volume dan luas permukaan dihitung otomatis LENGKAP dengan langkah-langkahnya. Coba tebak dulu hasilnya sebelum melihat, ya!" />
      <ShapePicker value={kind} onChange={(k) => { setKind(k); setDims(defaultDims(k)); markSim("ubah-ukuran"); }} />
      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl border-2 border-laut-800/12 bg-[radial-gradient(circle_at_50%_30%,#fff,#e2f2f6_75%)]" style={{ height: 300 }}>
            <Shape3D kind={kind} dims={dims} autoRotate showRusuk className="absolute inset-0" />
          </div>
          <Card className="p-3">
            <Kicker tone="#21C3A4">Jaring-jaring</Kicker>
            <div className="mt-2 h-44">
              <NetSvg net={net} revealed={99} showLabel={false} />
            </div>
          </Card>
        </div>
        <HitungPanel kind={kind} dims={dims} setDims={(d) => { setDims(d); markSim("ubah-ukuran"); }} />
      </div>
    </div>
  );
}

/* -------------------------------- halaman -------------------------------- */

export default function Simulasi({ fokus, go }: { fokus?: string; go: (p: string, arg?: string) => void }) {
  const { state } = useProgress();
  const [aktif, setAktif] = useState<SimId>((SIMS.find((s) => s.id === fokus)?.id ?? "kubus-satuan") as SimId);
  const dicoba = SIMS.filter((s) => (state.sims[s.id] ?? 0) > 0).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-3 pb-24 pt-4 sm:px-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Kicker tone="#0c586a">Menu 2</Kicker>
          <h1 className="font-display text-3xl font-extrabold leading-none text-laut-900 sm:text-4xl">Simulasi Interaktif</h1>
          <p className="mt-1.5 max-w-2xl text-[0.95rem] font-semibold text-laut-800/75">
            Di sini kamu bisa bereksperimen sendiri. Ubah ukurannya, lihat apa yang terjadi, lalu temukan polanya.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl border-2 border-laut-800/12 bg-white px-3 py-2 text-center">
            <div className="num text-xl font-extrabold text-laut-900">{dicoba}/{SIMS.length}</div>
            <div className="text-[0.62rem] font-extrabold uppercase tracking-wider text-laut-800/55">Simulasi dicoba</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => go("home")}><Icon name="home" className="h-4 w-4" /> Menu Utama</Button>
        </div>
      </div>

      <div className="thin-scroll mb-4 -mx-3 flex gap-2 overflow-x-auto px-3 pb-1">
        {SIMS.map((s) => {
          const on = s.id === aktif;
          return (
            <button
              key={s.id}
              onClick={() => { setAktif(s.id); sfx.click(); }}
              className={cn(
                "flex min-w-[230px] shrink-0 items-start gap-2.5 rounded-2xl border-2 p-3 text-left transition-all",
                on ? "border-transparent text-white" : "border-laut-800/12 bg-white hover:-translate-y-0.5",
              )}
              style={on ? { background: s.color } : undefined}
            >
              <span className={cn("num flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-display text-base font-extrabold", on ? "bg-white/25 text-white" : "bg-laut-50 text-laut-700")}>{s.no}</span>
              <span>
                <span className={cn("block font-display text-[0.98rem] font-extrabold leading-tight", on ? "text-white" : "text-laut-900")}>{s.title}</span>
                <span className={cn("mt-0.5 block text-[0.76rem] font-semibold leading-snug", on ? "text-white/80" : "text-laut-800/65")}>{s.desc}</span>
                {(state.sims[s.id] ?? 0) > 0 && <span className={cn("mt-1 block text-[0.68rem] font-extrabold", on ? "text-white" : "text-mint-600")}>✓ sudah dicoba {state.sims[s.id]}×</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div className="pop-in" key={aktif}>
        {aktif === "kubus-satuan" && <SimKubusSatuan />}
        {aktif === "bongkar" && <SimBongkar />}
        {aktif === "bedakan" && <SimBedakan />}
        {aktif === "ubah-ukuran" && <SimUbahUkuran />}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => { const i = SIMS.findIndex((s) => s.id === aktif); if (i > 0) setAktif(SIMS[i - 1].id); }} disabled={aktif === SIMS[0].id}>
          <Icon name="left" className="h-4 w-4" /> Simulasi sebelumnya
        </Button>
        <Button variant="teal" onClick={() => { const i = SIMS.findIndex((s) => s.id === aktif); if (i < SIMS.length - 1) setAktif(SIMS[i + 1].id); else go("latihan"); }}>
          {aktif === SIMS[SIMS.length - 1].id ? "Lanjut ke Latihan Soal" : "Simulasi berikutnya"} <Icon name="right" className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-4 text-[0.78rem] font-semibold text-laut-800/55">
        Warna sisi: {FACE_COLORS.slice(0, 6).map((c, i) => <span key={i} className="mr-1 inline-block h-3 w-3 rounded align-middle" style={{ background: c }} />)} — setiap warna mewakili satu sisi bangun ruang.
      </div>
    </div>
  );
}
