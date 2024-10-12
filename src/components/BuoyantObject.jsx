import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Box3, Plane, Quaternion, Vector3 } from "three";

const box = new Box3();
const boxSize = new Vector3();
const voxelMin = new Vector3();
const voxelMax = new Vector3();
const center = new Vector3();
const voxel = new Box3();
const a0 = new Vector3();
const a1 = new Vector3();
const a2 = new Vector3();
const b0 = new Vector3();
const b1 = new Vector3();
const b2 = new Vector3();
const plane = new Plane();
const up = new Vector3(0, 1, 0);
const targetQuaternion = new Quaternion();
const targetQuaternion0 = new Quaternion();
const targetQuaternion1 = new Quaternion();
const targetPosition = new Vector3();

function getAverageHeight(heights) {
    return heights.reduce((acc, value) => acc + value, 0) / heights.length;
}

function updateTransforms(
    targetPosition,
    targetQuaternion,
    { _ref, waterRef, subdivisionsX, subdivisionsY }
) {
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

            if (!i && !j) a0.copy(center);
            if (i === Math.round(subdivisionsX / 2) && j === subdivisionsY - 1)
                a1.copy(center);
            if (i === subdivisionsX - 1 && !j) a2.copy(center);
            if (i === Math.round(subdivisionsX / 2) && !j) b0.copy(center);
            if (!i && j === subdivisionsY - 1) b1.copy(center);
            if (i === subdivisionsX - 1 && j == subdivisionsY - 1)
                b2.copy(center);
        }
    }

    const heights = waterRef.current.readWaterLevel(centers);

    targetPosition.set(
        targetPosition.x,
        getAverageHeight(heights),
        targetPosition.z
    );

    a0.setY(heights[0]);
    a1.setY(heights[Math.round(subdivisionsX / 2) + subdivisionsY - 1]);
    a2.setY(heights[subdivisionsX - 1]);
    b0.setY(heights[Math.round(subdivisionsX / 2)]);
    b1.setY(heights[subdivisionsY - 1]);
    b2.setY(heights[subdivisionsX - 1 + subdivisionsY - 1]);
    plane.setFromCoplanarPoints(a0, a1, a2);
    targetQuaternion0.setFromUnitVectors(up, plane.normal);
    plane.setFromCoplanarPoints(b0, b1, b2);
    targetQuaternion1.setFromUnitVectors(up, plane.normal);
    targetQuaternion.multiplyQuaternions(targetQuaternion0, targetQuaternion1);
}

export function BuoyantObject({
    children,
    waterRef,
    boxRef,
    subdivisionsX = 3,
    subdivisionsY = 6,
    lockYRotation = true,
    rotationInterpolation = 0.005,
    ...props
}) {
    const ref = useRef(null);
    const _ref = boxRef ?? _ref;

    useFrame(() => {
        if (!_ref.current || !waterRef.current) return;

        targetPosition.copy(ref.current.position);

        updateTransforms(targetPosition, targetQuaternion, {
            _ref,
            waterRef,
            subdivisionsX,
            subdivisionsY,
        });

        ref.current.position.copy(targetPosition);

        const yRotation = ref.current.rotation.y;
        ref.current.quaternion.slerp(targetQuaternion, rotationInterpolation);
        if (lockYRotation) ref.current.rotation.y = yRotation;
    });

    return (
        <group ref={ref} {...props}>
            {children}
        </group>
    );
}
