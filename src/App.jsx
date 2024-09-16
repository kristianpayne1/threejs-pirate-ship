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
                    <ambientLight intensity={0.8} />
                    <PresentationControls
                        global
                        zoom={0.8}
                        snap
                        polar={[-Math.PI / 4.5, Math.PI / 4.5]}
                        azimuth={[-Math.PI / 1.4, Math.PI / 2]}
                    >
                        <pointLight
                            position={[0, 5, -6]}
                            rotation={[Math.PI / 6, 0, 0]}
                            intensity={100}
                        />
                        <Bounds fit clip margin={1}>
                            <Water ref={waterRef} />
                            <Ship
                                rotation={[0, -Math.PI / 4, 0]}
                                scale={0.3}
                                position={[0, 1, 0]}
                                waterRef={waterRef}
                            />
                        </Bounds>
                    </PresentationControls>
                    <ContactShadows
                        position={[0, -3.25, 0]}
                        scale={20}
                        blur={3}
                        far={4}
                    />
                </Suspense>
                <color attach="background" args={["#63d2da"]} />
            </Canvas>
            <Loader />
            <Stats />
        </>
    );
}

export default App;
