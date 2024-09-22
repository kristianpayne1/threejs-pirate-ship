import { Box, useGLTF } from "@react-three/drei";
import { useRef } from "react";
import { Vector3 } from "three";
import useCustomBounds from "../hooks/useCustomBounds";
import { BuoyantObject } from "./BuoyantObject";

export default function Ship({
    position,
    rotation,
    scale,
    waterRef,
    ...props
}) {
    const ref = useRef(null);
    const boxRef = useRef(null);

    const {
        materials: {
            ship_material: { map },
        },
        nodes: { Hull, Mast, Sails, Cannon, Anchor, ShipWheel },
    } = useGLTF("./ship.glb");

    useCustomBounds({
        ref,
        translate: new Vector3(0, -3, 0),
        transform: new Vector3(3, 3, 3),
    });

    return (
        <BuoyantObject
            waterRef={waterRef}
            position={position}
            rotation={rotation}
            scale={scale}
            boxRef={boxRef}
            {...props}
        >
            <mesh geometry={Hull.geometry}>
                <meshStandardMaterial map={map} />
            </mesh>
            <group position={[0, 2, 0.5]}>
                <mesh ref={ref} geometry={Mast.geometry}>
                    <meshStandardMaterial map={map} />
                </mesh>
                <mesh geometry={Sails.geometry}>
                    <meshStandardMaterial map={map} />
                </mesh>
            </group>
            <mesh
                position={[0, 4.5, -4.5]}
                scale={1.75}
                geometry={ShipWheel.geometry}
            >
                <meshStandardMaterial map={map} />
            </mesh>
            <mesh position={[0, 2.5, 4]} scale={1.5} geometry={Cannon.geometry}>
                <meshStandardMaterial map={map} />
            </mesh>
            <mesh
                rotation={[-Math.PI / 16, Math.PI / 2, Math.PI / 8]}
                rotation-order="YXZ"
                position={[2.25, 2, -4.5]}
                geometry={Anchor.geometry}
                scale={1.5}
            >
                <meshStandardMaterial map={map} />
            </mesh>
            <Box ref={boxRef} args={[5, 5, 15]} position={[0, 2.5, 0]}>
                <meshBasicMaterial transparent opacity={0} />
            </Box>
        </BuoyantObject>
    );
}
