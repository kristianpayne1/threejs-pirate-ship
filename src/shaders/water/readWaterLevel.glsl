uniform vec2 points[30];
uniform float numPoints;

uniform sampler2D levelTexture;

// Integer to float conversion from https://stackoverflow.com/questions/17981163/webgl-read-pixels-from-floating-point-render-target

float shift_right(float v, float amt) {

    v = floor(v) + 0.5;
    return floor(v / exp2(amt));

}

float shift_left(float v, float amt) {

    return floor(v * exp2(amt) + 0.5);

}

float mask_last(float v, float bits) {

    return mod(v, shift_left(1.0, bits));

}

float extract_bits(float num, float from, float to) {

    from = floor(from + 0.5);
    to = floor(to + 0.5);
    return mask_last(shift_right(num, from), to - from);

}

vec4 encode_float(float val) {
    if(val == 0.0)
        return vec4(0, 0, 0, 0);
    float sign = val > 0.0 ? 0.0 : 1.0;
    val = abs(val);
    float exponent = floor(log2(val));
    float biased_exponent = exponent + 127.0;
    float fraction = ((val / exp2(exponent)) - 1.0) * 8388608.0;
    float t = biased_exponent / 2.0;
    float last_bit_of_biased_exponent = fract(t) * 2.0;
    float remaining_bits_of_biased_exponent = floor(t);
    float byte4 = extract_bits(fraction, 0.0, 8.0) / 255.0;
    float byte3 = extract_bits(fraction, 8.0, 16.0) / 255.0;
    float byte2 = (last_bit_of_biased_exponent * 128.0 + extract_bits(fraction, 16.0, 23.0)) / 255.0;
    float byte1 = (sign * 128.0 + remaining_bits_of_biased_exponent) / 255.0;
    return vec4(byte4, byte3, byte2, byte1);
}

vec4 calculateHeightNormal(vec2 point, vec2 cellSize) {
    float waterLevel = texture2D(levelTexture, point).x;

    vec2 normal = vec2((texture2D(levelTexture, point + vec2(-cellSize.x, 0)).x - texture2D(levelTexture, point + vec2(cellSize.x, 0)).x) * WIDTH / BOUNDS, (texture2D(levelTexture, point + vec2(0, -cellSize.y)).x - texture2D(levelTexture, point + vec2(0, cellSize.y)).x) * WIDTH / BOUNDS);

    if(gl_FragCoord.x < 1.5)
        return encode_float(waterLevel);
    else if(gl_FragCoord.x < 2.5)
        return encode_float(normal.x);
    else if(gl_FragCoord.x < 3.5)
        return encode_float(normal.y);
    else
        return encode_float(0.0);

}

void main() {

    vec2 cellSize = 1.0 / resolution.xy;

    int index = int(floor(gl_FragCoord.y / float(resolution.y) * numPoints));

    if(index >= int(numPoints) || index < 0)
        gl_FragColor = encode_float(0.0);
    else {
        gl_FragColor = calculateHeightNormal(points[index], cellSize);
    }
}