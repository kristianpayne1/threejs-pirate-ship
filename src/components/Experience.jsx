import { Canvas } from "@react-three/fiber";
import Scene from "./Scene.jsx";
import { Loader } from "@react-three/drei";
import AudioListenerContextProvider from "../hooks/useAudioListener.jsx";
import "../styles/experience.css";
import { useState } from "react";

function Experience() {
    const [audioEnabled, setAudioEnabled] = useState(true);
    return (
        <AudioListenerContextProvider enabled={audioEnabled}>
            <Canvas
                flat
                shadows
                dpr={[1, 2]}
                camera={{ position: [0, 45, 60], fov: 10 }}
            >
                <Scene />
            </Canvas>
            <Loader />
            <button
                className="sound-toggle"
                onClick={() => setAudioEnabled((state) => !state)}
            >
                Audio is {audioEnabled ? "on" : "off"}
            </button>
        </AudioListenerContextProvider>
    );
}

export default Experience;
