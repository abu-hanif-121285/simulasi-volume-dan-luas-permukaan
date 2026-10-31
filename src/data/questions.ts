import type { ShapeKind } from "../lib/shapes";
import type { TopicKey } from "../lib/store";
import { LP, V, fmt, piFor, round, selimutKerucut } from "../lib/shapes";

export type Question = {
  id: string;
  level: 1 | 2 | 3 | 4;
  topic: TopicKey;
  q: string;
  options: string[];
  answer: number;
  steps: string[];
  tip?: string;
  shape?: ShapeKind;
  dims?: Record<string, number>;
};

/* ------------------------------ util acak ------------------------------ */

export const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function opsiTeks(correct: string, wrongs: string[]) {
  const pool = [correct, ...wrongs];
  const uniq: string[] = [];
  pool.forEach((p) => { if (!uniq.includes(p)) uniq.push(p); });
  let n = 1;
  while (uniq.length < 4) { uniq.push(`${correct} (variasi ${n++})`); }
  const shuffled = shuffle(uniq.slice(0, 4));
  return { options: shuffled, answer: shuffled.indexOf(correct) };
}

function opsiAngka(correct: number, wrongs: number[], satuan = "") {
  const c = fmt(round(correct, 2)) + satuan;
  const uniq = new Set<string>([c]);
  const out: string[] = [];
  const fallbacks = [correct * 2, correct / 2, correct + 1, correct * 3, correct - 1, correct * 10];
  [...wrongs, ...fallbacks].forEach((x) => {
    if (out.length >= 3 || !isFinite(x) || x <= 0) return;
    const s = fmt(round(x, 2)) + satuan;
    if (uniq.has(s)) return;
    uniq.add(s);
    out.push(s);
  });
  return opsiTeks(c, out);
}

type Gen = () => Question;
let uid = 0;
const nid = () => `q${++uid}`;

/* pasangan Pythagoras agar hasil tetap bilangan bulat & mudah dicek */
const PAIRS: [number, number][] = [[6, 4], [8, 3], [10, 12], [12, 8], [16, 15], [24, 5], [18, 12], [10, 24]];
const CONES: [number, number][] = [[7, 24], [21, 20], [5, 12], [10, 24], [14, 48], [28, 45], [7, 24], [21, 28]];
const AKUARIUM: [number, number, number][] = [[40, 25, 30], [50, 30, 40], [30, 20, 25], [60, 30, 40], [80, 40, 50], [45, 30, 40]];
const KARDUS: [number, number, number][] = [[20, 12, 8], [25, 15, 10], [30, 20, 15], [18, 10, 6], [24, 16, 12], [40, 25, 20]];

/* --------------------------- LEVEL 1: KONSEP --------------------------- */

const KONSEP: Gen[] = [
  () => { const o = opsiTeks("Kubus", ["Balok", "Limas", "Prisma segitiga"]); return { id: nid(), level: 1, topic: "konsep", q: "Bangun ruang yang memiliki 6 sisi berbentuk persegi sama besar dan 12 rusuk sama panjang adalah …", ...o, steps: ["Kubus: 6 sisi persegi kongruen, 12 rusuk sama panjang, 8 titik sudut."], shape: "kubus", dims: { s: 5 } }; },
  () => { const o = opsiTeks("12", ["6", "8", "10"]); return { id: nid(), level: 1, topic: "konsep", q: "Banyak rusuk pada sebuah kubus adalah …", ...o, steps: ["Hitung garis pertemuan antar sisi: 4 rusuk alas, 4 rusuk tegak, 4 rusuk atas = 12 rusuk."], shape: "kubus", dims: { s: 5 } }; },
  () => { const o = opsiTeks("8", ["6", "10", "12"]); return { id: nid(), level: 1, topic: "konsep", q: "Banyak titik sudut pada balok adalah …", ...o, steps: ["Balok memiliki 4 titik sudut di alas dan 4 titik sudut di atas = 8 titik sudut."], shape: "balok", dims: { p: 7, l: 4, t: 3 } }; },
  () => { const o = opsiTeks("5", ["3", "4", "6"]); return { id: nid(), level: 1, topic: "konsep", q: "Prisma segitiga memiliki banyak sisi sebanyak …", ...o, steps: ["2 sisi segitiga (alas dan atap) + 3 sisi tegak berbentuk persegi panjang = 5 sisi."], shape: "prisma", dims: { a: 6, ts: 4, t: 10 } }; },
  () => { const o = opsiTeks("8", ["5", "6", "12"]); return { id: nid(), level: 1, topic: "konsep", q: "Banyak rusuk pada limas segiempat adalah …", ...o, steps: ["4 rusuk alas (persegi) + 4 rusuk tegak yang menuju puncak = 8 rusuk."], shape: "limas", dims: { a: 6, t: 4 } }; },
  () => { const o = opsiTeks("Kerucut", ["Limas", "Prisma", "Tabung"]); return { id: nid(), level: 1, topic: "konsep", q: "Bangun ruang yang alasnya berbentuk lingkaran dan memiliki satu titik puncak adalah …", ...o, steps: ["Kerucut: alas lingkaran, satu titik puncak, dan satu sisi lengkung (selimut)."], shape: "kerucut", dims: { r: 7, t: 24 } }; },
  () => { const o = opsiTeks("cm³", ["cm", "cm²", "cm⁴"]); return { id: nid(), level: 1, topic: "konsep", q: "Satuan yang tepat untuk menyatakan VOLUME sebuah bangun ruang adalah …", ...o, steps: ["Volume mengukur ruang tiga dimensi, jadi satuannya kubik: cm³, m³, liter."], tip: "Volume = kubik (pangkat 3)." }; },
  () => { const o = opsiTeks("cm²", ["cm", "cm³", "cm⁴"]); return { id: nid(), level: 1, topic: "konsep", q: "Satuan yang tepat untuk LUAS PERMUKAAN adalah …", ...o, steps: ["Luas permukaan menjumlahkan luas bidang datar, jadi satuannya persegi: cm², m²."], tip: "Luas = persegi (pangkat 2)." }; },
  () => { const o = opsiTeks("Volume", ["Luas permukaan", "Keliling", "Panjang rusuk"]); return { id: nid(), level: 1, topic: "konsep", q: "Sebuah kotak diisi pasir sampai penuh. Yang kita hitung adalah …", ...o, steps: ["Pasir mengisi ruang di DALAM kotak → itu adalah volume kotak."], tip: "Diisi / dituang / ditampung = volume." }; },
  () => { const o = opsiTeks("Luas permukaan", ["Volume", "Tinggi", "Luas alas"]); return { id: nid(), level: 1, topic: "konsep", q: "Sebuah kotak kado dibungkus kertas kado di seluruh bagian luarnya. Yang kita hitung adalah …", ...o, steps: ["Kertas menutupi seluruh bidang LUAR kotak → itu luas permukaan."], tip: "Dibungkus / dicat / dilapisi = luas permukaan." }; },
  () => { const o = opsiTeks("Selimut kerucut", ["Alas kerucut", "Garis pelukis", "Tinggi kerucut"]); return { id: nid(), level: 1, topic: "konsep", q: "Sisi lengkung pada kerucut disebut …", ...o, steps: ["Sisi lengkung kerucut dinamakan selimut kerucut. Jika dibuka, bentuknya juring lingkaran."], shape: "kerucut", dims: { r: 7, t: 24 } }; },
  () => { const o = opsiTeks("Jarak dari titik puncak ke tepi lingkaran alas", ["Jarak dari puncak ke pusat alas", "Diameter lingkaran alas", "Keliling lingkaran alas"]); return { id: nid(), level: 1, topic: "konsep", q: "Yang dimaksud garis pelukis (s) pada kerucut adalah …", ...o, steps: ["Garis pelukis = sisi miring kerucut, dari puncak ke tepi lingkaran alas.", "s = √(r² + t²)"], shape: "kerucut", dims: { r: 7, t: 24 } }; },
  () => { const o = opsiTeks("Luas permukaan", ["Volume", "Luas alas", "Ketinggian air"]); return { id: nid(), level: 1, topic: "konsep", q: "Ayah mengecat seluruh bagian luar sebuah peti kayu. Banyak cat yang dibutuhkan berkaitan dengan …", ...o, steps: ["Cat menutupi bagian luar peti → luas permukaan peti."], tip: "Mengecat bagian luar = luas permukaan." }; },
  () => { const o = opsiTeks("Balok", ["Kubus", "Limas", "Prisma segitiga"]); return { id: nid(), level: 1, topic: "konsep", q: "Bangun ruang yang memiliki panjang, lebar, dan tinggi yang berbeda-beda serta 6 sisi persegi panjang adalah …", ...o, steps: ["Balok: 6 sisi persegi panjang, 12 rusuk (3 kelompok), 8 titik sudut."], shape: "balok", dims: { p: 8, l: 4, t: 3 } }; },
  () => { const o = opsiTeks("Kubus satuan", ["Penggaris", "Jangka", "Meteran"]); return { id: nid(), level: 1, topic: "konsep", q: "Untuk memahami arti volume, kita bisa mengisi bangun ruang dengan …", ...o, steps: ["Volume = banyak kubus satuan (rusuk 1 cm) yang dapat mengisi penuh bangun ruang tersebut."], shape: "kubus", dims: { s: 4 } }; },
  () => { const o = opsiTeks("6", ["4", "5", "8"]); return { id: nid(), level: 1, topic: "konsep", q: "Banyak sisi pada sebuah balok adalah …", ...o, steps: ["Balok memiliki 6 sisi: atas, alas, depan, belakang, kiri, kanan."], shape: "balok", dims: { p: 6, l: 4, t: 3 } }; },
  () => { const o = opsiTeks("9 rusuk dan 6 titik sudut", ["6 rusuk dan 4 titik sudut", "12 rusuk dan 8 titik sudut", "8 rusuk dan 5 titik sudut"]); return { id: nid(), level: 1, topic: "konsep", q: "Prisma segitiga memiliki …", ...o, steps: ["Prisma segitiga: 9 rusuk (3 di alas, 3 di atap, 3 tegak) dan 6 titik sudut."], shape: "prisma", dims: { a: 6, ts: 4, t: 9 } }; },
  () => { const o = opsiTeks("Limas", ["Kubus", "Balok", "Kerucut"]); return { id: nid(), level: 1, topic: "konsep", q: "Bangun ruang yang bentuknya seperti piramida Mesir adalah …", ...o, steps: ["Piramida adalah limas segiempat: alas persegi dan empat sisi segitiga yang bertemu di satu puncak."], shape: "limas", dims: { a: 6, t: 4 } }; },
];

/* ------------------------- LEVEL 2: PERHITUNGAN ------------------------- */

const HITUNG: Gen[] = [
  () => { const s = rand(3, 12); const v = V.kubus(s); const o = opsiAngka(v, [LP.kubus(s), s * s, v + s]); return { id: nid(), level: 2, topic: "volume", q: `Sebuah kubus memiliki panjang rusuk ${s} cm. Volume kubus tersebut adalah …`, ...o, steps: [`V = s × s × s`, `V = ${s} × ${s} × ${s}`, `V = ${fmt(v)} cm³`], shape: "kubus", dims: { s } }; },
  () => { const s = rand(4, 15); const l = LP.kubus(s); const o = opsiAngka(l, [V.kubus(s), s * s, 4 * s * s]); return { id: nid(), level: 2, topic: "luas", q: `Luas permukaan kubus dengan panjang rusuk ${s} cm adalah …`, ...o, steps: [`Luas satu sisi = ${s} × ${s} = ${fmt(s * s)} cm²`, `LP = 6 × ${fmt(s * s)} = ${fmt(l)} cm²`], shape: "kubus", dims: { s } }; },
  () => { const p = rand(5, 14), l = rand(3, 9), t = rand(3, 9); const v = V.balok(p, l, t); const o = opsiAngka(v, [LP.balok(p, l, t), p * l, v + t]); return { id: nid(), level: 2, topic: "volume", q: `Sebuah balok berukuran panjang ${p} cm, lebar ${l} cm, dan tinggi ${t} cm. Volumenya adalah …`, ...o, steps: [`V = p × l × t`, `V = ${p} × ${l} × ${t}`, `V = ${fmt(v)} cm³`], shape: "balok", dims: { p, l, t } }; },
  () => { const p = rand(6, 15), l = rand(3, 9), t = rand(3, 9); const a = LP.balok(p, l, t); const o = opsiAngka(a, [V.balok(p, l, t), 2 * (p * l + p * t), p * l + p * t + l * t]); return { id: nid(), level: 2, topic: "luas", q: `Luas permukaan balok dengan p = ${p} cm, l = ${l} cm, t = ${t} cm adalah …`, ...o, steps: [`LP = 2 × (p×l + p×t + l×t)`, `LP = 2 × (${p}×${l} + ${p}×${t} + ${l}×${t})`, `LP = 2 × (${fmt(p * l)} + ${fmt(p * t)} + ${fmt(l * t)}) = 2 × ${fmt(p * l + p * t + l * t)}`, `LP = ${fmt(a)} cm²`], shape: "balok", dims: { p, l, t } }; },
  () => { const [a, ts] = pick(PAIRS); const t = rand(5, 14); const v = V.prisma(a, ts, t); const o = opsiAngka(v, [a * ts * t, 0.5 * a * ts, v * 2]); return { id: nid(), level: 2, topic: "volume", q: `Prisma segitiga memiliki alas segitiga ${a} cm, tinggi segitiga ${ts} cm, dan tinggi prisma ${t} cm. Volumenya adalah …`, ...o, steps: [`Luas alas = ½ × ${a} × ${ts} = ${fmt(0.5 * a * ts)} cm²`, `V = luas alas × tinggi prisma`, `V = ${fmt(0.5 * a * ts)} × ${t} = ${fmt(v)} cm³`], shape: "prisma", dims: { a, ts, t }, tip: "Jangan lupa ada ½ pada luas segitiga!" }; },
  () => { const [a, ts] = pick(PAIRS); const t = rand(5, 12); const m = Math.sqrt(ts ** 2 + (a / 2) ** 2); const La = 0.5 * a * ts; const l = LP.prisma(a, ts, t); const o = opsiAngka(l, [2 * La, (a + 2 * m) * t, 2 * La + a * t]); return { id: nid(), level: 2, topic: "luas", q: `Luas permukaan prisma segitiga dengan alas segitiga ${a} cm, tinggi segitiga ${ts} cm, sisi miring ${fmt(m)} cm, dan tinggi prisma ${t} cm adalah …`, ...o, steps: [`Luas alas = ½ × ${a} × ${ts} = ${fmt(La)} cm²`, `Keliling alas = ${a} + ${fmt(m)} + ${fmt(m)} = ${fmt(a + 2 * m)} cm`, `Luas selimut = ${fmt(a + 2 * m)} × ${t} = ${fmt((a + 2 * m) * t)} cm²`, `LP = (2 × ${fmt(La)}) + ${fmt((a + 2 * m) * t)} = ${fmt(l)} cm²`], shape: "prisma", dims: { a, ts, t } }; },
  () => { const [a, t] = pick(PAIRS); const v = V.limas(a, t); const o = opsiAngka(v, [a * a * t, (a * a * t) / 2, a * a * t * 3]); return { id: nid(), level: 2, topic: "volume", q: `Limas segiempat beraturan memiliki sisi alas ${a} cm dan tinggi ${t} cm. Volumenya adalah …`, ...o, steps: [`Luas alas = ${a} × ${a} = ${fmt(a * a)} cm²`, `V = ⅓ × luas alas × tinggi`, `V = ⅓ × ${fmt(a * a)} × ${t} = ${fmt(a * a * t)} ÷ 3 = ${fmt(v)} cm³`], shape: "limas", dims: { a, t }, tip: "Volume limas = ⅓ × volume prisma yang alas dan tingginya sama." }; },
  () => { const [a, t] = pick(PAIRS); const tt = Math.sqrt(t ** 2 + (a / 2) ** 2); const l = LP.limas(a, t); const o = opsiAngka(l, [a * a, 4 * 0.5 * a * tt, a * a + 0.5 * a * tt]); return { id: nid(), level: 2, topic: "luas", q: `Limas segiempat beraturan dengan sisi alas ${a} cm, tinggi limas ${t} cm, dan tinggi sisi tegak ${fmt(tt)} cm. Luas permukaannya adalah …`, ...o, steps: [`Luas alas = ${a} × ${a} = ${fmt(a * a)} cm²`, `Luas satu segitiga = ½ × ${a} × ${fmt(tt)} = ${fmt(0.5 * a * tt)} cm²`, `Luas 4 segitiga = 4 × ${fmt(0.5 * a * tt)} = ${fmt(4 * 0.5 * a * tt)} cm²`, `LP = ${fmt(a * a)} + ${fmt(4 * 0.5 * a * tt)} = ${fmt(l)} cm²`], shape: "limas", dims: { a, t } }; },
  () => { const [r, t] = pick(CONES); const v = V.kerucut(r, t); const pi = piFor(r).label; const o = opsiAngka(v, [piFor(r).value * r * r * t, LP.kerucut(r, t), v * 3]); return { id: nid(), level: 2, topic: "volume", q: `Sebuah kerucut memiliki jari-jari ${r} cm dan tinggi ${t} cm (π = ${pi}). Volumenya adalah …`, ...o, steps: [`π = ${pi} karena ${piFor(r).ket}`, `V = ⅓ × π × r × r × t`, `V = ⅓ × ${pi} × ${r} × ${r} × ${t}`, `V = ${fmt(v)} cm³`], shape: "kerucut", dims: { r, t } }; },
  () => { const [r, t] = pick(CONES); const s = Math.sqrt(r * r + t * t); const pi = piFor(r).label; const l = LP.kerucut(r, t); const o = opsiAngka(l, [selimutKerucut(r, t), piFor(r).value * r * r, piFor(r).value * r * s * 2]); return { id: nid(), level: 2, topic: "luas", q: `Kerucut memiliki jari-jari ${r} cm dan tinggi ${t} cm sehingga garis pelukisnya ${fmt(s)} cm (π = ${pi}). Luas permukaannya adalah …`, ...o, steps: [`LP = π × r × (r + s)`, `LP = ${pi} × ${r} × (${r} + ${fmt(s)})`, `LP = ${pi} × ${r} × ${fmt(r + s)}`, `LP = ${fmt(l)} cm²`, `Cek: luas alas ${fmt(piFor(r).value * r * r)} + luas selimut ${fmt(selimutKerucut(r, t))} = ${fmt(l)} cm²`], shape: "kerucut", dims: { r, t } }; },
  () => { const s = rand(5, 11); const v = V.kubus(s); const l = LP.kubus(s); const o = opsiTeks(`Volume ${fmt(v)} cm³ dan luas permukaan ${fmt(l)} cm²`, [`Volume ${fmt(l)} cm² dan luas permukaan ${fmt(v)} cm³`, `Volume ${fmt(v)} cm² dan luas permukaan ${fmt(l)} cm²`, `Volume ${fmt(v)} cm³ dan luas permukaan ${fmt(6 * s)} cm²`]); return { id: nid(), level: 2, topic: "luas", q: `Kubus dengan rusuk ${s} cm. Pasangan hasil yang BENAR adalah …`, ...o, steps: [`V = ${s} × ${s} × ${s} = ${fmt(v)} cm³ (satuan kubik)`, `LP = 6 × ${s} × ${s} = ${fmt(l)} cm² (satuan persegi)`], tip: "Angkanya boleh kebetulan sama, tetapi satuannya tidak boleh tertukar." }; },
  () => { const p = rand(4, 9), l = rand(3, 7), t = rand(3, 7); const v = V.balok(p, l, t); const k = v / 2; const o = opsiAngka(k, [v, v / 4, v * 2]); return { id: nid(), level: 2, topic: "volume", q: `Sebuah balok berukuran ${p} cm × ${l} cm × ${t} cm diisi air setengahnya. Volume air tersebut adalah …`, ...o, steps: [`Volume balok = ${p} × ${l} × ${t} = ${fmt(v)} cm³`, `Volume air = ½ × ${fmt(v)} = ${fmt(k)} cm³`], shape: "balok", dims: { p, l, t } }; },
];

/* --------------------------- LEVEL 3: SOAL CERITA --------------------------- */

const CERITA: Gen[] = [
  () => { const [p, l, t] = pick(AKUARIUM); const v = V.balok(p, l, t); const liter = v / 1000; const o = opsiAngka(liter, [v, liter * 10, p * l / 1000], " liter"); return { id: nid(), level: 3, topic: "cerita", q: `Akuarium berbentuk balok berukuran ${p} cm × ${l} cm × ${t} cm akan diisi air sampai penuh. Banyak air yang dibutuhkan adalah …`, ...o, steps: [`Volume akuarium = ${p} × ${l} × ${t} = ${fmt(v)} cm³`, `1 liter = 1.000 cm³`, `Banyak air = ${fmt(v)} ÷ 1.000 = ${fmt(liter)} liter`], shape: "balok", dims: { p, l, t }, tip: "Air yang mengisi wadah → VOLUME." }; },
  () => { const s = pick([12, 15, 18, 20, 25]); const l = LP.kubus(s); const o = opsiAngka(l, [V.kubus(s), s * s, 4 * s * s], " cm²"); return { id: nid(), level: 3, topic: "cerita", q: `Siti ingin membungkus kotak kado berbentuk kubus dengan rusuk ${s} cm menggunakan kertas kado. Luas kertas kado minimal yang diperlukan adalah …`, ...o, steps: [`Kertas menutupi seluruh sisi luar kotak → luas permukaan`, `Luas satu sisi = ${s} × ${s} = ${fmt(s * s)} cm²`, `LP = 6 × ${fmt(s * s)} = ${fmt(l)} cm²`], shape: "kubus", dims: { s }, tip: "Membungkus → LUAS PERMUKAAN." }; },
  () => { const [p, l, t] = pick(KARDUS); const a = LP.balok(p, l, t); const o = opsiAngka(a, [V.balok(p, l, t), p * l, 2 * (p * l)], " cm²"); return { id: nid(), level: 3, topic: "cerita", q: `Sebuah pabrik membuat kemasan kardus berbentuk balok berukuran ${p} cm × ${l} cm × ${t} cm. Luas karton yang dibutuhkan untuk membuat SATU kemasan adalah …`, ...o, steps: [`LP = 2 × (p×l + p×t + l×t)`, `LP = 2 × (${p}×${l} + ${p}×${t} + ${l}×${t})`, `LP = 2 × ${fmt(p * l + p * t + l * t)} = ${fmt(a)} cm²`], shape: "balok", dims: { p, l, t } }; },
  () => { const s = pick([40, 50, 60, 70]); const v = V.kubus(s); const liter = v / 1000; const o = opsiAngka(liter, [v, liter / 10, s * s * 6 / 1000], " liter"); return { id: nid(), level: 3, topic: "cerita", q: `Bak mandi berbentuk kubus dengan panjang rusuk ${s} cm diisi air sampai penuh. Volume air dalam bak mandi tersebut adalah …`, ...o, steps: [`V = s × s × s = ${s} × ${s} × ${s} = ${fmt(v)} cm³`, `${fmt(v)} cm³ = ${fmt(liter)} liter`], shape: "kubus", dims: { s } }; },
  () => { const [r, t] = pick([[7, 24], [7, 18], [14, 15], [21, 20], [5, 12]] as [number, number][]); const v = V.kerucut(r, t); const o = opsiAngka(v, [piFor(r).value * r * r * t, v * 3, LP.kerucut(r, t)], " cm³"); return { id: nid(), level: 3, topic: "cerita", q: `Cetakan nasi tumpeng berbentuk kerucut dengan jari-jari ${r} cm dan tinggi ${t} cm (π = ${piFor(r).label}). Volume nasi yang dapat mengisi cetakan sampai penuh adalah …`, ...o, steps: [`V = ⅓ × π × r² × t`, `V = ⅓ × ${piFor(r).label} × ${r} × ${r} × ${t}`, `V = ${fmt(v)} cm³`], shape: "kerucut", dims: { r, t } }; },
  () => { const [r, t] = pick([[7, 24], [21, 20], [5, 12], [14, 48]] as [number, number][]); const s = Math.sqrt(r * r + t * t); const sel = selimutKerucut(r, t); const o = opsiAngka(sel, [LP.kerucut(r, t), piFor(r).value * r * r, 2 * sel], " cm²"); return { id: nid(), level: 3, topic: "cerita", q: `Topi ulang tahun berbentuk kerucut dengan jari-jari ${r} cm dan garis pelukis ${fmt(s)} cm. Luas kertas yang dibutuhkan untuk membuat BAGIAN SELIMUT topi saja adalah … (π = ${piFor(r).label})`, ...o, steps: [`Luas selimut kerucut = π × r × s`, `= ${piFor(r).label} × ${r} × ${fmt(s)}`, `= ${fmt(sel)} cm²`], shape: "kerucut", dims: { r, t }, tip: "Soal meminta selimut saja, jadi alas lingkaran TIDAK ikut dihitung." }; },
  () => { const [p, l, t] = pick([[30, 20, 15], [40, 25, 20], [25, 15, 12]]); const a = LP.balok(p, l, t); const o = opsiAngka(a, [V.balok(p, l, t), p * l + p * t, a / 2], " cm²"); return { id: nid(), level: 3, topic: "cerita", q: `Sebuah peti kayu berbentuk balok berukuran ${p} cm × ${l} cm × ${t} cm akan dicat seluruh permukaan luarnya. Luas daerah yang dicat adalah …`, ...o, steps: [`Mengecat bagian luar → luas permukaan`, `LP = 2 × (${p}×${l} + ${p}×${t} + ${l}×${t})`, `LP = 2 × ${fmt(p * l + p * t + l * t)} = ${fmt(a)} cm²`], shape: "balok", dims: { p, l, t } }; },
  () => { const [a, ts] = pick(PAIRS); const t = rand(6, 12); const l = LP.prisma(a, ts, t); const m = Math.sqrt(ts ** 2 + (a / 2) ** 2); const o = opsiAngka(l, [V.prisma(a, ts, t), (a + 2 * m) * t, 2 * (0.5 * a * ts)], " cm²"); return { id: nid(), level: 3, topic: "cerita", q: `Kemasan cokelat berbentuk prisma segitiga dengan alas segitiga ${a} cm, tinggi segitiga ${ts} cm, sisi miring ${fmt(m)} cm, dan tinggi prisma ${t} cm. Luas karton untuk membuat kemasan itu adalah …`, ...o, steps: [`Luas alas = ½ × ${a} × ${ts} = ${fmt(0.5 * a * ts)} cm²`, `Keliling alas = ${a} + ${fmt(m)} + ${fmt(m)} = ${fmt(a + 2 * m)} cm`, `Luas selimut = ${fmt(a + 2 * m)} × ${t} = ${fmt((a + 2 * m) * t)} cm²`, `LP = ${fmt(a * ts)} + ${fmt((a + 2 * m) * t)} = ${fmt(l)} cm²`], shape: "prisma", dims: { a, ts, t } }; },
  () => { const [a, t] = pick(PAIRS); const l = LP.limas(a, t); const tt = Math.sqrt(t ** 2 + (a / 2) ** 2); const o = opsiAngka(l, [V.limas(a, t), a * a, 4 * 0.5 * a * tt], " cm²"); return { id: nid(), level: 3, topic: "cerita", q: `Hiasan atap berbentuk limas segiempat beraturan dengan sisi alas ${a} cm dan tinggi sisi tegak ${fmt(tt)} cm. Seluruh permukaan luarnya akan dilapisi kertas emas. Luas kertas emas yang dibutuhkan adalah …`, ...o, steps: [`Luas alas = ${a} × ${a} = ${fmt(a * a)} cm²`, `Luas 4 segitiga = 4 × (½ × ${a} × ${fmt(tt)}) = ${fmt(4 * 0.5 * a * tt)} cm²`, `LP = ${fmt(a * a)} + ${fmt(4 * 0.5 * a * tt)} = ${fmt(l)} cm²`], shape: "limas", dims: { a, t } }; },
  () => { const [p, l, t] = pick(AKUARIUM); const h = t - pick([5, 10]); const v = p * l * h; const liter = v / 1000; const o = opsiAngka(liter, [p * l * t / 1000, liter / 2, p * l / 1000], " liter"); return { id: nid(), level: 3, topic: "cerita", q: `Akuarium berbentuk balok berukuran ${p} cm × ${l} cm × ${t} cm diisi air setinggi ${h} cm. Volume air di dalam akuarium adalah …`, ...o, steps: [`Air hanya menempati bagian bawah setinggi ${h} cm`, `Volume air = p × l × tinggi air = ${p} × ${l} × ${h} = ${fmt(v)} cm³`, `${fmt(v)} cm³ = ${fmt(liter)} liter`], shape: "balok", dims: { p, l, t }, tip: "Kalau air tidak penuh, tingginya pakai tinggi air, bukan tinggi wadah." }; },
  () => { const s = pick([10, 12, 15]); const v = V.kubus(s); const k = 1; const o = opsiAngka(v / (k ** 3), [v * k, LP.kubus(s), v / 2], " buah"); return { id: nid(), level: 3, topic: "cerita", q: `Kotak berbentuk kubus dengan rusuk ${s} cm akan diisi kubus satuan berukuran 1 cm. Banyak kubus satuan yang dapat masuk sampai penuh adalah …`, ...o, steps: [`Banyak kubus satuan = volume kotak ÷ volume satu kubus satuan`, `= (${s} × ${s} × ${s}) ÷ (1 × 1 × 1)`, `= ${fmt(v)} buah`], shape: "kubus", dims: { s } }; },
  () => { const [p, l, t] = pick(KARDUS); const n = pick([5, 10, 20]); const total = LP.balok(p, l, t) * n; const o = opsiAngka(total, [LP.balok(p, l, t), total / n, V.balok(p, l, t) * n], " cm²"); return { id: nid(), level: 3, topic: "cerita", q: `Sebuah kardus balok berukuran ${p} cm × ${l} cm × ${t} cm. Jika akan dibuat ${n} kardus, luas karton seluruhnya adalah …`, ...o, steps: [`LP satu kardus = 2 × (${p}×${l} + ${p}×${t} + ${l}×${t}) = ${fmt(LP.balok(p, l, t))} cm²`, `LP ${n} kardus = ${n} × ${fmt(LP.balok(p, l, t))} = ${fmt(total)} cm²`], shape: "balok", dims: { p, l, t } }; },
];

/* ------------------------------ LEVEL 4: HOTS ------------------------------ */

const HOTS: Gen[] = [
  () => { const s = rand(3, 9); const o = opsiTeks("8 kali", ["2 kali", "4 kali", "6 kali"]); return { id: nid(), level: 4, topic: "hots", q: `Kubus A memiliki rusuk ${s} cm. Kubus B memiliki rusuk dua kali kubus A (${2 * s} cm). Volume kubus B dibandingkan volume kubus A adalah …`, ...o, steps: [`Volume A = ${s}³ = ${fmt(V.kubus(s))} cm³`, `Volume B = ${2 * s}³ = ${fmt(V.kubus(2 * s))} cm³`, `${fmt(V.kubus(2 * s))} ÷ ${fmt(V.kubus(s))} = 8`, `Jadi volume menjadi 8 kali (2³ = 8).`], tip: "Jika rusuk dikali n, volume menjadi n³ kali dan luas permukaan menjadi n² kali." }; },
  () => { const n = rand(2, 4); const o = opsiTeks(`${n ** 3} kali`, [`${n} kali`, `${n ** 2} kali`, `${n * 6} kali`]); return { id: nid(), level: 4, topic: "hots", q: `Semua rusuk sebuah kubus diperbesar ${n} kali. Volumenya menjadi … semula.`, ...o, steps: [`Volume = s × s × s`, `Jika setiap s dikali ${n}: (${n}s)³ = ${n ** 3} × s³`, `Jadi volume menjadi ${n ** 3} kali semula.`], tip: "Luas permukaannya menjadi n² = " + n ** 2 + " kali." }; },
  () => { const s = pick([5, 6, 7, 8, 9, 10, 12]); const v = V.kubus(s); const o = opsiAngka(s, [v / 6, Math.sqrt(v), s + 1], " cm"); return { id: nid(), level: 4, topic: "hots", q: `Volume sebuah kubus adalah ${fmt(v)} cm³. Panjang rusuk kubus tersebut adalah …`, ...o, steps: [`V = s³ → s = ∛V`, `s = ∛${fmt(v)} = ${s} cm`, `Cek: ${s} × ${s} × ${s} = ${fmt(v)} cm³ ✓`], shape: "kubus", dims: { s } }; },
  () => { const t = rand(3, 9), p = rand(5, 12), l = rand(3, 8); const v = V.balok(p, l, t); const o = opsiAngka(t, [v / p, v - p * l, l], " cm"); return { id: nid(), level: 4, topic: "hots", q: `Sebuah balok memiliki volume ${fmt(v)} cm³. Jika panjangnya ${p} cm dan lebarnya ${l} cm, maka tinggi balok tersebut adalah …`, ...o, steps: [`V = p × l × t`, `${fmt(v)} = ${p} × ${l} × t`, `${fmt(v)} = ${fmt(p * l)} × t`, `t = ${fmt(v)} ÷ ${fmt(p * l)} = ${t} cm`], shape: "balok", dims: { p, l, t } }; },
  () => { const k = pick([2, 3, 4]); const p = k * rand(3, 5), l = k * rand(2, 4), t = k * rand(2, 4); const n = (p / k) * (l / k) * (t / k); const o = opsiAngka(n, [V.balok(p, l, t), n * k, p + l + t], " buah"); return { id: nid(), level: 4, topic: "hots", q: `Sebuah kardus berukuran ${p} cm × ${l} cm × ${t} cm akan diisi kubus-kubus kecil dengan rusuk ${k} cm. Banyak kubus kecil yang dapat masuk adalah …`, ...o, steps: [`Sepanjang panjang: ${p} ÷ ${k} = ${p / k} kubus`, `Sepanjang lebar: ${l} ÷ ${k} = ${l / k} kubus`, `Sepanjang tinggi: ${t} ÷ ${k} = ${t / k} kubus`, `Total = ${p / k} × ${l / k} × ${t / k} = ${fmt(n)} buah`], shape: "balok", dims: { p, l, t }, tip: "Cara cepat: volume kardus ÷ volume kubus kecil." }; },
  () => { const s = rand(4, 9); const benar = LP.kubus(s); const salah = s * s; const o = opsiTeks("Hanya menghitung satu sisi, seharusnya dikalikan 6", ["Seharusnya dikalikan 3", "Seharusnya memakai satuan cm³", "Seharusnya rusuknya dijumlahkan"]); return { id: nid(), level: 4, topic: "hots", q: `Andi menghitung luas permukaan kubus dengan rusuk ${s} cm. Ia menulis: "LP = ${s} × ${s} = ${salah} cm²". Kesalahan Andi adalah …`, ...o, steps: [`${s} × ${s} = ${salah} cm² hanyalah luas SATU sisi`, `Kubus memiliki 6 sisi yang sama luas`, `LP yang benar = 6 × ${salah} = ${fmt(benar)} cm²`] }; },
  () => { const [a, t] = pick(PAIRS); const vp = a * a * t; const vl = V.limas(a, t); const o = opsiAngka(vl, [vp, vp / 2, vp * 3], " cm³"); return { id: nid(), level: 4, topic: "hots", q: `Sebuah prisma dan sebuah limas memiliki alas persegi ${a} cm dan tinggi yang sama, yaitu ${t} cm. Jika volume prisma ${fmt(vp)} cm³, maka volume limas adalah …`, ...o, steps: [`Volume prisma = luas alas × tinggi = ${fmt(a * a)} × ${t} = ${fmt(vp)} cm³`, `Volume limas = ⅓ × luas alas × tinggi`, `= ⅓ × ${fmt(vp)} = ${fmt(vl)} cm³`], shape: "limas", dims: { a, t }, tip: "Butuh 3 limas penuh untuk mengisi 1 prisma yang alas dan tingginya sama." }; },
  () => { const s = pick([10, 12, 15]); const n = pick([8, 10, 12]); const total = LP.kubus(s) * n; const o = opsiAngka(total, [LP.kubus(s), total / 2, V.kubus(s) * n], " cm²"); return { id: nid(), level: 4, topic: "hots", q: `Sebuah toko akan membuat ${n} kotak kado berbentuk kubus dengan rusuk ${s} cm. Luas kertas kado yang dibutuhkan seluruhnya adalah …`, ...o, steps: [`LP satu kotak = 6 × ${s} × ${s} = ${fmt(LP.kubus(s))} cm²`, `LP ${n} kotak = ${n} × ${fmt(LP.kubus(s))} = ${fmt(total)} cm²`, `${fmt(total)} cm² = ${fmt(round(total / 10000, 3))} m²`], shape: "kubus", dims: { s } }; },
  () => { const set: [[number, number, number], [number, number, number]][] = [
      [[2, 2, 9], [3, 3, 4]], [[1, 6, 6], [2, 3, 6]], [[4, 4, 4], [2, 4, 8]], [[5, 5, 4], [10, 2, 5]], [[3, 4, 5], [2, 6, 5]],
    ];
    const pasangan = pick(set);
    const [a, b, c] = pasangan[0]; const alt = pasangan[1];
    const l1 = LP.balok(a, b, c), l2 = LP.balok(alt[0], alt[1], alt[2]);
    const lebih = l1 >= l2 ? `${a} cm × ${b} cm × ${c} cm` : `${alt[0]} cm × ${alt[1]} cm × ${alt[2]} cm`;
    const o = opsiTeks(lebih, [lebih === `${a} cm × ${b} cm × ${c} cm` ? `${alt[0]} cm × ${alt[1]} cm × ${alt[2]} cm` : `${a} cm × ${b} cm × ${c} cm`, "Keduanya sama besar", "Tidak dapat ditentukan"]);
    return { id: nid(), level: 4, topic: "hots", q: `Dua balok memiliki volume yang sama, yaitu ${fmt(a * b * c)} cm³. Balok I berukuran ${a} cm × ${b} cm × ${c} cm dan balok II berukuran ${alt[0]} cm × ${alt[1]} cm × ${alt[2]} cm. Balok yang luas permukaannya LEBIH BESAR adalah …`, ...o, steps: [`LP balok I = 2 × (${a}×${b} + ${a}×${c} + ${b}×${c}) = ${fmt(l1)} cm²`, `LP balok II = 2 × (${alt[0]}×${alt[1]} + ${alt[0]}×${alt[2]} + ${alt[1]}×${alt[2]}) = ${fmt(l2)} cm²`, `${fmt(Math.max(l1, l2))} > ${fmt(Math.min(l1, l2))} → ${lebih} lebih besar`], tip: "Volume sama belum tentu luas permukaan sama. Bentuk yang makin 'pipih/panjang' biasanya luas permukaannya makin besar." }; },
  () => { const r = pick([7, 14, 21]); const t = pick([10, 20, 24]); const o = opsiTeks("4 kali", ["2 kali", "3 kali", "8 kali"]); return { id: nid(), level: 4, topic: "hots", q: `Jari-jari sebuah kerucut diperbesar 2 kali sedangkan tingginya tetap. Volumenya menjadi … semula.`, ...o, steps: [`V = ⅓ × π × r² × t`, `Jika r menjadi 2r: V baru = ⅓ × π × (2r)² × t = 4 × (⅓ π r² t)`, `Contoh: r = ${r}, t = ${t} → V = ${fmt(V.kerucut(r, t))} cm³`, `r = ${2 * r}, t = ${t} → V = ${fmt(V.kerucut(2 * r, t))} cm³ = 4 × ${fmt(V.kerucut(r, t))}`], tip: "Karena r dikuadratkan, memperbesar r 2 kali membuat volume 4 kali." }; },
  () => { const [s, k] = pick([[6, 2], [6, 3], [8, 2], [9, 3], [10, 2], [12, 3], [12, 4], [4, 2]] as [number, number][]); const n = V.kubus(s) / V.kubus(k); const o = opsiAngka(n, [V.kubus(s), s * s * 6 / (k * k), n / k], " buah"); return { id: nid(), level: 4, topic: "hots", q: `Kubus besar berusuk ${s} cm dipotong-potong menjadi kubus kecil berusuk ${k} cm. Banyak kubus kecil yang diperoleh adalah …`, ...o, steps: [`Volume kubus besar = ${s}³ = ${fmt(V.kubus(s))} cm³`, `Volume kubus kecil = ${k}³ = ${fmt(V.kubus(k))} cm³`, `Banyak kubus kecil = ${fmt(V.kubus(s))} ÷ ${fmt(V.kubus(k))} = ${fmt(n)} buah`], shape: "kubus", dims: { s } }; },
  () => { const [p, l, t] = pick(KARDUS); const lp = LP.balok(p, l, t); const tanpaAtas = lp - p * l; const o = opsiAngka(tanpaAtas, [lp, tanpaAtas + p * l, 2 * p * l], " cm²"); return { id: nid(), level: 4, topic: "hots", q: `Sebuah kotak tanpa tutup berbentuk balok berukuran ${p} cm × ${l} cm × ${t} cm akan dicat bagian luarnya. Luas daerah yang dicat adalah …`, ...o, steps: [`LP balok utuh = ${fmt(lp)} cm²`, `Kotak tanpa tutup → kurangi luas sisi atas (p × l) = ${fmt(p * l)} cm²`, `Luas dicat = ${fmt(lp)} − ${fmt(p * l)} = ${fmt(tanpaAtas)} cm²`], shape: "balok", dims: { p, l, t }, tip: "Baca soal dengan teliti: 'tanpa tutup' berarti ada satu sisi yang tidak dihitung." }; },
];

export const BANK: Record<number, Gen[]> = { 1: KONSEP, 2: HITUNG, 3: CERITA, 4: HOTS };

/** Ambil n soal dari sebuah level tanpa mengulang generator yang sama selama masih cukup. */
export function buatSoal(level: 1 | 2 | 3 | 4, n: number, sudahDipakai: Set<string> = new Set()): Question[] {
  const gens = [...BANK[level]];
  const out: Question[] = [];
  let guard = 0;
  while (out.length < n && guard++ < n * 6) {
    const shuffled = shuffle(gens);
    for (const g of shuffled) {
      if (out.length >= n) break;
      const q = g();
      const key = `${level}:${q.q}`;
      if (sudahDipakai.has(key)) continue;
      sudahDipakai.add(key);
      out.push(q);
    }
    if (sudahDipakai.size > gens.length * 3) sudahDipakai.clear();
  }
  return out;
}

/** Komposisi kuis: 20% konsep, 30% volume, 30% luas, 20% cerita + HOTS. */
export function buatSoalKuis(total = 20): Question[] {
  const nKonsep = Math.max(3, Math.round(total * 0.2));
  const nVol = Math.round(total * 0.3);
  const nLuas = Math.round(total * 0.3);
  const nCerita = total - nKonsep - nVol - nLuas;

  const all: Question[] = [];
  const used = new Set<string>();
  const ambil = (levels: (1 | 2 | 3 | 4)[], topik: TopicKey[], n: number) => {
    let guard = 0;
    while (all.filter((q) => topik.includes(q.topic)).length < n && guard++ < 60) {
      const lv = pick(levels);
      const q = pick(BANK[lv])();
      if (!topik.includes(q.topic)) continue;
      const key = `${q.q}`;
      if (used.has(key)) continue;
      used.add(key);
      all.push(q);
    }
  };
  ambil([1], ["konsep"], nKonsep);
  ambil([2, 3], ["volume"], nVol);
  ambil([2, 3], ["luas"], nLuas);
  ambil([3, 4], ["cerita", "hots"], nCerita);
  return shuffle(all).slice(0, total);
}
