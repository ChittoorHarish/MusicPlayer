import React, { useEffect, useRef, useMemo } from "react";

export default function WaveOrb({ 
  color = "#00D8C6", 
  size = 100, 
  pulse = 0, 
  label = "Track" 
}) {
  const ref = useRef();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--pulse-scale", 1 + pulse * 0.2);
    el.style.setProperty("--glow", color);
  }, [pulse, color]);

  // Generate random initial positions for each symbol
  const symbolPositions = useMemo(
    () =>
      Array.from({ length: 6 }).map(() => ({
        top: `${20 + Math.random() * 60}%`,
        left: `${20 + Math.random() * 60}%`,
        fontSize: `${12 + Math.random() * 10}px`,
      })),
    []
  );

  const symbols = ["♪", "♫", "♬", "♩", "♭", "♯"];

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div
        ref={ref}
        className="orb relative rounded-full flex items-center justify-center overflow-visible"
        style={{
          width: size,
          height: size,
          boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Glow layer */}
        <div
          className="absolute inset-0 rounded-full blur-lg"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${color}, transparent 45%)`,
            opacity: 0.9,
          }}
        />

        {/* Music symbols that move with pulse */}
        <div className="absolute inset-0 overflow-visible">
          {symbols.map((sym, i) => {
            // Animation speed adjusts with pulse (higher = faster beat)
            const duration = Math.max(2 - pulse * 1.2 + i * 0.1, 0.8);
            return (
              <div
                key={i}
                className={`absolute text-white font-bold select-none`}
                style={{
                  top: symbolPositions[i].top,
                  left: symbolPositions[i].left,
                  fontSize: symbolPositions[i].fontSize,
                  color,
                  opacity: 0.75 + pulse * 0.25,
                  textShadow: `0 0 ${6 + pulse * 12}px ${color}, 0 0 ${10 + pulse * 20}px ${color}`,
                  animation: pulse
                    ? `float-${i % 3} ${duration}s ease-in-out infinite`
                    : "none",
                  transform: `scale(${1 + pulse * 0.2})`,
                  transition: "transform 0.25s ease-out",
                }}
              >
                {sym}
              </div>
            );
          })}
        </div>

        {/* Center inner glow circle */}
        <div
          className="relative w-3/4 h-3/4 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid rgba(255,255,255,0.08)`,
            transform: `scale(${1 + pulse * 0.08})`,
            transition: "transform 200ms ease-out",
          }}
        >
          {pulse > 0 && (
            <div
              className="absolute rounded-full blur-xl"
              style={{
                width: "100%",
                height: "100%",
                background: `radial-gradient(circle, ${color}55, transparent 70%)`,
                transform: `scale(${1 + pulse * 0.3})`,
                transition: "transform 0.15s ease-out",
              }}
            />
          )}
        </div>
      </div>

      <div className="text-[12px] text-[rgba(255,255,255,0.7)] text-center mt-2">
        {label}
      </div>

      <style jsx>{`
        .orb {
          transition: transform 180ms cubic-bezier(.2,.9,.3,1), box-shadow 220ms;
          transform-origin: center;
          --pulse-scale: 1.02;
        }
        .orb:hover {
          transform: translateY(-6px) scale(var(--pulse-scale));
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }
        .orb:active {
          transform: translateY(-2px) scale(0.96);
        }
        .orb::after {
          content: "";
          position: absolute;
          inset: -8px;
          border-radius: 999px;
          background: radial-gradient(circle at 40% 30%, var(--glow, #00D8C6), transparent 35%);
          filter: blur(18px);
          opacity: 0.8;
          transition: opacity 220ms;
        }

        /* Multiple floating patterns for variation */
        @keyframes float-0 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translateY(3px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(-6deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(-3px) rotate(0deg); }
          50% { transform: translateY(10px) rotate(8deg); }
        }
      `}</style>
    </div>
  );
}