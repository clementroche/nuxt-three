/*!
 * MotionPathHelper 3.4.0
 * https://greensock.com
 *
 * @license Copyright 2008-2020, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */
/* eslint-disable */

import PathEditor from "./utils/PathEditor.js";

let gsap, _win, _doc, _docEl, _body, MotionPathPlugin,  _arrayToRawPath, _rawPathToString,
	_bonusValidated = 1, //<name>MotionPathHelper</name>
	_selectorExp = /(^[#\.][a-z]|[a-y][a-z])/i,
	_isString = value => typeof(value) === "string",
	_createElement = (type, ns) => {
		let e = _doc.createElementNS ? _doc.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc.createElement(type); //some servers swap in https for http in the namespace which can break things, making "style" inaccessible.
		return e.style ? e : _doc.createElement(type); //some environments won't allow access to the element's style when created with a namespace in which case we default to the standard createElement() to work around the issue. Also note that when GSAP is embedded directly inside an SVG file, createElement() won't allow access to the style object in Firefox (see https://greensock.com/forums/topic/20215-problem-using-tweenmax-in-standalone-self-containing-svg-file-err-cannot-set-property-csstext-of-undefined/).
	},
	_getPositionOnPage = target => {
		let bounds = target.getBoundingClientRect(),
			windowOffsetY = _docEl.clientTop - (_win.pageYOffset || _docEl.scrollTop || _body.scrollTop || 0),
			windowOffsetX = _docEl.clientLeft - (_win.pageXOffset || _docEl.scrollLeft || _body.scrollLeft || 0);
		return {left:bounds.left + windowOffsetX, top:bounds.top + windowOffsetY, right: bounds.right + windowOffsetX, bottom: bounds.bottom + windowOffsetY};
	},
	_getInitialPath = (x, y) => {
		let coordinates = [0,31,8,58,24,75,40,90,69,100,100,100],
			i;
		for (i = 0; i < coordinates.length; i+=2) {
			coordinates[i] += x;
			coordinates[i+1] += y;
		}
		return "M" + x + "," + y + "C" + coordinates.join(",");
	},
	_getGlobalTime = animation => {
		let time = animation.totalTime();
		while (animation) {
			time = animation.startTime() + time / (animation.timeScale() || 1);
			animation = animation.parent;
		}
		return time;
	},
	_copyElement,
	_initCopyToClipboard = () => {
		_copyElement = _createElement("textarea");
		_copyElement.style.display = "none";
		_body.appendChild(_copyElement);
	},
	_parsePath = (path, target, vars) => (_isString(path) && _selectorExp.test(path)) ? _doc.querySelector(path) : Array.isArray(path) ? _rawPathToString(_arrayToRawPath([{x:gsap.getProperty(target, "x"), y:gsap.getProperty(target, "y")}, ...path], vars)) : (_isString(path) || path && (path.tagName + "").toLowerCase() === "path") ? path : 0,
	_addCopyToClipboard = (target, getter, onComplete) => {
		target.addEventListener('click', e => {
			if (e.target._gsHelper) {
				let c = getter(e.target);
				_copyElement.value = c;
				if (c && _copyElement.select) {
					console.log(c);
					_copyElement.style.display = "block";
					_copyElement.select();
					try {
						_doc.execCommand('copy');
						_copyElement.blur();
						onComplete && onComplete(target);
					} catch (err) {
						console.warn("Copy didn't work; this browser doesn't permit that.");
					}
					_copyElement.style.display = "none";
				}
			}
		});
	},
	_identityMatrixObject = {matrix:{a:1, b:0, c:0, d:1, e:0, f:0}},
	_getConsolidatedMatrix = target => (target.transform.baseVal.consolidate() || _identityMatrixObject).matrix,
	_findMotionPathTween = target => {
		let tweens = gsap.getTweensOf(target),
			i = 0;
		for (; i < tweens.length; i++) {
			if (tweens[i].vars.motionPath) {
				return tweens[i];
			} else if (tweens[i].timeline) {
				tweens.push(...tweens[i].timeline.getChildren());
			}
		}
	},
	_initCore = (core, required) => {
		let message = "Please gsap.registerPlugin(MotionPathPlugin)";
		_win = window;
		gsap = gsap || core || _win.gsap || console.warn(message);
		_doc = document;
		_body = _doc.body;
		_docEl = _doc.documentElement;
		MotionPathPlugin = gsap && gsap.plugins.motionPath;
		if (!MotionPathPlugin) {
			(required === true) && console.warn(message);
		} else {
			_initCopyToClipboard();
			_arrayToRawPath = MotionPathPlugin.arrayToRawPath;
			_rawPathToString = MotionPathPlugin.rawPathToString;
		}
	};

export class MotionPathHelper {

	constructor(targetOrTween, vars = {}) {
		if (!MotionPathPlugin) {
			_initCore(vars.gsap, 1);
		}
		let copyButton = _createElement("div"),
			self = this,
			offset = {x:0, y:0},
			target, path, isSVG, startX, startY, position, svg, animation, svgNamespace, temp, matrix, refreshPath, animationToScrub;
		if (targetOrTween instanceof gsap.core.Tween) {
			animation = targetOrTween;
			target = animation.targets()[0];
		} else {
			target = gsap.utils.toArray(targetOrTween)[0];
			animation = _findMotionPathTween(target);
		}
		path = _parsePath(vars.path, target, vars);
		this.offset = offset;
		position = _getPositionOnPage(target);
		startX = parseFloat(gsap.getProperty(target, "x", "px"));
		startY = parseFloat(gsap.getProperty(target, "y", "px"));
		isSVG = (target.getCTM && target.tagName.toLowerCase() !== "svg");
		if (animation && !path) {
			path = _parsePath(animation.vars.motionPath.path || animation.vars.motionPath, target, animation.vars.motionPath);
		}
		copyButton.setAttribute("class", "copy-motion-path");
		copyButton.style.cssText = "border-radius:8px; background-color:rgba(85, 85, 85, 0.7); color:#fff; cursor:pointer; padding:6px 12px; font-family:Signika Negative, Arial, sans-serif; position:fixed; left:50%; transform:translate(-50%, 0); font-size:19px; bottom:10px";
		copyButton.innerText = "COPY MOTION PATH";
		copyButton._gsHelper = self;
		(gsap.utils.toArray(vars.container)[0] || _body).appendChild(copyButton);
		_addCopyToClipboard(copyButton, () => self.getString(), () => gsap.fromTo(copyButton, {backgroundColor:"white"}, {duration:0.5, backgroundColor:"rgba(85, 85, 85, 0.6)"}));
		svg = path && path.ownerSVGElement;
		if (!svg) {
			svgNamespace = (isSVG && target.ownerSVGElement && target.ownerSVGElement.getAttribute("xmlns")) || "http://www.w3.org/2000/svg";
			if (isSVG) {
				svg = target.ownerSVGElement;
				temp = target.getBBox();
				matrix = _getConsolidatedMatrix(target);
				startX = matrix.e;
				startY = matrix.f;
				offset.x = temp.x;
				offset.y = temp.y;
			} else {
				svg = _createElement("svg", svgNamespace);
				_body.appendChild(svg);
				svg.setAttribute("viewBox", "0 0 100 100");
				svg.style.cssText = "overflow:visible; background-color: transparent; position:absolute; width:100px; height:100px; top:" + position.top + "px; left:" + position.left + "px;";
			}
			temp = _isString(path) && !_selectorExp.test(path) ? path : _getInitialPath(startX, startY);
			path = _createElement("path", svgNamespace);
			path.setAttribute("d", temp);
			path.setAttribute("vector-effect", "non-scaling-stroke");
			path.style.cssText = "fill:transparent; stroke-width:" + (vars.pathWidth || 3) + "; stroke:" + (vars.pathColor || "#555") + "; opacity:" + (vars.pathOpacity || 0.6);
			svg.appendChild(path);
			if (offset.x || offset.y) {
				gsap.set(path, {x:offset.x, y:offset.y});
			}
		}

		if (!("selected" in vars)) {
			vars.selected = true;
		}
		if (!("anchorSnap" in vars)) {
			vars.anchorSnap = p => {
				if (p.x * p.x + p.y * p.y < 16) {
					p.x = p.y = 0;
				}
			};
		}

		animationToScrub = animation && animation.parent.data === "nested" ? animation.parent.parent : animation;

		vars.onPress = () => {
			animationToScrub.pause(0);
		};

		refreshPath = () => {
			//let m = _getConsolidatedMatrix(path);
			//animation.vars.motionPath.offsetX = m.e - offset.x;
			//animation.vars.motionPath.offsetY = m.f - offset.y;
			animation.invalidate();
			animationToScrub.restart();
		};
		vars.onRelease = vars.onDeleteAnchor = refreshPath;

		this.editor = PathEditor.create(path, vars);
		if (vars.center) {
			gsap.set(target, {transformOrigin:"50% 50%", xPercent:-50, yPercent:-50});
		}
		if (animation) {
			if (animation.vars.motionPath.path) {
				animation.vars.motionPath.path = path;
			} else {
				animation.vars.motionPath = {path:path};
			}
			if (animationToScrub.parent !== gsap.globalTimeline) {
				gsap.globalTimeline.add(animationToScrub, _getGlobalTime(animationToScrub) - animationToScrub.delay());
			}
			animationToScrub.repeat(-1).repeatDelay(1);

		} else {
			animation = animationToScrub = gsap.to(target, {
				motionPath: {
					path: path,
					start: vars.start || 0,
					end: ("end" in vars) ? vars.end : 1,
					autoRotate: ("autoRotate" in vars) ? vars.autoRotate : false,
					align: path,
					alignOrigin: vars.alignOrigin
				},
				duration: vars.duration || 5,
				ease: vars.ease || "power1.inOut",
				repeat:-1,
				repeatDelay:1,
				paused:!vars.path
			});
		}
		this.animation = animation;
	}

	getString() {
		return this.editor.getString(true, -this.offset.x, -this.offset.y);
	}

}

MotionPathHelper.register = _initCore;
MotionPathHelper.create = (target, vars) => new MotionPathHelper(target, vars);
MotionPathHelper.editPath = (path, vars) => PathEditor.create(path, vars);
MotionPathHelper.version = "3.4.0";

export { MotionPathHelper as default };