import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { Outlines } from "./Outlines";
import { animated, easings, useSpring } from "@react-spring/three";

function getRandomPosition(position, max = 1) {
    const x = Math.random() * (max + max) - max;
    const y = Math.random() * (max + max) - max;
    const z = Math.random() * (max + max) - max;

    return [position[0] + x, position[1] + y, position[2] + z];
}

function move(api, position) {
    api.start({
        position: getRandomPosition(position),
        config: {
            duration: 8e3,
            tension: 180,
            friction: 12,
            easing: easings.easeInOutBack,
        },
        onRest: () => move(api, position),
    });
}

export default function Seagull({ position, rotation, scale, ...props }) {
    const { nodes, materials, animations } = useGLTF("./models/seagull.glb");
    const { ref, actions } = useAnimations(animations);

    const [springs, api] = useSpring(() => ({
        position,
        rotation,
    }));

    useEffect(() => {
        actions?.flap.play();
        move(api, position);
    }, [actions, api, position]);

    return (
        <animated.group
            position={springs.position}
            rotation={springs.rotation}
            ref={ref}
            scale={scale}
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
