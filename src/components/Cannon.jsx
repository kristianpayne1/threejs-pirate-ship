import { animated, easings, useSpring } from "@react-spring/three";
import { Outlines, useCursor } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import ParticleSystem from "./ParticleSystem";
import { QuarksUtil } from "three.quarks";
import CannonBall from "./CannonBall";

function resetCannonBall(cannonBallRigidBody, setAnimating) {
    cannonBallRigidBody.resetForces(false);
    cannonBallRigidBody.resetTorques(false);
    cannonBallRigidBody.setTranslation({ x: -1.4, y: 1.575, z: 1.4 }, true);
    cannonBallRigidBody.sleep();

    setAnimating(false);
}

function fireCannon(setAnimating, api, explosion, cannonBallRigidBody) {
    return async function () {
        setAnimating(true);

        QuarksUtil.restart(explosion);
        cannonBallRigidBody.applyImpulse({ x: -0.1, y: 0.025, z: 0.1 }, true);

        await api.start({
            position: [0, 0, -1],
        })[0];

        await api.start({
            position: [0, 0, 0],
            delay: 200,
            onRest: () => resetCannonBall(cannonBallRigidBody, setAnimating),
        })[0];
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
        cannonBallRef.current.setTranslation(
            { x: -1.4, y: 1.575, z: 1.4 },
            true
        );
        cannonBallRef.current.setGravityScale(0, true);
        cannonBallRef.current.sleep();
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
            <CannonBall ref={cannonBallRef} position={[1000, -1000, 1000]} />
        </group>
    );
}
