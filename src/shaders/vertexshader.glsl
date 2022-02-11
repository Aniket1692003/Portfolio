varying vec3 vNormal;

uniform float uTime;
uniform float uSpeed;
uniform float uNoiseDensity;
uniform float uNoiseStrength;

#pragma glslify: pnoise = require(glsl-noise/periodic/3d)

void main() {
  float t = uTime * uSpeed;
  // You can also use classic perlin noise or simplex noise,
  // I'm using its periodic variant out of curiosity
  float distortion = pnoise((normal + t), vec3(10.0) * uNoiseDensity) * uNoiseStrength;

  // Disturb each vertex along the direction of its normal
  vec3 pos = position + (normal * distortion);

  vNormal = normal;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}