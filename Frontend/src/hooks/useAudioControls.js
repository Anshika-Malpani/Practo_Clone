import { useCallback, useState } from "react";

export const useAudioControls = (myStream) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const toggleAudio = useCallback(() => {
    if (myStream) {
      myStream.getAudioTracks().forEach(track => {
        track.enabled = isAudioMuted;
      });
      setIsAudioMuted(prev => !prev);
    }
  }, [isAudioMuted, myStream]);

  return {
    isAudioMuted,
    toggleAudio,
  };
};