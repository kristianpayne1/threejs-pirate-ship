uniform sampler2D heightmap; 

varying float vHeight;
varying vec2 vUv;

float BOUNDS = 8.0;
float WIDTH = 40.0;

vec3 displace(vec3 p) {
  if (abs(normal.x) > 0.5) {
    vUv = vec2(1.0 - uv.x, 1.0 - uv.y);
  }
  if (abs(normal.z) > 0.5) {
    vUv = vec2(uv.x, 1.0 - uv.y);
  }

  float heightValue = texture2D(heightmap, vUv).x;
  vec3 n = p;
  if (p.z >= 0.8 / 2.0) {
    n = vec3(p.xy, p.z + heightValue);
  }
  return n;
}

vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
  : vec3(0.0, -v.z, v.y));
}

vec3 recalcNormals(vec3 newPos) {
  float offset = 0.001;
  vec3 tangent = orthogonal(normal);
  vec3 bitangent = normalize(cross(normal, tangent));
  vec3 neighbour1 = position + tangent * offset;
  vec3 neighbour2 = position + bitangent * offset;

  vec3 displacedNeighbour1 = displace(neighbour1);
  vec3 displacedNeighbour2 = displace(neighbour2);

  vec3 displacedTangent = displacedNeighbour1 - newPos;
  vec3 displacedBitangent = displacedNeighbour2 - newPos;

  return normalize(cross(displacedTangent, displacedBitangent));
}

void main() {
  vUv = uv;
  vec3 newPosition = displace(position);
  vHeight = newPosition.z;

  csm_Position = newPosition;
  csm_Normal = recalcNormals(newPosition);
}
