import { useFrame, useThree } from "@react-three/fiber";
import { forwardRef, useLayoutEffect, useMemo, useRef } from "react";
import {
    ClampToEdgeWrapping,
    Color,
    MeshPhongMaterial,
    NearestFilter,
    RGBAFormat,
    UnsignedByteType,
    Vector2,
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

const emptyVec2 = new Vector2();

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
    {
        width = 40,
        segments = 8,
        waterHeight = 0.8,
        readWaterHeightBufferLimit = 32,
    },
    ref
) {
    const material = useRef(null);

    const { gl: renderer } = useThree();

    const gpuCompute = useMemo(
        () => new GPUComputationRenderer(width, width, renderer),
        [width, renderer]
    );

    const heightMapVariable = useMemo(() => {
        // create height map texture
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

        heightMapVariable.material.uniforms.uHeight = { value: waterHeight };
        heightMapVariable.material.uniforms.uTime = { value: 0.0 };

        const error = gpuCompute.init();
        if (error !== null) {
            console.error(error);
        }

        return heightMapVariable;
    }, [gpuCompute, width, waterHeight]);

    const {
        readWaterLevelShader,
        readWaterLevelImage,
        readWaterLevelRenderTarget,
    } = useMemo(() => {
        // Create compute shader to read water level
        const readWaterLevelShader = gpuCompute.createShaderMaterial(
            readWaterLevelVertex,
            {
                points: { value: [] },
                levelTexture: { value: null },
                numPoints: { value: readWaterHeightBufferLimit },
            }
        );
        readWaterLevelShader.defines.WIDTH = width.toFixed(1);
        readWaterLevelShader.defines.BOUNDS = segments.toFixed(1);

        const readWaterLevelImage = new Uint8Array(
            4 * readWaterHeightBufferLimit * 4
        );

        const readWaterLevelRenderTarget = new WebGLRenderTarget(
            4,
            readWaterHeightBufferLimit,
            {
                wrapS: ClampToEdgeWrapping,
                wrapT: ClampToEdgeWrapping,
                minFilter: NearestFilter,
                magFilter: NearestFilter,
                format: RGBAFormat,
                type: UnsignedByteType,
                depthBuffer: false,
            }
        );

        return {
            readWaterLevelShader,
            readWaterLevelImage,
            readWaterLevelRenderTarget,
        };
    }, [gpuCompute, width, segments, readWaterHeightBufferLimit]);

    useLayoutEffect(() => {
        if (!ref.current) return;
        ref.current.readWaterLevel = (positions) => {
            if (positions.length > readWaterHeightBufferLimit)
                return console.error(
                    "The length of positions exceeds the read water height buffer limit. \nConsider increasing `readWaterHeightBufferLimit` or passing fewer positions to read"
                );

            const currentRenderTarget =
                gpuCompute.getCurrentRenderTarget(heightMapVariable);
            readWaterLevelShader.uniforms["levelTexture"].value =
                currentRenderTarget.texture;

            // calculate the uv of every point
            const points = positions.map((position) => {
                const u = (0.5 * position.x) / (segments * 0.5) + 0.5;
                const v = 1 - ((0.5 * position.z) / (segments * 0.5) + 0.5);
                return new Vector2(u, v);
            });
            // fill the rest of the buffer with empty UVs
            points.push(
                ...Array(readWaterHeightBufferLimit - points.length).fill(
                    emptyVec2
                )
            );
            readWaterLevelShader.uniforms["numPoints"].value = points.length;
            readWaterLevelShader.uniforms["points"].value = points;
            gpuCompute.doRenderTarget(
                readWaterLevelShader,
                readWaterLevelRenderTarget
            );
            renderer.readRenderTargetPixels(
                readWaterLevelRenderTarget,
                0,
                0,
                4,
                points.length,
                readWaterLevelImage
            );
            // return the array of heights the same length as `positions`
            const pixels = new Float32Array(readWaterLevelImage.buffer);
            return pixels
                .filter((_, i) => i % 4 === 0)
                .slice(0, positions.length);
        };
    }, [
        ref,
        readWaterHeightBufferLimit,
        segments,
        readWaterLevelImage,
        readWaterLevelRenderTarget,
        gpuCompute,
        heightMapVariable,
        readWaterLevelShader,
        renderer,
    ]);

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
            ref={ref}
            castShadow
            receiveShadow
            rotation-x={-Math.PI / 2}
            rotation-z={Math.PI / 4}
        >
            <boxGeometry args={[8, 8, waterHeight, width, width, 1]} />
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
                        value: new Color("#001d39").convertLinearToSRGB(),
                    },
                    waterHighlight: {
                        value: new Color("#002b53").convertLinearToSRGB(),
                    },
                    heightmap: {
                        value: null,
                    },
                }}
            />
        </mesh>
    );
});
