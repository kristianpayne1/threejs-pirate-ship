import { Outlines, useAnimations, useGLTF } from "@react-three/drei";
import { animated, easings, useSpring } from "@react-spring/three";
import { Euler, LoopOnce, Quaternion, Vector3 } from "three";
import { useEffect, useMemo } from "react";
import { useFrame, useGraph } from "@react-three/fiber";
import { SkeletonUtils } from "three-stdlib";

function getRandomPosition(origin, max = 1) {
    const x = Math.random() * (max + max) - max;
    const y = Math.random() * (max + max) - max;
    const z = Math.random() * (max + max) - max;

    return [origin[0] + x, origin[1] + y, origin[2] + z];
}

// y = -(0.175x-0.7)^2+0.5
function move(ref, { api, origin }) {
    const position = getRandomPosition(origin);
    api.start({
        position,
        config: {
            duration: Math.random() * (15e3 - 5e3) + 5e3,
        },
        onRest: () => move(ref, { api, origin }), // Recursive movement
    });
}

function playRandomAnimation(actions) {
    const actionsList = Object.values(actions);
    const randomAction =
        actionsList[Math.floor(Math.random() * actionsList.length)];
    randomAction.reset().play();
}

export default function Seagull({ position, rotation, scale, ...props }) {
    const { scene, materials, animations } = useGLTF("./models/seagull.glb");
    const { ref, actions } = useAnimations(animations);
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes } = useGraph(clone);

    const [springs, api] = useSpring(() => ({
        position,
        config: {
            duration: Math.random() * (15e3 - 5e3) + 5e3,
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
        playRandomAnimation(actions);
        const randomInterval = Math.random() * (10e3 - 3e3) + 3e3;
        const animationInterval = setInterval(
            () => playRandomAnimation(actions),
            randomInterval
        );
        return () => {
            clearInterval(animationInterval);
        };
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
            <group>
                <group rotation={[0, 0, -Math.PI / 2]} scale={4.544}>
                    <group>
                        <skinnedMesh
                            geometry={nodes.Cylinder001.geometry}
                            material={materials.White}
                            skeleton={nodes.Cylinder001.skeleton}
                        >
                            <Outlines thickness={0.55} />
                        </skinnedMesh>
                        <skinnedMesh
                            geometry={nodes.Cylinder001_1.geometry}
                            material={materials.Black}
                            skeleton={nodes.Cylinder001_1.skeleton}
                        />
                        <skinnedMesh
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
