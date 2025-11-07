import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';

export default function VideoPreviewModal({ video, isOpen, onClose }) {
  const [rays, setRays] = useState([]);

  useEffect(() => {
    const temp = [];
    for (let i = 0; i < 12; i++) {
      temp.push({
        hue: 180 + Math.random() * 120, // teal to magenta
        delay: Math.random() * 2,
      });
    }
    setRays(temp);
  }, []);

  if (!isOpen) return null;

  const videoId = video?.id;
  const opts = {
    height: '390',
    width: '640',
    playerVars: { autoplay: 1 },
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-gradient-to-b from-black via-black/95 to-black p-6 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
        {/* ✨ Animated light rays from bottom */}
        <div className="absolute bottom-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {rays.map((r, i) => (
            <div
              key={i}
              className="absolute bottom-0 animate-dance-beam"
              style={{
                left: `${(i / rays.length) * 100}%`,
                width: `${100 / rays.length + 2}%`,
                height: '100%',
                background: `linear-gradient(to top, hsla(${r.hue}, 100%, 60%, 0.4), transparent)`,
                filter: 'blur(20px)',
                animationDelay: `${r.delay}s`,
              }}
            />
          ))}
        </div>

        {/* 🎵 Dance floor grid effect */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>

        {/* 🌈 Glow under the dance floor */}
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-cyan-400/40 via-pink-400/20 to-transparent blur-3xl pointer-events-none"></div>

        {/* Video content (centered) */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <h3 className="text-2xl font-semibold text-white mb-4 text-center drop-shadow-lg">
            {video?.title}
          </h3>

          {/* <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-xl shadow-lg border border-white/10"> */}
           <div className="relative aspect-video overflow-hidden rounded-xl shadow-lg border border-white/10">
            <YouTube videoId={videoId} opts={opts} className="w-full h-full" />
          </div>

          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* 🎶 Keyframe animations */}
      <style>{`
        @keyframes dance-beam {
          0%, 100% { opacity: 0.4; transform: scaleY(0.8); }
          50% { opacity: 1; transform: scaleY(1.2); }
        }
        .animate-dance-beam {
          animation: dance-beam 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
