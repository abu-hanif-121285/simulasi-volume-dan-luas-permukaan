import { useState } from "react";
import { MATERI_IDS, SIM_IDS, TOPIC_LABEL, ringkasan, useProgress } from "../lib/store";
import type { TopicKey } from "../lib/store";
import { Button, Card, Icon, Kicker, Modal, Progress, Ring } from "../components/ui";
import { Robot } from "../components/Robot";
import { sfx } from "../lib/media";
import { cn } from "../utils/cn";

const MATERI_LABEL: Record<string, { t: string; color: string }> = {
  "konsep-volume": { t: "Materi 1 — Memahami Volume", color: "#1491A8" },
  "konsep-lp": { t: "Materi 2 — Memahami Luas Permukaan", color: "#FF6B57" },
  "jangan-tertukar": { t: "Penting — Jangan Sampai Tertukar!", color: "#F5A623" },
  kubus: { t: "Bangun Ruang — Kubus", color: "#1491A8" },
  balok: { t: "Bangun Ruang — Balok", color: "#FF8A72" },
  prisma: { t: "Bangun Ruang — Prisma Segitiga", color: "#21C3A4" },
  limas: { t: "Bangun Ruang — Limas Segiempat", color: "#7A55F0" },
  kerucut: { t: "Bangun Ruang — Kerucut", color: "#F5A623" },
};

const SIM_LABEL: Record<string, string> = {
  "kubus-satuan": "Simulasi 1 — Kubus Satuan",
  bongkar: "Simulasi 2 — Bongkar Bangun Ruang",
  bedakan: "Simulasi 3 — Volume vs Luas Permukaan",
  "ubah-ukuran": "Simulasi 4 — Ubah Ukuran Bangun",
};

const LEVEL_LABEL: Record<number, string> = {
  1: "Level 1 — Pemahaman Konsep",
  2: "Level 2 — Perhitungan Dasar",
  3: "Level 3 — Soal Cerita",
  4: "Level 4 — HOTS",
};

export default function Progres({ go }: { go: (p: string, arg?: string) => void }) {
  const { state, setName, reset } = useProgress();
  const r = ringkasan(state);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [namaEdit, setNamaEdit] = useState(state.name);

  const topik = Object.keys(state.topicStats) as TopicKey[];
  const totalJawab = topik.reduce((s, t) => s + state.topicStats[t].t, 0);
  const totalBenar = topik.reduce((s, t) => s + state.topicStats[t].c, 0);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 pb-24 pt-4 sm:px-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 no-print">
        <div>
          <Kicker tone="#0c586a">Menu 5</Kicker>
          <h1 className="font-display text-3xl font-extrabold leading-none text-laut-900 sm:text-4xl">Progres Belajar</h1>
          <p className="mt-1.5 max-w-2xl text-[0.95rem] font-semibold text-laut-800/75">
            Semua perkembanganmu tersimpan otomatis di perangkat ini (LocalStorage), jadi bisa dilanjutkan lain waktu.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <Button variant="ghost" size="sm" onClick={() => go("home")}><Icon name="home" className="h-4 w-4" /> Menu Utama</Button>
          <Button variant="teal" size="sm" onClick={() => window.print()}><Icon name="print" className="h-4 w-4" /> Cetak Hasil</Button>
          <Button variant="coral" size="sm" onClick={() => { setKonfirmasi(true); sfx.click(); }}><Icon name="trash" className="h-4 w-4" /> Hapus Progres</Button>
        </div>
      </div>

      <div className="print-area">
        {/* kartu identitas */}
        <div className="ink-panel mb-4 flex flex-wrap items-center gap-4 p-4 sm:p-5">
          <Robot mood={r.mastery >= 70 ? "cheer" : "happy"} size={92} />
          <div className="min-w-0 flex-1">
            <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-sun-500">Laporan Hasil Belajar</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <input
                value={namaEdit}
                onChange={(e) => setNamaEdit(e.target.value)}
                onBlur={() => setName(namaEdit)}
                placeholder="Nama siswa…"
                className="min-w-[180px] flex-1 rounded-xl border-2 border-white/20 bg-white/10 px-3 py-1.5 font-display text-xl font-extrabold text-white outline-none transition placeholder:text-laut-200/50 focus:border-sun-500"
              />
              <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[0.72rem] font-bold text-laut-100">
                Kelas 6 SD • Volume & Luas Permukaan
              </span>
            </div>
            <div className="mt-2 text-[0.82rem] font-semibold text-laut-100/75">
              Terakhir belajar: {new Date(state.terakhir).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center">
            <Ring value={r.mastery} color="#FFC24B" size={112} label="penguasaan" />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <Kicker tone="#1491A8">Rincian penguasaan</Kicker>
            <div className="mt-3 space-y-3">
              {[
                { l: "Materi yang dibaca", v: r.materiPct, ket: `${r.materiDone} dari ${MATERI_IDS.length} bagian`, c: "#1491A8", bobot: "25%" },
                { l: "Simulasi yang dicoba", v: r.simPct, ket: `${r.simDone} dari ${SIM_IDS.length} simulasi`, c: "#21C3A4", bobot: "15%" },
                { l: "Ketepatan latihan soal", v: r.latPct, ket: `${state.latihan.correct} benar dari ${state.latihan.total} soal`, c: "#F5A623", bobot: "30%" },
                { l: "Nilai kuis terbaik", v: r.kuisTerbaik, ket: state.kuisRiwayat.length ? `${state.kuisRiwayat.length} sesi kuis` : "belum ada sesi kuis", c: "#EC4A35", bobot: "30%" },
              ].map((x) => (
                <div key={x.l}>
                  <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-display text-[0.95rem] font-extrabold text-laut-900">{x.l}</span>
                    <span className="text-[0.76rem] font-bold text-laut-800/65">{x.ket} • bobot {x.bobot}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={x.v} color={x.c} height={14} />
                    <span className="num w-12 shrink-0 text-right font-display text-sm font-extrabold" style={{ color: x.c }}>{x.v}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Kicker tone="#7A55F0">Penguasaan per topik ({totalBenar}/{totalJawab} jawaban benar)</Kicker>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {topik.map((t) => {
                  const st = state.topicStats[t];
                  const pct = st.t ? Math.round((st.c / st.t) * 100) : 0;
                  const lemah = st.t >= 3 && pct < 70;
                  const color = st.t === 0 ? "#94b3bb" : pct >= 80 ? "#21C3A4" : pct >= 60 ? "#F5A623" : "#EC4A35";
                  return (
                    <div key={t} className={cn("rounded-xl border-2 p-2.5", lemah ? "border-koral-500/40 bg-koral-500/6" : "border-laut-800/10 bg-white")}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[0.82rem] font-extrabold text-laut-900">{TOPIC_LABEL[t]}</span>
                        <span className="num text-[0.78rem] font-extrabold" style={{ color }}>{st.t ? `${pct}%` : "—"}</span>
                      </div>
                      <Progress value={pct} color={color} height={8} className="mt-1.5" />
                      <div className="mt-1 text-[0.7rem] font-bold text-laut-800/60">{st.t ? `${st.c} benar dari ${st.t} soal` : "belum ada soal di topik ini"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card>
              <Kicker tone="#21C3A4">Materi</Kicker>
              <ul className="mt-2 space-y-1.5">
                {MATERI_IDS.map((m) => {
                  const done = !!state.materi[m];
                  return (
                    <li key={m}>
                      <button onClick={() => go("materi", m)} className="flex w-full items-center gap-2 rounded-lg border-2 border-laut-800/10 bg-white px-2 py-1.5 text-left transition hover:-translate-y-0.5 hover:border-laut-500">
                        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white", done ? "bg-mint-500" : "bg-laut-900/15 text-laut-900/40")}>
                          <Icon name={done ? "check" : "book"} className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[0.8rem] font-bold text-laut-900">{MATERI_LABEL[m].t}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <Button className="mt-2 w-full" variant="ghost" size="sm" onClick={() => go("materi")}><Icon name="refresh" className="h-4 w-4" /> Ulangi Materi</Button>
            </Card>

            <Card>
              <Kicker tone="#F5A623">Simulasi</Kicker>
              <ul className="mt-2 space-y-1.5">
                {SIM_IDS.map((s) => {
                  const n = state.sims[s] ?? 0;
                  return (
                    <li key={s}>
                      <button onClick={() => go("simulasi", s)} className="flex w-full items-center gap-2 rounded-lg border-2 border-laut-800/10 bg-white px-2 py-1.5 text-left transition hover:-translate-y-0.5 hover:border-laut-500">
                        <span className={cn("num flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[0.7rem] font-extrabold", n > 0 ? "bg-sun-500 text-white" : "bg-laut-900/12 text-laut-900/50")}>{n}</span>
                        <span className="min-w-0 flex-1 truncate text-[0.8rem] font-bold text-laut-900">{SIM_LABEL[s]}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card>
              <Kicker tone="#EC4A35">Latihan per level</Kicker>
              {Object.keys(state.latihan.perLevel).length === 0 ? (
                <p className="mt-2 text-[0.82rem] font-semibold text-laut-800/65">Belum ada latihan yang dikerjakan.</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {[1, 2, 3, 4].filter((l) => state.latihan.perLevel[l]).map((l) => {
                    const st = state.latihan.perLevel[l];
                    const pct = Math.round((st.correct / st.total) * 100);
                    return (
                      <li key={l} className="rounded-lg border-2 border-laut-800/10 bg-white p-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[0.8rem] font-extrabold text-laut-900">{LEVEL_LABEL[l]}</span>
                          <span className="num text-[0.8rem] font-extrabold text-laut-700">{pct}%</span>
                        </div>
                        <Progress value={pct} color={pct >= 75 ? "#21C3A4" : pct >= 60 ? "#F5A623" : "#EC4A35"} height={7} className="mt-1" />
                        <div className="num mt-0.5 text-[0.68rem] font-bold text-laut-800/60">{st.correct}/{st.total} soal benar</div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Button className="mt-2 w-full" variant="ghost" size="sm" onClick={() => go("latihan")}><Icon name="book" className="h-4 w-4" /> Latihan Lagi</Button>
            </Card>
          </div>
        </div>

        <Card className="mt-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <Kicker tone="#0c586a">Riwayat Kuis Tantangan</Kicker>
            <Button variant="grape" size="sm" onClick={() => go("kuis")}><Icon name="trophy" className="h-4 w-4" /> Ikut Kuis Lagi</Button>
          </div>
          {state.kuisRiwayat.length === 0 ? (
            <p className="text-[0.88rem] font-semibold text-laut-800/70">Belum ada sesi kuis. Ayo coba <b>Misi Penakluk Bangun Ruang</b>!</p>
          ) : (
            <div className="overflow-x-auto thin-scroll">
              <table className="w-full min-w-[620px] text-[0.85rem]">
                <thead className="bg-laut-900 text-white">
                  <tr>{["Tanggal", "Nama", "Benar", "Salah", "Kosong", "Nilai", "Predikat", "Perlu dilatih"].map((h) => <th key={h} className="px-3 py-2 text-left font-display font-bold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {state.kuisRiwayat.map((k) => (
                    <tr key={k.id} className="border-t-2 border-laut-800/8 bg-white">
                      <td className="px-3 py-2 font-semibold text-laut-800/75">{new Date(k.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                      <td className="px-3 py-2 font-extrabold text-laut-900">{k.nama}</td>
                      <td className="num px-3 py-2 text-mint-600">{k.benar}</td>
                      <td className="num px-3 py-2 text-koral-600">{k.salah}</td>
                      <td className="num px-3 py-2 text-laut-800/60">{k.kosong}</td>
                      <td className="num px-3 py-2 font-extrabold text-laut-900">{k.nilai}</td>
                      <td className="px-3 py-2 font-bold text-laut-800/80">{k.predikat}</td>
                      <td className="px-3 py-2 text-[0.78rem] font-semibold text-laut-800/70">{k.lemah.length ? k.lemah.map((t) => TOPIC_LABEL[t]).join(", ") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="mt-4">
          <Kicker tone="#12987f">Rekomendasi langkah berikutnya</Kicker>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {(r.lemah.length ? r.lemah : (["volume", "luas"] as TopicKey[])).map((t) => (
              <li key={t} className="flex items-start gap-2 rounded-xl border-2 border-laut-800/10 bg-laut-50/70 p-2.5">
                <Icon name="bulb" className="mt-0.5 h-4 w-4 shrink-0 text-sun-700" />
                <span className="text-[0.85rem] font-semibold text-laut-900">
                  Tingkatkan topik <b>{TOPIC_LABEL[t]}</b> — baca materinya, coba simulasinya, lalu kerjakan latihan level 2.
                </span>
              </li>
            ))}
            {r.materiPct < 100 && (
              <li className="flex items-start gap-2 rounded-xl border-2 border-laut-800/10 bg-laut-50/70 p-2.5">
                <Icon name="book" className="mt-0.5 h-4 w-4 shrink-0 text-laut-600" />
                <span className="text-[0.85rem] font-semibold text-laut-900">Masih ada {MATERI_IDS.length - r.materiDone} bagian materi yang belum dibaca. Selesaikan semuanya agar penguasaanmu naik.</span>
              </li>
            )}
            {r.simPct < 100 && (
              <li className="flex items-start gap-2 rounded-xl border-2 border-laut-800/10 bg-laut-50/70 p-2.5">
                <Icon name="flask" className="mt-0.5 h-4 w-4 shrink-0 text-mint-600" />
                <span className="text-[0.85rem] font-semibold text-laut-900">Coba {SIM_IDS.length - r.simDone} simulasi yang belum pernah dibuka — eksperimen membuat rumus lebih mudah diingat.</span>
              </li>
            )}
          </ul>
        </Card>

        <p className="mt-4 text-center text-[0.78rem] font-semibold text-laut-800/55">
          RUANG MATEMATIKA — Petualangan Volume & Luas Permukaan • Created by Wiyanto Abu Hanif
        </p>
      </div>

      <Modal open={konfirmasi} onClose={() => setKonfirmasi(false)} title="Hapus seluruh progres belajar?">
        <p className="text-[0.92rem] font-semibold text-laut-900">
          Semua data materi yang sudah dibaca, nilai latihan, dan riwayat kuis akan dihapus permanen dari perangkat ini.
          Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setKonfirmasi(false)}>Batal</Button>
          <Button variant="coral" onClick={() => { reset(); setKonfirmasi(false); sfx.wrong(); }}>
            <Icon name="trash" className="h-4 w-4" /> Ya, hapus semua
          </Button>
        </div>
      </Modal>
    </div>
  );
}
