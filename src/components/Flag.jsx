import { shaderMaterial, useTexture } from "@react-three/drei";
import { useRef } from "react";
import { DoubleSide, Vector2 } from "three";
import { extend, useFrame } from "@react-three/fiber";

import vertexShader from "../shaders/flag/vertex.glsl";
import fragmentShader from "../shaders/flag/fragment.glsl";

const uniforms = { uTime: 0, uFrequency: new Vector2(4, 1), uTexture: null };

const FlagMaterial = shaderMaterial(uniforms, vertexShader, fragmentShader);

extend({ FlagMaterial });

export default function Flag({ ...props }) {
    const ref = useRef();

    const texture = useTexture("./textures/pirate-flag.jpeg");

    useFrame(({ clock }) => {
        if (!ref.current) return;
        ref.current.material.uniforms.uTime.value = clock.getElapsedTime();
    });

    return (
        <mesh ref={ref} {...props}>
            <planeGeometry args={[2.5, 1.5, 8, 6]} />
            <flagMaterial side={DoubleSide} uTexture={texture} />
        </mesh>
    );
}
