import { useEffect, useState, useCallback } from 'react';

interface AudioWaveformProps {
  duration: number;
  isPlaying: boolean;
}

export function AudioWaveform({ isPlaying }: AudioWaveformProps) {
  const [bars] = useState(() => Array.from({ length: 4 }, () => Math.random() * 0.5 + 0.5));
  const [heights, setHeights] = useState(bars);

  const generateNewHeights = useCallback(() => {
    return bars.map(() => Math.random() * 0.5 + 0.5);
  }, [bars]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setHeights(generateNewHeights());
      }, 150); // Faster animation for more dynamic effect

      return () => clearInterval(interval);
    } else {
      setHeights(bars);
    }
  }, [isPlaying, generateNewHeights, bars]);

  return (
    <div className="flex items-center gap-[2px]">
      {heights.map((height, index) => (
        <div
          key={index}
          className="flex flex-col gap-[2px]"
        >
          <div
            style={{
              height: `${height * 4}px`,
              opacity: isPlaying ? 1 : 0.5,
            }}
            className={`w-[2px] bg-gray-200 rounded-full transition-all duration-150`}
          />
          <div
            style={{
              height: `${height * 4}px`,
              opacity: isPlaying ? 1 : 0.5,
            }}
            className={`w-[2px] bg-gray-200 rounded-full transition-all duration-150`}
          />
        </div>
      ))}
    </div>
  );
}