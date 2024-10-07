import { Outlines, useCursor } from "@react-three/drei";
import { useState } from "react";

export default function Cannon({ geometry, position, scale, map, ...props }) {
    const [hovered, setHovered] = useState(false);

    useCursor(hovered);

    return (
        <mesh
            position={position}
            scale={scale}
            geometry={geometry}
            onPointerOver={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            {...props}
        >
            <meshStandardMaterial map={map} />
            <Outlines thickness={1} color={hovered ? "white" : "black"} />
        </mesh>
    );
}
