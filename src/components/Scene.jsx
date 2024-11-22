import { Physics } from "@react-three/rapier";
import { ParticleSystemProvider } from "./ParticleSystem.jsx";
import {
    Bounds,
    ContactShadows,
    PresentationControls,
} from "@react-three/drei";
import Water from "./Water.jsx";
import Ship from "./Ship.jsx";
import Seagull from "./Seagull.jsx";
import { Suspense, useEffect, useRef } from "react";
import useAmbientSound from "../hooks/useAmbientSound.jsx";
import { useAudioListener } from "../hooks/useAudioListener.jsx";

function Scene() {
    const waterRef = useRef(null);

    const audioListener = useAudioListener();

    const sound = useAmbientSound({
        url: "./sounds/seagulls-by-the-sea.mp3",
        audioListener,
    });

    useEffect(() => {
        return () => {
            sound.stop();
        };
    }, [sound]);

    return (
        <Suspense fallback={null}>
            <Physics>
                <ParticleSystemProvider>
                    <ambientLight intensity={3} />
                    <directionalLight position={[0, 10, -10]} intensity={2} />
                    <spotLight position={[0, 3, -6]} intensity={100} />
                    <PresentationControls
                        global
                        zoom={0.8}
                        snap
                        polar={[-Math.PI / 4.5, Math.PI / 4.5]}
                        azimuth={[-Math.PI / 1.4, Math.PI / 2]}
                        cursor={false}
                        rotation={[0, Math.PI / 4, 0]}
                    >
                        <Bounds fit clip margin={1}>
                            <Water ref={waterRef} />
                            <Ship
                                rotation={[0, -Math.PI / 2, 0]}
                                scale={0.3}
                                waterRef={waterRef}
                            />
                            <Seagull
                                position={[2, 5, 2]}
                                rotation={[0, -Math.PI / 2, 0]}
                                scale={0.04}
                            />
                            <Seagull
                                position={[-2, 4, -3]}
                                rotation={[0, -Math.PI / 2, 0]}
                                scale={0.04}
                            />
                        </Bounds>
                    </PresentationControls>
                    <ContactShadows
                        position={[0, -3.25, 0]}
                        scale={20}
                        blur={3}
                        far={4}
                    />
                </ParticleSystemProvider>
            </Physics>
        </Suspense>
    );
}

export default Scene;
