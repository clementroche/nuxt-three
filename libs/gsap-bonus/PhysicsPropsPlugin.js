/*!
 * PhysicsPropsPlugin 3.4.0
 * https://greensock.com
 *
 * @license Copyright 2008-2020, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */

/* eslint-disable */
var gsap,
    _coreInitted,
    _getUnit,
    _getGSAP = function _getGSAP() {
  return gsap || typeof window !== "undefined" && (gsap = window.gsap) && gsap.registerPlugin && gsap;
},
    _round = function _round(value) {
  return Math.round(value * 10000) / 10000;
},
    _bonusValidated = 1,
    //<name>PhysicsPropsPlugin</name>
_initCore = function _initCore(core) {
  gsap = core || _getGSAP();

  if (!_coreInitted) {
    _getUnit = gsap.utils.getUnit;
    _coreInitted = 1;
  }
};

var PhysicsProp = function PhysicsProp(target, p, velocity, acceleration, friction, stepsPerTimeUnit) {
  var cache = target._gsap,
      curVal = cache.get(target, p);
  this.p = p;
  this.set = cache.set(target, p); //setter

  this.s = this.val = parseFloat(curVal);
  this.u = _getUnit(curVal) || 0;
  this.vel = velocity || 0;
  this.v = this.vel / stepsPerTimeUnit;

  if (acceleration || acceleration === 0) {
    this.acc = acceleration;
    this.a = this.acc / (stepsPerTimeUnit * stepsPerTimeUnit);
  } else {
    this.acc = this.a = 0;
  }

  this.fr = 1 - (friction || 0);
};

export var PhysicsPropsPlugin = {
  version: "3.4.0",
  name: "physicsProps",
  register: _initCore,
  init: function init(target, value, tween) {
    if (!_coreInitted) {
      _initCore();
    }

    var data = this,
        p;
    data.target = target;
    data.tween = tween;
    data.step = 0;
    data.sps = 30; //steps per second

    data.vProps = [];

    for (p in value) {
      var _value$p = value[p],
          velocity = _value$p.velocity,
          acceleration = _value$p.acceleration,
          friction = _value$p.friction;

      if (velocity || acceleration) {
        data.vProps.push(new PhysicsProp(target, p, velocity, acceleration, friction, data.sps));

        data._props.push(p);

        if (friction) {
          data.hasFr = 1;
        }
      }
    }
  },
  render: function render(ratio, data) {
    var vProps = data.vProps,
        tween = data.tween,
        target = data.target,
        step = data.step,
        hasFr = data.hasFr,
        sps = data.sps,
        i = vProps.length,
        time = tween._from ? tween._dur - tween._time : tween._time,
        curProp,
        steps,
        remainder,
        j,
        tt;

    if (hasFr) {
      time *= sps;
      steps = (time | 0) - step;
      remainder = time % 1;

      if (steps >= 0) {
        //going forward
        while (i--) {
          curProp = vProps[i];
          j = steps;

          while (j--) {
            curProp.v += curProp.a;
            curProp.v *= curProp.fr;
            curProp.val += curProp.v;
          }

          curProp.set(target, curProp.p, _round(curProp.val + curProp.v * remainder) + curProp.u);
        }
      } else {
        //going backwards
        while (i--) {
          curProp = vProps[i];
          j = -steps;

          while (j--) {
            curProp.val -= curProp.v;
            curProp.v /= curProp.fr;
            curProp.v -= curProp.a;
          }

          curProp.set(target, curProp.p, _round(curProp.val + curProp.v * remainder) + curProp.u);
        }
      }

      data.step += steps;
    } else {
      tt = time * time * 0.5;

      while (i--) {
        curProp = vProps[i];
        curProp.set(target, curProp.p, _round(curProp.s + curProp.vel * time + curProp.acc * tt) + curProp.u);
      }
    }
  },
  kill: function kill(property) {
    var vProps = this.vProps,
        i = vProps.length;

    while (i--) {
      if (vProps[i].p === property) {
        vProps.splice(i, 1);
      }
    }
  }
};
_getGSAP() && gsap.registerPlugin(PhysicsPropsPlugin);
export { PhysicsPropsPlugin as default };