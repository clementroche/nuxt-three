import { Uniform } from 'three'
import { Effect, BlendFunction } from 'postprocessing'

const fragment = `
  precision highp float;
  uniform float intensity;

  vec2 barrelPincushion(vec2 uv, float strength) {
    vec2 st = uv - 0.5;
    
    float ratio = resolution.x/resolution.y;

    float theta = atan(st.x, st.y);
    vec2 radius = vec2(sqrt(dot(st, st)));
    radius *= 1.0 + strength * (radius * radius);

    uv = 0.5 + radius * vec2(sin(theta), cos(theta));

    return uv;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 vUv = uv;
    vec2 barrelUv = barrelPincushion(vUv, intensity);
    vUv = barrelUv;

    outputColor = texture2D(inputBuffer,vUv);
  }
`

export default class BarrelEffect extends Effect {
  constructor({ blendFunction = BlendFunction.NORMAL, intensity = 0.1 } = {}) {
    super('BarrelEffect', fragment, {
      blendFunction,
      uniforms: new Map([['intensity', new Uniform(intensity)]])
    })
  }
}
