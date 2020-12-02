import gsap from './gsap-core.js'
import CSSPlugin from './CSSPlugin.js'
const gsapWithCSS = gsap.registerPlugin(CSSPlugin) || gsap // to protect from tree shaking
const TweenMaxWithCSS = gsapWithCSS.core.Tween

export {
  gsapWithCSS as gsap,
  gsapWithCSS as default,
  CSSPlugin,
  TweenMaxWithCSS as TweenMax,
}
export {
  TweenLite,
  TimelineMax,
  TimelineLite,
  Power0,
  Power1,
  Power2,
  Power3,
  Power4,
  Linear,
  Quad,
  Cubic,
  Quart,
  Quint,
  Strong,
  Elastic,
  Back,
  SteppedEase,
  Bounce,
  Sine,
  Expo,
  Circ,
  wrap,
  wrapYoyo,
  distribute,
  random,
  snap,
  normalize,
  getUnit,
  clamp,
  splitColor,
  toArray,
  mapRange,
  pipe,
  unitize,
  interpolate,
  shuffle,
} from './gsap-core.js'
export * from './Draggable.js'
export * from './CSSRulePlugin.js'
export * from './EaselPlugin.js'
export * from './EasePack.js'
export * from './MotionPathPlugin.js'
export * from './PixiPlugin.js'
export * from './ScrollToPlugin.js'
export * from './ScrollTrigger.js'
export * from './TextPlugin.js'

// BONUS EXPORTS
export * from './CustomEase.js'
export * from './DrawSVGPlugin.js'
export * from './Physics2DPlugin.js'
export * from './PhysicsPropsPlugin.js'
export * from './ScrambleTextPlugin.js'
export * from './CustomBounce.js'
export * from './CustomWiggle.js'
export * from './GSDevTools.js'
export * from './InertiaPlugin.js'
export * from './MorphSVGPlugin.js'
export * from './MotionPathHelper.js'
export * from './SplitText.js'
