import { useCallback, useEffect, useState } from "react";
import Home from "./pages/Home";
import Materi from "./pages/Materi";
import Simulasi from "./pages/Simulasi";
import Latihan from "./pages/Latihan";
import Kuis from "./pages/Kuis";
import Progres from "./pages/Progres";
import Alat from "./pages/Alat";
import { Button, Icon, Modal } from "./components/ui";
import { ProgressProvider, useProgress } from "./lib/store";
import { setSoundOn, sfx } from "./lib/media";
import { cn } from "./utils/cn";

type Page = "home" | "materi" | "simulasi" | "latihan" | "kuis" | "progres" | "alat";

const NAV: { id: Page; label: string; icon: string; color: string }[] = [
  { id: "home", label: "Beranda", icon: "home", color: "#0A3D49" },
  { id: "materi", label: "Materi", icon: "book", color: "#1491A8" },
  { id: "simulasi", label: "Simulasi", icon: "flask", color: "#21C3A4" },
  { id: "latihan", label: "Latihan", icon: "target", color: "#F5A623" },
  { id: "kuis", label: "Kuis", icon: "trophy", color: "#EC4A35" },
  { id: "progres", label: "Progres", icon: "chart", color: "#7A55F0" },
];

const PETUNJUK: Record<Page, { judul: string; poin: string[] }> = {
  home: {
    judul: "Petunjuk Halaman Utama",
    poin: [
      "Tulis namamu di kolom nama agar nilaimu tersimpan dengan benar.",
      "Tekan MULAI BELAJAR untuk melanjutkan dari bagian yang belum kamu selesaikan.",
      "Panggung 3D di kanan bisa diputar dengan menyeret modelnya. Pilih bangun lewat tombol di bawahnya.",
      "Gunakan tombol 🔊 di pojok kanan atas untuk menyalakan/mematikan suara, dan ⛶ untuk layar penuh.",
    ],
  },
  materi: {
    judul: "Petunjuk Menu Materi",
    poin: [
      "Pilih bagian materi di menu sebelah kiri (atau geser ke samping di HP).",
      "Tekan tombol DENGARKAN bila ingin materi dibacakan.",
      "Pada contoh 3D: seret untuk memutar, dan gunakan tombol Rusuk / Titik sudut untuk menampilkan unsur bangun.",
      "Geser slider pada contoh perhitungan untuk melihat hasil berubah langsung.",
      "Akhiri setiap bagian dengan menekan 'Tandai Sudah Dipahami' agar progresmu tercatat.",
    ],
  },
  simulasi: {
    judul: "Petunjuk Menu Simulasi",
    poin: [
      "Simulasi 1: ubah rusuk wadah, tekan ISI WADAH, lalu amati kubus satuan tersusun per lapisan.",
      "Simulasi 2: tekan BONGKAR untuk membuka bangun menjadi jaring-jaring, SATUKAN untuk menutup kembali.",
      "Simulasi 3: lakukan eksperimen mengisi wadah (volume) dan membungkus permukaan (luas permukaan), lalu jawab tantangannya.",
      "Simulasi 4: pilih bangun, geser ukurannya, dan baca langkah perhitungannya.",
    ],
  },
  latihan: {
    judul: "Petunjuk Menu Latihan",
    poin: [
      "Pilih level 1 sampai 4. Mulailah dari level yang paling mudah.",
      "Klik salah satu pilihan jawaban. Pembahasan dan langkah perhitungan langsung muncul.",
      "Gunakan 'Acak soal baru' untuk mendapat soal berbeda tanpa mengulang soal yang sama terus-menerus.",
      "Nilaimu tersimpan otomatis dan bisa dilihat di menu Progres.",
    ],
  },
  kuis: {
    judul: "Petunjuk Kuis Tantangan",
    poin: [
      "Isi nama, pilih banyak soal (minimal 20) dan durasi pengerjaan.",
      "Jawab secepat dan setepat mungkin. Jawaban beruntun yang benar memberi tanda 🔥.",
      "Kalau ragu, tekan 'Lewati' — soal itu akan dihitung kosong.",
      "Di akhir sesi kamu melihat nilai, predikat, dan materi yang perlu dipelajari kembali.",
    ],
  },
  progres: {
    judul: "Petunjuk Progres Belajar",
    poin: [
      "Semua data tersimpan di perangkat ini (LocalStorage) tanpa perlu internet.",
      "Persentase penguasaan dihitung dari materi yang dibaca (25%), simulasi (15%), latihan (30%), dan kuis terbaik (30%).",
      "Tekan CETAK HASIL untuk menyimpan atau mencetak laporan belajar.",
      "Tekan HAPUS PROGRES bila ingin memulai dari awal (data lama tidak dapat dikembalikan).",
    ],
  },
  alat: {
    judul: "Petunjuk Alat Bantu",
    poin: [
      "Kamus Matematika: cari arti istilah seperti rusuk, sisi, garis pelukis.",
      "Kalkulator Bangun Ruang: masukkan ukuran, dapatkan hasil beserta prosesnya dan konversi satuannya.",
      "Bantuan Rumus: kumpulan rumus lengkap dengan arti setiap simbol.",
      "Tips Belajar: cara agar tidak tertukar antara volume dan luas permukaan.",
    ],
  },
};

function Drifters() {
  const items = [
    { top: "12%", left: "4%", size: 46, color: "#1491A8", dur: 26 },
    { top: "68%", left: "8%", size: 34, color: "#FFC24B", dur: 32 },
    { top: "24%", left: "88%", size: 52, color: "#21C3A4", dur: 29 },
    { top: "76%", left: "82%", size: 38, color: "#FF6B57", dur: 24 },
    { top: "44%", left: "52%", size: 28, color: "#7A55F0", dur: 36 },
  ];
  return (
    <>
      {items.map((d, i) => (
        <svg key={i} className="drifter" style={{ top: d.top, left: d.left, width: d.size, height: d.size, animationDuration: `${d.dur}s` }} viewBox="0 0 40 40" fill="none" stroke={d.color} strokeWidth="2.4">
          {i % 3 === 0 && <><path d="M20 4 36 12v16L20 36 4 28V12z" /><path d="M4 12 20 20l16-8M20 20v16" /></>}
          {i % 3 === 1 && <circle cx="20" cy="20" r="15" />}
          {i % 3 === 2 && <path d="M20 5 35 33H5z" />}
        </svg>
      ))}
    </>
  );
}

function Shell() {
  const { state, toggleSound } = useProgress();
  const [page, setPage] = useState<Page>("home");
  const [arg, setArg] = useState<string | undefined>();
  const [bantuan, setBantuan] = useState(false);
  const [fs, setFs] = useState(false);

  const go = useCallback((p: string, a?: string) => {
    setPage(p as Page);
    setArg(a);
    sfx.click();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => { setSoundOn(state.sound); }, [state.sound]);

  useEffect(() => {
    const onChange = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFs = () => {
    try {
      if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.();
      else void document.exitFullscreen?.();
    } catch { /* browser menolak fullscreen */ }
  };

  const kontrol = (
    <div className="flex items-center gap-1.5">
      <button className="btn btn-sm" onClick={toggleSound} title={state.sound ? "Matikan suara" : "Nyalakan suara"} aria-label="Ganti suara">
        <Icon name={state.sound ? "sound" : "mute"} className="h-4 w-4" />
      </button>
      <button className="btn btn-sm" onClick={toggleFs} title="Layar penuh" aria-label="Layar penuh">
        <Icon name={fs ? "shrink" : "expand"} className="h-4 w-4" />
      </button>
      <button className="btn btn-sm" onClick={() => setBantuan(true)} title="Petunjuk" aria-label="Petunjuk">
        <Icon name="help" className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="min-h-full">
      <div className="stage-bg" />
      <div className="stage-grid" />
      <Drifters />

      <header className="no-print sticky top-0 z-30 border-b-2 border-laut-900/10 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-3 py-2.5 sm:px-5">
          <button onClick={() => go("home")} className="flex shrink-0 items-center gap-2.5" aria-label="Ke halaman utama">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-laut-800 text-sun-500 shadow-[0_4px_0_rgba(6,49,60,.35)]">
              <Icon name="cube" className="h-6 w-6" strokeWidth={2.1} />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block font-display text-[1.05rem] font-extrabold leading-none text-laut-900">RUANG MATEMATIKA</span>
              <span className="block text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-laut-600">Volume & Luas Permukaan</span>
            </span>
          </button>

          <nav className="thin-scroll mx-auto hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex">
            {NAV.map((n) => {
              const on = page === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => go(n.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 font-display text-[0.86rem] font-extrabold transition-all",
                    on ? "text-white shadow-[0_3px_0_rgba(6,49,60,.25)]" : "text-laut-800/75 hover:bg-laut-50 hover:text-laut-900",
                  )}
                  style={on ? { background: n.color } : undefined}
                >
                  <Icon name={n.icon} className="h-4 w-4" /> {n.label}
                </button>
              );
            })}
            <button
              onClick={() => go("alat")}
              className={cn("flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 font-display text-[0.86rem] font-extrabold transition-all", page === "alat" ? "bg-anggur-500 text-white" : "text-laut-800/75 hover:bg-laut-50")}
            >
              <Icon name="calc" className="h-4 w-4" /> Alat
            </button>
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            {page !== "home" && (
              <button className="btn btn-sm hidden lg:inline-flex" onClick={() => go("home")}>
                <Icon name="home" className="h-4 w-4" /> Menu Utama
              </button>
            )}
            {kontrol}
          </div>
        </div>
      </header>

      <main key={page} className="pop-in">
        {page === "home" && <Home go={go} />}
        {page === "materi" && <Materi fokus={arg} go={go} />}
        {page === "simulasi" && <Simulasi fokus={arg} go={go} />}
        {page === "latihan" && <Latihan fokus={arg} go={go} />}
        {page === "kuis" && <Kuis go={go} />}
        {page === "progres" && <Progres go={go} />}
        {page === "alat" && <Alat go={go} fokus={arg} />}
      </main>

      {/* navigasi bawah untuk HP */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t-2 border-laut-900/12 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-between">
          {[...NAV, { id: "alat" as Page, label: "Alat", icon: "calc", color: "#7A55F0" }].map((n) => {
            const on = page === n.id;
            return (
              <button key={n.id} onClick={() => go(n.id)} className="flex flex-1 flex-col items-center gap-0.5 py-2" aria-label={n.label}>
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg transition-all", on ? "scale-110 text-white" : "text-laut-800/60")} style={on ? { background: n.color } : undefined}>
                  <Icon name={n.icon} className="h-5 w-5" />
                </span>
                <span className={cn("text-[0.6rem] font-extrabold", on ? "text-laut-900" : "text-laut-800/55")}>{n.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <Modal open={bantuan} onClose={() => setBantuan(false)} title={PETUNJUK[page].judul}>
        <ul className="space-y-2">
          {PETUNJUK[page].poin.map((p, i) => (
            <li key={i} className="flex gap-2.5 rounded-xl border-2 border-laut-800/10 bg-laut-50/70 p-2.5">
              <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-laut-700 text-xs font-extrabold text-white">{i + 1}</span>
              <span className="text-[0.88rem] font-semibold leading-relaxed text-laut-900">{p}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setBantuan(false); go("alat", "tips"); }}>
            <Icon name="bulb" className="h-4 w-4" /> Lihat Tips Belajar
          </Button>
          <Button variant="teal" size="sm" onClick={() => setBantuan(false)}>Mengerti, terima kasih!</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <Shell />
    </ProgressProvider>
  );
}
