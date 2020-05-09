varying vec2 vUv;

uniform vec2 uRatio;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
  vUv = vec2(
    map(uv.x, 0.0, 1.0, 0.5 - uRatio.x / 2.0, 0.5 + uRatio.x / 2.0),
    map(uv.y, 0.0, 1.0, 0.5 - uRatio.y / 2.0, 0.5 + uRatio.y / 2.0)
  );

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}