import React, { useState, useEffect } from "react";
import YouTube from "react-youtube";

export default function VideoPreviewModal({ video, isOpen, onClose }) {
  const [rings, setRings] = useState([]);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Floating rings (holographic waves)
    const tempRings = [];
    for (let i = 0; i < 6; i++) {
      tempRings.push({
        delay: Math.random() * 3,
        hue: 180 + Math.random() * 180, // cyan → magenta
        size: Math.random() * 150 + 200,
        top: Math.random() * 60 + 20,
        left: Math.random() * 60 + 20,
      });
    }
    setRings(tempRings);

    // Floating particles
    const tempParticles = [];
    for (let i = 0; i < 30; i++) {
      tempParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        hue: 160 + Math.random() * 200,
        delay: Math.random() * 4,
      });
    }
    setParticles(tempParticles);
  }, []);

  if (!isOpen) return null;

  const videoId = video?.id;
  const opts = {
    height: "390",
    width: "640",
    playerVars: { autoplay: 1 },
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md z-50 overflow-hidden">
      <div className="relative w-full max-w-5xl rounded-3xl p-8 overflow-hidden border border-cyan-400/20 bg-gradient-to-b from-[#020617] via-[#05091f] to-black shadow-[0_0_80px_rgba(0,255,255,0.15)]">
        {/* 🔮 Pulsing holographic rings */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {rings.map((r, i) => (
            <div
              key={i}
              className="absolute animate-ring"
              style={{
                top: `${r.top}%`,
                left: `${r.left}%`,
                width: `${r.size}px`,
                height: `${r.size}px`,
                borderRadius: "50%",
                border: `1px solid hsla(${r.hue}, 100%, 70%, 0.3)`,
                boxShadow: `0 0 20px hsla(${r.hue}, 100%, 60%, 0.4)`,
                animationDelay: `${r.delay}s`,
                transform: "translate(-50%, -50%)",
                filter: "blur(1px)",
              }}
            />
          ))}
        </div>

        {/* 🌌 Floating neon particles */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute animate-particle"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: `radial-gradient(circle, hsla(${p.hue},100%,60%,0.9), transparent)`,
                borderRadius: "50%",
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* 💠 Neon floor reflection grid */}
        <div className="absolute bottom-0 left-0 w-full h-48 bg-[linear-gradient(90deg,rgba(0,255,255,0.2)_1px,transparent_1px),linear-gradient(0deg,rgba(0,255,255,0.2)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20 blur-sm"></div>
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-cyan-500/20 via-purple-500/10 to-transparent blur-2xl"></div>

        {/* 🎥 Video section */}
        <div className="relative z-10 flex flex-col items-center justify-center">
           <h3 className="text-2xl font-semibold text-white mb-4 text-center drop-shadow-lg">
            {video?.title}
          </h3>

          <div className="relative aspect-video overflow-hidden rounded-2xl border border-cyan-400/30 shadow-[0_0_60px_rgba(0,255,255,0.3)] bg-black/40 backdrop-blur-sm">
            <YouTube videoId={videoId} opts={opts} className="w-full h-full" />
            {/* Glowing video frame effect */}
            <div className="absolute inset-0 border border-cyan-300/10 rounded-2xl shadow-[inset_0_0_40px_rgba(0,255,255,0.2)] pointer-events-none"></div>
          </div>

           <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* 🔁 Keyframe Animations */}
      <style>{`
        @keyframes ring {
          0%, 100% { transform: scale(0.9) translate(-50%, -50%); opacity: 0.5; }
          50% { transform: scale(1.1) translate(-50%, -50%); opacity: 1; }
        }
        .animate-ring {
          animation: ring 4s ease-in-out infinite;
        }

        @keyframes particle {
          0%, 100% { transform: translateY(0) scale(0.8); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
        .animate-particle {
          animation: particle 3.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

