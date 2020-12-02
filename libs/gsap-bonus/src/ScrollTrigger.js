/*!
 * ScrollTrigger 3.4.0
 * https://greensock.com
 *
 * @license Copyright 2008-2020, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */
/* eslint-disable */

let gsap, _coreInitted, _win, _doc, _docEl, _body, _root, _resizeDelay, _raf, _request, _toArray, _clamp, _time2, _syncInterval, _refreshing, _pointerIsDown, _transformProp, _i, _prevWidth, _prevHeight, _autoRefresh,
	_limitCallbacks, // if true, we'll only trigger callbacks if the active state toggles, so if you scroll immediately past both the start and end positions of a ScrollTrigger (thus inactive to inactive), neither its onEnter nor onLeave will be called. This is useful during startup.
	_startup = 1,
	_proxies = [],
	_scrollers = [],
	_getTime = Date.now,
	_time1 = _getTime(),
	_lastScrollTime = 0,
	_enabled = 1,
	_passThrough = v => v,
	_windowExists = () => typeof(window) !== "undefined",
	_getGSAP = () => gsap || (_windowExists() && (gsap = window.gsap) && gsap.registerPlugin && gsap),
	_isViewport = e => !!~_root.indexOf(e),
	_getProxyProp = (element, property) => ~_proxies.indexOf(element) && _proxies[_proxies.indexOf(element) + 1][property],
	_getScrollFunc = (element, {s, sc}) => {
		let i = _scrollers.indexOf(element),
			func = ~i ? _scrollers[i+1] : _getProxyProp(element, s) || (_isViewport(element) ? sc : function(value) { return arguments.length ? (element[s] = value) : element[s]; });
		!~i && _scrollers.push(element, func);
		return func;
	},
	_getBoundsFunc = element => _getProxyProp(element, "getBoundingClientRect") || (_isViewport(element) ? () => {_winOffsets.width = _win.innerWidth; _winOffsets.height = _win.innerHeight; return _winOffsets;} : () => _getBounds(element)),
	_getSizeFunc = (scroller, isViewport, {d, d2, a}) => (a = _getProxyProp(scroller, "getBoundingClientRect")) ? () => a()[d] : () => (isViewport ? _win["inner" + d2] : scroller["client" + d2]) || 0,
	_getOffsetsFunc = (element, isViewport) => !isViewport || ~_proxies.indexOf(element) ? _getBoundsFunc(element) : () => _winOffsets,
	_maxScroll = (element, {s, d2, d, a}) => (s = "scroll" + d2) && (a = _getProxyProp(element, s)) ? a() - _getBoundsFunc(element)()[d] : _isViewport(element) ? Math.max(_docEl[s], _body[s]) - (_win["inner" + d2] || _docEl["client" + d2] || _body["client" + d2]) : element[s] - element["offset" + d2],
	_iterateAutoRefresh = (func, events) => {
		for (let i = 0; i < _autoRefresh.length; i += 3) {
			(!events || ~events.indexOf(_autoRefresh[i+1])) && func(_autoRefresh[i], _autoRefresh[i+1], _autoRefresh[i+2]);
		}
	},
	_isString = value => typeof(value) === "string",
	_isFunction = value => typeof(value) === "function",
	_isNumber = value => typeof(value) === "number",
	_isObject = value => typeof(value) === "object",
	_abs = Math.abs,
	_scrollLeft = "scrollLeft",
	_scrollTop = "scrollTop",
	_left = "left",
	_top = "top",
	_right = "right",
	_bottom = "bottom",
	_width = "width",
	_height = "height",
	_Right = "Right",
	_Left = "Left",
	_Top = "Top",
	_Bottom = "Bottom",
	_padding = "padding",
	_margin = "margin",
	_Width = "Width",
	_Height = "Height",
	_px = "px",
	_horizontal = {s: _scrollLeft, p: _left, p2: _Left, os: _right, os2: _Right, d: _width, d2: _Width, a: "x", sc: function(value) { return arguments.length ? _win.scrollTo(value, _vertical.sc()) : _win.pageXOffset || _doc[_scrollLeft] || _docEl[_scrollLeft] || _body[_scrollLeft] || 0}},
	_vertical = {s: _scrollTop, p: _top, p2: _Top, os: _bottom, os2: _Bottom, d: _height, d2: _Height, a: "y", op: _horizontal, sc: function(value) { return arguments.length ? _win.scrollTo(_horizontal.sc(), value) : _win.pageYOffset || _doc[_scrollTop] || _docEl[_scrollTop] || _body[_scrollTop] || 0}},
	_getComputedStyle = element => _win.getComputedStyle(element),
	_makePositionable = element => element.style.position = (_getComputedStyle(element).position === "absolute") ? "absolute" : "relative", // if the element already has position: absolute, leave that, otherwise make it position: relative
	_setDefaults = (obj, defaults) => {
		for (let p in defaults) {
			(p in obj) || (obj[p] = defaults[p]);
		}
		return obj;
	},
	//_isInViewport = element => (element = _getBounds(element)) && !(element.top > (_win.innerHeight || _docEl.clientHeight) || element.bottom < 0 || element.left > (_win.innerWidth || _docEl.clientWidth) || element.right < 0) && element,
	_getBounds = (element, withoutTransforms) => {
		let tween = withoutTransforms && _getComputedStyle(element)[_transformProp] !== "matrix(1, 0, 0, 1, 0, 0)" && gsap.to(element, {x: 0, y: 0, xPercent: 0, yPercent: 0, rotation: 0, rotationX: 0, rotationY: 0, scale: 1, skewX: 0, skewY: 0}).progress(1),
			bounds = element.getBoundingClientRect();
		tween && tween.progress(0).kill();
		return bounds;
	},
	_getSize = (element, {d2}) => element["offset" + d2] || element["client" + d2] || 0,
	_getLabels = animation => {
		return value => {
			let a = [],
				labels = animation.labels,
				duration = animation.duration(),
				p;
			for (p in labels) {
				a.push(labels[p] / duration);
			}
			return gsap.utils.snap(a, value);
		};
	},
	_multiListener = (func, element, types, callback) => types.split(",").forEach(type => func(element, type, callback)),
	_addListener = (element, type, func) => element.addEventListener(type, func, {passive: true}),
	_removeListener = (element, type, func) => element.removeEventListener(type, func),
	_markerDefaults = {startColor: "green", endColor: "red", indent: 0, fontSize: "16px", fontWeight:"normal"},
	_defaults = {toggleActions: "play", anticipatePin: 0},
	_keywords = {top: 0, left: 0, center: 0.5, bottom: 1, right: 1},
	_offsetToPx = (value, size) => {
		if (_isString(value)) {
			let eqIndex = value.indexOf("="),
				relative = ~eqIndex ? +(value.charAt(eqIndex-1) + 1) * parseFloat(value.substr(eqIndex + 1)) : 0;
			if (relative) {
				(value.indexOf("%") > eqIndex) && (relative *= size / 100);
				value = value.substr(0, eqIndex-1);
			}
			value = relative + ((value in _keywords) ? _keywords[value] * size : ~value.indexOf("%") ? parseFloat(value) * size / 100 : parseFloat(value) || 0);
		}
		return value;
	},
	_createMarker = (type, name, container, direction, {startColor, endColor, fontSize, indent, fontWeight}, offset, matchWidthEl) => {
		let e = _doc.createElement("div"),
			useFixedPosition = _isViewport(container) || _getProxyProp(container, "pinType") === "fixed",
			isScroller = type.indexOf("scroller") !== -1,
			parent = useFixedPosition ? _body : container,
			isStart = type.indexOf("start") !== -1,
			color = isStart ? startColor : endColor,
			css = "border-color:" + color + ";font-size:" + fontSize + ";color:" + color + ";font-weight:" + fontWeight + ";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";
		css += "position:" + (isScroller && useFixedPosition ? "fixed;" : "absolute;");
		(isScroller || !useFixedPosition) && (css += (direction === _vertical ? _right : _bottom) + ":" + (offset + parseFloat(indent)) + "px;");
		matchWidthEl && (css += "box-sizing:border-box;text-align:left;width:" + matchWidthEl.offsetWidth + "px;");
		e._isStart = isStart;
		e.setAttribute("class", "gsap-marker-" + type);
		e.style.cssText = css;
		e.innerText = name || name === 0 ? type + "-" + name : type;
		parent.insertBefore(e, parent.children[0]);
		e._offset = e["offset" + direction.op.d2];
		_positionMarker(e, 0, direction, isStart);
		return e;
	},
	_positionMarker = (marker, start, direction, flipped) => {
		let vars = {display: "block"},
			side = direction[flipped ? "os2" : "p2"],
			oppositeSide = direction[flipped ? "p2" : "os2"];
		marker._isFlipped = flipped;
		vars[direction.a + "Percent"] = flipped ? -100 : 0;
		vars[direction.a] = flipped ? 1 : 0;
		vars["border" + side + _Width] = 1;
		vars["border" + oppositeSide + _Width] = 0;
		vars[direction.p] = start;
		gsap.set(marker, vars);
	},
	_triggers = [],
	_ids = {},
	_sync = () => _request || (_request = _raf(_updateAll)),
	_onScroll = () => {
		if (!_request) {
			_request = _raf(_updateAll);
			_lastScrollTime || _dispatch("scrollStart");
			_lastScrollTime = _getTime();
		}
	},
	_onResize = () => !_refreshing && _resizeDelay.restart(true), // ignore resizes triggered by refresh()
	_listeners = {},
	_emptyArray = [],
	_media = [],
	_creatingMedia, // when ScrollTrigger.matchMedia() is called, we record the current media key here (like "(min-width: 800px)") so that we can assign it to everything that's created during that call. Then we can revert just those when necessary. In the ScrollTrigger's init() call, the _creatingMedia is recorded as a "media" property on the instance.
	_lastMediaTick,
	_onMediaChange = e => {
		let tick = gsap.ticker.frame,
			matches = [],
			i = 0;
		if (_lastMediaTick !== tick) {
			_revertAll();
			for (; i < _media.length; i+=2) {
				_win.matchMedia(_media[i]).matches ? matches.push(i) : _revertAll(1, _media[i]); // Firefox doesn't update the "matches" property of the MediaQueryList object correctly - it only does so as it calls its change handler - so we must re-create a media query here to ensure it's accurate.
			}
			_revertRecorded(); // in case killing/reverting any of the animations actually added inline styles back.
			for (i = 0; i < matches.length; i++) {
				_creatingMedia = _media[matches[i]];
				_media[matches[i]+1](e);
			}
			_creatingMedia = 0;
			_refreshAll(0, 1);
			_lastMediaTick = tick;
		}
	},
	_softRefresh = () => _removeListener(ScrollTrigger, "scrollEnd", _softRefresh) || _refreshAll(true),
	_dispatch = type => (_listeners[type] && _listeners[type].map(f => f())) || _emptyArray,
	_savedStyles = [], // when ScrollTrigger.saveStyles() is called, the inline styles are recorded in this Array in a sequential format like [element, cssText, gsCache, media]. This keeps it very memory-efficient and fast to iterate through.
	_revertRecorded = media => {
		for (let i = 0; i < _savedStyles.length; i+=4) {
			if (!media || _savedStyles[i+3] === media) {
				_savedStyles[i].style.cssText = _savedStyles[i+1];
				_savedStyles[i+2].uncache = 1;
			}
		}
	},
	_revertAll = (kill, media) => {
		let trigger;
		for (_i = 0; _i < _triggers.length; _i++) {
			trigger = _triggers[_i];
			if (!media || trigger.media === media) {
				if (kill) {
					trigger.kill(1);
				} else {
					trigger.scroll.rec || (trigger.scroll.rec = trigger.scroll()); // record the scroll positions so that in each refresh() we can ensure that it doesn't shift. Remember, pinning can make things change around, especially if the same element is pinned multiple times. If one was already recorded, don't re-record because unpinning may have occurred and made it shorter.
					trigger.revert();
				}
			}
		}
		_revertRecorded(media);
		media || _dispatch("revert");
	},
	_refreshAll = (force, skipRevert) => {
		if (_lastScrollTime && !force) {
			_addListener(ScrollTrigger, "scrollEnd", _softRefresh);
			return;
		}
		let refreshInits = _dispatch("refreshInit");
		skipRevert || _revertAll();
		for (_i = 0; _i < _triggers.length; _i++) {
			_triggers[_i].refresh();
		}
		refreshInits.forEach(result => result && result.render && result.render(-1)); // if the onRefreshInit() returns an animation (typically a gsap.set()), revert it. This makes it easy to put things in a certain spot before refreshing for measurement purposes, and then put things back.
		_i = _triggers.length;
		while (_i--) {
			_triggers[_i].scroll.rec = 0;
		}
		_dispatch("refresh");
	},
	_updateAll = () => {
		let l = _triggers.length,
			time = _getTime(),
			recordVelocity = time - _time1 >= 50;
		if (recordVelocity) {
			if (_lastScrollTime && !_pointerIsDown && time - _lastScrollTime > 200) {
				_lastScrollTime = 0;
				_dispatch("scrollEnd");
			}
			_time2 = _time1;
			_time1 = time;
		}
		for (_i = 0; _i < l; _i++) {
			_triggers[_i] && _triggers[_i].update(0, recordVelocity);
		}
		_request = 0;
	},
	_propNamesToCopy = [_left, _top, _bottom, _right, _margin + _Bottom, _margin + _Right, _margin + _Top, _margin + _Left, "display", "flexShrink"],
	_stateProps = _propNamesToCopy.concat([_width, _height, "boxSizing", "max" + _Width, "max" + _Height, "position", _margin, _padding, _padding + _Top, _padding + _Right, _padding + _Bottom, _padding + _Left]),
	_swapPinOut = (pin, spacer, state) => {
		_setState(state);
		if (pin.parentNode === spacer) {
			let parent = spacer.parentNode;
			if (parent) {
				parent.insertBefore(pin, spacer);
				parent.removeChild(spacer);
			}
		}
	},
	_swapPinIn = (pin, spacer, cs) => {
		if (pin.parentNode !== spacer) {
			let i = _propNamesToCopy.length,
				spacerStyle = spacer.style,
				pinStyle = pin.style,
				p;
			while (i--) {
				p = _propNamesToCopy[i];
				spacerStyle[p] = cs[p];
			}
			spacerStyle.position = cs.position === "absolute" ? "absolute" : "relative";
			(cs.display === "inline") && (spacerStyle.display = "inline-block");
			pinStyle[_bottom] = pinStyle[_right] = "auto";
			spacerStyle.overflow = "visible";
			spacerStyle.boxSizing = "border-box";
			spacerStyle[_width] = _getSize(pin, _horizontal) + _px;
			spacerStyle[_height] = _getSize(pin, _vertical) + _px;
			spacerStyle[_padding] = pinStyle[_margin] = pinStyle[_top] = pinStyle[_left] = "0";
			pinStyle[_width] = cs[_width];
			pinStyle[_height] = cs[_height];
			pinStyle[_padding] = cs[_padding];
			pin.parentNode.insertBefore(spacer, pin);
			spacer.appendChild(pin);
		}
	},
	_capsExp = /([A-Z])/g,
	_setState = state => {
		if (state) {
			let style = state.t.style,
				l = state.length,
				i = 0,
				p, value;
			for (; i < l; i +=2) {
				value = state[i+1];
				p = state[i];
				if (value) {
					style[p] = value;
				} else if (style[p]) {
					style.removeProperty(p.replace(_capsExp, "-$1").toLowerCase());
				}
			}
		}
	},
	_getState = element => { // returns an array with alternating values like [property, value, property, value] and a "t" property pointing to the target (element). Makes it fast and cheap.
		let l = _stateProps.length,
			style = element.style,
			state = [],
			i = 0;
		for (; i < l; i++) {
			state.push(_stateProps[i], style[_stateProps[i]]);
		}
		state.t = element;
		return state;
	},
	_copyState = (state, override, omitOffsets) => {
		let result = [],
			l = state.length,
			i = omitOffsets ? 8 : 0, // skip top, left, right, bottom if omitOffsets is true
			p;
		for (; i < l; i += 2) {
			p = state[i];
			result.push(p, (p in override) ? override[p] : state[i+1]);
		}
		result.t = state.t;
		return result;
	},
	_winOffsets = {left:0, top:0},
	_parsePosition = (value, trigger, scrollerSize, direction, scroll, marker, markerScroller, self, scrollerBounds, borderWidth, useFixedPosition, scrollerMax) => {
		_isFunction(value) && (value = value(self));
		if (_isString(value) && value.substr(0,3) === "max") {
			value = scrollerMax + (value.charAt(4) === "=" ? _offsetToPx("0" + value.substr(3), scrollerSize) : 0);
		}
		if (!_isNumber(value)) {
			_isFunction(trigger) && (trigger = trigger(self));
			let element = _toArray(trigger)[0] || _body,
				bounds = _getBounds(element) || {},
				offsets = value.split(" "),
				localOffset, globalOffset, display;
			if ((!bounds || (!bounds.left && !bounds.top)) && _getComputedStyle(element).display === "none") { // if display is "none", it won't report getBoundingClientRect() properly
				display = element.style.display;
				element.style.display = "block";
				bounds = _getBounds(element);
				display ? (element.style.display = display) : element.style.removeProperty("display");
			}
			localOffset = _offsetToPx(offsets[0], bounds[direction.d]);
			globalOffset = _offsetToPx(offsets[1] || "0", scrollerSize);
			value = bounds[direction.p] - scrollerBounds[direction.p] - borderWidth + localOffset + scroll - globalOffset;
			markerScroller && _positionMarker(markerScroller, globalOffset, direction, (scrollerSize - globalOffset < 20 || (markerScroller._isStart && globalOffset > 20)));
			scrollerSize -= scrollerSize - globalOffset; // adjust for the marker
		} else if (markerScroller) {
			_positionMarker(markerScroller, scrollerSize, direction, true);
		}
		if (marker) {
			let position = value + scrollerSize,
				isStart = marker._isStart;
			scrollerMax = "scroll" + direction.d2;
			_positionMarker(marker, position, direction, (isStart && position > 20) || (!isStart && (useFixedPosition ? Math.max(_body[scrollerMax], _docEl[scrollerMax]) : marker.parentNode[scrollerMax]) <= position + 1));
			if (useFixedPosition) {
				scrollerBounds = _getBounds(markerScroller);
				useFixedPosition && (marker.style[direction.op.p] = (scrollerBounds[direction.op.p] - direction.op.m - marker._offset) + _px);
			}
		}
		return Math.round(value);
	},
	_prefixExp = /(?:webkit|moz|length)/i,
	_reparent = (element, parent) => {
		if (element.parentNode !== parent) {
			let style = element.style,
				p, cs;
			if (parent === _body) {
				element._stOrig = style.cssText; // record original inline styles so we can revert them later
				cs = _getComputedStyle(element);
				for (p in cs) { // must copy all relevant styles to ensure that nothing changes visually when we reparent to the <body>. Skip the vendor prefixed ones.
					if (!+p && !_prefixExp.test(p) && cs[p] && typeof style[p] === "string" && p !== "0") {
						style[p] = cs[p];
					}
				}
			} else {
				style.cssText = element._stOrig;
			}
			parent.appendChild(element);
		}
	},
	// returns a function that can be used to tween the scroll position in the direction provided, and when doing so it'll add a .tween property to the FUNCTION itself, and remove it when the tween completes or gets killed. This gives us a way to have multiple ScrollTriggers use a central function for any given scroller and see if there's a scroll tween running (which would affect if/how things get updated)
	_getTweenCreator = (scroller, direction) => {
		let getScroll = _getScrollFunc(scroller, direction),
			prop = "_scroll" + direction.p2, // add a tweenable property to the scroller that's a getter/setter function, like _scrollTop or _scrollLeft. This way, if someone does gsap.killTweensOf(scroller) it'll kill the scroll tween.
			lastScroll,
			getTween = (scrollTo, vars, initialValue, change1, change2) => {
				let tween = getTween.tween,
					onComplete = vars.onComplete,
					modifiers = {};
				tween && tween.kill();
				lastScroll = getScroll();
				vars[prop] = scrollTo;
				vars.modifiers = modifiers;
				modifiers[prop] = value => {
					if (Math.abs(getScroll() - lastScroll) > 7) { // if the user scrolls, kill the tween. Need a margin of error because some browsers like iOS Safari misreport the scroll position!
						tween.kill();
						getTween.tween = 0;
						value = getScroll();
					} else if (change1) {
						value = initialValue + change1 * tween.ratio + change2 * tween.ratio * tween.ratio;
					}
					return (lastScroll = Math.round(value));
				};
				vars.onComplete = () => {
					getTween.tween = 0;
					onComplete && onComplete.call(tween);
				};
				tween = getTween.tween = gsap.to(scroller, vars);
				return tween;
			};
		scroller[prop] = getScroll;
		return getTween;
	};

_horizontal.op = _vertical;



export class ScrollTrigger {

	constructor(vars, animation) {
		_coreInitted || ScrollTrigger.register(gsap) || console.warn("Please gsap.registerPlugin(ScrollTrigger)");
		this.init(vars, animation);
	}

	init(vars, animation) {
		this.progress = 0;
		this.vars && this.kill(1); // in case it's being initted again
		if (!_enabled) {
			this.update = this.refresh = this.kill = _passThrough;
			return;
		}
		vars = _setDefaults((_isString(vars) || _isNumber(vars) || vars.nodeType) ? {trigger: vars} : vars, _defaults);
		let direction = vars.horizontal ? _horizontal : _vertical,
			{onUpdate, toggleClass, id, onToggle, onRefresh, scrub, trigger, pin, pinSpacing, invalidateOnRefresh, anticipatePin, onScrubComplete, onSnapComplete, once, snap, pinReparent} = vars,
			isToggle = !scrub && scrub !== 0,
			scroller = _toArray(vars.scroller || _win)[0],
			scrollerCache = gsap.core.getCache(scroller),
			isViewport = _isViewport(scroller),
			useFixedPosition = isViewport || _getProxyProp(scroller, "pinType") === "fixed",
			callbacks = [vars.onEnter, vars.onLeave, vars.onEnterBack, vars.onLeaveBack],
			toggleActions = isToggle && (once ? "play" : vars.toggleActions).split(" "),
			markers = "markers" in vars ? vars.markers : _defaults.markers,
			borderWidth = isViewport ? 0 : parseFloat(_getComputedStyle(scroller)["border" + direction.p2 + _Width]) || 0,
			self = this,
			onRefreshInit = vars.onRefreshInit && (() => vars.onRefreshInit(self)),
			getScrollerSize = _getSizeFunc(scroller, isViewport, direction),
			getScrollerOffsets = _getOffsetsFunc(scroller, isViewport),
			tweenTo, pinCache, snapFunc, isReverted, scroll1, scroll2, start, end, markerStart, markerEnd, markerStartTrigger, markerEndTrigger, markerVars,
			change, pinOriginalState, pinActiveState, pinState, spacer, offset, pinGetter, pinSetter, pinStart, pinChange, spacingStart, spacingActive, markerStartSetter,
			markerEndSetter, cs, snap1, snap2, scrubScrollTime, scrubTween, scrubSmooth, snapDurClamp, snapDelayedCall, enabled, prevProgress, prevScroll, prevAnimProgress;

		self.media = _creatingMedia;
		anticipatePin *= 45;
		_triggers.push(self);
		self.scroller = scroller;
		self.scroll = _getScrollFunc(scroller, direction);
		scroll1 = self.scroll();
		self.vars = vars;
		animation = animation || vars.animation;
		scrollerCache.tweenScroll = scrollerCache.tweenScroll || {
			top: _getTweenCreator(scroller, _vertical),
			left: _getTweenCreator(scroller, _horizontal)
		};
		self.tweenTo = tweenTo = scrollerCache.tweenScroll[direction.p];
		if (animation) {
			animation.vars.lazy = false;
			animation._initted || (animation.vars.immediateRender !== false && vars.immediateRender !== false && animation.render(0, true, true));
			self.animation = animation.pause();
			animation.scrollTrigger = self;
			scrubSmooth = _isNumber(scrub) && scrub;
			scrubSmooth && (scrubTween = gsap.to(animation, {ease: "power3", duration: scrubSmooth, onComplete: () => onScrubComplete && onScrubComplete(self)}));
			snap1 = 0;
			id || (id = animation.vars.id);
		}
		if (snap) {
			_isObject(snap) || (snap = {snapTo: snap});
			gsap.set(isViewport ? [_body, _docEl] : scroller, {scrollBehavior: "auto"}); // smooth scrolling doesn't work with snap.
			snapFunc = _isFunction(snap.snapTo) ? snap.snapTo : snap.snapTo === "labels" ? _getLabels(animation) : gsap.utils.snap(snap.snapTo);
			snapDurClamp = snap.duration || {min: 0.1, max: 2};
			snapDurClamp = _isObject(snapDurClamp) ? _clamp(snapDurClamp.min, snapDurClamp.max) : _clamp(snapDurClamp, snapDurClamp);
			snapDelayedCall = gsap.delayedCall(snap.delay || (scrubSmooth / 2) || 0.1, () => {
				if (!_lastScrollTime || (_lastScrollTime === scrubScrollTime && !_pointerIsDown)) {
					let totalProgress = animation && !isToggle ? animation.totalProgress() : self.progress,
						velocity = ((totalProgress - snap2) / (_getTime() - _time2) * 1000) || 0,
						change1 = _abs(velocity / 2) * velocity / 0.185,
						naturalEnd = totalProgress + change1,
						endValue = _clamp(0, 1, snapFunc(naturalEnd, self)),
						change2 = endValue - totalProgress - change1,
						scroll = self.scroll(),
						endScroll = Math.round(start + endValue * change),
						tween = tweenTo.tween;
					if (scroll <= end && scroll >= start) {
						if (tween && !tween._initted) { // there's an overlapping snap! So we must figure out which one is closer and let that tween live.
							if (tween.data <= Math.abs(endScroll - scroll)) {
								return;
							}
							tween.kill();
						}
						tweenTo(endScroll, {
							duration: snapDurClamp(_abs( (Math.max(_abs(naturalEnd - totalProgress), _abs(endValue - totalProgress)) * 0.185 / velocity / 0.05) || 0)),
							ease: snap.ease || "power3",
							data: Math.abs(endScroll - scroll), // record the distance so that if another snap tween occurs (conflict) we can prioritize the closest snap.
							onComplete: () => {
								snap1 = snap2 = animation && !isToggle ? animation.totalProgress() : self.progress;
								onSnapComplete && onSnapComplete(self);
							}
						}, start + totalProgress * change, change1 * change, change2 * change);
					}
				} else {
					snapDelayedCall.restart(true);
				}
			}).pause();
		}
		id && (_ids[id] = self);
		trigger = self.trigger = _toArray(trigger || pin)[0];
		pin = pin === true ? trigger : _toArray(pin)[0];
		_isString(toggleClass) && (toggleClass = {targets: trigger, className: toggleClass});
		if (pin) {
			(pinSpacing === false || pinSpacing === _margin) || (pinSpacing = _getComputedStyle(pin.parentNode).display === "flex" ? false : _padding); // if the parent is display: flex, don't apply pinSpacing by default.
			self.pin = pin;
			vars.force3D !== false && gsap.set(pin, {force3D: true});
			pinCache = gsap.core.getCache(pin);
			if (!pinCache.spacer) { // record the spacer and pinOriginalState on the cache in case someone tries pinning the same element with MULTIPLE ScrollTriggers - we don't want to have multiple spacers or record the "original" pin state after it has already been affected by another ScrollTrigger.
				pinCache.spacer = spacer = _doc.createElement("div");
				spacer.setAttribute("class", "pin-spacer" + (id ? " pin-spacer-" + id : ""));
				pinCache.pinState = pinOriginalState = _getState(pin);
			} else {
				pinOriginalState = pinCache.pinState;
			}
			self.spacer = spacer = pinCache.spacer;
			cs = _getComputedStyle(pin);
			spacingStart = cs[pinSpacing + direction.os2];
			pinGetter = gsap.getProperty(pin);
			pinSetter = gsap.quickSetter(pin, direction.a, _px);
			_swapPinIn(pin, spacer, cs);
			pinState = _getState(pin);
		}
		if (markers) {
			markerVars = _isObject(markers) ? _setDefaults(markers, _markerDefaults) : _markerDefaults;
			markerStartTrigger = _createMarker("scroller-start", id, scroller, direction, markerVars, 0);
			markerEndTrigger = _createMarker("scroller-end", id, scroller, direction, markerVars, 0, markerStartTrigger);
			offset = markerStartTrigger["offset" + direction.op.d2];
			markerStart = _createMarker("start", id, scroller, direction, markerVars, offset);
			markerEnd =_createMarker("end", id, scroller, direction, markerVars, offset);
			if (!useFixedPosition) {
				_makePositionable(scroller);
				gsap.set([markerStartTrigger, markerEndTrigger], {force3D: true});
				markerStartSetter = gsap.quickSetter(markerStartTrigger, direction.a, _px);
				markerEndSetter = gsap.quickSetter(markerEndTrigger, direction.a, _px);
			}
		}

		self.revert = revert => {
			let r = revert !== false,
				prevRefreshing = _refreshing;
			if (r !== isReverted) {
				if (r) {
					prevScroll = Math.max(self.scroll(), self.scroll.rec || 0); // record the scroll so we can revert later (repositioning/pinning things can affect scroll position). In the static refresh() method, we first record all the scroll positions as a reference.
					prevProgress = self.progress;
					prevAnimProgress = animation && animation.progress();
					markerStart && [markerStart, markerEnd, markerStartTrigger, markerEndTrigger].forEach(m => m.style.display = "none");
				}

				_refreshing = 1;
				self.update(r); // make sure the pin is back in its original position so that all the measurements are correct.
				_refreshing = prevRefreshing;
				pin && r && _swapPinOut(pin, spacer, pinOriginalState);
				isReverted = r;
			}
		}


		self.refresh = soft => {
			if (_refreshing || !enabled) {
				return;
			}
			if (pin && soft && _lastScrollTime) {
				_addListener(ScrollTrigger, "scrollEnd", _softRefresh);
				return;
			}

			_refreshing = 1;
			scrubTween && scrubTween.kill();
			invalidateOnRefresh && animation && animation.progress(0).invalidate();
			isReverted || self.revert();
			let size = getScrollerSize(),
				scrollerBounds = getScrollerOffsets(),
				max = _maxScroll(scroller, direction),
				offset = 0,
				otherPinOffset = 0,
				parsedEnd = vars.end,
				parsedEndTrigger = vars.endTrigger || trigger,
				parsedStart = vars.start || (pin || !trigger ? "0 0" : "0 100%"),
				pinIndex = pin && Math.max(0, _triggers.indexOf(self)) || 0,
				cs, bounds, scroll, isVertical, override, i, curTrigger;
			if (pinIndex) { // user might try to pin the same element more than once, so we must find any prior triggers with the same pin, revert them, and determine how long they're pinning so that we can offset things appropriately. Make sure we revert from last to first so that things "rewind" properly.
				i = pinIndex;
				while (i--) {
					_triggers[i].pin === pin && _triggers[i].revert();
				}
			}
			start = _parsePosition(parsedStart, trigger, size, direction, self.scroll(), markerStart, markerStartTrigger, self, scrollerBounds, borderWidth, useFixedPosition, max) || (pin ? -0.001 : 0);
			_isFunction(parsedEnd) && (parsedEnd = parsedEnd(self));
			if (_isString(parsedEnd) && !parsedEnd.indexOf("+=")) {
				if (~parsedEnd.indexOf(" ")) {
					parsedEnd = (_isString(parsedStart) ? parsedStart.split(" ")[0] : "") + parsedEnd;
				} else {
					offset = _offsetToPx(parsedEnd.substr(2), size);
					parsedEnd = _isString(parsedStart) ? parsedStart : start + offset; // _parsePosition won't factor in the offset if the start is a number, so do it here.
					parsedEndTrigger = trigger;
				}
			}
			end = Math.max(start, _parsePosition(parsedEnd || (parsedEndTrigger ? "100% 0" : max), parsedEndTrigger, size, direction, self.scroll() + offset, markerEnd, markerEndTrigger, self, scrollerBounds, borderWidth, useFixedPosition, max)) || -0.001;
			change = (end - start) || ((start -= 0.01) && 0.001);
			if (pin) {
				i = pinIndex;
				while (i--) {
					curTrigger = _triggers[i];
					if (curTrigger.pin === pin && curTrigger.start - curTrigger._pinPush < start) {
						otherPinOffset += curTrigger.end - curTrigger.start;
					}
				}
				start += otherPinOffset;
				end += otherPinOffset;
				self._pinPush = otherPinOffset;
				if (markerStart && otherPinOffset) { // offset the markers if necessary
					cs = {};
					cs[direction.a] = "+=" + otherPinOffset;
					gsap.set([markerStart, markerEnd], cs);
				}
				cs = _getComputedStyle(pin);
				isVertical = (direction === _vertical);
				scroll = self.scroll(); // recalculate because the triggers can affect the scroll
				pinStart = parseFloat(pinGetter(direction.a)) + otherPinOffset;
				_swapPinIn(pin, spacer, cs);
				pinState = _getState(pin);
				// transforms will interfere with the top/left/right/bottom placement, so remove them temporarily. getBoundingClientRect() factors in transforms.
				bounds = _getBounds(pin, true);
				if (pinSpacing) {
					spacer.style[pinSpacing + direction.os2] = change + otherPinOffset + _px;
					spacingActive = (pinSpacing === _padding) ? _getSize(pin, direction) + change + otherPinOffset : 0;
					spacingActive && (spacer.style[direction.d] = spacingActive + _px); // for box-sizing: border-box (must include padding).
					useFixedPosition && self.scroll(prevScroll);
				}
				if (useFixedPosition) {
					override = {
						top: (bounds.top + (isVertical ? scroll - start : 0)) + _px,
						left: (bounds.left + (isVertical ? 0 : scroll - start)) + _px,
						boxSizing: "border-box",
						position: "fixed"
					};
					override[_width] = override["max" + _Width] = Math.ceil(bounds.width) + _px;
					override[_height] = override["max" + _Height] = Math.ceil(bounds.height) + _px;
					override[_margin] = override[_margin + _Top] = override[_margin + _Right] = override[_margin + _Bottom] = override[_margin + _Left] = "0";
					override[_padding] = cs[_padding];
					override[_padding + _Top] = cs[_padding + _Top];
					override[_padding + _Right] = cs[_padding + _Right];
					override[_padding + _Bottom] = cs[_padding + _Bottom];
					override[_padding + _Left] = cs[_padding + _Left];
					pinActiveState = _copyState(pinOriginalState, override, pinReparent);
				}
				if (animation) { // the animation might be affecting the transform, so we must jump to the end, check the value, and compensate accordingly. Otherwise, when it becomes unpinned, the pinSetter() will get set to a value that doesn't include whatever the animation did.
					animation.progress(1, true);
					pinChange = pinGetter(direction.a) - pinStart + change + otherPinOffset;
					change !== pinChange && pinActiveState.splice(pinActiveState.length - 2, 2); // transform is the last property/value set in the state Array. Since the animation is controlling that, we should omit it.
					animation.progress(0, true);
				} else {
					pinChange = change
				}
				if (pinIndex) { // make sure we revert from first to last to make sure things reach their end state properly
					for (i = 0; i < pinIndex; i++) {
						_triggers[i].pin === pin && _triggers[i].revert(false);
					}
				}
			} else if (trigger && self.scroll()) { // it may be INSIDE a pinned element, so walk up the tree and look for any elements with _pinOffset to compensate because anything with pinSpacing that's already scrolled would throw off the measurements in getBoundingClientRect()
				bounds = trigger.parentNode;
				while (bounds && bounds !== _body) {
					if (bounds._pinOffset) {
						start -= bounds._pinOffset;
						end -= bounds._pinOffset;
					}
					bounds = bounds.parentNode;
				}
			}
			self.start = start;
			self.end = end;
			scroll1 = scroll2 = self.scroll(); // reset velocity
			scroll1 < prevScroll && self.scroll(prevScroll);
			self.revert(false);
			_refreshing = 0;
			prevAnimProgress && isToggle && animation.progress(prevAnimProgress, true);
			if (prevProgress !== self.progress) { // ensures that the direction is set properly (when refreshing, progress is set back to 0 initially, then back again to wherever it needs to be) and that callbacks are triggered.
				scrubTween && animation.totalProgress(prevProgress, true); // to avoid issues where animation callbacks like onStart aren't triggered.
				self.progress = prevProgress;
				self.update();
			}
			pin && pinSpacing && (spacer._pinOffset = Math.round(self.progress * pinChange));
			onRefresh && onRefresh(self);
		};

		self.getVelocity = () => ((self.scroll() - scroll2) / (_getTime() - _time2) * 1000) || 0;

		self.update = (reset, recordVelocity) => {
			let scroll = self.scroll(),
				p = reset ? 0 : (scroll - start) / change,
				clipped = p < 0 ? 0 : p > 1 ? 1 : p || 0,
				prevProgress = self.progress,
				isActive, wasActive, toggleState, action, stateChanged, toggled;
			if (recordVelocity) {
				scroll2 = scroll1;
				scroll1 = scroll;
				if (snap) {
					snap2 = snap1;
					snap1 = animation && !isToggle ? animation.totalProgress() : clipped;
				}
			}
			// anticipate the pinning a few ticks ahead of time based on velocity to avoid a visual glitch due to the fact that most browsers do scrolling on a separate thread (not synced with requestAnimationFrame).
			(anticipatePin && !clipped && pin && !_refreshing && !_startup && _lastScrollTime && start < scroll + ((scroll - scroll2) / (_getTime() - _time2)) * anticipatePin) && (clipped = 0.0001);
			if (clipped !== prevProgress && enabled) {
				isActive = self.isActive = !!clipped && clipped < 1;
				wasActive = !!prevProgress && prevProgress < 1;
				toggled = isActive !== wasActive;
				stateChanged = toggled || !!clipped !== !!prevProgress; // could go from start all the way to end, thus it didn't toggle but it did change state in a sense (may need to fire a callback)
				self.direction = clipped > prevProgress ? 1 : -1;
				self.progress = clipped;
				if (!isToggle) {
					if (scrubTween && !_refreshing && !_startup) {
						scrubTween.vars.totalProgress = clipped;
						scrubTween.invalidate().restart();
					} else if (animation) {
						animation.totalProgress(clipped, !!_refreshing);
					}
				}
				if (pin) {
					reset && pinSpacing && (spacer.style[pinSpacing + direction.os2] = spacingStart);
					if (!useFixedPosition) {
						pinSetter(pinStart + pinChange * clipped);
					} else if (stateChanged) {
						action = !reset && clipped > prevProgress && end + 1 > scroll && scroll + 1 >= _maxScroll(scroller, direction); // if it's at the VERY end of the page, don't switch away from position: fixed because it's pointless and it could cause a brief flash when the user scrolls back up (when it gets pinned again)
						if (pinReparent) {
							if (!_refreshing && (isActive || action)) {
								let bounds = _getBounds(pin, true),
									offset = scroll - start;
								pin.style.top = (bounds.top + (direction === _vertical ? offset : 0)) + _px;
								pin.style.left = (bounds.left + (direction === _vertical ? 0 : offset)) + _px;
							}
							_reparent(pin, !_refreshing && (isActive || action) ? _body : spacer);
						}
						_setState(isActive || action ? pinActiveState : pinState);
						(pinChange !== change && clipped < 1 && isActive) || pinSetter(pinStart + (clipped === 1 && !action ? pinChange : 0));
					}
				}
				if (snap && !tweenTo.tween && !_refreshing && !_startup) {
					scrubScrollTime = _lastScrollTime;
					snapDelayedCall.restart(true);
				}
				toggleClass && toggled && (!once || isActive) && _toArray(toggleClass.targets).forEach(el => el.classList[isActive ? "add" : "remove"](toggleClass.className)); // classes could affect positioning, so do it even if reset or refreshing is true.
				onUpdate && !isToggle && !reset && onUpdate(self);
				if (stateChanged && !_refreshing) {
					toggleState = clipped && !prevProgress ? 0 : clipped === 1 ? 1 : prevProgress === 1 ? 2 : 3; // 0 = enter, 1 = leave, 2 = enterBack, 3 = leaveBack (we prioritize the FIRST encounter, thus if you scroll really fast past the onEnter and onLeave in one tick, it'd prioritize onEnter.
					if (isToggle) {
						action = (!toggled && toggleActions[toggleState + 1] !== "none" && toggleActions[toggleState + 1]) || toggleActions[toggleState]; // if it didn't toggle, that means it shot right past and since we prioritize the "enter" action, we should switch to the "leave" in this case (but only if one is defined)
						if (animation && (action === "complete" || action === "reset" || action in animation)) {
							if (action === "complete") {
								animation.pause().totalProgress(1);
							} else if (action === "reset") {
								animation.restart(true).pause();
							} else {
								animation[action]();
							}
						}
						onUpdate && onUpdate(self);
					}
					if (toggled || !_limitCallbacks) { // on startup, the page could be scrolled and we don't want to fire callbacks that didn't toggle. For example onEnter shouldn't fire if the ScrollTrigger isn't actually entered.
						onToggle && toggled && onToggle(self);
						callbacks[toggleState] && callbacks[toggleState](self);
						once && (clipped === 1 ? self.kill() : (callbacks[toggleState] = 0)); // a callback shouldn't be called again if once is true.
						if (!toggled) { // it's possible to go completely past, like from before the start to after the end (or vice-versa) in which case BOTH callbacks should be fired in that order
							toggleState = clipped === 1 ? 1 : 3;
							callbacks[toggleState] && callbacks[toggleState](self);
						}
					}
				} else if (isToggle && onUpdate && !_refreshing) {
					onUpdate(self);
				}
			}
			// update absolutely-positioned markers (only if the scroller isn't the viewport)
			if (markerEndSetter) {
				markerStartSetter(scroll + (markerStartTrigger._isFlipped ? 1 : 0));
				markerEndSetter(scroll);
			}
		};

		self.enable = () => {
			if (!enabled) {
				enabled = true;
				_addListener(scroller, "resize", _onResize);
				_addListener(scroller, "scroll", _onScroll);
				onRefreshInit && _addListener(ScrollTrigger, "refreshInit", onRefreshInit);
				!animation || !animation.add ? self.refresh() : gsap.delayedCall(0.01, self.refresh) && (change = 0.01) && (start = end = 0); // if the animation is a timeline, it may not have been populated yet, so it wouldn't render at the proper place on the first refresh(), thus we should schedule one for the next tick.
			}
		};

		self.disable = reset => {
			if (enabled) {
				reset !== false && self.revert();
				enabled = self.isActive = false;
				scrubTween && scrubTween.pause();
				pin && _swapPinOut(pin, spacer, pinOriginalState);
				pinCache && (pinCache.uncache = 1);
				onRefreshInit && _removeListener(ScrollTrigger, "refreshInit", onRefreshInit);
				if (snapDelayedCall) {
					snapDelayedCall.pause();
					tweenTo.tween && tweenTo.tween.kill();
				}
				if (!isViewport) {
					let i = _triggers.length;
					while (i--) {
						if (_triggers[i].scroller === scroller && _triggers[i] !== self) {
							return; //don't remove the listeners if there are still other triggers referencing it.
						}
					}
					_removeListener(scroller, "resize", _onResize);
					_removeListener(scroller, "scroll", _onScroll);
				}
			}
		};

		self.kill = revert => {
			self.disable(revert);
			id && (delete _ids[id]);
			let i = _triggers.indexOf(self);
			_triggers.splice(i, 1);
			i === _i && _i--; // if we're in the middle of a refresh() or update(), splicing would cause skips in the index, so adjust...
			if (animation) {
				animation.scrollTrigger = null;
				revert && animation.render(-1);
				animation.kill();
			}
			markerStart && [markerStart, markerEnd, markerStartTrigger, markerEndTrigger].forEach(m => m.parentNode.removeChild(m));
			pinCache && (pinCache.uncache = 1);
		};

		self.enable();
	}


	static register(core) {
		if (!_coreInitted) {
			gsap = core || _getGSAP();
			if (_windowExists() && window.document) {
				_win = window;
				_doc = document;
				_docEl = _doc.documentElement;
				_body = _doc.body;
			}
			if (gsap) {
				_toArray = gsap.utils.toArray;
				_clamp = gsap.utils.clamp;
				gsap.core.globals("ScrollTrigger", ScrollTrigger); // must register the global manually because in Internet Explorer, functions (classes) don't have a "name" property.
				if (_body) {
					_raf = _win.requestAnimationFrame || (f => setTimeout(f, 16));
					_addListener(_win, "mousewheel", _onScroll);
					_root = [_win, _doc, _docEl, _body];
					_addListener(_doc, "scroll", _onScroll); // some browsers (like Chrome), the window stops dispatching scroll events on the window if you scroll really fast, but it's consistent on the document!
					let bodyStyle = _body.style,
						border = bodyStyle.borderTop,
						bounds;
					bodyStyle.borderTop = "1px solid #000"; // works around an issue where a margin of a child element could throw off the bounds of the _body, making it seem like there's a margin when there actually isn't. The border ensures that the bounds are accurate.
					bounds = _getBounds(_body);
					_vertical.m = Math.round(bounds.top + _vertical.sc()) || 0; // accommodate the offset of the <body> caused by margins and/or padding
					_horizontal.m = Math.round(bounds.left + _horizontal.sc()) || 0;
					border ? (bodyStyle.borderTop = border) : bodyStyle.removeProperty("border-top");
					_syncInterval = setInterval(_sync, 200);
					gsap.delayedCall(0.5, () => _startup = 0);
					_addListener(_doc, "touchcancel", _passThrough); // some older Android devices intermittently stop dispatching "touchmove" events if we don't listen for "touchcancel" on the document.
					_addListener(_body, "touchstart", _passThrough); //works around Safari bug: https://greensock.com/forums/topic/21450-draggable-in-iframe-on-mobile-is-buggy/
					_multiListener(_addListener, _doc, "pointerdown,touchstart,mousedown", () => _pointerIsDown = 1);
					_multiListener(_addListener, _doc, "pointerup,touchend,mouseup", () => _pointerIsDown = 0);
					_transformProp = gsap.utils.checkPrefix("transform");
					_stateProps.push(_transformProp);
					_coreInitted = _getTime();
					_resizeDelay = gsap.delayedCall(0.2, _refreshAll).pause();
					_autoRefresh = [_doc, "visibilitychange", () => {
						let w = _win.innerWidth,
							h = _win.innerHeight;
						if (_doc.hidden) {
							_prevWidth = w;
							_prevHeight = h;
						} else if (_prevWidth !== w || _prevHeight !== h) {
							_onResize();
						}
					}, _doc, "DOMContentLoaded", _refreshAll, _win, "load", () => _lastScrollTime || _refreshAll(), _win, "resize", _onResize];
					_iterateAutoRefresh(_addListener);

				}
			}
		}
		return _coreInitted;
	}

	static defaults(config) {
		for (let p in config) {
			_defaults[p] = config[p];
		}
	}

	static kill() {
		_enabled = 0;
		_triggers.slice(0).forEach(trigger => trigger.kill(1));
	}

	static config(vars) {
		("limitCallbacks" in vars) && (_limitCallbacks = !!vars.limitCallbacks);
		let ms = vars.syncInterval;
		ms && clearInterval(_syncInterval) || ((_syncInterval = ms) && setInterval(_sync, ms));
		("autoRefreshEvents" in vars) && (_iterateAutoRefresh(_removeListener) || _iterateAutoRefresh(_addListener, vars.autoRefreshEvents || "none"));
	}

	static scrollerProxy(target, vars) {
		let t = _toArray(target)[0];
		_isViewport(t) ? _proxies.unshift(_win, vars, _body, vars, _docEl, vars) : _proxies.unshift(t, vars);
	}

	static matchMedia(vars) {
		let mq, p;
		for (p in vars) {
			if (p === "all") {
				_creatingMedia = p;
				vars[p]();
				_creatingMedia = 0;
			} else {
				mq = _win.matchMedia(p);
				if (mq) {
					_media.push(p, vars[p]);
					mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
				}
			}
		}
		_onMediaChange();
		return _media;
	}

}

ScrollTrigger.version = "3.4.0";
ScrollTrigger.saveStyles = targets => targets ? _toArray(targets).forEach(target => {
	let i = _savedStyles.indexOf(target);
	i >= 0 && _savedStyles.splice(i, 4);
	_savedStyles.push(target, target.style.cssText, gsap.core.getCache(target), _creatingMedia);
}) : _savedStyles;
ScrollTrigger.revert = (soft, media) => _revertAll(!soft, media);
ScrollTrigger.create = (vars, animation) => new ScrollTrigger(vars, animation);
ScrollTrigger.refresh = safe => safe ? _onResize() : _refreshAll(true);
ScrollTrigger.update = _updateAll;
ScrollTrigger.maxScroll = (element, horizontal) => _maxScroll(element, horizontal ? _horizontal : _vertical);
ScrollTrigger.getScrollFunc = (element, horizontal) => _getScrollFunc(_toArray(element)[0], horizontal ? _horizontal : _vertical);
ScrollTrigger.getById = id => _ids[id];
ScrollTrigger.getAll = () => _triggers.slice(0);
ScrollTrigger.isScrolling = () => !!_lastScrollTime;
ScrollTrigger.addEventListener = (type, callback) => {
	let a = _listeners[type] || (_listeners[type] = []);
	~a.indexOf(callback) || a.push(callback);
};
ScrollTrigger.removeEventListener = (type, callback) => {
	let a = _listeners[type],
		i = a && a.indexOf(callback);
	i >= 0 && a.splice(i, 1);
};
ScrollTrigger.batch = (targets, vars) => {
	let result = [],
		varsCopy = {},
		interval = vars.interval || 0.016,
		batchMax = vars.batchMax || 1e9,
		proxyCallback = (type, callback) => {
			let elements = [],
				triggers = [],
				delay = gsap.delayedCall(interval, () => {callback(elements, triggers); elements = []; triggers = [];}).pause();
			return self => {
				elements.length || delay.restart(true);
				elements.push(self.trigger);
				triggers.push(self);
				batchMax <= elements.length && delay.progress(1);
			};
		},
		p;
	for (p in vars) {
		varsCopy[p] = (p.substr(0, 2) === "on" && _isFunction(vars[p]) && p !== "onRefreshInit") ? proxyCallback(p, vars[p]) : vars[p];
	}
	if (_isFunction(batchMax)) {
		batchMax = batchMax();
		_addListener(ScrollTrigger, "refresh", () => batchMax = vars.batchMax());
	}
	_toArray(targets).forEach(target => {
		let config = {};
		for (p in varsCopy) {
			config[p] = varsCopy[p];
		}
		config.trigger = target;
		result.push(ScrollTrigger.create(config));
	});
	return result;
}

_getGSAP() && gsap.registerPlugin(ScrollTrigger);

export { ScrollTrigger as default };