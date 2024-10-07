import { useRef } from "react";
import { Box, useGLTF } from "@react-three/drei";
import { Vector3 } from "three";
import useCustomBounds from "../hooks/useCustomBounds";
import { BuoyantObject } from "./BuoyantObject";
import ShipWheel from "./ShipWheel";
import Flag from "./Flag";
import Cannon from "./Cannon";
import { Outlines } from "./Outlines";

export default function Ship({
    position,
    rotation,
    scale,
    waterRef,
    ...props
}) {
    const boxRef = useRef(null);

    const {
        materials: {
            ship_material: { map },
        },
        nodes: {
            Hull,
            Mast,
            Sails,
            Cannon: ShipCannon,
            Anchor,
            ShipWheel: Wheel,
        },
    } = useGLTF("./models/ship.glb");

    useCustomBounds({
        ref: boxRef,
        translate: new Vector3(0, 0, 0),
        transform: new Vector3(4, 4, 4),
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
                <Outlines thickness={1} />
            </mesh>
            <group position={[0, 2, 0.5]}>
                <mesh geometry={Mast.geometry}>
                    <meshStandardMaterial map={map} />
                    <Outlines thickness={1} />
                </mesh>
                <mesh geometry={Sails.geometry}>
                    <meshStandardMaterial map={map} />
                    <Outlines thickness={1} />
                </mesh>
            </group>
            <ShipWheel geometry={Wheel.geometry} map={map} />
            <Cannon
                geometry={ShipCannon.geometry}
                position={[0, 2.5, 4]}
                scale={1.5}
                map={map}
            />
            <mesh
                rotation={[-Math.PI / 16, Math.PI / 1.9, Math.PI / 8]}
                rotation-order="YXZ"
                position={[2.25, 2, -4.5]}
                geometry={Anchor.geometry}
                scale={1.5}
            >
                <meshStandardMaterial map={map} />
                <Outlines thickness={1} />
            </mesh>
            <Flag position={[0, 18.5, -0.8]} rotation={[0, Math.PI / 2, 0]} />
            <Box ref={boxRef} args={[5, 5, 15]} position={[0, 2.5, 0]}>
                <meshBasicMaterial transparent opacity={0} />
            </Box>
        </BuoyantObject>
    );
}
