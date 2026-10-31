import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type TopicKey = "konsep" | "volume" | "luas" | "cerita" | "hots";

export const TOPIC_LABEL: Record<TopicKey, string> = {
  konsep: "Pemahaman Konsep Bangun Ruang",
  volume: "Menghitung Volume",
  luas: "Menghitung Luas Permukaan",
  cerita: "Soal Cerita Kehidupan Sehari-hari",
  hots: "Penalaran & HOTS",
};

export type KuisRecord = {
  id: string;
  nama: string;
  tanggal: number;
  benar: number;
  salah: number;
  kosong: number;
  nilai: number;
  durasiDetik: number;
  predikat: string;
  lemah: TopicKey[];
};

export type ProgressState = {
  name: string;
  materi: Record<string, boolean>;
  sims: Record<string, number>;
  latihan: { correct: number; total: number; perLevel: Record<number, { correct: number; total: number }> };
  kuisRiwayat: KuisRecord[];
  topicStats: Record<TopicKey, { c: number; t: number }>;
  sound: boolean;
  terakhir: number;
};

export const MATERI_IDS = ["konsep-volume", "konsep-lp", "jangan-tertukar", "kubus", "balok", "prisma", "limas", "kerucut"];
export const SIM_IDS = ["kubus-satuan", "bongkar", "bedakan", "ubah-ukuran"];

const KEY = "ruangmatematika.progress.v1";

const emptyTopic = (): Record<TopicKey, { c: number; t: number }> => ({
  konsep: { c: 0, t: 0 },
  volume: { c: 0, t: 0 },
  luas: { c: 0, t: 0 },
  cerita: { c: 0, t: 0 },
  hots: { c: 0, t: 0 },
});

const defaultState = (): ProgressState => ({
  name: "",
  materi: {},
  sims: {},
  latihan: { correct: 0, total: 0, perLevel: {} },
  kuisRiwayat: [],
  topicStats: emptyTopic(),
  sound: true,
  terakhir: Date.now(),
});

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      materi: { ...base.materi, ...(parsed.materi ?? {}) },
      sims: { ...base.sims, ...(parsed.sims ?? {}) },
      latihan: { ...base.latihan, ...(parsed.latihan ?? {}), perLevel: { ...(parsed.latihan?.perLevel ?? {}) } },
      topicStats: { ...base.topicStats, ...(parsed.topicStats ?? {}) },
      kuisRiwayat: Array.isArray(parsed.kuisRiwayat) ? parsed.kuisRiwayat : [],
    };
  } catch {
    return defaultState();
  }
}

type Ctx = {
  state: ProgressState;
  setName: (n: string) => void;
  markMateri: (id: string) => void;
  markSim: (id: string) => void;
  recordAnswer: (topic: TopicKey, level: number, correct: boolean) => void;
  addKuis: (r: Omit<KuisRecord, "id" | "tanggal">) => void;
  toggleSound: () => void;
  reset: () => void;
};

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => (typeof window === "undefined" ? defaultState() : load()));

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...state, terakhir: Date.now() }));
    } catch {
      /* storage penuh / mode privat: aplikasi tetap jalan */
    }
  }, [state]);

  const setName = useCallback((n: string) => setState((s) => ({ ...s, name: n })), []);

  const markMateri = useCallback((id: string) => setState((s) => ({ ...s, materi: { ...s.materi, [id]: true } })), []);

  const markSim = useCallback(
    (id: string) => setState((s) => ({ ...s, sims: { ...s.sims, [id]: (s.sims[id] ?? 0) + 1 } })),
    [],
  );

  const recordAnswer = useCallback(
    (topic: TopicKey, level: number, correct: boolean) =>
      setState((s) => {
        const t = { ...s.topicStats[topic] };
        t.t += 1;
        if (correct) t.c += 1;
        const lv = { ...(s.latihan.perLevel[level] ?? { correct: 0, total: 0 }) };
        lv.total += 1;
        if (correct) lv.correct += 1;
        return {
          ...s,
          topicStats: { ...s.topicStats, [topic]: t },
          latihan: {
            correct: s.latihan.correct + (correct ? 1 : 0),
            total: s.latihan.total + 1,
            perLevel: { ...s.latihan.perLevel, [level]: lv },
          },
        };
      }),
    [],
  );

  const addKuis = useCallback(
    (r: Omit<KuisRecord, "id" | "tanggal">) =>
      setState((s) => ({
        ...s,
        kuisRiwayat: [{ ...r, id: `q${Date.now()}`, tanggal: Date.now() }, ...s.kuisRiwayat].slice(0, 12),
      })),
    [],
  );

  const toggleSound = useCallback(() => setState((s) => ({ ...s, sound: !s.sound })), []);

  const reset = useCallback(() => setState({ ...defaultState(), name: state.name }), [state.name]);

  const value = useMemo(
    () => ({ state, setName, markMateri, markSim, recordAnswer, addKuis, toggleSound, reset }),
    [state, setName, markMateri, markSim, recordAnswer, addKuis, toggleSound, reset],
  );

  return createElement(ProgressContext.Provider, { value }, children);
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress harus di dalam ProgressProvider");
  return ctx;
}

/* ---------------------------- ringkasan penguasaan ---------------------------- */

export function ringkasan(s: ProgressState) {
  const materiDone = MATERI_IDS.filter((m) => s.materi[m]).length;
  const materiPct = Math.round((materiDone / MATERI_IDS.length) * 100);
  const simDone = SIM_IDS.filter((m) => (s.sims[m] ?? 0) > 0).length;
  const simPct = Math.round((simDone / SIM_IDS.length) * 100);
  const latPct = s.latihan.total ? Math.round((s.latihan.correct / s.latihan.total) * 100) : 0;
  const kuisTerbaik = s.kuisRiwayat.reduce((m, k) => Math.max(m, k.nilai), 0);
  const mastery = Math.round(
    materiPct * 0.25 + simPct * 0.15 + latPct * 0.3 + kuisTerbaik * 0.3,
  );
  const lemah = (Object.keys(s.topicStats) as TopicKey[])
    .filter((k) => s.topicStats[k].t >= 3 && s.topicStats[k].c / s.topicStats[k].t < 0.7)
    .sort((a, b) => s.topicStats[a].c / s.topicStats[a].t - s.topicStats[b].c / s.topicStats[b].t);
  return { materiDone, materiPct, simDone, simPct, latPct, kuisTerbaik, mastery, lemah };
}

export function predikat(nilai: number) {
  if (nilai >= 95) return { label: "LUAR BIASA!", emoji: "🏆", pesan: "Kamu sudah menguasai volume & luas permukaan dengan sangat baik. Pertahankan!" };
  if (nilai >= 85) return { label: "HEBAT", emoji: "🌟", pesan: "Keren! Sedikit lagi menuju sempurna. Coba ulangi materi yang masih merah." };
  if (nilai >= 75) return { label: "BAIK", emoji: "😊", pesan: "Bagus! Kamu sudah paham sebagian besar. Latih lagi soal cerita ya." };
  if (nilai >= 60) return { label: "CUKUP", emoji: "💪", pesan: "Lumayan! Baca ulang materinya, lalu coba latihan Level 2 dan 3." };
  return { label: "AYO SEMANGAT", emoji: "🤖", pesan: "Jangan menyerah! Mulai dari Materi 1 tentang arti volume, lalu coba simulasinya." };
}
