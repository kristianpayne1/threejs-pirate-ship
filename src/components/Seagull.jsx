import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect } from "react";

export default function Seagull({ position, rotation, scale, ...props }) {
    const { scene, animations } = useGLTF("./seagull.glb");
    const { ref, actions } = useAnimations(animations);

    useEffect(() => {
        actions?.flap.play();
    }, []);

    return (
        <primitive
            ref={ref}
            object={scene}
            position={position}
            rotation={rotation}
            scale={scale}
            {...props}
        />
    );
}
