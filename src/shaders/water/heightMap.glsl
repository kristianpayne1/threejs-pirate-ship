
#include <common>

uniform float uTime;

float displace(vec2 point) {

  vec3 p = vec3(point, 0);

  gln_tFBMOpts fbmOpts = gln_tFBMOpts(1.0, 0.5, 2.0, 2.0, 1.0, 5, false, false);

  gln_tGerstnerWaveOpts A = gln_tGerstnerWaveOpts(vec2(0.0, -1.0), 0.4, 5.0);
  gln_tGerstnerWaveOpts B = gln_tGerstnerWaveOpts(vec2(0.0, 1.0), 0.4, 5.0);

  vec3 n = vec3(0.0);

  n.z += gln_normalize(gln_pfbm(p.xy + (uTime * 0.5), fbmOpts));
  n += gln_GerstnerWave(p, A, uTime).xzy;
  n += gln_GerstnerWave(p, B, uTime).xzy * 0.5;

  return n.z;
}  

void main()	{

    vec2 cellSize = 1.0 / resolution.xy;

    vec2 uv = gl_FragCoord.xy * cellSize;

    vec4 heightMapValue = texture2D(heightmap, uv);

    float newHeight = displace(uv);

    heightMapValue.y = heightMapValue.x;
    heightMapValue.x = newHeight;

    gl_FragColor = heightMapValue;
}
