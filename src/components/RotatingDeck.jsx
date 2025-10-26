import React from "react";

export default function RotatingDeck({ playing = false, size = 300 }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label="Audio Deck"
      role="region"
    >
      {/* Shadow / depth */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: "0 20px 60px rgba(2,8,23,0.6)",
          transform: "translateZ(-10px)",
        }}
      />

      {/* Glass plate */}
      <div
        className={`rounded-full backdrop-blur-xl border border-[rgba(255,255,255,0.06)] p-4 flex items-center justify-center
          ${playing ? "animate-deck-spin" : "pause-deck"}`}
        style={{
          width: size - 20,
          height: size - 20,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.12))",
        }}
      >
        {/* Rim waveform ring */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          aria-hidden
          focusable="false"
        >
          <defs>
            <radialGradient id="g1">
              <stop offset="0%" stopColor="rgba(155,125,255,0.65)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="f1" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            cx="100"
            cy="100"
            r="88"
            stroke="url(#g1)"
            strokeWidth="6"
            fill="none"
            style={{ filter: "url(#f1)" }}
            className={playing ? "rim-pulse" : ""}
          />

          {/* <path
            d="M12 100 Q45 40 88 100 T164 100 T188 100"
            stroke="rgba(0,216,198,0.9)"
            strokeWidth="2.4"
            fill="none"
            className={playing ? "wave-animate" : ""}
            style={{ strokeLinecap: "round" }}
          /> */}
        </svg>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes deck-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-deck-spin {
          animation: deck-spin 12s linear infinite;
        }
        .pause-deck {
          animation-play-state: paused;
        }
        .rim-pulse {
          animation: rim-pulse 1.6s ease-in-out infinite;
        }
        @keyframes rim-pulse {
          0% { stroke-opacity: 0.6; transform: scale(1); }
          50% { stroke-opacity: 1; transform: scale(1.02); }
          100% { stroke-opacity: 0.6; transform: scale(1); }
        }
        .wave-animate {
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          animation: wave-move 1.2s linear infinite;
        }
        @keyframes wave-move {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
