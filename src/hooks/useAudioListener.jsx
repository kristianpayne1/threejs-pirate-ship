import { createContext, useContext, useMemo } from "react";
import { AudioListener } from "three";

const AudioContext = createContext(null);

export function useAudioListener() {
    return useContext(AudioListener);
}

function AudioListenerContextProvider({ children }) {
    const listener = useMemo(() => new AudioListener(), []);

    return (
        <AudioContext.Provider value={{ listener }}>
            {children}
        </AudioContext.Provider>
    );
}

export default AudioListenerContextProvider;
