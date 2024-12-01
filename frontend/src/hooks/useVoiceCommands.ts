import { useCallback } from 'react';

export const useVoiceCommands = (setIsActive: (isActive: boolean) => void) => {
  const startVoiceRecognition = useCallback(() => {
    // if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map(result => result.transcript)
          .join('');
        
        const lowerTranscript = transcript.toLowerCase();
        
        if (lowerTranscript.includes('up to no good')) {
          setIsActive(true);
        } else if (lowerTranscript.includes('mischief managed')) {
          setIsActive(false);
        }
      };
      
      recognition.start();
      
      return () => {
        recognition.stop();
    //   };
    }
  }, [setIsActive]);

  return { startVoiceRecognition };
};