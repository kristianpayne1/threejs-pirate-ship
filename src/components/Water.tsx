import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, DataTexture, MeshPhongMaterial, ShaderMaterial } from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import { GPUComputationRenderer } from "three-stdlib";
import { patchShaders } from "gl-noise";

// shaders
import vertexShader from "../shaders/water/vertex.glsl";
import fragmentShader from "../shaders/water/fragment.glsl";
import heightMapShader from "../shaders/water/heightMap.glsl";

function fillTexture(texture: DataTexture, width: number) {
    const pixels = texture.image.data;

    let p = 0;
    for (let j = 0; j < width; j++) {
        for (let i = 0; i < width; i++) {
            pixels[p + 0] = 0;
            pixels[p + 1] = pixels[p + 0];
            pixels[p + 2] = 0;
            pixels[p + 3] = 1;

            p += 4;
        }
    }
}

export default function Water({ width = 40, segments = 8, thickness = 0.8 }) {
    const material = useRef<ShaderMaterial>();

    const { gl: renderer } = useThree();

    const { gpuCompute, heightMapVariable } = useMemo(() => {
        const gpuCompute = new GPUComputationRenderer(width, width, renderer);

        const heightmap0 = gpuCompute.createTexture();

        fillTexture(heightmap0, width);

        const heightMapVariable = gpuCompute.addVariable(
            "heightmap",
            patchShaders(heightMapShader) as string,
            heightmap0
        );

        gpuCompute.setVariableDependencies(heightMapVariable, [
            heightMapVariable,
        ]);

        heightMapVariable.material.uniforms.uHeight = { value: thickness };
        heightMapVariable.material.uniforms.uTime = { value: 0.0 };

        const error = gpuCompute.init();
        if (error !== null) {
            console.error(error);
        }

        return {
            gpuCompute,
            heightMapVariable,
        };
    }, [width]);

    useFrame(() => {
        if (!material.current || !gpuCompute || !heightMapVariable) return;
        gpuCompute.compute();
        heightMapVariable.material.uniforms.uTime.value =
            performance.now() / 5000;
        material.current.uniforms.heightmap.value =
            gpuCompute.getCurrentRenderTarget(heightMapVariable).texture;
    });

    return (
        <mesh
            castShadow
            receiveShadow
            rotation-x={-Math.PI / 2}
            rotation-z={Math.PI / 4}
        >
            <boxGeometry args={[8, 8, thickness, width, width, 1]} />
            <CustomShaderMaterial
                ref={material}
                baseMaterial={MeshPhongMaterial}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                transparent
                opacity={0.9}
                shininess={30}
                flatShading
                uniforms={{
                    waterColor: {
                        value: new Color("#0058aa").convertLinearToSRGB(),
                    },
                    waterHighlight: {
                        value: new Color("#0084ff").convertLinearToSRGB(),
                    },
                    heightmap: {
                        value: null,
                    },
                }}
            />
        </mesh>
    );
}
