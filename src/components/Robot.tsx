import { useEffect, useState } from "react";
import { Icon } from "./ui";
import { stopSpeak, useSpeech } from "../lib/media";
import { cn } from "../utils/cn";

export type Mood = "happy" | "think" | "cheer" | "wave";

export function Robot({ mood = "happy", size = 120, className }: { mood?: Mood; size?: number; className?: string }) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 130);
    }, 2600 + Math.random() * 2200);
    return () => clearInterval(t);
  }, []);

  const eye = mood === "cheer" ? "arc" : blink ? "line" : "dot";

  return (
    <svg viewBox="0 0 140 150" width={size} height={(size * 150) / 140} className={cn("floaty overflow-visible", className)} role="img" aria-label="Robot pemandu belajar">
      <defs>
        <linearGradient id="rb-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cfe9ef" />
        </linearGradient>
        <linearGradient id="rb-head" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#bfe3eb" />
        </linearGradient>
        <linearGradient id="rb-visor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0e5f70" />
          <stop offset="100%" stopColor="#07323c" />
        </linearGradient>
      </defs>

      {/* antena */}
      <g>
        <line x1="70" y1="26" x2="70" y2="12" stroke="#0c586a" strokeWidth="4" strokeLinecap="round" />
        <circle cx="70" cy="9" r="6.5" fill="#FFC24B" stroke="#d3950d" strokeWidth="2">
          <animate attributeName="r" values="6.5;7.8;6.5" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* lengan */}
      <g stroke="#0c586a" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M34 96 Q22 100 20 112" />
        <path d="M106 96 Q118 100 120 108" className={mood === "wave" ? "" : ""}>
          {mood === "wave" && <animateTransform attributeName="transform" type="rotate" values="0 106 96;-22 106 96;6 106 96;-22 106 96;0 106 96" dur="1.6s" repeatCount="indefinite" />}
        </path>
      </g>
      <circle cx="19" cy="115" r="7" fill="#FF6B57" stroke="#cf4230" strokeWidth="2.5" />
      <circle cx={mood === "wave" ? 122 : 121} cy={mood === "wave" ? 104 : 111} r="7" fill="#FF6B57" stroke="#cf4230" strokeWidth="2.5" />

      {/* badan */}
      <rect x="34" y="86" width="72" height="52" rx="16" fill="url(#rb-body)" stroke="#0c586a" strokeWidth="4" />
      <rect x="46" y="98" width="48" height="28" rx="9" fill="#0c586a" opacity="0.92" />
      <g fill="#21C3A4">
        <rect x="52" y="112" width="5" height="9" rx="1.5" />
        <rect x="61" y="106" width="5" height="15" rx="1.5" />
        <rect x="70" y="109" width="5" height="12" rx="1.5" />
        <rect x="79" y="102" width="5" height="19" rx="1.5" fill="#FFC24B" />
      </g>
      <circle cx="44" cy="132" r="3" fill="#FF6B57" />
      <circle cx="96" cy="132" r="3" fill="#FFC24B" />

      {/* kepala */}
      <g>
        {mood === "think" && <animateTransform attributeName="transform" type="rotate" values="0 70 60;-6 70 60;0 70 60" dur="3.4s" repeatCount="indefinite" />}
        <rect x="26" y="26" width="88" height="62" rx="22" fill="url(#rb-head)" stroke="#0c586a" strokeWidth="4" />
        <rect x="35" y="38" width="70" height="38" rx="15" fill="url(#rb-visor)" />
        {/* mata */}
        {eye === "dot" && (
          <g fill="#7fd2de">
            <circle cx="56" cy="56" r="7" />
            <circle cx="84" cy="56" r="7" />
            <circle cx="58.5" cy="53.5" r="2.2" fill="#fff" />
            <circle cx="86.5" cy="53.5" r="2.2" fill="#fff" />
          </g>
        )}
        {eye === "line" && (
          <g stroke="#7fd2de" strokeWidth="4" strokeLinecap="round">
            <line x1="50" y1="56" x2="62" y2="56" />
            <line x1="78" y1="56" x2="90" y2="56" />
          </g>
        )}
        {eye === "arc" && (
          <g stroke="#FFC24B" strokeWidth="4" strokeLinecap="round" fill="none">
            <path d="M50 59a6.5 6.5 0 0 1 12 0" />
            <path d="M78 59a6.5 6.5 0 0 1 12 0" />
          </g>
        )}
        {/* pipi & mulut */}
        <circle cx="42" cy="68" r="4" fill="#FF6B57" opacity="0.55" />
        <circle cx="98" cy="68" r="4" fill="#FF6B57" opacity="0.55" />
        <path
          d={mood === "think" ? "M62 80h16" : mood === "cheer" ? "M60 76a10 10 0 0 0 20 0z" : "M61 77a9 9 0 0 0 18 0"}
          fill={mood === "cheer" ? "#FF8A72" : "none"}
          stroke="#0c586a"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        {/* telinga */}
        <rect x="18" y="48" width="10" height="20" rx="4" fill="#FFC24B" stroke="#0c586a" strokeWidth="3" />
        <rect x="112" y="48" width="10" height="20" rx="4" fill="#FFC24B" stroke="#0c586a" strokeWidth="3" />
      </g>
    </svg>
  );
}

export function RobotTalk({
  text, mood = "happy", title, size = 96, listen = true, className,
}: {
  text: string; mood?: Mood; title?: string; size?: number; listen?: boolean; className?: string;
}) {
  const { speaking, baca, supported } = useSpeech();
  useEffect(() => () => stopSpeak(), []);
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="shrink-0">
        <Robot mood={mood} size={size} />
      </div>
      <div className="bubble-in relative min-w-0 flex-1 rounded-2xl rounded-bl-sm border-2 border-laut-800/15 bg-white p-3.5 shadow-[0_10px_24px_-18px_rgba(6,49,60,.8)]">
        {title && <div className="mb-1 font-display text-xs font-extrabold uppercase tracking-[0.14em] text-laut-600">{title}</div>}
        <p className="text-[0.95rem] font-semibold leading-relaxed text-laut-900">{text}</p>
        {listen && supported && (
          <button
            onClick={() => (speaking ? stop() : baca(text))}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border-2 border-laut-600/25 px-2.5 py-1 text-[0.72rem] font-extrabold text-laut-700 transition hover:border-laut-600 hover:bg-laut-50"
          >
            <Icon name={speaking ? "pause" : "sound"} className="h-3.5 w-3.5" />
            {speaking ? "Hentikan" : "Dengarkan"}
          </button>
        )}
      </div>
    </div>
  );
}
