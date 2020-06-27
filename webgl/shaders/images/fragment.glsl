precision highp float;

varying vec2 vUv;

uniform sampler2D uMap;
uniform float uOpacity;

void main() {
  vec4 map = texture2D(uMap, vUv);
  gl_FragColor = map;
  gl_FragColor.a *= uOpacity;
}