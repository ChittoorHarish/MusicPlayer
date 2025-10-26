import React, { useState, useEffect } from "react";
import WaveOrb from "./WaveOrb";

export default function DiscoWaveOrb({ isPlaying, currentSong }) {
  const [hue, setHue] = useState(180); // start at teal

  useEffect(() => {
    if (!isPlaying) {
      setHue(180); // reset when paused
      return;
    }

    let animationFrame;

    const animate = () => {
      setHue((prev) => (prev + 1) % 360); // increment hue
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  const color = `hsl(${hue}, 100%, 50%)`; // convert hue to color

  return (
    <WaveOrb
      color={color}
      size={160}
      pulse={isPlaying ? 1.0 : 0}
      label={currentSong?.title || "No track playing"}
      style={{ transition: "color 0.2s linear" }} // smooth transition
    />
  );
}
