import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect } from "react";
import { Outlines } from "./Outlines";

export default function Seagull({ position, rotation, scale, ...props }) {
    const { nodes, materials, animations } = useGLTF("./models/seagull.glb");
    const { ref, actions } = useAnimations(animations);

    useEffect(() => {
        actions?.flap.play();
    }, []);

    return (
        <group
            ref={ref}
            position={position}
            rotation={rotation}
            scale={scale}
            {...props}
            dispose={null}
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
        </group>
    );
}
