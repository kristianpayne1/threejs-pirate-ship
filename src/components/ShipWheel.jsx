import { useState } from "react";
import { useSpring, animated, easings } from "@react-spring/three";
import { Box, Outlines, useCursor } from "@react-three/drei";

function spinWheelAnimation(api) {
    return async function () {
        api.stop();
        await api.start({
            rotation: [0, 0, Math.PI * 4],
        })[0];

        await api.start({
            rotation: [0, 0, 0],
        })[0];

        await api.start({
            from: { rotation: [0, 0, 0] },
            to: [{ rotation: [0, 0, Math.PI / 2] }, { rotation: [0, 0, 0] }],
            loop: true,
        })[0];
    };
}

export default function ShipWheel({ map, geometry }) {
    const [hovered, setHovered] = useState(false);

    useCursor(hovered);

    const [shipWheelSprings, shipWheelApi] = useSpring(
        () => ({
            rotation: [0, 0, 0],
            from: { rotation: [0, 0, 0] },
            to: [{ rotation: [0, 0, Math.PI / 2] }, { rotation: [0, 0, 0] }],
            loop: true,
            config: {
                mass: 10,
                tension: 280,
                friction: 60,
                easing: easings.easeInOutBounce,
            },
        }),
        []
    );

    return (
        <group position={[0, 4.5, -4.5]}>
            <animated.mesh
                scale={1.75}
                geometry={geometry}
                rotation={shipWheelSprings.rotation}
            >
                <meshStandardMaterial map={map} />
                <Outlines thickness={1} color={hovered ? "white" : "black"} />
            </animated.mesh>
            <Box
                args={[1.5, 1.5, 0.5]}
                onPointerDown={spinWheelAnimation(shipWheelApi)}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <meshBasicMaterial transparent opacity={0} />
            </Box>
        </group>
    );
}
