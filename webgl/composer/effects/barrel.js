import { Uniform } from 'three'
import { Effect, BlendFunction } from 'postprocessing'

const fragment = `
  precision highp float;
  uniform float intensity;

  vec2 brownConradyDistortion(in vec2 uv, in float k1, in float k2)
{
    uv = uv * 2.0 - 1.0;	// brown conrady takes [-1:1]

    // positive values of K1 give barrel distortion, negative give pincushion
    float r2 = uv.x*uv.x + uv.y*uv.y;
    uv *= 1.0 + k1 * r2 + k2 * r2 * r2;
    
    // tangential distortion (due to off center lens elements)
    // is not modeled in this function, but if it was, the terms would go here
    
    uv = (uv * .5 + .5);	// restore -> [0:1]
    return uv;
}

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 vUv = uv;
    vec2 barrelUv = brownConradyDistortion(vUv,intensity * ((1.-uv.y) * 0.5),0.);
    vUv = barrelUv;

    outputColor = texture2D(inputBuffer,vUv);
    // outputColor.r = (1.-uv.y) * 0.2;
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
