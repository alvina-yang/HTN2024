import { useCallback, useEffect, useRef, useState } from "react";
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

  // Use the Daily.co audio level hook to get the volume and scale it for the visualizer
  useAudioLevel(
    audioTrack?.persistentTrack,
    useCallback((volume) => {
      const newFrequency = Math.max(1, 1 + volume); // Map the volume to a frequency range
      setFrequency(newFrequency); // Update the frequency state
    }, [])
  );

  return (
    <div>
      {/* Pass the frequency to the Three.js visualizer */}
      <ThreeAudioVisualizer frequency={frequency} />
    </div>
  );
};

export default Avatar;
