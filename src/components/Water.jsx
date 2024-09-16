import { useFrame, useThree } from "@react-three/fiber";
import { forwardRef, useLayoutEffect, useMemo, useRef } from "react";
import {
    ClampToEdgeWrapping,
    Color,
    DataTexture,
    MeshPhongMaterial,
    NearestFilter,
    RGBAFormat,
    ShaderMaterial,
    UnsignedByteType,
    Vector2,
    Vector3,
    WebGLRenderTarget,
} from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import { GPUComputationRenderer } from "three-stdlib";
import { patchShaders } from "gl-noise";

// shaders
import vertexShader from "../shaders/water/vertex.glsl";
import fragmentShader from "../shaders/water/fragment.glsl";
import heightMapShader from "../shaders/water/heightMap.glsl";
import readWaterLevelVertex from "../shaders/water/readWaterLevel.glsl";

function fillTexture(texture, width) {
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

export default forwardRef(function Water(
    { width = 40, segments = 8, thickness = 0.8 },
    ref
) {
    const material = useRef(null);

    const { gl: renderer } = useThree();

    const {
        gpuCompute,
        heightMapVariable,
        readWaterLevelShader,
        readWaterLevelImage,
        readWaterLevelRenderTarget,
    } = useMemo(() => {
        const gpuCompute = new GPUComputationRenderer(width, width, renderer);

        const heightmap0 = gpuCompute.createTexture();

        fillTexture(heightmap0, width);

        const heightMapVariable = gpuCompute.addVariable(
            "heightmap",
            patchShaders(heightMapShader),
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

        // Create compute shader to read water level
        const readWaterLevelShader = gpuCompute.createShaderMaterial(
            readWaterLevelVertex,
            {
                point1: { value: new Vector2() },
                levelTexture: { value: null },
            }
        );
        readWaterLevelShader.defines.WIDTH = width.toFixed(1);
        readWaterLevelShader.defines.BOUNDS = segments.toFixed(1);

        // Create a 4x1 pixel image and a render target (Uint8, 4 channels, 1 byte per channel) to read water height and orientation
        const readWaterLevelImage = new Uint8Array(4 * 1 * 4);

        const readWaterLevelRenderTarget = new WebGLRenderTarget(4, 1, {
            wrapS: ClampToEdgeWrapping,
            wrapT: ClampToEdgeWrapping,
            minFilter: NearestFilter,
            magFilter: NearestFilter,
            format: RGBAFormat,
            type: UnsignedByteType,
            depthBuffer: false,
        });

        return {
            gpuCompute,
            heightMapVariable,
            readWaterLevelShader,
            readWaterLevelImage,
            readWaterLevelRenderTarget,
        };
    }, [width]);

    useLayoutEffect(() => {
        if (!ref.current) return;
        ref.current.readWaterLevel = (position) => {
            const currentRenderTarget =
                gpuCompute.getCurrentRenderTarget(heightMapVariable);
            readWaterLevelShader.uniforms["levelTexture"].value =
                currentRenderTarget.texture;

            const u = (0.5 * position.x) / (segments * 0.5) + 0.5;
            const v = 1 - ((0.5 * position.z) / (segments * 0.5) + 0.5);
            readWaterLevelShader.uniforms["point1"].value.set(u, v);
            gpuCompute.doRenderTarget(
                readWaterLevelShader,
                readWaterLevelRenderTarget
            );
            renderer.readRenderTargetPixels(
                readWaterLevelRenderTarget,
                0,
                0,
                4,
                1,
                readWaterLevelImage
            );
            const pixels = new Float32Array(readWaterLevelImage.buffer);
            return pixels[0];
        };
    }, [readWaterLevelImage, readWaterLevelRenderTarget]);

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
            ref={ref}
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
});
