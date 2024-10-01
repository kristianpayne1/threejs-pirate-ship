import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
    BackSide,
    Color,
    InstancedMesh,
    Mesh,
    SkinnedMesh,
    Vector2,
} from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend, applyProps, useThree } from "@react-three/fiber";
import { toCreasedNormals } from "three-stdlib";
import ThreeCustomShaderMaterial from "three-custom-shader-material";

import vertexShader from "../shaders/outlines/vertex.glsl";
import fragmentShader from "../shaders/outlines/fragment.glsl";

const OutlinesMaterial = shaderMaterial(
    {
        screenspace: false,
        color: new Color("black"),
        opacity: 1,
        thickness: 0.05,
        size: new Vector2(),
    },
    vertexShader,
    fragmentShader
);

extend({ OutlinesMaterial });

export const Outlines = forwardRef(function Outlines(
    {
        color = "black",
        opacity = 1,
        transparent = false,
        screenspace = false,
        toneMapped = true,
        polygonOffset = false,
        polygonOffsetFactor = 0,
        renderOrder = 0,
        thickness = 0.05,
        angle = Math.PI,
        vertexShader = ``,
        fragmentShader = ``,
        uniforms = {},
        ...props
    },
    outlinesRef
) {
    const _ref = useRef();
    const ref = outlinesRef || _ref;

    const { gl } = useThree();
    const contextSize = gl.getDrawingBufferSize(new Vector2());

    const oldAngle = useRef(0);
    const oldGeometry = useRef();

    const material = useMemo(() => {
        if (!vertexShader && !fragmentShader)
            return new OutlinesMaterial({ side: BackSide });
        return new ThreeCustomShaderMaterial({
            baseMaterial: OutlinesMaterial,
            vertexShader,
            fragmentShader,
            uniforms,
        });
    }, [vertexShader, fragmentShader, uniforms]);

    useLayoutEffect(() => {
        const group = ref.current;
        if (!group) return;

        const parent = group.parent;
        if (parent && parent.geometry) {
            if (
                oldAngle.current !== angle ||
                oldGeometry.current !== parent.geometry
            ) {
                oldAngle.current = angle;
                oldGeometry.current = parent.geometry;

                // Remove old mesh
                let mesh = group.children?.[0];
                if (mesh) {
                    if (angle) mesh.geometry.dispose();
                    group.remove(mesh);
                }

                if (parent.skeleton) {
                    mesh = new SkinnedMesh();
                    mesh.material = material;
                    mesh.bind(parent.skeleton, parent.bindMatrix);
                    group.add(mesh);
                } else if (parent.isInstancedMesh) {
                    mesh = new InstancedMesh(
                        parent.geometry,
                        material,
                        parent.count
                    );
                    mesh.instanceMatrix = parent.instanceMatrix;
                    group.add(mesh);
                } else {
                    mesh = new Mesh();
                    mesh.material = material;
                    group.add(mesh);
                }
                mesh.geometry = angle
                    ? toCreasedNormals(parent.geometry, angle)
                    : parent.geometry;
            }
        }
    });

    useLayoutEffect(() => {
        const group = ref.current;
        if (!group) return;

        const mesh = group.children[0];
        if (mesh) {
            mesh.renderOrder = renderOrder;
            applyProps(mesh.material, {
                transparent,
                thickness,
                color,
                opacity,
                size: contextSize,
                screenspace,
                toneMapped,
                polygonOffset,
                polygonOffsetFactor,
            });
        }
    });

    useEffect(() => {
        return () => {
            // Dispose everything on unmount
            const group = ref.current;
            if (!group) return;

            const mesh = group.children[0];
            if (mesh) {
                if (angle) mesh.geometry.dispose();
                group.remove(mesh);
            }
        };
    }, []);

    return <group ref={ref} {...props} />;
});
