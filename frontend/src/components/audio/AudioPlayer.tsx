import  { useState } from 'react';
import { AudioWaveform } from './AudioWaveform';

interface AudioPlayerProps {
  duration: string | undefined;
  audioURL: string | undefined;
}

export function AudioPlayer({ duration, audioURL }: AudioPlayerProps) {
  console.log('Audio URL:::', audioURL);
  const [isPlaying, setIsPlaying] = useState(false);
  const durationInSeconds = duration ? parseInt(duration.replace('"', '')) : 0;

  const handlePlayClick = () => {
    if (!audioURL) return;

    setIsPlaying(true);
    const audio = new Audio(audioURL);
    // Play the audio
    audio.play().then(() => {
      console.log('Audio is playing');
    }).catch((error) => {
      console.error('Error playing audio:', error);
    });
  
    audio.onended = () => {
      setIsPlaying(false);
    };
  
    console.log('audio playing');
  };

  return (
    <div className="flex items-center gap-2 mb-1">
      <button
        onClick={handlePlayClick}
        disabled={isPlaying || !audioURL}
        className="flex items-center gap-2 px-2 py-1 bg-gray-800 rounded-md text-gray-200 text-xs hover:bg-gray-700 disabled:opacity-50"
      >
        <span className="flex items-center gap-1">
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <rect x="2" y="2" width="3" height="8" />
              <rect x="7" y="2" width="3" height="8" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M3 2l7 4-7 4V2z" />
            </svg>
          )}
          {duration}
        </span>
        <AudioWaveform duration={durationInSeconds} isPlaying={isPlaying} />
      </button>
    </div>
  );
}