import { useState } from "react";
import type { ShapeKind } from "../lib/shapes";
import { SHAPE_META, SHAPE_ORDER, defaultDims, fmt, hitung, piFor } from "../lib/shapes";
import Shape3D from "../components/Shape3D";
import { Button, Card, Icon, Kicker, StepList } from "../components/ui";
import { sfx } from "../lib/media";
import { cn } from "../utils/cn";

const KAMUS: { istilah: string; arti: string; contoh: string }[] = [
  { istilah: "Bangun ruang", arti: "Bangun matematika yang memiliki tiga ukuran (panjang, lebar, tinggi) sehingga punya isi/ruang.", contoh: "Kubus, balok, prisma, limas, kerucut, tabung, bola." },
  { istilah: "Volume", arti: "Ukuran banyaknya ruang yang dapat ditempati atau diisi oleh suatu bangun ruang.", contoh: "Isi air dalam akuarium = 60.000 cm³ = 60 liter." },
  { istilah: "Luas permukaan", arti: "Jumlah luas seluruh bidang sisi yang menutupi bagian luar bangun ruang.", contoh: "Kertas kado untuk membungkus kotak = 216 cm²." },
  { istilah: "Sisi (bidang)", arti: "Bidang datar yang membatasi bangun ruang. Sisi adalah 'kulit' bangun itu.", contoh: "Kubus punya 6 sisi, semuanya persegi." },
  { istilah: "Rusuk", arti: "Garis pertemuan antara dua sisi bangun ruang.", contoh: "Kubus punya 12 rusuk yang sama panjang." },
  { istilah: "Titik sudut", arti: "Pojok bangun ruang, tempat bertemunya tiga rusuk atau lebih.", contoh: "Balok punya 8 titik sudut." },
  { istilah: "Kubus satuan", arti: "Kubus kecil berusuk 1 cm yang dipakai sebagai alat ukur volume. Volumenya tepat 1 cm³.", contoh: "Wadah 6×6×6 cm memuat 216 kubus satuan." },
  { istilah: "Jaring-jaring", arti: "Rangkaian sisi-sisi bangun ruang yang dibuka dan didatarkan.", contoh: "Jaring-jaring kubus terdiri dari 6 persegi." },
  { istilah: "Alas", arti: "Sisi bawah bangun ruang yang menjadi tumpuan. Bentuk alas menentukan nama beberapa bangun.", contoh: "Alas prisma segitiga berbentuk segitiga." },
  { istilah: "Tinggi (t)", arti: "Jarak tegak lurus dari alas ke bagian paling atas (atau ke puncak).", contoh: "Tinggi kerucut diukur dari puncak ke pusat lingkaran alas." },
  { istilah: "Jari-jari (r)", arti: "Jarak dari pusat lingkaran ke tepi lingkaran. Setengah dari diameter.", contoh: "Lingkaran berdiameter 14 cm punya jari-jari 7 cm." },
  { istilah: "Diameter (d)", arti: "Garis lurus yang menghubungkan dua titik pada tepi lingkaran dan melewati pusat. d = 2 × r.", contoh: "Jika r = 7 cm maka d = 14 cm." },
  { istilah: "Garis pelukis (s)", arti: "Jarak dari titik puncak kerucut ke tepi lingkaran alas, mengikuti sisi lengkung. s = √(r² + t²).", contoh: "Kerucut r = 7 cm, t = 24 cm → s = 25 cm." },
  { istilah: "Selimut", arti: "Sisi lengkung atau sisi tegak yang 'membungkus' bangun ruang.", contoh: "Selimut kerucut bila dibuka berbentuk juring lingkaran." },
  { istilah: "Tinggi sisi tegak (tt)", arti: "Tinggi segitiga pada sisi tegak limas, diukur dari rusuk alas ke titik puncak. Selalu lebih panjang dari tinggi limas.", contoh: "Limas a = 6 cm, t = 4 cm → tt = 5 cm." },
  { istilah: "Prisma", arti: "Bangun ruang dengan dua sisi sejajar yang sama bentuk dan ukuran (alas & atap) serta sisi-sisi tegak.", contoh: "Prisma segitiga: 5 sisi, 9 rusuk, 6 titik sudut." },
  { istilah: "Limas", arti: "Bangun ruang dengan satu alas dan sisi-sisi tegak berbentuk segitiga yang bertemu di satu titik puncak.", contoh: "Limas segiempat: 5 sisi, 8 rusuk, 5 titik sudut." },
  { istilah: "Kerucut", arti: "Bangun ruang ber alas lingkaran dengan satu titik puncak dan satu sisi lengkung.", contoh: "Cone es krim dan topi ulang tahun." },
  { istilah: "π (pi)", arti: "Perbandingan keliling lingkaran dengan diameternya. Dipakai 22/7 bila jari-jari kelipatan 7, selain itu 3,14.", contoh: "r = 7 cm → π = 22/7; r = 10 cm → π = 3,14." },
  { istilah: "Liter", arti: "Satuan volume untuk benda cair. 1 liter = 1.000 cm³ = 1 dm³.", contoh: "Akuarium 40×25×30 cm = 30.000 cm³ = 30 liter." },
  { istilah: "Kongruen", arti: "Sama bentuk dan sama ukurannya persis.", contoh: "Sisi atas dan alas balok adalah persegi panjang yang kongruen." },
  { istilah: "Diagonal ruang", arti: "Garis yang menghubungkan dua titik sudut yang berhadapan melewati ruang dalam bangun.", contoh: "Diagonal ruang balok = √(p² + l² + t²)." },
];

const TIPS = [
  { judul: "Garis bawahi kata kunci soal", isi: "Kata 'diisi', 'dituang', 'ditampung', 'memuat' berarti VOLUME. Kata 'dibungkus', 'dicat', 'dilapisi', 'dibuat kemasan' berarti LUAS PERMUKAAN." },
  { judul: "Perhatikan satuannya", isi: "Volume selalu kubik (cm³, m³, liter). Luas permukaan selalu persegi (cm², m²). Kalau satuannya salah, jawabanmu pasti salah walaupun angkanya benar." },
  { judul: "Gambar dulu, hitung kemudian", isi: "Buat sketsa bangunnya, tuliskan ukuran yang diketahui di gambar. Ini mencegah salah memilih rumus." },
  { judul: "Cari tinggi yang benar", isi: "Pada limas bedakan tinggi limas (t) untuk volume dan tinggi sisi tegak (tt) untuk luas. Pada kerucut bedakan tinggi (t) untuk volume dan garis pelukis (s) untuk luas selimut." },
  { judul: "Pahami, jangan hafal buta", isi: "Semua rumus berasal dari susunan kubus satuan atau dari jaring-jaring. Kalau kamu paham asalnya, kamu tidak akan mudah lupa." },
  { judul: "Cek dengan perkiraan", isi: "Setelah menghitung, tanyakan: 'masuk akal tidak ya?' Kalau volumenya lebih kecil dari satu sisinya, kemungkinan ada yang keliru." },
  { judul: "Tulis langkah, bukan hanya hasil", isi: "Menulis langkah membantu menemukan kesalahan dan biasanya tetap mendapat nilai sebagian di ulangan." },
  { judul: "Latihan bertahap", isi: "Kerjakan Level 1 sampai Level 4 berurutan. Kalau Level 3 masih sering salah, kembali ke materi dan simulasi dulu." },
];

type Tab = "kamus" | "kalkulator" | "rumus" | "tips";

export default function Alat({ go, fokus }: { go: (p: string, arg?: string) => void; fokus?: string }) {
  const [tab, setTab] = useState<Tab>((fokus as Tab) || "kamus");
  const [cari, setCari] = useState("");
  const [kind, setKind] = useState<ShapeKind>("kubus");
  const [dims, setDims] = useState<Record<string, number>>(defaultDims("kubus"));
  const [satuan, setSatuan] = useState<"cm" | "m">("cm");

  const hasil = hitung(kind, dims);
  const hasilKamus = KAMUS.filter((k) => (k.istilah + k.arti).toLowerCase().includes(cari.toLowerCase()));
  const u3 = `${satuan}³`;
  const u2 = `${satuan}²`;
  const konversi = satuan === "cm"
    ? `${fmt(hasil.volume)} cm³ = ${fmt(hasil.volume / 1000)} liter = ${fmt(hasil.volume / 1000000)} m³`
    : `${fmt(hasil.volume)} m³ = ${fmt(hasil.volume * 1000)} liter = ${fmt(hasil.volume * 1000000)} cm³`;
  const konversiLP = satuan === "cm"
    ? `${fmt(hasil.lp)} cm² = ${fmt(hasil.lp / 10000)} m²`
    : `${fmt(hasil.lp)} m² = ${fmt(hasil.lp * 10000)} cm²`;

  return (
    <div className="mx-auto w-full max-w-7xl px-3 pb-24 pt-4 sm:px-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Kicker tone="#0c586a">Fitur Pendukung</Kicker>
          <h1 className="font-display text-3xl font-extrabold leading-none text-laut-900 sm:text-4xl">Alat Bantu Belajar</h1>
          <p className="mt-1.5 max-w-2xl text-[0.95rem] font-semibold text-laut-800/75">
            Kamus istilah, kalkulator bangun ruang, kumpulan rumus, dan tips supaya tidak tertukar.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => go("home")}><Icon name="home" className="h-4 w-4" /> Menu Utama</Button>
      </div>

      <div className="thin-scroll mb-4 -mx-3 flex gap-2 overflow-x-auto px-3 pb-1">
        {([
          ["kamus", "Kamus Matematika", "abc", "#1491A8"],
          ["kalkulator", "Kalkulator Bangun Ruang", "calc", "#21C3A4"],
          ["rumus", "Bantuan Rumus", "book", "#F5A623"],
          ["tips", "Tips Belajar", "bulb", "#7A55F0"],
        ] as [Tab, string, string, string][]).map(([id, label, icon, color]) => (
          <button
            key={id}
            onClick={() => { setTab(id); sfx.click(); }}
            className={cn("btn min-w-[190px] shrink-0", tab === id ? "" : "opacity-70")}
            style={{ ["--btn-bg" as string]: tab === id ? color : "#fff", ["--btn-fg" as string]: tab === id ? "#fff" : "#0A3D49" }}
          >
            <Icon name={icon} className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "kamus" && (
        <Card>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <input
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Cari istilah, misalnya: rusuk, garis pelukis…"
                className="w-full rounded-xl border-2 border-laut-800/15 bg-laut-50/60 py-2.5 pl-10 pr-3 font-semibold text-laut-900 outline-none transition focus:border-laut-500 focus:bg-white"
              />
              <Icon name="abc" className="absolute left-3 top-3 h-5 w-5 text-laut-600" />
            </div>
            <span className="num rounded-full bg-laut-100 px-3 py-1 text-[0.76rem] font-extrabold text-laut-700">{hasilKamus.length} istilah</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {hasilKamus.map((k) => (
              <div key={k.istilah} className="card-lift rounded-xl border-2 border-laut-800/12 bg-white p-3">
                <div className="font-display text-[1.02rem] font-extrabold text-laut-700">{k.istilah}</div>
                <p className="mt-1 text-[0.86rem] font-semibold leading-relaxed text-laut-900">{k.arti}</p>
                <p className="mt-1.5 rounded-lg bg-laut-50 px-2 py-1 text-[0.78rem] font-bold text-laut-800/75">💡 {k.contoh}</p>
              </div>
            ))}
            {hasilKamus.length === 0 && <p className="col-span-full py-6 text-center font-semibold text-laut-800/60">Istilah tidak ditemukan. Coba kata kunci lain ya.</p>}
          </div>
        </Card>
      )}

      {tab === "kalkulator" && (
        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="space-y-3">
            <Card>
              <Kicker tone="#21C3A4">Pilih bangun</Kicker>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {SHAPE_ORDER.map((k) => (
                  <button key={k} onClick={() => { setKind(k); setDims(defaultDims(k)); sfx.click(); }} className="btn btn-sm" style={{ ["--btn-bg" as string]: kind === k ? SHAPE_META[k].color : "#fff", ["--btn-fg" as string]: kind === k ? "#fff" : "#0A3D49" }}>
                    <Icon name={SHAPE_META[k].icon} className="h-4 w-4" /> {SHAPE_META[k].name.split(" ")[0]}
                  </button>
                ))}
              </div>
              <div className="relative mt-3 h-44 overflow-hidden rounded-xl border-2 border-laut-800/12 bg-[radial-gradient(circle_at_50%_35%,#fff,#e2f2f6_75%)]">
                <Shape3D kind={kind} dims={dims} autoRotate showRusuk className="absolute inset-0" />
              </div>
            </Card>
            <Card>
              <Kicker tone="#1491A8">Masukkan ukuran ({satuan})</Kicker>
              <div className="mt-2 space-y-2">
                {SHAPE_META[kind].dims.map((d) => (
                  <label key={d.key} className="block">
                    <span className="mb-0.5 block text-[0.78rem] font-extrabold text-laut-800">{d.label}</span>
                    <input
                      type="number" min={d.min} max={d.max} step={d.step} value={dims[d.key] ?? d.def}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setDims({ ...dims, [d.key]: isNaN(v) ? 0 : v });
                      }}
                      className="num w-full rounded-xl border-2 border-laut-800/15 bg-laut-50/60 px-3 py-2 text-lg font-extrabold text-laut-900 outline-none focus:border-laut-500 focus:bg-white"
                    />
                  </label>
                ))}
                <div className="flex gap-1.5 pt-1">
                  {(["cm", "m"] as const).map((s) => (
                    <button key={s} onClick={() => setSatuan(s)} className="btn btn-sm flex-1" style={{ ["--btn-bg" as string]: satuan === s ? "#0A3D49" : "#fff", ["--btn-fg" as string]: satuan === s ? "#fff" : "#0A3D49" }}>{s}</button>
                  ))}
                </div>
                {kind === "kerucut" && <p className="text-[0.76rem] font-bold text-laut-800/70">π otomatis: {piFor(dims.r).label} ({piFor(dims.r).ket}). Garis pelukis s dihitung sendiri dari r dan t.</p>}
              </div>
            </Card>
          </div>

          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-laut-600/25 bg-laut-50 p-4">
                <div className="flex items-center gap-2 text-laut-700"><Icon name="drop" className="h-5 w-5" /><span className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em]">Volume</span></div>
                <div className="num font-display text-3xl font-extrabold text-laut-900">{fmt(hasil.volume)} <span className="text-lg text-laut-600">{u3}</span></div>
                <div className="mt-1 text-[0.8rem] font-bold text-laut-800/70">{konversi}</div>
              </div>
              <div className="rounded-2xl border-2 border-koral-500/30 bg-koral-500/8 p-4">
                <div className="flex items-center gap-2 text-koral-600"><Icon name="gift" className="h-5 w-5" /><span className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em]">Luas Permukaan</span></div>
                <div className="num font-display text-3xl font-extrabold text-koral-600">{fmt(hasil.lp)} <span className="text-lg text-koral-500">{u2}</span></div>
                <div className="mt-1 text-[0.8rem] font-bold text-laut-800/70">{konversiLP}</div>
              </div>
            </div>
            <Card>
              <Kicker tone="#0c586a">Proses perhitungan volume</Kicker>
              <div className="mt-2"><StepList steps={hasil.volSteps} tone="#1491A8" /></div>
              <p className="mt-1 text-[0.78rem] font-semibold text-laut-800/60">*Satuan menyesuaikan pilihan ({satuan}).</p>
            </Card>
            <Card>
              <Kicker tone="#EC4A35">Proses perhitungan luas permukaan</Kicker>
              <div className="mt-2"><StepList steps={hasil.lpSteps} tone="#EC4A35" /></div>
            </Card>
            <Card>
              <Kicker tone="#F5A623">Nilai bantu</Kicker>
              <div className="mt-2 flex flex-wrap gap-2">
                {hasil.extras.map((e) => (
                  <div key={e.label} className="rounded-xl border-2 border-laut-800/12 bg-white px-3 py-1.5">
                    <div className="text-[0.65rem] font-extrabold uppercase tracking-wider text-laut-800/55">{e.label}</div>
                    <div className="num text-sm font-extrabold text-laut-900">{e.value}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "rumus" && (
        <div className="space-y-3">
          <Card>
            <Kicker tone="#F5A623">Aturan satuan yang wajib diingat</Kicker>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border-2 border-laut-600/25 bg-laut-50 p-3">
                <div className="font-display font-extrabold text-laut-700">Volume → satuan KUBIK</div>
                <p className="num mt-1 text-[0.9rem] font-bold text-laut-900">cm³, m³, dm³, liter (1 liter = 1.000 cm³)</p>
              </div>
              <div className="rounded-xl border-2 border-koral-500/30 bg-koral-500/8 p-3">
                <div className="font-display font-extrabold text-koral-600">Luas permukaan → satuan PERSEGI</div>
                <p className="num mt-1 text-[0.9rem] font-bold text-laut-900">cm², m², dm² (1 m² = 10.000 cm²)</p>
              </div>
            </div>
          </Card>
          {SHAPE_ORDER.map((k) => {
            const meta = SHAPE_META[k];
            const simbol = {
              kubus: [["s", "panjang rusuk"]],
              balok: [["p", "panjang"], ["l", "lebar"], ["t", "tinggi"]],
              prisma: [["a", "alas segitiga"], ["ts", "tinggi segitiga"], ["t", "tinggi prisma"], ["K", "keliling alas"]],
              limas: [["a", "sisi alas persegi"], ["t", "tinggi limas"], ["tt", "tinggi sisi tegak = √(t² + (a÷2)²)"]],
              kerucut: [["r", "jari-jari alas"], ["t", "tinggi kerucut"], ["s", "garis pelukis = √(r² + t²)"], ["π", "22/7 atau 3,14"]],
            }[k] as [string, string][];
            return (
              <Card key={k}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: meta.color }}><Icon name={meta.icon} className="h-6 w-6" /></span>
                  <div>
                    <div className="font-display text-xl font-extrabold text-laut-900">{meta.name}</div>
                    <div className="text-[0.8rem] font-bold text-laut-800/65">{meta.facts.map((f) => `${f.label}: ${f.value}`).join(" • ")}</div>
                  </div>
                  <button className="btn btn-sm ml-auto" style={{ ["--btn-bg" as string]: meta.color, ["--btn-fg" as string]: "#fff" }} onClick={() => go("materi", k)}>
                    <Icon name="book" className="h-4 w-4" /> Buka materi
                  </button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl bg-laut-900 p-3">
                    <div className="text-[0.66rem] font-extrabold uppercase tracking-wider text-laut-300">Volume</div>
                    <div className="num font-display text-lg font-extrabold text-sun-500">{meta.rumusV}</div>
                  </div>
                  <div className="rounded-xl bg-koral-600 p-3">
                    <div className="text-[0.66rem] font-extrabold uppercase tracking-wider text-white/70">Luas Permukaan</div>
                    <div className="num font-display text-lg font-extrabold text-white">{meta.rumusLP}</div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {simbol.map(([s, arti]) => (
                    <span key={s} className="rounded-lg border-2 border-laut-800/12 bg-white px-2 py-1 text-[0.78rem] font-bold text-laut-900">
                      <b className="num" style={{ color: meta.color }}>{s}</b> = {arti}
                    </span>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "tips" && (
        <div className="grid gap-3 md:grid-cols-2">
          {TIPS.map((t, i) => (
            <Card key={t.judul} className="card-lift">
              <div className="flex items-start gap-3">
                <span className="num flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sun-500 font-display text-lg font-extrabold text-white">{i + 1}</span>
                <div>
                  <div className="font-display text-[1.05rem] font-extrabold text-laut-900">{t.judul}</div>
                  <p className="mt-1 text-[0.9rem] font-semibold leading-relaxed text-laut-800/85">{t.isi}</p>
                </div>
              </div>
            </Card>
          ))}
          <Card className="md:col-span-2">
            <Kicker tone="#7A55F0">Urutan belajar yang disarankan</Kicker>
            <ol className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {["Melihat contoh nyata", "Mengamati visualisasi 3D", "Mencoba simulasi sendiri", "Menemukan pola", "Memahami rumus", "Mengerjakan latihan", "Mengikuti kuis", "Melihat progres belajar"].map((t, i) => (
                <li key={t} className="flex items-center gap-2 rounded-xl border-2 border-laut-800/10 bg-laut-50/70 p-2">
                  <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-laut-700 text-xs font-extrabold text-white">{i + 1}</span>
                  <span className="text-[0.84rem] font-bold text-laut-900">{t}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}
    </div>
  );
}
