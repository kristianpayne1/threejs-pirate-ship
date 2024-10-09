import { useFrame, useLoader } from "@react-three/fiber";
import {
    createContext,
    forwardRef,
    useContext,
    useEffect,
    useMemo,
} from "react";
import { BatchedRenderer, QuarksLoader, QuarksUtil } from "three.quarks";

const ParticleSystemContext = createContext();

export function ParticleSystemProvider({ children }) {
    const batchedRenderer = useMemo(() => new BatchedRenderer(), []);

    useFrame((_, delta) => {
        batchedRenderer.update(delta);
    });

    return (
        <ParticleSystemContext.Provider value={{ batchedRenderer }}>
            {children}
            <primitive object={batchedRenderer} />
        </ParticleSystemContext.Provider>
    );
}

export const ParticleSystem = forwardRef(function ParticleSystem(
    { url, playImmediately = false, ...props },
    ref
) {
    const { batchedRenderer } = useContext(ParticleSystemContext);
    const particleSystem = useLoader(QuarksLoader, url);

    useEffect(() => {
        if (!particleSystem) return;

        QuarksUtil.addToBatchRenderer(particleSystem, batchedRenderer);
        if (!playImmediately) QuarksUtil.stop(particleSystem);

        return () => {
            particleSystem.traverse((child) => {
                if (child.type === "ParticleEmitter") {
                    batchedRenderer.deleteSystem(child.system);
                }
            });
        };
    }, [particleSystem, batchedRenderer]);

    return <primitive ref={ref} object={particleSystem} {...props} />;
});

export default ParticleSystem;
