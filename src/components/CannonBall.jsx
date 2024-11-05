import { forwardRef, useRef } from "react";
import { RigidBody } from "@react-three/rapier";
import { Outlines, Sphere, Trail } from "@react-three/drei";

export const CannonBall = forwardRef(function CannonBall(
    { position, ...props },
    ref
) {
    const sphereRef = useRef();

    return (
        <Trail width={10} color={"white"} target={sphereRef.current}>
            <RigidBody
                ref={ref}
                colliders="ball"
                position={position}
                {...props}
            >
                <Sphere args={[0.25]} ref={sphereRef}>
                    <meshStandardMaterial color="gray" />
                    <Outlines thickness={1} color="black" />
                </Sphere>
            </RigidBody>
        </Trail>
    );
});

export default CannonBall;
