import { animated, easings, useSpring } from "@react-spring/three";
import { Outlines, Sphere, useCursor } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import ParticleSystem from "./ParticleSystem";
import { QuarksUtil } from "three.quarks";
import { RigidBody } from "@react-three/rapier";

function fireCannon(setAnimating, api, explosion, cannonBallRigidBody) {
    return async function () {
        setAnimating(true);

        QuarksUtil.restart(explosion);
        cannonBallRigidBody.setTranslation({ x: -1.4, y: 1.575, z: 1.4 }, true);
        cannonBallRigidBody.applyImpulse({ x: -0.1, y: 0.025, z: 0.1 }, true);

        await api.start({
            position: [0, 0, -1],
        })[0];

        await api.start({
            position: [0, 0, 0],
            delay: 200,
            onRest: () => setAnimating(false),
        })[0];

        cannonBallRigidBody.resetForces(false);
        cannonBallRigidBody.resetTorques(false);
        cannonBallRigidBody.sleep();
    };
}

export default function Cannon({ geometry, position, scale, map, ...props }) {
    const [hovered, setHovered] = useState(false);
    const [animating, setAnimating] = useState(false);

    const explosionRef = useRef();
    const cannonBallRef = useRef();

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

    useEffect(() => {
        if (!cannonBallRef.current) return;
        cannonBallRef.current.setGravityScale(0, true);
    }, []);

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
                    fireCannon(
                        setAnimating,
                        cannonApi,
                        explosionRef.current,
                        cannonBallRef.current
                    )
                }
                {...props}
            >
                <meshStandardMaterial map={map} />
                <Outlines thickness={1} color={hovered ? "white" : "black"} />
            </animated.mesh>
            <ParticleSystem
                ref={explosionRef}
                url="./explosion.json"
                position={[0, 1.25, 3]}
            />
            <RigidBody
                ref={cannonBallRef}
                colliders="ball"
                position={[1000, -1000, 1000]}
            >
                <Sphere args={[0.25]}>
                    <meshStandardMaterial color="gray" />
                    <Outlines thickness={1} color="black" />
                </Sphere>
            </RigidBody>
        </group>
    );
}
