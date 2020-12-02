/*!
 * DrawSVGPlugin 3.4.0
 * https://greensock.com
 *
 * @license Copyright 2008-2020, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */
/* eslint-disable */


let gsap, _toArray, _doc, _win, _isEdge, _coreInitted,
	_windowExists = () => typeof(window) !== "undefined",
	_getGSAP = () => gsap || (_windowExists() && (gsap = window.gsap) && gsap.registerPlugin && gsap),
	_numExp = /[-+=\.]*\d+[\.e\-\+]*\d*[e\-\+]*\d*/gi, //finds any numbers, including ones that start with += or -=, negative numbers, and ones in scientific notation like 1e-8.
	_types = {rect:["width","height"], circle:["r","r"], ellipse:["rx","ry"], line:["x2","y2"]},
	_round = value => Math.round(value * 10000) / 10000,
	_parseNum = value => parseFloat(value || 0),
	_getAttributeAsNumber = (target, attr) => _parseNum(target.getAttribute(attr)),
	_sqrt = Math.sqrt,
	_getDistance = (x1, y1, x2, y2, scaleX, scaleY) => _sqrt(((_parseNum(x2) - _parseNum(x1)) * scaleX) ** 2 + ((_parseNum(y2) - _parseNum(y1)) * scaleY) ** 2),
	_warn = message => console.warn(message),
	_hasNonScalingStroke = target => target.getAttribute("vector-effect") === "non-scaling-stroke",
	_bonusValidated = 1, //<name>DrawSVGPlugin</name>
	//accepts values like "100%" or "20% 80%" or "20 50" and parses it into an absolute start and end position on the line/stroke based on its length. Returns an an array with the start and end values, like [0, 243]
	_parse = (value, length, defaultStart) => {
		let i = value.indexOf(" "),
			s, e;
		if (i < 0) {
			s = defaultStart !== undefined ? defaultStart + "" : value;
			e = value;
		} else {
			s = value.substr(0, i);
			e = value.substr(i + 1);
		}
		s = ~s.indexOf("%") ? (_parseNum(s) / 100) * length : _parseNum(s);
		e = ~e.indexOf("%") ? (_parseNum(e) / 100) * length : _parseNum(e);
		return (s > e) ? [e, s] : [s, e];
	},
	_getLength = target => {
		target = _toArray(target)[0];
		if (!target) {
			return 0;
		}
		let type = target.tagName.toLowerCase(),
			style = target.style,
			scaleX = 1,
			scaleY = 1,
			length, bbox, points, prevPoint, i, rx, ry;
		if (_hasNonScalingStroke(target)) { //non-scaling-stroke basically scales the shape and then strokes it at the screen-level (after transforms), thus we need to adjust the length accordingly.
			scaleY = target.getScreenCTM();
			scaleX = _sqrt(scaleY.a * scaleY.a + scaleY.b * scaleY.b);
			scaleY = _sqrt(scaleY.d * scaleY.d + scaleY.c * scaleY.c);
		}
		try { //IE bug: calling <path>.getTotalLength() locks the repaint area of the stroke to whatever its current dimensions are on that frame/tick. To work around that, we must call getBBox() to force IE to recalculate things.
			bbox = target.getBBox(); //solely for fixing bug in IE - we don't actually use the bbox.
		} catch (e) {
			//firefox has a bug that throws an error if the element isn't visible.
			_warn("Some browsers won't measure invisible elements (like display:none or masks inside defs).");
		}
		let {x, y, width, height} = bbox || {x:0, y:0, width:0, height:0};
		if ((!bbox || (!width && !height)) && _types[type]) { //if the element isn't visible, try to discern width/height using its attributes.
			width =_getAttributeAsNumber(target, _types[type][0]);
			height = _getAttributeAsNumber(target, _types[type][1]);
			if (type !== "rect" && type !== "line") { //double the radius for circles and ellipses
				width *= 2;
				height *= 2;
			}
			if (type === "line") {
				x = _getAttributeAsNumber(target, "x1");
				y = _getAttributeAsNumber(target, "y1");
				width = Math.abs(width - x);
				height = Math.abs(height - y);
			}
		}
		if (type === "path") {
			prevPoint = style.strokeDasharray;
			style.strokeDasharray = "none";
			length = target.getTotalLength() || 0;
			if (scaleX !== scaleY) {
				_warn("Warning: <path> length cannot be measured when vector-effect is non-scaling-stroke and the element isn't proportionally scaled.");
			}
			length *= (scaleX + scaleY) / 2;
			style.strokeDasharray = prevPoint;
		} else if (type === "rect") {
			length = width * 2 * scaleX + height * 2 * scaleY;
		} else if (type === "line") {
			length = _getDistance(x, y, x + width, y + height, scaleX, scaleY);
		} else if (type === "polyline" || type === "polygon") {
			points = target.getAttribute("points").match(_numExp) || [];
			if (type === "polygon") {
				points.push(points[0], points[1]);
			}
			length = 0;
			for (i = 2; i < points.length; i+=2) {
				length += _getDistance(points[i-2], points[i-1], points[i], points[i+1], scaleX, scaleY) || 0;
			}
		} else if (type === "circle" || type === "ellipse") {
			rx = (width / 2) * scaleX;
			ry = (height / 2) * scaleY;
			length = Math.PI * ( 3 * (rx + ry) - _sqrt((3 * rx + ry) * (rx + 3 * ry)) );
		}
		return length || 0;
	},
	_getPosition = (target, length) => {
		target = _toArray(target)[0];
		if (!target) {
			return [0, 0];
		}
		if (!length) {
			length = _getLength(target) + 1;
		}
		let cs = _win.getComputedStyle(target),
			dash = cs.strokeDasharray || "",
			offset = _parseNum(cs.strokeDashoffset),
			i = dash.indexOf(",");
		if (i < 0) {
			i = dash.indexOf(" ");
		}
		dash = (i < 0) ? length : _parseNum(dash.substr(0, i)) || 1e-5;
		if (dash > length) {
			dash = length;
		}
		return [Math.max(0, -offset), Math.max(0, dash - offset)];
	},
	_initCore = () => {
		if (_windowExists()) {
			_doc = document;
			_win = window;
			_coreInitted = gsap = _getGSAP();
			_toArray = gsap.utils.toArray;
			_isEdge = (((_win.navigator || {}).userAgent || "").indexOf("Edge") !== -1); //Microsoft Edge has a bug that causes it not to redraw the path correctly if the stroke-linecap is anything other than "butt" (like "round") and it doesn't match the stroke-linejoin. A way to trigger it is to change the stroke-miterlimit, so we'll only do that if/when we have to (to maximize performance)
		}
	};


export const DrawSVGPlugin = {
	version:"3.4.0",
	name:"drawSVG",
	register(core) {
		gsap = core;
		_initCore();
	},
	init(target, value, tween, index, targets) {
		if (!target.getBBox) {
			return false;
		}
		if (!_coreInitted) {
			_initCore();
		}
		let length = _getLength(target) + 1,
			start, end, overage, cs;
		this._style = target.style;
		this._target = target;
		if (value + "" === "true") {
			value = "0 100%";
		} else if (!value) {
			value = "0 0";
		} else if ((value + "").indexOf(" ") === -1) {
			value = "0 " + value;
		}
		start = _getPosition(target, length);
		end = _parse(value, length, start[0]);
		this._length = _round(length + 10);
		if (start[0] === 0 && end[0] === 0) {
			overage = Math.max(0.00001, end[1] - length); //allow people to go past the end, like values of 105% because for some paths, Firefox doesn't return an accurate getTotalLength(), so it could end up coming up short.
			this._dash = _round(length + overage);
			this._offset = _round(length - start[1] + overage);
			this._offsetPT = this.add(this, "_offset", this._offset, _round(length - end[1] + overage));
		} else {
			this._dash = _round(start[1] - start[0]) || 0.000001; //some browsers render artifacts if dash is 0, so we use a very small number in that case.
			this._offset = _round(-start[0]);
			this._dashPT = this.add(this, "_dash", this._dash, _round(end[1] - end[0]) || 0.00001);
			this._offsetPT = this.add(this, "_offset", this._offset, _round(-end[0]));
		}
		if (_isEdge) { //to work around a bug in Microsoft Edge, animate the stroke-miterlimit by 0.0001 just to trigger the repaint (unnecessary if it's "round" and stroke-linejoin is also "round"). Imperceptible, relatively high-performance, and effective. Another option was to set the "d" <path> attribute to its current value on every tick, but that seems like it'd be much less performant.
			cs = _win.getComputedStyle(target);
			if (cs.strokeLinecap !== cs.strokeLinejoin) {
				end = _parseNum(cs.strokeMiterlimit);
				this.add(target.style, "strokeMiterlimit", end, end + 0.01);
			}
		}
		this._live = (_hasNonScalingStroke(target) || ~((value + "").indexOf("live")));
		this._props.push("drawSVG");
		return _bonusValidated;
	},
	render(ratio, data) {
		let pt = data._pt,
			style = data._style,
			length, lengthRatio, dash, offset;
		if (pt) {
			//when the element has vector-effect="non-scaling-stroke" and the SVG is resized (like on a window resize), it actually changes the length of the stroke! So we must sense that and make the proper adjustments.
			if (data._live) {
				length = _getLength(data._target) + 11;
				if (length !== data._length) {
					lengthRatio = length / data._length;
					data._length = length;
					data._offsetPT.s *= lengthRatio;
					data._offsetPT.c *= lengthRatio;
					if (data._dashPT) {
						data._dashPT.s *= lengthRatio;
						data._dashPT.c *= lengthRatio;
					} else {
						data._dash *= lengthRatio;
					}
				}
			}
			while (pt) {
				pt.r(ratio, pt.d);
				pt = pt._next;
			}
			dash = data._dash;
			offset = data._offset;
			length = data._length;
			style.strokeDashoffset = data._offset;
			if (ratio === 1 || !ratio) {
				if (dash - offset < 0.001 && length - dash <= 10) { //works around a bug in Safari that caused strokes with rounded ends to still show initially when they shouldn't.
					style.strokeDashoffset = offset + 1;
				}
				style.strokeDasharray = (offset < 0.001 && length - dash <= 10) ? "none" : (offset === dash) ? "0px, 999999px" : dash + "px," + length + "px";
			} else {
				style.strokeDasharray = dash + "px," + length + "px";
			}
		}
	},
	getLength: _getLength,
	getPosition: _getPosition
};

_getGSAP() && gsap.registerPlugin(DrawSVGPlugin);

export { DrawSVGPlugin as default };