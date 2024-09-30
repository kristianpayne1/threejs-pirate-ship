uniform vec3 uFrequency;
uniform float uTime;

varying vec2 vUv;
varying float vElevation;

void main() {
    vec3 modelPosition = position;

    float elevation = sin(modelPosition.x * uFrequency.x - uTime * 2.0) * 0.1;
    elevation += sin(modelPosition.y * uFrequency.y - uTime * 2.0) * 0.1;

    if(uv.x > 0.0) {
        modelPosition.z += elevation;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(modelPosition, 1.0);

    vUv = uv;
    vElevation = elevation;
}