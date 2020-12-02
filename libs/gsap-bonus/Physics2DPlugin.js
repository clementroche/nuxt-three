/*!
 * Physics2DPlugin 3.4.0
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
    _DEG2RAD = Math.PI / 180,
    _getGSAP = function _getGSAP() {
  return gsap || typeof window !== "undefined" && (gsap = window.gsap) && gsap.registerPlugin && gsap;
},
    _round = function _round(value) {
  return Math.round(value * 10000) / 10000;
},
    _bonusValidated = 1,
    //<name>Physics2DPlugin</name>
_initCore = function _initCore(core) {
  gsap = core || _getGSAP();

  if (!_coreInitted) {
    _getUnit = gsap.utils.getUnit;
    _coreInitted = 1;
  }
};

var PhysicsProp = function PhysicsProp(target, p, velocity, acceleration, stepsPerTimeUnit) {
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
};

export var Physics2DPlugin = {
  version: "3.4.0",
  name: "physics2D",
  register: _initCore,
  init: function init(target, value, tween) {
    if (!_coreInitted) {
      _initCore();
    }

    var data = this,
        angle = +value.angle || 0,
        velocity = +value.velocity || 0,
        acceleration = +value.acceleration || 0,
        xProp = value.xProp || "x",
        yProp = value.yProp || "y",
        aAngle = value.accelerationAngle || value.accelerationAngle === 0 ? +value.accelerationAngle : angle;
    data.target = target;
    data.tween = tween;
    data.step = 0;
    data.sps = 30; //steps per second

    if (value.gravity) {
      acceleration = +value.gravity;
      aAngle = 90;
    }

    angle *= _DEG2RAD;
    aAngle *= _DEG2RAD;
    data.fr = 1 - (+value.friction || 0);

    data._props.push(xProp, yProp);

    data.xp = new PhysicsProp(target, xProp, Math.cos(angle) * velocity, Math.cos(aAngle) * acceleration, data.sps);
    data.yp = new PhysicsProp(target, yProp, Math.sin(angle) * velocity, Math.sin(aAngle) * acceleration, data.sps);
    data.skipX = data.skipY = 0;
  },
  render: function render(ratio, data) {
    var xp = data.xp,
        yp = data.yp,
        tween = data.tween,
        target = data.target,
        step = data.step,
        sps = data.sps,
        fr = data.fr,
        skipX = data.skipX,
        skipY = data.skipY,
        time = tween._from ? tween._dur - tween._time : tween._time,
        x,
        y,
        tt,
        steps,
        remainder,
        i;

    if (data.fr === 1) {
      tt = time * time * 0.5;
      x = xp.s + (xp.vel * time + xp.acc * tt);
      y = yp.s + (yp.vel * time + yp.acc * tt);
    } else {
      time *= sps;
      steps = i = (time | 0) - step;
      remainder = time % 1;

      if (i >= 0) {
        //going forward
        while (i--) {
          xp.v += xp.a;
          yp.v += yp.a;
          xp.v *= fr;
          yp.v *= fr;
          xp.val += xp.v;
          yp.val += yp.v;
        }
      } else {
        //going backwards
        i = -i;

        while (i--) {
          xp.val -= xp.v;
          yp.val -= yp.v;
          xp.v /= fr;
          yp.v /= fr;
          xp.v -= xp.a;
          yp.v -= yp.a;
        }
      }

      x = xp.val + xp.v * remainder;
      y = yp.val + yp.v * remainder;
      data.step += steps;
    }

    if (!skipX) {
      xp.set(target, xp.p, _round(x) + xp.u);
    }

    if (!skipY) {
      yp.set(target, yp.p, _round(y) + yp.u);
    }
  },
  kill: function kill(property) {
    if (this.xp.p === property) {
      this.skipX = 1;
    }

    if (this.yp.p === property) {
      this.skipY = 1;
    }
  }
};
_getGSAP() && gsap.registerPlugin(Physics2DPlugin);
export { Physics2DPlugin as default };