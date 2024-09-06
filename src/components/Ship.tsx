import { useGLTF } from "@react-three/drei";
import { useRef } from "react";
import { Mesh, MeshStandardMaterial, Vector3 } from "three";
import useCustomBounds from "../hooks/useCustomBounds";
import { GLTF } from "three-stdlib";
import { useFrame } from "@react-three/fiber";

interface ShipProps {
    position?: Vector3 | [number, number, number];
    rotation?: Vector3 | [number, number, number];
    scale?: number;
    waterRef?: any;
}

type GLTFResult = GLTF & {
    materials: { ship_material: MeshStandardMaterial };
    nodes: { Hull: Mesh; Mast: Mesh; Sails: Mesh };
};

export default function Ship({
    position,
    rotation,
    scale,
    waterRef,
    ...props
}: ShipProps) {
    const ref = useRef<any>(null!);
    const groupRef = useRef<any>(null!);

    const {
        materials: {
            ship_material: { map },
        },
        nodes: { Hull, Mast, Sails },
    } = useGLTF("./ship.glb") as GLTFResult;

    useCustomBounds({
        ref,
        translate: new Vector3(0, -3, 0),
        transform: new Vector3(3, 3, 3),
    });

    useFrame(() => {
        if (!waterRef.current || !groupRef.current) return;
        groupRef.current.position.set(
            ...waterRef.current.readWaterLevel(groupRef.current.position)
        );
    });

    return (
        <group
            ref={groupRef}
            position={position}
            // @ts-ignore
            rotation={rotation}
            scale={scale}
            {...props}
        >
            <mesh geometry={Hull.geometry}>
                <meshBasicMaterial map={map} />
            </mesh>
            <mesh ref={ref} geometry={Mast.geometry}>
                <meshBasicMaterial map={map} />
            </mesh>
            <mesh geometry={Sails.geometry}>
                <meshBasicMaterial map={map} />
            </mesh>
        </group>
    );
}
