import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Box3, Plane, Quaternion, Vector3 } from "three";

const box = new Box3();
const boxSize = new Vector3();
const voxelMin = new Vector3();
const voxelMax = new Vector3();
const center = new Vector3();
const voxel = new Box3();
const a = new Vector3();
const b = new Vector3();
const c = new Vector3();
const plane = new Plane();
const up = new Vector3(0, 1, 0);
const targetQuaternion = new Quaternion();

function getAverageHeight(heights) {
    return heights.reduce((acc, value) => acc + value, 0) / heights.length;
}

export function BuoyantObject({
    children,
    waterRef,
    boxRef,
    subdivisionsX = 3,
    subdivisionsY = 6,
    lockY = true,
    rotationInterpolation = 0.0075,
    ...props
}) {
    const ref = useRef(null);
    const _ref = boxRef ?? _ref;

    useFrame(() => {
        if (!_ref.current || !waterRef.current) return;
        box.copy(_ref.current.geometry.boundingBox);
        box.getSize(boxSize);
        const centers = [];

        const boxMin = box.min;

        const voxelSizeX = boxSize.x / subdivisionsX;
        const voxelSizeZ = boxSize.z / subdivisionsY;

        for (let i = 0; i < subdivisionsX; i++) {
            for (let j = 0; j < subdivisionsY; j++) {
                voxelMin.set(
                    boxMin.x + i * voxelSizeX,
                    boxMin.y,
                    boxMin.z + j * voxelSizeZ
                );
                voxelMax.set(
                    voxelMin.x + voxelSizeX,
                    boxMin.y,
                    voxelMin.z + voxelSizeZ
                );

                voxel.set(voxelMin, voxelMax);
                voxel.getCenter(center);
                centers.push(center.clone());

                if (!i && !j) a.copy(center);
                else if (
                    i === Math.round(subdivisionsX / 2) &&
                    j === subdivisionsY - 1
                )
                    b.copy(center);
                else if (i === subdivisionsX - 1 && !j) c.copy(center);
            }
        }

        const heights = waterRef.current.readWaterLevel(centers);
        ref.current.position.set(
            ref.current.position.x,
            getAverageHeight(heights),
            ref.current.position.z
        );

        a.setY(heights[0]);
        b.setY(heights[Math.round(subdivisionsX / 2) + subdivisionsY - 1]);
        c.setY(heights[subdivisionsX - 1]);
        plane.setFromCoplanarPoints(a, b, c);
        targetQuaternion.setFromUnitVectors(up, plane.normal);
        const yRotation = ref.current.rotation.y;
        ref.current.quaternion.slerp(targetQuaternion, rotationInterpolation);
        if (lockY) ref.current.rotation.y = yRotation;
    });

    return (
        <group ref={ref} {...props}>
            {children}
        </group>
    );
}
