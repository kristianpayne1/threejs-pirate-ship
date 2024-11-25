import { useRef, useState } from "react";
import { animated, easings, useSpring } from "@react-spring/three";
import { Box, useCursor } from "@react-three/drei";
import { Outlines } from "./Outlines";
import PositionalAudio from "./PositionalAudio.jsx";
import { useAudioListener } from "../hooks/useAudioListener.jsx";

function spinWheelAnimation(api, soundSFX) {
    return async function () {
        api.stop();
        soundSFX.play();
        await api.start({
            rotation: [0, 0, Math.PI * 5],
        })[0];

        soundSFX.play();
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

    const spinSFXRef = useRef();

    useCursor(hovered);

    const audioListener = useAudioListener();

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
            <PositionalAudio
                ref={spinSFXRef}
                url="sounds/wheel-spin1.mp3"
                audioListener={audioListener}
            />
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
                onPointerDown={spinWheelAnimation(
                    shipWheelApi,
                    spinSFXRef.current
                )}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <meshBasicMaterial transparent opacity={0} />
            </Box>
        </group>
    );
}
