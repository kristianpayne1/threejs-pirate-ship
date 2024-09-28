import { Plane } from "@react-three/drei";
import { useRef } from "react";
import { DoubleSide } from "three";

export default function Flag({ ...props }) {
    const ref = useRef();

    return (
        <Plane ref={ref} args={[3, 2, 8, 6]} {...props}>
            <meshBasicMaterial side={DoubleSide} />
        </Plane>
    );
}
