import { useGLTF } from "@react-three/drei";
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

    const {
        materials: {
            ship_material: { map },
        },
        nodes: { Hull, Mast, Sails },
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
            lockY
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
        </BuoyantObject>
    );
}
