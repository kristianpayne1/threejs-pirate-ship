import { animated, easings, useSpring } from "@react-spring/three";
import { Outlines, useCursor } from "@react-three/drei";
import { useRef, useState } from "react";
import ParticleSystem from "./ParticleSystem";
import { QuarksUtil } from "three.quarks";

function fireCannon(setAnimating, api, explosion) {
    return async function () {
        setAnimating(true);
        QuarksUtil.restart(explosion);
        await api.start({
            position: [0, 0, -1],
        })[0];

        await api.start({
            position: [0, 0, 0],
            delay: 500,
            onRest: () => setAnimating(false),
        })[0];
    };
}

export default function Cannon({ geometry, position, scale, map, ...props }) {
    const [hovered, setHovered] = useState(false);
    const [animating, setAnimating] = useState(false);
    const explosionRef = useRef();

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
                onPointerDown={
                    !animating &&
                    fireCannon(setAnimating, cannonApi, explosionRef.current)
                }
                {...props}
            >
                <meshStandardMaterial map={map} />
                <Outlines thickness={1} color={hovered ? "white" : "black"} />
            </animated.mesh>
            <ParticleSystem
                ref={explosionRef}
                url="./explosion.json"
                position={[0, 1.3, 3]}
            />
        </group>
    );
}
