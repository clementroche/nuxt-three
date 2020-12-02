/*!
 * CustomWiggle 3.4.0
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
    createCustomEase,
    _getGSAP = function _getGSAP() {
  return gsap || typeof window !== "undefined" && (gsap = window.gsap) && gsap.registerPlugin && gsap;
},
    _eases = {
  easeOut: "M0,1,C0.7,1,0.6,0,1,0",
  easeInOut: "M0,0,C0.1,0,0.24,1,0.444,1,0.644,1,0.6,0,1,0",
  anticipate: "M0,0,C0,0.222,0.024,0.386,0,0.4,0.18,0.455,0.65,0.646,0.7,0.67,0.9,0.76,1,0.846,1,1",
  uniform: "M0,0,C0,0.95,0,1,0,1,0,1,1,1,1,1,1,1,1,0,1,0"
},
    _linearEase = function _linearEase(p) {
  return p;
},
    _initCore = function _initCore(required) {
  if (!_coreInitted) {
    gsap = _getGSAP();
    createCustomEase = gsap && gsap.parseEase("_CE");

    if (createCustomEase) {
      for (var p in _eases) {
        _eases[p] = createCustomEase("", _eases[p]);
      }

      _coreInitted = 1;

      _create("wiggle").config = function (vars) {
        return typeof vars === "object" ? _create("", vars) : _create("wiggle(" + vars + ")", {
          wiggles: +vars
        });
      };
    } else {
      required && console.warn("Please gsap.registerPlugin(CustomEase, CustomWiggle)");
    }
  }
},
    _parseEase = function _parseEase(ease, invertNonCustomEases) {
  if (typeof ease !== "function") {
    ease = gsap.parseEase(ease) || createCustomEase("", ease);
  }

  return ease.custom || !invertNonCustomEases ? ease : function (p) {
    return 1 - ease(p);
  };
},
    _bonusValidated = 1,
    //<name>CustomWiggle</name>
_create = function _create(id, vars) {
  if (!_coreInitted) {
    _initCore(1);
  }

  vars = vars || {};
  var wiggles = (vars.wiggles || 10) | 0,
      inc = 1 / wiggles,
      x = inc / 2,
      anticipate = vars.type === "anticipate",
      yEase = _eases[vars.type] || _eases.easeOut,
      xEase = _linearEase,
      rnd = 1000,
      nextX,
      nextY,
      angle,
      handleX,
      handleY,
      easedX,
      y,
      path,
      i;

  if (_bonusValidated) {
    if (anticipate) {
      //the anticipate ease is actually applied on the x-axis (timing) and uses easeOut for amplitude.
      xEase = yEase;
      yEase = _eases.easeOut;
    }

    if (vars.timingEase) {
      xEase = _parseEase(vars.timingEase);
    }

    if (vars.amplitudeEase) {
      yEase = _parseEase(vars.amplitudeEase, true);
    }

    easedX = xEase(x);
    y = anticipate ? -yEase(x) : yEase(x);
    path = [0, 0, easedX / 4, 0, easedX / 2, y, easedX, y];

    if (vars.type === "random") {
      //if we just select random values on the y-axis and plug them into the "normal" algorithm, since the control points are always straight horizontal, it creates a bit of a slowdown at each anchor which just didn't seem as desirable, so we switched to an algorithm that bends the control points to be more in line with their context.
      path.length = 4;
      nextX = xEase(inc);
      nextY = Math.random() * 2 - 1;

      for (i = 2; i < wiggles; i++) {
        x = nextX;
        y = nextY;
        nextX = xEase(inc * i);
        nextY = Math.random() * 2 - 1;
        angle = Math.atan2(nextY - path[path.length - 3], nextX - path[path.length - 4]);
        handleX = Math.cos(angle) * inc;
        handleY = Math.sin(angle) * inc;
        path.push(x - handleX, y - handleY, x, y, x + handleX, y + handleY);
      }

      path.push(nextX, 0, 1, 0);
    } else {
      for (i = 1; i < wiggles; i++) {
        path.push(xEase(x + inc / 2), y);
        x += inc;
        y = (y > 0 ? -1 : 1) * yEase(i * inc);
        easedX = xEase(x);
        path.push(xEase(x - inc / 2), y, easedX, y);
      }

      path.push(xEase(x + inc / 4), y, xEase(x + inc / 4), 0, 1, 0);
    }

    i = path.length;

    while (--i > -1) {
      path[i] = ~~(path[i] * rnd) / rnd; //round values to avoid odd strings for super tiny values
    }

    path[2] = "C" + path[2];
    return createCustomEase(id, "M" + path.join(","));
  }
};

export var CustomWiggle = /*#__PURE__*/function () {
  function CustomWiggle(id, vars) {
    this.ease = _create(id, vars);
  }

  CustomWiggle.create = function create(id, vars) {
    return _create(id, vars);
  };

  CustomWiggle.register = function register(core) {
    gsap = core;

    _initCore();
  };

  return CustomWiggle;
}();
_getGSAP() && gsap.registerPlugin(CustomWiggle);
CustomWiggle.version = "3.4.0";
export { CustomWiggle as default };