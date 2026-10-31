import { useEffect, useMemo, useRef, useState } from "react";
import type { Question } from "../data/questions";
import { buatSoalKuis } from "../data/questions";
import Shape3D from "../components/Shape3D";
import { Robot } from "../components/Robot";
import { Button, Card, Icon, Kicker, Progress, Ring, StepList } from "../components/ui";
import { useProgress, predikat, TOPIC_LABEL } from "../lib/store";
import type { TopicKey } from "../lib/store";
import { sfx } from "../lib/media";
import { cn } from "../utils/cn";

const KONFETI = ["#FFC24B", "#FF6B57", "#21C3A4", "#1491A8", "#7A55F0", "#F26DA0"];

function Confetti({ n = 40 }: { n?: number }) {
  const bits = useMemo(
    () => Array.from({ length: n }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      dur: 1.6 + Math.random() * 1.8,
      color: KONFETI[i % KONFETI.length],
      rot: Math.random() * 360,
    })),
    [n],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {bits.map((b, i) => (
        <span key={i} className="confetti-bit" style={{ left: `${b.left}%`, background: b.color, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s`, transform: `rotate(${b.rot}deg)` }} />
      ))}
    </div>
  );
}

export default function Kuis({ go }: { go: (p: string, arg?: string) => void }) {
  const { state, addKuis, recordAnswer } = useProgress();
  const [tahap, setTahap] = useState<"setup" | "main" | "hasil">("setup");
  const [nama, setNama] = useState(state.name);
  const [jumlah, setJumlah] = useState(20);
  const [menit, setMenit] = useState(15);
  const [soal, setSoal] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [pilihan, setPilihan] = useState<number | null>(null);
  const [benar, setBenar] = useState(0);
  const [kosong, setKosong] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakMax, setStreakMax] = useState(0);
  const [sisa, setSisa] = useState(0);
  const [topikSalah, setTopikSalah] = useState<TopicKey[]>([]);
  const [rayakan, setRayakan] = useState(false);
  const startTime = useRef(0);
  const timerRef = useRef<number | null>(null);

  const q = soal[idx];
  const total = soal.length;
  const salah = total - benar - kosong;
  const nilai = total ? Math.round((benar / total) * 100) : 0;

  const mulai = () => {
    const daftar = buatSoalKuis(jumlah);
    setSoal(daftar);
    setIdx(0); setPilihan(null); setBenar(0); setKosong(0); setStreak(0); setStreakMax(0); setTopikSalah([]);
    setSisa(menit > 0 ? menit * 60 : 0);
    startTime.current = Date.now();
    setTahap("main");
    sfx.win();
  };

  useEffect(() => {
    if (tahap !== "main" || menit <= 0) return;
    timerRef.current = window.setInterval(() => {
      setSisa((s) => {
        if (s <= 1) {
          window.clearInterval(timerRef.current!);
          setTahap("hasil");
          return 0;
        }
        if (s <= 6) sfx.tick();
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [tahap, menit]);

  useEffect(() => { if (rayakan) { const t = setTimeout(() => setRayakan(false), 1500); return () => clearTimeout(t); } }, [rayakan]);

  const jawab = (i: number) => {
    if (pilihan !== null || !q) return;
    setPilihan(i);
    const ok = i === q.answer;
    if (ok) {
      setBenar((b) => b + 1);
      setStreak((s) => { const n = s + 1; setStreakMax((m) => Math.max(m, n)); return n; });
      setRayakan(true);
      sfx.correct();
    } else {
      setStreak(0);
      setTopikSalah((t) => [...t, q.topic]);
      sfx.wrong();
    }
    recordAnswer(q.topic, 2, ok);
  };

  const lewati = () => {
    if (pilihan !== null || !q) return;
    setPilihan(-1);
    setKosong((k) => k + 1);
    setStreak(0);
    setTopikSalah((t) => [...t, q.topic]);
    sfx.click();
  };

  const lanjut = () => {
    if (idx + 1 >= total) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      setTahap("hasil");
      sfx.win();
      return;
    }
    setIdx((v) => v + 1);
    setPilihan(null);
  };

  const simpan = () => {
    const lemah = Array.from(new Set(topikSalah.filter((t, _i, arr) => arr.filter((x) => x === t).length >= 2)));
    addKuis({
      nama: nama || "Siswa",
      benar, salah, kosong,
      nilai,
      durasiDetik: Math.round((Date.now() - startTime.current) / 1000),
      predikat: predikat(nilai).label,
      lemah,
    });
  };

  useEffect(() => { if (tahap === "hasil" && total > 0) simpan(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [tahap]);

  /* -------------------------------- SETUP -------------------------------- */
  if (tahap === "setup") {
    return (
      <div className="mx-auto w-full max-w-5xl px-3 pb-24 pt-4 sm:px-5">
        <div className="ink-panel relative overflow-hidden p-5 sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-sun-500/20 blur-2xl" />
          <div className="relative grid items-center gap-5 md:grid-cols-[1fr_auto]">
            <div>
              <span className="chip text-sun-500"><Icon name="trophy" className="h-3.5 w-3.5" /> Menu 4 — Kuis Tantangan</span>
              <h1 className="mt-3 font-display text-3xl font-extrabold leading-none text-white sm:text-5xl">
                MISI PENAKLUK<br /><span className="text-sun-500">BANGUN RUANG</span>
              </h1>
              <p className="mt-3 max-w-xl text-[0.98rem] font-semibold leading-relaxed text-laut-100/85">
                Buktikan kamu sudah menguasai volume dan luas permukaan! Soal diacak, pilihan jawaban diacak,
                dan waktu bisa kamu atur sendiri. Komposisi soal: 20% konsep, 30% volume, 30% luas permukaan, 20% cerita & HOTS.
              </p>
            </div>
            <Robot mood="cheer" size={150} />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="space-y-4">
            <div>
              <label className="mb-1 block font-display text-sm font-extrabold text-laut-900" htmlFor="namaKuis">Nama siswa</label>
              <input
                id="namaKuis"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Tulis namamu di sini…"
                className="w-full rounded-xl border-2 border-laut-800/15 bg-laut-50/60 px-3 py-2.5 font-display text-lg font-bold text-laut-900 outline-none transition focus:border-laut-500 focus:bg-white"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 font-display text-sm font-extrabold text-laut-900">Banyak soal</div>
                <div className="flex flex-wrap gap-1.5">
                  {[10, 20, 25, 30].map((n) => (
                    <button key={n} onClick={() => { setJumlah(n); sfx.click(); }} className="btn btn-sm" style={{ ["--btn-bg" as string]: jumlah === n ? "#1491A8" : "#fff", ["--btn-fg" as string]: jumlah === n ? "#fff" : "#0A3D49" }}>{n} soal</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1.5 font-display text-sm font-extrabold text-laut-900">Durasi pengerjaan</div>
                <div className="flex flex-wrap gap-1.5">
                  {[10, 15, 20, 30, 0].map((n) => (
                    <button key={n} onClick={() => { setMenit(n); sfx.click(); }} className="btn btn-sm" style={{ ["--btn-bg" as string]: menit === n ? "#FF6B57" : "#fff", ["--btn-fg" as string]: menit === n ? "#fff" : "#0A3D49" }}>
                      {n === 0 ? "Tanpa batas" : `${n} menit`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button size="lg" variant="sun" className="w-full" onClick={mulai}>
              <Icon name="play" className="h-5 w-5" /> MULAI MISI
            </Button>
            <p className="text-center text-[0.78rem] font-semibold text-laut-800/60">
              Komposisi: {Math.max(3, Math.round(jumlah * 0.2))} konsep • {Math.round(jumlah * 0.3)} volume • {Math.round(jumlah * 0.3)} luas permukaan • {jumlah - Math.max(3, Math.round(jumlah * 0.2)) - 2 * Math.round(jumlah * 0.3)} cerita/HOTS
            </p>
          </Card>
          <Card>
            <Kicker tone="#7A55F0">Riwayat kuis tersimpan</Kicker>
            {state.kuisRiwayat.length === 0 ? (
              <p className="mt-2 text-[0.86rem] font-semibold text-laut-800/70">Belum ada riwayat. Selesaikan satu misi dan nilaimu tersimpan di sini (LocalStorage).</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {state.kuisRiwayat.slice(0, 5).map((k) => (
                  <li key={k.id} className="flex items-center gap-2 rounded-xl border-2 border-laut-800/10 bg-laut-50/60 p-2">
                    <span className="num flex h-9 w-9 items-center justify-center rounded-lg bg-laut-900 text-sm font-extrabold text-sun-500">{k.nilai}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-sm font-extrabold text-laut-900">{k.nama}</span>
                      <span className="block text-[0.7rem] font-bold text-laut-800/60">{new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} • {k.predikat}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Button className="mt-3 w-full" variant="ghost" size="sm" onClick={() => go("home")}><Icon name="home" className="h-4 w-4" /> Menu Utama</Button>
          </Card>
        </div>
      </div>
    );
  }

  /* -------------------------------- MAIN -------------------------------- */
  if (tahap === "main" && q) {
    const mm = String(Math.floor(sisa / 60)).padStart(2, "0");
    const ss = String(sisa % 60).padStart(2, "0");
    return (
      <div className="mx-auto w-full max-w-6xl px-3 pb-24 pt-4 sm:px-5">
        {rayakan && <Confetti />}
        <div className="ink-panel mb-3 flex flex-wrap items-center gap-3 p-3">
          <span className="font-display text-sm font-extrabold uppercase tracking-[0.14em] text-sun-500">Misi Penakluk Bangun Ruang</span>
          <span className="num rounded-lg bg-white/10 px-2.5 py-1 text-sm font-extrabold text-white">{nama || "Siswa"}</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <span className="num flex items-center gap-1.5 rounded-lg bg-mint-500/20 px-2.5 py-1 text-sm font-extrabold text-mint-400">
              <Icon name="star" className="h-4 w-4" /> Skor {benar * 10}
            </span>
            {streak >= 2 && <span className="num pop-in rounded-lg bg-sun-500/25 px-2.5 py-1 text-sm font-extrabold text-sun-500">🔥 {streak}× beruntun</span>}
            {menit > 0 && (
              <span className={cn("num flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-extrabold", sisa <= 30 ? "bg-koral-600/35 text-koral-400" : "bg-white/10 text-white")}>
                <Icon name="clock" className="h-4 w-4" /> {mm}:{ss}
              </span>
            )}
            <button className="btn btn-sm" style={{ ["--btn-bg" as string]: "#fff" }} onClick={() => { if (timerRef.current) window.clearInterval(timerRef.current); setTahap("hasil"); }}>
              <Icon name="flag" className="h-4 w-4" /> Selesai
            </button>
          </div>
          <div className="w-full">
            <Progress value={((idx + (pilihan !== null ? 1 : 0)) / total) * 100} color="#FFC24B" height={9} className="bg-white/15!" />
            <div className="mt-1 flex flex-wrap gap-1">
              {soal.map((_, i) => (
                <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i < idx ? "bg-sun-500/70" : i === idx ? "bg-white" : "bg-white/20")} />
              ))}
            </div>
          </div>
        </div>

        <Card className={cn("space-y-4", rayakan && "cheer")}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="num rounded-full bg-laut-900 px-3 py-1 text-[0.78rem] font-extrabold text-white">Soal {idx + 1} / {total}</span>
            <span className="rounded-full border-2 border-laut-800/15 px-2.5 py-1 text-[0.7rem] font-extrabold uppercase tracking-wider text-laut-800/70">{TOPIC_LABEL[q.topic]}</span>
            <span className="num ml-auto text-[0.82rem] font-extrabold text-laut-800/70">✓ {benar} • ✗ {salah} • ○ {kosong}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <p className="font-display text-[1.2rem] font-bold leading-relaxed text-laut-900">{q.q}</p>
            {q.shape && q.dims && (
              <div className="relative h-36 w-full overflow-hidden rounded-xl border-2 border-laut-800/12 bg-[radial-gradient(circle_at_50%_35%,#fff,#e2f2f6_75%)] sm:w-44">
                <Shape3D kind={q.shape} dims={q.dims} autoRotate showRusuk className="absolute inset-0" />
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
                    "relative flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all",
                    !show && "border-laut-800/14 bg-white hover:-translate-y-0.5 hover:border-laut-600 hover:bg-laut-50",
                    show && isTrue && "border-mint-500 bg-mint-500/14 ring-burst text-mint-600",
                    show && dipilih && !isTrue && "border-koral-500 bg-koral-500/10 shake",
                    show && !dipilih && !isTrue && "border-laut-800/10 bg-white opacity-55",
                  )}
                >
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-base font-extrabold",
                    show && isTrue ? "bg-mint-500 text-white" : show && dipilih ? "bg-koral-500 text-white" : "bg-laut-50 text-laut-700")}>
                    {show && isTrue ? <Icon name="check" className="h-5 w-5" strokeWidth={3} /> : show && dipilih ? <Icon name="cross" className="h-5 w-5" strokeWidth={3} /> : huruf}
                  </span>
                  <span className="num text-[0.95rem] font-bold text-laut-900">{o}</span>
                </button>
              );
            })}
          </div>

          {pilihan === null ? (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={lewati}><Icon name="right" className="h-4 w-4" /> Lewati (ragu-ragu)</Button>
            </div>
          ) : (
            <div className={cn("bubble-in rounded-2xl border-2 p-4", pilihan === q.answer ? "border-mint-500/50 bg-mint-500/10" : "border-koral-500/45 bg-koral-500/8")}>
              <div className="flex items-center gap-2">
                <Robot mood={pilihan === q.answer ? "cheer" : "think"} size={58} />
                <div>
                  <div className={cn("font-display text-lg font-extrabold", pilihan === q.answer ? "text-mint-600" : "text-koral-600")}>
                    {pilihan === q.answer ? (streak >= 3 ? `Luar biasa! ${streak}× beruntun!` : "Benar!") : pilihan === -1 ? "Soal dilewati" : "Belum tepat"}
                  </div>
                  <div className="text-[0.8rem] font-bold text-laut-800/70">
                    {pilihan === q.answer ? "+10 skor" : `Jawaban benar: ${q.options[q.answer]}`}
                  </div>
                </div>
              </div>
              <div className="mt-2 rounded-xl bg-white/85 p-3">
                <StepList steps={q.steps} tone={pilihan === q.answer ? "#12987f" : "#EC4A35"} />
              </div>
              <div className="mt-3 flex justify-end">
                <Button variant="teal" onClick={lanjut}>{idx + 1 >= total ? "Lihat Hasil Akhir" : "Soal Berikutnya"} <Icon name="right" className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  /* -------------------------------- HASIL -------------------------------- */
  const p = predikat(nilai);
  const lemahUnik = Array.from(new Set(topikSalah));
  return (
    <div className="mx-auto w-full max-w-4xl px-3 pb-24 pt-4 sm:px-5">
      {nilai >= 75 && <Confetti n={70} />}
      <div className="ink-panel overflow-hidden p-5 text-center sm:p-8">
        <Robot mood={nilai >= 75 ? "cheer" : "think"} size={110} className="mx-auto" />
        <h1 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">MISI {nilai >= 75 ? "BERHASIL" : "SELESAI"}!</h1>
        <p className="mt-1 font-display text-lg font-bold text-sun-500">{p.emoji} {p.label}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <Ring value={nilai} color={nilai >= 75 ? "#4edbc0" : nilai >= 60 ? "#FFC24B" : "#FF8A72"} size={130} label="nilai akhir" />
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { l: "Benar", v: benar, c: "#4edbc0" },
              { l: "Salah", v: salah, c: "#FF8A72" },
              { l: "Kosong", v: kosong, c: "#cfe9ef" },
            ].map((x) => (
              <div key={x.l} className="rounded-xl bg-white/10 px-3 py-2">
                <div className="num text-2xl font-extrabold" style={{ color: x.c }}>{x.v}</div>
                <div className="text-[0.66rem] font-extrabold uppercase tracking-wider text-laut-100/70">{x.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-left sm:grid-cols-2">
          <div className="rounded-xl bg-white/10 p-3">
            <div className="text-[0.66rem] font-extrabold uppercase tracking-wider text-laut-100/70">Nama siswa</div>
            <div className="font-display text-lg font-extrabold text-white">{nama || "Siswa"}</div>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <div className="text-[0.66rem] font-extrabold uppercase tracking-wider text-laut-100/70">Ketuntasan</div>
            <div className="num font-display text-lg font-extrabold text-white">{nilai}% {nilai >= 75 ? "(tuntas ✅)" : "(belum tuntas)"}</div>
          </div>
        </div>
        <p className="mx-auto mt-4 max-w-xl text-[0.95rem] font-semibold leading-relaxed text-laut-100/90">{p.pesan}</p>
        <p className="mt-1 text-[0.8rem] font-bold text-laut-100/60">
          Rekor jawaban beruntun: {streakMax} • Skor: {benar * 10}
        </p>
      </div>

      <Card className="mt-4">
        <Kicker tone="#EC4A35">Materi yang perlu dipelajari kembali</Kicker>
        {lemahUnik.length === 0 ? (
          <p className="mt-2 text-[0.9rem] font-semibold text-laut-800/75">Hebat! Tidak ada topik yang meleset. Coba tingkatkan level kesulitannya di menu Latihan.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {lemahUnik.map((t) => (
              <button
                key={t}
                onClick={() => go("materi", t === "konsep" ? "jangan-tertukar" : t === "volume" ? "konsep-volume" : t === "luas" ? "konsep-lp" : t === "cerita" ? "balok" : "kerucut")}
                className="card-lift rounded-xl border-2 border-koral-500/30 bg-koral-500/8 px-3 py-2 text-left"
              >
                <div className="text-[0.7rem] font-extrabold uppercase tracking-wider text-koral-600">Perlu dilatih</div>
                <div className="font-display text-[0.92rem] font-extrabold text-laut-900">{TOPIC_LABEL[t]}</div>
                <div className="text-[0.72rem] font-bold text-laut-800/60">Klik untuk membuka materi →</div>
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button variant="sun" onClick={() => { setTahap("setup"); sfx.click(); }}><Icon name="refresh" className="h-4 w-4" /> Ulangi Kuis</Button>
          <Button variant="teal" onClick={() => go("latihan")}><Icon name="book" className="h-4 w-4" /> Latihan Soal</Button>
          <Button variant="ghost" onClick={() => go("progres")}><Icon name="chart" className="h-4 w-4" /> Lihat Progres</Button>
          <Button variant="ink" onClick={() => go("home")}><Icon name="home" className="h-4 w-4" /> Menu Utama</Button>
        </div>
      </Card>
    </div>
  );
}
