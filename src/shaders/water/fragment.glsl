varying float vHeight;

uniform vec3 waterColor;
uniform vec3 waterHighlight;

vec3 calcColor() {

  float mask = vHeight * 3.1;

  vec3 diffuseColor = mix(waterColor, waterHighlight, mask);

  return diffuseColor;
}

void main() {
  csm_DiffuseColor = vec4(calcColor(), 0.9);
}
