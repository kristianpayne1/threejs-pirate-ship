import {
    Bounds,
    ContactShadows,
    Loader,
    PresentationControls,
    Stats,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import Water from "./components/Water";
import Ship from "./components/Ship";
import Seagull from "./components/Seagull";
import { ParticleSystemProvider } from "./components/ParticleSystem";
import { Physics } from "@react-three/rapier";

function App() {
    const waterRef = useRef(null);

    return (
        <>
            <Canvas
                flat
                shadows
                dpr={[1, 2]}
                camera={{ position: [0, 45, 60], fov: 10 }}
            >
                <Suspense fallback={null}>
                    <Physics>
                        <ParticleSystemProvider>
                            <ambientLight intensity={3} />
                            <directionalLight
                                position={[0, 10, -10]}
                                intensity={2}
                            />
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
                <color attach="background" args={["#63d2da"]} />
            </Canvas>
            <Loader />
            <Stats />
        </>
    );
}

export default App;
