import { useCallback, useRef, useState, useEffect } from "react";
import {
  useAudioLevel,
  useAudioTrack,
  useParticipantIds,
} from "@daily-co/daily-react";
import { ThreeAudioVisualizer } from "./three-audio-visualizer"; // Import the Three.js visualizer

export const Avatar: React.FC = () => {
  const remoteParticipantId = useParticipantIds({ filter: "remote" })[0];
  const audioTrack = useAudioTrack(remoteParticipantId);
  const [frequency, setFrequency] = useState<number>(0); // Store the frequency in a state

  // Only track audio level if there's an available audio track
  useAudioLevel(
    audioTrack?.persistentTrack,
    useCallback((volume) => {
      if (audioTrack?.persistentTrack) {
        const newFrequency = Math.max(1, 1 + volume); // Map the volume to a frequency range
        setFrequency(newFrequency); // Update the frequency state
      }
    }, [audioTrack?.persistentTrack])
  );

  // Add a fallback for no audio track available
  useEffect(() => {
    if (!audioTrack) {
      setFrequency(0); // Reset frequency if no track is available
    }
  }, [audioTrack]);

  return (
    <div>
      {/* Pass the frequency to the Three.js visualizer */}
      <ThreeAudioVisualizer frequency={frequency} />
    </div>
  );
};

export default Avatar;
