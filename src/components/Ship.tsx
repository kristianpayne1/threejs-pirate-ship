import { useGLTF } from "@react-three/drei";
import { Vector3 } from "three";

interface ShipProps {
    position?: Vector3 | [number, number, number];
    rotation?: Vector3 | [number, number, number];
    scale?: number;
}

export default function Ship({
    position,
    rotation,
    scale,
    ...props
}: ShipProps) {
    const {
        materials: {
            ship_material: { map },
        },
        nodes: { Hull, Mast, Sails },
    } = useGLTF("./ship.glb");

    return (
        <group position={position} rotation={rotation} scale={scale} {...props}>
            <mesh geometry={Hull.geometry}>
                <meshBasicMaterial map={map} />
            </mesh>
            <mesh geometry={Mast.geometry}>
                <meshBasicMaterial map={map} />
            </mesh>
            <mesh geometry={Sails.geometry}>
                <meshBasicMaterial map={map} />
            </mesh>
        </group>
    );
}
