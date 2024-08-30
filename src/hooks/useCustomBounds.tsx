import { useEffect } from "react";
import { BoundsApi, useBounds } from "@react-three/drei";
import { Box3, Vector3 } from "three";

interface useCustomBoundsProps {
    ref: any;
    translate: Vector3;
    transform: Vector3;
}

const box = new Box3();
function calculateBounds({
    ref,
    bounds,
    translate,
    transform,
}: useCustomBoundsProps & { bounds: BoundsApi }) {
    bounds.refresh().clip().fit();
    ref.current.geometry.computeBoundingBox();
    box.copy(ref.current.geometry.boundingBox).applyMatrix4(
        ref.current.matrixWorld
    );
    box.translate(translate);
    box.expandByVector(transform);
    bounds.refresh(box).clip().fit();
}

function useCustomBounds({
    ref,
    translate = new Vector3(0, 0, 0),
    transform = new Vector3(0, 0, 0),
}: useCustomBoundsProps) {
    const bounds = useBounds();

    useEffect(() => {
        if (!ref.current) return;
        const cb = () => calculateBounds({ ref, bounds, translate, transform });
        window.addEventListener("resize", cb);
        cb();
        return () => window.removeEventListener("resize", cb);
    }, [ref.current]);
}

export default useCustomBounds;
