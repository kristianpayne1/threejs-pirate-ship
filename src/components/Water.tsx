import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Color, MeshPhongMaterial, ShaderMaterial } from "three";
import CustomShaderMaterial from "three-custom-shader-material";

// shaders
import vertexShader from "../shaders/water/vertex.glsl";
import fragmentShader from "../shaders/water/fragment.glsl";
import { patchShaders } from "gl-noise";

export default function Water() {
    const thickness = 1.0;
    const material = useRef<ShaderMaterial>();

    useFrame((state) => {
        if (!material.current) return;
        material.current.uniforms.uTime.value = -state.clock.elapsedTime / 5;
    });

    return (
        <mesh
            castShadow
            receiveShadow
            rotation-x={-Math.PI / 2}
            rotation-z={Math.PI / 4}
        >
            <boxGeometry args={[7, 7, thickness, 40, 40, 1]} />
            <CustomShaderMaterial
                ref={material}
                baseMaterial={MeshPhongMaterial}
                vertexShader={patchShaders(vertexShader) as string}
                fragmentShader={fragmentShader}
                color={new Color("#52a7f7")}
                transparent
                opacity={0.9}
                shininess={30}
                flatShading
                uniforms={{
                    uTime: { value: 0 },
                    waterColor: {
                        value: new Color("#0058aa").convertLinearToSRGB(),
                    },
                    waterHighlight: {
                        value: new Color("#0084ff").convertLinearToSRGB(),
                    },
                    uHeight: {
                        value: thickness,
                    },
                }}
            />
        </mesh>
    );
}
