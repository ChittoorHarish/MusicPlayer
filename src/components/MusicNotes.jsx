import React, { useState, useEffect } from 'react';

const MusicNotes = ({ isPlaying }) => {
  const [notes, setNotes] = useState([]);
  const musicSymbols = ['♪', '♫', '♬', '♩'];

  useEffect(() => {
    let animationFrame;
    let lastTimestamp = performance.now();
    const lifespan = 2000;
    const spawnInterval = 200;

    const updateNotes = (timestamp) => {
      if (!isPlaying) {
        setNotes([]);
        return;
      }

      if (timestamp - lastTimestamp > spawnInterval) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 30;
        const startX = 175 + Math.cos(angle) * radius; // center of 350px
        const startY = 175 + Math.sin(angle) * radius;

        const newNote = {
          id: Date.now() + Math.random(),
          symbol: musicSymbols[Math.floor(Math.random() * musicSymbols.length)],
          x: startX,
          y: startY,
          dx: (Math.random() - 0.5) * 1.2,
          dy: -1 - Math.random() * 1.5,
          rotation: Math.random() * 360,
          scale: 1 + Math.random() * 0.5,
          createdAt: timestamp,
        };
        setNotes(prev => [...prev, newNote]);
        lastTimestamp = timestamp;
      }

      setNotes(prev =>
        prev
          .filter(note => timestamp - note.createdAt < lifespan)
          .map(note => ({
            ...note,
            x: note.x + note.dx,
            y: note.y + note.dy,
            rotation: note.rotation + 5,
            scale: note.scale * 0.98,
          }))
      );

      animationFrame = requestAnimationFrame(updateNotes);
    };

    animationFrame = requestAnimationFrame(updateNotes);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  return (
    <div
      className="absolute top-0 left-0 w-[350px] h-[350px] pointer-events-none overflow-visible z-50"
    >
      {notes.map(note => (
        <div
          key={note.id}
          className="absolute text-white select-none"
          style={{
            left: note.x,
            top: note.y,
            transform: `translate(-50%, -50%) rotate(${note.rotation}deg) scale(${note.scale})`,
            opacity: Math.max(0, 1 - (Date.now() - note.createdAt) / 2000),
            fontSize: '36px',
            textShadow: '0 0 10px #fff, 0 0 20px #fff',
          }}
        >
          {note.symbol}
        </div>
      ))}
    </div>
  );
};

export default MusicNotes;
