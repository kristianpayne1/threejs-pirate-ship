import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { Outlines } from "./Outlines";
import { animated, easings, useSpring } from "@react-spring/three";
import { Euler, LoopOnce, Quaternion, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";

function getRandomPosition(origin, max = 1) {
    const x = Math.random() * (max + max) - max;
    const y = Math.random() * (max + max) - max;
    const z = Math.random() * (max + max) - max;

    return [origin[0] + x, origin[1] + y, origin[2] + z];
}

// y = -(0.175x-0.7)^2+0.5
function move(ref, { api, origin, rotationOrigin }) {
    const position = getRandomPosition(origin);
    api.start({
        position,
        onRest: () => move(ref, { api, origin, rotationOrigin }),
    });
}

function playRandomAnimation(actions) {
    const randomInterval = Math.random() * (10e3 - 3e3) + 3e3;
    const actionsList = Object.values(actions);
    return setTimeout(() => {
        const randomAction =
            actionsList[Math.floor(Math.random() * actionsList.length)];
        randomAction.reset().play();
        playRandomAnimation(actions);
    }, randomInterval);
}

export default function Seagull({ position, rotation, scale, ...props }) {
    const { nodes, materials, animations } = useGLTF("./models/seagull.glb");
    const { ref, actions } = useAnimations(animations);

    const [springs, api] = useSpring(() => ({
        position,
        config: {
            duration: 8e3,
            tension: 180,
            easing: easings.easeInOutBack,
        },
    }));

    const previousPosition = new Vector3(...position);
    const currentPosition = new Vector3();
    const maxRotation = Math.PI / 6;
    const newRotation = new Euler();
    const targetQuaternion = new Quaternion();
    useFrame((_, deltaTime) => {
        if (!ref.current) return;
        currentPosition.copy(ref.current.position);
        const distance = currentPosition.sub(previousPosition);
        const velocity = distance.divideScalar(deltaTime);
        previousPosition.copy(ref.current.position);
        newRotation.copy(ref.current.rotation);
        newRotation.x = -velocity.y * maxRotation;
        newRotation.z = -velocity.x * maxRotation;
        targetQuaternion.setFromEuler(newRotation);
        ref.current.quaternion.slerp(targetQuaternion, 0.01);
    });

    useEffect(() => {
        move(ref, { api, origin: position, rotation });
        if (!actions) return;
        actions.flap.setLoop(LoopOnce);
        actions.flap.clampWhenFinished = true;
        actions["2 flap"].setLoop(LoopOnce);
        actions["2 flap"].clampWhenFinished = true;
        actions.flap.play();
        playRandomAnimation(actions);
    }, [actions, ref, api, position, rotation]);

    return (
        <animated.group
            ref={ref}
            position={springs.position}
            rotation={rotation}
            scale={scale}
            rotation-order="YZX"
            {...props}
        >
            <group name="Scene">
                <group
                    name="Armature"
                    rotation={[0, 0, -Math.PI / 2]}
                    scale={4.544}
                >
                    <group name="Cylinder">
                        <skinnedMesh
                            name="Cylinder001"
                            geometry={nodes.Cylinder001.geometry}
                            material={materials.White}
                            skeleton={nodes.Cylinder001.skeleton}
                        >
                            <Outlines thickness={0.55} />
                        </skinnedMesh>
                        <skinnedMesh
                            name="Cylinder001_1"
                            geometry={nodes.Cylinder001_1.geometry}
                            material={materials.Black}
                            skeleton={nodes.Cylinder001_1.skeleton}
                        />
                        <skinnedMesh
                            name="Cylinder001_2"
                            geometry={nodes.Cylinder001_2.geometry}
                            material={materials.Orange}
                            skeleton={nodes.Cylinder001_2.skeleton}
                        />
                    </group>
                    <primitive object={nodes.Bone} />
                    <primitive object={nodes.Bone004} />
                    <primitive object={nodes.Bone006} />
                    <primitive object={nodes.Bone012} />
                </group>
            </group>
        </animated.group>
    );
}
