import { useCallback, useEffect, useRef, useState } from "react";
import type { Question } from "../data/questions";
import { buatSoal } from "../data/questions";
import Shape3D from "../components/Shape3D";
import { RobotTalk } from "../components/Robot";
import { Button, Card, Icon, Kicker, Progress, Ring, StepList } from "../components/ui";
import { useProgress, TOPIC_LABEL } from "../lib/store";
import type { TopicKey } from "../lib/store";
import { sfx } from "../lib/media";
import { cn } from "../utils/cn";

const LEVELS: { no: 1 | 2 | 3 | 4; nama: string; desc: string; color: string; icon: string; topik: string[] }[] = [
  { no: 1, nama: "Level 1 — Pemahaman Konsep", desc: "Mengenali bangun ruang, menghitung sisi/rusuk/titik sudut, membedakan volume dan luas permukaan, memilih satuan yang benar.", color: "#1491A8", icon: "bulb", topik: ["Bentuk bangun ruang", "Banyak sisi, rusuk, titik sudut", "Volume vs luas permukaan", "Satuan cm³ dan cm²"] },
  { no: 2, nama: "Level 2 — Perhitungan Dasar", desc: "Menghitung volume dan luas permukaan kubus, balok, prisma, limas, dan kerucut.", color: "#21C3A4", icon: "calc", topik: ["Volume kubus & balok", "Luas permukaan kubus & balok", "Volume & LP prisma, limas, kerucut"] },
  { no: 3, nama: "Level 3 — Soal Cerita", desc: "Menerapkan konsep pada situasi sehari-hari: akuarium, kado, kemasan, mengecat kotak, wadah kerucut.", color: "#F5A623", icon: "gift", topik: ["Mengisi akuarium & bak mandi", "Membungkus kado & membuat kemasan", "Mengecat bagian luar kotak"] },
  { no: 4, nama: "Level 4 — HOTS", desc: "Membandingkan bangun, menganalisis perubahan ukuran, mencari ukuran dari volume, menemukan kesalahan pengerjaan.", color: "#EC4A35", icon: "trophy", topik: ["Membandingkan dua bangun", "Perubahan volume saat ukuran berubah", "Menentukan ukuran dari volume", "Menemukan kesalahan pengerjaan"] },
];

const JUMLAH = 10;

export default function Latihan({ fokus, go }: { fokus?: string; go: (p: string, arg?: string) => void }) {
  const { recordAnswer, state } = useProgress();
  const [level, setLevel] = useState<1 | 2 | 3 | 4>((Number(fokus) as 1 | 2 | 3 | 4) || 1);
  const [soal, setSoal] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [pilihan, setPilihan] = useState<number | null>(null);
  const [benar, setBenar] = useState(0);
  const [salahList, setSalahList] = useState<Question[]>([]);
  const [selesai, setSelesai] = useState(false);
  const usedRef = useRef<Record<number, Set<string>>>({ 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set() });

  const mulai = useCallback((lv: 1 | 2 | 3 | 4) => {
    let pool = usedRef.current[lv];
    let daftar = buatSoal(lv, JUMLAH, pool);
    if (daftar.length < JUMLAH) {
      usedRef.current[lv] = new Set();
      daftar = buatSoal(lv, JUMLAH, usedRef.current[lv]);
    }
    setSoal(daftar);
    setIdx(0);
    setPilihan(null);
    setBenar(0);
    setSalahList([]);
    setSelesai(false);
    setLevel(lv);
  }, []);

  useEffect(() => { mulai(level); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const q = soal[idx];

  const jawab = (i: number) => {
    if (pilihan !== null || !q) return;
    setPilihan(i);
    const ok = i === q.answer;
    if (ok) { setBenar((b) => b + 1); sfx.correct(); } else { setSalahList((s) => [...s, q]); sfx.wrong(); }
    recordAnswer(q.topic, q.level, ok);
  };

  const lanjut = () => {
    if (idx + 1 >= soal.length) { setSelesai(true); sfx.win(); return; }
    setIdx((v) => v + 1);
    setPilihan(null);
  };

  const lvMeta = LEVELS.find((l) => l.no === level)!;
  const nilai = soal.length ? Math.round((benar / soal.length) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-3 pb-24 pt-4 sm:px-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Kicker tone="#0c586a">Menu 3</Kicker>
          <h1 className="font-display text-3xl font-extrabold leading-none text-laut-900 sm:text-4xl">Latihan Soal</h1>
          <p className="mt-1.5 max-w-2xl text-[0.95rem] font-semibold text-laut-800/75">
            Kerjakan bertahap dari Level 1 sampai Level 4. Setiap soal langsung diberi pembahasan dan langkah perhitungannya.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl border-2 border-laut-800/12 bg-white px-3 py-2 text-center">
            <div className="num text-xl font-extrabold text-laut-900">{state.latihan.correct}/{state.latihan.total}</div>
            <div className="text-[0.62rem] font-extrabold uppercase tracking-wider text-laut-800/55">Total terjawab benar</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => go("home")}><Icon name="home" className="h-4 w-4" /> Menu Utama</Button>
        </div>
      </div>

      <div className="thin-scroll mb-4 -mx-3 flex gap-2 overflow-x-auto px-3 pb-1">
        {LEVELS.map((l) => {
          const on = l.no === level;
          const stat = state.latihan.perLevel[l.no];
          return (
            <button
              key={l.no}
              onClick={() => { mulai(l.no); sfx.click(); }}
              className={cn("min-w-[215px] shrink-0 rounded-2xl border-2 p-3 text-left transition-all", on ? "border-transparent text-white" : "border-laut-800/12 bg-white hover:-translate-y-0.5")}
              style={on ? { background: l.color } : undefined}
            >
              <div className="flex items-center gap-2">
                <Icon name={l.icon} className={cn("h-5 w-5", on ? "text-white" : "text-laut-600")} />
                <span className={cn("font-display text-[1rem] font-extrabold", on ? "text-white" : "text-laut-900")}>Level {l.no}</span>
              </div>
              <div className={cn("mt-0.5 text-[0.78rem] font-bold", on ? "text-white/85" : "text-laut-800/65")}>{l.nama.split("— ")[1]}</div>
              {stat && <div className={cn("num mt-1 text-[0.7rem] font-extrabold", on ? "text-white" : "text-mint-600")}>Nilai terakhir: {Math.round((stat.correct / stat.total) * 100)}%</div>}
            </button>
          );
        })}
      </div>

      {!selesai && q && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full px-3 py-1 text-[0.72rem] font-extrabold uppercase tracking-wider text-white" style={{ background: lvMeta.color }}>
                {lvMeta.nama}
              </span>
              <span className="rounded-full border-2 border-laut-800/15 px-2.5 py-1 text-[0.7rem] font-extrabold text-laut-800/70">{TOPIC_LABEL[q.topic as TopicKey]}</span>
              <span className="num ml-auto text-[0.82rem] font-extrabold text-laut-800/70">Soal {idx + 1} / {soal.length}</span>
            </div>

            <Progress value={((idx + (pilihan !== null ? 1 : 0)) / soal.length) * 100} color={lvMeta.color} />

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <p className="font-display text-[1.18rem] font-bold leading-relaxed text-laut-900">{q.q}</p>
              {q.shape && q.dims && (
                <div className="relative h-36 w-full overflow-hidden rounded-xl border-2 border-laut-800/12 bg-[radial-gradient(circle_at_50%_35%,#fff,#e2f2f6_75%)] sm:w-44">
                  <Shape3D kind={q.shape} dims={q.dims} autoRotate showRusuk className="absolute inset-0" interactive />
                </div>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((o, i) => {
                const huruf = ["A", "B", "C", "D"][i];
                const dipilih = pilihan === i;
                const isTrue = i === q.answer;
                const show = pilihan !== null;
                return (
                  <button
                    key={i}
                    data-testid="opt"
                    onClick={() => jawab(i)}
                    disabled={show}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all",
                      !show && "border-laut-800/14 bg-white hover:-translate-y-0.5 hover:border-laut-600 hover:bg-laut-50",
                      show && isTrue && "border-mint-500 bg-mint-500/14",
                      show && dipilih && !isTrue && "border-koral-500 bg-koral-500/10 shake",
                      show && !dipilih && !isTrue && "border-laut-800/10 bg-white opacity-60",
                    )}
                  >
                    <span className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-base font-extrabold transition",
                      !show ? "bg-laut-50 text-laut-700 group-hover:bg-laut-600 group-hover:text-white" : isTrue ? "bg-mint-500 text-white" : dipilih ? "bg-koral-500 text-white" : "bg-laut-50 text-laut-800/60",
                    )}>
                      {show && isTrue ? <Icon name="check" className="h-5 w-5" strokeWidth={3} /> : show && dipilih ? <Icon name="cross" className="h-5 w-5" strokeWidth={3} /> : huruf}
                    </span>
                    <span className="num text-[0.95rem] font-bold text-laut-900">{o}</span>
                  </button>
                );
              })}
            </div>

            {pilihan !== null && (
              <div className={cn("bubble-in rounded-2xl border-2 p-4", pilihan === q.answer ? "border-mint-500/50 bg-mint-500/10" : "border-koral-500/45 bg-koral-500/8")}>
                <div className="mb-2 flex items-center gap-2">
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl text-white", pilihan === q.answer ? "bg-mint-500" : "bg-koral-500")}>
                    <Icon name={pilihan === q.answer ? "check" : "cross"} className="h-5 w-5" strokeWidth={3} />
                  </span>
                  <div>
                    <div className={cn("font-display text-lg font-extrabold", pilihan === q.answer ? "text-mint-600" : "text-koral-600")}>
                      {pilihan === q.answer ? "Benar! Hebat!" : "Belum tepat"}
                    </div>
                    <div className="text-[0.78rem] font-bold text-laut-800/70">
                      {pilihan === q.answer ? "Jawabanmu sudah tepat. Sekarang lihat langkahnya." : `Jawaban yang benar: ${["A", "B", "C", "D"][q.answer]}. ${q.options[q.answer]}`}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white/80 p-3">
                  <div className="mb-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-laut-600">Pembahasan & langkah perhitungan</div>
                  <StepList steps={q.steps} tone={lvMeta.color} />
                  {q.tip && (
                    <div className="mt-2 flex gap-2 rounded-xl border-2 border-sun-500/45 bg-sun-500/12 p-2.5">
                      <Icon name="bulb" className="mt-0.5 h-4 w-4 shrink-0 text-sun-700" />
                      <span className="text-[0.85rem] font-semibold text-laut-900">{q.tip}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="teal" onClick={lanjut}>
                    {idx + 1 >= soal.length ? "Lihat Hasil" : "Soal Berikutnya"} <Icon name="right" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <div className="space-y-3">
            <Card>
              <Kicker tone={lvMeta.color}>Kemajuan latihan</Kicker>
              <div className="mt-3 flex items-center gap-3">
                <Ring value={((idx + (pilihan !== null ? 1 : 0)) / soal.length) * 100} color={lvMeta.color} size={86} label="progres" />
                <div className="space-y-1 text-[0.85rem] font-bold">
                  <div className="text-mint-600">✓ Benar: {benar}</div>
                  <div className="text-koral-600">✗ Salah: {salahList.length}</div>
                  <div className="text-laut-800/70">Sisa: {soal.length - idx - (pilihan !== null ? 1 : 0)}</div>
                </div>
              </div>
            </Card>
            <Card>
              <Kicker tone="#0c586a">Yang dilatih di level ini</Kicker>
              <ul className="mt-2 space-y-1.5">
                {lvMeta.topik.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-[0.85rem] font-semibold text-laut-900">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-mint-600" strokeWidth={2.6} />{t}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <Kicker tone="#7A55F0">Petunjuk</Kicker>
              <p className="mt-2 text-[0.85rem] font-semibold leading-relaxed text-laut-800/80">
                Baca soal pelan-pelan. Garis bawahi kata kuncinya: <b>diisi/ditampung</b> berarti volume, <b>dibungkus/dicat</b> berarti luas permukaan.
                Setelah menjawab, selalu baca pembahasannya walaupun jawabanmu benar.
              </p>
              <Button className="mt-3" variant="ghost" size="sm" onClick={() => mulai(level)}>
                <Icon name="refresh" className="h-4 w-4" /> Acak soal baru
              </Button>
            </Card>
          </div>
        </div>
      )}

      {selesai && (
        <Card className="pop-in space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-5 rounded-2xl bg-laut-900 p-5 text-white">
            <Ring value={nilai} color={nilai >= 75 ? "#4edbc0" : nilai >= 60 ? "#FFC24B" : "#FF8A72"} size={120} label="nilai" />
            <div className="text-center">
              <div className="font-display text-3xl font-extrabold text-sun-500">{benar} benar dari {soal.length}</div>
              <div className="text-[0.95rem] font-semibold text-laut-100">
                {nilai >= 80 ? "Kamu sudah paham materi ini. Lanjut ke level berikutnya!" : nilai >= 60 ? "Bagus! Ulangi beberapa soal yang masih salah ya." : "Jangan menyerah, baca lagi materinya lalu coba ulang."}
              </div>
            </div>
          </div>

          {salahList.length > 0 && (
            <div>
              <Kicker tone="#EC4A35">Soal yang perlu kamu pelajari lagi</Kicker>
              <div className="mt-2 space-y-2">
                {salahList.map((s, i) => (
                  <div key={i} className="rounded-xl border-2 border-koral-500/25 bg-koral-500/6 p-3">
                    <p className="text-[0.92rem] font-bold text-laut-900">{s.q}</p>
                    <p className="num mt-1 text-[0.86rem] font-extrabold text-mint-600">Jawaban benar: {s.options[s.answer]}</p>
                    <div className="mt-1.5">
                      <StepList steps={s.steps} tone="#EC4A35" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="coral" onClick={() => mulai(level)}><Icon name="refresh" className="h-4 w-4" /> Ulangi Level {level}</Button>
            {level < 4 && <Button variant="teal" onClick={() => mulai((level + 1) as 1 | 2 | 3 | 4)}>Lanjut Level {level + 1} <Icon name="right" className="h-4 w-4" /></Button>}
            <Button variant="grape" onClick={() => go("kuis")}><Icon name="trophy" className="h-4 w-4" /> Ikut Kuis Tantangan</Button>
            <Button variant="ghost" onClick={() => go("materi")}><Icon name="book" className="h-4 w-4" /> Baca Materi Lagi</Button>
          </div>
        </Card>
      )}

      {!selesai && !q && (
        <Card>
          <RobotTalk mood="think" text="Menyiapkan soal baru untukmu…" />
          <Button className="mt-3" variant="teal" onClick={() => mulai(level)}>Mulai Latihan</Button>
        </Card>
      )}
    </div>
  );
}
