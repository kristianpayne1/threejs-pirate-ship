import { Canvas } from "@react-three/fiber";
import Scene from "./Scene.jsx";
import { Loader, Stats } from "@react-three/drei";

function Experience() {
    return (
        <>
            <Canvas
                flat
                shadows
                dpr={[1, 2]}
                camera={{ position: [0, 45, 60], fov: 10 }}
            >
                <Scene />
            </Canvas>
            <Loader />
            <Stats />
        </>
    );
}

export default Experience;
