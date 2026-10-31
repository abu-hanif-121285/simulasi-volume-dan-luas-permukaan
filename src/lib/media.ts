import { useCallback, useEffect, useRef, useState } from "react";

/* --------------------------------- audio --------------------------------- */

let ac: AudioContext | null = null;
let soundOn = true;

export const setSoundOn = (v: boolean) => {
  soundOn = v;
  if (!v) stopSpeak();
};

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ac) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
    }
    if (ac.state === "suspended") void ac.resume();
    return ac;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.16) {
  const a = ctx();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, a.currentTime + start);
  g.gain.setValueAtTime(0.0001, a.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, a.currentTime + start + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
  osc.connect(g).connect(a.destination);
  osc.start(a.currentTime + start);
  osc.stop(a.currentTime + start + dur + 0.05);
}

export const sfx = {
  click: () => soundOn && tone(520, 0, 0.07, "triangle", 0.08),
  pop: () => soundOn && tone(760, 0, 0.09, "sine", 0.1),
  slide: () => soundOn && tone(330, 0, 0.05, "sine", 0.05),
  correct: () => {
    if (!soundOn) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.08, 0.22, "triangle", 0.14));
  },
  wrong: () => {
    if (!soundOn) return;
    tone(220, 0, 0.18, "sawtooth", 0.09);
    tone(165, 0.12, 0.28, "sawtooth", 0.09);
  },
  win: () => {
    if (!soundOn) return;
    [523.25, 587.33, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, i * 0.1, 0.3, "triangle", 0.13));
  },
  tick: () => soundOn && tone(880, 0, 0.04, "square", 0.04),
  fill: (i: number) => soundOn && tone(300 + i * 26, 0, 0.07, "sine", 0.07),
};

/* ------------------------- text to speech (Indonesia) ------------------------- */

export const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

export function speak(text: string, onEnd?: () => void) {
  if (!speechSupported) {
    onEnd?.();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "id-ID";
    u.rate = 0.94;
    u.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find((v) => v.lang?.toLowerCase().startsWith("id"));
    if (idVoice) u.voice = idVoice;
    if (onEnd) u.onend = () => onEnd();
    u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
  } catch {
    onEnd?.();
  }
}

export function stopSpeak() {
  if (!speechSupported) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const textRef = useRef("");

  useEffect(() => () => stopSpeak(), []);

  const baca = useCallback((text: string) => {
    if (speaking && textRef.current === text) {
      stopSpeak();
      setSpeaking(false);
      return;
    }
    textRef.current = text;
    setSpeaking(true);
    speak(text, () => setSpeaking(false));
  }, [speaking]);

  const stop = useCallback(() => { stopSpeak(); setSpeaking(false); }, []);

  return { speaking, baca, stop, supported: speechSupported };
}
