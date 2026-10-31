import { useState } from "react";
import type { ShapeKind } from "../lib/shapes";
import { SHAPE_META, SHAPE_ORDER, defaultDims } from "../lib/shapes";
import Shape3D from "../components/Shape3D";
import { buildNet, NetSvg } from "../components/Nets";
import { RobotTalk, Robot } from "../components/Robot";
import { Button, Card, Icon, Kicker, Progress, useReveal } from "../components/ui";
import { MATERI_IDS, SIM_IDS, ringkasan, useProgress } from "../lib/store";
import { sfx } from "../lib/media";
import { cn } from "../utils/cn";

const TUJUAN = [
  "Mengenali berbagai bangun ruang dan unsur-unsurnya.",
  "Memahami arti volume sebagai ukuran ruang yang dapat diisi oleh suatu bangun.",
  "Memahami arti luas permukaan sebagai jumlah luas seluruh sisi bagian luar bangun ruang.",
  "Membedakan konsep volume dan luas permukaan lewat contoh dalam kehidupan sehari-hari.",
  "Menemukan sendiri hubungan antara ukuran bangun dan hasil perhitungannya.",
  "Menghitung volume dan luas permukaan kubus, balok, prisma, limas, dan kerucut.",
  "Menyelesaikan soal cerita tentang volume dan luas permukaan.",
  "Menerapkan rumus secara benar beserta satuannya.",
];

export default function Home({ go }: { go: (p: string, arg?: string) => void }) {
  const { state, setName } = useProgress();
  const r = ringkasan(state);
  const [pilih, setPilih] = useState<ShapeKind>("kubus");
  const [namaInput, setNamaInput] = useState(state.name);
  const ref = useReveal([]);

  const belumDibaca = MATERI_IDS.find((m) => !state.materi[m]);
  const belumDicoba = SIM_IDS.find((m) => !(state.sims[m] ?? 0));
  const lanjutKe = belumDibaca ? ["materi", belumDibaca] : belumDicoba ? ["simulasi", belumDicoba] : state.kuisRiwayat.length === 0 ? ["kuis"] : ["latihan"];
  const lanjutLabel = state.name || r.mastery > 0 ? "LANJUTKAN BELAJAR" : "MULAI BELAJAR";

  const meta = SHAPE_META[pilih];
  const net = buildNet(pilih, defaultDims(pilih));

  return (
    <div ref={ref} className="mx-auto w-full max-w-7xl px-3 pb-28 pt-4 sm:px-5">
      {/* ---------------------------- HERO ---------------------------- */}
      <section className="grid items-stretch gap-4 lg:grid-cols-[1.05fr_1fr]">
        <div className="reveal ink-panel relative overflow-hidden p-5 sm:p-7">
          <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-laut-400/25 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-sun-500/20 blur-2xl" />
          <div className="relative">
            <span className="chip text-sun-500"><Icon name="robot" className="h-3.5 w-3.5" /> Pembelajaran Matematika • SD Kelas 6</span>
            <h1 className="mt-3 font-display text-[2.6rem] font-extrabold leading-[0.92] text-white sm:text-[3.6rem]">
              RUANG<br />MATEMATIKA
            </h1>
            <div className="mt-2 inline-block -rotate-1 rounded-lg bg-sun-500 px-3 py-1">
              <span className="font-display text-[0.95rem] font-extrabold uppercase tracking-[0.1em] text-laut-950 sm:text-[1.1rem]">
                Petualangan Volume & Luas Permukaan
              </span>
            </div>
            <p className="mt-3 max-w-lg font-display text-[1.05rem] font-bold leading-snug text-laut-100 sm:text-[1.2rem]">
              "Kenali Bentuknya, Pahami Isinya, Hitung Luas Permukaannya!"
            </p>

            <div className="mt-4 rounded-2xl border-2 border-white/15 bg-white/8 p-3 backdrop-blur-sm">
              <RobotTalk
                mood="wave"
                size={78}
                listen
                text={`Assalamu'alaikum, Sobat Matematika! Hari ini kita akan menjelajahi dunia bangun ruang. Siap belajar sambil bereksperimen?${state.name ? ` Semangat ya, ${state.name}!` : ""}`}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input
                value={namaInput}
                onChange={(e) => setNamaInput(e.target.value)}
                onBlur={() => setName(namaInput)}
                placeholder="Tulis namamu dulu…"
                className="min-w-[180px] flex-1 rounded-xl border-2 border-white/20 bg-white/10 px-3 py-2.5 font-display text-base font-bold text-white outline-none transition placeholder:text-laut-200/50 focus:border-sun-500"
              />
              <Button size="lg" variant="sun" onClick={() => { sfx.win(); go(lanjutKe[0], lanjutKe[1]); }}>
                <Icon name="play" className="h-5 w-5" /> {lanjutLabel}
              </Button>
            </div>

            {r.mastery > 0 && (
              <div className="mt-3 rounded-xl bg-white/10 p-2.5">
                <div className="mb-1 flex items-center justify-between text-[0.74rem] font-extrabold text-laut-100">
                  <span>Penguasaan materi kamu</span><span className="num text-sun-500">{r.mastery}%</span>
                </div>
                <Progress value={r.mastery} color="#FFC24B" height={9} className="bg-white/15!" />
              </div>
            )}
          </div>
        </div>

        {/* panggung 3D */}
        <Card className="reveal relative flex flex-col overflow-hidden p-0!">
          <div className="relative h-[300px] w-full bg-[radial-gradient(circle_at_50%_35%,#ffffff,#d8eef4_65%,#bfe2ec)] sm:h-[380px]">
            <Shape3D key={pilih} kind={pilih} dims={defaultDims(pilih)} autoRotate showRusuk className="absolute inset-0" />
            <div className="pointer-events-none absolute left-3 top-3 rounded-xl border-2 border-laut-800/12 bg-white/90 px-3 py-2 backdrop-blur">
              <div className="text-[0.62rem] font-extrabold uppercase tracking-[0.16em]" style={{ color: meta.color }}>Panggung 3D</div>
              <div className="font-display text-lg font-extrabold leading-none text-laut-900">{meta.name}</div>
            </div>
            <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-xl border-2 border-laut-800/12 bg-white/90 p-2.5 backdrop-blur">
              <div className="grid grid-cols-3 gap-1 text-center">
                {meta.facts.map((f) => (
                  <div key={f.label}>
                    <div className="text-[0.6rem] font-extrabold uppercase tracking-wider text-laut-800/55">{f.label}</div>
                    <div className="font-display text-[0.82rem] font-extrabold leading-tight text-laut-900">{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 border-t-2 border-laut-800/10 bg-white p-2.5">
            {SHAPE_ORDER.map((k) => (
              <button
                key={k}
                onClick={() => { setPilih(k); sfx.pop(); }}
                className={cn("btn btn-sm flex-1", k === pilih ? "" : "opacity-65")}
                style={{ ["--btn-bg" as string]: k === pilih ? SHAPE_META[k].color : "#fff", ["--btn-fg" as string]: k === pilih ? "#fff" : "#0A3D49" }}
              >
                <Icon name={SHAPE_META[k].icon} className="h-4 w-4" />
                <span className="hidden sm:inline">{SHAPE_META[k].name}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-[1fr_auto] items-center gap-2 border-t-2 border-laut-800/10 bg-laut-50 p-2.5">
            <div className="h-24">
              <NetSvg net={net} revealed={99} showLabel={false} />
            </div>
            <Button size="sm" variant="teal" onClick={() => go("materi", pilih)}>
              Pelajari {meta.name} <Icon name="right" className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </section>

      {/* ---------------------------- MENU BENTO ---------------------------- */}
      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <Kicker tone="#0c586a">Pilih petualanganmu</Kicker>
            <h2 className="font-display text-2xl font-extrabold leading-tight text-laut-900 sm:text-3xl">Menu Belajar</h2>
          </div>
          <span className="hidden text-[0.8rem] font-bold text-laut-800/60 sm:block">Semua menu bisa dibuka kapan saja, tanpa internet pun tetap jalan 📴</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <button onClick={() => go("materi")} className="reveal card card-lift group col-span-6 overflow-hidden p-0 text-left lg:col-span-4">
            <div className="grid sm:grid-cols-[1fr_180px]">
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-laut-600 text-white transition-transform group-hover:scale-110"><Icon name="book" className="h-6 w-6" /></span>
                  <div>
                    <div className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-laut-600">Menu 1</div>
                    <div className="font-display text-xl font-extrabold leading-none text-laut-900">Materi Pembelajaran</div>
                  </div>
                </div>
                <p className="mt-2 text-[0.9rem] font-semibold leading-relaxed text-laut-800/80">
                  Arti volume & luas permukaan, asal-usul setiap rumus, jaring-jaring, contoh perhitungan langkah demi langkah,
                  plus bagian khusus <b>"Jangan Sampai Tertukar!"</b>.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["Memahami Volume", "Luas Permukaan", "Kubus", "Balok", "Prisma", "Limas", "Kerucut"].map((t) => (
                    <span key={t} className="rounded-full border-2 border-laut-800/12 bg-laut-50 px-2 py-0.5 text-[0.7rem] font-bold text-laut-800">{t}</span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Progress value={r.materiPct} color="#1491A8" height={8} />
                  <span className="num text-[0.76rem] font-extrabold text-laut-700">{r.materiDone}/{MATERI_IDS.length}</span>
                </div>
              </div>
              <div className="relative hidden bg-[radial-gradient(circle_at_50%_40%,#e6f5f8,#c6e5ee)] sm:block">
                <Shape3D kind="kubus" dims={{ s: 5 }} autoRotate ghost fill={0.45} className="absolute inset-0" />
              </div>
            </div>
          </button>

          <button onClick={() => go("simulasi")} className="reveal card card-lift group col-span-6 p-4 text-left sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint-500 text-white transition-transform group-hover:scale-110"><Icon name="flask" className="h-6 w-6" /></span>
              <div>
                <div className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-mint-600">Menu 2</div>
                <div className="font-display text-lg font-extrabold leading-none text-laut-900">Simulasi Interaktif</div>
              </div>
            </div>
            <p className="mt-2 text-[0.86rem] font-semibold leading-relaxed text-laut-800/80">
              Isi wadah dengan kubus satuan, bongkar bangun jadi jaring-jaring, dan ubah ukurannya sambil melihat hasilnya berubah.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Progress value={r.simPct} color="#21C3A4" height={8} />
              <span className="num text-[0.76rem] font-extrabold text-mint-600">{r.simDone}/{SIM_IDS.length}</span>
            </div>
          </button>

          <button onClick={() => go("latihan")} className="reveal card card-lift group p-4 text-left sm:col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sun-500 text-laut-950 transition-transform group-hover:scale-110"><Icon name="book" className="h-6 w-6" /></span>
              <div>
                <div className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-sun-700">Menu 3</div>
                <div className="font-display text-lg font-extrabold leading-none text-laut-900">Latihan Soal</div>
              </div>
            </div>
            <p className="mt-2 text-[0.84rem] font-semibold leading-relaxed text-laut-800/80">4 level: konsep, perhitungan, cerita, dan HOTS. Setiap soal ada pembahasannya.</p>
            <div className="num mt-2 text-[0.78rem] font-extrabold text-laut-700">Nilai latihan: {r.latPct}%</div>
          </button>

          <button onClick={() => go("kuis")} className="reveal group relative col-span-6 overflow-hidden rounded-[20px] border-2 border-laut-700/40 bg-laut-900 p-4 text-left transition-all hover:-translate-y-1 sm:col-span-1 lg:col-span-2">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sun-500/25 blur-xl" />
            <div className="relative flex items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sun-500 text-laut-950 transition-transform group-hover:scale-110"><Icon name="trophy" className="h-6 w-6" /></span>
              <div>
                <div className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-sun-500">Menu 4</div>
                <div className="font-display text-lg font-extrabold leading-none text-white">Kuis Tantangan</div>
              </div>
            </div>
            <p className="relative mt-2 text-[0.84rem] font-semibold leading-relaxed text-laut-100/85">
              <b>Misi Penakluk Bangun Ruang</b> — 20+ soal diacak, waktu bisa diatur, ada skor dan predikat.
            </p>
            <div className="num relative mt-2 text-[0.78rem] font-extrabold text-sun-500">Nilai kuis terbaik: {r.kuisTerbaik}</div>
          </button>

          <button onClick={() => go("progres")} className="reveal card card-lift group p-4 text-left sm:col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-koral-500 text-white transition-transform group-hover:scale-110"><Icon name="chart" className="h-6 w-6" /></span>
              <div>
                <div className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-koral-600">Menu 5</div>
                <div className="font-display text-lg font-extrabold leading-none text-laut-900">Progres Belajar</div>
              </div>
            </div>
            <p className="mt-2 text-[0.84rem] font-semibold leading-relaxed text-laut-800/80">Lihat materi yang sudah dibaca, nilai latihan & kuis, serta topik yang perlu ditingkatkan.</p>
            <div className="mt-2 flex items-center gap-2">
              <Progress value={r.mastery} color="#FF6B57" height={8} />
              <span className="num text-[0.76rem] font-extrabold text-koral-600">{r.mastery}%</span>
            </div>
          </button>

          <button onClick={() => go("alat")} className="reveal card card-lift group col-span-6 p-4 text-left sm:col-span-2 lg:col-span-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-anggur-500 text-white transition-transform group-hover:scale-110"><Icon name="calc" className="h-6 w-6" /></span>
              <div className="min-w-[180px] flex-1">
                <div className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-anggur-500">Fitur Pendukung</div>
                <div className="font-display text-lg font-extrabold leading-none text-laut-900">Alat Bantu Belajar</div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[["abc", "Kamus Matematika"], ["calc", "Kalkulator Bangun Ruang"], ["book", "Bantuan Rumus"], ["bulb", "Tips Belajar"]].map(([i, t]) => (
                  <span key={t} className="flex items-center gap-1.5 rounded-full border-2 border-laut-800/12 bg-laut-50 px-2.5 py-1 text-[0.75rem] font-bold text-laut-800">
                    <Icon name={i} className="h-3.5 w-3.5" /> {t}
                  </span>
                ))}
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* ---------------------------- TUJUAN ---------------------------- */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="reveal">
          <Kicker tone="#12987f">Tujuan pembelajaran</Kicker>
          <h3 className="mt-1 font-display text-xl font-extrabold text-laut-900">Setelah belajar di sini, kamu akan bisa:</h3>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {TUJUAN.map((t, i) => (
              <li key={i} className="flex items-start gap-2.5 rounded-xl border-2 border-laut-800/10 bg-laut-50/60 p-2.5">
                <span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-laut-700 text-sm font-extrabold text-white">{i + 1}</span>
                <span className="text-[0.87rem] font-semibold leading-relaxed text-laut-900">{t}</span>
              </li>
            ))}
          </ol>
        </Card>
        <Card className="reveal flex flex-col items-center justify-center bg-laut-50 text-center">
          <Robot mood="cheer" size={130} />
          <p className="mt-1 font-display text-lg font-extrabold text-laut-900">Belajar matematika itu menyenangkan!</p>
          <p className="mt-1 text-[0.86rem] font-semibold text-laut-800/75">
            Urutannya: lihat contoh nyata → amati visualisasi → coba simulasi → temukan pola → pahami rumus → latihan → kuis.
          </p>
          <Button className="mt-3" variant="mint" onClick={() => go("materi", "konsep-volume")}>
            <Icon name="play" className="h-4 w-4" /> Mulai dari Materi 1
          </Button>
        </Card>
      </section>

      <footer className="mt-6 rounded-2xl border-2 border-laut-800/12 bg-white/80 p-4 text-center">
        <p className="font-display text-[1.05rem] font-extrabold text-laut-900">RUANG MATEMATIKA — Petualangan Volume & Luas Permukaan</p>
        <p className="mt-0.5 text-[0.86rem] font-semibold text-laut-800/70">Created by <b>Wiyanto Abu Hanif</b></p>
      </footer>
    </div>
  );
}
