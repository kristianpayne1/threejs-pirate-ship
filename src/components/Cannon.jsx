import { animated, easings, useSpring } from "@react-spring/three";
import { Outlines, useCursor } from "@react-three/drei";
import { useState } from "react";

function fireCannon(api) {
    return async function () {
        await api.start({
            position: [0, 0, -1.5],
        })[0];

        await api.start({
            position: [0, 0, 0],
            delay: 1e3,
        })[0];
    };
}

export default function Cannon({ geometry, position, scale, map, ...props }) {
    const [hovered, setHovered] = useState(false);

    useCursor(hovered);

    const [cannonSprings, cannonApi] = useSpring(() => ({
        position: [0, 0, 0],
        config: {
            mass: 10,
            tension: 280,
            friction: 60,
            easing: easings.easeInOutBounce,
        },
    }));

    return (
        <group position={position}>
            <animated.mesh
                scale={scale}
                position={cannonSprings.position}
                geometry={geometry}
                onPointerOver={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
                onPointerDown={fireCannon(cannonApi)}
                {...props}
            >
                <meshStandardMaterial map={map} />
                <Outlines thickness={1} color={hovered ? "white" : "black"} />
            </animated.mesh>
        </group>
    );
}
