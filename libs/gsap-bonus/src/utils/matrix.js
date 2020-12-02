/*!
 * matrix 3.4.0
 * https://greensock.com
 *
 * Copyright 2008-2020, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */
/* eslint-disable */

let _doc, _win, _docElement, _body,	_divContainer, _svgContainer, _identityMatrix,
	_transformProp = "transform",
	_transformOriginProp = _transformProp + "Origin",
	_hasOffsetBug,
	_setDoc = element => {
		let doc = element.ownerDocument || element;
		if (!(_transformProp in element.style) && "msTransform" in element.style) { //to improve compatibility with old Microsoft browsers
			_transformProp = "msTransform";
			_transformOriginProp = _transformProp + "Origin";
		}
		while (doc.parentNode && (doc = doc.parentNode)) {	}
		_win = window;
		_identityMatrix = new Matrix2D();
		if (doc) {
			_doc = doc;
			_docElement = doc.documentElement;
			_body = doc.body;
			// now test for the offset reporting bug. Use feature detection instead of browser sniffing to make things more bulletproof and future-proof. Hopefully Safari will fix their bug soon but it's 2020 and it's still not fixed.
			let d1 = doc.createElement("div"),
				d2 = doc.createElement("div");
			_body.appendChild(d1);
			d1.appendChild(d2);
			d1.style.position = "static";
			d1.style[_transformProp] = "translate3d(0,0,1px)";
			_hasOffsetBug = (d2.offsetParent !== d1);
			_body.removeChild(d1);
		}
		return doc;
	},
	_forceNonZeroScale = e => { // walks up the element's ancestors and finds any that had their scale set to 0 via GSAP, and changes them to 0.0001 to ensure that measurements work
		let a, cache;
		while (e && e !== _body) {
			cache = e._gsap;
			if (cache && !cache.scaleX && !cache.scaleY && cache.renderTransform) {
				cache.scaleX = cache.scaleY = 1e-4;
				cache.renderTransform(1, cache);
				a ? a.push(cache) : (a = [cache]);
			}
			e = e.parentNode;
		}
		return a;
	},
	// possible future addition: pass an element to _forceDisplay() and it'll walk up all its ancestors and make sure anything with display: none is set to display: block, and if there's no parentNode, it'll add it to the body. It returns an Array that you can then feed to _revertDisplay() to have it revert all the changes it made.
	// _forceDisplay = e => {
	// 	let a = [],
	// 		parent;
	// 	while (e && e !== _body) {
	// 		parent = e.parentNode;
	// 		(_win.getComputedStyle(e).display === "none" || !parent) && a.push(e, e.style.display, parent) && (e.style.display = "block");
	// 		parent || _body.appendChild(e);
	// 		e = parent;
	// 	}
	// 	return a;
	// },
	// _revertDisplay = a => {
	// 	for (let i = 0; i < a.length; i+=3) {
	// 		a[i+1] ? (a[i].style.display = a[i+1]) : a[i].style.removeProperty("display");
	// 		a[i+2] || a[i].parentNode.removeChild(a[i]);
	// 	}
	// },
	_svgTemps = [], //we create 3 elements for SVG, and 3 for other DOM elements and cache them for performance reasons. They get nested in _divContainer and _svgContainer so that just one element is added to the DOM on each successive attempt. Again, performance is key.
	_divTemps = [],
	_getDocScrollTop = () => _win.pageYOffset  || _doc.scrollTop || _docElement.scrollTop || _body.scrollTop || 0,
	_getDocScrollLeft = () => _win.pageXOffset || _doc.scrollLeft || _docElement.scrollLeft || _body.scrollLeft || 0,
	_svgOwner = element => element.ownerSVGElement || ((element.tagName + "").toLowerCase() === "svg" ? element : null),
	_isFixed = element => {
		if (_win.getComputedStyle(element).position === "fixed") {
			return true;
		}
		element = element.parentNode;
		if (element && element.nodeType === 1) { // avoid document fragments which will throw an error.
			return _isFixed(element);
		}
	},
	_createSibling = (element, i) => {
		if (element.parentNode && (_doc || _setDoc(element))) {
			let svg = _svgOwner(element),
				ns = svg ? (svg.getAttribute("xmlns") || "http://www.w3.org/2000/svg") : "http://www.w3.org/1999/xhtml",
				type = svg ? (i ? "rect" : "g") : "div",
				x = i !== 2 ? 0 : 100,
				y = i === 3 ? 100 : 0,
				css = "position:absolute;display:block;pointer-events:none;",
				e = _doc.createElementNS ? _doc.createElementNS(ns.replace(/^https/, "http"), type) : _doc.createElement(type);
			if (i) {
				if (!svg) {
					if (!_divContainer) {
						_divContainer = _createSibling(element);
						_divContainer.style.cssText = css;
					}
					e.style.cssText = css + "width:0.1px;height:0.1px;top:" + y + "px;left:" + x + "px";
					_divContainer.appendChild(e);

				} else {
					if (!_svgContainer) {
						_svgContainer = _createSibling(element);
					}
					e.setAttribute("width", 0.01);
					e.setAttribute("height", 0.01);
					e.setAttribute("transform", "translate(" + x + "," + y + ")");
					_svgContainer.appendChild(e);
				}
			}
			return e;
		}
		throw "Need document and parent.";
	},
	_consolidate = m => { // replaces SVGTransformList.consolidate() because a bug in Firefox causes it to break pointer events. See https://greensock.com/forums/topic/23248-touch-is-not-working-on-draggable-in-firefox-windows-v324/?tab=comments#comment-109800
		let c = new Matrix2D(),
			i = 0;
		for (; i < m.numberOfItems; i++) {
			c.multiply(m.getItem(i).matrix);
		}
		return c;
	},
	_placeSiblings = (element, adjustGOffset) => {
		let svg = _svgOwner(element),
			isRootSVG = element === svg,
			siblings = svg ? _svgTemps : _divTemps,
			container, m, b, x, y;
		if (element === _win) {
			return element;
		}
		if (!siblings.length) {
			siblings.push(_createSibling(element, 1), _createSibling(element, 2), _createSibling(element, 3));
		}
		container = svg ? _svgContainer : _divContainer;
		if (svg) {
			b = isRootSVG ? {x:0, y:0} : element.getBBox();
			m = element.transform ? element.transform.baseVal : {}; // IE11 doesn't follow the spec.
			if (m.numberOfItems) {
				m = m.numberOfItems > 1 ? _consolidate(m) : m.getItem(0).matrix; // don't call m.consolidate().matrix because a bug in Firefox makes pointer events not work when consolidate() is called on the same tick as getBoundingClientRect()! See https://greensock.com/forums/topic/23248-touch-is-not-working-on-draggable-in-firefox-windows-v324/?tab=comments#comment-109800
				x = m.a * b.x + m.c * b.y;
				y = m.b * b.x + m.d * b.y;
			} else {
				m = _identityMatrix;
				x = b.x;
				y = b.y;
			}
			if (adjustGOffset && element.tagName.toLowerCase() === "g") {
				x = y = 0;
			}
			container.setAttribute("transform", "matrix(" + m.a + "," + m.b + "," + m.c + "," + m.d + "," + (m.e + x) + "," + (m.f + y) + ")");
			(isRootSVG ? svg : element.parentNode).appendChild(container);
		} else {
			x = y = 0;
			if (_hasOffsetBug) { // some browsers (like Safari) have a bug that causes them to misreport offset values. When an ancestor element has a transform applied, it's supposed to treat it as if it's position: relative (new context). Safari botches this, so we need to find the closest ancestor (between the element and its offsetParent) that has a transform applied and if one is found, grab its offsetTop/Left and subtract them to compensate.
				m = element.offsetParent;
				b = element;
				while (b && (b = b.parentNode) && b !== m && b.parentNode) {
					if ((_win.getComputedStyle(b)[_transformProp] + "").length > 4) {
						x = b.offsetLeft;
						y = b.offsetTop;
						b = 0;
					}
				}
			}
			b = container.style;
			b.top = (element.offsetTop - y) + "px";
			b.left = (element.offsetLeft - x) + "px";
			m = _win.getComputedStyle(element);
			b[_transformProp] = m[_transformProp];
			b[_transformOriginProp] = m[_transformOriginProp];
			b.border = m.border;
			b.borderLeftStyle = m.borderLeftStyle;
			b.borderTopStyle = m.borderTopStyle;
			b.borderLeftWidth = m.borderLeftWidth;
			b.borderTopWidth = m.borderTopWidth;
			b.position = m.position === "fixed" ? "fixed" : "absolute";
			element.parentNode.appendChild(container);
		}
		return container;
	},
	_setMatrix = (m, a, b, c, d, e, f) => {
		m.a = a;
		m.b = b;
		m.c = c;
		m.d = d;
		m.e = e;
		m.f = f;
		return m;
	};

export class Matrix2D {
	constructor(a=1, b=0, c=0, d=1, e=0, f=0) {
		_setMatrix(this, a, b, c, d, e, f);
	}

	inverse() {
		let {a, b, c, d, e, f} = this,
			determinant = (a * d - b * c) || 1e-10;
		return _setMatrix(
			this,
			d / determinant,
			-b / determinant,
			-c / determinant,
			a / determinant,
			(c * f - d * e) / determinant,
			-(a * f - b * e) / determinant
		);
	}

	multiply(matrix) {
		let {a, b, c, d, e, f} = this,
			a2 = matrix.a,
			b2 = matrix.c,
			c2 = matrix.b,
			d2 = matrix.d,
			e2 = matrix.e,
			f2 = matrix.f;
		return _setMatrix(this,
			a2 * a + c2 * c,
			a2 * b + c2 * d,
			b2 * a + d2 * c,
			b2 * b + d2 * d,
			e + e2 * a + f2 * c,
			f + e2 * b + f2 * d);
	}

	clone() {
		return new Matrix2D(this.a, this.b, this.c, this.d, this.e, this.f);
	}

	equals(matrix) {
		let {a, b, c, d, e, f} = this;
		return (a === matrix.a && b === matrix.b && c === matrix.c && d === matrix.d && e === matrix.e && f === matrix.f);
	}

	apply(point, decoratee={}) {
		let {x, y} = point,
			{a, b, c, d, e, f} = this;
		decoratee.x = (x * a + y * c + e) || 0;
		decoratee.y = (x * b + y * d + f) || 0;
		return decoratee;
	}

}

//feed in an element and it'll return a 2D matrix (optionally inverted) so that you can translate between coordinate spaces.
// Inverting lets you translate a global point into a local coordinate space. No inverting lets you go the other way.
// We needed this to work around various browser bugs, like Firefox doesn't accurately report getScreenCTM() when there
// are transforms applied to ancestor elements.
// The matrix math to convert any x/y coordinate is as follows, which is wrapped in a convenient apply() method of Matrix2D above:
//     tx = m.a * x + m.c * y + m.e
//     ty = m.b * x + m.d * y + m.f
export function getGlobalMatrix(element, inverse, adjustGOffset) { // adjustGOffset is typically used only when grabbing an element's PARENT's global matrix, and it ignores the x/y offset of any SVG <g> elements because they behave in a special way.
	if (!element || !element.parentNode || (_doc || _setDoc(element)).documentElement === element) {
		return new Matrix2D();
	}
	let zeroScales = _forceNonZeroScale(element.parentNode),
		svg = _svgOwner(element),
		temps = svg ? _svgTemps : _divTemps,
		container = _placeSiblings(element, adjustGOffset),
		b1 = temps[0].getBoundingClientRect(),
		b2 = temps[1].getBoundingClientRect(),
		b3 = temps[2].getBoundingClientRect(),
		parent = container.parentNode,
		isFixed = _isFixed(element),
		m = new Matrix2D(
			(b2.left - b1.left) / 100,
			(b2.top - b1.top) / 100,
			(b3.left - b1.left) / 100,
			(b3.top - b1.top) / 100,
			b1.left + (isFixed ? 0 : _getDocScrollLeft()),
			b1.top + (isFixed ? 0 : _getDocScrollTop())
		);
	parent.removeChild(container);
	if (zeroScales) {
		b1 = zeroScales.length;
		while (b1--) {
			b2 = zeroScales[b1];
			b2.scaleX = b2.scaleY = 0;
			b2.renderTransform(1, b2);
		}
	}
	return inverse ? m.inverse() : m;
}

// export function getMatrix(element) {
// 	_doc || _setDoc(element);
// 	let m = (_win.getComputedStyle(element)[_transformProp] + "").substr(7).match(/[-.]*\d+[.e\-+]*\d*[e\-\+]*\d*/g),
// 		is2D = m && m.length === 6;
// 	return !m || m.length < 6 ? new Matrix2D() : new Matrix2D(+m[0], +m[1], +m[is2D ? 2 : 4], +m[is2D ? 3 : 5], +m[is2D ? 4 : 12], +m[is2D ? 5 : 13]);
// }