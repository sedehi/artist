(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery')) :
	typeof define === 'function' && define.amd ? define(['jquery'], factory) :
	(global = global || self, factory(global.jQuery));
}(this, (function (jquery) { 'use strict';

	jquery = jquery && Object.prototype.hasOwnProperty.call(jquery, 'default') ? jquery['default'] : jquery;

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	/**!
	 * @fileOverview Kickass library to create and place poppers near their reference elements.
	 * @version 1.16.1
	 * @license
	 * Copyright (c) 2016 Federico Zivolo and contributors
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in all
	 * copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	 * SOFTWARE.
	 */
	var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && typeof navigator !== 'undefined';

	var timeoutDuration = function () {
	  var longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
	  for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
	    if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
	      return 1;
	    }
	  }
	  return 0;
	}();

	function microtaskDebounce(fn) {
	  var called = false;
	  return function () {
	    if (called) {
	      return;
	    }
	    called = true;
	    window.Promise.resolve().then(function () {
	      called = false;
	      fn();
	    });
	  };
	}

	function taskDebounce(fn) {
	  var scheduled = false;
	  return function () {
	    if (!scheduled) {
	      scheduled = true;
	      setTimeout(function () {
	        scheduled = false;
	        fn();
	      }, timeoutDuration);
	    }
	  };
	}

	var supportsMicroTasks = isBrowser && window.Promise;

	/**
	* Create a debounced version of a method, that's asynchronously deferred
	* but called in the minimum time possible.
	*
	* @method
	* @memberof Popper.Utils
	* @argument {Function} fn
	* @returns {Function}
	*/
	var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

	/**
	 * Check if the given variable is a function
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Any} functionToCheck - variable to check
	 * @returns {Boolean} answer to: is a function?
	 */
	function isFunction(functionToCheck) {
	  var getType = {};
	  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	}

	/**
	 * Get CSS computed property of the given element
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Eement} element
	 * @argument {String} property
	 */
	function getStyleComputedProperty(element, property) {
	  if (element.nodeType !== 1) {
	    return [];
	  }
	  // NOTE: 1 DOM access here
	  var window = element.ownerDocument.defaultView;
	  var css = window.getComputedStyle(element, null);
	  return property ? css[property] : css;
	}

	/**
	 * Returns the parentNode or the host of the element
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element
	 * @returns {Element} parent
	 */
	function getParentNode(element) {
	  if (element.nodeName === 'HTML') {
	    return element;
	  }
	  return element.parentNode || element.host;
	}

	/**
	 * Returns the scrolling parent of the given element
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element
	 * @returns {Element} scroll parent
	 */
	function getScrollParent(element) {
	  // Return body, `getScroll` will take care to get the correct `scrollTop` from it
	  if (!element) {
	    return document.body;
	  }

	  switch (element.nodeName) {
	    case 'HTML':
	    case 'BODY':
	      return element.ownerDocument.body;
	    case '#document':
	      return element.body;
	  }

	  // Firefox want us to check `-x` and `-y` variations as well

	  var _getStyleComputedProp = getStyleComputedProperty(element),
	      overflow = _getStyleComputedProp.overflow,
	      overflowX = _getStyleComputedProp.overflowX,
	      overflowY = _getStyleComputedProp.overflowY;

	  if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
	    return element;
	  }

	  return getScrollParent(getParentNode(element));
	}

	/**
	 * Returns the reference node of the reference object, or the reference object itself.
	 * @method
	 * @memberof Popper.Utils
	 * @param {Element|Object} reference - the reference element (the popper will be relative to this)
	 * @returns {Element} parent
	 */
	function getReferenceNode(reference) {
	  return reference && reference.referenceNode ? reference.referenceNode : reference;
	}

	var isIE11 = isBrowser && !!(window.MSInputMethodContext && document.documentMode);
	var isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

	/**
	 * Determines if the browser is Internet Explorer
	 * @method
	 * @memberof Popper.Utils
	 * @param {Number} version to check
	 * @returns {Boolean} isIE
	 */
	function isIE(version) {
	  if (version === 11) {
	    return isIE11;
	  }
	  if (version === 10) {
	    return isIE10;
	  }
	  return isIE11 || isIE10;
	}

	/**
	 * Returns the offset parent of the given element
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element
	 * @returns {Element} offset parent
	 */
	function getOffsetParent(element) {
	  if (!element) {
	    return document.documentElement;
	  }

	  var noOffsetParent = isIE(10) ? document.body : null;

	  // NOTE: 1 DOM access here
	  var offsetParent = element.offsetParent || null;
	  // Skip hidden elements which don't have an offsetParent
	  while (offsetParent === noOffsetParent && element.nextElementSibling) {
	    offsetParent = (element = element.nextElementSibling).offsetParent;
	  }

	  var nodeName = offsetParent && offsetParent.nodeName;

	  if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
	    return element ? element.ownerDocument.documentElement : document.documentElement;
	  }

	  // .offsetParent will return the closest TH, TD or TABLE in case
	  // no offsetParent is present, I hate this job...
	  if (['TH', 'TD', 'TABLE'].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, 'position') === 'static') {
	    return getOffsetParent(offsetParent);
	  }

	  return offsetParent;
	}

	function isOffsetContainer(element) {
	  var nodeName = element.nodeName;

	  if (nodeName === 'BODY') {
	    return false;
	  }
	  return nodeName === 'HTML' || getOffsetParent(element.firstElementChild) === element;
	}

	/**
	 * Finds the root node (document, shadowDOM root) of the given element
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} node
	 * @returns {Element} root node
	 */
	function getRoot(node) {
	  if (node.parentNode !== null) {
	    return getRoot(node.parentNode);
	  }

	  return node;
	}

	/**
	 * Finds the offset parent common to the two provided nodes
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element1
	 * @argument {Element} element2
	 * @returns {Element} common offset parent
	 */
	function findCommonOffsetParent(element1, element2) {
	  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
	  if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
	    return document.documentElement;
	  }

	  // Here we make sure to give as "start" the element that comes first in the DOM
	  var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
	  var start = order ? element1 : element2;
	  var end = order ? element2 : element1;

	  // Get common ancestor container
	  var range = document.createRange();
	  range.setStart(start, 0);
	  range.setEnd(end, 0);
	  var commonAncestorContainer = range.commonAncestorContainer;

	  // Both nodes are inside #document

	  if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
	    if (isOffsetContainer(commonAncestorContainer)) {
	      return commonAncestorContainer;
	    }

	    return getOffsetParent(commonAncestorContainer);
	  }

	  // one of the nodes is inside shadowDOM, find which one
	  var element1root = getRoot(element1);
	  if (element1root.host) {
	    return findCommonOffsetParent(element1root.host, element2);
	  } else {
	    return findCommonOffsetParent(element1, getRoot(element2).host);
	  }
	}

	/**
	 * Gets the scroll value of the given element in the given side (top and left)
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element
	 * @argument {String} side `top` or `left`
	 * @returns {number} amount of scrolled pixels
	 */
	function getScroll(element) {
	  var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';

	  var upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
	  var nodeName = element.nodeName;

	  if (nodeName === 'BODY' || nodeName === 'HTML') {
	    var html = element.ownerDocument.documentElement;
	    var scrollingElement = element.ownerDocument.scrollingElement || html;
	    return scrollingElement[upperSide];
	  }

	  return element[upperSide];
	}

	/*
	 * Sum or subtract the element scroll values (left and top) from a given rect object
	 * @method
	 * @memberof Popper.Utils
	 * @param {Object} rect - Rect object you want to change
	 * @param {HTMLElement} element - The element from the function reads the scroll values
	 * @param {Boolean} subtract - set to true if you want to subtract the scroll values
	 * @return {Object} rect - The modifier rect object
	 */
	function includeScroll(rect, element) {
	  var subtract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	  var scrollTop = getScroll(element, 'top');
	  var scrollLeft = getScroll(element, 'left');
	  var modifier = subtract ? -1 : 1;
	  rect.top += scrollTop * modifier;
	  rect.bottom += scrollTop * modifier;
	  rect.left += scrollLeft * modifier;
	  rect.right += scrollLeft * modifier;
	  return rect;
	}

	/*
	 * Helper to detect borders of a given element
	 * @method
	 * @memberof Popper.Utils
	 * @param {CSSStyleDeclaration} styles
	 * Result of `getStyleComputedProperty` on the given element
	 * @param {String} axis - `x` or `y`
	 * @return {number} borders - The borders size of the given axis
	 */

	function getBordersSize(styles, axis) {
	  var sideA = axis === 'x' ? 'Left' : 'Top';
	  var sideB = sideA === 'Left' ? 'Right' : 'Bottom';

	  return parseFloat(styles['border' + sideA + 'Width']) + parseFloat(styles['border' + sideB + 'Width']);
	}

	function getSize(axis, body, html, computedStyle) {
	  return Math.max(body['offset' + axis], body['scroll' + axis], html['client' + axis], html['offset' + axis], html['scroll' + axis], isIE(10) ? parseInt(html['offset' + axis]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Top' : 'Left')]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Bottom' : 'Right')]) : 0);
	}

	function getWindowSizes(document) {
	  var body = document.body;
	  var html = document.documentElement;
	  var computedStyle = isIE(10) && getComputedStyle(html);

	  return {
	    height: getSize('Height', body, html, computedStyle),
	    width: getSize('Width', body, html, computedStyle)
	  };
	}

	var classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	var createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();





	var defineProperty = function (obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	};

	var _extends = Object.assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];

	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }

	  return target;
	};

	/**
	 * Given element offsets, generate an output similar to getBoundingClientRect
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Object} offsets
	 * @returns {Object} ClientRect like output
	 */
	function getClientRect(offsets) {
	  return _extends({}, offsets, {
	    right: offsets.left + offsets.width,
	    bottom: offsets.top + offsets.height
	  });
	}

	/**
	 * Get bounding client rect of given element
	 * @method
	 * @memberof Popper.Utils
	 * @param {HTMLElement} element
	 * @return {Object} client rect
	 */
	function getBoundingClientRect(element) {
	  var rect = {};

	  // IE10 10 FIX: Please, don't ask, the element isn't
	  // considered in DOM in some circumstances...
	  // This isn't reproducible in IE10 compatibility mode of IE11
	  try {
	    if (isIE(10)) {
	      rect = element.getBoundingClientRect();
	      var scrollTop = getScroll(element, 'top');
	      var scrollLeft = getScroll(element, 'left');
	      rect.top += scrollTop;
	      rect.left += scrollLeft;
	      rect.bottom += scrollTop;
	      rect.right += scrollLeft;
	    } else {
	      rect = element.getBoundingClientRect();
	    }
	  } catch (e) {}

	  var result = {
	    left: rect.left,
	    top: rect.top,
	    width: rect.right - rect.left,
	    height: rect.bottom - rect.top
	  };

	  // subtract scrollbar size from sizes
	  var sizes = element.nodeName === 'HTML' ? getWindowSizes(element.ownerDocument) : {};
	  var width = sizes.width || element.clientWidth || result.width;
	  var height = sizes.height || element.clientHeight || result.height;

	  var horizScrollbar = element.offsetWidth - width;
	  var vertScrollbar = element.offsetHeight - height;

	  // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
	  // we make this check conditional for performance reasons
	  if (horizScrollbar || vertScrollbar) {
	    var styles = getStyleComputedProperty(element);
	    horizScrollbar -= getBordersSize(styles, 'x');
	    vertScrollbar -= getBordersSize(styles, 'y');

	    result.width -= horizScrollbar;
	    result.height -= vertScrollbar;
	  }

	  return getClientRect(result);
	}

	function getOffsetRectRelativeToArbitraryNode(children, parent) {
	  var fixedPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	  var isIE10 = isIE(10);
	  var isHTML = parent.nodeName === 'HTML';
	  var childrenRect = getBoundingClientRect(children);
	  var parentRect = getBoundingClientRect(parent);
	  var scrollParent = getScrollParent(children);

	  var styles = getStyleComputedProperty(parent);
	  var borderTopWidth = parseFloat(styles.borderTopWidth);
	  var borderLeftWidth = parseFloat(styles.borderLeftWidth);

	  // In cases where the parent is fixed, we must ignore negative scroll in offset calc
	  if (fixedPosition && isHTML) {
	    parentRect.top = Math.max(parentRect.top, 0);
	    parentRect.left = Math.max(parentRect.left, 0);
	  }
	  var offsets = getClientRect({
	    top: childrenRect.top - parentRect.top - borderTopWidth,
	    left: childrenRect.left - parentRect.left - borderLeftWidth,
	    width: childrenRect.width,
	    height: childrenRect.height
	  });
	  offsets.marginTop = 0;
	  offsets.marginLeft = 0;

	  // Subtract margins of documentElement in case it's being used as parent
	  // we do this only on HTML because it's the only element that behaves
	  // differently when margins are applied to it. The margins are included in
	  // the box of the documentElement, in the other cases not.
	  if (!isIE10 && isHTML) {
	    var marginTop = parseFloat(styles.marginTop);
	    var marginLeft = parseFloat(styles.marginLeft);

	    offsets.top -= borderTopWidth - marginTop;
	    offsets.bottom -= borderTopWidth - marginTop;
	    offsets.left -= borderLeftWidth - marginLeft;
	    offsets.right -= borderLeftWidth - marginLeft;

	    // Attach marginTop and marginLeft because in some circumstances we may need them
	    offsets.marginTop = marginTop;
	    offsets.marginLeft = marginLeft;
	  }

	  if (isIE10 && !fixedPosition ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== 'BODY') {
	    offsets = includeScroll(offsets, parent);
	  }

	  return offsets;
	}

	function getViewportOffsetRectRelativeToArtbitraryNode(element) {
	  var excludeScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	  var html = element.ownerDocument.documentElement;
	  var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
	  var width = Math.max(html.clientWidth, window.innerWidth || 0);
	  var height = Math.max(html.clientHeight, window.innerHeight || 0);

	  var scrollTop = !excludeScroll ? getScroll(html) : 0;
	  var scrollLeft = !excludeScroll ? getScroll(html, 'left') : 0;

	  var offset = {
	    top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
	    left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
	    width: width,
	    height: height
	  };

	  return getClientRect(offset);
	}

	/**
	 * Check if the given element is fixed or is inside a fixed parent
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element
	 * @argument {Element} customContainer
	 * @returns {Boolean} answer to "isFixed?"
	 */
	function isFixed(element) {
	  var nodeName = element.nodeName;
	  if (nodeName === 'BODY' || nodeName === 'HTML') {
	    return false;
	  }
	  if (getStyleComputedProperty(element, 'position') === 'fixed') {
	    return true;
	  }
	  var parentNode = getParentNode(element);
	  if (!parentNode) {
	    return false;
	  }
	  return isFixed(parentNode);
	}

	/**
	 * Finds the first parent of an element that has a transformed property defined
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element
	 * @returns {Element} first transformed parent or documentElement
	 */

	function getFixedPositionOffsetParent(element) {
	  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
	  if (!element || !element.parentElement || isIE()) {
	    return document.documentElement;
	  }
	  var el = element.parentElement;
	  while (el && getStyleComputedProperty(el, 'transform') === 'none') {
	    el = el.parentElement;
	  }
	  return el || document.documentElement;
	}

	/**
	 * Computed the boundaries limits and return them
	 * @method
	 * @memberof Popper.Utils
	 * @param {HTMLElement} popper
	 * @param {HTMLElement} reference
	 * @param {number} padding
	 * @param {HTMLElement} boundariesElement - Element used to define the boundaries
	 * @param {Boolean} fixedPosition - Is in fixed position mode
	 * @returns {Object} Coordinates of the boundaries
	 */
	function getBoundaries(popper, reference, padding, boundariesElement) {
	  var fixedPosition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

	  // NOTE: 1 DOM access here

	  var boundaries = { top: 0, left: 0 };
	  var offsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, getReferenceNode(reference));

	  // Handle viewport case
	  if (boundariesElement === 'viewport') {
	    boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
	  } else {
	    // Handle other cases based on DOM element used as boundaries
	    var boundariesNode = void 0;
	    if (boundariesElement === 'scrollParent') {
	      boundariesNode = getScrollParent(getParentNode(reference));
	      if (boundariesNode.nodeName === 'BODY') {
	        boundariesNode = popper.ownerDocument.documentElement;
	      }
	    } else if (boundariesElement === 'window') {
	      boundariesNode = popper.ownerDocument.documentElement;
	    } else {
	      boundariesNode = boundariesElement;
	    }

	    var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);

	    // In case of HTML, we need a different computation
	    if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
	      var _getWindowSizes = getWindowSizes(popper.ownerDocument),
	          height = _getWindowSizes.height,
	          width = _getWindowSizes.width;

	      boundaries.top += offsets.top - offsets.marginTop;
	      boundaries.bottom = height + offsets.top;
	      boundaries.left += offsets.left - offsets.marginLeft;
	      boundaries.right = width + offsets.left;
	    } else {
	      // for all the other DOM elements, this one is good
	      boundaries = offsets;
	    }
	  }

	  // Add paddings
	  padding = padding || 0;
	  var isPaddingNumber = typeof padding === 'number';
	  boundaries.left += isPaddingNumber ? padding : padding.left || 0;
	  boundaries.top += isPaddingNumber ? padding : padding.top || 0;
	  boundaries.right -= isPaddingNumber ? padding : padding.right || 0;
	  boundaries.bottom -= isPaddingNumber ? padding : padding.bottom || 0;

	  return boundaries;
	}

	function getArea(_ref) {
	  var width = _ref.width,
	      height = _ref.height;

	  return width * height;
	}

	/**
	 * Utility used to transform the `auto` placement to the placement with more
	 * available space.
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Object} data - The data object generated by update method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function computeAutoPlacement(placement, refRect, popper, reference, boundariesElement) {
	  var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

	  if (placement.indexOf('auto') === -1) {
	    return placement;
	  }

	  var boundaries = getBoundaries(popper, reference, padding, boundariesElement);

	  var rects = {
	    top: {
	      width: boundaries.width,
	      height: refRect.top - boundaries.top
	    },
	    right: {
	      width: boundaries.right - refRect.right,
	      height: boundaries.height
	    },
	    bottom: {
	      width: boundaries.width,
	      height: boundaries.bottom - refRect.bottom
	    },
	    left: {
	      width: refRect.left - boundaries.left,
	      height: boundaries.height
	    }
	  };

	  var sortedAreas = Object.keys(rects).map(function (key) {
	    return _extends({
	      key: key
	    }, rects[key], {
	      area: getArea(rects[key])
	    });
	  }).sort(function (a, b) {
	    return b.area - a.area;
	  });

	  var filteredAreas = sortedAreas.filter(function (_ref2) {
	    var width = _ref2.width,
	        height = _ref2.height;
	    return width >= popper.clientWidth && height >= popper.clientHeight;
	  });

	  var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;

	  var variation = placement.split('-')[1];

	  return computedPlacement + (variation ? '-' + variation : '');
	}

	/**
	 * Get offsets to the reference element
	 * @method
	 * @memberof Popper.Utils
	 * @param {Object} state
	 * @param {Element} popper - the popper element
	 * @param {Element} reference - the reference element (the popper will be relative to this)
	 * @param {Element} fixedPosition - is in fixed position mode
	 * @returns {Object} An object containing the offsets which will be applied to the popper
	 */
	function getReferenceOffsets(state, popper, reference) {
	  var fixedPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

	  var commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, getReferenceNode(reference));
	  return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent, fixedPosition);
	}

	/**
	 * Get the outer sizes of the given element (offset size + margins)
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element
	 * @returns {Object} object containing width and height properties
	 */
	function getOuterSizes(element) {
	  var window = element.ownerDocument.defaultView;
	  var styles = window.getComputedStyle(element);
	  var x = parseFloat(styles.marginTop || 0) + parseFloat(styles.marginBottom || 0);
	  var y = parseFloat(styles.marginLeft || 0) + parseFloat(styles.marginRight || 0);
	  var result = {
	    width: element.offsetWidth + y,
	    height: element.offsetHeight + x
	  };
	  return result;
	}

	/**
	 * Get the opposite placement of the given one
	 * @method
	 * @memberof Popper.Utils
	 * @argument {String} placement
	 * @returns {String} flipped placement
	 */
	function getOppositePlacement(placement) {
	  var hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
	  return placement.replace(/left|right|bottom|top/g, function (matched) {
	    return hash[matched];
	  });
	}

	/**
	 * Get offsets to the popper
	 * @method
	 * @memberof Popper.Utils
	 * @param {Object} position - CSS position the Popper will get applied
	 * @param {HTMLElement} popper - the popper element
	 * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
	 * @param {String} placement - one of the valid placement options
	 * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
	 */
	function getPopperOffsets(popper, referenceOffsets, placement) {
	  placement = placement.split('-')[0];

	  // Get popper node sizes
	  var popperRect = getOuterSizes(popper);

	  // Add position, width and height to our offsets object
	  var popperOffsets = {
	    width: popperRect.width,
	    height: popperRect.height
	  };

	  // depending by the popper placement we have to compute its offsets slightly differently
	  var isHoriz = ['right', 'left'].indexOf(placement) !== -1;
	  var mainSide = isHoriz ? 'top' : 'left';
	  var secondarySide = isHoriz ? 'left' : 'top';
	  var measurement = isHoriz ? 'height' : 'width';
	  var secondaryMeasurement = !isHoriz ? 'height' : 'width';

	  popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
	  if (placement === secondarySide) {
	    popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
	  } else {
	    popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
	  }

	  return popperOffsets;
	}

	/**
	 * Mimics the `find` method of Array
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Array} arr
	 * @argument prop
	 * @argument value
	 * @returns index or -1
	 */
	function find(arr, check) {
	  // use native find if supported
	  if (Array.prototype.find) {
	    return arr.find(check);
	  }

	  // use `filter` to obtain the same behavior of `find`
	  return arr.filter(check)[0];
	}

	/**
	 * Return the index of the matching object
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Array} arr
	 * @argument prop
	 * @argument value
	 * @returns index or -1
	 */
	function findIndex(arr, prop, value) {
	  // use native findIndex if supported
	  if (Array.prototype.findIndex) {
	    return arr.findIndex(function (cur) {
	      return cur[prop] === value;
	    });
	  }

	  // use `find` + `indexOf` if `findIndex` isn't supported
	  var match = find(arr, function (obj) {
	    return obj[prop] === value;
	  });
	  return arr.indexOf(match);
	}

	/**
	 * Loop trough the list of modifiers and run them in order,
	 * each of them will then edit the data object.
	 * @method
	 * @memberof Popper.Utils
	 * @param {dataObject} data
	 * @param {Array} modifiers
	 * @param {String} ends - Optional modifier name used as stopper
	 * @returns {dataObject}
	 */
	function runModifiers(modifiers, data, ends) {
	  var modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));

	  modifiersToRun.forEach(function (modifier) {
	    if (modifier['function']) {
	      // eslint-disable-line dot-notation
	      console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
	    }
	    var fn = modifier['function'] || modifier.fn; // eslint-disable-line dot-notation
	    if (modifier.enabled && isFunction(fn)) {
	      // Add properties to offsets to make them a complete clientRect object
	      // we do this before each modifier to make sure the previous one doesn't
	      // mess with these values
	      data.offsets.popper = getClientRect(data.offsets.popper);
	      data.offsets.reference = getClientRect(data.offsets.reference);

	      data = fn(data, modifier);
	    }
	  });

	  return data;
	}

	/**
	 * Updates the position of the popper, computing the new offsets and applying
	 * the new style.<br />
	 * Prefer `scheduleUpdate` over `update` because of performance reasons.
	 * @method
	 * @memberof Popper
	 */
	function update() {
	  // if popper is destroyed, don't perform any further update
	  if (this.state.isDestroyed) {
	    return;
	  }

	  var data = {
	    instance: this,
	    styles: {},
	    arrowStyles: {},
	    attributes: {},
	    flipped: false,
	    offsets: {}
	  };

	  // compute reference element offsets
	  data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference, this.options.positionFixed);

	  // compute auto placement, store placement inside the data object,
	  // modifiers will be able to edit `placement` if needed
	  // and refer to originalPlacement to know the original value
	  data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);

	  // store the computed placement inside `originalPlacement`
	  data.originalPlacement = data.placement;

	  data.positionFixed = this.options.positionFixed;

	  // compute the popper offsets
	  data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);

	  data.offsets.popper.position = this.options.positionFixed ? 'fixed' : 'absolute';

	  // run the modifiers
	  data = runModifiers(this.modifiers, data);

	  // the first `update` will call `onCreate` callback
	  // the other ones will call `onUpdate` callback
	  if (!this.state.isCreated) {
	    this.state.isCreated = true;
	    this.options.onCreate(data);
	  } else {
	    this.options.onUpdate(data);
	  }
	}

	/**
	 * Helper used to know if the given modifier is enabled.
	 * @method
	 * @memberof Popper.Utils
	 * @returns {Boolean}
	 */
	function isModifierEnabled(modifiers, modifierName) {
	  return modifiers.some(function (_ref) {
	    var name = _ref.name,
	        enabled = _ref.enabled;
	    return enabled && name === modifierName;
	  });
	}

	/**
	 * Get the prefixed supported property name
	 * @method
	 * @memberof Popper.Utils
	 * @argument {String} property (camelCase)
	 * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
	 */
	function getSupportedPropertyName(property) {
	  var prefixes = [false, 'ms', 'Webkit', 'Moz', 'O'];
	  var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

	  for (var i = 0; i < prefixes.length; i++) {
	    var prefix = prefixes[i];
	    var toCheck = prefix ? '' + prefix + upperProp : property;
	    if (typeof document.body.style[toCheck] !== 'undefined') {
	      return toCheck;
	    }
	  }
	  return null;
	}

	/**
	 * Destroys the popper.
	 * @method
	 * @memberof Popper
	 */
	function destroy() {
	  this.state.isDestroyed = true;

	  // touch DOM only if `applyStyle` modifier is enabled
	  if (isModifierEnabled(this.modifiers, 'applyStyle')) {
	    this.popper.removeAttribute('x-placement');
	    this.popper.style.position = '';
	    this.popper.style.top = '';
	    this.popper.style.left = '';
	    this.popper.style.right = '';
	    this.popper.style.bottom = '';
	    this.popper.style.willChange = '';
	    this.popper.style[getSupportedPropertyName('transform')] = '';
	  }

	  this.disableEventListeners();

	  // remove the popper if user explicitly asked for the deletion on destroy
	  // do not use `remove` because IE11 doesn't support it
	  if (this.options.removeOnDestroy) {
	    this.popper.parentNode.removeChild(this.popper);
	  }
	  return this;
	}

	/**
	 * Get the window associated with the element
	 * @argument {Element} element
	 * @returns {Window}
	 */
	function getWindow(element) {
	  var ownerDocument = element.ownerDocument;
	  return ownerDocument ? ownerDocument.defaultView : window;
	}

	function attachToScrollParents(scrollParent, event, callback, scrollParents) {
	  var isBody = scrollParent.nodeName === 'BODY';
	  var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
	  target.addEventListener(event, callback, { passive: true });

	  if (!isBody) {
	    attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
	  }
	  scrollParents.push(target);
	}

	/**
	 * Setup needed event listeners used to update the popper position
	 * @method
	 * @memberof Popper.Utils
	 * @private
	 */
	function setupEventListeners(reference, options, state, updateBound) {
	  // Resize event listener on window
	  state.updateBound = updateBound;
	  getWindow(reference).addEventListener('resize', state.updateBound, { passive: true });

	  // Scroll event listener on scroll parents
	  var scrollElement = getScrollParent(reference);
	  attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
	  state.scrollElement = scrollElement;
	  state.eventsEnabled = true;

	  return state;
	}

	/**
	 * It will add resize/scroll events and start recalculating
	 * position of the popper element when they are triggered.
	 * @method
	 * @memberof Popper
	 */
	function enableEventListeners() {
	  if (!this.state.eventsEnabled) {
	    this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
	  }
	}

	/**
	 * Remove event listeners used to update the popper position
	 * @method
	 * @memberof Popper.Utils
	 * @private
	 */
	function removeEventListeners(reference, state) {
	  // Remove resize event listener on window
	  getWindow(reference).removeEventListener('resize', state.updateBound);

	  // Remove scroll event listener on scroll parents
	  state.scrollParents.forEach(function (target) {
	    target.removeEventListener('scroll', state.updateBound);
	  });

	  // Reset state
	  state.updateBound = null;
	  state.scrollParents = [];
	  state.scrollElement = null;
	  state.eventsEnabled = false;
	  return state;
	}

	/**
	 * It will remove resize/scroll events and won't recalculate popper position
	 * when they are triggered. It also won't trigger `onUpdate` callback anymore,
	 * unless you call `update` method manually.
	 * @method
	 * @memberof Popper
	 */
	function disableEventListeners() {
	  if (this.state.eventsEnabled) {
	    cancelAnimationFrame(this.scheduleUpdate);
	    this.state = removeEventListeners(this.reference, this.state);
	  }
	}

	/**
	 * Tells if a given input is a number
	 * @method
	 * @memberof Popper.Utils
	 * @param {*} input to check
	 * @return {Boolean}
	 */
	function isNumeric(n) {
	  return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
	}

	/**
	 * Set the style to the given popper
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element - Element to apply the style to
	 * @argument {Object} styles
	 * Object with a list of properties and values which will be applied to the element
	 */
	function setStyles(element, styles) {
	  Object.keys(styles).forEach(function (prop) {
	    var unit = '';
	    // add unit if the value is numeric and is one of the following
	    if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
	      unit = 'px';
	    }
	    element.style[prop] = styles[prop] + unit;
	  });
	}

	/**
	 * Set the attributes to the given popper
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element - Element to apply the attributes to
	 * @argument {Object} styles
	 * Object with a list of properties and values which will be applied to the element
	 */
	function setAttributes(element, attributes) {
	  Object.keys(attributes).forEach(function (prop) {
	    var value = attributes[prop];
	    if (value !== false) {
	      element.setAttribute(prop, attributes[prop]);
	    } else {
	      element.removeAttribute(prop);
	    }
	  });
	}

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by `update` method
	 * @argument {Object} data.styles - List of style properties - values to apply to popper element
	 * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The same data object
	 */
	function applyStyle(data) {
	  // any property present in `data.styles` will be applied to the popper,
	  // in this way we can make the 3rd party modifiers add custom styles to it
	  // Be aware, modifiers could override the properties defined in the previous
	  // lines of this modifier!
	  setStyles(data.instance.popper, data.styles);

	  // any property present in `data.attributes` will be applied to the popper,
	  // they will be set as HTML attributes of the element
	  setAttributes(data.instance.popper, data.attributes);

	  // if arrowElement is defined and arrowStyles has some properties
	  if (data.arrowElement && Object.keys(data.arrowStyles).length) {
	    setStyles(data.arrowElement, data.arrowStyles);
	  }

	  return data;
	}

	/**
	 * Set the x-placement attribute before everything else because it could be used
	 * to add margins to the popper margins needs to be calculated to get the
	 * correct popper offsets.
	 * @method
	 * @memberof Popper.modifiers
	 * @param {HTMLElement} reference - The reference element used to position the popper
	 * @param {HTMLElement} popper - The HTML element used as popper
	 * @param {Object} options - Popper.js options
	 */
	function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
	  // compute reference element offsets
	  var referenceOffsets = getReferenceOffsets(state, popper, reference, options.positionFixed);

	  // compute auto placement, store placement inside the data object,
	  // modifiers will be able to edit `placement` if needed
	  // and refer to originalPlacement to know the original value
	  var placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);

	  popper.setAttribute('x-placement', placement);

	  // Apply `position` to popper before anything else because
	  // without the position applied we can't guarantee correct computations
	  setStyles(popper, { position: options.positionFixed ? 'fixed' : 'absolute' });

	  return options;
	}

	/**
	 * @function
	 * @memberof Popper.Utils
	 * @argument {Object} data - The data object generated by `update` method
	 * @argument {Boolean} shouldRound - If the offsets should be rounded at all
	 * @returns {Object} The popper's position offsets rounded
	 *
	 * The tale of pixel-perfect positioning. It's still not 100% perfect, but as
	 * good as it can be within reason.
	 * Discussion here: https://github.com/FezVrasta/popper.js/pull/715
	 *
	 * Low DPI screens cause a popper to be blurry if not using full pixels (Safari
	 * as well on High DPI screens).
	 *
	 * Firefox prefers no rounding for positioning and does not have blurriness on
	 * high DPI screens.
	 *
	 * Only horizontal placement and left/right values need to be considered.
	 */
	function getRoundedOffsets(data, shouldRound) {
	  var _data$offsets = data.offsets,
	      popper = _data$offsets.popper,
	      reference = _data$offsets.reference;
	  var round = Math.round,
	      floor = Math.floor;

	  var noRound = function noRound(v) {
	    return v;
	  };

	  var referenceWidth = round(reference.width);
	  var popperWidth = round(popper.width);

	  var isVertical = ['left', 'right'].indexOf(data.placement) !== -1;
	  var isVariation = data.placement.indexOf('-') !== -1;
	  var sameWidthParity = referenceWidth % 2 === popperWidth % 2;
	  var bothOddWidth = referenceWidth % 2 === 1 && popperWidth % 2 === 1;

	  var horizontalToInteger = !shouldRound ? noRound : isVertical || isVariation || sameWidthParity ? round : floor;
	  var verticalToInteger = !shouldRound ? noRound : round;

	  return {
	    left: horizontalToInteger(bothOddWidth && !isVariation && shouldRound ? popper.left - 1 : popper.left),
	    top: verticalToInteger(popper.top),
	    bottom: verticalToInteger(popper.bottom),
	    right: horizontalToInteger(popper.right)
	  };
	}

	var isFirefox = isBrowser && /Firefox/i.test(navigator.userAgent);

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by `update` method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function computeStyle(data, options) {
	  var x = options.x,
	      y = options.y;
	  var popper = data.offsets.popper;

	  // Remove this legacy support in Popper.js v2

	  var legacyGpuAccelerationOption = find(data.instance.modifiers, function (modifier) {
	    return modifier.name === 'applyStyle';
	  }).gpuAcceleration;
	  if (legacyGpuAccelerationOption !== undefined) {
	    console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
	  }
	  var gpuAcceleration = legacyGpuAccelerationOption !== undefined ? legacyGpuAccelerationOption : options.gpuAcceleration;

	  var offsetParent = getOffsetParent(data.instance.popper);
	  var offsetParentRect = getBoundingClientRect(offsetParent);

	  // Styles
	  var styles = {
	    position: popper.position
	  };

	  var offsets = getRoundedOffsets(data, window.devicePixelRatio < 2 || !isFirefox);

	  var sideA = x === 'bottom' ? 'top' : 'bottom';
	  var sideB = y === 'right' ? 'left' : 'right';

	  // if gpuAcceleration is set to `true` and transform is supported,
	  //  we use `translate3d` to apply the position to the popper we
	  // automatically use the supported prefixed version if needed
	  var prefixedProperty = getSupportedPropertyName('transform');

	  // now, let's make a step back and look at this code closely (wtf?)
	  // If the content of the popper grows once it's been positioned, it
	  // may happen that the popper gets misplaced because of the new content
	  // overflowing its reference element
	  // To avoid this problem, we provide two options (x and y), which allow
	  // the consumer to define the offset origin.
	  // If we position a popper on top of a reference element, we can set
	  // `x` to `top` to make the popper grow towards its top instead of
	  // its bottom.
	  var left = void 0,
	      top = void 0;
	  if (sideA === 'bottom') {
	    // when offsetParent is <html> the positioning is relative to the bottom of the screen (excluding the scrollbar)
	    // and not the bottom of the html element
	    if (offsetParent.nodeName === 'HTML') {
	      top = -offsetParent.clientHeight + offsets.bottom;
	    } else {
	      top = -offsetParentRect.height + offsets.bottom;
	    }
	  } else {
	    top = offsets.top;
	  }
	  if (sideB === 'right') {
	    if (offsetParent.nodeName === 'HTML') {
	      left = -offsetParent.clientWidth + offsets.right;
	    } else {
	      left = -offsetParentRect.width + offsets.right;
	    }
	  } else {
	    left = offsets.left;
	  }
	  if (gpuAcceleration && prefixedProperty) {
	    styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
	    styles[sideA] = 0;
	    styles[sideB] = 0;
	    styles.willChange = 'transform';
	  } else {
	    // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
	    var invertTop = sideA === 'bottom' ? -1 : 1;
	    var invertLeft = sideB === 'right' ? -1 : 1;
	    styles[sideA] = top * invertTop;
	    styles[sideB] = left * invertLeft;
	    styles.willChange = sideA + ', ' + sideB;
	  }

	  // Attributes
	  var attributes = {
	    'x-placement': data.placement
	  };

	  // Update `data` attributes, styles and arrowStyles
	  data.attributes = _extends({}, attributes, data.attributes);
	  data.styles = _extends({}, styles, data.styles);
	  data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

	  return data;
	}

	/**
	 * Helper used to know if the given modifier depends from another one.<br />
	 * It checks if the needed modifier is listed and enabled.
	 * @method
	 * @memberof Popper.Utils
	 * @param {Array} modifiers - list of modifiers
	 * @param {String} requestingName - name of requesting modifier
	 * @param {String} requestedName - name of requested modifier
	 * @returns {Boolean}
	 */
	function isModifierRequired(modifiers, requestingName, requestedName) {
	  var requesting = find(modifiers, function (_ref) {
	    var name = _ref.name;
	    return name === requestingName;
	  });

	  var isRequired = !!requesting && modifiers.some(function (modifier) {
	    return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
	  });

	  if (!isRequired) {
	    var _requesting = '`' + requestingName + '`';
	    var requested = '`' + requestedName + '`';
	    console.warn(requested + ' modifier is required by ' + _requesting + ' modifier in order to work, be sure to include it before ' + _requesting + '!');
	  }
	  return isRequired;
	}

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by update method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function arrow(data, options) {
	  var _data$offsets$arrow;

	  // arrow depends on keepTogether in order to work
	  if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
	    return data;
	  }

	  var arrowElement = options.element;

	  // if arrowElement is a string, suppose it's a CSS selector
	  if (typeof arrowElement === 'string') {
	    arrowElement = data.instance.popper.querySelector(arrowElement);

	    // if arrowElement is not found, don't run the modifier
	    if (!arrowElement) {
	      return data;
	    }
	  } else {
	    // if the arrowElement isn't a query selector we must check that the
	    // provided DOM node is child of its popper node
	    if (!data.instance.popper.contains(arrowElement)) {
	      console.warn('WARNING: `arrow.element` must be child of its popper element!');
	      return data;
	    }
	  }

	  var placement = data.placement.split('-')[0];
	  var _data$offsets = data.offsets,
	      popper = _data$offsets.popper,
	      reference = _data$offsets.reference;

	  var isVertical = ['left', 'right'].indexOf(placement) !== -1;

	  var len = isVertical ? 'height' : 'width';
	  var sideCapitalized = isVertical ? 'Top' : 'Left';
	  var side = sideCapitalized.toLowerCase();
	  var altSide = isVertical ? 'left' : 'top';
	  var opSide = isVertical ? 'bottom' : 'right';
	  var arrowElementSize = getOuterSizes(arrowElement)[len];

	  //
	  // extends keepTogether behavior making sure the popper and its
	  // reference have enough pixels in conjunction
	  //

	  // top/left side
	  if (reference[opSide] - arrowElementSize < popper[side]) {
	    data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
	  }
	  // bottom/right side
	  if (reference[side] + arrowElementSize > popper[opSide]) {
	    data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
	  }
	  data.offsets.popper = getClientRect(data.offsets.popper);

	  // compute center of the popper
	  var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

	  // Compute the sideValue using the updated popper offsets
	  // take popper margin in account because we don't have this info available
	  var css = getStyleComputedProperty(data.instance.popper);
	  var popperMarginSide = parseFloat(css['margin' + sideCapitalized]);
	  var popperBorderSide = parseFloat(css['border' + sideCapitalized + 'Width']);
	  var sideValue = center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;

	  // prevent arrowElement from being placed not contiguously to its popper
	  sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);

	  data.arrowElement = arrowElement;
	  data.offsets.arrow = (_data$offsets$arrow = {}, defineProperty(_data$offsets$arrow, side, Math.round(sideValue)), defineProperty(_data$offsets$arrow, altSide, ''), _data$offsets$arrow);

	  return data;
	}

	/**
	 * Get the opposite placement variation of the given one
	 * @method
	 * @memberof Popper.Utils
	 * @argument {String} placement variation
	 * @returns {String} flipped placement variation
	 */
	function getOppositeVariation(variation) {
	  if (variation === 'end') {
	    return 'start';
	  } else if (variation === 'start') {
	    return 'end';
	  }
	  return variation;
	}

	/**
	 * List of accepted placements to use as values of the `placement` option.<br />
	 * Valid placements are:
	 * - `auto`
	 * - `top`
	 * - `right`
	 * - `bottom`
	 * - `left`
	 *
	 * Each placement can have a variation from this list:
	 * - `-start`
	 * - `-end`
	 *
	 * Variations are interpreted easily if you think of them as the left to right
	 * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
	 * is right.<br />
	 * Vertically (`left` and `right`), `start` is top and `end` is bottom.
	 *
	 * Some valid examples are:
	 * - `top-end` (on top of reference, right aligned)
	 * - `right-start` (on right of reference, top aligned)
	 * - `bottom` (on bottom, centered)
	 * - `auto-end` (on the side with more space available, alignment depends by placement)
	 *
	 * @static
	 * @type {Array}
	 * @enum {String}
	 * @readonly
	 * @method placements
	 * @memberof Popper
	 */
	var placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

	// Get rid of `auto` `auto-start` and `auto-end`
	var validPlacements = placements.slice(3);

	/**
	 * Given an initial placement, returns all the subsequent placements
	 * clockwise (or counter-clockwise).
	 *
	 * @method
	 * @memberof Popper.Utils
	 * @argument {String} placement - A valid placement (it accepts variations)
	 * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
	 * @returns {Array} placements including their variations
	 */
	function clockwise(placement) {
	  var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	  var index = validPlacements.indexOf(placement);
	  var arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
	  return counter ? arr.reverse() : arr;
	}

	var BEHAVIORS = {
	  FLIP: 'flip',
	  CLOCKWISE: 'clockwise',
	  COUNTERCLOCKWISE: 'counterclockwise'
	};

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by update method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function flip(data, options) {
	  // if `inner` modifier is enabled, we can't use the `flip` modifier
	  if (isModifierEnabled(data.instance.modifiers, 'inner')) {
	    return data;
	  }

	  if (data.flipped && data.placement === data.originalPlacement) {
	    // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
	    return data;
	  }

	  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement, data.positionFixed);

	  var placement = data.placement.split('-')[0];
	  var placementOpposite = getOppositePlacement(placement);
	  var variation = data.placement.split('-')[1] || '';

	  var flipOrder = [];

	  switch (options.behavior) {
	    case BEHAVIORS.FLIP:
	      flipOrder = [placement, placementOpposite];
	      break;
	    case BEHAVIORS.CLOCKWISE:
	      flipOrder = clockwise(placement);
	      break;
	    case BEHAVIORS.COUNTERCLOCKWISE:
	      flipOrder = clockwise(placement, true);
	      break;
	    default:
	      flipOrder = options.behavior;
	  }

	  flipOrder.forEach(function (step, index) {
	    if (placement !== step || flipOrder.length === index + 1) {
	      return data;
	    }

	    placement = data.placement.split('-')[0];
	    placementOpposite = getOppositePlacement(placement);

	    var popperOffsets = data.offsets.popper;
	    var refOffsets = data.offsets.reference;

	    // using floor because the reference offsets may contain decimals we are not going to consider here
	    var floor = Math.floor;
	    var overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);

	    var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
	    var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
	    var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
	    var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);

	    var overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;

	    // flip the variation if required
	    var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;

	    // flips variation if reference element overflows boundaries
	    var flippedVariationByRef = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);

	    // flips variation if popper content overflows boundaries
	    var flippedVariationByContent = !!options.flipVariationsByContent && (isVertical && variation === 'start' && overflowsRight || isVertical && variation === 'end' && overflowsLeft || !isVertical && variation === 'start' && overflowsBottom || !isVertical && variation === 'end' && overflowsTop);

	    var flippedVariation = flippedVariationByRef || flippedVariationByContent;

	    if (overlapsRef || overflowsBoundaries || flippedVariation) {
	      // this boolean to detect any flip loop
	      data.flipped = true;

	      if (overlapsRef || overflowsBoundaries) {
	        placement = flipOrder[index + 1];
	      }

	      if (flippedVariation) {
	        variation = getOppositeVariation(variation);
	      }

	      data.placement = placement + (variation ? '-' + variation : '');

	      // this object contains `position`, we want to preserve it along with
	      // any additional property we may add in the future
	      data.offsets.popper = _extends({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));

	      data = runModifiers(data.instance.modifiers, data, 'flip');
	    }
	  });
	  return data;
	}

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by update method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function keepTogether(data) {
	  var _data$offsets = data.offsets,
	      popper = _data$offsets.popper,
	      reference = _data$offsets.reference;

	  var placement = data.placement.split('-')[0];
	  var floor = Math.floor;
	  var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
	  var side = isVertical ? 'right' : 'bottom';
	  var opSide = isVertical ? 'left' : 'top';
	  var measurement = isVertical ? 'width' : 'height';

	  if (popper[side] < floor(reference[opSide])) {
	    data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
	  }
	  if (popper[opSide] > floor(reference[side])) {
	    data.offsets.popper[opSide] = floor(reference[side]);
	  }

	  return data;
	}

	/**
	 * Converts a string containing value + unit into a px value number
	 * @function
	 * @memberof {modifiers~offset}
	 * @private
	 * @argument {String} str - Value + unit string
	 * @argument {String} measurement - `height` or `width`
	 * @argument {Object} popperOffsets
	 * @argument {Object} referenceOffsets
	 * @returns {Number|String}
	 * Value in pixels, or original string if no values were extracted
	 */
	function toValue(str, measurement, popperOffsets, referenceOffsets) {
	  // separate value from unit
	  var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
	  var value = +split[1];
	  var unit = split[2];

	  // If it's not a number it's an operator, I guess
	  if (!value) {
	    return str;
	  }

	  if (unit.indexOf('%') === 0) {
	    var element = void 0;
	    switch (unit) {
	      case '%p':
	        element = popperOffsets;
	        break;
	      case '%':
	      case '%r':
	      default:
	        element = referenceOffsets;
	    }

	    var rect = getClientRect(element);
	    return rect[measurement] / 100 * value;
	  } else if (unit === 'vh' || unit === 'vw') {
	    // if is a vh or vw, we calculate the size based on the viewport
	    var size = void 0;
	    if (unit === 'vh') {
	      size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	    } else {
	      size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	    }
	    return size / 100 * value;
	  } else {
	    // if is an explicit pixel unit, we get rid of the unit and keep the value
	    // if is an implicit unit, it's px, and we return just the value
	    return value;
	  }
	}

	/**
	 * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
	 * @function
	 * @memberof {modifiers~offset}
	 * @private
	 * @argument {String} offset
	 * @argument {Object} popperOffsets
	 * @argument {Object} referenceOffsets
	 * @argument {String} basePlacement
	 * @returns {Array} a two cells array with x and y offsets in numbers
	 */
	function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
	  var offsets = [0, 0];

	  // Use height if placement is left or right and index is 0 otherwise use width
	  // in this way the first offset will use an axis and the second one
	  // will use the other one
	  var useHeight = ['right', 'left'].indexOf(basePlacement) !== -1;

	  // Split the offset string to obtain a list of values and operands
	  // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
	  var fragments = offset.split(/(\+|\-)/).map(function (frag) {
	    return frag.trim();
	  });

	  // Detect if the offset string contains a pair of values or a single one
	  // they could be separated by comma or space
	  var divider = fragments.indexOf(find(fragments, function (frag) {
	    return frag.search(/,|\s/) !== -1;
	  }));

	  if (fragments[divider] && fragments[divider].indexOf(',') === -1) {
	    console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
	  }

	  // If divider is found, we divide the list of values and operands to divide
	  // them by ofset X and Y.
	  var splitRegex = /\s*,\s*|\s+/;
	  var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];

	  // Convert the values with units to absolute pixels to allow our computations
	  ops = ops.map(function (op, index) {
	    // Most of the units rely on the orientation of the popper
	    var measurement = (index === 1 ? !useHeight : useHeight) ? 'height' : 'width';
	    var mergeWithPrevious = false;
	    return op
	    // This aggregates any `+` or `-` sign that aren't considered operators
	    // e.g.: 10 + +5 => [10, +, +5]
	    .reduce(function (a, b) {
	      if (a[a.length - 1] === '' && ['+', '-'].indexOf(b) !== -1) {
	        a[a.length - 1] = b;
	        mergeWithPrevious = true;
	        return a;
	      } else if (mergeWithPrevious) {
	        a[a.length - 1] += b;
	        mergeWithPrevious = false;
	        return a;
	      } else {
	        return a.concat(b);
	      }
	    }, [])
	    // Here we convert the string values into number values (in px)
	    .map(function (str) {
	      return toValue(str, measurement, popperOffsets, referenceOffsets);
	    });
	  });

	  // Loop trough the offsets arrays and execute the operations
	  ops.forEach(function (op, index) {
	    op.forEach(function (frag, index2) {
	      if (isNumeric(frag)) {
	        offsets[index] += frag * (op[index2 - 1] === '-' ? -1 : 1);
	      }
	    });
	  });
	  return offsets;
	}

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by update method
	 * @argument {Object} options - Modifiers configuration and options
	 * @argument {Number|String} options.offset=0
	 * The offset value as described in the modifier description
	 * @returns {Object} The data object, properly modified
	 */
	function offset(data, _ref) {
	  var offset = _ref.offset;
	  var placement = data.placement,
	      _data$offsets = data.offsets,
	      popper = _data$offsets.popper,
	      reference = _data$offsets.reference;

	  var basePlacement = placement.split('-')[0];

	  var offsets = void 0;
	  if (isNumeric(+offset)) {
	    offsets = [+offset, 0];
	  } else {
	    offsets = parseOffset(offset, popper, reference, basePlacement);
	  }

	  if (basePlacement === 'left') {
	    popper.top += offsets[0];
	    popper.left -= offsets[1];
	  } else if (basePlacement === 'right') {
	    popper.top += offsets[0];
	    popper.left += offsets[1];
	  } else if (basePlacement === 'top') {
	    popper.left += offsets[0];
	    popper.top -= offsets[1];
	  } else if (basePlacement === 'bottom') {
	    popper.left += offsets[0];
	    popper.top += offsets[1];
	  }

	  data.popper = popper;
	  return data;
	}

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by `update` method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function preventOverflow(data, options) {
	  var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);

	  // If offsetParent is the reference element, we really want to
	  // go one step up and use the next offsetParent as reference to
	  // avoid to make this modifier completely useless and look like broken
	  if (data.instance.reference === boundariesElement) {
	    boundariesElement = getOffsetParent(boundariesElement);
	  }

	  // NOTE: DOM access here
	  // resets the popper's position so that the document size can be calculated excluding
	  // the size of the popper element itself
	  var transformProp = getSupportedPropertyName('transform');
	  var popperStyles = data.instance.popper.style; // assignment to help minification
	  var top = popperStyles.top,
	      left = popperStyles.left,
	      transform = popperStyles[transformProp];

	  popperStyles.top = '';
	  popperStyles.left = '';
	  popperStyles[transformProp] = '';

	  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement, data.positionFixed);

	  // NOTE: DOM access here
	  // restores the original style properties after the offsets have been computed
	  popperStyles.top = top;
	  popperStyles.left = left;
	  popperStyles[transformProp] = transform;

	  options.boundaries = boundaries;

	  var order = options.priority;
	  var popper = data.offsets.popper;

	  var check = {
	    primary: function primary(placement) {
	      var value = popper[placement];
	      if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
	        value = Math.max(popper[placement], boundaries[placement]);
	      }
	      return defineProperty({}, placement, value);
	    },
	    secondary: function secondary(placement) {
	      var mainSide = placement === 'right' ? 'left' : 'top';
	      var value = popper[mainSide];
	      if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
	        value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
	      }
	      return defineProperty({}, mainSide, value);
	    }
	  };

	  order.forEach(function (placement) {
	    var side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
	    popper = _extends({}, popper, check[side](placement));
	  });

	  data.offsets.popper = popper;

	  return data;
	}

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by `update` method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function shift(data) {
	  var placement = data.placement;
	  var basePlacement = placement.split('-')[0];
	  var shiftvariation = placement.split('-')[1];

	  // if shift shiftvariation is specified, run the modifier
	  if (shiftvariation) {
	    var _data$offsets = data.offsets,
	        reference = _data$offsets.reference,
	        popper = _data$offsets.popper;

	    var isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
	    var side = isVertical ? 'left' : 'top';
	    var measurement = isVertical ? 'width' : 'height';

	    var shiftOffsets = {
	      start: defineProperty({}, side, reference[side]),
	      end: defineProperty({}, side, reference[side] + reference[measurement] - popper[measurement])
	    };

	    data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
	  }

	  return data;
	}

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by update method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function hide(data) {
	  if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
	    return data;
	  }

	  var refRect = data.offsets.reference;
	  var bound = find(data.instance.modifiers, function (modifier) {
	    return modifier.name === 'preventOverflow';
	  }).boundaries;

	  if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
	    // Avoid unnecessary DOM access if visibility hasn't changed
	    if (data.hide === true) {
	      return data;
	    }

	    data.hide = true;
	    data.attributes['x-out-of-boundaries'] = '';
	  } else {
	    // Avoid unnecessary DOM access if visibility hasn't changed
	    if (data.hide === false) {
	      return data;
	    }

	    data.hide = false;
	    data.attributes['x-out-of-boundaries'] = false;
	  }

	  return data;
	}

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by `update` method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function inner(data) {
	  var placement = data.placement;
	  var basePlacement = placement.split('-')[0];
	  var _data$offsets = data.offsets,
	      popper = _data$offsets.popper,
	      reference = _data$offsets.reference;

	  var isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;

	  var subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;

	  popper[isHoriz ? 'left' : 'top'] = reference[basePlacement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);

	  data.placement = getOppositePlacement(placement);
	  data.offsets.popper = getClientRect(popper);

	  return data;
	}

	/**
	 * Modifier function, each modifier can have a function of this type assigned
	 * to its `fn` property.<br />
	 * These functions will be called on each update, this means that you must
	 * make sure they are performant enough to avoid performance bottlenecks.
	 *
	 * @function ModifierFn
	 * @argument {dataObject} data - The data object generated by `update` method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {dataObject} The data object, properly modified
	 */

	/**
	 * Modifiers are plugins used to alter the behavior of your poppers.<br />
	 * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
	 * needed by the library.
	 *
	 * Usually you don't want to override the `order`, `fn` and `onLoad` props.
	 * All the other properties are configurations that could be tweaked.
	 * @namespace modifiers
	 */
	var modifiers = {
	  /**
	   * Modifier used to shift the popper on the start or end of its reference
	   * element.<br />
	   * It will read the variation of the `placement` property.<br />
	   * It can be one either `-end` or `-start`.
	   * @memberof modifiers
	   * @inner
	   */
	  shift: {
	    /** @prop {number} order=100 - Index used to define the order of execution */
	    order: 100,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: shift
	  },

	  /**
	   * The `offset` modifier can shift your popper on both its axis.
	   *
	   * It accepts the following units:
	   * - `px` or unit-less, interpreted as pixels
	   * - `%` or `%r`, percentage relative to the length of the reference element
	   * - `%p`, percentage relative to the length of the popper element
	   * - `vw`, CSS viewport width unit
	   * - `vh`, CSS viewport height unit
	   *
	   * For length is intended the main axis relative to the placement of the popper.<br />
	   * This means that if the placement is `top` or `bottom`, the length will be the
	   * `width`. In case of `left` or `right`, it will be the `height`.
	   *
	   * You can provide a single value (as `Number` or `String`), or a pair of values
	   * as `String` divided by a comma or one (or more) white spaces.<br />
	   * The latter is a deprecated method because it leads to confusion and will be
	   * removed in v2.<br />
	   * Additionally, it accepts additions and subtractions between different units.
	   * Note that multiplications and divisions aren't supported.
	   *
	   * Valid examples are:
	   * ```
	   * 10
	   * '10%'
	   * '10, 10'
	   * '10%, 10'
	   * '10 + 10%'
	   * '10 - 5vh + 3%'
	   * '-10px + 5vh, 5px - 6%'
	   * ```
	   * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
	   * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
	   * > You can read more on this at this [issue](https://github.com/FezVrasta/popper.js/issues/373).
	   *
	   * @memberof modifiers
	   * @inner
	   */
	  offset: {
	    /** @prop {number} order=200 - Index used to define the order of execution */
	    order: 200,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: offset,
	    /** @prop {Number|String} offset=0
	     * The offset value as described in the modifier description
	     */
	    offset: 0
	  },

	  /**
	   * Modifier used to prevent the popper from being positioned outside the boundary.
	   *
	   * A scenario exists where the reference itself is not within the boundaries.<br />
	   * We can say it has "escaped the boundaries" — or just "escaped".<br />
	   * In this case we need to decide whether the popper should either:
	   *
	   * - detach from the reference and remain "trapped" in the boundaries, or
	   * - if it should ignore the boundary and "escape with its reference"
	   *
	   * When `escapeWithReference` is set to`true` and reference is completely
	   * outside its boundaries, the popper will overflow (or completely leave)
	   * the boundaries in order to remain attached to the edge of the reference.
	   *
	   * @memberof modifiers
	   * @inner
	   */
	  preventOverflow: {
	    /** @prop {number} order=300 - Index used to define the order of execution */
	    order: 300,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: preventOverflow,
	    /**
	     * @prop {Array} [priority=['left','right','top','bottom']]
	     * Popper will try to prevent overflow following these priorities by default,
	     * then, it could overflow on the left and on top of the `boundariesElement`
	     */
	    priority: ['left', 'right', 'top', 'bottom'],
	    /**
	     * @prop {number} padding=5
	     * Amount of pixel used to define a minimum distance between the boundaries
	     * and the popper. This makes sure the popper always has a little padding
	     * between the edges of its container
	     */
	    padding: 5,
	    /**
	     * @prop {String|HTMLElement} boundariesElement='scrollParent'
	     * Boundaries used by the modifier. Can be `scrollParent`, `window`,
	     * `viewport` or any DOM element.
	     */
	    boundariesElement: 'scrollParent'
	  },

	  /**
	   * Modifier used to make sure the reference and its popper stay near each other
	   * without leaving any gap between the two. Especially useful when the arrow is
	   * enabled and you want to ensure that it points to its reference element.
	   * It cares only about the first axis. You can still have poppers with margin
	   * between the popper and its reference element.
	   * @memberof modifiers
	   * @inner
	   */
	  keepTogether: {
	    /** @prop {number} order=400 - Index used to define the order of execution */
	    order: 400,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: keepTogether
	  },

	  /**
	   * This modifier is used to move the `arrowElement` of the popper to make
	   * sure it is positioned between the reference element and its popper element.
	   * It will read the outer size of the `arrowElement` node to detect how many
	   * pixels of conjunction are needed.
	   *
	   * It has no effect if no `arrowElement` is provided.
	   * @memberof modifiers
	   * @inner
	   */
	  arrow: {
	    /** @prop {number} order=500 - Index used to define the order of execution */
	    order: 500,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: arrow,
	    /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
	    element: '[x-arrow]'
	  },

	  /**
	   * Modifier used to flip the popper's placement when it starts to overlap its
	   * reference element.
	   *
	   * Requires the `preventOverflow` modifier before it in order to work.
	   *
	   * **NOTE:** this modifier will interrupt the current update cycle and will
	   * restart it if it detects the need to flip the placement.
	   * @memberof modifiers
	   * @inner
	   */
	  flip: {
	    /** @prop {number} order=600 - Index used to define the order of execution */
	    order: 600,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: flip,
	    /**
	     * @prop {String|Array} behavior='flip'
	     * The behavior used to change the popper's placement. It can be one of
	     * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
	     * placements (with optional variations)
	     */
	    behavior: 'flip',
	    /**
	     * @prop {number} padding=5
	     * The popper will flip if it hits the edges of the `boundariesElement`
	     */
	    padding: 5,
	    /**
	     * @prop {String|HTMLElement} boundariesElement='viewport'
	     * The element which will define the boundaries of the popper position.
	     * The popper will never be placed outside of the defined boundaries
	     * (except if `keepTogether` is enabled)
	     */
	    boundariesElement: 'viewport',
	    /**
	     * @prop {Boolean} flipVariations=false
	     * The popper will switch placement variation between `-start` and `-end` when
	     * the reference element overlaps its boundaries.
	     *
	     * The original placement should have a set variation.
	     */
	    flipVariations: false,
	    /**
	     * @prop {Boolean} flipVariationsByContent=false
	     * The popper will switch placement variation between `-start` and `-end` when
	     * the popper element overlaps its reference boundaries.
	     *
	     * The original placement should have a set variation.
	     */
	    flipVariationsByContent: false
	  },

	  /**
	   * Modifier used to make the popper flow toward the inner of the reference element.
	   * By default, when this modifier is disabled, the popper will be placed outside
	   * the reference element.
	   * @memberof modifiers
	   * @inner
	   */
	  inner: {
	    /** @prop {number} order=700 - Index used to define the order of execution */
	    order: 700,
	    /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
	    enabled: false,
	    /** @prop {ModifierFn} */
	    fn: inner
	  },

	  /**
	   * Modifier used to hide the popper when its reference element is outside of the
	   * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
	   * be used to hide with a CSS selector the popper when its reference is
	   * out of boundaries.
	   *
	   * Requires the `preventOverflow` modifier before it in order to work.
	   * @memberof modifiers
	   * @inner
	   */
	  hide: {
	    /** @prop {number} order=800 - Index used to define the order of execution */
	    order: 800,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: hide
	  },

	  /**
	   * Computes the style that will be applied to the popper element to gets
	   * properly positioned.
	   *
	   * Note that this modifier will not touch the DOM, it just prepares the styles
	   * so that `applyStyle` modifier can apply it. This separation is useful
	   * in case you need to replace `applyStyle` with a custom implementation.
	   *
	   * This modifier has `850` as `order` value to maintain backward compatibility
	   * with previous versions of Popper.js. Expect the modifiers ordering method
	   * to change in future major versions of the library.
	   *
	   * @memberof modifiers
	   * @inner
	   */
	  computeStyle: {
	    /** @prop {number} order=850 - Index used to define the order of execution */
	    order: 850,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: computeStyle,
	    /**
	     * @prop {Boolean} gpuAcceleration=true
	     * If true, it uses the CSS 3D transformation to position the popper.
	     * Otherwise, it will use the `top` and `left` properties
	     */
	    gpuAcceleration: true,
	    /**
	     * @prop {string} [x='bottom']
	     * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
	     * Change this if your popper should grow in a direction different from `bottom`
	     */
	    x: 'bottom',
	    /**
	     * @prop {string} [x='left']
	     * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
	     * Change this if your popper should grow in a direction different from `right`
	     */
	    y: 'right'
	  },

	  /**
	   * Applies the computed styles to the popper element.
	   *
	   * All the DOM manipulations are limited to this modifier. This is useful in case
	   * you want to integrate Popper.js inside a framework or view library and you
	   * want to delegate all the DOM manipulations to it.
	   *
	   * Note that if you disable this modifier, you must make sure the popper element
	   * has its position set to `absolute` before Popper.js can do its work!
	   *
	   * Just disable this modifier and define your own to achieve the desired effect.
	   *
	   * @memberof modifiers
	   * @inner
	   */
	  applyStyle: {
	    /** @prop {number} order=900 - Index used to define the order of execution */
	    order: 900,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: applyStyle,
	    /** @prop {Function} */
	    onLoad: applyStyleOnLoad,
	    /**
	     * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
	     * @prop {Boolean} gpuAcceleration=true
	     * If true, it uses the CSS 3D transformation to position the popper.
	     * Otherwise, it will use the `top` and `left` properties
	     */
	    gpuAcceleration: undefined
	  }
	};

	/**
	 * The `dataObject` is an object containing all the information used by Popper.js.
	 * This object is passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
	 * @name dataObject
	 * @property {Object} data.instance The Popper.js instance
	 * @property {String} data.placement Placement applied to popper
	 * @property {String} data.originalPlacement Placement originally defined on init
	 * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
	 * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper
	 * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
	 * @property {Object} data.styles Any CSS property defined here will be applied to the popper. It expects the JavaScript nomenclature (eg. `marginBottom`)
	 * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow. It expects the JavaScript nomenclature (eg. `marginBottom`)
	 * @property {Object} data.boundaries Offsets of the popper boundaries
	 * @property {Object} data.offsets The measurements of popper, reference and arrow elements
	 * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
	 * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
	 * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
	 */

	/**
	 * Default options provided to Popper.js constructor.<br />
	 * These can be overridden using the `options` argument of Popper.js.<br />
	 * To override an option, simply pass an object with the same
	 * structure of the `options` object, as the 3rd argument. For example:
	 * ```
	 * new Popper(ref, pop, {
	 *   modifiers: {
	 *     preventOverflow: { enabled: false }
	 *   }
	 * })
	 * ```
	 * @type {Object}
	 * @static
	 * @memberof Popper
	 */
	var Defaults = {
	  /**
	   * Popper's placement.
	   * @prop {Popper.placements} placement='bottom'
	   */
	  placement: 'bottom',

	  /**
	   * Set this to true if you want popper to position it self in 'fixed' mode
	   * @prop {Boolean} positionFixed=false
	   */
	  positionFixed: false,

	  /**
	   * Whether events (resize, scroll) are initially enabled.
	   * @prop {Boolean} eventsEnabled=true
	   */
	  eventsEnabled: true,

	  /**
	   * Set to true if you want to automatically remove the popper when
	   * you call the `destroy` method.
	   * @prop {Boolean} removeOnDestroy=false
	   */
	  removeOnDestroy: false,

	  /**
	   * Callback called when the popper is created.<br />
	   * By default, it is set to no-op.<br />
	   * Access Popper.js instance with `data.instance`.
	   * @prop {onCreate}
	   */
	  onCreate: function onCreate() {},

	  /**
	   * Callback called when the popper is updated. This callback is not called
	   * on the initialization/creation of the popper, but only on subsequent
	   * updates.<br />
	   * By default, it is set to no-op.<br />
	   * Access Popper.js instance with `data.instance`.
	   * @prop {onUpdate}
	   */
	  onUpdate: function onUpdate() {},

	  /**
	   * List of modifiers used to modify the offsets before they are applied to the popper.
	   * They provide most of the functionalities of Popper.js.
	   * @prop {modifiers}
	   */
	  modifiers: modifiers
	};

	/**
	 * @callback onCreate
	 * @param {dataObject} data
	 */

	/**
	 * @callback onUpdate
	 * @param {dataObject} data
	 */

	// Utils
	// Methods
	var Popper = function () {
	  /**
	   * Creates a new Popper.js instance.
	   * @class Popper
	   * @param {Element|referenceObject} reference - The reference element used to position the popper
	   * @param {Element} popper - The HTML / XML element used as the popper
	   * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
	   * @return {Object} instance - The generated Popper.js instance
	   */
	  function Popper(reference, popper) {
	    var _this = this;

	    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	    classCallCheck(this, Popper);

	    this.scheduleUpdate = function () {
	      return requestAnimationFrame(_this.update);
	    };

	    // make update() debounced, so that it only runs at most once-per-tick
	    this.update = debounce(this.update.bind(this));

	    // with {} we create a new object with the options inside it
	    this.options = _extends({}, Popper.Defaults, options);

	    // init state
	    this.state = {
	      isDestroyed: false,
	      isCreated: false,
	      scrollParents: []
	    };

	    // get reference and popper elements (allow jQuery wrappers)
	    this.reference = reference && reference.jquery ? reference[0] : reference;
	    this.popper = popper && popper.jquery ? popper[0] : popper;

	    // Deep merge modifiers options
	    this.options.modifiers = {};
	    Object.keys(_extends({}, Popper.Defaults.modifiers, options.modifiers)).forEach(function (name) {
	      _this.options.modifiers[name] = _extends({}, Popper.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
	    });

	    // Refactoring modifiers' list (Object => Array)
	    this.modifiers = Object.keys(this.options.modifiers).map(function (name) {
	      return _extends({
	        name: name
	      }, _this.options.modifiers[name]);
	    })
	    // sort the modifiers by order
	    .sort(function (a, b) {
	      return a.order - b.order;
	    });

	    // modifiers have the ability to execute arbitrary code when Popper.js get inited
	    // such code is executed in the same order of its modifier
	    // they could add new properties to their options configuration
	    // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
	    this.modifiers.forEach(function (modifierOptions) {
	      if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
	        modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
	      }
	    });

	    // fire the first update to position the popper in the right place
	    this.update();

	    var eventsEnabled = this.options.eventsEnabled;
	    if (eventsEnabled) {
	      // setup event listeners, they will take care of update the position in specific situations
	      this.enableEventListeners();
	    }

	    this.state.eventsEnabled = eventsEnabled;
	  }

	  // We can't use class properties because they don't get listed in the
	  // class prototype and break stuff like Sinon stubs


	  createClass(Popper, [{
	    key: 'update',
	    value: function update$$1() {
	      return update.call(this);
	    }
	  }, {
	    key: 'destroy',
	    value: function destroy$$1() {
	      return destroy.call(this);
	    }
	  }, {
	    key: 'enableEventListeners',
	    value: function enableEventListeners$$1() {
	      return enableEventListeners.call(this);
	    }
	  }, {
	    key: 'disableEventListeners',
	    value: function disableEventListeners$$1() {
	      return disableEventListeners.call(this);
	    }

	    /**
	     * Schedules an update. It will run on the next UI update available.
	     * @method scheduleUpdate
	     * @memberof Popper
	     */


	    /**
	     * Collection of utilities useful when writing custom modifiers.
	     * Starting from version 1.7, this method is available only if you
	     * include `popper-utils.js` before `popper.js`.
	     *
	     * **DEPRECATION**: This way to access PopperUtils is deprecated
	     * and will be removed in v2! Use the PopperUtils module directly instead.
	     * Due to the high instability of the methods contained in Utils, we can't
	     * guarantee them to follow semver. Use them at your own risk!
	     * @static
	     * @private
	     * @type {Object}
	     * @deprecated since version 1.8
	     * @member Utils
	     * @memberof Popper
	     */

	  }]);
	  return Popper;
	}();

	/**
	 * The `referenceObject` is an object that provides an interface compatible with Popper.js
	 * and lets you use it as replacement of a real DOM node.<br />
	 * You can use this method to position a popper relatively to a set of coordinates
	 * in case you don't have a DOM node to use as reference.
	 *
	 * ```
	 * new Popper(referenceObject, popperNode);
	 * ```
	 *
	 * NB: This feature isn't supported in Internet Explorer 10.
	 * @name referenceObject
	 * @property {Function} data.getBoundingClientRect
	 * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
	 * @property {number} data.clientWidth
	 * An ES6 getter that will return the width of the virtual reference element.
	 * @property {number} data.clientHeight
	 * An ES6 getter that will return the height of the virtual reference element.
	 */


	Popper.Utils = (typeof window !== 'undefined' ? window : global).PopperUtils;
	Popper.placements = placements;
	Popper.Defaults = Defaults;

	var bootstrap = createCommonjsModule(function (module, exports) {
	/*!
	  * Bootstrap v4.5.3 (https://getbootstrap.com/)
	  * Copyright 2011-2020 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
	  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	  */
	(function (global, factory) {
	   factory(exports, jquery, Popper) ;
	}(commonjsGlobal, (function (exports, $, Popper) {
	  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	  var $__default = /*#__PURE__*/_interopDefaultLegacy($);
	  var Popper__default = /*#__PURE__*/_interopDefaultLegacy(Popper);

	  function _defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  function _createClass(Constructor, protoProps, staticProps) {
	    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) _defineProperties(Constructor, staticProps);
	    return Constructor;
	  }

	  function _extends() {
	    _extends = Object.assign || function (target) {
	      for (var i = 1; i < arguments.length; i++) {
	        var source = arguments[i];

	        for (var key in source) {
	          if (Object.prototype.hasOwnProperty.call(source, key)) {
	            target[key] = source[key];
	          }
	        }
	      }

	      return target;
	    };

	    return _extends.apply(this, arguments);
	  }

	  function _inheritsLoose(subClass, superClass) {
	    subClass.prototype = Object.create(superClass.prototype);
	    subClass.prototype.constructor = subClass;
	    subClass.__proto__ = superClass;
	  }

	  /**
	   * --------------------------------------------------------------------------
	   * Bootstrap (v4.5.3): util.js
	   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	   * --------------------------------------------------------------------------
	   */
	  /**
	   * ------------------------------------------------------------------------
	   * Private TransitionEnd Helpers
	   * ------------------------------------------------------------------------
	   */

	  var TRANSITION_END = 'transitionend';
	  var MAX_UID = 1000000;
	  var MILLISECONDS_MULTIPLIER = 1000; // Shoutout AngusCroll (https://goo.gl/pxwQGp)

	  function toType(obj) {
	    if (obj === null || typeof obj === 'undefined') {
	      return "" + obj;
	    }

	    return {}.toString.call(obj).match(/\s([a-z]+)/i)[1].toLowerCase();
	  }

	  function getSpecialTransitionEndEvent() {
	    return {
	      bindType: TRANSITION_END,
	      delegateType: TRANSITION_END,
	      handle: function handle(event) {
	        if ($__default['default'](event.target).is(this)) {
	          return event.handleObj.handler.apply(this, arguments); // eslint-disable-line prefer-rest-params
	        }

	        return undefined;
	      }
	    };
	  }

	  function transitionEndEmulator(duration) {
	    var _this = this;

	    var called = false;
	    $__default['default'](this).one(Util.TRANSITION_END, function () {
	      called = true;
	    });
	    setTimeout(function () {
	      if (!called) {
	        Util.triggerTransitionEnd(_this);
	      }
	    }, duration);
	    return this;
	  }

	  function setTransitionEndSupport() {
	    $__default['default'].fn.emulateTransitionEnd = transitionEndEmulator;
	    $__default['default'].event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
	  }
	  /**
	   * --------------------------------------------------------------------------
	   * Public Util Api
	   * --------------------------------------------------------------------------
	   */


	  var Util = {
	    TRANSITION_END: 'bsTransitionEnd',
	    getUID: function getUID(prefix) {
	      do {
	        prefix += ~~(Math.random() * MAX_UID); // "~~" acts like a faster Math.floor() here
	      } while (document.getElementById(prefix));

	      return prefix;
	    },
	    getSelectorFromElement: function getSelectorFromElement(element) {
	      var selector = element.getAttribute('data-target');

	      if (!selector || selector === '#') {
	        var hrefAttr = element.getAttribute('href');
	        selector = hrefAttr && hrefAttr !== '#' ? hrefAttr.trim() : '';
	      }

	      try {
	        return document.querySelector(selector) ? selector : null;
	      } catch (_) {
	        return null;
	      }
	    },
	    getTransitionDurationFromElement: function getTransitionDurationFromElement(element) {
	      if (!element) {
	        return 0;
	      } // Get transition-duration of the element


	      var transitionDuration = $__default['default'](element).css('transition-duration');
	      var transitionDelay = $__default['default'](element).css('transition-delay');
	      var floatTransitionDuration = parseFloat(transitionDuration);
	      var floatTransitionDelay = parseFloat(transitionDelay); // Return 0 if element or transition duration is not found

	      if (!floatTransitionDuration && !floatTransitionDelay) {
	        return 0;
	      } // If multiple durations are defined, take the first


	      transitionDuration = transitionDuration.split(',')[0];
	      transitionDelay = transitionDelay.split(',')[0];
	      return (parseFloat(transitionDuration) + parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
	    },
	    reflow: function reflow(element) {
	      return element.offsetHeight;
	    },
	    triggerTransitionEnd: function triggerTransitionEnd(element) {
	      $__default['default'](element).trigger(TRANSITION_END);
	    },
	    supportsTransitionEnd: function supportsTransitionEnd() {
	      return Boolean(TRANSITION_END);
	    },
	    isElement: function isElement(obj) {
	      return (obj[0] || obj).nodeType;
	    },
	    typeCheckConfig: function typeCheckConfig(componentName, config, configTypes) {
	      for (var property in configTypes) {
	        if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
	          var expectedTypes = configTypes[property];
	          var value = config[property];
	          var valueType = value && Util.isElement(value) ? 'element' : toType(value);

	          if (!new RegExp(expectedTypes).test(valueType)) {
	            throw new Error(componentName.toUpperCase() + ": " + ("Option \"" + property + "\" provided type \"" + valueType + "\" ") + ("but expected type \"" + expectedTypes + "\"."));
	          }
	        }
	      }
	    },
	    findShadowRoot: function findShadowRoot(element) {
	      if (!document.documentElement.attachShadow) {
	        return null;
	      } // Can find the shadow root otherwise it'll return the document


	      if (typeof element.getRootNode === 'function') {
	        var root = element.getRootNode();
	        return root instanceof ShadowRoot ? root : null;
	      }

	      if (element instanceof ShadowRoot) {
	        return element;
	      } // when we don't find a shadow root


	      if (!element.parentNode) {
	        return null;
	      }

	      return Util.findShadowRoot(element.parentNode);
	    },
	    jQueryDetection: function jQueryDetection() {
	      if (typeof $__default['default'] === 'undefined') {
	        throw new TypeError('Bootstrap\'s JavaScript requires jQuery. jQuery must be included before Bootstrap\'s JavaScript.');
	      }

	      var version = $__default['default'].fn.jquery.split(' ')[0].split('.');
	      var minMajor = 1;
	      var ltMajor = 2;
	      var minMinor = 9;
	      var minPatch = 1;
	      var maxMajor = 4;

	      if (version[0] < ltMajor && version[1] < minMinor || version[0] === minMajor && version[1] === minMinor && version[2] < minPatch || version[0] >= maxMajor) {
	        throw new Error('Bootstrap\'s JavaScript requires at least jQuery v1.9.1 but less than v4.0.0');
	      }
	    }
	  };
	  Util.jQueryDetection();
	  setTransitionEndSupport();

	  /**
	   * ------------------------------------------------------------------------
	   * Constants
	   * ------------------------------------------------------------------------
	   */

	  var NAME = 'alert';
	  var VERSION = '4.5.3';
	  var DATA_KEY = 'bs.alert';
	  var EVENT_KEY = "." + DATA_KEY;
	  var DATA_API_KEY = '.data-api';
	  var JQUERY_NO_CONFLICT = $__default['default'].fn[NAME];
	  var SELECTOR_DISMISS = '[data-dismiss="alert"]';
	  var EVENT_CLOSE = "close" + EVENT_KEY;
	  var EVENT_CLOSED = "closed" + EVENT_KEY;
	  var EVENT_CLICK_DATA_API = "click" + EVENT_KEY + DATA_API_KEY;
	  var CLASS_NAME_ALERT = 'alert';
	  var CLASS_NAME_FADE = 'fade';
	  var CLASS_NAME_SHOW = 'show';
	  /**
	   * ------------------------------------------------------------------------
	   * Class Definition
	   * ------------------------------------------------------------------------
	   */

	  var Alert = /*#__PURE__*/function () {
	    function Alert(element) {
	      this._element = element;
	    } // Getters


	    var _proto = Alert.prototype;

	    // Public
	    _proto.close = function close(element) {
	      var rootElement = this._element;

	      if (element) {
	        rootElement = this._getRootElement(element);
	      }

	      var customEvent = this._triggerCloseEvent(rootElement);

	      if (customEvent.isDefaultPrevented()) {
	        return;
	      }

	      this._removeElement(rootElement);
	    };

	    _proto.dispose = function dispose() {
	      $__default['default'].removeData(this._element, DATA_KEY);
	      this._element = null;
	    } // Private
	    ;

	    _proto._getRootElement = function _getRootElement(element) {
	      var selector = Util.getSelectorFromElement(element);
	      var parent = false;

	      if (selector) {
	        parent = document.querySelector(selector);
	      }

	      if (!parent) {
	        parent = $__default['default'](element).closest("." + CLASS_NAME_ALERT)[0];
	      }

	      return parent;
	    };

	    _proto._triggerCloseEvent = function _triggerCloseEvent(element) {
	      var closeEvent = $__default['default'].Event(EVENT_CLOSE);
	      $__default['default'](element).trigger(closeEvent);
	      return closeEvent;
	    };

	    _proto._removeElement = function _removeElement(element) {
	      var _this = this;

	      $__default['default'](element).removeClass(CLASS_NAME_SHOW);

	      if (!$__default['default'](element).hasClass(CLASS_NAME_FADE)) {
	        this._destroyElement(element);

	        return;
	      }

	      var transitionDuration = Util.getTransitionDurationFromElement(element);
	      $__default['default'](element).one(Util.TRANSITION_END, function (event) {
	        return _this._destroyElement(element, event);
	      }).emulateTransitionEnd(transitionDuration);
	    };

	    _proto._destroyElement = function _destroyElement(element) {
	      $__default['default'](element).detach().trigger(EVENT_CLOSED).remove();
	    } // Static
	    ;

	    Alert._jQueryInterface = function _jQueryInterface(config) {
	      return this.each(function () {
	        var $element = $__default['default'](this);
	        var data = $element.data(DATA_KEY);

	        if (!data) {
	          data = new Alert(this);
	          $element.data(DATA_KEY, data);
	        }

	        if (config === 'close') {
	          data[config](this);
	        }
	      });
	    };

	    Alert._handleDismiss = function _handleDismiss(alertInstance) {
	      return function (event) {
	        if (event) {
	          event.preventDefault();
	        }

	        alertInstance.close(this);
	      };
	    };

	    _createClass(Alert, null, [{
	      key: "VERSION",
	      get: function get() {
	        return VERSION;
	      }
	    }]);

	    return Alert;
	  }();
	  /**
	   * ------------------------------------------------------------------------
	   * Data Api implementation
	   * ------------------------------------------------------------------------
	   */


	  $__default['default'](document).on(EVENT_CLICK_DATA_API, SELECTOR_DISMISS, Alert._handleDismiss(new Alert()));
	  /**
	   * ------------------------------------------------------------------------
	   * jQuery
	   * ------------------------------------------------------------------------
	   */

	  $__default['default'].fn[NAME] = Alert._jQueryInterface;
	  $__default['default'].fn[NAME].Constructor = Alert;

	  $__default['default'].fn[NAME].noConflict = function () {
	    $__default['default'].fn[NAME] = JQUERY_NO_CONFLICT;
	    return Alert._jQueryInterface;
	  };

	  /**
	   * ------------------------------------------------------------------------
	   * Constants
	   * ------------------------------------------------------------------------
	   */

	  var NAME$1 = 'button';
	  var VERSION$1 = '4.5.3';
	  var DATA_KEY$1 = 'bs.button';
	  var EVENT_KEY$1 = "." + DATA_KEY$1;
	  var DATA_API_KEY$1 = '.data-api';
	  var JQUERY_NO_CONFLICT$1 = $__default['default'].fn[NAME$1];
	  var CLASS_NAME_ACTIVE = 'active';
	  var CLASS_NAME_BUTTON = 'btn';
	  var CLASS_NAME_FOCUS = 'focus';
	  var SELECTOR_DATA_TOGGLE_CARROT = '[data-toggle^="button"]';
	  var SELECTOR_DATA_TOGGLES = '[data-toggle="buttons"]';
	  var SELECTOR_DATA_TOGGLE = '[data-toggle="button"]';
	  var SELECTOR_DATA_TOGGLES_BUTTONS = '[data-toggle="buttons"] .btn';
	  var SELECTOR_INPUT = 'input:not([type="hidden"])';
	  var SELECTOR_ACTIVE = '.active';
	  var SELECTOR_BUTTON = '.btn';
	  var EVENT_CLICK_DATA_API$1 = "click" + EVENT_KEY$1 + DATA_API_KEY$1;
	  var EVENT_FOCUS_BLUR_DATA_API = "focus" + EVENT_KEY$1 + DATA_API_KEY$1 + " " + ("blur" + EVENT_KEY$1 + DATA_API_KEY$1);
	  var EVENT_LOAD_DATA_API = "load" + EVENT_KEY$1 + DATA_API_KEY$1;
	  /**
	   * ------------------------------------------------------------------------
	   * Class Definition
	   * ------------------------------------------------------------------------
	   */

	  var Button = /*#__PURE__*/function () {
	    function Button(element) {
	      this._element = element;
	      this.shouldAvoidTriggerChange = false;
	    } // Getters


	    var _proto = Button.prototype;

	    // Public
	    _proto.toggle = function toggle() {
	      var triggerChangeEvent = true;
	      var addAriaPressed = true;
	      var rootElement = $__default['default'](this._element).closest(SELECTOR_DATA_TOGGLES)[0];

	      if (rootElement) {
	        var input = this._element.querySelector(SELECTOR_INPUT);

	        if (input) {
	          if (input.type === 'radio') {
	            if (input.checked && this._element.classList.contains(CLASS_NAME_ACTIVE)) {
	              triggerChangeEvent = false;
	            } else {
	              var activeElement = rootElement.querySelector(SELECTOR_ACTIVE);

	              if (activeElement) {
	                $__default['default'](activeElement).removeClass(CLASS_NAME_ACTIVE);
	              }
	            }
	          }

	          if (triggerChangeEvent) {
	            // if it's not a radio button or checkbox don't add a pointless/invalid checked property to the input
	            if (input.type === 'checkbox' || input.type === 'radio') {
	              input.checked = !this._element.classList.contains(CLASS_NAME_ACTIVE);
	            }

	            if (!this.shouldAvoidTriggerChange) {
	              $__default['default'](input).trigger('change');
	            }
	          }

	          input.focus();
	          addAriaPressed = false;
	        }
	      }

	      if (!(this._element.hasAttribute('disabled') || this._element.classList.contains('disabled'))) {
	        if (addAriaPressed) {
	          this._element.setAttribute('aria-pressed', !this._element.classList.contains(CLASS_NAME_ACTIVE));
	        }

	        if (triggerChangeEvent) {
	          $__default['default'](this._element).toggleClass(CLASS_NAME_ACTIVE);
	        }
	      }
	    };

	    _proto.dispose = function dispose() {
	      $__default['default'].removeData(this._element, DATA_KEY$1);
	      this._element = null;
	    } // Static
	    ;

	    Button._jQueryInterface = function _jQueryInterface(config, avoidTriggerChange) {
	      return this.each(function () {
	        var $element = $__default['default'](this);
	        var data = $element.data(DATA_KEY$1);

	        if (!data) {
	          data = new Button(this);
	          $element.data(DATA_KEY$1, data);
	        }

	        data.shouldAvoidTriggerChange = avoidTriggerChange;

	        if (config === 'toggle') {
	          data[config]();
	        }
	      });
	    };

	    _createClass(Button, null, [{
	      key: "VERSION",
	      get: function get() {
	        return VERSION$1;
	      }
	    }]);

	    return Button;
	  }();
	  /**
	   * ------------------------------------------------------------------------
	   * Data Api implementation
	   * ------------------------------------------------------------------------
	   */


	  $__default['default'](document).on(EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE_CARROT, function (event) {
	    var button = event.target;
	    var initialButton = button;

	    if (!$__default['default'](button).hasClass(CLASS_NAME_BUTTON)) {
	      button = $__default['default'](button).closest(SELECTOR_BUTTON)[0];
	    }

	    if (!button || button.hasAttribute('disabled') || button.classList.contains('disabled')) {
	      event.preventDefault(); // work around Firefox bug #1540995
	    } else {
	      var inputBtn = button.querySelector(SELECTOR_INPUT);

	      if (inputBtn && (inputBtn.hasAttribute('disabled') || inputBtn.classList.contains('disabled'))) {
	        event.preventDefault(); // work around Firefox bug #1540995

	        return;
	      }

	      if (initialButton.tagName === 'INPUT' || button.tagName !== 'LABEL') {
	        Button._jQueryInterface.call($__default['default'](button), 'toggle', initialButton.tagName === 'INPUT');
	      }
	    }
	  }).on(EVENT_FOCUS_BLUR_DATA_API, SELECTOR_DATA_TOGGLE_CARROT, function (event) {
	    var button = $__default['default'](event.target).closest(SELECTOR_BUTTON)[0];
	    $__default['default'](button).toggleClass(CLASS_NAME_FOCUS, /^focus(in)?$/.test(event.type));
	  });
	  $__default['default'](window).on(EVENT_LOAD_DATA_API, function () {
	    // ensure correct active class is set to match the controls' actual values/states
	    // find all checkboxes/readio buttons inside data-toggle groups
	    var buttons = [].slice.call(document.querySelectorAll(SELECTOR_DATA_TOGGLES_BUTTONS));

	    for (var i = 0, len = buttons.length; i < len; i++) {
	      var button = buttons[i];
	      var input = button.querySelector(SELECTOR_INPUT);

	      if (input.checked || input.hasAttribute('checked')) {
	        button.classList.add(CLASS_NAME_ACTIVE);
	      } else {
	        button.classList.remove(CLASS_NAME_ACTIVE);
	      }
	    } // find all button toggles


	    buttons = [].slice.call(document.querySelectorAll(SELECTOR_DATA_TOGGLE));

	    for (var _i = 0, _len = buttons.length; _i < _len; _i++) {
	      var _button = buttons[_i];

	      if (_button.getAttribute('aria-pressed') === 'true') {
	        _button.classList.add(CLASS_NAME_ACTIVE);
	      } else {
	        _button.classList.remove(CLASS_NAME_ACTIVE);
	      }
	    }
	  });
	  /**
	   * ------------------------------------------------------------------------
	   * jQuery
	   * ------------------------------------------------------------------------
	   */

	  $__default['default'].fn[NAME$1] = Button._jQueryInterface;
	  $__default['default'].fn[NAME$1].Constructor = Button;

	  $__default['default'].fn[NAME$1].noConflict = function () {
	    $__default['default'].fn[NAME$1] = JQUERY_NO_CONFLICT$1;
	    return Button._jQueryInterface;
	  };

	  /**
	   * ------------------------------------------------------------------------
	   * Constants
	   * ------------------------------------------------------------------------
	   */

	  var NAME$2 = 'carousel';
	  var VERSION$2 = '4.5.3';
	  var DATA_KEY$2 = 'bs.carousel';
	  var EVENT_KEY$2 = "." + DATA_KEY$2;
	  var DATA_API_KEY$2 = '.data-api';
	  var JQUERY_NO_CONFLICT$2 = $__default['default'].fn[NAME$2];
	  var ARROW_LEFT_KEYCODE = 37; // KeyboardEvent.which value for left arrow key

	  var ARROW_RIGHT_KEYCODE = 39; // KeyboardEvent.which value for right arrow key

	  var TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

	  var SWIPE_THRESHOLD = 40;
	  var Default = {
	    interval: 5000,
	    keyboard: true,
	    slide: false,
	    pause: 'hover',
	    wrap: true,
	    touch: true
	  };
	  var DefaultType = {
	    interval: '(number|boolean)',
	    keyboard: 'boolean',
	    slide: '(boolean|string)',
	    pause: '(string|boolean)',
	    wrap: 'boolean',
	    touch: 'boolean'
	  };
	  var DIRECTION_NEXT = 'next';
	  var DIRECTION_PREV = 'prev';
	  var DIRECTION_LEFT = 'left';
	  var DIRECTION_RIGHT = 'right';
	  var EVENT_SLIDE = "slide" + EVENT_KEY$2;
	  var EVENT_SLID = "slid" + EVENT_KEY$2;
	  var EVENT_KEYDOWN = "keydown" + EVENT_KEY$2;
	  var EVENT_MOUSEENTER = "mouseenter" + EVENT_KEY$2;
	  var EVENT_MOUSELEAVE = "mouseleave" + EVENT_KEY$2;
	  var EVENT_TOUCHSTART = "touchstart" + EVENT_KEY$2;
	  var EVENT_TOUCHMOVE = "touchmove" + EVENT_KEY$2;
	  var EVENT_TOUCHEND = "touchend" + EVENT_KEY$2;
	  var EVENT_POINTERDOWN = "pointerdown" + EVENT_KEY$2;
	  var EVENT_POINTERUP = "pointerup" + EVENT_KEY$2;
	  var EVENT_DRAG_START = "dragstart" + EVENT_KEY$2;
	  var EVENT_LOAD_DATA_API$1 = "load" + EVENT_KEY$2 + DATA_API_KEY$2;
	  var EVENT_CLICK_DATA_API$2 = "click" + EVENT_KEY$2 + DATA_API_KEY$2;
	  var CLASS_NAME_CAROUSEL = 'carousel';
	  var CLASS_NAME_ACTIVE$1 = 'active';
	  var CLASS_NAME_SLIDE = 'slide';
	  var CLASS_NAME_RIGHT = 'carousel-item-right';
	  var CLASS_NAME_LEFT = 'carousel-item-left';
	  var CLASS_NAME_NEXT = 'carousel-item-next';
	  var CLASS_NAME_PREV = 'carousel-item-prev';
	  var CLASS_NAME_POINTER_EVENT = 'pointer-event';
	  var SELECTOR_ACTIVE$1 = '.active';
	  var SELECTOR_ACTIVE_ITEM = '.active.carousel-item';
	  var SELECTOR_ITEM = '.carousel-item';
	  var SELECTOR_ITEM_IMG = '.carousel-item img';
	  var SELECTOR_NEXT_PREV = '.carousel-item-next, .carousel-item-prev';
	  var SELECTOR_INDICATORS = '.carousel-indicators';
	  var SELECTOR_DATA_SLIDE = '[data-slide], [data-slide-to]';
	  var SELECTOR_DATA_RIDE = '[data-ride="carousel"]';
	  var PointerType = {
	    TOUCH: 'touch',
	    PEN: 'pen'
	  };
	  /**
	   * ------------------------------------------------------------------------
	   * Class Definition
	   * ------------------------------------------------------------------------
	   */

	  var Carousel = /*#__PURE__*/function () {
	    function Carousel(element, config) {
	      this._items = null;
	      this._interval = null;
	      this._activeElement = null;
	      this._isPaused = false;
	      this._isSliding = false;
	      this.touchTimeout = null;
	      this.touchStartX = 0;
	      this.touchDeltaX = 0;
	      this._config = this._getConfig(config);
	      this._element = element;
	      this._indicatorsElement = this._element.querySelector(SELECTOR_INDICATORS);
	      this._touchSupported = 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0;
	      this._pointerEvent = Boolean(window.PointerEvent || window.MSPointerEvent);

	      this._addEventListeners();
	    } // Getters


	    var _proto = Carousel.prototype;

	    // Public
	    _proto.next = function next() {
	      if (!this._isSliding) {
	        this._slide(DIRECTION_NEXT);
	      }
	    };

	    _proto.nextWhenVisible = function nextWhenVisible() {
	      var $element = $__default['default'](this._element); // Don't call next when the page isn't visible
	      // or the carousel or its parent isn't visible

	      if (!document.hidden && $element.is(':visible') && $element.css('visibility') !== 'hidden') {
	        this.next();
	      }
	    };

	    _proto.prev = function prev() {
	      if (!this._isSliding) {
	        this._slide(DIRECTION_PREV);
	      }
	    };

	    _proto.pause = function pause(event) {
	      if (!event) {
	        this._isPaused = true;
	      }

	      if (this._element.querySelector(SELECTOR_NEXT_PREV)) {
	        Util.triggerTransitionEnd(this._element);
	        this.cycle(true);
	      }

	      clearInterval(this._interval);
	      this._interval = null;
	    };

	    _proto.cycle = function cycle(event) {
	      if (!event) {
	        this._isPaused = false;
	      }

	      if (this._interval) {
	        clearInterval(this._interval);
	        this._interval = null;
	      }

	      if (this._config.interval && !this._isPaused) {
	        this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval);
	      }
	    };

	    _proto.to = function to(index) {
	      var _this = this;

	      this._activeElement = this._element.querySelector(SELECTOR_ACTIVE_ITEM);

	      var activeIndex = this._getItemIndex(this._activeElement);

	      if (index > this._items.length - 1 || index < 0) {
	        return;
	      }

	      if (this._isSliding) {
	        $__default['default'](this._element).one(EVENT_SLID, function () {
	          return _this.to(index);
	        });
	        return;
	      }

	      if (activeIndex === index) {
	        this.pause();
	        this.cycle();
	        return;
	      }

	      var direction = index > activeIndex ? DIRECTION_NEXT : DIRECTION_PREV;

	      this._slide(direction, this._items[index]);
	    };

	    _proto.dispose = function dispose() {
	      $__default['default'](this._element).off(EVENT_KEY$2);
	      $__default['default'].removeData(this._element, DATA_KEY$2);
	      this._items = null;
	      this._config = null;
	      this._element = null;
	      this._interval = null;
	      this._isPaused = null;
	      this._isSliding = null;
	      this._activeElement = null;
	      this._indicatorsElement = null;
	    } // Private
	    ;

	    _proto._getConfig = function _getConfig(config) {
	      config = _extends({}, Default, config);
	      Util.typeCheckConfig(NAME$2, config, DefaultType);
	      return config;
	    };

	    _proto._handleSwipe = function _handleSwipe() {
	      var absDeltax = Math.abs(this.touchDeltaX);

	      if (absDeltax <= SWIPE_THRESHOLD) {
	        return;
	      }

	      var direction = absDeltax / this.touchDeltaX;
	      this.touchDeltaX = 0; // swipe left

	      if (direction > 0) {
	        this.prev();
	      } // swipe right


	      if (direction < 0) {
	        this.next();
	      }
	    };

	    _proto._addEventListeners = function _addEventListeners() {
	      var _this2 = this;

	      if (this._config.keyboard) {
	        $__default['default'](this._element).on(EVENT_KEYDOWN, function (event) {
	          return _this2._keydown(event);
	        });
	      }

	      if (this._config.pause === 'hover') {
	        $__default['default'](this._element).on(EVENT_MOUSEENTER, function (event) {
	          return _this2.pause(event);
	        }).on(EVENT_MOUSELEAVE, function (event) {
	          return _this2.cycle(event);
	        });
	      }

	      if (this._config.touch) {
	        this._addTouchEventListeners();
	      }
	    };

	    _proto._addTouchEventListeners = function _addTouchEventListeners() {
	      var _this3 = this;

	      if (!this._touchSupported) {
	        return;
	      }

	      var start = function start(event) {
	        if (_this3._pointerEvent && PointerType[event.originalEvent.pointerType.toUpperCase()]) {
	          _this3.touchStartX = event.originalEvent.clientX;
	        } else if (!_this3._pointerEvent) {
	          _this3.touchStartX = event.originalEvent.touches[0].clientX;
	        }
	      };

	      var move = function move(event) {
	        // ensure swiping with one touch and not pinching
	        if (event.originalEvent.touches && event.originalEvent.touches.length > 1) {
	          _this3.touchDeltaX = 0;
	        } else {
	          _this3.touchDeltaX = event.originalEvent.touches[0].clientX - _this3.touchStartX;
	        }
	      };

	      var end = function end(event) {
	        if (_this3._pointerEvent && PointerType[event.originalEvent.pointerType.toUpperCase()]) {
	          _this3.touchDeltaX = event.originalEvent.clientX - _this3.touchStartX;
	        }

	        _this3._handleSwipe();

	        if (_this3._config.pause === 'hover') {
	          // If it's a touch-enabled device, mouseenter/leave are fired as
	          // part of the mouse compatibility events on first tap - the carousel
	          // would stop cycling until user tapped out of it;
	          // here, we listen for touchend, explicitly pause the carousel
	          // (as if it's the second time we tap on it, mouseenter compat event
	          // is NOT fired) and after a timeout (to allow for mouse compatibility
	          // events to fire) we explicitly restart cycling
	          _this3.pause();

	          if (_this3.touchTimeout) {
	            clearTimeout(_this3.touchTimeout);
	          }

	          _this3.touchTimeout = setTimeout(function (event) {
	            return _this3.cycle(event);
	          }, TOUCHEVENT_COMPAT_WAIT + _this3._config.interval);
	        }
	      };

	      $__default['default'](this._element.querySelectorAll(SELECTOR_ITEM_IMG)).on(EVENT_DRAG_START, function (e) {
	        return e.preventDefault();
	      });

	      if (this._pointerEvent) {
	        $__default['default'](this._element).on(EVENT_POINTERDOWN, function (event) {
	          return start(event);
	        });
	        $__default['default'](this._element).on(EVENT_POINTERUP, function (event) {
	          return end(event);
	        });

	        this._element.classList.add(CLASS_NAME_POINTER_EVENT);
	      } else {
	        $__default['default'](this._element).on(EVENT_TOUCHSTART, function (event) {
	          return start(event);
	        });
	        $__default['default'](this._element).on(EVENT_TOUCHMOVE, function (event) {
	          return move(event);
	        });
	        $__default['default'](this._element).on(EVENT_TOUCHEND, function (event) {
	          return end(event);
	        });
	      }
	    };

	    _proto._keydown = function _keydown(event) {
	      if (/input|textarea/i.test(event.target.tagName)) {
	        return;
	      }

	      switch (event.which) {
	        case ARROW_LEFT_KEYCODE:
	          event.preventDefault();
	          this.prev();
	          break;

	        case ARROW_RIGHT_KEYCODE:
	          event.preventDefault();
	          this.next();
	          break;
	      }
	    };

	    _proto._getItemIndex = function _getItemIndex(element) {
	      this._items = element && element.parentNode ? [].slice.call(element.parentNode.querySelectorAll(SELECTOR_ITEM)) : [];
	      return this._items.indexOf(element);
	    };

	    _proto._getItemByDirection = function _getItemByDirection(direction, activeElement) {
	      var isNextDirection = direction === DIRECTION_NEXT;
	      var isPrevDirection = direction === DIRECTION_PREV;

	      var activeIndex = this._getItemIndex(activeElement);

	      var lastItemIndex = this._items.length - 1;
	      var isGoingToWrap = isPrevDirection && activeIndex === 0 || isNextDirection && activeIndex === lastItemIndex;

	      if (isGoingToWrap && !this._config.wrap) {
	        return activeElement;
	      }

	      var delta = direction === DIRECTION_PREV ? -1 : 1;
	      var itemIndex = (activeIndex + delta) % this._items.length;
	      return itemIndex === -1 ? this._items[this._items.length - 1] : this._items[itemIndex];
	    };

	    _proto._triggerSlideEvent = function _triggerSlideEvent(relatedTarget, eventDirectionName) {
	      var targetIndex = this._getItemIndex(relatedTarget);

	      var fromIndex = this._getItemIndex(this._element.querySelector(SELECTOR_ACTIVE_ITEM));

	      var slideEvent = $__default['default'].Event(EVENT_SLIDE, {
	        relatedTarget: relatedTarget,
	        direction: eventDirectionName,
	        from: fromIndex,
	        to: targetIndex
	      });
	      $__default['default'](this._element).trigger(slideEvent);
	      return slideEvent;
	    };

	    _proto._setActiveIndicatorElement = function _setActiveIndicatorElement(element) {
	      if (this._indicatorsElement) {
	        var indicators = [].slice.call(this._indicatorsElement.querySelectorAll(SELECTOR_ACTIVE$1));
	        $__default['default'](indicators).removeClass(CLASS_NAME_ACTIVE$1);

	        var nextIndicator = this._indicatorsElement.children[this._getItemIndex(element)];

	        if (nextIndicator) {
	          $__default['default'](nextIndicator).addClass(CLASS_NAME_ACTIVE$1);
	        }
	      }
	    };

	    _proto._slide = function _slide(direction, element) {
	      var _this4 = this;

	      var activeElement = this._element.querySelector(SELECTOR_ACTIVE_ITEM);

	      var activeElementIndex = this._getItemIndex(activeElement);

	      var nextElement = element || activeElement && this._getItemByDirection(direction, activeElement);

	      var nextElementIndex = this._getItemIndex(nextElement);

	      var isCycling = Boolean(this._interval);
	      var directionalClassName;
	      var orderClassName;
	      var eventDirectionName;

	      if (direction === DIRECTION_NEXT) {
	        directionalClassName = CLASS_NAME_LEFT;
	        orderClassName = CLASS_NAME_NEXT;
	        eventDirectionName = DIRECTION_LEFT;
	      } else {
	        directionalClassName = CLASS_NAME_RIGHT;
	        orderClassName = CLASS_NAME_PREV;
	        eventDirectionName = DIRECTION_RIGHT;
	      }

	      if (nextElement && $__default['default'](nextElement).hasClass(CLASS_NAME_ACTIVE$1)) {
	        this._isSliding = false;
	        return;
	      }

	      var slideEvent = this._triggerSlideEvent(nextElement, eventDirectionName);

	      if (slideEvent.isDefaultPrevented()) {
	        return;
	      }

	      if (!activeElement || !nextElement) {
	        // Some weirdness is happening, so we bail
	        return;
	      }

	      this._isSliding = true;

	      if (isCycling) {
	        this.pause();
	      }

	      this._setActiveIndicatorElement(nextElement);

	      var slidEvent = $__default['default'].Event(EVENT_SLID, {
	        relatedTarget: nextElement,
	        direction: eventDirectionName,
	        from: activeElementIndex,
	        to: nextElementIndex
	      });

	      if ($__default['default'](this._element).hasClass(CLASS_NAME_SLIDE)) {
	        $__default['default'](nextElement).addClass(orderClassName);
	        Util.reflow(nextElement);
	        $__default['default'](activeElement).addClass(directionalClassName);
	        $__default['default'](nextElement).addClass(directionalClassName);
	        var nextElementInterval = parseInt(nextElement.getAttribute('data-interval'), 10);

	        if (nextElementInterval) {
	          this._config.defaultInterval = this._config.defaultInterval || this._config.interval;
	          this._config.interval = nextElementInterval;
	        } else {
	          this._config.interval = this._config.defaultInterval || this._config.interval;
	        }

	        var transitionDuration = Util.getTransitionDurationFromElement(activeElement);
	        $__default['default'](activeElement).one(Util.TRANSITION_END, function () {
	          $__default['default'](nextElement).removeClass(directionalClassName + " " + orderClassName).addClass(CLASS_NAME_ACTIVE$1);
	          $__default['default'](activeElement).removeClass(CLASS_NAME_ACTIVE$1 + " " + orderClassName + " " + directionalClassName);
	          _this4._isSliding = false;
	          setTimeout(function () {
	            return $__default['default'](_this4._element).trigger(slidEvent);
	          }, 0);
	        }).emulateTransitionEnd(transitionDuration);
	      } else {
	        $__default['default'](activeElement).removeClass(CLASS_NAME_ACTIVE$1);
	        $__default['default'](nextElement).addClass(CLASS_NAME_ACTIVE$1);
	        this._isSliding = false;
	        $__default['default'](this._element).trigger(slidEvent);
	      }

	      if (isCycling) {
	        this.cycle();
	      }
	    } // Static
	    ;

	    Carousel._jQueryInterface = function _jQueryInterface(config) {
	      return this.each(function () {
	        var data = $__default['default'](this).data(DATA_KEY$2);

	        var _config = _extends({}, Default, $__default['default'](this).data());

	        if (typeof config === 'object') {
	          _config = _extends({}, _config, config);
	        }

	        var action = typeof config === 'string' ? config : _config.slide;

	        if (!data) {
	          data = new Carousel(this, _config);
	          $__default['default'](this).data(DATA_KEY$2, data);
	        }

	        if (typeof config === 'number') {
	          data.to(config);
	        } else if (typeof action === 'string') {
	          if (typeof data[action] === 'undefined') {
	            throw new TypeError("No method named \"" + action + "\"");
	          }

	          data[action]();
	        } else if (_config.interval && _config.ride) {
	          data.pause();
	          data.cycle();
	        }
	      });
	    };

	    Carousel._dataApiClickHandler = function _dataApiClickHandler(event) {
	      var selector = Util.getSelectorFromElement(this);

	      if (!selector) {
	        return;
	      }

	      var target = $__default['default'](selector)[0];

	      if (!target || !$__default['default'](target).hasClass(CLASS_NAME_CAROUSEL)) {
	        return;
	      }

	      var config = _extends({}, $__default['default'](target).data(), $__default['default'](this).data());

	      var slideIndex = this.getAttribute('data-slide-to');

	      if (slideIndex) {
	        config.interval = false;
	      }

	      Carousel._jQueryInterface.call($__default['default'](target), config);

	      if (slideIndex) {
	        $__default['default'](target).data(DATA_KEY$2).to(slideIndex);
	      }

	      event.preventDefault();
	    };

	    _createClass(Carousel, null, [{
	      key: "VERSION",
	      get: function get() {
	        return VERSION$2;
	      }
	    }, {
	      key: "Default",
	      get: function get() {
	        return Default;
	      }
	    }]);

	    return Carousel;
	  }();
	  /**
	   * ------------------------------------------------------------------------
	   * Data Api implementation
	   * ------------------------------------------------------------------------
	   */


	  $__default['default'](document).on(EVENT_CLICK_DATA_API$2, SELECTOR_DATA_SLIDE, Carousel._dataApiClickHandler);
	  $__default['default'](window).on(EVENT_LOAD_DATA_API$1, function () {
	    var carousels = [].slice.call(document.querySelectorAll(SELECTOR_DATA_RIDE));

	    for (var i = 0, len = carousels.length; i < len; i++) {
	      var $carousel = $__default['default'](carousels[i]);

	      Carousel._jQueryInterface.call($carousel, $carousel.data());
	    }
	  });
	  /**
	   * ------------------------------------------------------------------------
	   * jQuery
	   * ------------------------------------------------------------------------
	   */

	  $__default['default'].fn[NAME$2] = Carousel._jQueryInterface;
	  $__default['default'].fn[NAME$2].Constructor = Carousel;

	  $__default['default'].fn[NAME$2].noConflict = function () {
	    $__default['default'].fn[NAME$2] = JQUERY_NO_CONFLICT$2;
	    return Carousel._jQueryInterface;
	  };

	  /**
	   * ------------------------------------------------------------------------
	   * Constants
	   * ------------------------------------------------------------------------
	   */

	  var NAME$3 = 'collapse';
	  var VERSION$3 = '4.5.3';
	  var DATA_KEY$3 = 'bs.collapse';
	  var EVENT_KEY$3 = "." + DATA_KEY$3;
	  var DATA_API_KEY$3 = '.data-api';
	  var JQUERY_NO_CONFLICT$3 = $__default['default'].fn[NAME$3];
	  var Default$1 = {
	    toggle: true,
	    parent: ''
	  };
	  var DefaultType$1 = {
	    toggle: 'boolean',
	    parent: '(string|element)'
	  };
	  var EVENT_SHOW = "show" + EVENT_KEY$3;
	  var EVENT_SHOWN = "shown" + EVENT_KEY$3;
	  var EVENT_HIDE = "hide" + EVENT_KEY$3;
	  var EVENT_HIDDEN = "hidden" + EVENT_KEY$3;
	  var EVENT_CLICK_DATA_API$3 = "click" + EVENT_KEY$3 + DATA_API_KEY$3;
	  var CLASS_NAME_SHOW$1 = 'show';
	  var CLASS_NAME_COLLAPSE = 'collapse';
	  var CLASS_NAME_COLLAPSING = 'collapsing';
	  var CLASS_NAME_COLLAPSED = 'collapsed';
	  var DIMENSION_WIDTH = 'width';
	  var DIMENSION_HEIGHT = 'height';
	  var SELECTOR_ACTIVES = '.show, .collapsing';
	  var SELECTOR_DATA_TOGGLE$1 = '[data-toggle="collapse"]';
	  /**
	   * ------------------------------------------------------------------------
	   * Class Definition
	   * ------------------------------------------------------------------------
	   */

	  var Collapse = /*#__PURE__*/function () {
	    function Collapse(element, config) {
	      this._isTransitioning = false;
	      this._element = element;
	      this._config = this._getConfig(config);
	      this._triggerArray = [].slice.call(document.querySelectorAll("[data-toggle=\"collapse\"][href=\"#" + element.id + "\"]," + ("[data-toggle=\"collapse\"][data-target=\"#" + element.id + "\"]")));
	      var toggleList = [].slice.call(document.querySelectorAll(SELECTOR_DATA_TOGGLE$1));

	      for (var i = 0, len = toggleList.length; i < len; i++) {
	        var elem = toggleList[i];
	        var selector = Util.getSelectorFromElement(elem);
	        var filterElement = [].slice.call(document.querySelectorAll(selector)).filter(function (foundElem) {
	          return foundElem === element;
	        });

	        if (selector !== null && filterElement.length > 0) {
	          this._selector = selector;

	          this._triggerArray.push(elem);
	        }
	      }

	      this._parent = this._config.parent ? this._getParent() : null;

	      if (!this._config.parent) {
	        this._addAriaAndCollapsedClass(this._element, this._triggerArray);
	      }

	      if (this._config.toggle) {
	        this.toggle();
	      }
	    } // Getters


	    var _proto = Collapse.prototype;

	    // Public
	    _proto.toggle = function toggle() {
	      if ($__default['default'](this._element).hasClass(CLASS_NAME_SHOW$1)) {
	        this.hide();
	      } else {
	        this.show();
	      }
	    };

	    _proto.show = function show() {
	      var _this = this;

	      if (this._isTransitioning || $__default['default'](this._element).hasClass(CLASS_NAME_SHOW$1)) {
	        return;
	      }

	      var actives;
	      var activesData;

	      if (this._parent) {
	        actives = [].slice.call(this._parent.querySelectorAll(SELECTOR_ACTIVES)).filter(function (elem) {
	          if (typeof _this._config.parent === 'string') {
	            return elem.getAttribute('data-parent') === _this._config.parent;
	          }

	          return elem.classList.contains(CLASS_NAME_COLLAPSE);
	        });

	        if (actives.length === 0) {
	          actives = null;
	        }
	      }

	      if (actives) {
	        activesData = $__default['default'](actives).not(this._selector).data(DATA_KEY$3);

	        if (activesData && activesData._isTransitioning) {
	          return;
	        }
	      }

	      var startEvent = $__default['default'].Event(EVENT_SHOW);
	      $__default['default'](this._element).trigger(startEvent);

	      if (startEvent.isDefaultPrevented()) {
	        return;
	      }

	      if (actives) {
	        Collapse._jQueryInterface.call($__default['default'](actives).not(this._selector), 'hide');

	        if (!activesData) {
	          $__default['default'](actives).data(DATA_KEY$3, null);
	        }
	      }

	      var dimension = this._getDimension();

	      $__default['default'](this._element).removeClass(CLASS_NAME_COLLAPSE).addClass(CLASS_NAME_COLLAPSING);
	      this._element.style[dimension] = 0;

	      if (this._triggerArray.length) {
	        $__default['default'](this._triggerArray).removeClass(CLASS_NAME_COLLAPSED).attr('aria-expanded', true);
	      }

	      this.setTransitioning(true);

	      var complete = function complete() {
	        $__default['default'](_this._element).removeClass(CLASS_NAME_COLLAPSING).addClass(CLASS_NAME_COLLAPSE + " " + CLASS_NAME_SHOW$1);
	        _this._element.style[dimension] = '';

	        _this.setTransitioning(false);

	        $__default['default'](_this._element).trigger(EVENT_SHOWN);
	      };

	      var capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
	      var scrollSize = "scroll" + capitalizedDimension;
	      var transitionDuration = Util.getTransitionDurationFromElement(this._element);
	      $__default['default'](this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
	      this._element.style[dimension] = this._element[scrollSize] + "px";
	    };

	    _proto.hide = function hide() {
	      var _this2 = this;

	      if (this._isTransitioning || !$__default['default'](this._element).hasClass(CLASS_NAME_SHOW$1)) {
	        return;
	      }

	      var startEvent = $__default['default'].Event(EVENT_HIDE);
	      $__default['default'](this._element).trigger(startEvent);

	      if (startEvent.isDefaultPrevented()) {
	        return;
	      }

	      var dimension = this._getDimension();

	      this._element.style[dimension] = this._element.getBoundingClientRect()[dimension] + "px";
	      Util.reflow(this._element);
	      $__default['default'](this._element).addClass(CLASS_NAME_COLLAPSING).removeClass(CLASS_NAME_COLLAPSE + " " + CLASS_NAME_SHOW$1);
	      var triggerArrayLength = this._triggerArray.length;

	      if (triggerArrayLength > 0) {
	        for (var i = 0; i < triggerArrayLength; i++) {
	          var trigger = this._triggerArray[i];
	          var selector = Util.getSelectorFromElement(trigger);

	          if (selector !== null) {
	            var $elem = $__default['default']([].slice.call(document.querySelectorAll(selector)));

	            if (!$elem.hasClass(CLASS_NAME_SHOW$1)) {
	              $__default['default'](trigger).addClass(CLASS_NAME_COLLAPSED).attr('aria-expanded', false);
	            }
	          }
	        }
	      }

	      this.setTransitioning(true);

	      var complete = function complete() {
	        _this2.setTransitioning(false);

	        $__default['default'](_this2._element).removeClass(CLASS_NAME_COLLAPSING).addClass(CLASS_NAME_COLLAPSE).trigger(EVENT_HIDDEN);
	      };

	      this._element.style[dimension] = '';
	      var transitionDuration = Util.getTransitionDurationFromElement(this._element);
	      $__default['default'](this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
	    };

	    _proto.setTransitioning = function setTransitioning(isTransitioning) {
	      this._isTransitioning = isTransitioning;
	    };

	    _proto.dispose = function dispose() {
	      $__default['default'].removeData(this._element, DATA_KEY$3);
	      this._config = null;
	      this._parent = null;
	      this._element = null;
	      this._triggerArray = null;
	      this._isTransitioning = null;
	    } // Private
	    ;

	    _proto._getConfig = function _getConfig(config) {
	      config = _extends({}, Default$1, config);
	      config.toggle = Boolean(config.toggle); // Coerce string values

	      Util.typeCheckConfig(NAME$3, config, DefaultType$1);
	      return config;
	    };

	    _proto._getDimension = function _getDimension() {
	      var hasWidth = $__default['default'](this._element).hasClass(DIMENSION_WIDTH);
	      return hasWidth ? DIMENSION_WIDTH : DIMENSION_HEIGHT;
	    };

	    _proto._getParent = function _getParent() {
	      var _this3 = this;

	      var parent;

	      if (Util.isElement(this._config.parent)) {
	        parent = this._config.parent; // It's a jQuery object

	        if (typeof this._config.parent.jquery !== 'undefined') {
	          parent = this._config.parent[0];
	        }
	      } else {
	        parent = document.querySelector(this._config.parent);
	      }

	      var selector = "[data-toggle=\"collapse\"][data-parent=\"" + this._config.parent + "\"]";
	      var children = [].slice.call(parent.querySelectorAll(selector));
	      $__default['default'](children).each(function (i, element) {
	        _this3._addAriaAndCollapsedClass(Collapse._getTargetFromElement(element), [element]);
	      });
	      return parent;
	    };

	    _proto._addAriaAndCollapsedClass = function _addAriaAndCollapsedClass(element, triggerArray) {
	      var isOpen = $__default['default'](element).hasClass(CLASS_NAME_SHOW$1);

	      if (triggerArray.length) {
	        $__default['default'](triggerArray).toggleClass(CLASS_NAME_COLLAPSED, !isOpen).attr('aria-expanded', isOpen);
	      }
	    } // Static
	    ;

	    Collapse._getTargetFromElement = function _getTargetFromElement(element) {
	      var selector = Util.getSelectorFromElement(element);
	      return selector ? document.querySelector(selector) : null;
	    };

	    Collapse._jQueryInterface = function _jQueryInterface(config) {
	      return this.each(function () {
	        var $element = $__default['default'](this);
	        var data = $element.data(DATA_KEY$3);

	        var _config = _extends({}, Default$1, $element.data(), typeof config === 'object' && config ? config : {});

	        if (!data && _config.toggle && typeof config === 'string' && /show|hide/.test(config)) {
	          _config.toggle = false;
	        }

	        if (!data) {
	          data = new Collapse(this, _config);
	          $element.data(DATA_KEY$3, data);
	        }

	        if (typeof config === 'string') {
	          if (typeof data[config] === 'undefined') {
	            throw new TypeError("No method named \"" + config + "\"");
	          }

	          data[config]();
	        }
	      });
	    };

	    _createClass(Collapse, null, [{
	      key: "VERSION",
	      get: function get() {
	        return VERSION$3;
	      }
	    }, {
	      key: "Default",
	      get: function get() {
	        return Default$1;
	      }
	    }]);

	    return Collapse;
	  }();
	  /**
	   * ------------------------------------------------------------------------
	   * Data Api implementation
	   * ------------------------------------------------------------------------
	   */


	  $__default['default'](document).on(EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$1, function (event) {
	    // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
	    if (event.currentTarget.tagName === 'A') {
	      event.preventDefault();
	    }

	    var $trigger = $__default['default'](this);
	    var selector = Util.getSelectorFromElement(this);
	    var selectors = [].slice.call(document.querySelectorAll(selector));
	    $__default['default'](selectors).each(function () {
	      var $target = $__default['default'](this);
	      var data = $target.data(DATA_KEY$3);
	      var config = data ? 'toggle' : $trigger.data();

	      Collapse._jQueryInterface.call($target, config);
	    });
	  });
	  /**
	   * ------------------------------------------------------------------------
	   * jQuery
	   * ------------------------------------------------------------------------
	   */

	  $__default['default'].fn[NAME$3] = Collapse._jQueryInterface;
	  $__default['default'].fn[NAME$3].Constructor = Collapse;

	  $__default['default'].fn[NAME$3].noConflict = function () {
	    $__default['default'].fn[NAME$3] = JQUERY_NO_CONFLICT$3;
	    return Collapse._jQueryInterface;
	  };

	  /**
	   * ------------------------------------------------------------------------
	   * Constants
	   * ------------------------------------------------------------------------
	   */

	  var NAME$4 = 'dropdown';
	  var VERSION$4 = '4.5.3';
	  var DATA_KEY$4 = 'bs.dropdown';
	  var EVENT_KEY$4 = "." + DATA_KEY$4;
	  var DATA_API_KEY$4 = '.data-api';
	  var JQUERY_NO_CONFLICT$4 = $__default['default'].fn[NAME$4];
	  var ESCAPE_KEYCODE = 27; // KeyboardEvent.which value for Escape (Esc) key

	  var SPACE_KEYCODE = 32; // KeyboardEvent.which value for space key

	  var TAB_KEYCODE = 9; // KeyboardEvent.which value for tab key

	  var ARROW_UP_KEYCODE = 38; // KeyboardEvent.which value for up arrow key

	  var ARROW_DOWN_KEYCODE = 40; // KeyboardEvent.which value for down arrow key

	  var RIGHT_MOUSE_BUTTON_WHICH = 3; // MouseEvent.which value for the right button (assuming a right-handed mouse)

	  var REGEXP_KEYDOWN = new RegExp(ARROW_UP_KEYCODE + "|" + ARROW_DOWN_KEYCODE + "|" + ESCAPE_KEYCODE);
	  var EVENT_HIDE$1 = "hide" + EVENT_KEY$4;
	  var EVENT_HIDDEN$1 = "hidden" + EVENT_KEY$4;
	  var EVENT_SHOW$1 = "show" + EVENT_KEY$4;
	  var EVENT_SHOWN$1 = "shown" + EVENT_KEY$4;
	  var EVENT_CLICK = "click" + EVENT_KEY$4;
	  var EVENT_CLICK_DATA_API$4 = "click" + EVENT_KEY$4 + DATA_API_KEY$4;
	  var EVENT_KEYDOWN_DATA_API = "keydown" + EVENT_KEY$4 + DATA_API_KEY$4;
	  var EVENT_KEYUP_DATA_API = "keyup" + EVENT_KEY$4 + DATA_API_KEY$4;
	  var CLASS_NAME_DISABLED = 'disabled';
	  var CLASS_NAME_SHOW$2 = 'show';
	  var CLASS_NAME_DROPUP = 'dropup';
	  var CLASS_NAME_DROPRIGHT = 'dropright';
	  var CLASS_NAME_DROPLEFT = 'dropleft';
	  var CLASS_NAME_MENURIGHT = 'dropdown-menu-right';
	  var CLASS_NAME_POSITION_STATIC = 'position-static';
	  var SELECTOR_DATA_TOGGLE$2 = '[data-toggle="dropdown"]';
	  var SELECTOR_FORM_CHILD = '.dropdown form';
	  var SELECTOR_MENU = '.dropdown-menu';
	  var SELECTOR_NAVBAR_NAV = '.navbar-nav';
	  var SELECTOR_VISIBLE_ITEMS = '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)';
	  var PLACEMENT_TOP = 'top-start';
	  var PLACEMENT_TOPEND = 'top-end';
	  var PLACEMENT_BOTTOM = 'bottom-start';
	  var PLACEMENT_BOTTOMEND = 'bottom-end';
	  var PLACEMENT_RIGHT = 'right-start';
	  var PLACEMENT_LEFT = 'left-start';
	  var Default$2 = {
	    offset: 0,
	    flip: true,
	    boundary: 'scrollParent',
	    reference: 'toggle',
	    display: 'dynamic',
	    popperConfig: null
	  };
	  var DefaultType$2 = {
	    offset: '(number|string|function)',
	    flip: 'boolean',
	    boundary: '(string|element)',
	    reference: '(string|element)',
	    display: 'string',
	    popperConfig: '(null|object)'
	  };
	  /**
	   * ------------------------------------------------------------------------
	   * Class Definition
	   * ------------------------------------------------------------------------
	   */

	  var Dropdown = /*#__PURE__*/function () {
	    function Dropdown(element, config) {
	      this._element = element;
	      this._popper = null;
	      this._config = this._getConfig(config);
	      this._menu = this._getMenuElement();
	      this._inNavbar = this._detectNavbar();

	      this._addEventListeners();
	    } // Getters


	    var _proto = Dropdown.prototype;

	    // Public
	    _proto.toggle = function toggle() {
	      if (this._element.disabled || $__default['default'](this._element).hasClass(CLASS_NAME_DISABLED)) {
	        return;
	      }

	      var isActive = $__default['default'](this._menu).hasClass(CLASS_NAME_SHOW$2);

	      Dropdown._clearMenus();

	      if (isActive) {
	        return;
	      }

	      this.show(true);
	    };

	    _proto.show = function show(usePopper) {
	      if (usePopper === void 0) {
	        usePopper = false;
	      }

	      if (this._element.disabled || $__default['default'](this._element).hasClass(CLASS_NAME_DISABLED) || $__default['default'](this._menu).hasClass(CLASS_NAME_SHOW$2)) {
	        return;
	      }

	      var relatedTarget = {
	        relatedTarget: this._element
	      };
	      var showEvent = $__default['default'].Event(EVENT_SHOW$1, relatedTarget);

	      var parent = Dropdown._getParentFromElement(this._element);

	      $__default['default'](parent).trigger(showEvent);

	      if (showEvent.isDefaultPrevented()) {
	        return;
	      } // Disable totally Popper.js for Dropdown in Navbar


	      if (!this._inNavbar && usePopper) {
	        /**
	         * Check for Popper dependency
	         * Popper - https://popper.js.org
	         */
	        if (typeof Popper__default['default'] === 'undefined') {
	          throw new TypeError('Bootstrap\'s dropdowns require Popper.js (https://popper.js.org/)');
	        }

	        var referenceElement = this._element;

	        if (this._config.reference === 'parent') {
	          referenceElement = parent;
	        } else if (Util.isElement(this._config.reference)) {
	          referenceElement = this._config.reference; // Check if it's jQuery element

	          if (typeof this._config.reference.jquery !== 'undefined') {
	            referenceElement = this._config.reference[0];
	          }
	        } // If boundary is not `scrollParent`, then set position to `static`
	        // to allow the menu to "escape" the scroll parent's boundaries
	        // https://github.com/twbs/bootstrap/issues/24251


	        if (this._config.boundary !== 'scrollParent') {
	          $__default['default'](parent).addClass(CLASS_NAME_POSITION_STATIC);
	        }

	        this._popper = new Popper__default['default'](referenceElement, this._menu, this._getPopperConfig());
	      } // If this is a touch-enabled device we add extra
	      // empty mouseover listeners to the body's immediate children;
	      // only needed because of broken event delegation on iOS
	      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html


	      if ('ontouchstart' in document.documentElement && $__default['default'](parent).closest(SELECTOR_NAVBAR_NAV).length === 0) {
	        $__default['default'](document.body).children().on('mouseover', null, $__default['default'].noop);
	      }

	      this._element.focus();

	      this._element.setAttribute('aria-expanded', true);

	      $__default['default'](this._menu).toggleClass(CLASS_NAME_SHOW$2);
	      $__default['default'](parent).toggleClass(CLASS_NAME_SHOW$2).trigger($__default['default'].Event(EVENT_SHOWN$1, relatedTarget));
	    };

	    _proto.hide = function hide() {
	      if (this._element.disabled || $__default['default'](this._element).hasClass(CLASS_NAME_DISABLED) || !$__default['default'](this._menu).hasClass(CLASS_NAME_SHOW$2)) {
	        return;
	      }

	      var relatedTarget = {
	        relatedTarget: this._element
	      };
	      var hideEvent = $__default['default'].Event(EVENT_HIDE$1, relatedTarget);

	      var parent = Dropdown._getParentFromElement(this._element);

	      $__default['default'](parent).trigger(hideEvent);

	      if (hideEvent.isDefaultPrevented()) {
	        return;
	      }

	      if (this._popper) {
	        this._popper.destroy();
	      }

	      $__default['default'](this._menu).toggleClass(CLASS_NAME_SHOW$2);
	      $__default['default'](parent).toggleClass(CLASS_NAME_SHOW$2).trigger($__default['default'].Event(EVENT_HIDDEN$1, relatedTarget));
	    };

	    _proto.dispose = function dispose() {
	      $__default['default'].removeData(this._element, DATA_KEY$4);
	      $__default['default'](this._element).off(EVENT_KEY$4);
	      this._element = null;
	      this._menu = null;

	      if (this._popper !== null) {
	        this._popper.destroy();

	        this._popper = null;
	      }
	    };

	    _proto.update = function update() {
	      this._inNavbar = this._detectNavbar();

	      if (this._popper !== null) {
	        this._popper.scheduleUpdate();
	      }
	    } // Private
	    ;

	    _proto._addEventListeners = function _addEventListeners() {
	      var _this = this;

	      $__default['default'](this._element).on(EVENT_CLICK, function (event) {
	        event.preventDefault();
	        event.stopPropagation();

	        _this.toggle();
	      });
	    };

	    _proto._getConfig = function _getConfig(config) {
	      config = _extends({}, this.constructor.Default, $__default['default'](this._element).data(), config);
	      Util.typeCheckConfig(NAME$4, config, this.constructor.DefaultType);
	      return config;
	    };

	    _proto._getMenuElement = function _getMenuElement() {
	      if (!this._menu) {
	        var parent = Dropdown._getParentFromElement(this._element);

	        if (parent) {
	          this._menu = parent.querySelector(SELECTOR_MENU);
	        }
	      }

	      return this._menu;
	    };

	    _proto._getPlacement = function _getPlacement() {
	      var $parentDropdown = $__default['default'](this._element.parentNode);
	      var placement = PLACEMENT_BOTTOM; // Handle dropup

	      if ($parentDropdown.hasClass(CLASS_NAME_DROPUP)) {
	        placement = $__default['default'](this._menu).hasClass(CLASS_NAME_MENURIGHT) ? PLACEMENT_TOPEND : PLACEMENT_TOP;
	      } else if ($parentDropdown.hasClass(CLASS_NAME_DROPRIGHT)) {
	        placement = PLACEMENT_RIGHT;
	      } else if ($parentDropdown.hasClass(CLASS_NAME_DROPLEFT)) {
	        placement = PLACEMENT_LEFT;
	      } else if ($__default['default'](this._menu).hasClass(CLASS_NAME_MENURIGHT)) {
	        placement = PLACEMENT_BOTTOMEND;
	      }

	      return placement;
	    };

	    _proto._detectNavbar = function _detectNavbar() {
	      return $__default['default'](this._element).closest('.navbar').length > 0;
	    };

	    _proto._getOffset = function _getOffset() {
	      var _this2 = this;

	      var offset = {};

	      if (typeof this._config.offset === 'function') {
	        offset.fn = function (data) {
	          data.offsets = _extends({}, data.offsets, _this2._config.offset(data.offsets, _this2._element) || {});
	          return data;
	        };
	      } else {
	        offset.offset = this._config.offset;
	      }

	      return offset;
	    };

	    _proto._getPopperConfig = function _getPopperConfig() {
	      var popperConfig = {
	        placement: this._getPlacement(),
	        modifiers: {
	          offset: this._getOffset(),
	          flip: {
	            enabled: this._config.flip
	          },
	          preventOverflow: {
	            boundariesElement: this._config.boundary
	          }
	        }
	      }; // Disable Popper.js if we have a static display

	      if (this._config.display === 'static') {
	        popperConfig.modifiers.applyStyle = {
	          enabled: false
	        };
	      }

	      return _extends({}, popperConfig, this._config.popperConfig);
	    } // Static
	    ;

	    Dropdown._jQueryInterface = function _jQueryInterface(config) {
	      return this.each(function () {
	        var data = $__default['default'](this).data(DATA_KEY$4);

	        var _config = typeof config === 'object' ? config : null;

	        if (!data) {
	          data = new Dropdown(this, _config);
	          $__default['default'](this).data(DATA_KEY$4, data);
	        }

	        if (typeof config === 'string') {
	          if (typeof data[config] === 'undefined') {
	            throw new TypeError("No method named \"" + config + "\"");
	          }

	          data[config]();
	        }
	      });
	    };

	    Dropdown._clearMenus = function _clearMenus(event) {
	      if (event && (event.which === RIGHT_MOUSE_BUTTON_WHICH || event.type === 'keyup' && event.which !== TAB_KEYCODE)) {
	        return;
	      }

	      var toggles = [].slice.call(document.querySelectorAll(SELECTOR_DATA_TOGGLE$2));

	      for (var i = 0, len = toggles.length; i < len; i++) {
	        var parent = Dropdown._getParentFromElement(toggles[i]);

	        var context = $__default['default'](toggles[i]).data(DATA_KEY$4);
	        var relatedTarget = {
	          relatedTarget: toggles[i]
	        };

	        if (event && event.type === 'click') {
	          relatedTarget.clickEvent = event;
	        }

	        if (!context) {
	          continue;
	        }

	        var dropdownMenu = context._menu;

	        if (!$__default['default'](parent).hasClass(CLASS_NAME_SHOW$2)) {
	          continue;
	        }

	        if (event && (event.type === 'click' && /input|textarea/i.test(event.target.tagName) || event.type === 'keyup' && event.which === TAB_KEYCODE) && $__default['default'].contains(parent, event.target)) {
	          continue;
	        }

	        var hideEvent = $__default['default'].Event(EVENT_HIDE$1, relatedTarget);
	        $__default['default'](parent).trigger(hideEvent);

	        if (hideEvent.isDefaultPrevented()) {
	          continue;
	        } // If this is a touch-enabled device we remove the extra
	        // empty mouseover listeners we added for iOS support


	        if ('ontouchstart' in document.documentElement) {
	          $__default['default'](document.body).children().off('mouseover', null, $__default['default'].noop);
	        }

	        toggles[i].setAttribute('aria-expanded', 'false');

	        if (context._popper) {
	          context._popper.destroy();
	        }

	        $__default['default'](dropdownMenu).removeClass(CLASS_NAME_SHOW$2);
	        $__default['default'](parent).removeClass(CLASS_NAME_SHOW$2).trigger($__default['default'].Event(EVENT_HIDDEN$1, relatedTarget));
	      }
	    };

	    Dropdown._getParentFromElement = function _getParentFromElement(element) {
	      var parent;
	      var selector = Util.getSelectorFromElement(element);

	      if (selector) {
	        parent = document.querySelector(selector);
	      }

	      return parent || element.parentNode;
	    } // eslint-disable-next-line complexity
	    ;

	    Dropdown._dataApiKeydownHandler = function _dataApiKeydownHandler(event) {
	      // If not input/textarea:
	      //  - And not a key in REGEXP_KEYDOWN => not a dropdown command
	      // If input/textarea:
	      //  - If space key => not a dropdown command
	      //  - If key is other than escape
	      //    - If key is not up or down => not a dropdown command
	      //    - If trigger inside the menu => not a dropdown command
	      if (/input|textarea/i.test(event.target.tagName) ? event.which === SPACE_KEYCODE || event.which !== ESCAPE_KEYCODE && (event.which !== ARROW_DOWN_KEYCODE && event.which !== ARROW_UP_KEYCODE || $__default['default'](event.target).closest(SELECTOR_MENU).length) : !REGEXP_KEYDOWN.test(event.which)) {
	        return;
	      }

	      if (this.disabled || $__default['default'](this).hasClass(CLASS_NAME_DISABLED)) {
	        return;
	      }

	      var parent = Dropdown._getParentFromElement(this);

	      var isActive = $__default['default'](parent).hasClass(CLASS_NAME_SHOW$2);

	      if (!isActive && event.which === ESCAPE_KEYCODE) {
	        return;
	      }

	      event.preventDefault();
	      event.stopPropagation();

	      if (!isActive || event.which === ESCAPE_KEYCODE || event.which === SPACE_KEYCODE) {
	        if (event.which === ESCAPE_KEYCODE) {
	          $__default['default'](parent.querySelector(SELECTOR_DATA_TOGGLE$2)).trigger('focus');
	        }

	        $__default['default'](this).trigger('click');
	        return;
	      }

	      var items = [].slice.call(parent.querySelectorAll(SELECTOR_VISIBLE_ITEMS)).filter(function (item) {
	        return $__default['default'](item).is(':visible');
	      });

	      if (items.length === 0) {
	        return;
	      }

	      var index = items.indexOf(event.target);

	      if (event.which === ARROW_UP_KEYCODE && index > 0) {
	        // Up
	        index--;
	      }

	      if (event.which === ARROW_DOWN_KEYCODE && index < items.length - 1) {
	        // Down
	        index++;
	      }

	      if (index < 0) {
	        index = 0;
	      }

	      items[index].focus();
	    };

	    _createClass(Dropdown, null, [{
	      key: "VERSION",
	      get: function get() {
	        return VERSION$4;
	      }
	    }, {
	      key: "Default",
	      get: function get() {
	        return Default$2;
	      }
	    }, {
	      key: "DefaultType",
	      get: function get() {
	        return DefaultType$2;
	      }
	    }]);

	    return Dropdown;
	  }();
	  /**
	   * ------------------------------------------------------------------------
	   * Data Api implementation
	   * ------------------------------------------------------------------------
	   */


	  $__default['default'](document).on(EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE$2, Dropdown._dataApiKeydownHandler).on(EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown._dataApiKeydownHandler).on(EVENT_CLICK_DATA_API$4 + " " + EVENT_KEYUP_DATA_API, Dropdown._clearMenus).on(EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$2, function (event) {
	    event.preventDefault();
	    event.stopPropagation();

	    Dropdown._jQueryInterface.call($__default['default'](this), 'toggle');
	  }).on(EVENT_CLICK_DATA_API$4, SELECTOR_FORM_CHILD, function (e) {
	    e.stopPropagation();
	  });
	  /**
	   * ------------------------------------------------------------------------
	   * jQuery
	   * ------------------------------------------------------------------------
	   */

	  $__default['default'].fn[NAME$4] = Dropdown._jQueryInterface;
	  $__default['default'].fn[NAME$4].Constructor = Dropdown;

	  $__default['default'].fn[NAME$4].noConflict = function () {
	    $__default['default'].fn[NAME$4] = JQUERY_NO_CONFLICT$4;
	    return Dropdown._jQueryInterface;
	  };

	  /**
	   * ------------------------------------------------------------------------
	   * Constants
	   * ------------------------------------------------------------------------
	   */

	  var NAME$5 = 'modal';
	  var VERSION$5 = '4.5.3';
	  var DATA_KEY$5 = 'bs.modal';
	  var EVENT_KEY$5 = "." + DATA_KEY$5;
	  var DATA_API_KEY$5 = '.data-api';
	  var JQUERY_NO_CONFLICT$5 = $__default['default'].fn[NAME$5];
	  var ESCAPE_KEYCODE$1 = 27; // KeyboardEvent.which value for Escape (Esc) key

	  var Default$3 = {
	    backdrop: true,
	    keyboard: true,
	    focus: true,
	    show: true
	  };
	  var DefaultType$3 = {
	    backdrop: '(boolean|string)',
	    keyboard: 'boolean',
	    focus: 'boolean',
	    show: 'boolean'
	  };
	  var EVENT_HIDE$2 = "hide" + EVENT_KEY$5;
	  var EVENT_HIDE_PREVENTED = "hidePrevented" + EVENT_KEY$5;
	  var EVENT_HIDDEN$2 = "hidden" + EVENT_KEY$5;
	  var EVENT_SHOW$2 = "show" + EVENT_KEY$5;
	  var EVENT_SHOWN$2 = "shown" + EVENT_KEY$5;
	  var EVENT_FOCUSIN = "focusin" + EVENT_KEY$5;
	  var EVENT_RESIZE = "resize" + EVENT_KEY$5;
	  var EVENT_CLICK_DISMISS = "click.dismiss" + EVENT_KEY$5;
	  var EVENT_KEYDOWN_DISMISS = "keydown.dismiss" + EVENT_KEY$5;
	  var EVENT_MOUSEUP_DISMISS = "mouseup.dismiss" + EVENT_KEY$5;
	  var EVENT_MOUSEDOWN_DISMISS = "mousedown.dismiss" + EVENT_KEY$5;
	  var EVENT_CLICK_DATA_API$5 = "click" + EVENT_KEY$5 + DATA_API_KEY$5;
	  var CLASS_NAME_SCROLLABLE = 'modal-dialog-scrollable';
	  var CLASS_NAME_SCROLLBAR_MEASURER = 'modal-scrollbar-measure';
	  var CLASS_NAME_BACKDROP = 'modal-backdrop';
	  var CLASS_NAME_OPEN = 'modal-open';
	  var CLASS_NAME_FADE$1 = 'fade';
	  var CLASS_NAME_SHOW$3 = 'show';
	  var CLASS_NAME_STATIC = 'modal-static';
	  var SELECTOR_DIALOG = '.modal-dialog';
	  var SELECTOR_MODAL_BODY = '.modal-body';
	  var SELECTOR_DATA_TOGGLE$3 = '[data-toggle="modal"]';
	  var SELECTOR_DATA_DISMISS = '[data-dismiss="modal"]';
	  var SELECTOR_FIXED_CONTENT = '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top';
	  var SELECTOR_STICKY_CONTENT = '.sticky-top';
	  /**
	   * ------------------------------------------------------------------------
	   * Class Definition
	   * ------------------------------------------------------------------------
	   */

	  var Modal = /*#__PURE__*/function () {
	    function Modal(element, config) {
	      this._config = this._getConfig(config);
	      this._element = element;
	      this._dialog = element.querySelector(SELECTOR_DIALOG);
	      this._backdrop = null;
	      this._isShown = false;
	      this._isBodyOverflowing = false;
	      this._ignoreBackdropClick = false;
	      this._isTransitioning = false;
	      this._scrollbarWidth = 0;
	    } // Getters


	    var _proto = Modal.prototype;

	    // Public
	    _proto.toggle = function toggle(relatedTarget) {
	      return this._isShown ? this.hide() : this.show(relatedTarget);
	    };

	    _proto.show = function show(relatedTarget) {
	      var _this = this;

	      if (this._isShown || this._isTransitioning) {
	        return;
	      }

	      if ($__default['default'](this._element).hasClass(CLASS_NAME_FADE$1)) {
	        this._isTransitioning = true;
	      }

	      var showEvent = $__default['default'].Event(EVENT_SHOW$2, {
	        relatedTarget: relatedTarget
	      });
	      $__default['default'](this._element).trigger(showEvent);

	      if (this._isShown || showEvent.isDefaultPrevented()) {
	        return;
	      }

	      this._isShown = true;

	      this._checkScrollbar();

	      this._setScrollbar();

	      this._adjustDialog();

	      this._setEscapeEvent();

	      this._setResizeEvent();

	      $__default['default'](this._element).on(EVENT_CLICK_DISMISS, SELECTOR_DATA_DISMISS, function (event) {
	        return _this.hide(event);
	      });
	      $__default['default'](this._dialog).on(EVENT_MOUSEDOWN_DISMISS, function () {
	        $__default['default'](_this._element).one(EVENT_MOUSEUP_DISMISS, function (event) {
	          if ($__default['default'](event.target).is(_this._element)) {
	            _this._ignoreBackdropClick = true;
	          }
	        });
	      });

	      this._showBackdrop(function () {
	        return _this._showElement(relatedTarget);
	      });
	    };

	    _proto.hide = function hide(event) {
	      var _this2 = this;

	      if (event) {
	        event.preventDefault();
	      }

	      if (!this._isShown || this._isTransitioning) {
	        return;
	      }

	      var hideEvent = $__default['default'].Event(EVENT_HIDE$2);
	      $__default['default'](this._element).trigger(hideEvent);

	      if (!this._isShown || hideEvent.isDefaultPrevented()) {
	        return;
	      }

	      this._isShown = false;
	      var transition = $__default['default'](this._element).hasClass(CLASS_NAME_FADE$1);

	      if (transition) {
	        this._isTransitioning = true;
	      }

	      this._setEscapeEvent();

	      this._setResizeEvent();

	      $__default['default'](document).off(EVENT_FOCUSIN);
	      $__default['default'](this._element).removeClass(CLASS_NAME_SHOW$3);
	      $__default['default'](this._element).off(EVENT_CLICK_DISMISS);
	      $__default['default'](this._dialog).off(EVENT_MOUSEDOWN_DISMISS);

	      if (transition) {
	        var transitionDuration = Util.getTransitionDurationFromElement(this._element);
	        $__default['default'](this._element).one(Util.TRANSITION_END, function (event) {
	          return _this2._hideModal(event);
	        }).emulateTransitionEnd(transitionDuration);
	      } else {
	        this._hideModal();
	      }
	    };

	    _proto.dispose = function dispose() {
	      [window, this._element, this._dialog].forEach(function (htmlElement) {
	        return $__default['default'](htmlElement).off(EVENT_KEY$5);
	      });
	      /**
	       * `document` has 2 events `EVENT_FOCUSIN` and `EVENT_CLICK_DATA_API`
	       * Do not move `document` in `htmlElements` array
	       * It will remove `EVENT_CLICK_DATA_API` event that should remain
	       */

	      $__default['default'](document).off(EVENT_FOCUSIN);
	      $__default['default'].removeData(this._element, DATA_KEY$5);
	      this._config = null;
	      this._element = null;
	      this._dialog = null;
	      this._backdrop = null;
	      this._isShown = null;
	      this._isBodyOverflowing = null;
	      this._ignoreBackdropClick = null;
	      this._isTransitioning = null;
	      this._scrollbarWidth = null;
	    };

	    _proto.handleUpdate = function handleUpdate() {
	      this._adjustDialog();
	    } // Private
	    ;

	    _proto._getConfig = function _getConfig(config) {
	      config = _extends({}, Default$3, config);
	      Util.typeCheckConfig(NAME$5, config, DefaultType$3);
	      return config;
	    };

	    _proto._triggerBackdropTransition = function _triggerBackdropTransition() {
	      var _this3 = this;

	      if (this._config.backdrop === 'static') {
	        var hideEventPrevented = $__default['default'].Event(EVENT_HIDE_PREVENTED);
	        $__default['default'](this._element).trigger(hideEventPrevented);

	        if (hideEventPrevented.isDefaultPrevented()) {
	          return;
	        }

	        var isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;

	        if (!isModalOverflowing) {
	          this._element.style.overflowY = 'hidden';
	        }

	        this._element.classList.add(CLASS_NAME_STATIC);

	        var modalTransitionDuration = Util.getTransitionDurationFromElement(this._dialog);
	        $__default['default'](this._element).off(Util.TRANSITION_END);
	        $__default['default'](this._element).one(Util.TRANSITION_END, function () {
	          _this3._element.classList.remove(CLASS_NAME_STATIC);

	          if (!isModalOverflowing) {
	            $__default['default'](_this3._element).one(Util.TRANSITION_END, function () {
	              _this3._element.style.overflowY = '';
	            }).emulateTransitionEnd(_this3._element, modalTransitionDuration);
	          }
	        }).emulateTransitionEnd(modalTransitionDuration);

	        this._element.focus();
	      } else {
	        this.hide();
	      }
	    };

	    _proto._showElement = function _showElement(relatedTarget) {
	      var _this4 = this;

	      var transition = $__default['default'](this._element).hasClass(CLASS_NAME_FADE$1);
	      var modalBody = this._dialog ? this._dialog.querySelector(SELECTOR_MODAL_BODY) : null;

	      if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
	        // Don't move modal's DOM position
	        document.body.appendChild(this._element);
	      }

	      this._element.style.display = 'block';

	      this._element.removeAttribute('aria-hidden');

	      this._element.setAttribute('aria-modal', true);

	      this._element.setAttribute('role', 'dialog');

	      if ($__default['default'](this._dialog).hasClass(CLASS_NAME_SCROLLABLE) && modalBody) {
	        modalBody.scrollTop = 0;
	      } else {
	        this._element.scrollTop = 0;
	      }

	      if (transition) {
	        Util.reflow(this._element);
	      }

	      $__default['default'](this._element).addClass(CLASS_NAME_SHOW$3);

	      if (this._config.focus) {
	        this._enforceFocus();
	      }

	      var shownEvent = $__default['default'].Event(EVENT_SHOWN$2, {
	        relatedTarget: relatedTarget
	      });

	      var transitionComplete = function transitionComplete() {
	        if (_this4._config.focus) {
	          _this4._element.focus();
	        }

	        _this4._isTransitioning = false;
	        $__default['default'](_this4._element).trigger(shownEvent);
	      };

	      if (transition) {
	        var transitionDuration = Util.getTransitionDurationFromElement(this._dialog);
	        $__default['default'](this._dialog).one(Util.TRANSITION_END, transitionComplete).emulateTransitionEnd(transitionDuration);
	      } else {
	        transitionComplete();
	      }
	    };

	    _proto._enforceFocus = function _enforceFocus() {
	      var _this5 = this;

	      $__default['default'](document).off(EVENT_FOCUSIN) // Guard against infinite focus loop
	      .on(EVENT_FOCUSIN, function (event) {
	        if (document !== event.target && _this5._element !== event.target && $__default['default'](_this5._element).has(event.target).length === 0) {
	          _this5._element.focus();
	        }
	      });
	    };

	    _proto._setEscapeEvent = function _setEscapeEvent() {
	      var _this6 = this;

	      if (this._isShown) {
	        $__default['default'](this._element).on(EVENT_KEYDOWN_DISMISS, function (event) {
	          if (_this6._config.keyboard && event.which === ESCAPE_KEYCODE$1) {
	            event.preventDefault();

	            _this6.hide();
	          } else if (!_this6._config.keyboard && event.which === ESCAPE_KEYCODE$1) {
	            _this6._triggerBackdropTransition();
	          }
	        });
	      } else if (!this._isShown) {
	        $__default['default'](this._element).off(EVENT_KEYDOWN_DISMISS);
	      }
	    };

	    _proto._setResizeEvent = function _setResizeEvent() {
	      var _this7 = this;

	      if (this._isShown) {
	        $__default['default'](window).on(EVENT_RESIZE, function (event) {
	          return _this7.handleUpdate(event);
	        });
	      } else {
	        $__default['default'](window).off(EVENT_RESIZE);
	      }
	    };

	    _proto._hideModal = function _hideModal() {
	      var _this8 = this;

	      this._element.style.display = 'none';

	      this._element.setAttribute('aria-hidden', true);

	      this._element.removeAttribute('aria-modal');

	      this._element.removeAttribute('role');

	      this._isTransitioning = false;

	      this._showBackdrop(function () {
	        $__default['default'](document.body).removeClass(CLASS_NAME_OPEN);

	        _this8._resetAdjustments();

	        _this8._resetScrollbar();

	        $__default['default'](_this8._element).trigger(EVENT_HIDDEN$2);
	      });
	    };

	    _proto._removeBackdrop = function _removeBackdrop() {
	      if (this._backdrop) {
	        $__default['default'](this._backdrop).remove();
	        this._backdrop = null;
	      }
	    };

	    _proto._showBackdrop = function _showBackdrop(callback) {
	      var _this9 = this;

	      var animate = $__default['default'](this._element).hasClass(CLASS_NAME_FADE$1) ? CLASS_NAME_FADE$1 : '';

	      if (this._isShown && this._config.backdrop) {
	        this._backdrop = document.createElement('div');
	        this._backdrop.className = CLASS_NAME_BACKDROP;

	        if (animate) {
	          this._backdrop.classList.add(animate);
	        }

	        $__default['default'](this._backdrop).appendTo(document.body);
	        $__default['default'](this._element).on(EVENT_CLICK_DISMISS, function (event) {
	          if (_this9._ignoreBackdropClick) {
	            _this9._ignoreBackdropClick = false;
	            return;
	          }

	          if (event.target !== event.currentTarget) {
	            return;
	          }

	          _this9._triggerBackdropTransition();
	        });

	        if (animate) {
	          Util.reflow(this._backdrop);
	        }

	        $__default['default'](this._backdrop).addClass(CLASS_NAME_SHOW$3);

	        if (!callback) {
	          return;
	        }

	        if (!animate) {
	          callback();
	          return;
	        }

	        var backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop);
	        $__default['default'](this._backdrop).one(Util.TRANSITION_END, callback).emulateTransitionEnd(backdropTransitionDuration);
	      } else if (!this._isShown && this._backdrop) {
	        $__default['default'](this._backdrop).removeClass(CLASS_NAME_SHOW$3);

	        var callbackRemove = function callbackRemove() {
	          _this9._removeBackdrop();

	          if (callback) {
	            callback();
	          }
	        };

	        if ($__default['default'](this._element).hasClass(CLASS_NAME_FADE$1)) {
	          var _backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop);

	          $__default['default'](this._backdrop).one(Util.TRANSITION_END, callbackRemove).emulateTransitionEnd(_backdropTransitionDuration);
	        } else {
	          callbackRemove();
	        }
	      } else if (callback) {
	        callback();
	      }
	    } // ----------------------------------------------------------------------
	    // the following methods are used to handle overflowing modals
	    // todo (fat): these should probably be refactored out of modal.js
	    // ----------------------------------------------------------------------
	    ;

	    _proto._adjustDialog = function _adjustDialog() {
	      var isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;

	      if (!this._isBodyOverflowing && isModalOverflowing) {
	        this._element.style.paddingLeft = this._scrollbarWidth + "px";
	      }

	      if (this._isBodyOverflowing && !isModalOverflowing) {
	        this._element.style.paddingRight = this._scrollbarWidth + "px";
	      }
	    };

	    _proto._resetAdjustments = function _resetAdjustments() {
	      this._element.style.paddingLeft = '';
	      this._element.style.paddingRight = '';
	    };

	    _proto._checkScrollbar = function _checkScrollbar() {
	      var rect = document.body.getBoundingClientRect();
	      this._isBodyOverflowing = Math.round(rect.left + rect.right) < window.innerWidth;
	      this._scrollbarWidth = this._getScrollbarWidth();
	    };

	    _proto._setScrollbar = function _setScrollbar() {
	      var _this10 = this;

	      if (this._isBodyOverflowing) {
	        // Note: DOMNode.style.paddingRight returns the actual value or '' if not set
	        //   while $(DOMNode).css('padding-right') returns the calculated value or 0 if not set
	        var fixedContent = [].slice.call(document.querySelectorAll(SELECTOR_FIXED_CONTENT));
	        var stickyContent = [].slice.call(document.querySelectorAll(SELECTOR_STICKY_CONTENT)); // Adjust fixed content padding

	        $__default['default'](fixedContent).each(function (index, element) {
	          var actualPadding = element.style.paddingRight;
	          var calculatedPadding = $__default['default'](element).css('padding-right');
	          $__default['default'](element).data('padding-right', actualPadding).css('padding-right', parseFloat(calculatedPadding) + _this10._scrollbarWidth + "px");
	        }); // Adjust sticky content margin

	        $__default['default'](stickyContent).each(function (index, element) {
	          var actualMargin = element.style.marginRight;
	          var calculatedMargin = $__default['default'](element).css('margin-right');
	          $__default['default'](element).data('margin-right', actualMargin).css('margin-right', parseFloat(calculatedMargin) - _this10._scrollbarWidth + "px");
	        }); // Adjust body padding

	        var actualPadding = document.body.style.paddingRight;
	        var calculatedPadding = $__default['default'](document.body).css('padding-right');
	        $__default['default'](document.body).data('padding-right', actualPadding).css('padding-right', parseFloat(calculatedPadding) + this._scrollbarWidth + "px");
	      }

	      $__default['default'](document.body).addClass(CLASS_NAME_OPEN);
	    };

	    _proto._resetScrollbar = function _resetScrollbar() {
	      // Restore fixed content padding
	      var fixedContent = [].slice.call(document.querySelectorAll(SELECTOR_FIXED_CONTENT));
	      $__default['default'](fixedContent).each(function (index, element) {
	        var padding = $__default['default'](element).data('padding-right');
	        $__default['default'](element).removeData('padding-right');
	        element.style.paddingRight = padding ? padding : '';
	      }); // Restore sticky content

	      var elements = [].slice.call(document.querySelectorAll("" + SELECTOR_STICKY_CONTENT));
	      $__default['default'](elements).each(function (index, element) {
	        var margin = $__default['default'](element).data('margin-right');

	        if (typeof margin !== 'undefined') {
	          $__default['default'](element).css('margin-right', margin).removeData('margin-right');
	        }
	      }); // Restore body padding

	      var padding = $__default['default'](document.body).data('padding-right');
	      $__default['default'](document.body).removeData('padding-right');
	      document.body.style.paddingRight = padding ? padding : '';
	    };

	    _proto._getScrollbarWidth = function _getScrollbarWidth() {
	      // thx d.walsh
	      var scrollDiv = document.createElement('div');
	      scrollDiv.className = CLASS_NAME_SCROLLBAR_MEASURER;
	      document.body.appendChild(scrollDiv);
	      var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
	      document.body.removeChild(scrollDiv);
	      return scrollbarWidth;
	    } // Static
	    ;

	    Modal._jQueryInterface = function _jQueryInterface(config, relatedTarget) {
	      return this.each(function () {
	        var data = $__default['default'](this).data(DATA_KEY$5);

	        var _config = _extends({}, Default$3, $__default['default'](this).data(), typeof config === 'object' && config ? config : {});

	        if (!data) {
	          data = new Modal(this, _config);
	          $__default['default'](this).data(DATA_KEY$5, data);
	        }

	        if (typeof config === 'string') {
	          if (typeof data[config] === 'undefined') {
	            throw new TypeError("No method named \"" + config + "\"");
	          }

	          data[config](relatedTarget);
	        } else if (_config.show) {
	          data.show(relatedTarget);
	        }
	      });
	    };

	    _createClass(Modal, null, [{
	      key: "VERSION",
	      get: function get() {
	        return VERSION$5;
	      }
	    }, {
	      key: "Default",
	      get: function get() {
	        return Default$3;
	      }
	    }]);

	    return Modal;
	  }();
	  /**
	   * ------------------------------------------------------------------------
	   * Data Api implementation
	   * ------------------------------------------------------------------------
	   */


	  $__default['default'](document).on(EVENT_CLICK_DATA_API$5, SELECTOR_DATA_TOGGLE$3, function (event) {
	    var _this11 = this;

	    var target;
	    var selector = Util.getSelectorFromElement(this);

	    if (selector) {
	      target = document.querySelector(selector);
	    }

	    var config = $__default['default'](target).data(DATA_KEY$5) ? 'toggle' : _extends({}, $__default['default'](target).data(), $__default['default'](this).data());

	    if (this.tagName === 'A' || this.tagName === 'AREA') {
	      event.preventDefault();
	    }

	    var $target = $__default['default'](target).one(EVENT_SHOW$2, function (showEvent) {
	      if (showEvent.isDefaultPrevented()) {
	        // Only register focus restorer if modal will actually get shown
	        return;
	      }

	      $target.one(EVENT_HIDDEN$2, function () {
	        if ($__default['default'](_this11).is(':visible')) {
	          _this11.focus();
	        }
	      });
	    });

	    Modal._jQueryInterface.call($__default['default'](target), config, this);
	  });
	  /**
	   * ------------------------------------------------------------------------
	   * jQuery
	   * ------------------------------------------------------------------------
	   */

	  $__default['default'].fn[NAME$5] = Modal._jQueryInterface;
	  $__default['default'].fn[NAME$5].Constructor = Modal;

	  $__default['default'].fn[NAME$5].noConflict = function () {
	    $__default['default'].fn[NAME$5] = JQUERY_NO_CONFLICT$5;
	    return Modal._jQueryInterface;
	  };

	  /**
	   * --------------------------------------------------------------------------
	   * Bootstrap (v4.5.3): tools/sanitizer.js
	   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	   * --------------------------------------------------------------------------
	   */
	  var uriAttrs = ['background', 'cite', 'href', 'itemtype', 'longdesc', 'poster', 'src', 'xlink:href'];
	  var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
	  var DefaultWhitelist = {
	    // Global attributes allowed on any supplied element below.
	    '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
	    a: ['target', 'href', 'title', 'rel'],
	    area: [],
	    b: [],
	    br: [],
	    col: [],
	    code: [],
	    div: [],
	    em: [],
	    hr: [],
	    h1: [],
	    h2: [],
	    h3: [],
	    h4: [],
	    h5: [],
	    h6: [],
	    i: [],
	    img: ['src', 'srcset', 'alt', 'title', 'width', 'height'],
	    li: [],
	    ol: [],
	    p: [],
	    pre: [],
	    s: [],
	    small: [],
	    span: [],
	    sub: [],
	    sup: [],
	    strong: [],
	    u: [],
	    ul: []
	  };
	  /**
	   * A pattern that recognizes a commonly useful subset of URLs that are safe.
	   *
	   * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
	   */

	  var SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^#&/:?]*(?:[#/?]|$))/gi;
	  /**
	   * A pattern that matches safe data URLs. Only matches image, video and audio types.
	   *
	   * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
	   */

	  var DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[\d+/a-z]+=*$/i;

	  function allowedAttribute(attr, allowedAttributeList) {
	    var attrName = attr.nodeName.toLowerCase();

	    if (allowedAttributeList.indexOf(attrName) !== -1) {
	      if (uriAttrs.indexOf(attrName) !== -1) {
	        return Boolean(attr.nodeValue.match(SAFE_URL_PATTERN) || attr.nodeValue.match(DATA_URL_PATTERN));
	      }

	      return true;
	    }

	    var regExp = allowedAttributeList.filter(function (attrRegex) {
	      return attrRegex instanceof RegExp;
	    }); // Check if a regular expression validates the attribute.

	    for (var i = 0, len = regExp.length; i < len; i++) {
	      if (attrName.match(regExp[i])) {
	        return true;
	      }
	    }

	    return false;
	  }

	  function sanitizeHtml(unsafeHtml, whiteList, sanitizeFn) {
	    if (unsafeHtml.length === 0) {
	      return unsafeHtml;
	    }

	    if (sanitizeFn && typeof sanitizeFn === 'function') {
	      return sanitizeFn(unsafeHtml);
	    }

	    var domParser = new window.DOMParser();
	    var createdDocument = domParser.parseFromString(unsafeHtml, 'text/html');
	    var whitelistKeys = Object.keys(whiteList);
	    var elements = [].slice.call(createdDocument.body.querySelectorAll('*'));

	    var _loop = function _loop(i, len) {
	      var el = elements[i];
	      var elName = el.nodeName.toLowerCase();

	      if (whitelistKeys.indexOf(el.nodeName.toLowerCase()) === -1) {
	        el.parentNode.removeChild(el);
	        return "continue";
	      }

	      var attributeList = [].slice.call(el.attributes);
	      var whitelistedAttributes = [].concat(whiteList['*'] || [], whiteList[elName] || []);
	      attributeList.forEach(function (attr) {
	        if (!allowedAttribute(attr, whitelistedAttributes)) {
	          el.removeAttribute(attr.nodeName);
	        }
	      });
	    };

	    for (var i = 0, len = elements.length; i < len; i++) {
	      var _ret = _loop(i);

	      if (_ret === "continue") continue;
	    }

	    return createdDocument.body.innerHTML;
	  }

	  /**
	   * ------------------------------------------------------------------------
	   * Constants
	   * ------------------------------------------------------------------------
	   */

	  var NAME$6 = 'tooltip';
	  var VERSION$6 = '4.5.3';
	  var DATA_KEY$6 = 'bs.tooltip';
	  var EVENT_KEY$6 = "." + DATA_KEY$6;
	  var JQUERY_NO_CONFLICT$6 = $__default['default'].fn[NAME$6];
	  var CLASS_PREFIX = 'bs-tooltip';
	  var BSCLS_PREFIX_REGEX = new RegExp("(^|\\s)" + CLASS_PREFIX + "\\S+", 'g');
	  var DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn'];
	  var DefaultType$4 = {
	    animation: 'boolean',
	    template: 'string',
	    title: '(string|element|function)',
	    trigger: 'string',
	    delay: '(number|object)',
	    html: 'boolean',
	    selector: '(string|boolean)',
	    placement: '(string|function)',
	    offset: '(number|string|function)',
	    container: '(string|element|boolean)',
	    fallbackPlacement: '(string|array)',
	    boundary: '(string|element)',
	    sanitize: 'boolean',
	    sanitizeFn: '(null|function)',
	    whiteList: 'object',
	    popperConfig: '(null|object)'
	  };
	  var AttachmentMap = {
	    AUTO: 'auto',
	    TOP: 'top',
	    RIGHT: 'right',
	    BOTTOM: 'bottom',
	    LEFT: 'left'
	  };
	  var Default$4 = {
	    animation: true,
	    template: '<div class="tooltip" role="tooltip">' + '<div class="arrow"></div>' + '<div class="tooltip-inner"></div></div>',
	    trigger: 'hover focus',
	    title: '',
	    delay: 0,
	    html: false,
	    selector: false,
	    placement: 'top',
	    offset: 0,
	    container: false,
	    fallbackPlacement: 'flip',
	    boundary: 'scrollParent',
	    sanitize: true,
	    sanitizeFn: null,
	    whiteList: DefaultWhitelist,
	    popperConfig: null
	  };
	  var HOVER_STATE_SHOW = 'show';
	  var HOVER_STATE_OUT = 'out';
	  var Event = {
	    HIDE: "hide" + EVENT_KEY$6,
	    HIDDEN: "hidden" + EVENT_KEY$6,
	    SHOW: "show" + EVENT_KEY$6,
	    SHOWN: "shown" + EVENT_KEY$6,
	    INSERTED: "inserted" + EVENT_KEY$6,
	    CLICK: "click" + EVENT_KEY$6,
	    FOCUSIN: "focusin" + EVENT_KEY$6,
	    FOCUSOUT: "focusout" + EVENT_KEY$6,
	    MOUSEENTER: "mouseenter" + EVENT_KEY$6,
	    MOUSELEAVE: "mouseleave" + EVENT_KEY$6
	  };
	  var CLASS_NAME_FADE$2 = 'fade';
	  var CLASS_NAME_SHOW$4 = 'show';
	  var SELECTOR_TOOLTIP_INNER = '.tooltip-inner';
	  var SELECTOR_ARROW = '.arrow';
	  var TRIGGER_HOVER = 'hover';
	  var TRIGGER_FOCUS = 'focus';
	  var TRIGGER_CLICK = 'click';
	  var TRIGGER_MANUAL = 'manual';
	  /**
	   * ------------------------------------------------------------------------
	   * Class Definition
	   * ------------------------------------------------------------------------
	   */

	  var Tooltip = /*#__PURE__*/function () {
	    function Tooltip(element, config) {
	      if (typeof Popper__default['default'] === 'undefined') {
	        throw new TypeError('Bootstrap\'s tooltips require Popper.js (https://popper.js.org/)');
	      } // private


	      this._isEnabled = true;
	      this._timeout = 0;
	      this._hoverState = '';
	      this._activeTrigger = {};
	      this._popper = null; // Protected

	      this.element = element;
	      this.config = this._getConfig(config);
	      this.tip = null;

	      this._setListeners();
	    } // Getters


	    var _proto = Tooltip.prototype;

	    // Public
	    _proto.enable = function enable() {
	      this._isEnabled = true;
	    };

	    _proto.disable = function disable() {
	      this._isEnabled = false;
	    };

	    _proto.toggleEnabled = function toggleEnabled() {
	      this._isEnabled = !this._isEnabled;
	    };

	    _proto.toggle = function toggle(event) {
	      if (!this._isEnabled) {
	        return;
	      }

	      if (event) {
	        var dataKey = this.constructor.DATA_KEY;
	        var context = $__default['default'](event.currentTarget).data(dataKey);

	        if (!context) {
	          context = new this.constructor(event.currentTarget, this._getDelegateConfig());
	          $__default['default'](event.currentTarget).data(dataKey, context);
	        }

	        context._activeTrigger.click = !context._activeTrigger.click;

	        if (context._isWithActiveTrigger()) {
	          context._enter(null, context);
	        } else {
	          context._leave(null, context);
	        }
	      } else {
	        if ($__default['default'](this.getTipElement()).hasClass(CLASS_NAME_SHOW$4)) {
	          this._leave(null, this);

	          return;
	        }

	        this._enter(null, this);
	      }
	    };

	    _proto.dispose = function dispose() {
	      clearTimeout(this._timeout);
	      $__default['default'].removeData(this.element, this.constructor.DATA_KEY);
	      $__default['default'](this.element).off(this.constructor.EVENT_KEY);
	      $__default['default'](this.element).closest('.modal').off('hide.bs.modal', this._hideModalHandler);

	      if (this.tip) {
	        $__default['default'](this.tip).remove();
	      }

	      this._isEnabled = null;
	      this._timeout = null;
	      this._hoverState = null;
	      this._activeTrigger = null;

	      if (this._popper) {
	        this._popper.destroy();
	      }

	      this._popper = null;
	      this.element = null;
	      this.config = null;
	      this.tip = null;
	    };

	    _proto.show = function show() {
	      var _this = this;

	      if ($__default['default'](this.element).css('display') === 'none') {
	        throw new Error('Please use show on visible elements');
	      }

	      var showEvent = $__default['default'].Event(this.constructor.Event.SHOW);

	      if (this.isWithContent() && this._isEnabled) {
	        $__default['default'](this.element).trigger(showEvent);
	        var shadowRoot = Util.findShadowRoot(this.element);
	        var isInTheDom = $__default['default'].contains(shadowRoot !== null ? shadowRoot : this.element.ownerDocument.documentElement, this.element);

	        if (showEvent.isDefaultPrevented() || !isInTheDom) {
	          return;
	        }

	        var tip = this.getTipElement();
	        var tipId = Util.getUID(this.constructor.NAME);
	        tip.setAttribute('id', tipId);
	        this.element.setAttribute('aria-describedby', tipId);
	        this.setContent();

	        if (this.config.animation) {
	          $__default['default'](tip).addClass(CLASS_NAME_FADE$2);
	        }

	        var placement = typeof this.config.placement === 'function' ? this.config.placement.call(this, tip, this.element) : this.config.placement;

	        var attachment = this._getAttachment(placement);

	        this.addAttachmentClass(attachment);

	        var container = this._getContainer();

	        $__default['default'](tip).data(this.constructor.DATA_KEY, this);

	        if (!$__default['default'].contains(this.element.ownerDocument.documentElement, this.tip)) {
	          $__default['default'](tip).appendTo(container);
	        }

	        $__default['default'](this.element).trigger(this.constructor.Event.INSERTED);
	        this._popper = new Popper__default['default'](this.element, tip, this._getPopperConfig(attachment));
	        $__default['default'](tip).addClass(CLASS_NAME_SHOW$4); // If this is a touch-enabled device we add extra
	        // empty mouseover listeners to the body's immediate children;
	        // only needed because of broken event delegation on iOS
	        // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

	        if ('ontouchstart' in document.documentElement) {
	          $__default['default'](document.body).children().on('mouseover', null, $__default['default'].noop);
	        }

	        var complete = function complete() {
	          if (_this.config.animation) {
	            _this._fixTransition();
	          }

	          var prevHoverState = _this._hoverState;
	          _this._hoverState = null;
	          $__default['default'](_this.element).trigger(_this.constructor.Event.SHOWN);

	          if (prevHoverState === HOVER_STATE_OUT) {
	            _this._leave(null, _this);
	          }
	        };

	        if ($__default['default'](this.tip).hasClass(CLASS_NAME_FADE$2)) {
	          var transitionDuration = Util.getTransitionDurationFromElement(this.tip);
	          $__default['default'](this.tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
	        } else {
	          complete();
	        }
	      }
	    };

	    _proto.hide = function hide(callback) {
	      var _this2 = this;

	      var tip = this.getTipElement();
	      var hideEvent = $__default['default'].Event(this.constructor.Event.HIDE);

	      var complete = function complete() {
	        if (_this2._hoverState !== HOVER_STATE_SHOW && tip.parentNode) {
	          tip.parentNode.removeChild(tip);
	        }

	        _this2._cleanTipClass();

	        _this2.element.removeAttribute('aria-describedby');

	        $__default['default'](_this2.element).trigger(_this2.constructor.Event.HIDDEN);

	        if (_this2._popper !== null) {
	          _this2._popper.destroy();
	        }

	        if (callback) {
	          callback();
	        }
	      };

	      $__default['default'](this.element).trigger(hideEvent);

	      if (hideEvent.isDefaultPrevented()) {
	        return;
	      }

	      $__default['default'](tip).removeClass(CLASS_NAME_SHOW$4); // If this is a touch-enabled device we remove the extra
	      // empty mouseover listeners we added for iOS support

	      if ('ontouchstart' in document.documentElement) {
	        $__default['default'](document.body).children().off('mouseover', null, $__default['default'].noop);
	      }

	      this._activeTrigger[TRIGGER_CLICK] = false;
	      this._activeTrigger[TRIGGER_FOCUS] = false;
	      this._activeTrigger[TRIGGER_HOVER] = false;

	      if ($__default['default'](this.tip).hasClass(CLASS_NAME_FADE$2)) {
	        var transitionDuration = Util.getTransitionDurationFromElement(tip);
	        $__default['default'](tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
	      } else {
	        complete();
	      }

	      this._hoverState = '';
	    };

	    _proto.update = function update() {
	      if (this._popper !== null) {
	        this._popper.scheduleUpdate();
	      }
	    } // Protected
	    ;

	    _proto.isWithContent = function isWithContent() {
	      return Boolean(this.getTitle());
	    };

	    _proto.addAttachmentClass = function addAttachmentClass(attachment) {
	      $__default['default'](this.getTipElement()).addClass(CLASS_PREFIX + "-" + attachment);
	    };

	    _proto.getTipElement = function getTipElement() {
	      this.tip = this.tip || $__default['default'](this.config.template)[0];
	      return this.tip;
	    };

	    _proto.setContent = function setContent() {
	      var tip = this.getTipElement();
	      this.setElementContent($__default['default'](tip.querySelectorAll(SELECTOR_TOOLTIP_INNER)), this.getTitle());
	      $__default['default'](tip).removeClass(CLASS_NAME_FADE$2 + " " + CLASS_NAME_SHOW$4);
	    };

	    _proto.setElementContent = function setElementContent($element, content) {
	      if (typeof content === 'object' && (content.nodeType || content.jquery)) {
	        // Content is a DOM node or a jQuery
	        if (this.config.html) {
	          if (!$__default['default'](content).parent().is($element)) {
	            $element.empty().append(content);
	          }
	        } else {
	          $element.text($__default['default'](content).text());
	        }

	        return;
	      }

	      if (this.config.html) {
	        if (this.config.sanitize) {
	          content = sanitizeHtml(content, this.config.whiteList, this.config.sanitizeFn);
	        }

	        $element.html(content);
	      } else {
	        $element.text(content);
	      }
	    };

	    _proto.getTitle = function getTitle() {
	      var title = this.element.getAttribute('data-original-title');

	      if (!title) {
	        title = typeof this.config.title === 'function' ? this.config.title.call(this.element) : this.config.title;
	      }

	      return title;
	    } // Private
	    ;

	    _proto._getPopperConfig = function _getPopperConfig(attachment) {
	      var _this3 = this;

	      var defaultBsConfig = {
	        placement: attachment,
	        modifiers: {
	          offset: this._getOffset(),
	          flip: {
	            behavior: this.config.fallbackPlacement
	          },
	          arrow: {
	            element: SELECTOR_ARROW
	          },
	          preventOverflow: {
	            boundariesElement: this.config.boundary
	          }
	        },
	        onCreate: function onCreate(data) {
	          if (data.originalPlacement !== data.placement) {
	            _this3._handlePopperPlacementChange(data);
	          }
	        },
	        onUpdate: function onUpdate(data) {
	          return _this3._handlePopperPlacementChange(data);
	        }
	      };
	      return _extends({}, defaultBsConfig, this.config.popperConfig);
	    };

	    _proto._getOffset = function _getOffset() {
	      var _this4 = this;

	      var offset = {};

	      if (typeof this.config.offset === 'function') {
	        offset.fn = function (data) {
	          data.offsets = _extends({}, data.offsets, _this4.config.offset(data.offsets, _this4.element) || {});
	          return data;
	        };
	      } else {
	        offset.offset = this.config.offset;
	      }

	      return offset;
	    };

	    _proto._getContainer = function _getContainer() {
	      if (this.config.container === false) {
	        return document.body;
	      }

	      if (Util.isElement(this.config.container)) {
	        return $__default['default'](this.config.container);
	      }

	      return $__default['default'](document).find(this.config.container);
	    };

	    _proto._getAttachment = function _getAttachment(placement) {
	      return AttachmentMap[placement.toUpperCase()];
	    };

	    _proto._setListeners = function _setListeners() {
	      var _this5 = this;

	      var triggers = this.config.trigger.split(' ');
	      triggers.forEach(function (trigger) {
	        if (trigger === 'click') {
	          $__default['default'](_this5.element).on(_this5.constructor.Event.CLICK, _this5.config.selector, function (event) {
	            return _this5.toggle(event);
	          });
	        } else if (trigger !== TRIGGER_MANUAL) {
	          var eventIn = trigger === TRIGGER_HOVER ? _this5.constructor.Event.MOUSEENTER : _this5.constructor.Event.FOCUSIN;
	          var eventOut = trigger === TRIGGER_HOVER ? _this5.constructor.Event.MOUSELEAVE : _this5.constructor.Event.FOCUSOUT;
	          $__default['default'](_this5.element).on(eventIn, _this5.config.selector, function (event) {
	            return _this5._enter(event);
	          }).on(eventOut, _this5.config.selector, function (event) {
	            return _this5._leave(event);
	          });
	        }
	      });

	      this._hideModalHandler = function () {
	        if (_this5.element) {
	          _this5.hide();
	        }
	      };

	      $__default['default'](this.element).closest('.modal').on('hide.bs.modal', this._hideModalHandler);

	      if (this.config.selector) {
	        this.config = _extends({}, this.config, {
	          trigger: 'manual',
	          selector: ''
	        });
	      } else {
	        this._fixTitle();
	      }
	    };

	    _proto._fixTitle = function _fixTitle() {
	      var titleType = typeof this.element.getAttribute('data-original-title');

	      if (this.element.getAttribute('title') || titleType !== 'string') {
	        this.element.setAttribute('data-original-title', this.element.getAttribute('title') || '');
	        this.element.setAttribute('title', '');
	      }
	    };

	    _proto._enter = function _enter(event, context) {
	      var dataKey = this.constructor.DATA_KEY;
	      context = context || $__default['default'](event.currentTarget).data(dataKey);

	      if (!context) {
	        context = new this.constructor(event.currentTarget, this._getDelegateConfig());
	        $__default['default'](event.currentTarget).data(dataKey, context);
	      }

	      if (event) {
	        context._activeTrigger[event.type === 'focusin' ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
	      }

	      if ($__default['default'](context.getTipElement()).hasClass(CLASS_NAME_SHOW$4) || context._hoverState === HOVER_STATE_SHOW) {
	        context._hoverState = HOVER_STATE_SHOW;
	        return;
	      }

	      clearTimeout(context._timeout);
	      context._hoverState = HOVER_STATE_SHOW;

	      if (!context.config.delay || !context.config.delay.show) {
	        context.show();
	        return;
	      }

	      context._timeout = setTimeout(function () {
	        if (context._hoverState === HOVER_STATE_SHOW) {
	          context.show();
	        }
	      }, context.config.delay.show);
	    };

	    _proto._leave = function _leave(event, context) {
	      var dataKey = this.constructor.DATA_KEY;
	      context = context || $__default['default'](event.currentTarget).data(dataKey);

	      if (!context) {
	        context = new this.constructor(event.currentTarget, this._getDelegateConfig());
	        $__default['default'](event.currentTarget).data(dataKey, context);
	      }

	      if (event) {
	        context._activeTrigger[event.type === 'focusout' ? TRIGGER_FOCUS : TRIGGER_HOVER] = false;
	      }

	      if (context._isWithActiveTrigger()) {
	        return;
	      }

	      clearTimeout(context._timeout);
	      context._hoverState = HOVER_STATE_OUT;

	      if (!context.config.delay || !context.config.delay.hide) {
	        context.hide();
	        return;
	      }

	      context._timeout = setTimeout(function () {
	        if (context._hoverState === HOVER_STATE_OUT) {
	          context.hide();
	        }
	      }, context.config.delay.hide);
	    };

	    _proto._isWithActiveTrigger = function _isWithActiveTrigger() {
	      for (var trigger in this._activeTrigger) {
	        if (this._activeTrigger[trigger]) {
	          return true;
	        }
	      }

	      return false;
	    };

	    _proto._getConfig = function _getConfig(config) {
	      var dataAttributes = $__default['default'](this.element).data();
	      Object.keys(dataAttributes).forEach(function (dataAttr) {
	        if (DISALLOWED_ATTRIBUTES.indexOf(dataAttr) !== -1) {
	          delete dataAttributes[dataAttr];
	        }
	      });
	      config = _extends({}, this.constructor.Default, dataAttributes, typeof config === 'object' && config ? config : {});

	      if (typeof config.delay === 'number') {
	        config.delay = {
	          show: config.delay,
	          hide: config.delay
	        };
	      }

	      if (typeof config.title === 'number') {
	        config.title = config.title.toString();
	      }

	      if (typeof config.content === 'number') {
	        config.content = config.content.toString();
	      }

	      Util.typeCheckConfig(NAME$6, config, this.constructor.DefaultType);

	      if (config.sanitize) {
	        config.template = sanitizeHtml(config.template, config.whiteList, config.sanitizeFn);
	      }

	      return config;
	    };

	    _proto._getDelegateConfig = function _getDelegateConfig() {
	      var config = {};

	      if (this.config) {
	        for (var key in this.config) {
	          if (this.constructor.Default[key] !== this.config[key]) {
	            config[key] = this.config[key];
	          }
	        }
	      }

	      return config;
	    };

	    _proto._cleanTipClass = function _cleanTipClass() {
	      var $tip = $__default['default'](this.getTipElement());
	      var tabClass = $tip.attr('class').match(BSCLS_PREFIX_REGEX);

	      if (tabClass !== null && tabClass.length) {
	        $tip.removeClass(tabClass.join(''));
	      }
	    };

	    _proto._handlePopperPlacementChange = function _handlePopperPlacementChange(popperData) {
	      this.tip = popperData.instance.popper;

	      this._cleanTipClass();

	      this.addAttachmentClass(this._getAttachment(popperData.placement));
	    };

	    _proto._fixTransition = function _fixTransition() {
	      var tip = this.getTipElement();
	      var initConfigAnimation = this.config.animation;

	      if (tip.getAttribute('x-placement') !== null) {
	        return;
	      }

	      $__default['default'](tip).removeClass(CLASS_NAME_FADE$2);
	      this.config.animation = false;
	      this.hide();
	      this.show();
	      this.config.animation = initConfigAnimation;
	    } // Static
	    ;

	    Tooltip._jQueryInterface = function _jQueryInterface(config) {
	      return this.each(function () {
	        var $element = $__default['default'](this);
	        var data = $element.data(DATA_KEY$6);

	        var _config = typeof config === 'object' && config;

	        if (!data && /dispose|hide/.test(config)) {
	          return;
	        }

	        if (!data) {
	          data = new Tooltip(this, _config);
	          $element.data(DATA_KEY$6, data);
	        }

	        if (typeof config === 'string') {
	          if (typeof data[config] === 'undefined') {
	            throw new TypeError("No method named \"" + config + "\"");
	          }

	          data[config]();
	        }
	      });
	    };

	    _createClass(Tooltip, null, [{
	      key: "VERSION",
	      get: function get() {
	        return VERSION$6;
	      }
	    }, {
	      key: "Default",
	      get: function get() {
	        return Default$4;
	      }
	    }, {
	      key: "NAME",
	      get: function get() {
	        return NAME$6;
	      }
	    }, {
	      key: "DATA_KEY",
	      get: function get() {
	        return DATA_KEY$6;
	      }
	    }, {
	      key: "Event",
	      get: function get() {
	        return Event;
	      }
	    }, {
	      key: "EVENT_KEY",
	      get: function get() {
	        return EVENT_KEY$6;
	      }
	    }, {
	      key: "DefaultType",
	      get: function get() {
	        return DefaultType$4;
	      }
	    }]);

	    return Tooltip;
	  }();
	  /**
	   * ------------------------------------------------------------------------
	   * jQuery
	   * ------------------------------------------------------------------------
	   */


	  $__default['default'].fn[NAME$6] = Tooltip._jQueryInterface;
	  $__default['default'].fn[NAME$6].Constructor = Tooltip;

	  $__default['default'].fn[NAME$6].noConflict = function () {
	    $__default['default'].fn[NAME$6] = JQUERY_NO_CONFLICT$6;
	    return Tooltip._jQueryInterface;
	  };

	  /**
	   * ------------------------------------------------------------------------
	   * Constants
	   * ------------------------------------------------------------------------
	   */

	  var NAME$7 = 'popover';
	  var VERSION$7 = '4.5.3';
	  var DATA_KEY$7 = 'bs.popover';
	  var EVENT_KEY$7 = "." + DATA_KEY$7;
	  var JQUERY_NO_CONFLICT$7 = $__default['default'].fn[NAME$7];
	  var CLASS_PREFIX$1 = 'bs-popover';
	  var BSCLS_PREFIX_REGEX$1 = new RegExp("(^|\\s)" + CLASS_PREFIX$1 + "\\S+", 'g');

	  var Default$5 = _extends({}, Tooltip.Default, {
	    placement: 'right',
	    trigger: 'click',
	    content: '',
	    template: '<div class="popover" role="tooltip">' + '<div class="arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div></div>'
	  });

	  var DefaultType$5 = _extends({}, Tooltip.DefaultType, {
	    content: '(string|element|function)'
	  });

	  var CLASS_NAME_FADE$3 = 'fade';
	  var CLASS_NAME_SHOW$5 = 'show';
	  var SELECTOR_TITLE = '.popover-header';
	  var SELECTOR_CONTENT = '.popover-body';
	  var Event$1 = {
	    HIDE: "hide" + EVENT_KEY$7,
	    HIDDEN: "hidden" + EVENT_KEY$7,
	    SHOW: "show" + EVENT_KEY$7,
	    SHOWN: "shown" + EVENT_KEY$7,
	    INSERTED: "inserted" + EVENT_KEY$7,
	    CLICK: "click" + EVENT_KEY$7,
	    FOCUSIN: "focusin" + EVENT_KEY$7,
	    FOCUSOUT: "focusout" + EVENT_KEY$7,
	    MOUSEENTER: "mouseenter" + EVENT_KEY$7,
	    MOUSELEAVE: "mouseleave" + EVENT_KEY$7
	  };
	  /**
	   * ------------------------------------------------------------------------
	   * Class Definition
	   * ------------------------------------------------------------------------
	   */

	  var Popover = /*#__PURE__*/function (_Tooltip) {
	    _inheritsLoose(Popover, _Tooltip);

	    function Popover() {
	      return _Tooltip.apply(this, arguments) || this;
	    }

	    var _proto = Popover.prototype;

	    // Overrides
	    _proto.isWithContent = function isWithContent() {
	      return this.getTitle() || this._getContent();
	    };

	    _proto.addAttachmentClass = function addAttachmentClass(attachment) {
	      $__default['default'](this.getTipElement()).addClass(CLASS_PREFIX$1 + "-" + attachment);
	    };

	    _proto.getTipElement = function getTipElement() {
	      this.tip = this.tip || $__default['default'](this.config.template)[0];
	      return this.tip;
	    };

	    _proto.setContent = function setContent() {
	      var $tip = $__default['default'](this.getTipElement()); // We use append for html objects to maintain js events

	      this.setElementContent($tip.find(SELECTOR_TITLE), this.getTitle());

	      var content = this._getContent();

	      if (typeof content === 'function') {
	        content = content.call(this.element);
	      }

	      this.setElementContent($tip.find(SELECTOR_CONTENT), content);
	      $tip.removeClass(CLASS_NAME_FADE$3 + " " + CLASS_NAME_SHOW$5);
	    } // Private
	    ;

	    _proto._getContent = function _getContent() {
	      return this.element.getAttribute('data-content') || this.config.content;
	    };

	    _proto._cleanTipClass = function _cleanTipClass() {
	      var $tip = $__default['default'](this.getTipElement());
	      var tabClass = $tip.attr('class').match(BSCLS_PREFIX_REGEX$1);

	      if (tabClass !== null && tabClass.length > 0) {
	        $tip.removeClass(tabClass.join(''));
	      }
	    } // Static
	    ;

	    Popover._jQueryInterface = function _jQueryInterface(config) {
	      return this.each(function () {
	        var data = $__default['default'](this).data(DATA_KEY$7);

	        var _config = typeof config === 'object' ? config : null;

	        if (!data && /dispose|hide/.test(config)) {
	          return;
	        }

	        if (!data) {
	          data = new Popover(this, _config);
	          $__default['default'](this).data(DATA_KEY$7, data);
	        }

	        if (typeof config === 'string') {
	          if (typeof data[config] === 'undefined') {
	            throw new TypeError("No method named \"" + config + "\"");
	          }

	          data[config]();
	        }
	      });
	    };

	    _createClass(Popover, null, [{
	      key: "VERSION",
	      // Getters
	      get: function get() {
	        return VERSION$7;
	      }
	    }, {
	      key: "Default",
	      get: function get() {
	        return Default$5;
	      }
	    }, {
	      key: "NAME",
	      get: function get() {
	        return NAME$7;
	      }
	    }, {
	      key: "DATA_KEY",
	      get: function get() {
	        return DATA_KEY$7;
	      }
	    }, {
	      key: "Event",
	      get: function get() {
	        return Event$1;
	      }
	    }, {
	      key: "EVENT_KEY",
	      get: function get() {
	        return EVENT_KEY$7;
	      }
	    }, {
	      key: "DefaultType",
	      get: function get() {
	        return DefaultType$5;
	      }
	    }]);

	    return Popover;
	  }(Tooltip);
	  /**
	   * ------------------------------------------------------------------------
	   * jQuery
	   * ------------------------------------------------------------------------
	   */


	  $__default['default'].fn[NAME$7] = Popover._jQueryInterface;
	  $__default['default'].fn[NAME$7].Constructor = Popover;

	  $__default['default'].fn[NAME$7].noConflict = function () {
	    $__default['default'].fn[NAME$7] = JQUERY_NO_CONFLICT$7;
	    return Popover._jQueryInterface;
	  };

	  /**
	   * ------------------------------------------------------------------------
	   * Constants
	   * ------------------------------------------------------------------------
	   */

	  var NAME$8 = 'scrollspy';
	  var VERSION$8 = '4.5.3';
	  var DATA_KEY$8 = 'bs.scrollspy';
	  var EVENT_KEY$8 = "." + DATA_KEY$8;
	  var DATA_API_KEY$6 = '.data-api';
	  var JQUERY_NO_CONFLICT$8 = $__default['default'].fn[NAME$8];
	  var Default$6 = {
	    offset: 10,
	    method: 'auto',
	    target: ''
	  };
	  var DefaultType$6 = {
	    offset: 'number',
	    method: 'string',
	    target: '(string|element)'
	  };
	  var EVENT_ACTIVATE = "activate" + EVENT_KEY$8;
	  var EVENT_SCROLL = "scroll" + EVENT_KEY$8;
	  var EVENT_LOAD_DATA_API$2 = "load" + EVENT_KEY$8 + DATA_API_KEY$6;
	  var CLASS_NAME_DROPDOWN_ITEM = 'dropdown-item';
	  var CLASS_NAME_ACTIVE$2 = 'active';
	  var SELECTOR_DATA_SPY = '[data-spy="scroll"]';
	  var SELECTOR_NAV_LIST_GROUP = '.nav, .list-group';
	  var SELECTOR_NAV_LINKS = '.nav-link';
	  var SELECTOR_NAV_ITEMS = '.nav-item';
	  var SELECTOR_LIST_ITEMS = '.list-group-item';
	  var SELECTOR_DROPDOWN = '.dropdown';
	  var SELECTOR_DROPDOWN_ITEMS = '.dropdown-item';
	  var SELECTOR_DROPDOWN_TOGGLE = '.dropdown-toggle';
	  var METHOD_OFFSET = 'offset';
	  var METHOD_POSITION = 'position';
	  /**
	   * ------------------------------------------------------------------------
	   * Class Definition
	   * ------------------------------------------------------------------------
	   */

	  var ScrollSpy = /*#__PURE__*/function () {
	    function ScrollSpy(element, config) {
	      var _this = this;

	      this._element = element;
	      this._scrollElement = element.tagName === 'BODY' ? window : element;
	      this._config = this._getConfig(config);
	      this._selector = this._config.target + " " + SELECTOR_NAV_LINKS + "," + (this._config.target + " " + SELECTOR_LIST_ITEMS + ",") + (this._config.target + " " + SELECTOR_DROPDOWN_ITEMS);
	      this._offsets = [];
	      this._targets = [];
	      this._activeTarget = null;
	      this._scrollHeight = 0;
	      $__default['default'](this._scrollElement).on(EVENT_SCROLL, function (event) {
	        return _this._process(event);
	      });
	      this.refresh();

	      this._process();
	    } // Getters


	    var _proto = ScrollSpy.prototype;

	    // Public
	    _proto.refresh = function refresh() {
	      var _this2 = this;

	      var autoMethod = this._scrollElement === this._scrollElement.window ? METHOD_OFFSET : METHOD_POSITION;
	      var offsetMethod = this._config.method === 'auto' ? autoMethod : this._config.method;
	      var offsetBase = offsetMethod === METHOD_POSITION ? this._getScrollTop() : 0;
	      this._offsets = [];
	      this._targets = [];
	      this._scrollHeight = this._getScrollHeight();
	      var targets = [].slice.call(document.querySelectorAll(this._selector));
	      targets.map(function (element) {
	        var target;
	        var targetSelector = Util.getSelectorFromElement(element);

	        if (targetSelector) {
	          target = document.querySelector(targetSelector);
	        }

	        if (target) {
	          var targetBCR = target.getBoundingClientRect();

	          if (targetBCR.width || targetBCR.height) {
	            // TODO (fat): remove sketch reliance on jQuery position/offset
	            return [$__default['default'](target)[offsetMethod]().top + offsetBase, targetSelector];
	          }
	        }

	        return null;
	      }).filter(function (item) {
	        return item;
	      }).sort(function (a, b) {
	        return a[0] - b[0];
	      }).forEach(function (item) {
	        _this2._offsets.push(item[0]);

	        _this2._targets.push(item[1]);
	      });
	    };

	    _proto.dispose = function dispose() {
	      $__default['default'].removeData(this._element, DATA_KEY$8);
	      $__default['default'](this._scrollElement).off(EVENT_KEY$8);
	      this._element = null;
	      this._scrollElement = null;
	      this._config = null;
	      this._selector = null;
	      this._offsets = null;
	      this._targets = null;
	      this._activeTarget = null;
	      this._scrollHeight = null;
	    } // Private
	    ;

	    _proto._getConfig = function _getConfig(config) {
	      config = _extends({}, Default$6, typeof config === 'object' && config ? config : {});

	      if (typeof config.target !== 'string' && Util.isElement(config.target)) {
	        var id = $__default['default'](config.target).attr('id');

	        if (!id) {
	          id = Util.getUID(NAME$8);
	          $__default['default'](config.target).attr('id', id);
	        }

	        config.target = "#" + id;
	      }

	      Util.typeCheckConfig(NAME$8, config, DefaultType$6);
	      return config;
	    };

	    _proto._getScrollTop = function _getScrollTop() {
	      return this._scrollElement === window ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop;
	    };

	    _proto._getScrollHeight = function _getScrollHeight() {
	      return this._scrollElement.scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
	    };

	    _proto._getOffsetHeight = function _getOffsetHeight() {
	      return this._scrollElement === window ? window.innerHeight : this._scrollElement.getBoundingClientRect().height;
	    };

	    _proto._process = function _process() {
	      var scrollTop = this._getScrollTop() + this._config.offset;

	      var scrollHeight = this._getScrollHeight();

	      var maxScroll = this._config.offset + scrollHeight - this._getOffsetHeight();

	      if (this._scrollHeight !== scrollHeight) {
	        this.refresh();
	      }

	      if (scrollTop >= maxScroll) {
	        var target = this._targets[this._targets.length - 1];

	        if (this._activeTarget !== target) {
	          this._activate(target);
	        }

	        return;
	      }

	      if (this._activeTarget && scrollTop < this._offsets[0] && this._offsets[0] > 0) {
	        this._activeTarget = null;

	        this._clear();

	        return;
	      }

	      for (var i = this._offsets.length; i--;) {
	        var isActiveTarget = this._activeTarget !== this._targets[i] && scrollTop >= this._offsets[i] && (typeof this._offsets[i + 1] === 'undefined' || scrollTop < this._offsets[i + 1]);

	        if (isActiveTarget) {
	          this._activate(this._targets[i]);
	        }
	      }
	    };

	    _proto._activate = function _activate(target) {
	      this._activeTarget = target;

	      this._clear();

	      var queries = this._selector.split(',').map(function (selector) {
	        return selector + "[data-target=\"" + target + "\"]," + selector + "[href=\"" + target + "\"]";
	      });

	      var $link = $__default['default']([].slice.call(document.querySelectorAll(queries.join(','))));

	      if ($link.hasClass(CLASS_NAME_DROPDOWN_ITEM)) {
	        $link.closest(SELECTOR_DROPDOWN).find(SELECTOR_DROPDOWN_TOGGLE).addClass(CLASS_NAME_ACTIVE$2);
	        $link.addClass(CLASS_NAME_ACTIVE$2);
	      } else {
	        // Set triggered link as active
	        $link.addClass(CLASS_NAME_ACTIVE$2); // Set triggered links parents as active
	        // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor

	        $link.parents(SELECTOR_NAV_LIST_GROUP).prev(SELECTOR_NAV_LINKS + ", " + SELECTOR_LIST_ITEMS).addClass(CLASS_NAME_ACTIVE$2); // Handle special case when .nav-link is inside .nav-item

	        $link.parents(SELECTOR_NAV_LIST_GROUP).prev(SELECTOR_NAV_ITEMS).children(SELECTOR_NAV_LINKS).addClass(CLASS_NAME_ACTIVE$2);
	      }

	      $__default['default'](this._scrollElement).trigger(EVENT_ACTIVATE, {
	        relatedTarget: target
	      });
	    };

	    _proto._clear = function _clear() {
	      [].slice.call(document.querySelectorAll(this._selector)).filter(function (node) {
	        return node.classList.contains(CLASS_NAME_ACTIVE$2);
	      }).forEach(function (node) {
	        return node.classList.remove(CLASS_NAME_ACTIVE$2);
	      });
	    } // Static
	    ;

	    ScrollSpy._jQueryInterface = function _jQueryInterface(config) {
	      return this.each(function () {
	        var data = $__default['default'](this).data(DATA_KEY$8);

	        var _config = typeof config === 'object' && config;

	        if (!data) {
	          data = new ScrollSpy(this, _config);
	          $__default['default'](this).data(DATA_KEY$8, data);
	        }

	        if (typeof config === 'string') {
	          if (typeof data[config] === 'undefined') {
	            throw new TypeError("No method named \"" + config + "\"");
	          }

	          data[config]();
	        }
	      });
	    };

	    _createClass(ScrollSpy, null, [{
	      key: "VERSION",
	      get: function get() {
	        return VERSION$8;
	      }
	    }, {
	      key: "Default",
	      get: function get() {
	        return Default$6;
	      }
	    }]);

	    return ScrollSpy;
	  }();
	  /**
	   * ------------------------------------------------------------------------
	   * Data Api implementation
	   * ------------------------------------------------------------------------
	   */


	  $__default['default'](window).on(EVENT_LOAD_DATA_API$2, function () {
	    var scrollSpys = [].slice.call(document.querySelectorAll(SELECTOR_DATA_SPY));
	    var scrollSpysLength = scrollSpys.length;

	    for (var i = scrollSpysLength; i--;) {
	      var $spy = $__default['default'](scrollSpys[i]);

	      ScrollSpy._jQueryInterface.call($spy, $spy.data());
	    }
	  });
	  /**
	   * ------------------------------------------------------------------------
	   * jQuery
	   * ------------------------------------------------------------------------
	   */

	  $__default['default'].fn[NAME$8] = ScrollSpy._jQueryInterface;
	  $__default['default'].fn[NAME$8].Constructor = ScrollSpy;

	  $__default['default'].fn[NAME$8].noConflict = function () {
	    $__default['default'].fn[NAME$8] = JQUERY_NO_CONFLICT$8;
	    return ScrollSpy._jQueryInterface;
	  };

	  /**
	   * ------------------------------------------------------------------------
	   * Constants
	   * ------------------------------------------------------------------------
	   */

	  var NAME$9 = 'tab';
	  var VERSION$9 = '4.5.3';
	  var DATA_KEY$9 = 'bs.tab';
	  var EVENT_KEY$9 = "." + DATA_KEY$9;
	  var DATA_API_KEY$7 = '.data-api';
	  var JQUERY_NO_CONFLICT$9 = $__default['default'].fn[NAME$9];
	  var EVENT_HIDE$3 = "hide" + EVENT_KEY$9;
	  var EVENT_HIDDEN$3 = "hidden" + EVENT_KEY$9;
	  var EVENT_SHOW$3 = "show" + EVENT_KEY$9;
	  var EVENT_SHOWN$3 = "shown" + EVENT_KEY$9;
	  var EVENT_CLICK_DATA_API$6 = "click" + EVENT_KEY$9 + DATA_API_KEY$7;
	  var CLASS_NAME_DROPDOWN_MENU = 'dropdown-menu';
	  var CLASS_NAME_ACTIVE$3 = 'active';
	  var CLASS_NAME_DISABLED$1 = 'disabled';
	  var CLASS_NAME_FADE$4 = 'fade';
	  var CLASS_NAME_SHOW$6 = 'show';
	  var SELECTOR_DROPDOWN$1 = '.dropdown';
	  var SELECTOR_NAV_LIST_GROUP$1 = '.nav, .list-group';
	  var SELECTOR_ACTIVE$2 = '.active';
	  var SELECTOR_ACTIVE_UL = '> li > .active';
	  var SELECTOR_DATA_TOGGLE$4 = '[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]';
	  var SELECTOR_DROPDOWN_TOGGLE$1 = '.dropdown-toggle';
	  var SELECTOR_DROPDOWN_ACTIVE_CHILD = '> .dropdown-menu .active';
	  /**
	   * ------------------------------------------------------------------------
	   * Class Definition
	   * ------------------------------------------------------------------------
	   */

	  var Tab = /*#__PURE__*/function () {
	    function Tab(element) {
	      this._element = element;
	    } // Getters


	    var _proto = Tab.prototype;

	    // Public
	    _proto.show = function show() {
	      var _this = this;

	      if (this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && $__default['default'](this._element).hasClass(CLASS_NAME_ACTIVE$3) || $__default['default'](this._element).hasClass(CLASS_NAME_DISABLED$1)) {
	        return;
	      }

	      var target;
	      var previous;
	      var listElement = $__default['default'](this._element).closest(SELECTOR_NAV_LIST_GROUP$1)[0];
	      var selector = Util.getSelectorFromElement(this._element);

	      if (listElement) {
	        var itemSelector = listElement.nodeName === 'UL' || listElement.nodeName === 'OL' ? SELECTOR_ACTIVE_UL : SELECTOR_ACTIVE$2;
	        previous = $__default['default'].makeArray($__default['default'](listElement).find(itemSelector));
	        previous = previous[previous.length - 1];
	      }

	      var hideEvent = $__default['default'].Event(EVENT_HIDE$3, {
	        relatedTarget: this._element
	      });
	      var showEvent = $__default['default'].Event(EVENT_SHOW$3, {
	        relatedTarget: previous
	      });

	      if (previous) {
	        $__default['default'](previous).trigger(hideEvent);
	      }

	      $__default['default'](this._element).trigger(showEvent);

	      if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
	        return;
	      }

	      if (selector) {
	        target = document.querySelector(selector);
	      }

	      this._activate(this._element, listElement);

	      var complete = function complete() {
	        var hiddenEvent = $__default['default'].Event(EVENT_HIDDEN$3, {
	          relatedTarget: _this._element
	        });
	        var shownEvent = $__default['default'].Event(EVENT_SHOWN$3, {
	          relatedTarget: previous
	        });
	        $__default['default'](previous).trigger(hiddenEvent);
	        $__default['default'](_this._element).trigger(shownEvent);
	      };

	      if (target) {
	        this._activate(target, target.parentNode, complete);
	      } else {
	        complete();
	      }
	    };

	    _proto.dispose = function dispose() {
	      $__default['default'].removeData(this._element, DATA_KEY$9);
	      this._element = null;
	    } // Private
	    ;

	    _proto._activate = function _activate(element, container, callback) {
	      var _this2 = this;

	      var activeElements = container && (container.nodeName === 'UL' || container.nodeName === 'OL') ? $__default['default'](container).find(SELECTOR_ACTIVE_UL) : $__default['default'](container).children(SELECTOR_ACTIVE$2);
	      var active = activeElements[0];
	      var isTransitioning = callback && active && $__default['default'](active).hasClass(CLASS_NAME_FADE$4);

	      var complete = function complete() {
	        return _this2._transitionComplete(element, active, callback);
	      };

	      if (active && isTransitioning) {
	        var transitionDuration = Util.getTransitionDurationFromElement(active);
	        $__default['default'](active).removeClass(CLASS_NAME_SHOW$6).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
	      } else {
	        complete();
	      }
	    };

	    _proto._transitionComplete = function _transitionComplete(element, active, callback) {
	      if (active) {
	        $__default['default'](active).removeClass(CLASS_NAME_ACTIVE$3);
	        var dropdownChild = $__default['default'](active.parentNode).find(SELECTOR_DROPDOWN_ACTIVE_CHILD)[0];

	        if (dropdownChild) {
	          $__default['default'](dropdownChild).removeClass(CLASS_NAME_ACTIVE$3);
	        }

	        if (active.getAttribute('role') === 'tab') {
	          active.setAttribute('aria-selected', false);
	        }
	      }

	      $__default['default'](element).addClass(CLASS_NAME_ACTIVE$3);

	      if (element.getAttribute('role') === 'tab') {
	        element.setAttribute('aria-selected', true);
	      }

	      Util.reflow(element);

	      if (element.classList.contains(CLASS_NAME_FADE$4)) {
	        element.classList.add(CLASS_NAME_SHOW$6);
	      }

	      if (element.parentNode && $__default['default'](element.parentNode).hasClass(CLASS_NAME_DROPDOWN_MENU)) {
	        var dropdownElement = $__default['default'](element).closest(SELECTOR_DROPDOWN$1)[0];

	        if (dropdownElement) {
	          var dropdownToggleList = [].slice.call(dropdownElement.querySelectorAll(SELECTOR_DROPDOWN_TOGGLE$1));
	          $__default['default'](dropdownToggleList).addClass(CLASS_NAME_ACTIVE$3);
	        }

	        element.setAttribute('aria-expanded', true);
	      }

	      if (callback) {
	        callback();
	      }
	    } // Static
	    ;

	    Tab._jQueryInterface = function _jQueryInterface(config) {
	      return this.each(function () {
	        var $this = $__default['default'](this);
	        var data = $this.data(DATA_KEY$9);

	        if (!data) {
	          data = new Tab(this);
	          $this.data(DATA_KEY$9, data);
	        }

	        if (typeof config === 'string') {
	          if (typeof data[config] === 'undefined') {
	            throw new TypeError("No method named \"" + config + "\"");
	          }

	          data[config]();
	        }
	      });
	    };

	    _createClass(Tab, null, [{
	      key: "VERSION",
	      get: function get() {
	        return VERSION$9;
	      }
	    }]);

	    return Tab;
	  }();
	  /**
	   * ------------------------------------------------------------------------
	   * Data Api implementation
	   * ------------------------------------------------------------------------
	   */


	  $__default['default'](document).on(EVENT_CLICK_DATA_API$6, SELECTOR_DATA_TOGGLE$4, function (event) {
	    event.preventDefault();

	    Tab._jQueryInterface.call($__default['default'](this), 'show');
	  });
	  /**
	   * ------------------------------------------------------------------------
	   * jQuery
	   * ------------------------------------------------------------------------
	   */

	  $__default['default'].fn[NAME$9] = Tab._jQueryInterface;
	  $__default['default'].fn[NAME$9].Constructor = Tab;

	  $__default['default'].fn[NAME$9].noConflict = function () {
	    $__default['default'].fn[NAME$9] = JQUERY_NO_CONFLICT$9;
	    return Tab._jQueryInterface;
	  };

	  /**
	   * ------------------------------------------------------------------------
	   * Constants
	   * ------------------------------------------------------------------------
	   */

	  var NAME$a = 'toast';
	  var VERSION$a = '4.5.3';
	  var DATA_KEY$a = 'bs.toast';
	  var EVENT_KEY$a = "." + DATA_KEY$a;
	  var JQUERY_NO_CONFLICT$a = $__default['default'].fn[NAME$a];
	  var EVENT_CLICK_DISMISS$1 = "click.dismiss" + EVENT_KEY$a;
	  var EVENT_HIDE$4 = "hide" + EVENT_KEY$a;
	  var EVENT_HIDDEN$4 = "hidden" + EVENT_KEY$a;
	  var EVENT_SHOW$4 = "show" + EVENT_KEY$a;
	  var EVENT_SHOWN$4 = "shown" + EVENT_KEY$a;
	  var CLASS_NAME_FADE$5 = 'fade';
	  var CLASS_NAME_HIDE = 'hide';
	  var CLASS_NAME_SHOW$7 = 'show';
	  var CLASS_NAME_SHOWING = 'showing';
	  var DefaultType$7 = {
	    animation: 'boolean',
	    autohide: 'boolean',
	    delay: 'number'
	  };
	  var Default$7 = {
	    animation: true,
	    autohide: true,
	    delay: 500
	  };
	  var SELECTOR_DATA_DISMISS$1 = '[data-dismiss="toast"]';
	  /**
	   * ------------------------------------------------------------------------
	   * Class Definition
	   * ------------------------------------------------------------------------
	   */

	  var Toast = /*#__PURE__*/function () {
	    function Toast(element, config) {
	      this._element = element;
	      this._config = this._getConfig(config);
	      this._timeout = null;

	      this._setListeners();
	    } // Getters


	    var _proto = Toast.prototype;

	    // Public
	    _proto.show = function show() {
	      var _this = this;

	      var showEvent = $__default['default'].Event(EVENT_SHOW$4);
	      $__default['default'](this._element).trigger(showEvent);

	      if (showEvent.isDefaultPrevented()) {
	        return;
	      }

	      this._clearTimeout();

	      if (this._config.animation) {
	        this._element.classList.add(CLASS_NAME_FADE$5);
	      }

	      var complete = function complete() {
	        _this._element.classList.remove(CLASS_NAME_SHOWING);

	        _this._element.classList.add(CLASS_NAME_SHOW$7);

	        $__default['default'](_this._element).trigger(EVENT_SHOWN$4);

	        if (_this._config.autohide) {
	          _this._timeout = setTimeout(function () {
	            _this.hide();
	          }, _this._config.delay);
	        }
	      };

	      this._element.classList.remove(CLASS_NAME_HIDE);

	      Util.reflow(this._element);

	      this._element.classList.add(CLASS_NAME_SHOWING);

	      if (this._config.animation) {
	        var transitionDuration = Util.getTransitionDurationFromElement(this._element);
	        $__default['default'](this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
	      } else {
	        complete();
	      }
	    };

	    _proto.hide = function hide() {
	      if (!this._element.classList.contains(CLASS_NAME_SHOW$7)) {
	        return;
	      }

	      var hideEvent = $__default['default'].Event(EVENT_HIDE$4);
	      $__default['default'](this._element).trigger(hideEvent);

	      if (hideEvent.isDefaultPrevented()) {
	        return;
	      }

	      this._close();
	    };

	    _proto.dispose = function dispose() {
	      this._clearTimeout();

	      if (this._element.classList.contains(CLASS_NAME_SHOW$7)) {
	        this._element.classList.remove(CLASS_NAME_SHOW$7);
	      }

	      $__default['default'](this._element).off(EVENT_CLICK_DISMISS$1);
	      $__default['default'].removeData(this._element, DATA_KEY$a);
	      this._element = null;
	      this._config = null;
	    } // Private
	    ;

	    _proto._getConfig = function _getConfig(config) {
	      config = _extends({}, Default$7, $__default['default'](this._element).data(), typeof config === 'object' && config ? config : {});
	      Util.typeCheckConfig(NAME$a, config, this.constructor.DefaultType);
	      return config;
	    };

	    _proto._setListeners = function _setListeners() {
	      var _this2 = this;

	      $__default['default'](this._element).on(EVENT_CLICK_DISMISS$1, SELECTOR_DATA_DISMISS$1, function () {
	        return _this2.hide();
	      });
	    };

	    _proto._close = function _close() {
	      var _this3 = this;

	      var complete = function complete() {
	        _this3._element.classList.add(CLASS_NAME_HIDE);

	        $__default['default'](_this3._element).trigger(EVENT_HIDDEN$4);
	      };

	      this._element.classList.remove(CLASS_NAME_SHOW$7);

	      if (this._config.animation) {
	        var transitionDuration = Util.getTransitionDurationFromElement(this._element);
	        $__default['default'](this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
	      } else {
	        complete();
	      }
	    };

	    _proto._clearTimeout = function _clearTimeout() {
	      clearTimeout(this._timeout);
	      this._timeout = null;
	    } // Static
	    ;

	    Toast._jQueryInterface = function _jQueryInterface(config) {
	      return this.each(function () {
	        var $element = $__default['default'](this);
	        var data = $element.data(DATA_KEY$a);

	        var _config = typeof config === 'object' && config;

	        if (!data) {
	          data = new Toast(this, _config);
	          $element.data(DATA_KEY$a, data);
	        }

	        if (typeof config === 'string') {
	          if (typeof data[config] === 'undefined') {
	            throw new TypeError("No method named \"" + config + "\"");
	          }

	          data[config](this);
	        }
	      });
	    };

	    _createClass(Toast, null, [{
	      key: "VERSION",
	      get: function get() {
	        return VERSION$a;
	      }
	    }, {
	      key: "DefaultType",
	      get: function get() {
	        return DefaultType$7;
	      }
	    }, {
	      key: "Default",
	      get: function get() {
	        return Default$7;
	      }
	    }]);

	    return Toast;
	  }();
	  /**
	   * ------------------------------------------------------------------------
	   * jQuery
	   * ------------------------------------------------------------------------
	   */


	  $__default['default'].fn[NAME$a] = Toast._jQueryInterface;
	  $__default['default'].fn[NAME$a].Constructor = Toast;

	  $__default['default'].fn[NAME$a].noConflict = function () {
	    $__default['default'].fn[NAME$a] = JQUERY_NO_CONFLICT$a;
	    return Toast._jQueryInterface;
	  };

	  exports.Alert = Alert;
	  exports.Button = Button;
	  exports.Carousel = Carousel;
	  exports.Collapse = Collapse;
	  exports.Dropdown = Dropdown;
	  exports.Modal = Modal;
	  exports.Popover = Popover;
	  exports.Scrollspy = ScrollSpy;
	  exports.Tab = Tab;
	  exports.Toast = Toast;
	  exports.Tooltip = Tooltip;
	  exports.Util = Util;

	  Object.defineProperty(exports, '__esModule', { value: true });

	})));

	});

	unwrapExports(bootstrap);

	var fileinput = createCommonjsModule(function (module) {
	/*!
	 * bootstrap-fileinput v5.1.2
	 * http://plugins.krajee.com/file-input
	 *
	 * Author: Kartik Visweswaran
	 * Copyright: 2014 - 2020, Kartik Visweswaran, Krajee.com
	 *
	 * Licensed under the BSD-3-Clause
	 * https://github.com/kartik-v/bootstrap-fileinput/blob/master/LICENSE.md
	 */
	(function (factory) {
	    {
	        if ( module.exports) {
	            //noinspection NpmUsedModulesInstalled
	            module.exports = factory(jquery);
	        } else {
	            factory(window.jQuery);
	        }
	    }
	}(function ($) {

	    $.fn.fileinputLocales = {};
	    $.fn.fileinputThemes = {};

	    String.prototype.setTokens = function (replacePairs) {
	        var str = this.toString(), key, re;
	        for (key in replacePairs) {
	            if (replacePairs.hasOwnProperty(key)) {
	                re = new RegExp('\{' + key + '\}', 'g');
	                str = str.replace(re, replacePairs[key]);
	            }
	        }
	        return str;
	    };

	    if (!Array.prototype.flatMap) { // polyfill flatMap
	        Array.prototype.flatMap = function (lambda) {
	            return [].concat(this.map(lambda));
	        };
	    }

	    var $h, FileInput;

	    // fileinput helper object for all global variables and internal helper methods
	    $h = {
	        FRAMES: '.kv-preview-thumb',
	        SORT_CSS: 'file-sortable',
	        INIT_FLAG: 'init-',
	        OBJECT_PARAMS: '<param name="controller" value="true" />\n' +
	            '<param name="allowFullScreen" value="true" />\n' +
	            '<param name="allowScriptAccess" value="always" />\n' +
	            '<param name="autoPlay" value="false" />\n' +
	            '<param name="autoStart" value="false" />\n' +
	            '<param name="quality" value="high" />\n',
	        DEFAULT_PREVIEW: '<div class="file-preview-other">\n' +
	            '<span class="{previewFileIconClass}">{previewFileIcon}</span>\n' +
	            '</div>',
	        MODAL_ID: 'kvFileinputModal',
	        MODAL_EVENTS: ['show', 'shown', 'hide', 'hidden', 'loaded'],
	        logMessages: {
	            ajaxError: '{status}: {error}. Error Details: {text}.',
	            badDroppedFiles: 'Error scanning dropped files!',
	            badExifParser: 'Error loading the piexif.js library. {details}',
	            badInputType: 'The input "type" must be set to "file" for initializing the "bootstrap-fileinput" plugin.',
	            exifWarning: 'To avoid this warning, either set "autoOrientImage" to "false" OR ensure you have loaded ' +
	                'the "piexif.js" library correctly on your page before the "fileinput.js" script.',
	            invalidChunkSize: 'Invalid upload chunk size: "{chunkSize}". Resumable uploads are disabled.',
	            invalidThumb: 'Invalid thumb frame with id: "{id}".',
	            noResumableSupport: 'The browser does not support resumable or chunk uploads.',
	            noUploadUrl: 'The "uploadUrl" is not set. Ajax uploads and resumable uploads have been disabled.',
	            retryStatus: 'Retrying upload for chunk # {chunk} for {filename}... retry # {retry}.',
	            chunkQueueError: 'Could not push task to ajax pool for chunk index # {index}.',
	            resumableMaxRetriesReached: 'Maximum resumable ajax retries ({n}) reached.',
	            resumableRetryError: 'Could not retry the resumable request (try # {n})... aborting.',
	            resumableAborting: 'Aborting / cancelling the resumable request.'

	        },
	        objUrl: window.URL || window.webkitURL,
	        now: function () {
	            return new Date().getTime();
	        },
	        round: function (num) {
	            num = parseFloat(num);
	            return isNaN(num) ? 0 : Math.floor(Math.round(num));
	        },
	        getArray: function (obj) {
	            var i, arr = [], len = obj && obj.length || 0;
	            for (i = 0; i < len; i++) {
	                arr.push(obj[i]);
	            }
	            return arr;
	        },
	        getFileRelativePath: function (file) {
	            /** @namespace file.relativePath */
	            /** @namespace file.webkitRelativePath */
	            return String(file.newPath || file.relativePath || file.webkitRelativePath || $h.getFileName(file) || null);

	        },
	        getFileId: function (file, generateFileId) {
	            var relativePath = $h.getFileRelativePath(file);
	            if (typeof generateFileId === 'function') {
	                return generateFileId(file);
	            }
	            if (!file) {
	                return null;
	            }
	            if (!relativePath) {
	                return null;
	            }
	            return (file.size + '_' + relativePath.replace(/\s/img, '_'));
	        },
	        getFrameSelector: function (id, selector) {
	            selector = selector || '';
	            return '[id="' + id + '"]' + selector;
	        },
	        getZoomSelector: function (id, selector) {
	            return $h.getFrameSelector('zoom-' + id, selector);
	        },
	        getFrameElement: function ($element, id, selector) {
	            return $element.find($h.getFrameSelector(id, selector));
	        },
	        getZoomElement: function ($element, id, selector) {
	            return $element.find($h.getZoomSelector(id, selector));
	        },
	        getElapsed: function (seconds) {
	            var delta = seconds, out = '', result = {}, structure = {
	                year: 31536000,
	                month: 2592000,
	                week: 604800, // uncomment row to ignore
	                day: 86400,   // feel free to add your own row
	                hour: 3600,
	                minute: 60,
	                second: 1
	            };
	            $h.getObjectKeys(structure).forEach(function (key) {
	                result[key] = Math.floor(delta / structure[key]);
	                delta -= result[key] * structure[key];
	            });
	            $.each(result, function (key, value) {
	                if (value > 0) {
	                    out += (out ? ' ' : '') + value + key.substring(0, 1);
	                }
	            });
	            return out;
	        },
	        debounce: function (func, delay) {
	            var inDebounce;
	            return function () {
	                var args = arguments, context = this;
	                clearTimeout(inDebounce);
	                inDebounce = setTimeout(function () {
	                    func.apply(context, args);
	                }, delay);
	            };
	        },
	        stopEvent: function (e) {
	            e.stopPropagation();
	            e.preventDefault();
	        },
	        getFileName: function (file) {
	            /** @namespace file.fileName */
	            return file ? (file.fileName || file.name || '') : ''; // some confusion in different versions of Firefox
	        },
	        createObjectURL: function (data) {
	            if ($h.objUrl && $h.objUrl.createObjectURL && data) {
	                return $h.objUrl.createObjectURL(data);
	            }
	            return '';
	        },
	        revokeObjectURL: function (data) {
	            if ($h.objUrl && $h.objUrl.revokeObjectURL && data) {
	                $h.objUrl.revokeObjectURL(data);
	            }
	        },
	        compare: function (input, str, exact) {
	            return input !== undefined && (exact ? input === str : input.match(str));
	        },
	        isIE: function (ver) {
	            var div, status;
	            // check for IE versions < 11
	            if (navigator.appName !== 'Microsoft Internet Explorer') {
	                return false;
	            }
	            if (ver === 10) {
	                return new RegExp('msie\\s' + ver, 'i').test(navigator.userAgent);
	            }
	            div = document.createElement('div');
	            div.innerHTML = '<!--[if IE ' + ver + ']> <i></i> <![endif]-->';
	            status = div.getElementsByTagName('i').length;
	            document.body.appendChild(div);
	            div.parentNode.removeChild(div);
	            return status;
	        },
	        canOrientImage: function ($el) {
	            var $img = $(document.createElement('img')).css({width: '1px', height: '1px'}).insertAfter($el),
	                flag = $img.css('image-orientation');
	            $img.remove();
	            return !!flag;
	        },
	        canAssignFilesToInput: function () {
	            var input = document.createElement('input');
	            try {
	                input.type = 'file';
	                input.files = null;
	                return true;
	            } catch (err) {
	                return false;
	            }
	        },
	        getDragDropFolders: function (items) {
	            var i, item, len = items ? items.length : 0, folders = 0;
	            if (len > 0 && items[0].webkitGetAsEntry()) {
	                for (i = 0; i < len; i++) {
	                    item = items[i].webkitGetAsEntry();
	                    if (item && item.isDirectory) {
	                        folders++;
	                    }
	                }
	            }
	            return folders;
	        },
	        initModal: function ($modal) {
	            var $body = $('body');
	            if ($body.length) {
	                $modal.appendTo($body);
	            }
	        },
	        isFunction: function (v) {
	            return typeof v === 'function';
	        },
	        isEmpty: function (value, trim) {
	            return value === undefined || value === null || (!$h.isFunction(
	                value) && (value.length === 0 || (trim && $.trim(value) === '')));
	        },
	        isArray: function (a) {
	            return Array.isArray(a) || Object.prototype.toString.call(a) === '[object Array]';
	        },
	        ifSet: function (needle, haystack, def) {
	            def = def || '';
	            return (haystack && typeof haystack === 'object' && needle in haystack) ? haystack[needle] : def;
	        },
	        cleanArray: function (arr) {
	            if (!(arr instanceof Array)) {
	                arr = [];
	            }
	            return arr.filter(function (e) {
	                return (e !== undefined && e !== null);
	            });
	        },
	        spliceArray: function (arr, index, reverseOrder) {
	            var i, j = 0, out = [], newArr;
	            if (!(arr instanceof Array)) {
	                return [];
	            }
	            newArr = $.extend(true, [], arr);
	            if (reverseOrder) {
	                newArr.reverse();
	            }
	            for (i = 0; i < newArr.length; i++) {
	                if (i !== index) {
	                    out[j] = newArr[i];
	                    j++;
	                }
	            }
	            if (reverseOrder) {
	                out.reverse();
	            }
	            return out;
	        },
	        getNum: function (num, def) {
	            def = def || 0;
	            if (typeof num === 'number') {
	                return num;
	            }
	            if (typeof num === 'string') {
	                num = parseFloat(num);
	            }
	            return isNaN(num) ? def : num;
	        },
	        hasFileAPISupport: function () {
	            return !!(window.File && window.FileReader);
	        },
	        hasDragDropSupport: function () {
	            var div = document.createElement('div');
	            /** @namespace div.draggable */
	            /** @namespace div.ondragstart */
	            /** @namespace div.ondrop */
	            return !$h.isIE(9) &&
	                (div.draggable !== undefined || (div.ondragstart !== undefined && div.ondrop !== undefined));
	        },
	        hasFileUploadSupport: function () {
	            return $h.hasFileAPISupport() && window.FormData;
	        },
	        hasBlobSupport: function () {
	            try {
	                return !!window.Blob && Boolean(new Blob());
	            } catch (e) {
	                return false;
	            }
	        },
	        hasArrayBufferViewSupport: function () {
	            try {
	                return new Blob([new Uint8Array(100)]).size === 100;
	            } catch (e) {
	                return false;
	            }
	        },
	        hasResumableUploadSupport: function () {
	            /** @namespace Blob.prototype.webkitSlice */
	            /** @namespace Blob.prototype.mozSlice */
	            return $h.hasFileUploadSupport() && $h.hasBlobSupport() && $h.hasArrayBufferViewSupport() &&
	                (!!Blob.prototype.webkitSlice || !!Blob.prototype.mozSlice || !!Blob.prototype.slice || false);
	        },
	        dataURI2Blob: function (dataURI) {
	            var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder ||
	                window.MSBlobBuilder, canBlob = $h.hasBlobSupport(), byteStr, arrayBuffer, intArray, i, mimeStr, bb,
	                canProceed = (canBlob || BlobBuilder) && window.atob && window.ArrayBuffer && window.Uint8Array;
	            if (!canProceed) {
	                return null;
	            }
	            if (dataURI.split(',')[0].indexOf('base64') >= 0) {
	                byteStr = atob(dataURI.split(',')[1]);
	            } else {
	                byteStr = decodeURIComponent(dataURI.split(',')[1]);
	            }
	            arrayBuffer = new ArrayBuffer(byteStr.length);
	            intArray = new Uint8Array(arrayBuffer);
	            for (i = 0; i < byteStr.length; i += 1) {
	                intArray[i] = byteStr.charCodeAt(i);
	            }
	            mimeStr = dataURI.split(',')[0].split(':')[1].split(';')[0];
	            if (canBlob) {
	                return new Blob([$h.hasArrayBufferViewSupport() ? intArray : arrayBuffer], {type: mimeStr});
	            }
	            bb = new BlobBuilder();
	            bb.append(arrayBuffer);
	            return bb.getBlob(mimeStr);
	        },
	        arrayBuffer2String: function (buffer) {
	            if (window.TextDecoder) {
	                return new TextDecoder('utf-8').decode(buffer);
	            }
	            var array = Array.prototype.slice.apply(new Uint8Array(buffer)), out = '', i = 0, len, c, char2, char3;
	            len = array.length;
	            while (i < len) {
	                c = array[i++];
	                switch (c >> 4) { // jshint ignore:line
	                    case 0:
	                    case 1:
	                    case 2:
	                    case 3:
	                    case 4:
	                    case 5:
	                    case 6:
	                    case 7:
	                        // 0xxxxxxx
	                        out += String.fromCharCode(c);
	                        break;
	                    case 12:
	                    case 13:
	                        // 110x xxxx   10xx xxxx
	                        char2 = array[i++];
	                        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F)); // jshint ignore:line
	                        break;
	                    case 14:
	                        // 1110 xxxx  10xx xxxx  10xx xxxx
	                        char2 = array[i++];
	                        char3 = array[i++];
	                        out += String.fromCharCode(((c & 0x0F) << 12) | // jshint ignore:line
	                            ((char2 & 0x3F) << 6) |  // jshint ignore:line
	                            ((char3 & 0x3F) << 0)); // jshint ignore:line
	                        break;
	                }
	            }
	            return out;
	        },
	        isHtml: function (str) {
	            var a = document.createElement('div');
	            a.innerHTML = str;
	            for (var c = a.childNodes, i = c.length; i--;) {
	                if (c[i].nodeType === 1) {
	                    return true;
	                }
	            }
	            return false;
	        },
	        isSvg: function (str) {
	            return str.match(/^\s*<\?xml/i) && (str.match(/<!DOCTYPE svg/i) || str.match(/<svg/i));
	        },
	        getMimeType: function (signature, contents, type) {
	            switch (signature) {
	                case 'ffd8ffe0':
	                case 'ffd8ffe1':
	                case 'ffd8ffe2':
	                    return 'image/jpeg';
	                case '89504e47':
	                    return 'image/png';
	                case '47494638':
	                    return 'image/gif';
	                case '49492a00':
	                    return 'image/tiff';
	                case '52494646':
	                    return 'image/webp';
	                case '66747970':
	                    return 'video/3gp';
	                case '4f676753':
	                    return 'video/ogg';
	                case '1a45dfa3':
	                    return 'video/mkv';
	                case '000001ba':
	                case '000001b3':
	                    return 'video/mpeg';
	                case '3026b275':
	                    return 'video/wmv';
	                case '25504446':
	                    return 'application/pdf';
	                case '25215053':
	                    return 'application/ps';
	                case '504b0304':
	                case '504b0506':
	                case '504b0508':
	                    return 'application/zip';
	                case '377abcaf':
	                    return 'application/7z';
	                case '75737461':
	                    return 'application/tar';
	                case '7801730d':
	                    return 'application/dmg';
	                default:
	                    switch (signature.substring(0, 6)) {
	                        case '435753':
	                            return 'application/x-shockwave-flash';
	                        case '494433':
	                            return 'audio/mp3';
	                        case '425a68':
	                            return 'application/bzip';
	                        default:
	                            switch (signature.substring(0, 4)) {
	                                case '424d':
	                                    return 'image/bmp';
	                                case 'fffb':
	                                    return 'audio/mp3';
	                                case '4d5a':
	                                    return 'application/exe';
	                                case '1f9d':
	                                case '1fa0':
	                                    return 'application/zip';
	                                case '1f8b':
	                                    return 'application/gzip';
	                                default:
	                                    return contents && !contents.match(
	                                        /[^\u0000-\u007f]/) ? 'application/text-plain' : type;
	                            }
	                    }
	            }
	        },
	        addCss: function ($el, css) {
	            $el.removeClass(css).addClass(css);
	        },
	        getElement: function (options, param, value) {
	            return ($h.isEmpty(options) || $h.isEmpty(options[param])) ? value : $(options[param]);
	        },
	        createElement: function (str, tag) {
	            tag = tag || 'div';
	            return $($.parseHTML('<' + tag + '>' + str + '</' + tag + '>'));
	        },
	        uniqId: function () {
	            return (new Date().getTime() + Math.floor(Math.random() * Math.pow(10, 15))).toString(36);
	        },
	        parseEventCallback: function (str) {
	            return Function('\'use strict\'; return (function() { ' + str + ' });')(); // jshint ignore:line
	        },
	        cspBuffer: {
	            CSP_ATTRIB: 'data-csp-01928735', // a randomly named temporary attribute to store the CSP elem id
	            domEventsList: [
	                'mousedown', 'mouseup', 'click', 'dblclick', 'mousemove', 'mouseover', 'mousewheel', 'mouseout',
	                'contextmenu', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'keydown', 'keypress', 'keyup',
	                'focus', 'blur', 'change', 'submit', 'scroll', 'resize', 'hashchange', 'load', 'unload',
	                'cut', 'copy', 'paste'
	            ],
	            domElementEvents: {},
	            domElementsStyles: {},
	            stash: function (htmlString) {
	                var self = this, outerDom = $.parseHTML('<div>' + htmlString + '</div>'), $el = $(outerDom);
	                $el.find('[style]').each(function (key, elem) {
	                    var $elem = $(elem), styleString = $elem.attr('style'), id = $h.uniqId(), styles = {};
	                    if (styleString && styleString.length) {
	                        if (styleString.indexOf(';') === -1) {
	                            styleString += ';';
	                        }
	                        styleString.slice(0, styleString.length - 1).split(';').map(function (str) {
	                            str = str.split(':');
	                            if (str[0]) {
	                                styles[str[0]] = str[1] ? str[1] : '';
	                            }
	                        });
	                        self.domElementsStyles[id] = styles;
	                        $elem.removeAttr('style').attr(self.CSP_ATTRIB, id);
	                    }
	                });
	                $el.filter('*').removeAttr('style');                   // make sure all style attr are removed
	                $.each(self.domEventsList, function (key, eventName) { // handle onXXX events set as inline markup
	                    var id, fn, event = 'on' + eventName, $inlineEvent = $el.find('[' + event + ']');
	                    if ($inlineEvent.length) {
	                        fn = $h.parseEventCallback($inlineEvent.attr(event));
	                        if ($inlineEvent.attr(self.CSP_ATTRIB)) {
	                            id = $inlineEvent.attr(self.CSP_ATTRIB);
	                        } else {
	                            id = $h.uniqId();
	                            self.domElementEvents[id] = [];
	                        }
	                        self.domElementEvents[id].push({name: eventName + '.csp', handler: fn}); // special csp namespace
	                        $inlineEvent.removeAttr(event).attr(self.CSP_ATTRIB, id);
	                    }
	                });
	                var values = Object.values ? Object.values(outerDom) : Object.keys(outerDom).map(function (itm) {
	                    return outerDom[itm];
	                });
	                return values.flatMap(function (elem) {
	                    return elem.innerHTML;
	                }).join('');
	            },
	            apply: function (domElement) {
	                var self = this, $el = $(domElement);
	                $el.find('[' + self.CSP_ATTRIB + ']').each(function (key, elem) {
	                    var $elem = $(elem), id = $elem.attr(self.CSP_ATTRIB), styles = self.domElementsStyles[id],
	                        events = self.domElementEvents[id];
	                    if (styles) {
	                        $elem.css(styles);
	                    }
	                    if (events) {
	                        $.each(events, function (key, event) {
	                            if (event && event.name) {
	                                $elem.off(event.name).on(event.name, event.handler);
	                            }
	                        });
	                    }
	                    $elem.removeAttr(self.CSP_ATTRIB);
	                });
	                self.domElementsStyles = {};
	                self.domElementEvents = {};
	            }
	        },
	        setHtml: function ($elem, htmlString) {
	            var buf = $h.cspBuffer;
	            $elem.html(buf.stash(htmlString));
	            buf.apply($elem);
	            return $elem;
	        },
	        htmlEncode: function (str, undefVal) {
	            if (str === undefined) {
	                return undefVal || null;
	            }
	            return str.replace(/&/g, '&amp;')
	                .replace(/</g, '&lt;')
	                .replace(/>/g, '&gt;')
	                .replace(/"/g, '&quot;')
	                .replace(/'/g, '&apos;');
	        },
	        replaceTags: function (str, tags) {
	            var out = str;
	            if (!tags) {
	                return out;
	            }
	            $.each(tags, function (key, value) {
	                if (typeof value === 'function') {
	                    value = value();
	                }
	                out = out.split(key).join(value);
	            });
	            return out;
	        },
	        cleanMemory: function ($thumb) {
	            var data = $thumb.is('img') ? $thumb.attr('src') : $thumb.find('source').attr('src');
	            $h.revokeObjectURL(data);
	        },
	        findFileName: function (filePath) {
	            var sepIndex = filePath.lastIndexOf('/');
	            if (sepIndex === -1) {
	                sepIndex = filePath.lastIndexOf('\\');
	            }
	            return filePath.split(filePath.substring(sepIndex, sepIndex + 1)).pop();
	        },
	        checkFullScreen: function () {
	            return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement ||
	                document.msFullscreenElement;
	        },
	        toggleFullScreen: function (maximize) {
	            var doc = document, de = doc.documentElement, isFullScreen = $h.checkFullScreen();
	            if (de && maximize && !isFullScreen) {
	                if (de.requestFullscreen) {
	                    de.requestFullscreen();
	                } else {
	                    if (de.msRequestFullscreen) {
	                        de.msRequestFullscreen();
	                    } else {
	                        if (de.mozRequestFullScreen) {
	                            de.mozRequestFullScreen();
	                        } else {
	                            if (de.webkitRequestFullscreen) {
	                                de.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
	                            }
	                        }
	                    }
	                }
	            } else {
	                if (isFullScreen) {
	                    if (doc.exitFullscreen) {
	                        doc.exitFullscreen();
	                    } else {
	                        if (doc.msExitFullscreen) {
	                            doc.msExitFullscreen();
	                        } else {
	                            if (doc.mozCancelFullScreen) {
	                                doc.mozCancelFullScreen();
	                            } else {
	                                if (doc.webkitExitFullscreen) {
	                                    doc.webkitExitFullscreen();
	                                }
	                            }
	                        }
	                    }
	                }
	            }
	        },
	        moveArray: function (arr, oldIndex, newIndex, reverseOrder) {
	            var newArr = $.extend(true, [], arr);
	            if (reverseOrder) {
	                newArr.reverse();
	            }
	            if (newIndex >= newArr.length) {
	                var k = newIndex - newArr.length;
	                while ((k--) + 1) {
	                    newArr.push(undefined);
	                }
	            }
	            newArr.splice(newIndex, 0, newArr.splice(oldIndex, 1)[0]);
	            if (reverseOrder) {
	                newArr.reverse();
	            }
	            return newArr;
	        },
	        closeButton: function (css) {
	            css = css ? 'close ' + css : 'close';
	            return '<button type="button" class="' + css + '" aria-label="Close">\n' +
	                '  <span aria-hidden="true">&times;</span>\n' +
	                '</button>';
	        },
	        getRotation: function (value) {
	            switch (value) {
	                case 2:
	                    return 'rotateY(180deg)';
	                case 3:
	                    return 'rotate(180deg)';
	                case 4:
	                    return 'rotate(180deg) rotateY(180deg)';
	                case 5:
	                    return 'rotate(270deg) rotateY(180deg)';
	                case 6:
	                    return 'rotate(90deg)';
	                case 7:
	                    return 'rotate(90deg) rotateY(180deg)';
	                case 8:
	                    return 'rotate(270deg)';
	                default:
	                    return '';
	            }
	        },
	        setTransform: function (el, val) {
	            if (!el) {
	                return;
	            }
	            el.style.transform = val;
	            el.style.webkitTransform = val;
	            el.style['-moz-transform'] = val;
	            el.style['-ms-transform'] = val;
	            el.style['-o-transform'] = val;
	        },
	        getObjectKeys: function (obj) {
	            var keys = [];
	            if (obj) {
	                $.each(obj, function (key) {
	                    keys.push(key);
	                });
	            }
	            return keys;
	        },
	        getObjectSize: function (obj) {
	            return $h.getObjectKeys(obj).length;
	        },
	        /**
	         * Small dependency injection for the task manager
	         * https://gist.github.com/fearphage/4341799
	         */
	        whenAll: function (array) {
	            var s = [].slice, resolveValues = arguments.length === 1 && $h.isArray(array) ? array : s.call(arguments),
	                deferred = $.Deferred(), i, failed = 0, value, length = resolveValues.length,
	                remaining = length, rejectContexts, rejectValues, resolveContexts, updateFunc;
	            rejectContexts = rejectValues = resolveContexts = Array(length);
	            updateFunc = function (index, contexts, values) {
	                return function () {
	                    if (values !== resolveValues) {
	                        failed++;
	                    }
	                    deferred.notifyWith(contexts[index] = this, values[index] = s.call(arguments));
	                    if (!(--remaining)) {
	                        deferred[(!failed ? 'resolve' : 'reject') + 'With'](contexts, values);
	                    }
	                };
	            };
	            for (i = 0; i < length; i++) {
	                if ((value = resolveValues[i]) && $.isFunction(value.promise)) {
	                    value.promise()
	                        .done(updateFunc(i, resolveContexts, resolveValues))
	                        .fail(updateFunc(i, rejectContexts, rejectValues));
	                } else {
	                    deferred.notifyWith(this, value);
	                    --remaining;
	                }
	            }
	            if (!remaining) {
	                deferred.resolveWith(resolveContexts, resolveValues);
	            }
	            return deferred.promise();
	        }
	    };
	    FileInput = function (element, options) {
	        var self = this;
	        self.$element = $(element);
	        self.$parent = self.$element.parent();
	        if (!self._validate()) {
	            return;
	        }
	        self.isPreviewable = $h.hasFileAPISupport();
	        self.isIE9 = $h.isIE(9);
	        self.isIE10 = $h.isIE(10);
	        if (self.isPreviewable || self.isIE9) {
	            self._init(options);
	            self._listen();
	        }
	        self.$element.removeClass('file-loading');
	    };

	    FileInput.prototype = {
	        constructor: FileInput,
	        _cleanup: function () {
	            var self = this;
	            self.reader = null;
	            self.clearFileStack();
	            self.fileBatchCompleted = true;
	            self.isError = false;
	            self.isDuplicateError = false;
	            self.isPersistentError = false;
	            self.cancelling = false;
	            self.paused = false;
	            self.lastProgress = 0;
	            self._initAjax();
	        },
	        _isAborted: function () {
	            var self = this;
	            return self.cancelling || self.paused;
	        },
	        _initAjax: function () {
	            var self = this, tm = self.taskManager = {
	                pool: {},
	                addPool: function (id) {
	                    return (tm.pool[id] = new tm.TasksPool(id));
	                },
	                getPool: function (id) {
	                    return tm.pool[id];
	                },
	                addTask: function (id, logic) { // add standalone task directly from task manager
	                    return new tm.Task(id, logic);
	                },
	                TasksPool: function (id) {
	                    var tp = this;
	                    tp.id = id;
	                    tp.cancelled = false;
	                    tp.cancelledDeferrer = $.Deferred();
	                    tp.tasks = {};
	                    tp.addTask = function (id, logic) {
	                        return (tp.tasks[id] = new tm.Task(id, logic));
	                    };
	                    tp.size = function () {
	                        return $h.getObjectSize(tp.tasks);
	                    };
	                    tp.run = function (maxThreads) {
	                        var i = 0, failed = false, task, tasksList = $h.getObjectKeys(tp.tasks).map(function (key) {
	                            return tp.tasks[key];
	                        }), tasksDone = [], deferred = $.Deferred(), enqueue, callback;

	                        if (tp.cancelled) {
	                            tp.cancelledDeferrer.resolve();
	                            return deferred.reject();
	                        }
	                        // if run all at once
	                        if (!maxThreads) {
	                            var tasksDeferredList = $h.getObjectKeys(tp.tasks).map(function (key) {
	                                return tp.tasks[key].deferred;
	                            });
	                            // when all are done
	                            $h.whenAll(tasksDeferredList).done(function () {
	                                var argv = $h.getArray(arguments);
	                                if (!tp.cancelled) {
	                                    deferred.resolve.apply(null, argv);
	                                    tp.cancelledDeferrer.reject();
	                                } else {
	                                    deferred.reject.apply(null, argv);
	                                    tp.cancelledDeferrer.resolve();
	                                }
	                            }).fail(function () {
	                                var argv = $h.getArray(arguments);
	                                deferred.reject.apply(null, argv);
	                                if (!tp.cancelled) {
	                                    tp.cancelledDeferrer.reject();
	                                } else {
	                                    tp.cancelledDeferrer.resolve();
	                                }
	                            });
	                            // run all tasks
	                            $.each(tp.tasks, function (id) {
	                                task = tp.tasks[id];
	                                task.run();
	                            });
	                            return deferred;
	                        }
	                        enqueue = function (task) {
	                            $.when(task.deferred)
	                                .fail(function () {
	                                    failed = true;
	                                    callback.apply(null, arguments);
	                                })
	                                .always(callback);
	                        };
	                        callback = function () {
	                            var argv = $h.getArray(arguments);
	                            // notify a task just ended
	                            deferred.notify(argv);
	                            tasksDone.push(argv);
	                            if (tp.cancelled) {
	                                deferred.reject.apply(null, tasksDone);
	                                tp.cancelledDeferrer.resolve();
	                                return;
	                            }
	                            if (tasksDone.length === tp.size()) {
	                                if (failed) {
	                                    deferred.reject.apply(null, tasksDone);
	                                } else {
	                                    deferred.resolve.apply(null, tasksDone);
	                                }
	                            }
	                            // if there are any tasks remaining
	                            if (tasksList.length) {
	                                task = tasksList.shift();
	                                enqueue(task);
	                                task.run();
	                            }
	                        };
	                        // run the first "maxThreads" tasks
	                        while (tasksList.length && i++ < maxThreads) {
	                            task = tasksList.shift();
	                            enqueue(task);
	                            task.run();
	                        }
	                        return deferred;
	                    };
	                    tp.cancel = function () {
	                        tp.cancelled = true;
	                        return tp.cancelledDeferrer;
	                    };
	                },
	                Task: function (id, logic) {
	                    var tk = this;
	                    tk.id = id;
	                    tk.deferred = $.Deferred();
	                    tk.logic = logic;
	                    tk.context = null;
	                    tk.run = function () {
	                        var argv = $h.getArray(arguments);
	                        argv.unshift(tk.deferred);     // add deferrer as first argument
	                        logic.apply(tk.context, argv); // run task
	                        return tk.deferred;            // return deferrer
	                    };
	                    tk.runWithContext = function (context) {
	                        tk.context = context;
	                        return tk.run();
	                    };
	                }
	            };
	            self.ajaxQueue = [];
	            self.ajaxRequests = [];
	            self.ajaxAborted = false;
	        },
	        _init: function (options, refreshMode) {
	            var self = this, f, $el = self.$element, $cont, t, tmp;
	            self.options = options;
	            self.canOrientImage = $h.canOrientImage($el);
	            $.each(options, function (key, value) {
	                switch (key) {
	                    case 'minFileCount':
	                    case 'maxFileCount':
	                    case 'maxTotalFileCount':
	                    case 'minFileSize':
	                    case 'maxFileSize':
	                    case 'maxFilePreviewSize':
	                    case 'resizeImageQuality':
	                    case 'resizeIfSizeMoreThan':
	                    case 'progressUploadThreshold':
	                    case 'initialPreviewCount':
	                    case 'zoomModalHeight':
	                    case 'minImageHeight':
	                    case 'maxImageHeight':
	                    case 'minImageWidth':
	                    case 'maxImageWidth':
	                        self[key] = $h.getNum(value);
	                        break;
	                    default:
	                        self[key] = value;
	                        break;
	                }
	            });
	            if (self.maxTotalFileCount > 0 && self.maxTotalFileCount < self.maxFileCount) {
	                self.maxTotalFileCount = self.maxFileCount;
	            }
	            if (self.rtl) { // swap buttons for rtl
	                tmp = self.previewZoomButtonIcons.prev;
	                self.previewZoomButtonIcons.prev = self.previewZoomButtonIcons.next;
	                self.previewZoomButtonIcons.next = tmp;
	            }
	            // validate chunk threads to not exceed maxAjaxThreads
	            if (!isNaN(self.maxAjaxThreads) && self.maxAjaxThreads < self.resumableUploadOptions.maxThreads) {
	                self.resumableUploadOptions.maxThreads = self.maxAjaxThreads;
	            }
	            self._initFileManager();
	            if (typeof self.autoOrientImage === 'function') {
	                self.autoOrientImage = self.autoOrientImage();
	            }
	            if (typeof self.autoOrientImageInitial === 'function') {
	                self.autoOrientImageInitial = self.autoOrientImageInitial();
	            }
	            if (!refreshMode) {
	                self._cleanup();
	            }
	            self.duplicateErrors = [];
	            self.$form = $el.closest('form');
	            self._initTemplateDefaults();
	            self.uploadFileAttr = !$h.isEmpty($el.attr('name')) ? $el.attr('name') : 'file_data';
	            t = self._getLayoutTemplate('progress');
	            self.progressTemplate = t.replace('{class}', self.progressClass);
	            self.progressInfoTemplate = t.replace('{class}', self.progressInfoClass);
	            self.progressPauseTemplate = t.replace('{class}', self.progressPauseClass);
	            self.progressCompleteTemplate = t.replace('{class}', self.progressCompleteClass);
	            self.progressErrorTemplate = t.replace('{class}', self.progressErrorClass);
	            self.isDisabled = $el.attr('disabled') || $el.attr('readonly');
	            if (self.isDisabled) {
	                $el.attr('disabled', true);
	            }
	            self.isClickable = self.browseOnZoneClick && self.showPreview &&
	                (self.dropZoneEnabled || !$h.isEmpty(self.defaultPreviewContent));
	            self.isAjaxUpload = $h.hasFileUploadSupport() && !$h.isEmpty(self.uploadUrl);
	            self.dropZoneEnabled = $h.hasDragDropSupport() && self.dropZoneEnabled;
	            if (!self.isAjaxUpload) {
	                self.dropZoneEnabled = self.dropZoneEnabled && $h.canAssignFilesToInput();
	            }
	            self.slug = typeof options.slugCallback === 'function' ? options.slugCallback : self._slugDefault;
	            self.mainTemplate = self.showCaption ? self._getLayoutTemplate('main1') : self._getLayoutTemplate('main2');
	            self.captionTemplate = self._getLayoutTemplate('caption');
	            self.previewGenericTemplate = self._getPreviewTemplate('generic');
	            if (!self.imageCanvas && self.resizeImage && (self.maxImageWidth || self.maxImageHeight)) {
	                self.imageCanvas = document.createElement('canvas');
	                self.imageCanvasContext = self.imageCanvas.getContext('2d');
	            }
	            if ($h.isEmpty($el.attr('id'))) {
	                $el.attr('id', $h.uniqId());
	            }
	            self.namespace = '.fileinput_' + $el.attr('id').replace(/-/g, '_');
	            if (self.$container === undefined) {
	                self.$container = self._createContainer();
	            } else {
	                self._refreshContainer();
	            }
	            $cont = self.$container;
	            self.$dropZone = $cont.find('.file-drop-zone');
	            self.$progress = $cont.find('.kv-upload-progress');
	            self.$btnUpload = $cont.find('.fileinput-upload');
	            self.$captionContainer = $h.getElement(options, 'elCaptionContainer', $cont.find('.file-caption'));
	            self.$caption = $h.getElement(options, 'elCaptionText', $cont.find('.file-caption-name'));
	            if (!$h.isEmpty(self.msgPlaceholder)) {
	                f = $el.attr('multiple') ? self.filePlural : self.fileSingle;
	                self.$caption.attr('placeholder', self.msgPlaceholder.replace('{files}', f));
	            }
	            self.$captionIcon = self.$captionContainer.find('.file-caption-icon');
	            self.$previewContainer = $h.getElement(options, 'elPreviewContainer', $cont.find('.file-preview'));
	            self.$preview = $h.getElement(options, 'elPreviewImage', $cont.find('.file-preview-thumbnails'));
	            self.$previewStatus = $h.getElement(options, 'elPreviewStatus', $cont.find('.file-preview-status'));
	            self.$errorContainer = $h.getElement(options, 'elErrorContainer',
	                self.$previewContainer.find('.kv-fileinput-error'));
	            self._validateDisabled();
	            if (!$h.isEmpty(self.msgErrorClass)) {
	                $h.addCss(self.$errorContainer, self.msgErrorClass);
	            }
	            if (!refreshMode) {
	                self._resetErrors();
	                self.$errorContainer.hide();
	                self.previewInitId = 'thumb-' + $el.attr('id');
	                self._initPreviewCache();
	                self._initPreview(true);
	                self._initPreviewActions();
	                if (self.$parent.hasClass('file-loading')) {
	                    self.$container.insertBefore(self.$parent);
	                    self.$parent.remove();
	                }
	            } else {
	                if (!self._errorsExist()) {
	                    self.$errorContainer.hide();
	                }
	            }
	            self._setFileDropZoneTitle();
	            if ($el.attr('disabled')) {
	                self.disable();
	            }
	            self._initZoom();
	            if (self.hideThumbnailContent) {
	                $h.addCss(self.$preview, 'hide-content');
	            }
	        },
	        _initFileManager: function () {
	            var self = this;
	            self.uploadStartTime = $h.now();
	            self.fileManager = {
	                stack: {},
	                filesProcessed: [],
	                errors: [],
	                loadedImages: {},
	                totalImages: 0,
	                totalFiles: null,
	                totalSize: null,
	                uploadedSize: 0,
	                stats: {},
	                initStats: function (id) {
	                    var data = {started: $h.now()};
	                    if (id) {
	                        self.fileManager.stats[id] = data;
	                    } else {
	                        self.fileManager.stats = data;
	                    }
	                },
	                getUploadStats: function (id, loaded, total) {
	                    var fm = self.fileManager,
	                        started = id ? fm.stats[id] && fm.stats[id].started || $h.now() : self.uploadStartTime;
	                    var elapsed = ($h.now() - started) / 1000,
	                        speeds = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s', 'EB/s', 'ZB/s', 'YB/s'],
	                        bps = elapsed ? loaded / elapsed : 0, bitrate = self._getSize(bps, speeds),
	                        pendingBytes = total - loaded,
	                        out = {
	                            fileId: id,
	                            started: started,
	                            elapsed: elapsed,
	                            loaded: loaded,
	                            total: total,
	                            bps: bps,
	                            bitrate: bitrate,
	                            pendingBytes: pendingBytes
	                        };
	                    if (id) {
	                        fm.stats[id] = out;
	                    } else {
	                        fm.stats = out;
	                    }
	                    return out;
	                },
	                exists: function (id) {
	                    return $.inArray(id, self.fileManager.getIdList()) !== -1;
	                },
	                count: function () {
	                    return self.fileManager.getIdList().length;
	                },
	                total: function () {
	                    var fm = self.fileManager;
	                    if (!fm.totalFiles) {
	                        fm.totalFiles = fm.count();
	                    }
	                    return fm.totalFiles;
	                },
	                getTotalSize: function () {
	                    var fm = self.fileManager;
	                    if (fm.totalSize) {
	                        return fm.totalSize;
	                    }
	                    fm.totalSize = 0;
	                    $.each(self.fileManager.stack, function (id, f) {
	                        var size = parseFloat(f.size);
	                        fm.totalSize += isNaN(size) ? 0 : size;
	                    });
	                    return fm.totalSize;
	                },
	                add: function (file, id) {
	                    if (!id) {
	                        id = self.fileManager.getId(file);
	                    }
	                    if (!id) {
	                        return;
	                    }
	                    self.fileManager.stack[id] = {
	                        file: file,
	                        name: $h.getFileName(file),
	                        relativePath: $h.getFileRelativePath(file),
	                        size: file.size,
	                        nameFmt: self._getFileName(file, ''),
	                        sizeFmt: self._getSize(file.size)
	                    };
	                },
	                remove: function ($thumb) {
	                    var id = $thumb.attr('data-fileid');
	                    if (id) {
	                        self.fileManager.removeFile(id);
	                    }
	                },
	                removeFile: function (id) {
	                    delete self.fileManager.stack[id];
	                    delete self.fileManager.loadedImages[id];
	                },
	                move: function (idFrom, idTo) {
	                    var result = {}, stack = self.fileManager.stack;
	                    if (!idFrom && !idTo || idFrom === idTo) {
	                        return;
	                    }
	                    $.each(stack, function (k, v) {
	                        if (k !== idFrom) {
	                            result[k] = v;
	                        }
	                        if (k === idTo) {
	                            result[idFrom] = stack[idFrom];
	                        }
	                    });
	                    self.fileManager.stack = result;
	                },
	                list: function () {
	                    var files = [];
	                    $.each(self.fileManager.stack, function (k, v) {
	                        if (v && v.file) {
	                            files.push(v.file);
	                        }
	                    });
	                    return files;
	                },
	                isPending: function (id) {
	                    return $.inArray(id, self.fileManager.filesProcessed) === -1 && self.fileManager.exists(id);
	                },
	                isProcessed: function () {
	                    var filesProcessed = true, fm = self.fileManager;
	                    $.each(fm.stack, function (id) {
	                        if (fm.isPending(id)) {
	                            filesProcessed = false;
	                        }
	                    });
	                    return filesProcessed;
	                },
	                clear: function () {
	                    var fm = self.fileManager;
	                    self.isDuplicateError = false;
	                    self.isPersistentError = false;
	                    fm.totalFiles = null;
	                    fm.totalSize = null;
	                    fm.uploadedSize = 0;
	                    fm.stack = {};
	                    fm.errors = [];
	                    fm.filesProcessed = [];
	                    fm.stats = {};
	                    fm.clearImages();
	                },
	                clearImages: function () {
	                    self.fileManager.loadedImages = {};
	                    self.fileManager.totalImages = 0;
	                },
	                addImage: function (id, config) {
	                    self.fileManager.loadedImages[id] = config;
	                },
	                removeImage: function (id) {
	                    delete self.fileManager.loadedImages[id];
	                },
	                getImageIdList: function () {
	                    return $h.getObjectKeys(self.fileManager.loadedImages);
	                },
	                getImageCount: function () {
	                    return self.fileManager.getImageIdList().length;
	                },
	                getId: function (file) {
	                    return self._getFileId(file);
	                },
	                getIndex: function (id) {
	                    return self.fileManager.getIdList().indexOf(id);
	                },
	                getThumb: function (id) {
	                    var $thumb = null;
	                    self._getThumbs().each(function () {
	                        var $t = $(this);
	                        if ($t.attr('data-fileid') === id) {
	                            $thumb = $t;
	                        }
	                    });
	                    return $thumb;
	                },
	                getThumbIndex: function ($thumb) {
	                    var id = $thumb.attr('data-fileid');
	                    return self.fileManager.getIndex(id);
	                },
	                getIdList: function () {
	                    return $h.getObjectKeys(self.fileManager.stack);
	                },
	                getFile: function (id) {
	                    return self.fileManager.stack[id] || null;
	                },
	                getFileName: function (id, fmt) {
	                    var file = self.fileManager.getFile(id);
	                    if (!file) {
	                        return '';
	                    }
	                    return fmt ? (file.nameFmt || '') : file.name || '';
	                },
	                getFirstFile: function () {
	                    var ids = self.fileManager.getIdList(), id = ids && ids.length ? ids[0] : null;
	                    return self.fileManager.getFile(id);
	                },
	                setFile: function (id, file) {
	                    if (self.fileManager.getFile(id)) {
	                        self.fileManager.stack[id].file = file;
	                    } else {
	                        self.fileManager.add(file, id);
	                    }
	                },
	                setProcessed: function (id) {
	                    self.fileManager.filesProcessed.push(id);
	                },
	                getProgress: function () {
	                    var total = self.fileManager.total(), filesProcessed = self.fileManager.filesProcessed.length;
	                    if (!total) {
	                        return 0;
	                    }
	                    return Math.ceil(filesProcessed / total * 100);

	                },
	                setProgress: function (id, pct) {
	                    var f = self.fileManager.getFile(id);
	                    if (!isNaN(pct) && f) {
	                        f.progress = pct;
	                    }
	                }
	            };
	        },
	        _setUploadData: function (fd, config) {
	            var self = this;
	            $.each(config, function (key, value) {
	                var param = self.uploadParamNames[key] || key;
	                if ($h.isArray(value)) {
	                    fd.append(param, value[0], value[1]);
	                } else {
	                    fd.append(param, value);
	                }
	            });
	        },
	        _initResumableUpload: function () {
	            var self = this, opts = self.resumableUploadOptions, logs = $h.logMessages, rm, fm = self.fileManager;
	            if (!self.enableResumableUpload) {
	                return;
	            }
	            if (opts.fallback !== false && typeof opts.fallback !== 'function') {
	                opts.fallback = function (s) {
	                    s._log(logs.noResumableSupport);
	                    s.enableResumableUpload = false;
	                };
	            }
	            if (!$h.hasResumableUploadSupport() && opts.fallback !== false) {
	                opts.fallback(self);
	                return;
	            }
	            if (!self.uploadUrl && self.enableResumableUpload) {
	                self._log(logs.noUploadUrl);
	                self.enableResumableUpload = false;
	                return;

	            }
	            opts.chunkSize = parseFloat(opts.chunkSize);
	            if (opts.chunkSize <= 0 || isNaN(opts.chunkSize)) {
	                self._log(logs.invalidChunkSize, {chunkSize: opts.chunkSize});
	                self.enableResumableUpload = false;
	                return;
	            }
	            rm = self.resumableManager = {
	                init: function (id, f, index) {
	                    rm.logs = [];
	                    rm.stack = [];
	                    rm.error = '';
	                    rm.id = id;
	                    rm.file = f.file;
	                    rm.fileName = f.name;
	                    rm.fileIndex = index;
	                    rm.completed = false;
	                    rm.lastProgress = 0;
	                    if (self.showPreview) {
	                        rm.$thumb = fm.getThumb(id) || null;
	                        rm.$progress = rm.$btnDelete = null;
	                        if (rm.$thumb && rm.$thumb.length) {
	                            rm.$progress = rm.$thumb.find('.file-thumb-progress');
	                            rm.$btnDelete = rm.$thumb.find('.kv-file-remove');
	                        }
	                    }
	                    rm.chunkSize = opts.chunkSize * 1024;
	                    rm.chunkCount = rm.getTotalChunks();
	                },
	                setAjaxError: function (jqXHR, textStatus, errorThrown, isTest) {
	                    if (jqXHR.responseJSON && jqXHR.responseJSON.error) {
	                        errorThrown = jqXHR.responseJSON.error.toString();
	                    }
	                    if (!isTest) {
	                        rm.error = errorThrown;
	                    }
	                    if (opts.showErrorLog) {
	                        self._log(logs.ajaxError, {
	                            status: jqXHR.status,
	                            error: errorThrown,
	                            text: jqXHR.responseText || ''
	                        });
	                    }
	                },
	                reset: function () {
	                    rm.stack = [];
	                    rm.chunksProcessed = {};
	                },
	                setProcessed: function (status) {
	                    var id = rm.id, msg, $thumb = rm.$thumb, $prog = rm.$progress, hasThumb = $thumb && $thumb.length,
	                        params = {id: hasThumb ? $thumb.attr('id') : '', index: fm.getIndex(id), fileId: id};
	                    rm.completed = true;
	                    rm.lastProgress = 0;
	                    if (hasThumb) {
	                        $thumb.removeClass('file-uploading');
	                    }
	                    if (status === 'success') {
	                        fm.uploadedSize += rm.file.size;
	                        if (self.showPreview) {
	                            self._setProgress(101, $prog);
	                            self._setThumbStatus($thumb, 'Success');
	                            self._initUploadSuccess(rm.chunksProcessed[id].data, $thumb);
	                        }
	                        fm.removeFile(id);
	                        delete rm.chunksProcessed[id];
	                        self._raise('fileuploaded', [params.id, params.index, params.fileId]);
	                        if (fm.isProcessed()) {
	                            self._setProgress(101);
	                        }
	                    } else {
	                        if (status !== 'cancel') {
	                            if (self.showPreview) {
	                                self._setThumbStatus($thumb, 'Error');
	                                self._setPreviewError($thumb, true);
	                                self._setProgress(101, $prog, self.msgProgressError);
	                                self._setProgress(101, self.$progress, self.msgProgressError);
	                                self.cancelling = true;
	                            }
	                            if (!self.$errorContainer.find('li[data-file-id="' + params.fileId + '"]').length) {
	                                msg = self.msgResumableUploadRetriesExceeded.setTokens({
	                                    file: rm.fileName,
	                                    max: opts.maxRetries,
	                                    error: rm.error
	                                });
	                                self._showFileError(msg, params);
	                            }
	                        }
	                    }
	                    if (fm.isProcessed()) {
	                        rm.reset();
	                    }
	                },
	                check: function () {
	                    $.each(rm.logs, function (index, value) {
	                        if (!value) {
	                            return false;
	                        }
	                    });
	                },
	                processedResumables: function () {
	                    var logs = rm.logs, i, count = 0;
	                    if (!logs || !logs.length) {
	                        return 0;
	                    }
	                    for (i = 0; i < logs.length; i++) {
	                        if (logs[i] === true) {
	                            count++;
	                        }
	                    }
	                    return count;
	                },
	                getUploadedSize: function () {
	                    var size = rm.processedResumables() * rm.chunkSize;
	                    return size > rm.file.size ? rm.file.size : size;
	                },
	                getTotalChunks: function () {
	                    var chunkSize = parseFloat(rm.chunkSize);
	                    if (!isNaN(chunkSize) && chunkSize > 0) {
	                        return Math.ceil(rm.file.size / chunkSize);
	                    }
	                    return 0;
	                },
	                getProgress: function () {
	                    var chunksProcessed = rm.processedResumables(), total = rm.chunkCount;
	                    if (total === 0) {
	                        return 0;
	                    }
	                    return Math.ceil(chunksProcessed / total * 100);
	                },
	                checkAborted: function (intervalId) {
	                    if (self._isAborted()) {
	                        clearInterval(intervalId);
	                        self.unlock();
	                    }
	                },
	                upload: function () {
	                    var ids = fm.getIdList(), flag = 'new', intervalId;
	                    intervalId = setInterval(function () {
	                        var id;
	                        rm.checkAborted(intervalId);
	                        if (flag === 'new') {
	                            self.lock();
	                            flag = 'processing';
	                            id = ids.shift();
	                            fm.initStats(id);
	                            if (fm.stack[id]) {
	                                rm.init(id, fm.stack[id], fm.getIndex(id));
	                                rm.processUpload();
	                            }
	                        }
	                        if (!fm.isPending(id) && rm.completed) {
	                            flag = 'new';
	                        }
	                        if (fm.isProcessed()) {
	                            var $initThumbs = self.$preview.find('.file-preview-initial');
	                            if ($initThumbs.length) {
	                                $h.addCss($initThumbs, $h.SORT_CSS);
	                                self._initSortable();
	                            }
	                            clearInterval(intervalId);
	                            self._clearFileInput();
	                            self.unlock();
	                            setTimeout(function () {
	                                var data = self.previewCache.data;
	                                if (data) {
	                                    self.initialPreview = data.content;
	                                    self.initialPreviewConfig = data.config;
	                                    self.initialPreviewThumbTags = data.tags;
	                                }
	                                self._raise('filebatchuploadcomplete', [
	                                    self.initialPreview,
	                                    self.initialPreviewConfig,
	                                    self.initialPreviewThumbTags,
	                                    self._getExtraData()
	                                ]);
	                            }, self.processDelay);
	                        }
	                    }, self.processDelay);
	                },
	                uploadResumable: function () {
	                    var i, pool, tm = self.taskManager, total = rm.chunkCount;
	                    pool = tm.addPool(rm.id);
	                    for (i = 0; i < total; i++) {
	                        rm.logs[i] = !!(rm.chunksProcessed[rm.id] && rm.chunksProcessed[rm.id][i]);
	                        if (!rm.logs[i]) {
	                            rm.pushAjax(i, 0);
	                        }
	                    }
	                    pool.run(opts.maxThreads)
	                        .done(function () {
	                            rm.setProcessed('success');
	                        })
	                        .fail(function () {
	                            rm.setProcessed(pool.cancelled ? 'cancel' : 'error');
	                        });
	                },
	                processUpload: function () {
	                    var fd, f, id = rm.id, fnBefore, fnSuccess, fnError, fnComplete, outData;
	                    if (!opts.testUrl) {
	                        rm.uploadResumable();
	                        return;
	                    }
	                    fd = new FormData();
	                    f = fm.stack[id];
	                    self._setUploadData(fd, {
	                        fileId: id,
	                        fileName: f.fileName,
	                        fileSize: f.size,
	                        fileRelativePath: f.relativePath,
	                        chunkSize: rm.chunkSize,
	                        chunkCount: rm.chunkCount
	                    });
	                    fnBefore = function (jqXHR) {
	                        outData = self._getOutData(fd, jqXHR);
	                        self._raise('filetestbeforesend', [id, fm, rm, outData]);
	                    };
	                    fnSuccess = function (data, textStatus, jqXHR) {
	                        outData = self._getOutData(fd, jqXHR, data);
	                        var pNames = self.uploadParamNames, chunksUploaded = pNames.chunksUploaded || 'chunksUploaded',
	                            params = [id, fm, rm, outData];
	                        if (!data[chunksUploaded] || !$h.isArray(data[chunksUploaded])) {
	                            self._raise('filetesterror', params);
	                        } else {
	                            if (!rm.chunksProcessed[id]) {
	                                rm.chunksProcessed[id] = {};
	                            }
	                            $.each(data[chunksUploaded], function (key, index) {
	                                rm.logs[index] = true;
	                                rm.chunksProcessed[id][index] = true;
	                            });
	                            rm.chunksProcessed[id].data = data;
	                            self._raise('filetestsuccess', params);
	                        }
	                        rm.uploadResumable();
	                    };
	                    fnError = function (jqXHR, textStatus, errorThrown) {
	                        outData = self._getOutData(fd, jqXHR);
	                        self._raise('filetestajaxerror', [id, fm, rm, outData]);
	                        rm.setAjaxError(jqXHR, textStatus, errorThrown, true);
	                        rm.uploadResumable();
	                    };
	                    fnComplete = function () {
	                        self._raise('filetestcomplete', [id, fm, rm, self._getOutData(fd)]);
	                    };
	                    self._ajaxSubmit(fnBefore, fnSuccess, fnComplete, fnError, fd, id, rm.fileIndex, opts.testUrl);
	                },
	                pushAjax: function (index, retry) {
	                    var tm = self.taskManager, pool = tm.getPool(rm.id);
	                    pool.addTask(pool.size() + 1, function (deferrer) {
	                        // use fifo chunk stack
	                        var arr = rm.stack.shift(), index;
	                        index = arr[0];
	                        if (!rm.chunksProcessed[rm.id] || !rm.chunksProcessed[rm.id][index]) {
	                            rm.sendAjax(index, arr[1], deferrer);
	                        } else {
	                            self._log(logs.chunkQueueError, {index: index});
	                        }
	                    });
	                    rm.stack.push([index, retry]);
	                },
	                sendAjax: function (index, retry, deferrer) {
	                    var f, chunkSize = rm.chunkSize, id = rm.id, file = rm.file, $thumb = rm.$thumb,
	                        msgs = $h.logMessages, $btnDelete = rm.$btnDelete, logError = function (msg, tokens) {
	                            if (tokens) {
	                                msg = msg.setTokens(tokens);
	                            }
	                            msg = 'Error processing resumable ajax request. ' + msg;
	                            self._log(msg);
	                            deferrer.reject(msg);
	                        };
	                    if (rm.chunksProcessed[id] && rm.chunksProcessed[id][index]) {
	                        return;
	                    }
	                    if (retry > opts.maxRetries) {
	                        logError(msgs.resumableMaxRetriesReached, {n: opts.maxRetries});
	                        rm.setProcessed('error');
	                        return;
	                    }
	                    var fd, outData, fnBefore, fnSuccess, fnError, fnComplete, slice = file.slice ? 'slice' :
	                        (file.mozSlice ? 'mozSlice' : (file.webkitSlice ? 'webkitSlice' : 'slice')),
	                        blob = file[slice](chunkSize * index, chunkSize * (index + 1));
	                    fd = new FormData();
	                    f = fm.stack[id];
	                    self._setUploadData(fd, {
	                        chunkCount: rm.chunkCount,
	                        chunkIndex: index,
	                        chunkSize: chunkSize,
	                        chunkSizeStart: chunkSize * index,
	                        fileBlob: [blob, rm.fileName],
	                        fileId: id,
	                        fileName: rm.fileName,
	                        fileRelativePath: f.relativePath,
	                        fileSize: file.size,
	                        retryCount: retry
	                    });
	                    if (rm.$progress && rm.$progress.length) {
	                        rm.$progress.show();
	                    }
	                    fnBefore = function (jqXHR) {
	                        outData = self._getOutData(fd, jqXHR);
	                        if (self.showPreview) {
	                            if (!$thumb.hasClass('file-preview-success')) {
	                                self._setThumbStatus($thumb, 'Loading');
	                                $h.addCss($thumb, 'file-uploading');
	                            }
	                            $btnDelete.attr('disabled', true);
	                        }
	                        self._raise('filechunkbeforesend', [id, index, retry, fm, rm, outData]);
	                    };
	                    fnSuccess = function (data, textStatus, jqXHR) {
	                        if (self._isAborted()) {
	                            logError(msgs.resumableAborting);
	                            return;
	                        }
	                        outData = self._getOutData(fd, jqXHR, data);
	                        var paramNames = self.uploadParamNames, chunkIndex = paramNames.chunkIndex || 'chunkIndex',
	                            params = [id, index, retry, fm, rm, outData];
	                        if (data.error) {
	                            if (opts.showErrorLog) {
	                                self._log(logs.retryStatus, {
	                                    retry: retry + 1,
	                                    filename: rm.fileName,
	                                    chunk: index
	                                });
	                            }
	                            rm.pushAjax(index, retry + 1);
	                            rm.error = data.error;
	                            self._raise('filechunkerror', params);
	                        } else {
	                            rm.logs[data[chunkIndex]] = true;
	                            if (!rm.chunksProcessed[id]) {
	                                rm.chunksProcessed[id] = {};
	                            }
	                            rm.chunksProcessed[id][data[chunkIndex]] = true;
	                            rm.chunksProcessed[id].data = data;
	                            deferrer.resolve.call(null, data);
	                            self._raise('filechunksuccess', params);
	                            rm.check();
	                        }
	                    };
	                    fnError = function (jqXHR, textStatus, errorThrown) {
	                        if (self._isAborted()) {
	                            logError(msgs.resumableAborting);
	                            return;
	                        }
	                        outData = self._getOutData(fd, jqXHR);
	                        rm.setAjaxError(jqXHR, textStatus, errorThrown);
	                        self._raise('filechunkajaxerror', [id, index, retry, fm, rm, outData]);
	                        rm.pushAjax(index, retry + 1);                        // push another task
	                        logError(msgs.resumableRetryError, {n: retry - 1}); // resolve the current task
	                    };
	                    fnComplete = function () {
	                        if (!self._isAborted()) {
	                            self._raise('filechunkcomplete', [id, index, retry, fm, rm, self._getOutData(fd)]);
	                        }
	                    };
	                    self._ajaxSubmit(fnBefore, fnSuccess, fnComplete, fnError, fd, id, rm.fileIndex);
	                }
	            };
	            rm.reset();
	        },
	        _initTemplateDefaults: function () {
	            var self = this, tMain1, tMain2, tPreview, tFileIcon, tClose, tCaption, tBtnDefault, tBtnLink, tBtnBrowse,
	                tModalMain, tModal, tProgress, tSize, tFooter, tActions, tActionDelete, tActionUpload, tActionDownload,
	                tActionZoom, tActionDrag, tIndicator, tTagBef, tTagBef1, tTagBef2, tTagAft, tGeneric, tHtml, tImage,
	                tText, tOffice, tGdocs, tVideo, tAudio, tFlash, tObject, tPdf, tOther, tStyle, tZoomCache, vDefaultDim,
	                tStats;
	            tMain1 = '{preview}\n' +
	                '<div class="kv-upload-progress kv-hidden"></div><div class="clearfix"></div>\n' +
	                '<div class="input-group {class}">\n' +
	                '  {caption}\n' +
	                '<div class="input-group-btn input-group-append">\n' +
	                '      {remove}\n' +
	                '      {cancel}\n' +
	                '      {pause}\n' +
	                '      {upload}\n' +
	                '      {browse}\n' +
	                '    </div>\n' +
	                '</div>';
	            tMain2 = '{preview}\n<div class="kv-upload-progress kv-hidden"></div>\n<div class="clearfix"></div>\n' +
	                '{remove}\n{cancel}\n{upload}\n{browse}\n';
	            tPreview = '<div class="file-preview {class}">\n' +
	                '  {close}' +
	                '  <div class="{dropClass} clearfix">\n' +
	                '    <div class="file-preview-thumbnails clearfix">\n' +
	                '    </div>\n' +
	                '    <div class="file-preview-status text-center text-success"></div>\n' +
	                '    <div class="kv-fileinput-error"></div>\n' +
	                '  </div>\n' +
	                '</div>';
	            tClose = $h.closeButton('fileinput-remove');
	            tFileIcon = '<i class="glyphicon glyphicon-file"></i>';
	            // noinspection HtmlUnknownAttribute
	            tCaption = '<div class="file-caption form-control {class}" tabindex="500">\n' +
	                '  <span class="file-caption-icon"></span>\n' +
	                '  <input class="file-caption-name" onkeydown="return false;" onpaste="return false;">\n' +
	                '</div>';
	            //noinspection HtmlUnknownAttribute
	            tBtnDefault = '<button type="{type}" tabindex="500" title="{title}" class="{css}" ' +
	                '{status}>{icon} {label}</button>';
	            //noinspection HtmlUnknownTarget,HtmlUnknownAttribute
	            tBtnLink = '<a href="{href}" tabindex="500" title="{title}" class="{css}" {status}>{icon} {label}</a>';
	            //noinspection HtmlUnknownAttribute
	            tBtnBrowse = '<div tabindex="500" class="{css}" {status}>{icon} {label}</div>';
	            tModalMain = '<div id="' + $h.MODAL_ID + '" class="file-zoom-dialog modal fade" ' +
	                'tabindex="-1" aria-labelledby="' + $h.MODAL_ID + 'Label"></div>';
	            tModal = '<div class="modal-dialog modal-lg{rtl}" role="document">\n' +
	                '  <div class="modal-content">\n' +
	                '    <div class="modal-header">\n' +
	                '      <h5 class="modal-title">{heading}</h5>\n' +
	                '      <span class="kv-zoom-title"></span>\n' +
	                '      <div class="kv-zoom-actions">{toggleheader}{fullscreen}{borderless}{close}</div>\n' +
	                '    </div>\n' +
	                '    <div class="modal-body">\n' +
	                '      <div class="floating-buttons"></div>\n' +
	                '      <div class="kv-zoom-body file-zoom-content {zoomFrameClass}"></div>\n' + '{prev} {next}\n' +
	                '    </div>\n' +
	                '  </div>\n' +
	                '</div>\n';
	            tProgress = '<div class="progress">\n' +
	                '    <div class="{class}" role="progressbar"' +
	                ' aria-valuenow="{percent}" aria-valuemin="0" aria-valuemax="100" style="width:{percent}%;">\n' +
	                '        {status}\n' +
	                '     </div>\n' +
	                '</div>{stats}';
	            tStats = '<div class="text-info file-upload-stats">' +
	                '<span class="pending-time">{pendingTime}</span> ' +
	                '<span class="upload-speed">{uploadSpeed}</span>' +
	                '</div>';
	            tSize = ' <samp>({sizeText})</samp>';
	            tFooter = '<div class="file-thumbnail-footer">\n' +
	                '    <div class="file-footer-caption" title="{caption}">\n' +
	                '        <div class="file-caption-info">{caption}</div>\n' +
	                '        <div class="file-size-info">{size}</div>\n' +
	                '    </div>\n' +
	                '    {progress}\n{indicator}\n{actions}\n' +
	                '</div>';
	            tActions = '<div class="file-actions">\n' +
	                '    <div class="file-footer-buttons">\n' +
	                '        {download} {upload} {delete} {zoom} {other}' +
	                '    </div>\n' +
	                '</div>\n' +
	                '{drag}\n' +
	                '<div class="clearfix"></div>';
	            //noinspection HtmlUnknownAttribute
	            tActionDelete = '<button type="button" class="kv-file-remove {removeClass}" ' +
	                'title="{removeTitle}" {dataUrl}{dataKey}>{removeIcon}</button>\n';
	            tActionUpload = '<button type="button" class="kv-file-upload {uploadClass}" title="{uploadTitle}">' +
	                '{uploadIcon}</button>';
	            tActionDownload = '<a class="kv-file-download {downloadClass}" title="{downloadTitle}" ' +
	                'href="{downloadUrl}" download="{caption}" target="_blank">{downloadIcon}</a>';
	            tActionZoom = '<button type="button" class="kv-file-zoom {zoomClass}" ' +
	                'title="{zoomTitle}">{zoomIcon}</button>';
	            tActionDrag = '<span class="file-drag-handle {dragClass}" title="{dragTitle}">{dragIcon}</span>';
	            tIndicator = '<div class="file-upload-indicator" title="{indicatorTitle}">{indicator}</div>';
	            tTagBef = '<div class="file-preview-frame {frameClass}" id="{previewId}" data-fileindex="{fileindex}"' +
	                ' data-fileid="{fileid}" data-template="{template}"';
	            tTagBef1 = tTagBef + '><div class="kv-file-content">\n';
	            tTagBef2 = tTagBef + ' title="{caption}"><div class="kv-file-content">\n';
	            tTagAft = '</div>{footer}\n{zoomCache}</div>\n';
	            tGeneric = '{content}\n';
	            tStyle = ' {style}';
	            tHtml = '<div class="kv-preview-data file-preview-html" title="{caption}"' + tStyle + '>{data}</div>\n';
	            tImage = '<img src="{data}" class="file-preview-image kv-preview-data" title="{title}" ' +
	                'alt="{alt}"' + tStyle + '>\n';
	            tText = '<textarea class="kv-preview-data file-preview-text" title="{caption}" readonly' + tStyle + '>' +
	                '{data}</textarea>\n';
	            tOffice = '<iframe class="kv-preview-data file-preview-office" ' +
	                'src="https://view.officeapps.live.com/op/embed.aspx?src={data}"' + tStyle + '></iframe>';
	            tGdocs = '<iframe class="kv-preview-data file-preview-gdocs" ' +
	                'src="https://docs.google.com/gview?url={data}&embedded=true"' + tStyle + '></iframe>';
	            tVideo = '<video class="kv-preview-data file-preview-video" controls' + tStyle + '>\n' +
	                '<source src="{data}" type="{type}">\n' + $h.DEFAULT_PREVIEW + '\n</video>\n';
	            tAudio = '<!--suppress ALL --><audio class="kv-preview-data file-preview-audio" controls' + tStyle + '>\n<source src="{data}" ' +
	                'type="{type}">\n' + $h.DEFAULT_PREVIEW + '\n</audio>\n';
	            tFlash = '<embed class="kv-preview-data file-preview-flash" src="{data}" type="application/x-shockwave-flash"' + tStyle + '>\n';
	            tPdf = '<embed class="kv-preview-data file-preview-pdf" src="{data}" type="application/pdf"' + tStyle + '>\n';
	            tObject = '<object class="kv-preview-data file-preview-object file-object {typeCss}" ' +
	                'data="{data}" type="{type}"' + tStyle + '>\n' + '<param name="movie" value="{caption}" />\n' +
	                $h.OBJECT_PARAMS + ' ' + $h.DEFAULT_PREVIEW + '\n</object>\n';
	            tOther = '<div class="kv-preview-data file-preview-other-frame"' + tStyle + '>\n' + $h.DEFAULT_PREVIEW + '\n</div>\n';
	            tZoomCache = '<div class="kv-zoom-cache" style="display:none">{zoomContent}</div>';
	            vDefaultDim = {width: '100%', height: '100%', 'min-height': '480px'};
	            if (self._isPdfRendered()) {
	                tPdf = self.pdfRendererTemplate.replace('{renderer}', self._encodeURI(self.pdfRendererUrl));
	            }
	            self.defaults = {
	                layoutTemplates: {
	                    main1: tMain1,
	                    main2: tMain2,
	                    preview: tPreview,
	                    close: tClose,
	                    fileIcon: tFileIcon,
	                    caption: tCaption,
	                    modalMain: tModalMain,
	                    modal: tModal,
	                    progress: tProgress,
	                    stats: tStats,
	                    size: tSize,
	                    footer: tFooter,
	                    indicator: tIndicator,
	                    actions: tActions,
	                    actionDelete: tActionDelete,
	                    actionUpload: tActionUpload,
	                    actionDownload: tActionDownload,
	                    actionZoom: tActionZoom,
	                    actionDrag: tActionDrag,
	                    btnDefault: tBtnDefault,
	                    btnLink: tBtnLink,
	                    btnBrowse: tBtnBrowse,
	                    zoomCache: tZoomCache
	                },
	                previewMarkupTags: {
	                    tagBefore1: tTagBef1,
	                    tagBefore2: tTagBef2,
	                    tagAfter: tTagAft
	                },
	                previewContentTemplates: {
	                    generic: tGeneric,
	                    html: tHtml,
	                    image: tImage,
	                    text: tText,
	                    office: tOffice,
	                    gdocs: tGdocs,
	                    video: tVideo,
	                    audio: tAudio,
	                    flash: tFlash,
	                    object: tObject,
	                    pdf: tPdf,
	                    other: tOther
	                },
	                allowedPreviewTypes: ['image', 'html', 'text', 'video', 'audio', 'flash', 'pdf', 'object'],
	                previewTemplates: {},
	                previewSettings: {
	                    image: {width: 'auto', height: 'auto', 'max-width': '100%', 'max-height': '100%'},
	                    html: {width: '213px', height: '160px'},
	                    text: {width: '213px', height: '160px'},
	                    office: {width: '213px', height: '160px'},
	                    gdocs: {width: '213px', height: '160px'},
	                    video: {width: '213px', height: '160px'},
	                    audio: {width: '100%', height: '30px'},
	                    flash: {width: '213px', height: '160px'},
	                    object: {width: '213px', height: '160px'},
	                    pdf: {width: '100%', height: '160px', 'position': 'relative'},
	                    other: {width: '213px', height: '160px'}
	                },
	                previewSettingsSmall: {
	                    image: {width: 'auto', height: 'auto', 'max-width': '100%', 'max-height': '100%'},
	                    html: {width: '100%', height: '160px'},
	                    text: {width: '100%', height: '160px'},
	                    office: {width: '100%', height: '160px'},
	                    gdocs: {width: '100%', height: '160px'},
	                    video: {width: '100%', height: 'auto'},
	                    audio: {width: '100%', height: '30px'},
	                    flash: {width: '100%', height: 'auto'},
	                    object: {width: '100%', height: 'auto'},
	                    pdf: {width: '100%', height: '160px'},
	                    other: {width: '100%', height: '160px'}
	                },
	                previewZoomSettings: {
	                    image: {width: 'auto', height: 'auto', 'max-width': '100%', 'max-height': '100%'},
	                    html: vDefaultDim,
	                    text: vDefaultDim,
	                    office: {width: '100%', height: '100%', 'max-width': '100%', 'min-height': '480px'},
	                    gdocs: {width: '100%', height: '100%', 'max-width': '100%', 'min-height': '480px'},
	                    video: {width: 'auto', height: '100%', 'max-width': '100%'},
	                    audio: {width: '100%', height: '30px'},
	                    flash: {width: 'auto', height: '480px'},
	                    object: {width: 'auto', height: '100%', 'max-width': '100%', 'min-height': '480px'},
	                    pdf: vDefaultDim,
	                    other: {width: 'auto', height: '100%', 'min-height': '480px'}
	                },
	                mimeTypeAliases: {
	                    'video/quicktime': 'video/mp4'
	                },
	                fileTypeSettings: {
	                    image: function (vType, vName) {
	                        return ($h.compare(vType, 'image.*') && !$h.compare(vType, /(tiff?|wmf)$/i) ||
	                            $h.compare(vName, /\.(gif|png|jpe?g)$/i));
	                    },
	                    html: function (vType, vName) {
	                        return $h.compare(vType, 'text/html') || $h.compare(vName, /\.(htm|html)$/i);
	                    },
	                    office: function (vType, vName) {
	                        return $h.compare(vType, /(word|excel|powerpoint|office)$/i) ||
	                            $h.compare(vName, /\.(docx?|xlsx?|pptx?|pps|potx?)$/i);
	                    },
	                    gdocs: function (vType, vName) {
	                        return $h.compare(vType, /(word|excel|powerpoint|office|iwork-pages|tiff?)$/i) ||
	                            $h.compare(vName,
	                                /\.(docx?|xlsx?|pptx?|pps|potx?|rtf|ods|odt|pages|ai|dxf|ttf|tiff?|wmf|e?ps)$/i);
	                    },
	                    text: function (vType, vName) {
	                        return $h.compare(vType, 'text.*') || $h.compare(vName, /\.(xml|javascript)$/i) ||
	                            $h.compare(vName, /\.(txt|md|csv|nfo|ini|json|php|js|css)$/i);
	                    },
	                    video: function (vType, vName) {
	                        return $h.compare(vType, 'video.*') && ($h.compare(vType, /(ogg|mp4|mp?g|mov|webm|3gp)$/i) ||
	                            $h.compare(vName, /\.(og?|mp4|webm|mp?g|mov|3gp)$/i));
	                    },
	                    audio: function (vType, vName) {
	                        return $h.compare(vType, 'audio.*') && ($h.compare(vName, /(ogg|mp3|mp?g|wav)$/i) ||
	                            $h.compare(vName, /\.(og?|mp3|mp?g|wav)$/i));
	                    },
	                    flash: function (vType, vName) {
	                        return $h.compare(vType, 'application/x-shockwave-flash', true) || $h.compare(vName,
	                            /\.(swf)$/i);
	                    },
	                    pdf: function (vType, vName) {
	                        return $h.compare(vType, 'application/pdf', true) || $h.compare(vName, /\.(pdf)$/i);
	                    },
	                    object: function () {
	                        return true;
	                    },
	                    other: function () {
	                        return true;
	                    }
	                },
	                fileActionSettings: {
	                    showRemove: true,
	                    showUpload: true,
	                    showDownload: true,
	                    showZoom: true,
	                    showDrag: true,
	                    removeIcon: '<i class="glyphicon glyphicon-trash"></i>',
	                    removeClass: 'btn btn-sm btn-kv btn-default btn-outline-secondary',
	                    removeErrorClass: 'btn btn-sm btn-kv btn-danger',
	                    removeTitle: 'Remove file',
	                    uploadIcon: '<i class="glyphicon glyphicon-upload"></i>',
	                    uploadClass: 'btn btn-sm btn-kv btn-default btn-outline-secondary',
	                    uploadTitle: 'Upload file',
	                    uploadRetryIcon: '<i class="glyphicon glyphicon-repeat"></i>',
	                    uploadRetryTitle: 'Retry upload',
	                    downloadIcon: '<i class="glyphicon glyphicon-download"></i>',
	                    downloadClass: 'btn btn-sm btn-kv btn-default btn-outline-secondary',
	                    downloadTitle: 'Download file',
	                    zoomIcon: '<i class="glyphicon glyphicon-zoom-in"></i>',
	                    zoomClass: 'btn btn-sm btn-kv btn-default btn-outline-secondary',
	                    zoomTitle: 'View Details',
	                    dragIcon: '<i class="glyphicon glyphicon-move"></i>',
	                    dragClass: 'text-info',
	                    dragTitle: 'Move / Rearrange',
	                    dragSettings: {},
	                    indicatorNew: '<i class="glyphicon glyphicon-plus-sign text-warning"></i>',
	                    indicatorSuccess: '<i class="glyphicon glyphicon-ok-sign text-success"></i>',
	                    indicatorError: '<i class="glyphicon glyphicon-exclamation-sign text-danger"></i>',
	                    indicatorLoading: '<i class="glyphicon glyphicon-hourglass text-muted"></i>',
	                    indicatorPaused: '<i class="glyphicon glyphicon-pause text-primary"></i>',
	                    indicatorNewTitle: 'Not uploaded yet',
	                    indicatorSuccessTitle: 'Uploaded',
	                    indicatorErrorTitle: 'Upload Error',
	                    indicatorLoadingTitle: 'Uploading &hellip;',
	                    indicatorPausedTitle: 'Upload Paused'
	                }
	            };
	            $.each(self.defaults, function (key, setting) {
	                if (key === 'allowedPreviewTypes') {
	                    if (self.allowedPreviewTypes === undefined) {
	                        self.allowedPreviewTypes = setting;
	                    }
	                    return;
	                }
	                self[key] = $.extend(true, {}, setting, self[key]);
	            });
	            self._initPreviewTemplates();
	        },
	        _initPreviewTemplates: function () {
	            var self = this, tags = self.previewMarkupTags, tagBef, tagAft = tags.tagAfter;
	            $.each(self.previewContentTemplates, function (key, value) {
	                if ($h.isEmpty(self.previewTemplates[key])) {
	                    tagBef = tags.tagBefore2;
	                    if (key === 'generic' || key === 'image' || key === 'html' || key === 'text') {
	                        tagBef = tags.tagBefore1;
	                    }
	                    if (self._isPdfRendered() && key === 'pdf') {
	                        tagBef = tagBef.replace('kv-file-content', 'kv-file-content kv-pdf-rendered');
	                    }
	                    self.previewTemplates[key] = tagBef + value + tagAft;
	                }
	            });
	        },
	        _initPreviewCache: function () {
	            var self = this;
	            self.previewCache = {
	                data: {},
	                init: function () {
	                    var content = self.initialPreview;
	                    if (content.length > 0 && !$h.isArray(content)) {
	                        content = content.split(self.initialPreviewDelimiter);
	                    }
	                    self.previewCache.data = {
	                        content: content,
	                        config: self.initialPreviewConfig,
	                        tags: self.initialPreviewThumbTags
	                    };
	                },
	                count: function (skipNull) {
	                    if (!self.previewCache.data || !self.previewCache.data.content) {
	                        return 0;
	                    }
	                    if (skipNull) {
	                        var chk = self.previewCache.data.content.filter(function (n) {
	                            return n !== null;
	                        });
	                        return chk.length;
	                    }
	                    return self.previewCache.data.content.length;
	                },
	                get: function (i, isDisabled) {
	                    var ind = $h.INIT_FLAG + i, data = self.previewCache.data, config = data.config[i],
	                        content = data.content[i], out, $tmp, cat, ftr,
	                        fname, ftype, frameClass, asData = $h.ifSet('previewAsData', config, self.initialPreviewAsData),
	                        a = config ? {title: config.title || null, alt: config.alt || null} : {title: null, alt: null},
	                        parseTemplate = function (cat, dat, fname, ftype, ftr, ind, fclass, t) {
	                            var fc = ' file-preview-initial ' + $h.SORT_CSS + (fclass ? ' ' + fclass : ''),
	                                id = self.previewInitId + '-' + ind,
	                                fileId = config && config.fileId || id;
	                            /** @namespace config.zoomData */
	                            return self._generatePreviewTemplate(cat, dat, fname, ftype, id, fileId, false, null, fc,
	                                ftr, ind, t, a, config && config.zoomData || dat);
	                        };
	                    if (!content || !content.length) {
	                        return '';
	                    }
	                    isDisabled = isDisabled === undefined ? true : isDisabled;
	                    cat = $h.ifSet('type', config, self.initialPreviewFileType || 'generic');
	                    fname = $h.ifSet('filename', config, $h.ifSet('caption', config));
	                    ftype = $h.ifSet('filetype', config, cat);
	                    ftr = self.previewCache.footer(i, isDisabled, (config && config.size || null));
	                    frameClass = $h.ifSet('frameClass', config);
	                    if (asData) {
	                        out = parseTemplate(cat, content, fname, ftype, ftr, ind, frameClass);
	                    } else {
	                        out = parseTemplate('generic', content, fname, ftype, ftr, ind, frameClass, cat)
	                            .setTokens({'content': data.content[i]});
	                    }
	                    if (data.tags.length && data.tags[i]) {
	                        out = $h.replaceTags(out, data.tags[i]);
	                    }
	                    /** @namespace config.frameAttr */
	                    if (!$h.isEmpty(config) && !$h.isEmpty(config.frameAttr)) {
	                        $tmp = $h.createElement(out);
	                        $tmp.find('.file-preview-initial').attr(config.frameAttr);
	                        out = $tmp.html();
	                        $tmp.remove();
	                    }
	                    return out;
	                },
	                clean: function (data) {
	                    data.content = $h.cleanArray(data.content);
	                    data.config = $h.cleanArray(data.config);
	                    data.tags = $h.cleanArray(data.tags);
	                    self.previewCache.data = data;
	                },
	                add: function (content, config, tags, append) {
	                    var data = self.previewCache.data, index;
	                    if (!content || !content.length) {
	                        return 0;
	                    }
	                    index = content.length - 1;
	                    if (!$h.isArray(content)) {
	                        content = content.split(self.initialPreviewDelimiter);
	                    }
	                    if (append && data.content) {
	                        index = data.content.push(content[0]) - 1;
	                        data.config[index] = config;
	                        data.tags[index] = tags;
	                    } else {
	                        data.content = content;
	                        data.config = config;
	                        data.tags = tags;
	                    }
	                    self.previewCache.clean(data);
	                    return index;
	                },
	                set: function (content, config, tags, append) {
	                    var data = self.previewCache.data, i, chk;
	                    if (!content || !content.length) {
	                        return;
	                    }
	                    if (!$h.isArray(content)) {
	                        content = content.split(self.initialPreviewDelimiter);
	                    }
	                    chk = content.filter(function (n) {
	                        return n !== null;
	                    });
	                    if (!chk.length) {
	                        return;
	                    }
	                    if (data.content === undefined) {
	                        data.content = [];
	                    }
	                    if (data.config === undefined) {
	                        data.config = [];
	                    }
	                    if (data.tags === undefined) {
	                        data.tags = [];
	                    }
	                    if (append) {
	                        for (i = 0; i < content.length; i++) {
	                            if (content[i]) {
	                                data.content.push(content[i]);
	                            }
	                        }
	                        for (i = 0; i < config.length; i++) {
	                            if (config[i]) {
	                                data.config.push(config[i]);
	                            }
	                        }
	                        for (i = 0; i < tags.length; i++) {
	                            if (tags[i]) {
	                                data.tags.push(tags[i]);
	                            }
	                        }
	                    } else {
	                        data.content = content;
	                        data.config = config;
	                        data.tags = tags;
	                    }
	                    self.previewCache.clean(data);
	                },
	                unset: function (index) {
	                    var chk = self.previewCache.count(), rev = self.reversePreviewOrder;
	                    if (!chk) {
	                        return;
	                    }
	                    if (chk === 1) {
	                        self.previewCache.data.content = [];
	                        self.previewCache.data.config = [];
	                        self.previewCache.data.tags = [];
	                        self.initialPreview = [];
	                        self.initialPreviewConfig = [];
	                        self.initialPreviewThumbTags = [];
	                        return;
	                    }
	                    self.previewCache.data.content = $h.spliceArray(self.previewCache.data.content, index, rev);
	                    self.previewCache.data.config = $h.spliceArray(self.previewCache.data.config, index, rev);
	                    self.previewCache.data.tags = $h.spliceArray(self.previewCache.data.tags, index, rev);
	                    var data = $.extend(true, {}, self.previewCache.data);
	                    self.previewCache.clean(data);
	                },
	                out: function () {
	                    var html = '', caption, len = self.previewCache.count(), i, content;
	                    if (len === 0) {
	                        return {content: '', caption: ''};
	                    }
	                    for (i = 0; i < len; i++) {
	                        content = self.previewCache.get(i);
	                        html = self.reversePreviewOrder ? (content + html) : (html + content);
	                    }
	                    caption = self._getMsgSelected(len);
	                    return {content: html, caption: caption};
	                },
	                footer: function (i, isDisabled, size) {
	                    var data = self.previewCache.data || {};
	                    if ($h.isEmpty(data.content)) {
	                        return '';
	                    }
	                    if ($h.isEmpty(data.config) || $h.isEmpty(data.config[i])) {
	                        data.config[i] = {};
	                    }
	                    isDisabled = isDisabled === undefined ? true : isDisabled;
	                    var config = data.config[i], caption = $h.ifSet('caption', config), a,
	                        width = $h.ifSet('width', config, 'auto'), url = $h.ifSet('url', config, false),
	                        key = $h.ifSet('key', config, null), fileId = $h.ifSet('fileId', config, null),
	                        fs = self.fileActionSettings, initPreviewShowDel = self.initialPreviewShowDelete || false,
	                        downloadInitialUrl = !self.initialPreviewDownloadUrl ? '' :
	                            self.initialPreviewDownloadUrl + '?key=' + key + (fileId ? '&fileId=' + fileId : ''),
	                        dUrl = config.downloadUrl || downloadInitialUrl,
	                        dFil = config.filename || config.caption || '',
	                        initPreviewShowDwl = !!(dUrl),
	                        sDel = $h.ifSet('showRemove', config, initPreviewShowDel),
	                        sDwl = $h.ifSet('showDownload', config, $h.ifSet('showDownload', fs, initPreviewShowDwl)),
	                        sZm = $h.ifSet('showZoom', config, $h.ifSet('showZoom', fs, true)),
	                        sDrg = $h.ifSet('showDrag', config, $h.ifSet('showDrag', fs, true)),
	                        dis = (url === false) && isDisabled;
	                    sDwl = sDwl && config.downloadUrl !== false && !!dUrl;
	                    a = self._renderFileActions(config, false, sDwl, sDel, sZm, sDrg, dis, url, key, true, dUrl, dFil);
	                    return self._getLayoutTemplate('footer').setTokens({
	                        'progress': self._renderThumbProgress(),
	                        'actions': a,
	                        'caption': caption,
	                        'size': self._getSize(size),
	                        'width': width,
	                        'indicator': ''
	                    });
	                }
	            };
	            self.previewCache.init();
	        },
	        _isPdfRendered: function () {
	            var self = this, useLib = self.usePdfRenderer,
	                flag = typeof useLib === 'function' ? useLib() : !!useLib;
	            return flag && self.pdfRendererUrl;
	        },
	        _handler: function ($el, event, callback) {
	            var self = this, ns = self.namespace, ev = event.split(' ').join(ns + ' ') + ns;
	            if (!$el || !$el.length) {
	                return;
	            }
	            $el.off(ev).on(ev, callback);
	        },
	        _encodeURI: function (vUrl) {
	            var self = this;
	            return self.encodeUrl ? encodeURI(vUrl) : vUrl;
	        },
	        _log: function (msg, tokens) {
	            var self = this, id = self.$element.attr('id');
	            if (!self.showConsoleLogs) {
	                return;
	            }
	            if (id) {
	                msg = '"' + id + '": ' + msg;
	            }
	            msg = 'bootstrap-fileinput: ' + msg;
	            if (typeof tokens === 'object') {
	                msg = msg.setTokens(tokens);
	            }
	            if (window.console && typeof window.console.log !== 'undefined') {
	                window.console.log(msg);
	            } else {
	                window.alert(msg);
	            }
	        },
	        _validate: function () {
	            var self = this, status = self.$element.attr('type') === 'file';
	            if (!status) {
	                self._log($h.logMessages.badInputType);
	            }
	            return status;
	        },
	        _errorsExist: function () {
	            var self = this, $err, $errList = self.$errorContainer.find('li');
	            if ($errList.length) {
	                return true;
	            }
	            $err = $h.createElement(self.$errorContainer.html());
	            $err.find('.kv-error-close').remove();
	            $err.find('ul').remove();
	            return !!$.trim($err.text()).length;
	        },
	        _errorHandler: function (evt, caption) {
	            var self = this, err = evt.target.error, showError = function (msg) {
	                self._showError(msg.replace('{name}', caption));
	            };
	            /** @namespace err.NOT_FOUND_ERR */
	            /** @namespace err.SECURITY_ERR */
	            /** @namespace err.NOT_READABLE_ERR */
	            if (err.code === err.NOT_FOUND_ERR) {
	                showError(self.msgFileNotFound);
	            } else {
	                if (err.code === err.SECURITY_ERR) {
	                    showError(self.msgFileSecured);
	                } else {
	                    if (err.code === err.NOT_READABLE_ERR) {
	                        showError(self.msgFileNotReadable);
	                    } else {
	                        if (err.code === err.ABORT_ERR) {
	                            showError(self.msgFilePreviewAborted);
	                        } else {
	                            showError(self.msgFilePreviewError);
	                        }
	                    }
	                }
	            }
	        },
	        _addError: function (msg) {
	            var self = this, $error = self.$errorContainer;
	            if (msg && $error.length) {
	                $h.setHtml($error, self.errorCloseButton + msg);
	                self._handler($error.find('.kv-error-close'), 'click', function () {
	                    setTimeout(function () {
	                        if (self.showPreview && !self.getFrames().length) {
	                            self.clear();
	                        }
	                        $error.fadeOut('slow');
	                    }, self.processDelay);
	                });
	            }
	        },
	        _setValidationError: function (css) {
	            var self = this;
	            css = (css ? css + ' ' : '') + 'has-error';
	            self.$container.removeClass(css).addClass('has-error');
	            $h.addCss(self.$captionContainer, 'is-invalid');
	        },
	        _resetErrors: function (fade) {
	            var self = this, $error = self.$errorContainer;
	            if (self.isPersistentError) {
	                return;
	            }
	            self.isError = false;
	            self.$container.removeClass('has-error');
	            self.$captionContainer.removeClass('is-invalid');
	            $error.html('');
	            if (fade) {
	                $error.fadeOut('slow');
	            } else {
	                $error.hide();
	            }
	        },
	        _showFolderError: function (folders) {
	            var self = this, $error = self.$errorContainer, msg;
	            if (!folders) {
	                return;
	            }
	            if (!self.isAjaxUpload) {
	                self._clearFileInput();
	            }
	            msg = self.msgFoldersNotAllowed.replace('{n}', folders);
	            self._addError(msg);
	            self._setValidationError();
	            $error.fadeIn(self.fadeDelay);
	            self._raise('filefoldererror', [folders, msg]);
	        },
	        _showFileError: function (msg, params, event) {
	            var self = this, $error = self.$errorContainer, ev = event || 'fileuploaderror',
	                fId = params && params.fileId || '', e = params && params.id ?
	                '<li data-thumb-id="' + params.id + '" data-file-id="' + fId + '">' + msg + '</li>' : '<li>' + msg + '</li>';

	            if ($error.find('ul').length === 0) {
	                self._addError('<ul>' + e + '</ul>');
	            } else {
	                $error.find('ul').append(e);
	            }
	            $error.fadeIn(self.fadeDelay);
	            self._raise(ev, [params, msg]);
	            self._setValidationError('file-input-new');
	            return true;
	        },
	        _showError: function (msg, params, event) {
	            var self = this, $error = self.$errorContainer, ev = event || 'fileerror';
	            params = params || {};
	            params.reader = self.reader;
	            self._addError(msg);
	            $error.fadeIn(self.fadeDelay);
	            self._raise(ev, [params, msg]);
	            if (!self.isAjaxUpload) {
	                self._clearFileInput();
	            }
	            self._setValidationError('file-input-new');
	            self.$btnUpload.attr('disabled', true);
	            return true;
	        },
	        _noFilesError: function (params) {
	            var self = this, label = self.minFileCount > 1 ? self.filePlural : self.fileSingle,
	                msg = self.msgFilesTooLess.replace('{n}', self.minFileCount).replace('{files}', label),
	                $error = self.$errorContainer;
	            msg = '<li>' + msg + '</li>';
	            if ($error.find('ul').length === 0) {
	                self._addError('<ul>' + msg + '</ul>');
	            } else {
	                $error.find('ul').append(msg);
	            }
	            self.isError = true;
	            self._updateFileDetails(0);
	            $error.fadeIn(self.fadeDelay);
	            self._raise('fileerror', [params, msg]);
	            self._clearFileInput();
	            self._setValidationError();
	        },
	        _parseError: function (operation, jqXHR, errorThrown, fileName) {
	            /** @namespace jqXHR.responseJSON */
	            var self = this, errMsg = $.trim(errorThrown + ''), textPre, errText, text;
	            errText = jqXHR.responseJSON && jqXHR.responseJSON.error ? jqXHR.responseJSON.error.toString() : '';
	            text = errText ? errText : jqXHR.responseText;
	            if (self.cancelling && self.msgUploadAborted) {
	                errMsg = self.msgUploadAborted;
	            }
	            if (self.showAjaxErrorDetails && text) {
	                if (errText) {
	                    errMsg = $.trim(errText + '');
	                } else {
	                    text = $.trim(text.replace(/\n\s*\n/g, '\n'));
	                    textPre = text.length ? '<pre>' + text + '</pre>' : '';
	                    errMsg += errMsg ? textPre : text;
	                }
	            }
	            if (!errMsg) {
	                errMsg = self.msgAjaxError.replace('{operation}', operation);
	            }
	            self.cancelling = false;
	            return fileName ? '<b>' + fileName + ': </b>' + errMsg : errMsg;
	        },
	        _parseFileType: function (type, name) {
	            var self = this, isValid, vType, cat, i, types = self.allowedPreviewTypes || [];
	            if (type === 'application/text-plain') {
	                return 'text';
	            }
	            for (i = 0; i < types.length; i++) {
	                cat = types[i];
	                isValid = self.fileTypeSettings[cat];
	                vType = isValid(type, name) ? cat : '';
	                if (!$h.isEmpty(vType)) {
	                    return vType;
	                }
	            }
	            return 'other';
	        },
	        _getPreviewIcon: function (fname) {
	            var self = this, ext, out = null;
	            if (fname && fname.indexOf('.') > -1) {
	                ext = fname.split('.').pop();
	                if (self.previewFileIconSettings) {
	                    out = self.previewFileIconSettings[ext] || self.previewFileIconSettings[ext.toLowerCase()] || null;
	                }
	                if (self.previewFileExtSettings) {
	                    $.each(self.previewFileExtSettings, function (key, func) {
	                        if (self.previewFileIconSettings[key] && func(ext)) {
	                            out = self.previewFileIconSettings[key];
	                            //noinspection UnnecessaryReturnStatementJS
	                            return;
	                        }
	                    });
	                }
	            }
	            return out || self.previewFileIcon;
	        },
	        _parseFilePreviewIcon: function (content, fname) {
	            var self = this, icn = self._getPreviewIcon(fname), out = content;
	            if (out.indexOf('{previewFileIcon}') > -1) {
	                out = out.setTokens({'previewFileIconClass': self.previewFileIconClass, 'previewFileIcon': icn});
	            }
	            return out;
	        },
	        _raise: function (event, params) {
	            var self = this, e = $.Event(event);
	            if (params !== undefined) {
	                self.$element.trigger(e, params);
	            } else {
	                self.$element.trigger(e);
	            }
	            if (e.isDefaultPrevented() || e.result === false) {
	                return false;
	            }
	            switch (event) {
	                // ignore these events
	                case 'filebatchuploadcomplete':
	                case 'filebatchuploadsuccess':
	                case 'fileuploaded':
	                case 'fileclear':
	                case 'filecleared':
	                case 'filereset':
	                case 'fileerror':
	                case 'filefoldererror':
	                case 'fileuploaderror':
	                case 'filebatchuploaderror':
	                case 'filedeleteerror':
	                case 'filecustomerror':
	                case 'filesuccessremove':
	                    break;
	                // receive data response via `filecustomerror` event`
	                default:
	                    if (!self.ajaxAborted) {
	                        self.ajaxAborted = e.result;
	                    }
	                    break;
	            }
	            return true;
	        },
	        _listenFullScreen: function (isFullScreen) {
	            var self = this, $modal = self.$modal, $btnFull, $btnBord;
	            if (!$modal || !$modal.length) {
	                return;
	            }
	            $btnFull = $modal && $modal.find('.btn-fullscreen');
	            $btnBord = $modal && $modal.find('.btn-borderless');
	            if (!$btnFull.length || !$btnBord.length) {
	                return;
	            }
	            $btnFull.removeClass('active').attr('aria-pressed', 'false');
	            $btnBord.removeClass('active').attr('aria-pressed', 'false');
	            if (isFullScreen) {
	                $btnFull.addClass('active').attr('aria-pressed', 'true');
	            } else {
	                $btnBord.addClass('active').attr('aria-pressed', 'true');
	            }
	            if ($modal.hasClass('file-zoom-fullscreen')) {
	                self._maximizeZoomDialog();
	            } else {
	                if (isFullScreen) {
	                    self._maximizeZoomDialog();
	                } else {
	                    $btnBord.removeClass('active').attr('aria-pressed', 'false');
	                }
	            }
	        },
	        _listen: function () {
	            var self = this, $el = self.$element, $form = self.$form, $cont = self.$container, fullScreenEvents;
	            self._handler($el, 'click', function (e) {
	                if ($el.hasClass('file-no-browse')) {
	                    if ($el.data('zoneClicked')) {
	                        $el.data('zoneClicked', false);
	                    } else {
	                        e.preventDefault();
	                    }
	                }
	            });
	            self._handler($el, 'change', $.proxy(self._change, self));
	            if (self.showBrowse) {
	                self._handler(self.$btnFile, 'click', $.proxy(self._browse, self));
	            }
	            self._handler($cont.find('.fileinput-remove:not([disabled])'), 'click', $.proxy(self.clear, self));
	            self._handler($cont.find('.fileinput-cancel'), 'click', $.proxy(self.cancel, self));
	            self._handler($cont.find('.fileinput-pause'), 'click', $.proxy(self.pause, self));
	            self._initDragDrop();
	            self._handler($form, 'reset', $.proxy(self.clear, self));
	            if (!self.isAjaxUpload) {
	                self._handler($form, 'submit', $.proxy(self._submitForm, self));
	            }
	            self._handler(self.$container.find('.fileinput-upload'), 'click', $.proxy(self._uploadClick, self));
	            self._handler($(window), 'resize', function () {
	                self._listenFullScreen(screen.width === window.innerWidth && screen.height === window.innerHeight);
	            });
	            fullScreenEvents = 'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange';
	            self._handler($(document), fullScreenEvents, function () {
	                self._listenFullScreen($h.checkFullScreen());
	            });
	            self._autoFitContent();
	            self._initClickable();
	            self._refreshPreview();
	        },
	        _autoFitContent: function () {
	            var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
	                self = this, config = width < 400 ? (self.previewSettingsSmall || self.defaults.previewSettingsSmall) :
	                (self.previewSettings || self.defaults.previewSettings), sel;
	            $.each(config, function (cat, settings) {
	                sel = '.file-preview-frame .file-preview-' + cat;
	                self.$preview.find(sel + '.kv-preview-data,' + sel + ' .kv-preview-data').css(settings);
	            });
	        },
	        _scanDroppedItems: function (item, files, path) {
	            path = path || '';
	            var self = this, i, dirReader, readDir, errorHandler = function (e) {
	                self._log($h.logMessages.badDroppedFiles);
	                self._log(e);
	            };
	            if (item.isFile) {
	                item.file(function (file) {
	                    if (path) {
	                        file.newPath = path + file.name;
	                    }
	                    files.push(file);
	                }, errorHandler);
	            } else {
	                if (item.isDirectory) {
	                    dirReader = item.createReader();
	                    readDir = function () {
	                        dirReader.readEntries(function (entries) {
	                            if (entries && entries.length > 0) {
	                                for (i = 0; i < entries.length; i++) {
	                                    self._scanDroppedItems(entries[i], files, path + item.name + '/');
	                                }
	                                // recursively call readDir() again, since browser can only handle first 100 entries.
	                                readDir();
	                            }
	                            return null;
	                        }, errorHandler);
	                    };
	                    readDir();
	                }
	            }

	        },
	        _initDragDrop: function () {
	            var self = this, $zone = self.$dropZone;
	            if (self.dropZoneEnabled && self.showPreview) {
	                self._handler($zone, 'dragenter dragover', $.proxy(self._zoneDragEnter, self));
	                self._handler($zone, 'dragleave', $.proxy(self._zoneDragLeave, self));
	                self._handler($zone, 'drop', $.proxy(self._zoneDrop, self));
	                self._handler($(document), 'dragenter dragover drop', self._zoneDragDropInit);
	            }
	        },
	        _zoneDragDropInit: function (e) {
	            e.stopPropagation();
	            e.preventDefault();
	        },
	        _zoneDragEnter: function (e) {
	            var self = this, dataTransfer = e.originalEvent.dataTransfer,
	                hasFiles = $.inArray('Files', dataTransfer.types) > -1;
	            self._zoneDragDropInit(e);
	            if (self.isDisabled || !hasFiles) {
	                e.originalEvent.dataTransfer.effectAllowed = 'none';
	                e.originalEvent.dataTransfer.dropEffect = 'none';
	                return;
	            }
	            if (self._raise('fileDragEnter', {'sourceEvent': e, 'files': dataTransfer.types.Files})) {
	                $h.addCss(self.$dropZone, 'file-highlighted');
	            }
	        },
	        _zoneDragLeave: function (e) {
	            var self = this;
	            self._zoneDragDropInit(e);
	            if (self.isDisabled) {
	                return;
	            }
	            if (self._raise('fileDragLeave', {'sourceEvent': e})) {
	                self.$dropZone.removeClass('file-highlighted');
	            }

	        },
	        _zoneDrop: function (e) {
	            /** @namespace e.originalEvent.dataTransfer */
	            var self = this, i, $el = self.$element, dataTransfer = e.originalEvent.dataTransfer,
	                files = dataTransfer.files, items = dataTransfer.items, folders = $h.getDragDropFolders(items),
	                processFiles = function () {
	                    if (!self.isAjaxUpload) {
	                        self.changeTriggered = true;
	                        $el.get(0).files = files;
	                        setTimeout(function () {
	                            self.changeTriggered = false;
	                            $el.trigger('change' + self.namespace);
	                        }, self.processDelay);
	                    } else {
	                        self._change(e, files);
	                    }
	                    self.$dropZone.removeClass('file-highlighted');
	                };
	            e.preventDefault();
	            if (self.isDisabled || $h.isEmpty(files)) {
	                return;
	            }
	            if (!self._raise('fileDragDrop', {'sourceEvent': e, 'files': files})) {
	                return;
	            }
	            if (folders > 0) {
	                if (!self.isAjaxUpload) {
	                    self._showFolderError(folders);
	                    return;
	                }
	                files = [];
	                for (i = 0; i < items.length; i++) {
	                    var item = items[i].webkitGetAsEntry();
	                    if (item) {
	                        self._scanDroppedItems(item, files);
	                    }
	                }
	                setTimeout(function () {
	                    processFiles();
	                }, 500);
	            } else {
	                processFiles();
	            }
	        },
	        _uploadClick: function (e) {
	            var self = this, $btn = self.$container.find('.fileinput-upload'), $form,
	                isEnabled = !$btn.hasClass('disabled') && $h.isEmpty($btn.attr('disabled'));
	            if (e && e.isDefaultPrevented()) {
	                return;
	            }
	            if (!self.isAjaxUpload) {
	                if (isEnabled && $btn.attr('type') !== 'submit') {
	                    $form = $btn.closest('form');
	                    // downgrade to normal form submit if possible
	                    if ($form.length) {
	                        $form.trigger('submit');
	                    }
	                    e.preventDefault();
	                }
	                return;
	            }
	            e.preventDefault();
	            if (isEnabled) {
	                self.upload();
	            }
	        },
	        _submitForm: function () {
	            var self = this;
	            return self._isFileSelectionValid() && !self._abort({});
	        },
	        _clearPreview: function () {
	            var self = this,
	                $thumbs = self.showUploadedThumbs ? self.getFrames(':not(.file-preview-success)') : self.getFrames();
	            $thumbs.each(function () {
	                var $thumb = $(this);
	                $thumb.remove();
	            });
	            if (!self.getFrames().length || !self.showPreview) {
	                self._resetUpload();
	            }
	            self._validateDefaultPreview();
	        },
	        _initSortable: function () {
	            var self = this, $el = self.$preview, settings, selector = '.' + $h.SORT_CSS, $cont, $body = $('body'),
	                $html = $('html'), rev = self.reversePreviewOrder, Sortable = window.Sortable, beginGrab, endGrab;
	            if (!Sortable || $el.find(selector).length === 0) {
	                return;
	            }
	            $cont = $body.length ? $body : ($html.length ? $html : self.$container);
	            beginGrab = function () {
	                $cont.addClass('file-grabbing');
	            };
	            endGrab = function () {
	                $cont.removeClass('file-grabbing');
	            };
	            settings = {
	                handle: '.drag-handle-init',
	                dataIdAttr: 'data-fileid',
	                animation: 600,
	                draggable: selector,
	                scroll: false,
	                forceFallback: true,
	                onChoose: beginGrab,
	                onStart: beginGrab,
	                onUnchoose: endGrab,
	                onEnd: endGrab,
	                onSort: function (e) {
	                    var oldIndex = e.oldIndex, newIndex = e.newIndex, i = 0, len = self.initialPreviewConfig.length,
	                        exceedsLast = len > 0 && newIndex >= len, $item = $(e.item), $first;
	                    if (exceedsLast) {
	                        newIndex = len - 1;
	                    }
	                    self.initialPreview = $h.moveArray(self.initialPreview, oldIndex, newIndex, rev);
	                    self.initialPreviewConfig = $h.moveArray(self.initialPreviewConfig, oldIndex, newIndex, rev);
	                    self.previewCache.init();
	                    self.getFrames('.file-preview-initial').each(function () {
	                        $(this).attr('data-fileindex', $h.INIT_FLAG + i);
	                        i++;
	                    });
	                    if (exceedsLast) {
	                        $first = self.getFrames(':not(.file-preview-initial):first');
	                        if ($first.length) {
	                            $item.slideUp(function () {
	                                $item.insertBefore($first).slideDown();
	                            });
	                        }
	                    }
	                    self._raise('filesorted', {
	                        previewId: $item.attr('id'),
	                        'oldIndex': oldIndex,
	                        'newIndex': newIndex,
	                        stack: self.initialPreviewConfig
	                    });
	                },
	            };
	            $.extend(true, settings, self.fileActionSettings.dragSettings);
	            if (self.sortable) {
	                self.sortable.destroy();
	            }
	            self.sortable = Sortable.create($el[0], settings);
	        },
	        _setPreviewContent: function (content) {
	            var self = this;
	            $h.setHtml(self.$preview, content);
	            self._autoFitContent();
	        },
	        _initPreviewImageOrientations: function () {
	            var self = this, i = 0, canOrientImage = self.canOrientImage;
	            if (!self.autoOrientImageInitial && !canOrientImage) {
	                return;
	            }
	            self.getFrames('.file-preview-initial').each(function () {
	                var $thumb = $(this), $img, $zoomImg, id, config = self.initialPreviewConfig[i];
	                /** @namespace config.exif */
	                if (config && config.exif && config.exif.Orientation) {
	                    id = $thumb.attr('id');
	                    $img = $thumb.find('>.kv-file-content img');
	                    $zoomImg = self._getZoom(id, ' >.kv-file-content img');
	                    if (canOrientImage) {
	                        $img.css('image-orientation', (self.autoOrientImageInitial ? 'from-image' : 'none'));
	                    } else {
	                        self.setImageOrientation($img, $zoomImg, config.exif.Orientation, $thumb);
	                    }
	                }
	                i++;
	            });
	        },
	        _initPreview: function (isInit) {
	            var self = this, cap = self.initialCaption || '', out;
	            if (!self.previewCache.count(true)) {
	                self._clearPreview();
	                if (isInit) {
	                    self._setCaption(cap);
	                } else {
	                    self._initCaption();
	                }
	                return;
	            }
	            out = self.previewCache.out();
	            cap = isInit && self.initialCaption ? self.initialCaption : out.caption;
	            self._setPreviewContent(out.content);
	            self._setInitThumbAttr();
	            self._setCaption(cap);
	            self._initSortable();
	            if (!$h.isEmpty(out.content)) {
	                self.$container.removeClass('file-input-new');
	            }
	            self._initPreviewImageOrientations();
	        },
	        _getZoomButton: function (type) {
	            var self = this, label = self.previewZoomButtonIcons[type], css = self.previewZoomButtonClasses[type],
	                title = ' title="' + (self.previewZoomButtonTitles[type] || '') + '" ',
	                params = title + (type === 'close' ? ' data-dismiss="modal" aria-hidden="true"' : '');
	            if (type === 'fullscreen' || type === 'borderless' || type === 'toggleheader') {
	                params += ' data-toggle="button" aria-pressed="false" autocomplete="off"';
	            }
	            return '<button type="button" class="' + css + ' btn-' + type + '"' + params + '>' + label + '</button>';
	        },
	        _getModalContent: function () {
	            var self = this;
	            return self._getLayoutTemplate('modal').setTokens({
	                'rtl': self.rtl ? ' kv-rtl' : '',
	                'zoomFrameClass': self.frameClass,
	                'heading': self.msgZoomModalHeading,
	                'prev': self._getZoomButton('prev'),
	                'next': self._getZoomButton('next'),
	                'toggleheader': self._getZoomButton('toggleheader'),
	                'fullscreen': self._getZoomButton('fullscreen'),
	                'borderless': self._getZoomButton('borderless'),
	                'close': self._getZoomButton('close')
	            });
	        },
	        _listenModalEvent: function (event) {
	            var self = this, $modal = self.$modal, getParams = function (e) {
	                return {
	                    sourceEvent: e,
	                    previewId: $modal.data('previewId'),
	                    modal: $modal
	                };
	            };
	            $modal.on(event + '.bs.modal', function (e) {
	                var $btnFull = $modal.find('.btn-fullscreen'), $btnBord = $modal.find('.btn-borderless');
	                if ($modal.data('fileinputPluginId') === self.$element.attr('id')) {
	                    self._raise('filezoom' + event, getParams(e));
	                }
	                if (event === 'shown') {
	                    $btnBord.removeClass('active').attr('aria-pressed', 'false');
	                    $btnFull.removeClass('active').attr('aria-pressed', 'false');
	                    if ($modal.hasClass('file-zoom-fullscreen')) {
	                        self._maximizeZoomDialog();
	                        if ($h.checkFullScreen()) {
	                            $btnFull.addClass('active').attr('aria-pressed', 'true');
	                        } else {
	                            $btnBord.addClass('active').attr('aria-pressed', 'true');
	                        }
	                    }
	                }
	            });
	        },
	        _initZoom: function () {
	            var self = this, $dialog, modalMain = self._getLayoutTemplate('modalMain'), modalId = '#' + $h.MODAL_ID;
	            if (!self.showPreview) {
	                return;
	            }
	            self.$modal = $(modalId);
	            if (!self.$modal || !self.$modal.length) {
	                $dialog = $h.createElement($h.cspBuffer.stash(modalMain)).insertAfter(self.$container);
	                self.$modal = $(modalId).insertBefore($dialog);
	                $h.cspBuffer.apply(self.$modal);
	                $dialog.remove();
	            }
	            $h.initModal(self.$modal);
	            self.$modal.html($h.cspBuffer.stash(self._getModalContent()));
	            $h.cspBuffer.apply(self.$modal);
	            $.each($h.MODAL_EVENTS, function (key, event) {
	                self._listenModalEvent(event);
	            });
	        },
	        _initZoomButtons: function () {
	            var self = this, previewId = self.$modal.data('previewId') || '', $first, $last,
	                thumbs = self.getFrames().toArray(), len = thumbs.length, $prev = self.$modal.find('.btn-prev'),
	                $next = self.$modal.find('.btn-next');
	            if (thumbs.length < 2) {
	                $prev.hide();
	                $next.hide();
	                return;
	            } else {
	                $prev.show();
	                $next.show();
	            }
	            if (!len) {
	                return;
	            }
	            $first = $(thumbs[0]);
	            $last = $(thumbs[len - 1]);
	            $prev.removeAttr('disabled');
	            $next.removeAttr('disabled');
	            if ($first.length && $first.attr('id') === previewId) {
	                $prev.attr('disabled', true);
	            }
	            if ($last.length && $last.attr('id') === previewId) {
	                $next.attr('disabled', true);
	            }
	        },
	        _maximizeZoomDialog: function () {
	            var self = this, $modal = self.$modal, $head = $modal.find('.modal-header:visible'),
	                $foot = $modal.find('.modal-footer:visible'), $body = $modal.find('.modal-body'),
	                h = $(window).height(), diff = 0;
	            $modal.addClass('file-zoom-fullscreen');
	            if ($head && $head.length) {
	                h -= $head.outerHeight(true);
	            }
	            if ($foot && $foot.length) {
	                h -= $foot.outerHeight(true);
	            }
	            if ($body && $body.length) {
	                diff = $body.outerHeight(true) - $body.height();
	                h -= diff;
	            }
	            $modal.find('.kv-zoom-body').height(h);
	        },
	        _resizeZoomDialog: function (fullScreen) {
	            var self = this, $modal = self.$modal, $btnFull = $modal.find('.btn-fullscreen'),
	                $btnBord = $modal.find('.btn-borderless');
	            if ($modal.hasClass('file-zoom-fullscreen')) {
	                $h.toggleFullScreen(false);
	                if (!fullScreen) {
	                    if (!$btnFull.hasClass('active')) {
	                        $modal.removeClass('file-zoom-fullscreen');
	                        self.$modal.find('.kv-zoom-body').css('height', self.zoomModalHeight);
	                    } else {
	                        $btnFull.removeClass('active').attr('aria-pressed', 'false');
	                    }
	                } else {
	                    if (!$btnFull.hasClass('active')) {
	                        $modal.removeClass('file-zoom-fullscreen');
	                        self._resizeZoomDialog(true);
	                        if ($btnBord.hasClass('active')) {
	                            $btnBord.removeClass('active').attr('aria-pressed', 'false');
	                        }
	                    }
	                }
	            } else {
	                if (!fullScreen) {
	                    self._maximizeZoomDialog();
	                    return;
	                }
	                $h.toggleFullScreen(true);
	            }
	            $modal.focus();
	        },
	        _setZoomContent: function ($frame, animate) {
	            var self = this, $content, tmplt, body, title, $body, $dataEl, config, previewId = $frame.attr('id'),
	                $zoomPreview = self._getZoom(previewId), $modal = self.$modal, $tmp,
	                $btnFull = $modal.find('.btn-fullscreen'), $btnBord = $modal.find('.btn-borderless'), cap, size,
	                $btnTogh = $modal.find('.btn-toggleheader');
	            tmplt = $zoomPreview.attr('data-template') || 'generic';
	            $content = $zoomPreview.find('.kv-file-content');
	            body = $content.length ? $content.html() : '';
	            cap = $frame.data('caption') || '';
	            size = $frame.data('size') || '';
	            title = cap + ' ' + size;
	            $modal.find('.kv-zoom-title').attr('title', $('<div/>').html(title).text()).html(title);
	            $body = $modal.find('.kv-zoom-body');
	            $modal.removeClass('kv-single-content');
	            if (animate) {
	                $tmp = $body.addClass('file-thumb-loading').clone().insertAfter($body);
	                $h.setHtml($body, body).hide();
	                $tmp.fadeOut('fast', function () {
	                    $body.fadeIn('fast', function () {
	                        $body.removeClass('file-thumb-loading');
	                    });
	                    $tmp.remove();
	                });
	            } else {
	                $h.setHtml($body, body);
	            }
	            config = self.previewZoomSettings[tmplt];
	            if (config) {
	                $dataEl = $body.find('.kv-preview-data');
	                $h.addCss($dataEl, 'file-zoom-detail');
	                $.each(config, function (key, value) {
	                    $dataEl.css(key, value);
	                    if (($dataEl.attr('width') && key === 'width') || ($dataEl.attr('height') && key === 'height')) {
	                        $dataEl.removeAttr(key);
	                    }
	                });
	            }
	            $modal.data('previewId', previewId);
	            self._handler($modal.find('.btn-prev'), 'click', function () {
	                self._zoomSlideShow('prev', previewId);
	            });
	            self._handler($modal.find('.btn-next'), 'click', function () {
	                self._zoomSlideShow('next', previewId);
	            });
	            self._handler($btnFull, 'click', function () {
	                self._resizeZoomDialog(true);
	            });
	            self._handler($btnBord, 'click', function () {
	                self._resizeZoomDialog(false);
	            });
	            self._handler($btnTogh, 'click', function () {
	                var $header = $modal.find('.modal-header'), $floatBar = $modal.find('.modal-body .floating-buttons'),
	                    ht, $actions = $header.find('.kv-zoom-actions'), resize = function (height) {
	                        var $body = self.$modal.find('.kv-zoom-body'), h = self.zoomModalHeight;
	                        if ($modal.hasClass('file-zoom-fullscreen')) {
	                            h = $body.outerHeight(true);
	                            if (!height) {
	                                h = h - $header.outerHeight(true);
	                            }
	                        }
	                        $body.css('height', height ? h + height : h);
	                    };
	                if ($header.is(':visible')) {
	                    ht = $header.outerHeight(true);
	                    $header.slideUp('slow', function () {
	                        $actions.find('.btn').appendTo($floatBar);
	                        resize(ht);
	                    });
	                } else {
	                    $floatBar.find('.btn').appendTo($actions);
	                    $header.slideDown('slow', function () {
	                        resize();
	                    });
	                }
	                $modal.focus();
	            });
	            self._handler($modal, 'keydown', function (e) {
	                var key = e.which || e.keyCode, $prev = $(this).find('.btn-prev'), $next = $(this).find('.btn-next'),
	                    vId = $(this).data('previewId'), vPrevKey = self.rtl ? 39 : 37, vNextKey = self.rtl ? 37 : 39;
	                if (key === vPrevKey && $prev.length && !$prev.attr('disabled')) {
	                    self._zoomSlideShow('prev', vId);
	                }
	                if (key === vNextKey && $next.length && !$next.attr('disabled')) {
	                    self._zoomSlideShow('next', vId);
	                }
	            });
	        },
	        _showModal: function ($frame) {
	            var self = this, $modal = self.$modal;
	            if (!$frame || !$frame.length) {
	                return;
	            }
	            $h.initModal($modal);
	            $h.setHtml($modal, self._getModalContent());
	            self._setZoomContent($frame);
	            $modal.data('fileinputPluginId', self.$element.attr('id'));
	            $modal.modal('show');
	            self._initZoomButtons();
	        },
	        _zoomPreview: function ($btn) {
	            var self = this, $frame;
	            if (!$btn.length) {
	                throw 'Cannot zoom to detailed preview!';
	            }
	            $frame = $btn.closest($h.FRAMES);
	            self._showModal($frame);
	        },
	        _zoomSlideShow: function (dir, previewId) {
	            var self = this, $btn = self.$modal.find('.kv-zoom-actions .btn-' + dir), $targFrame, i, $thumb,
	                thumbsData = self.getFrames().toArray(), thumbs = [], len = thumbsData.length, out;
	            if ($btn.attr('disabled')) {
	                return;
	            }
	            for (i = 0; i < len; i++) {
	                $thumb = $(thumbsData[i]);
	                if ($thumb && $thumb.length && $thumb.find('.kv-file-zoom:visible').length) {
	                    thumbs.push(thumbsData[i]);
	                }
	            }
	            len = thumbs.length;
	            for (i = 0; i < len; i++) {
	                if ($(thumbs[i]).attr('id') === previewId) {
	                    out = dir === 'prev' ? i - 1 : i + 1;
	                    break;
	                }
	            }
	            if (out < 0 || out >= len || !thumbs[out]) {
	                return;
	            }
	            $targFrame = $(thumbs[out]);
	            if ($targFrame.length) {
	                self._setZoomContent($targFrame, true);
	            }
	            self._initZoomButtons();
	            self._raise('filezoom' + dir, {'previewId': previewId, modal: self.$modal});
	        },
	        _initZoomButton: function () {
	            var self = this;
	            self.$preview.find('.kv-file-zoom').each(function () {
	                var $el = $(this);
	                self._handler($el, 'click', function () {
	                    self._zoomPreview($el);
	                });
	            });
	        },
	        _inputFileCount: function () {
	            return this.$element[0].files.length;
	        },
	        _refreshPreview: function () {
	            var self = this, files;
	            if ((!self._inputFileCount() && !self.isAjaxUpload) || !self.showPreview || !self.isPreviewable) {
	                return;
	            }
	            if (self.isAjaxUpload) {
	                if (self.fileManager.count() > 0) {
	                    files = $.extend(true, {}, self.fileManager.stack);
	                    self.fileManager.clear();
	                    self._clearFileInput();
	                } else {
	                    files = self.$element[0].files;
	                }
	            } else {
	                files = self.$element[0].files;
	            }
	            if (files && files.length) {
	                self.readFiles(files);
	                self._setFileDropZoneTitle();
	            }
	        },
	        _clearObjects: function ($el) {
	            $el.find('video audio').each(function () {
	                this.pause();
	                $(this).remove();
	            });
	            $el.find('img object div').each(function () {
	                $(this).remove();
	            });
	        },
	        _clearFileInput: function () {
	            var self = this, $el = self.$element, $srcFrm, $tmpFrm, $tmpEl;
	            if (!self._inputFileCount()) {
	                return;
	            }
	            $srcFrm = $el.closest('form');
	            $tmpFrm = $(document.createElement('form'));
	            $tmpEl = $(document.createElement('div'));
	            $el.before($tmpEl);
	            if ($srcFrm.length) {
	                $srcFrm.after($tmpFrm);
	            } else {
	                $tmpEl.after($tmpFrm);
	            }
	            $tmpFrm.append($el).trigger('reset');
	            $tmpEl.before($el).remove();
	            $tmpFrm.remove();
	        },
	        _resetUpload: function () {
	            var self = this;
	            self.uploadStartTime = $h.now();
	            self.uploadCache = [];
	            self.$btnUpload.removeAttr('disabled');
	            self._setProgress(0);
	            self._hideProgress();
	            self._resetErrors(false);
	            self._initAjax();
	            self.fileManager.clearImages();
	            self._resetCanvas();
	            if (self.overwriteInitial) {
	                self.initialPreview = [];
	                self.initialPreviewConfig = [];
	                self.initialPreviewThumbTags = [];
	                self.previewCache.data = {
	                    content: [],
	                    config: [],
	                    tags: []
	                };
	            }
	        },
	        _resetCanvas: function () {
	            var self = this;
	            if (self.canvas && self.imageCanvasContext) {
	                self.imageCanvasContext.clearRect(0, 0, self.canvas.width, self.canvas.height);
	            }
	        },
	        _hasInitialPreview: function () {
	            var self = this;
	            return !self.overwriteInitial && self.previewCache.count(true);
	        },
	        _resetPreview: function () {
	            var self = this, out, cap, $div, hasSuc = self.showUploadedThumbs, hasErr = !self.removeFromPreviewOnError,
	                includeProcessed = (hasSuc || hasErr) && self.isDuplicateError;
	            if (self.previewCache.count(true)) {
	                out = self.previewCache.out();
	                if (includeProcessed) {
	                    $div = $h.createElement('').insertAfter(self.$container);
	                    self.getFrames().each(function () {
	                        var $thumb = $(this);
	                        if ((hasSuc && $thumb.hasClass('file-preview-success')) ||
	                            (hasErr && $thumb.hasClass('file-preview-error'))) {
	                            $div.append($thumb);
	                        }
	                    });
	                }
	                self._setPreviewContent(out.content);
	                self._setInitThumbAttr();
	                cap = self.initialCaption ? self.initialCaption : out.caption;
	                self._setCaption(cap);
	                if (includeProcessed) {
	                    $div.contents().appendTo(self.$preview);
	                    $div.remove();
	                }
	            } else {
	                self._clearPreview();
	                self._initCaption();
	            }
	            if (self.showPreview) {
	                self._initZoom();
	                self._initSortable();
	            }
	            self.isDuplicateError = false;
	        },
	        _clearDefaultPreview: function () {
	            var self = this;
	            self.$preview.find('.file-default-preview').remove();
	        },
	        _validateDefaultPreview: function () {
	            var self = this;
	            if (!self.showPreview || $h.isEmpty(self.defaultPreviewContent)) {
	                return;
	            }
	            self._setPreviewContent('<div class="file-default-preview">' + self.defaultPreviewContent + '</div>');
	            self.$container.removeClass('file-input-new');
	            self._initClickable();
	        },
	        _resetPreviewThumbs: function (isAjax) {
	            var self = this, out;
	            if (isAjax) {
	                self._clearPreview();
	                self.clearFileStack();
	                return;
	            }
	            if (self._hasInitialPreview()) {
	                out = self.previewCache.out();
	                self._setPreviewContent(out.content);
	                self._setInitThumbAttr();
	                self._setCaption(out.caption);
	                self._initPreviewActions();
	            } else {
	                self._clearPreview();
	            }
	        },
	        _getLayoutTemplate: function (t) {
	            var self = this, template = self.layoutTemplates[t];
	            if ($h.isEmpty(self.customLayoutTags)) {
	                return template;
	            }
	            return $h.replaceTags(template, self.customLayoutTags);
	        },
	        _getPreviewTemplate: function (t) {
	            var self = this, templates = self.previewTemplates, template = templates[t] || templates.other;
	            if ($h.isEmpty(self.customPreviewTags)) {
	                return template;
	            }
	            return $h.replaceTags(template, self.customPreviewTags);
	        },
	        _getOutData: function (formdata, jqXHR, responseData, filesData) {
	            var self = this;
	            jqXHR = jqXHR || {};
	            responseData = responseData || {};
	            filesData = filesData || self.fileManager.list();
	            return {
	                formdata: formdata,
	                files: filesData,
	                filenames: self.filenames,
	                filescount: self.getFilesCount(),
	                extra: self._getExtraData(),
	                response: responseData,
	                reader: self.reader,
	                jqXHR: jqXHR
	            };
	        },
	        _getMsgSelected: function (n) {
	            var self = this, strFiles = n === 1 ? self.fileSingle : self.filePlural;
	            return n > 0 ? self.msgSelected.replace('{n}', n).replace('{files}', strFiles) : self.msgNoFilesSelected;
	        },
	        _getFrame: function (id, skipWarning) {
	            var self = this, $frame = $h.getFrameElement(self.$preview, id);
	            if (self.showPreview && !skipWarning && !$frame.length) {
	                self._log($h.logMessages.invalidThumb, {id: id});
	            }
	            return $frame;
	        },
	        _getZoom: function (id, selector) {
	            var self = this, $frame = $h.getZoomElement(self.$preview, id, selector);
	            if (self.showPreview && !$frame.length) {
	                self._log($h.logMessages.invalidThumb, {id: id});
	            }
	            return $frame;
	        },
	        _getThumbs: function (css) {
	            css = css || '';
	            return this.getFrames(':not(.file-preview-initial)' + css);
	        },
	        _getThumbId: function (fileId) {
	            var self = this;
	            return self.previewInitId + '-' + fileId;
	        },
	        _getExtraData: function (fileId, index) {
	            var self = this, data = self.uploadExtraData;
	            if (typeof self.uploadExtraData === 'function') {
	                data = self.uploadExtraData(fileId, index);
	            }
	            return data;
	        },
	        _initXhr: function (xhrobj, fileId) {
	            var self = this, fm = self.fileManager, func = function (event) {
	                var pct = 0, total = event.total, loaded = event.loaded || event.position,
	                    stats = fm.getUploadStats(fileId, loaded, total);
	                /** @namespace event.lengthComputable */
	                if (event.lengthComputable && !self.enableResumableUpload) {
	                    pct = $h.round(loaded / total * 100);
	                }
	                if (fileId) {
	                    self._setFileUploadStats(fileId, pct, stats);
	                } else {
	                    self._setProgress(pct, null, null, self._getStats(stats));
	                }
	                self._raise('fileajaxprogress', [stats]);
	            };
	            if (xhrobj.upload) {
	                if (self.progressDelay) {
	                    func = $h.debounce(func, self.progressDelay);
	                }
	                xhrobj.upload.addEventListener('progress', func, false);
	            }
	            return xhrobj;
	        },
	        _initAjaxSettings: function () {
	            var self = this;
	            self._ajaxSettings = $.extend(true, {}, self.ajaxSettings);
	            self._ajaxDeleteSettings = $.extend(true, {}, self.ajaxDeleteSettings);
	        },
	        _mergeAjaxCallback: function (funcName, srcFunc, type) {
	            var self = this, settings = self._ajaxSettings, flag = self.mergeAjaxCallbacks, targFunc;
	            if (type === 'delete') {
	                settings = self._ajaxDeleteSettings;
	                flag = self.mergeAjaxDeleteCallbacks;
	            }
	            targFunc = settings[funcName];
	            if (flag && typeof targFunc === 'function') {
	                if (flag === 'before') {
	                    settings[funcName] = function () {
	                        targFunc.apply(this, arguments);
	                        srcFunc.apply(this, arguments);
	                    };
	                } else {
	                    settings[funcName] = function () {
	                        srcFunc.apply(this, arguments);
	                        targFunc.apply(this, arguments);
	                    };
	                }
	            } else {
	                settings[funcName] = srcFunc;
	            }
	        },
	        _ajaxSubmit: function (fnBefore, fnSuccess, fnComplete, fnError, formdata, fileId, index, vUrl) {
	            var self = this, settings, defaults, data, ajaxTask;
	            if (!self._raise('filepreajax', [formdata, fileId, index])) {
	                return;
	            }
	            formdata.append('initialPreview', JSON.stringify(self.initialPreview));
	            formdata.append('initialPreviewConfig', JSON.stringify(self.initialPreviewConfig));
	            formdata.append('initialPreviewThumbTags', JSON.stringify(self.initialPreviewThumbTags));
	            self._initAjaxSettings();
	            self._mergeAjaxCallback('beforeSend', fnBefore);
	            self._mergeAjaxCallback('success', fnSuccess);
	            self._mergeAjaxCallback('complete', fnComplete);
	            self._mergeAjaxCallback('error', fnError);
	            vUrl = vUrl || self.uploadUrlThumb || self.uploadUrl;
	            if (typeof vUrl === 'function') {
	                vUrl = vUrl();
	            }
	            data = self._getExtraData(fileId, index) || {};
	            if (typeof data === 'object') {
	                $.each(data, function (key, value) {
	                    formdata.append(key, value);
	                });
	            }
	            defaults = {
	                xhr: function () {
	                    var xhrobj = $.ajaxSettings.xhr();
	                    return self._initXhr(xhrobj, fileId);
	                },
	                url: self._encodeURI(vUrl),
	                type: 'POST',
	                dataType: 'json',
	                data: formdata,
	                cache: false,
	                processData: false,
	                contentType: false
	            };
	            settings = $.extend(true, {}, defaults, self._ajaxSettings);
	            ajaxTask = self.taskManager.addTask(fileId + '-' + index, function () {
	                var self = this.self, config, xhr;
	                config = self.ajaxQueue.shift();
	                xhr = $.ajax(config);
	                self.ajaxRequests.push(xhr);
	            });
	            self.ajaxQueue.push(settings);
	            ajaxTask.runWithContext({self: self});
	        },
	        _mergeArray: function (prop, content) {
	            var self = this, arr1 = $h.cleanArray(self[prop]), arr2 = $h.cleanArray(content);
	            self[prop] = arr1.concat(arr2);
	        },
	        _initUploadSuccess: function (out, $thumb, allFiles) {
	            var self = this, append, data, index, $div, $newCache, content, config, tags, id, i;
	            if (!self.showPreview || typeof out !== 'object' || $.isEmptyObject(out)) {
	                self._resetCaption();
	                return;
	            }
	            if (out.initialPreview !== undefined && out.initialPreview.length > 0) {
	                self.hasInitData = true;
	                content = out.initialPreview || [];
	                config = out.initialPreviewConfig || [];
	                tags = out.initialPreviewThumbTags || [];
	                append = out.append === undefined || out.append;
	                if (content.length > 0 && !$h.isArray(content)) {
	                    content = content.split(self.initialPreviewDelimiter);
	                }
	                if (content.length) {
	                    self._mergeArray('initialPreview', content);
	                    self._mergeArray('initialPreviewConfig', config);
	                    self._mergeArray('initialPreviewThumbTags', tags);
	                }
	                if ($thumb !== undefined) {
	                    if (!allFiles) {
	                        index = self.previewCache.add(content[0], config[0], tags[0], append);
	                        data = self.previewCache.get(index, false);
	                        $div = $h.createElement(data).hide().appendTo($thumb);
	                        $newCache = $div.find('.kv-zoom-cache');
	                        if ($newCache && $newCache.length) {
	                            $newCache.appendTo($thumb);
	                        }
	                        $thumb.fadeOut('slow', function () {
	                            var $newThumb = $div.find('.file-preview-frame');
	                            if ($newThumb && $newThumb.length) {
	                                $newThumb.insertBefore($thumb).fadeIn('slow').css('display:inline-block');
	                            }
	                            self._initPreviewActions();
	                            self._clearFileInput();
	                            $thumb.remove();
	                            $div.remove();
	                            self._initSortable();
	                        });
	                    } else {
	                        id = $thumb.attr('id');
	                        i = self._getUploadCacheIndex(id);
	                        if (i !== null) {
	                            self.uploadCache[i] = {
	                                id: id,
	                                content: content[0],
	                                config: config[0] || [],
	                                tags: tags[0] || [],
	                                append: append
	                            };
	                        }
	                    }
	                } else {
	                    self.previewCache.set(content, config, tags, append);
	                    self._initPreview();
	                    self._initPreviewActions();
	                }
	            }
	            self._resetCaption();
	        },
	        _getUploadCacheIndex: function (id) {
	            var self = this, i, len = self.uploadCache.length, config;
	            for (i = 0; i < len; i++) {
	                config = self.uploadCache[i];
	                if (config.id === id) {
	                    return i;
	                }
	            }
	            return null;
	        },
	        _initSuccessThumbs: function () {
	            var self = this;
	            if (!self.showPreview) {
	                return;
	            }
	            self._getThumbs($h.FRAMES + '.file-preview-success').each(function () {
	                var $thumb = $(this), $remove = $thumb.find('.kv-file-remove');
	                $remove.removeAttr('disabled');
	                self._handler($remove, 'click', function () {
	                    var id = $thumb.attr('id'),
	                        out = self._raise('filesuccessremove', [id, $thumb.attr('data-fileindex')]);
	                    $h.cleanMemory($thumb);
	                    if (out === false) {
	                        return;
	                    }
	                    $thumb.fadeOut('slow', function () {
	                        $thumb.remove();
	                        if (!self.getFrames().length) {
	                            self.reset();
	                        }
	                    });
	                });
	            });
	        },
	        _updateInitialPreview: function () {
	            var self = this, u = self.uploadCache;
	            if (self.showPreview) {
	                $.each(u, function (key, setting) {
	                    self.previewCache.add(setting.content, setting.config, setting.tags, setting.append);
	                });
	                if (self.hasInitData) {
	                    self._initPreview();
	                    self._initPreviewActions();
	                }
	            }
	        },
	        _uploadSingle: function (i, id, isBatch) {
	            var self = this, fm = self.fileManager, count = fm.count(), formdata = new FormData(), outData,
	                previewId = self._getThumbId(id), $thumb, chkComplete, $btnUpload, $btnDelete,
	                hasPostData = count > 0 || !$.isEmptyObject(self.uploadExtraData), uploadFailed, $prog, fnBefore,
	                errMsg, fnSuccess, fnComplete, fnError, updateUploadLog, op = self.ajaxOperations.uploadThumb,
	                fileObj = fm.getFile(id), params = {id: previewId, index: i, fileId: id},
	                fileName = self.fileManager.getFileName(id, true);
	            if (self.enableResumableUpload) { // not enabled for resumable uploads
	                return;
	            }
	            if (self.showPreview) {
	                $thumb = self.fileManager.getThumb(id);
	                $prog = $thumb.find('.file-thumb-progress');
	                $btnUpload = $thumb.find('.kv-file-upload');
	                $btnDelete = $thumb.find('.kv-file-remove');
	                $prog.show();
	            }
	            if (count === 0 || !hasPostData || (self.showPreview && $btnUpload && $btnUpload.hasClass('disabled')) ||
	                self._abort(params)) {
	                return;
	            }
	            updateUploadLog = function () {
	                if (!uploadFailed) {
	                    fm.removeFile(id);
	                } else {
	                    fm.errors.push(id);
	                }
	                fm.setProcessed(id);
	                if (fm.isProcessed()) {
	                    self.fileBatchCompleted = true;
	                    chkComplete();
	                }
	            };
	            chkComplete = function () {
	                var $initThumbs;
	                if (!self.fileBatchCompleted) {
	                    return;
	                }
	                setTimeout(function () {
	                    var triggerReset = fm.count() === 0, errCount = fm.errors.length;
	                    self._updateInitialPreview();
	                    self.unlock(triggerReset);
	                    if (triggerReset) {
	                        self._clearFileInput();
	                    }
	                    $initThumbs = self.$preview.find('.file-preview-initial');
	                    if (self.uploadAsync && $initThumbs.length) {
	                        $h.addCss($initThumbs, $h.SORT_CSS);
	                        self._initSortable();
	                    }
	                    self._raise('filebatchuploadcomplete', [fm.stack, self._getExtraData()]);
	                    if (!self.retryErrorUploads || errCount === 0) {
	                        fm.clear();
	                    }
	                    self._setProgress(101);
	                    self.ajaxAborted = false;
	                }, self.processDelay);
	            };
	            fnBefore = function (jqXHR) {
	                outData = self._getOutData(formdata, jqXHR);
	                fm.initStats(id);
	                self.fileBatchCompleted = false;
	                if (!isBatch) {
	                    self.ajaxAborted = false;
	                }
	                if (self.showPreview) {
	                    if (!$thumb.hasClass('file-preview-success')) {
	                        self._setThumbStatus($thumb, 'Loading');
	                        $h.addCss($thumb, 'file-uploading');
	                    }
	                    $btnUpload.attr('disabled', true);
	                    $btnDelete.attr('disabled', true);
	                }
	                if (!isBatch) {
	                    self.lock();
	                }
	                if (fm.errors.indexOf(id) !== -1) {
	                    delete fm.errors[id];
	                }
	                self._raise('filepreupload', [outData, previewId, i]);
	                $.extend(true, params, outData);
	                if (self._abort(params)) {
	                    jqXHR.abort();
	                    if (!isBatch) {
	                        self._setThumbStatus($thumb, 'New');
	                        $thumb.removeClass('file-uploading');
	                        $btnUpload.removeAttr('disabled');
	                        $btnDelete.removeAttr('disabled');
	                        self.unlock();
	                    }
	                    self._setProgressCancelled();
	                }
	            };
	            fnSuccess = function (data, textStatus, jqXHR) {
	                var pid = self.showPreview && $thumb.attr('id') ? $thumb.attr('id') : previewId;
	                outData = self._getOutData(formdata, jqXHR, data);
	                $.extend(true, params, outData);
	                setTimeout(function () {
	                    if ($h.isEmpty(data) || $h.isEmpty(data.error)) {
	                        if (self.showPreview) {
	                            self._setThumbStatus($thumb, 'Success');
	                            $btnUpload.hide();
	                            self._initUploadSuccess(data, $thumb, isBatch);
	                            self._setProgress(101, $prog);
	                        }
	                        self._raise('fileuploaded', [outData, pid, i]);
	                        if (!isBatch) {
	                            self.fileManager.remove($thumb);
	                        } else {
	                            updateUploadLog();
	                        }
	                    } else {
	                        uploadFailed = true;
	                        errMsg = self._parseError(op, jqXHR, self.msgUploadError, self.fileManager.getFileName(id));
	                        self._showFileError(errMsg, params);
	                        self._setPreviewError($thumb, true);
	                        if (!self.retryErrorUploads) {
	                            $btnUpload.hide();
	                        }
	                        if (isBatch) {
	                            updateUploadLog();
	                        }
	                        self._setProgress(101, self._getFrame(pid).find('.file-thumb-progress'),
	                            self.msgUploadError);
	                    }
	                }, self.processDelay);
	            };
	            fnComplete = function () {
	                if (self.showPreview) {
	                    $btnUpload.removeAttr('disabled');
	                    $btnDelete.removeAttr('disabled');
	                    $thumb.removeClass('file-uploading');
	                }
	                if (!isBatch) {
	                    self.unlock(false);
	                    self._clearFileInput();
	                } else {
	                    chkComplete();
	                }
	                self._initSuccessThumbs();
	            };
	            fnError = function (jqXHR, textStatus, errorThrown) {
	                errMsg = self._parseError(op, jqXHR, errorThrown, self.fileManager.getFileName(id));
	                uploadFailed = true;
	                setTimeout(function () {
	                    var $prog;
	                    if (isBatch) {
	                        updateUploadLog();
	                    }
	                    self.fileManager.setProgress(id, 100);
	                    self._setPreviewError($thumb, true);
	                    if (!self.retryErrorUploads) {
	                        $btnUpload.hide();
	                    }
	                    $.extend(true, params, self._getOutData(formdata, jqXHR));
	                    self._setProgress(101, self.$progress, self.msgAjaxProgressError.replace('{operation}', op));
	                    $prog = self.showPreview && $thumb ? $thumb.find('.file-thumb-progress') : '';
	                    self._setProgress(101, $prog, self.msgUploadError);
	                    self._showFileError(errMsg, params);
	                }, self.processDelay);
	            };
	            formdata.append(self.uploadFileAttr, fileObj.file, fileName);
	            self._setUploadData(formdata, {fileId: id});
	            self._ajaxSubmit(fnBefore, fnSuccess, fnComplete, fnError, formdata, id, i);
	        },
	        _uploadBatch: function () {
	            var self = this, fm = self.fileManager, total = fm.total(), params = {}, fnBefore, fnSuccess, fnError,
	                fnComplete, hasPostData = total > 0 || !$.isEmptyObject(self.uploadExtraData), errMsg,
	                setAllUploaded, formdata = new FormData(), op = self.ajaxOperations.uploadBatch;
	            if (total === 0 || !hasPostData || self._abort(params)) {
	                return;
	            }
	            setAllUploaded = function () {
	                self.fileManager.clear();
	                self._clearFileInput();
	            };
	            fnBefore = function (jqXHR) {
	                self.lock();
	                fm.initStats();
	                var outData = self._getOutData(formdata, jqXHR);
	                self.ajaxAborted = false;
	                if (self.showPreview) {
	                    self._getThumbs().each(function () {
	                        var $thumb = $(this), $btnUpload = $thumb.find('.kv-file-upload'),
	                            $btnDelete = $thumb.find('.kv-file-remove');
	                        if (!$thumb.hasClass('file-preview-success')) {
	                            self._setThumbStatus($thumb, 'Loading');
	                            $h.addCss($thumb, 'file-uploading');
	                        }
	                        $btnUpload.attr('disabled', true);
	                        $btnDelete.attr('disabled', true);
	                    });
	                }
	                self._raise('filebatchpreupload', [outData]);
	                if (self._abort(outData)) {
	                    jqXHR.abort();
	                    self._getThumbs().each(function () {
	                        var $thumb = $(this), $btnUpload = $thumb.find('.kv-file-upload'),
	                            $btnDelete = $thumb.find('.kv-file-remove');
	                        if ($thumb.hasClass('file-preview-loading')) {
	                            self._setThumbStatus($thumb, 'New');
	                            $thumb.removeClass('file-uploading');
	                        }
	                        $btnUpload.removeAttr('disabled');
	                        $btnDelete.removeAttr('disabled');
	                    });
	                    self._setProgressCancelled();
	                }
	            };
	            fnSuccess = function (data, textStatus, jqXHR) {
	                /** @namespace data.errorkeys */
	                var outData = self._getOutData(formdata, jqXHR, data), key = 0,
	                    $thumbs = self._getThumbs(':not(.file-preview-success)'),
	                    keys = $h.isEmpty(data) || $h.isEmpty(data.errorkeys) ? [] : data.errorkeys;

	                if ($h.isEmpty(data) || $h.isEmpty(data.error)) {
	                    self._raise('filebatchuploadsuccess', [outData]);
	                    setAllUploaded();
	                    if (self.showPreview) {
	                        $thumbs.each(function () {
	                            var $thumb = $(this);
	                            self._setThumbStatus($thumb, 'Success');
	                            $thumb.removeClass('file-uploading');
	                            $thumb.find('.kv-file-upload').hide().removeAttr('disabled');
	                        });
	                        self._initUploadSuccess(data);
	                    } else {
	                        self.reset();
	                    }
	                    self._setProgress(101);
	                } else {
	                    if (self.showPreview) {
	                        $thumbs.each(function () {
	                            var $thumb = $(this);
	                            $thumb.removeClass('file-uploading');
	                            $thumb.find('.kv-file-upload').removeAttr('disabled');
	                            $thumb.find('.kv-file-remove').removeAttr('disabled');
	                            if (keys.length === 0 || $.inArray(key, keys) !== -1) {
	                                self._setPreviewError($thumb, true);
	                                if (!self.retryErrorUploads) {
	                                    $thumb.find('.kv-file-upload').hide();
	                                    self.fileManager.remove($thumb);
	                                }
	                            } else {
	                                $thumb.find('.kv-file-upload').hide();
	                                self._setThumbStatus($thumb, 'Success');
	                                self.fileManager.remove($thumb);
	                            }
	                            if (!$thumb.hasClass('file-preview-error') || self.retryErrorUploads) {
	                                key++;
	                            }
	                        });
	                        self._initUploadSuccess(data);
	                    }
	                    errMsg = self._parseError(op, jqXHR, self.msgUploadError);
	                    self._showFileError(errMsg, outData, 'filebatchuploaderror');
	                    self._setProgress(101, self.$progress, self.msgUploadError);
	                }
	            };
	            fnComplete = function () {
	                self.unlock();
	                self._initSuccessThumbs();
	                self._clearFileInput();
	                self._raise('filebatchuploadcomplete', [self.fileManager.stack, self._getExtraData()]);
	            };
	            fnError = function (jqXHR, textStatus, errorThrown) {
	                var outData = self._getOutData(formdata, jqXHR);
	                errMsg = self._parseError(op, jqXHR, errorThrown);
	                self._showFileError(errMsg, outData, 'filebatchuploaderror');
	                self.uploadFileCount = total - 1;
	                if (!self.showPreview) {
	                    return;
	                }
	                self._getThumbs().each(function () {
	                    var $thumb = $(this);
	                    $thumb.removeClass('file-uploading');
	                    if (self.fileManager.getFile($thumb.attr('data-fileid'))) {
	                        self._setPreviewError($thumb);
	                    }
	                });
	                self._getThumbs().removeClass('file-uploading');
	                self._getThumbs(' .kv-file-upload').removeAttr('disabled');
	                self._getThumbs(' .kv-file-delete').removeAttr('disabled');
	                self._setProgress(101, self.$progress, self.msgAjaxProgressError.replace('{operation}', op));
	            };
	            var ctr = 0;
	            $.each(self.fileManager.stack, function (key, data) {
	                if (!$h.isEmpty(data.file)) {
	                    formdata.append(self.uploadFileAttr, data.file, (data.nameFmt || ('untitled_' + ctr)));
	                }
	                ctr++;
	            });
	            self._ajaxSubmit(fnBefore, fnSuccess, fnComplete, fnError, formdata);
	        },
	        _uploadExtraOnly: function () {
	            var self = this, params = {}, fnBefore, fnSuccess, fnComplete, fnError, formdata = new FormData(), errMsg,
	                op = self.ajaxOperations.uploadExtra;
	            if (self._abort(params)) {
	                return;
	            }
	            fnBefore = function (jqXHR) {
	                self.lock();
	                var outData = self._getOutData(formdata, jqXHR);
	                self._raise('filebatchpreupload', [outData]);
	                self._setProgress(50);
	                params.data = outData;
	                params.xhr = jqXHR;
	                if (self._abort(params)) {
	                    jqXHR.abort();
	                    self._setProgressCancelled();
	                }
	            };
	            fnSuccess = function (data, textStatus, jqXHR) {
	                var outData = self._getOutData(formdata, jqXHR, data);
	                if ($h.isEmpty(data) || $h.isEmpty(data.error)) {
	                    self._raise('filebatchuploadsuccess', [outData]);
	                    self._clearFileInput();
	                    self._initUploadSuccess(data);
	                    self._setProgress(101);
	                } else {
	                    errMsg = self._parseError(op, jqXHR, self.msgUploadError);
	                    self._showFileError(errMsg, outData, 'filebatchuploaderror');
	                }
	            };
	            fnComplete = function () {
	                self.unlock();
	                self._clearFileInput();
	                self._raise('filebatchuploadcomplete', [self.fileManager.stack, self._getExtraData()]);
	            };
	            fnError = function (jqXHR, textStatus, errorThrown) {
	                var outData = self._getOutData(formdata, jqXHR);
	                errMsg = self._parseError(op, jqXHR, errorThrown);
	                params.data = outData;
	                self._showFileError(errMsg, outData, 'filebatchuploaderror');
	                self._setProgress(101, self.$progress, self.msgAjaxProgressError.replace('{operation}', op));
	            };
	            self._ajaxSubmit(fnBefore, fnSuccess, fnComplete, fnError, formdata);
	        },
	        _deleteFileIndex: function ($frame) {
	            var self = this, ind = $frame.attr('data-fileindex'), rev = self.reversePreviewOrder;
	            if (ind.substring(0, 5) === $h.INIT_FLAG) {
	                ind = parseInt(ind.replace($h.INIT_FLAG, ''));
	                self.initialPreview = $h.spliceArray(self.initialPreview, ind, rev);
	                self.initialPreviewConfig = $h.spliceArray(self.initialPreviewConfig, ind, rev);
	                self.initialPreviewThumbTags = $h.spliceArray(self.initialPreviewThumbTags, ind, rev);
	                self.getFrames().each(function () {
	                    var $nFrame = $(this), nInd = $nFrame.attr('data-fileindex');
	                    if (nInd.substring(0, 5) === $h.INIT_FLAG) {
	                        nInd = parseInt(nInd.replace($h.INIT_FLAG, ''));
	                        if (nInd > ind) {
	                            nInd--;
	                            $nFrame.attr('data-fileindex', $h.INIT_FLAG + nInd);
	                        }
	                    }
	                });
	            }
	        },
	        _resetCaption: function () {
	            var self = this;
	            setTimeout(function () {
	                var cap, n, chk = self.previewCache.count(true), len = self.fileManager.count(), file,
	                    incomplete = ':not(.file-preview-success):not(.file-preview-error)',
	                    hasThumb = self.showPreview && self.getFrames(incomplete).length;
	                if (len === 0 && chk === 0 && !hasThumb) {
	                    self.reset();
	                } else {
	                    n = chk + len;
	                    if (n > 1) {
	                        cap = self._getMsgSelected(n);
	                    } else {
	                        file = self.fileManager.getFirstFile();
	                        cap = file ? file.nameFmt : '_';
	                    }
	                    self._setCaption(cap);
	                }
	            }, self.processDelay);
	        },
	        _initFileActions: function () {
	            var self = this;
	            if (!self.showPreview) {
	                return;
	            }
	            self._initZoomButton();
	            self.getFrames(' .kv-file-remove').each(function () {
	                var $el = $(this), $frame = $el.closest($h.FRAMES), hasError, id = $frame.attr('id'),
	                    ind = $frame.attr('data-fileindex'), status;
	                self._handler($el, 'click', function () {
	                    status = self._raise('filepreremove', [id, ind]);
	                    if (status === false || !self._validateMinCount()) {
	                        return false;
	                    }
	                    hasError = $frame.hasClass('file-preview-error');
	                    $h.cleanMemory($frame);
	                    $frame.fadeOut('slow', function () {
	                        self.fileManager.remove($frame);
	                        self._clearObjects($frame);
	                        $frame.remove();
	                        if (id && hasError) {
	                            self.$errorContainer.find('li[data-thumb-id="' + id + '"]').fadeOut('fast', function () {
	                                $(this).remove();
	                                if (!self._errorsExist()) {
	                                    self._resetErrors();
	                                }
	                            });
	                        }
	                        self._clearFileInput();
	                        self._resetCaption();
	                        self._raise('fileremoved', [id, ind]);
	                    });
	                });
	            });
	            self.getFrames(' .kv-file-upload').each(function () {
	                var $el = $(this);
	                self._handler($el, 'click', function () {
	                    var $frame = $el.closest($h.FRAMES), fileId = $frame.attr('data-fileid');
	                    self._hideProgress();
	                    if ($frame.hasClass('file-preview-error') && !self.retryErrorUploads) {
	                        return;
	                    }
	                    self._uploadSingle(self.fileManager.getIndex(fileId), fileId, false);
	                });
	            });
	        },
	        _initPreviewActions: function () {
	            var self = this, $preview = self.$preview, deleteExtraData = self.deleteExtraData || {},
	                btnRemove = $h.FRAMES + ' .kv-file-remove', settings = self.fileActionSettings,
	                origClass = settings.removeClass, errClass = settings.removeErrorClass,
	                resetProgress = function () {
	                    var hasFiles = self.isAjaxUpload ? self.previewCache.count(true) : self._inputFileCount();
	                    if (!self.getFrames().length && !hasFiles) {
	                        self._setCaption('');
	                        self.reset();
	                        self.initialCaption = '';
	                    }
	                };
	            self._initZoomButton();
	            $preview.find(btnRemove).each(function () {
	                var $el = $(this), vUrl = $el.data('url') || self.deleteUrl, vKey = $el.data('key'), errMsg, fnBefore,
	                    fnSuccess, fnError, op = self.ajaxOperations.deleteThumb;
	                if ($h.isEmpty(vUrl) || vKey === undefined) {
	                    return;
	                }
	                if (typeof vUrl === 'function') {
	                    vUrl = vUrl();
	                }
	                var $frame = $el.closest($h.FRAMES), cache = self.previewCache.data, settings, params, config,
	                    fileName, extraData, index = $frame.attr('data-fileindex');
	                index = parseInt(index.replace($h.INIT_FLAG, ''));
	                config = $h.isEmpty(cache.config) && $h.isEmpty(cache.config[index]) ? null : cache.config[index];
	                extraData = $h.isEmpty(config) || $h.isEmpty(config.extra) ? deleteExtraData : config.extra;
	                fileName = config && (config.filename || config.caption) || '';
	                if (typeof extraData === 'function') {
	                    extraData = extraData();
	                }
	                params = {id: $el.attr('id'), key: vKey, extra: extraData};
	                fnBefore = function (jqXHR) {
	                    self.ajaxAborted = false;
	                    self._raise('filepredelete', [vKey, jqXHR, extraData]);
	                    if (self._abort()) {
	                        jqXHR.abort();
	                    } else {
	                        $el.removeClass(errClass);
	                        $h.addCss($frame, 'file-uploading');
	                        $h.addCss($el, 'disabled ' + origClass);
	                    }
	                };
	                fnSuccess = function (data, textStatus, jqXHR) {
	                    var n, cap;
	                    if (!$h.isEmpty(data) && !$h.isEmpty(data.error)) {
	                        params.jqXHR = jqXHR;
	                        params.response = data;
	                        errMsg = self._parseError(op, jqXHR, self.msgDeleteError, fileName);
	                        self._showFileError(errMsg, params, 'filedeleteerror');
	                        $frame.removeClass('file-uploading');
	                        $el.removeClass('disabled ' + origClass).addClass(errClass);
	                        resetProgress();
	                        return;
	                    }
	                    $frame.removeClass('file-uploading').addClass('file-deleted');
	                    $frame.fadeOut('slow', function () {
	                        index = parseInt(($frame.attr('data-fileindex')).replace($h.INIT_FLAG, ''));
	                        self.previewCache.unset(index);
	                        self._deleteFileIndex($frame);
	                        n = self.previewCache.count(true);
	                        cap = n > 0 ? self._getMsgSelected(n) : '';
	                        self._setCaption(cap);
	                        self._raise('filedeleted', [vKey, jqXHR, extraData]);
	                        self._clearObjects($frame);
	                        $frame.remove();
	                        resetProgress();
	                    });
	                };
	                fnError = function (jqXHR, textStatus, errorThrown) {
	                    var errMsg = self._parseError(op, jqXHR, errorThrown, fileName);
	                    params.jqXHR = jqXHR;
	                    params.response = {};
	                    self._showFileError(errMsg, params, 'filedeleteerror');
	                    $frame.removeClass('file-uploading');
	                    $el.removeClass('disabled ' + origClass).addClass(errClass);
	                    resetProgress();
	                };
	                self._initAjaxSettings();
	                self._mergeAjaxCallback('beforeSend', fnBefore, 'delete');
	                self._mergeAjaxCallback('success', fnSuccess, 'delete');
	                self._mergeAjaxCallback('error', fnError, 'delete');
	                settings = $.extend(true, {}, {
	                    url: self._encodeURI(vUrl),
	                    type: 'POST',
	                    dataType: 'json',
	                    data: $.extend(true, {}, {key: vKey}, extraData)
	                }, self._ajaxDeleteSettings);
	                self._handler($el, 'click', function () {
	                    if (!self._validateMinCount()) {
	                        return false;
	                    }
	                    self.ajaxAborted = false;
	                    self._raise('filebeforedelete', [vKey, extraData]);
	                    if (self.ajaxAborted instanceof Promise) {
	                        self.ajaxAborted.then(function (result) {
	                            if (!result) {
	                                $.ajax(settings);
	                            }
	                        });
	                    } else {
	                        if (!self.ajaxAborted) {
	                            $.ajax(settings);
	                        }
	                    }
	                });
	            });
	        },
	        _hideFileIcon: function () {
	            var self = this;
	            if (self.overwriteInitial) {
	                self.$captionContainer.removeClass('icon-visible');
	            }
	        },
	        _showFileIcon: function () {
	            var self = this;
	            $h.addCss(self.$captionContainer, 'icon-visible');
	        },
	        _getSize: function (bytes, sizes) {
	            var self = this, size = parseFloat(bytes), i, func = self.fileSizeGetter, out;
	            if (!$.isNumeric(bytes) || !$.isNumeric(size)) {
	                return '';
	            }
	            if (typeof func === 'function') {
	                out = func(size);
	            } else {
	                if (size === 0) {
	                    out = '0.00 B';
	                } else {
	                    i = Math.floor(Math.log(size) / Math.log(1024));
	                    if (!sizes) {
	                        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	                    }
	                    out = (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i];
	                }
	            }
	            return self._getLayoutTemplate('size').replace('{sizeText}', out);
	        },
	        _getFileType: function (ftype) {
	            var self = this;
	            return self.mimeTypeAliases[ftype] || ftype;
	        },
	        _generatePreviewTemplate: function (
	            cat,
	            data,
	            fname,
	            ftype,
	            previewId,
	            fileId,
	            isError,
	            size,
	            frameClass,
	            foot,
	            ind,
	            templ,
	            attrs,
	            zoomData
	        ) {
	            var self = this, caption = self.slug(fname), prevContent, zoomContent = '', styleAttribs = '',
	                screenW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
	                config, title = caption, alt = caption, typeCss = 'type-default', getContent,
	                footer = foot || self._renderFileFooter(cat, caption, size, 'auto', isError),
	                forcePrevIcon = self.preferIconicPreview, forceZoomIcon = self.preferIconicZoomPreview,
	                newCat = forcePrevIcon ? 'other' : cat;
	            config = screenW < 400 ? (self.previewSettingsSmall[newCat] || self.defaults.previewSettingsSmall[newCat]) :
	                (self.previewSettings[newCat] || self.defaults.previewSettings[newCat]);
	            if (config) {
	                $.each(config, function (key, val) {
	                    styleAttribs += key + ':' + val + ';';
	                });
	            }
	            getContent = function (c, d, zoom, frameCss) {
	                var id = zoom ? 'zoom-' + previewId : previewId, tmplt = self._getPreviewTemplate(c),
	                    css = (frameClass || '') + ' ' + frameCss;
	                if (self.frameClass) {
	                    css = self.frameClass + ' ' + css;
	                }
	                if (zoom) {
	                    css = css.replace(' ' + $h.SORT_CSS, '');
	                }
	                tmplt = self._parseFilePreviewIcon(tmplt, fname);
	                if (c === 'text') {
	                    d = $h.htmlEncode(d);
	                }
	                if (cat === 'object' && !ftype) {
	                    $.each(self.defaults.fileTypeSettings, function (key, func) {
	                        if (key === 'object' || key === 'other') {
	                            return;
	                        }
	                        if (func(fname, ftype)) {
	                            typeCss = 'type-' + key;
	                        }
	                    });
	                }
	                if (!$h.isEmpty(attrs)) {
	                    if (attrs.title !== undefined && attrs.title !== null) {
	                        title = attrs.title;
	                    }
	                    if (attrs.alt !== undefined && attrs.alt !== null) {
	                        title = attrs.alt;
	                    }
	                }
	                return tmplt.setTokens({
	                    'previewId': id,
	                    'caption': caption,
	                    'title': title,
	                    'alt': alt,
	                    'frameClass': css,
	                    'type': self._getFileType(ftype),
	                    'fileindex': ind,
	                    'fileid': fileId || '',
	                    'typeCss': typeCss,
	                    'footer': footer,
	                    'data': d,
	                    'template': templ || cat,
	                    'style': styleAttribs ? 'style="' + styleAttribs + '"' : ''
	                });
	            };
	            ind = ind || previewId.slice(previewId.lastIndexOf('-') + 1);
	            if (self.fileActionSettings.showZoom) {
	                zoomContent = getContent((forceZoomIcon ? 'other' : cat), zoomData ? zoomData : data, true,
	                    'kv-zoom-thumb');
	            }
	            zoomContent = '\n' + self._getLayoutTemplate('zoomCache').replace('{zoomContent}', zoomContent);
	            if (typeof self.sanitizeZoomCache === 'function') {
	                zoomContent = self.sanitizeZoomCache(zoomContent);
	            }
	            prevContent = getContent((forcePrevIcon ? 'other' : cat), data, false, 'kv-preview-thumb');
	            return prevContent.setTokens({zoomCache: zoomContent});
	        },
	        _addToPreview: function ($preview, content) {
	            var self = this, $el;
	            content = $h.cspBuffer.stash(content);
	            $el = self.reversePreviewOrder ? $preview.prepend(content) : $preview.append(content);
	            $h.cspBuffer.apply($preview);
	            return $el;
	        },
	        _previewDefault: function (file, isDisabled) {
	            var self = this, $preview = self.$preview;
	            if (!self.showPreview) {
	                return;
	            }
	            var fname = $h.getFileName(file), ftype = file ? file.type : '', content, size = file.size || 0,
	                caption = self._getFileName(file, ''), isError = isDisabled === true && !self.isAjaxUpload,
	                data = $h.createObjectURL(file), fileId = self.fileManager.getId(file),
	                previewId = self._getThumbId(fileId);
	            self._clearDefaultPreview();
	            content = self._generatePreviewTemplate('other', data, fname, ftype, previewId, fileId, isError, size);
	            self._addToPreview($preview, content);
	            self._setThumbAttr(previewId, caption, size);
	            if (isDisabled === true && self.isAjaxUpload) {
	                self._setThumbStatus(self._getFrame(previewId), 'Error');
	            }
	        },
	        _previewFile: function (i, file, theFile, data, fileInfo) {
	            if (!this.showPreview) {
	                return;
	            }
	            var self = this, fname = $h.getFileName(file), ftype = fileInfo.type, caption = fileInfo.name,
	                cat = self._parseFileType(ftype, fname), content, $preview = self.$preview, fsize = file.size || 0,
	                iData = (cat === 'text' || cat === 'html' || cat === 'image') ? theFile.target.result : data,
	                fileId = self.fileManager.getId(file), previewId = self._getThumbId(fileId);
	            /** @namespace window.DOMPurify */
	            if (cat === 'html' && self.purifyHtml && window.DOMPurify) {
	                iData = window.DOMPurify.sanitize(iData);
	            }
	            content = self._generatePreviewTemplate(cat, iData, fname, ftype, previewId, fileId, false, fsize);
	            self._clearDefaultPreview();
	            self._addToPreview($preview, content);
	            var $thumb = self._getFrame(previewId);
	            self._validateImageOrientation($thumb.find('img'), file, previewId, fileId, caption, ftype, fsize, iData);
	            self._setThumbAttr(previewId, caption, fsize);
	            self._initSortable();
	        },
	        _setThumbAttr: function (id, caption, size) {
	            var self = this, $frame = self._getFrame(id);
	            if ($frame.length) {
	                size = size && size > 0 ? self._getSize(size) : '';
	                $frame.data({'caption': caption, 'size': size});
	            }
	        },
	        _setInitThumbAttr: function () {
	            var self = this, data = self.previewCache.data, len = self.previewCache.count(true), config,
	                caption, size, previewId;
	            if (len === 0) {
	                return;
	            }
	            for (var i = 0; i < len; i++) {
	                config = data.config[i];
	                previewId = self.previewInitId + '-' + $h.INIT_FLAG + i;
	                caption = $h.ifSet('caption', config, $h.ifSet('filename', config));
	                size = $h.ifSet('size', config);
	                self._setThumbAttr(previewId, caption, size);
	            }
	        },
	        _slugDefault: function (text) {
	            // noinspection RegExpRedundantEscape
	            return $h.isEmpty(text, true) ? '' : String(text).replace(/[\[\]\/\{}:;#%=\(\)\*\+\?\\\^\$\|<>&"']/g, '_');
	        },
	        _updateFileDetails: function (numFiles, skipRaiseEvent) {
	            var self = this, $el = self.$element, label, n, log, nFiles, file,
	                name = ($h.isIE(9) && $h.findFileName($el.val())) || ($el[0].files[0] && $el[0].files[0].name);
	            if (!name && self.fileManager.count() > 0) {
	                file = self.fileManager.getFirstFile();
	                label = file.nameFmt;
	            } else {
	                label = name ? self.slug(name) : '_';
	            }
	            n = self.isAjaxUpload ? self.fileManager.count() : numFiles;
	            nFiles = self.previewCache.count(true) + n;
	            log = n === 1 ? label : self._getMsgSelected(nFiles);
	            if (self.isError) {
	                self.$previewContainer.removeClass('file-thumb-loading');
	                self.$previewStatus.html('');
	                self.$captionContainer.removeClass('icon-visible');
	            } else {
	                self._showFileIcon();
	            }
	            self._setCaption(log, self.isError);
	            self.$container.removeClass('file-input-new file-input-ajax-new');
	            if (!skipRaiseEvent) {
	                self._raise('fileselect', [numFiles, label]);
	            }
	            if (self.previewCache.count(true)) {
	                self._initPreviewActions();
	            }
	        },
	        _setThumbStatus: function ($thumb, status) {
	            var self = this;
	            if (!self.showPreview) {
	                return;
	            }
	            var icon = 'indicator' + status, msg = icon + 'Title',
	                css = 'file-preview-' + status.toLowerCase(),
	                $indicator = $thumb.find('.file-upload-indicator'),
	                config = self.fileActionSettings;
	            $thumb.removeClass('file-preview-success file-preview-error file-preview-paused file-preview-loading');
	            if (status === 'Success') {
	                $thumb.find('.file-drag-handle').remove();
	            }
	            $h.setHtml($indicator, config[icon]);
	            $indicator.attr('title', config[msg]);
	            $thumb.addClass(css);
	            if (status === 'Error' && !self.retryErrorUploads) {
	                $thumb.find('.kv-file-upload').attr('disabled', true);
	            }
	        },
	        _setProgressCancelled: function () {
	            var self = this;
	            self._setProgress(101, self.$progress, self.msgCancelled);
	        },
	        _setProgress: function (p, $el, error, stats) {
	            var self = this;
	            $el = $el || self.$progress;
	            if (!$el.length) {
	                return;
	            }
	            var pct = Math.min(p, 100), out, pctLimit = self.progressUploadThreshold,
	                t = p <= 100 ? self.progressTemplate : self.progressCompleteTemplate,
	                template = pct < 100 ? self.progressTemplate :
	                    (error ? (self.paused ? self.progressPauseTemplate : self.progressErrorTemplate) : t);
	            if (p >= 100) {
	                stats = '';
	            }
	            if (!$h.isEmpty(template)) {
	                if (pctLimit && pct > pctLimit && p <= 100) {
	                    out = template.setTokens({'percent': pctLimit, 'status': self.msgUploadThreshold});
	                } else {
	                    out = template.setTokens({'percent': pct, 'status': (p > 100 ? self.msgUploadEnd : pct + '%')});
	                }
	                stats = stats || '';
	                out = out.setTokens({stats: stats});
	                $h.setHtml($el, out);
	                if (error) {
	                    $h.setHtml($el.find('[role="progressbar"]'), error);
	                }
	            }
	        },
	        _hasFiles: function () {
	            var el = this.$element[0];
	            return !!(el && el.files && el.files.length);
	        },
	        _setFileDropZoneTitle: function () {
	            var self = this, $zone = self.$container.find('.file-drop-zone'), title = self.dropZoneTitle, strFiles;
	            if (self.isClickable) {
	                strFiles = $h.isEmpty(self.$element.attr('multiple')) ? self.fileSingle : self.filePlural;
	                title += self.dropZoneClickTitle.replace('{files}', strFiles);
	            }
	            $zone.find('.' + self.dropZoneTitleClass).remove();
	            if (!self.showPreview || $zone.length === 0 || self.fileManager.count() > 0 || !self.dropZoneEnabled ||
	                self.previewCache.count() > 0 || (!self.isAjaxUpload && self._hasFiles())) {
	                return;
	            }
	            if ($zone.find($h.FRAMES).length === 0 && $h.isEmpty(self.defaultPreviewContent)) {
	                $zone.prepend('<div class="' + self.dropZoneTitleClass + '">' + title + '</div>');
	            }
	            self.$container.removeClass('file-input-new');
	            $h.addCss(self.$container, 'file-input-ajax-new');
	        },
	        _getStats: function (stats) {
	            var self = this, pendingTime, t;
	            if (!self.showUploadStats || !stats || !stats.bitrate) {
	                return '';
	            }
	            t = self._getLayoutTemplate('stats');
	            pendingTime = (!stats.elapsed || !stats.bps) ? self.msgCalculatingTime :
	                self.msgPendingTime.setTokens({time: $h.getElapsed(Math.ceil(stats.pendingBytes / stats.bps))});

	            return t.setTokens({
	                uploadSpeed: stats.bitrate,
	                pendingTime: pendingTime
	            });
	        },
	        _setResumableProgress: function (pct, stats, $thumb) {
	            var self = this, rm = self.resumableManager, obj = $thumb ? rm : self,
	                $prog = $thumb ? $thumb.find('.file-thumb-progress') : null;
	            if (obj.lastProgress === 0) {
	                obj.lastProgress = pct;
	            }
	            if (pct < obj.lastProgress) {
	                pct = obj.lastProgress;
	            }
	            self._setProgress(pct, $prog, null, self._getStats(stats));
	            obj.lastProgress = pct;
	        },
	        _toggleResumableProgress: function (template, message) {
	            var self = this, $progress = self.$progress;
	            if ($progress && $progress.length) {
	                $h.setHtml($progress, template.setTokens({
	                    percent: 101,
	                    status: message,
	                    stats: ''
	                }));
	            }
	        },
	        _setFileUploadStats: function (id, pct, stats) {
	            var self = this, $prog = self.$progress;
	            if (!self.showPreview && (!$prog || !$prog.length)) {
	                return;
	            }
	            var fm = self.fileManager, rm = self.resumableManager, $thumb = fm.getThumb(id), pctTot,
	                totUpSize = 0, totSize = fm.getTotalSize(), totStats = $.extend(true, {}, stats);
	            if (self.enableResumableUpload) {
	                var loaded = stats.loaded, currUplSize = rm.getUploadedSize(), currTotSize = rm.file.size, totLoaded;
	                loaded += currUplSize;
	                totLoaded = fm.uploadedSize + loaded;
	                pct = $h.round(100 * loaded / currTotSize);
	                stats.pendingBytes = currTotSize - currUplSize;
	                self._setResumableProgress(pct, stats, $thumb);
	                pctTot = Math.floor(100 * totLoaded / totSize);
	                totStats.pendingBytes = totSize - totLoaded;
	                self._setResumableProgress(pctTot, totStats);
	            } else {
	                fm.setProgress(id, pct);
	                $prog = $thumb && $thumb.length ? $thumb.find('.file-thumb-progress') : null;
	                self._setProgress(pct, $prog, null, self._getStats(stats));
	                $.each(fm.stats, function (id, cfg) {
	                    totUpSize += cfg.loaded;
	                });
	                totStats.pendingBytes = totSize - totUpSize;
	                pctTot = $h.round(totUpSize / totSize * 100);
	                self._setProgress(pctTot, null, null, self._getStats(totStats));
	            }
	        },
	        _validateMinCount: function () {
	            var self = this, len = self.isAjaxUpload ? self.fileManager.count() : self._inputFileCount();
	            if (self.validateInitialCount && self.minFileCount > 0 && self._getFileCount(len - 1) < self.minFileCount) {
	                self._noFilesError({});
	                return false;
	            }
	            return true;
	        },
	        _getFileCount: function (fileCount, includeInitial) {
	            var self = this, addCount = 0;
	            if (includeInitial === undefined) {
	                includeInitial = self.validateInitialCount && !self.overwriteInitial;
	            }
	            if (includeInitial) {
	                addCount = self.previewCache.count(true);
	                fileCount += addCount;
	            }
	            return fileCount;
	        },
	        _getFileId: function (file) {
	            return $h.getFileId(file, this.generateFileId);
	        },
	        _getFileName: function (file, defaultValue) {
	            var self = this, fileName = $h.getFileName(file);
	            return fileName ? self.slug(fileName) : defaultValue;
	        },
	        _getFileNames: function (skipNull) {
	            var self = this;
	            return self.filenames.filter(function (n) {
	                return (skipNull ? n !== undefined : n !== undefined && n !== null);
	            });
	        },
	        _setPreviewError: function ($thumb, keepFile) {
	            var self = this, removeFrame = self.removeFromPreviewOnError && !self.retryErrorUploads;
	            if (!keepFile || removeFrame) {
	                self.fileManager.remove($thumb);
	            }
	            if (!self.showPreview) {
	                return;
	            }
	            if (removeFrame) {
	                $thumb.remove();
	                return;
	            } else {
	                self._setThumbStatus($thumb, 'Error');
	            }
	            self._refreshUploadButton($thumb);
	        },
	        _refreshUploadButton: function ($thumb) {
	            var self = this, $btn = $thumb.find('.kv-file-upload'), cfg = self.fileActionSettings,
	                icon = cfg.uploadIcon, title = cfg.uploadTitle;
	            if (!$btn.length) {
	                return;
	            }
	            if (self.retryErrorUploads) {
	                icon = cfg.uploadRetryIcon;
	                title = cfg.uploadRetryTitle;
	            }
	            $btn.attr('title', title);
	            $h.setHtml($btn, icon);
	        },
	        _checkDimensions: function (i, chk, $img, $thumb, fname, type, params) {
	            var self = this, msg, dim, tag = chk === 'Small' ? 'min' : 'max', limit = self[tag + 'Image' + type],
	                $imgEl, isValid;
	            if ($h.isEmpty(limit) || !$img.length) {
	                return;
	            }
	            $imgEl = $img[0];
	            dim = (type === 'Width') ? $imgEl.naturalWidth || $imgEl.width : $imgEl.naturalHeight || $imgEl.height;
	            isValid = chk === 'Small' ? dim >= limit : dim <= limit;
	            if (isValid) {
	                return;
	            }
	            msg = self['msgImage' + type + chk].setTokens({'name': fname, 'size': limit});
	            self._showFileError(msg, params);
	            self._setPreviewError($thumb);
	        },
	        _getExifObj: function (data) {
	            var self = this, exifObj, error = $h.logMessages.exifWarning;
	            if (data.slice(0, 23) !== 'data:image/jpeg;base64,' && data.slice(0, 22) !== 'data:image/jpg;base64,') {
	                exifObj = null;
	                return;
	            }
	            try {
	                exifObj = window.piexif ? window.piexif.load(data) : null;
	            } catch (err) {
	                exifObj = null;
	                error = err && err.message || '';
	            }
	            if (!exifObj) {
	                self._log($h.logMessages.badExifParser, {details: error});
	            }
	            return exifObj;
	        },
	        setImageOrientation: function ($img, $zoomImg, value, $thumb) {
	            var self = this, invalidImg = !$img || !$img.length, invalidZoomImg = !$zoomImg || !$zoomImg.length, $mark,
	                isHidden = false, $div, zoomOnly = invalidImg && $thumb && $thumb.attr('data-template') === 'image', ev;
	            if (invalidImg && invalidZoomImg) {
	                return;
	            }
	            ev = 'load.fileinputimageorient';
	            if (zoomOnly) {
	                $img = $zoomImg;
	                $zoomImg = null;
	                $img.css(self.previewSettings.image);
	                $div = $(document.createElement('div')).appendTo($thumb.find('.kv-file-content'));
	                $mark = $(document.createElement('span')).insertBefore($img);
	                $img.css('visibility', 'hidden').removeClass('file-zoom-detail').appendTo($div);
	            } else {
	                isHidden = !$img.is(':visible');
	            }
	            $img.off(ev).on(ev, function () {
	                if (isHidden) {
	                    self.$preview.removeClass('hide-content');
	                    $thumb.find('.kv-file-content').css('visibility', 'hidden');
	                }
	                var img = $img[0], zoomImg = $zoomImg && $zoomImg.length ? $zoomImg[0] : null,
	                    h = img.offsetHeight, w = img.offsetWidth, r = $h.getRotation(value);
	                if (isHidden) {
	                    $thumb.find('.kv-file-content').css('visibility', 'visible');
	                    self.$preview.addClass('hide-content');
	                }
	                $img.data('orientation', value);
	                if (zoomImg) {
	                    $zoomImg.data('orientation', value);
	                }
	                if (value < 5) {
	                    $h.setTransform(img, r);
	                    $h.setTransform(zoomImg, r);
	                    return;
	                }
	                var offsetAngle = Math.atan(w / h), origFactor = Math.sqrt(Math.pow(h, 2) + Math.pow(w, 2)),
	                    scale = !origFactor ? 1 : (h / Math.cos(Math.PI / 2 + offsetAngle)) / origFactor,
	                    s = ' scale(' + Math.abs(scale) + ')';
	                $h.setTransform(img, r + s);
	                $h.setTransform(zoomImg, r + s);
	                if (zoomOnly) {
	                    $img.css('visibility', 'visible').insertAfter($mark).addClass('file-zoom-detail');
	                    $mark.remove();
	                    $div.remove();
	                }
	            });
	        },
	        _validateImageOrientation: function ($img, file, previewId, fileId, caption, ftype, fsize, iData) {
	            var self = this, exifObj, value, autoOrientImage = self.autoOrientImage, selector;
	            if (self.canOrientImage) {
	                $img.css('image-orientation', (autoOrientImage ? 'from-image' : 'none'));
	                return;
	            }
	            selector = $h.getZoomSelector(previewId, ' img');
	            exifObj = autoOrientImage ? self._getExifObj(iData) : null;
	            value = exifObj ? exifObj['0th'][piexif.ImageIFD.Orientation] : null; // jshint ignore:line
	            if (!value) {
	                self._validateImage(previewId, fileId, caption, ftype, fsize, iData, exifObj);
	                return;
	            }
	            self.setImageOrientation($img, $(selector), value, self._getFrame(previewId));
	            self._raise('fileimageoriented', {'$img': $img, 'file': file});
	            self._validateImage(previewId, fileId, caption, ftype, fsize, iData, exifObj);
	        },
	        _validateImage: function (previewId, fileId, fname, ftype, fsize, iData, exifObj) {
	            var self = this, $preview = self.$preview, params, w1, w2, $thumb = self._getFrame(previewId),
	                i = $thumb.attr('data-fileindex'), $img = $thumb.find('img');
	            fname = fname || 'Untitled';
	            $img.one('load', function () {
	                w1 = $thumb.width();
	                w2 = $preview.width();
	                if (w1 > w2) {
	                    $img.css('width', '100%');
	                }
	                params = {ind: i, id: previewId, fileId: fileId};
	                self._checkDimensions(i, 'Small', $img, $thumb, fname, 'Width', params);
	                self._checkDimensions(i, 'Small', $img, $thumb, fname, 'Height', params);
	                if (!self.resizeImage) {
	                    self._checkDimensions(i, 'Large', $img, $thumb, fname, 'Width', params);
	                    self._checkDimensions(i, 'Large', $img, $thumb, fname, 'Height', params);
	                }
	                self._raise('fileimageloaded', [previewId]);
	                self.fileManager.addImage(fileId, {
	                    ind: i,
	                    img: $img,
	                    thumb: $thumb,
	                    pid: previewId,
	                    typ: ftype,
	                    siz: fsize,
	                    validated: false,
	                    imgData: iData,
	                    exifObj: exifObj
	                });
	                $thumb.data('exif', exifObj);
	                self._validateAllImages();
	            }).one('error', function () {
	                self._raise('fileimageloaderror', [previewId]);
	            }).each(function () {
	                if (this.complete) {
	                    $(this).trigger('load');
	                } else {
	                    if (this.error) {
	                        $(this).trigger('error');
	                    }
	                }
	            });
	        },
	        _validateAllImages: function () {
	            var self = this, counter = {val: 0}, numImgs = self.fileManager.getImageCount(), fsize,
	                minSize = self.resizeIfSizeMoreThan;
	            if (numImgs !== self.fileManager.totalImages) {
	                return;
	            }
	            self._raise('fileimagesloaded');
	            if (!self.resizeImage) {
	                return;
	            }
	            $.each(self.fileManager.loadedImages, function (id, config) {
	                if (!config.validated) {
	                    fsize = config.siz;
	                    if (fsize && fsize > minSize * 1000) {
	                        self._getResizedImage(id, config, counter, numImgs);
	                    }
	                    config.validated = true;
	                }
	            });
	        },
	        _getResizedImage: function (id, config, counter, numImgs) {
	            var self = this, img = $(config.img)[0], width = img.naturalWidth, height = img.naturalHeight, blob,
	                ratio = 1, maxWidth = self.maxImageWidth || width, maxHeight = self.maxImageHeight || height,
	                isValidImage = !!(width && height), chkWidth, chkHeight, canvas = self.imageCanvas, dataURI,
	                context = self.imageCanvasContext, type = config.typ, pid = config.pid, ind = config.ind,
	                $thumb = config.thumb, throwError, msg, exifObj = config.exifObj, exifStr, file, params, evParams;
	            throwError = function (msg, params, ev) {
	                if (self.isAjaxUpload) {
	                    self._showFileError(msg, params, ev);
	                } else {
	                    self._showError(msg, params, ev);
	                }
	                self._setPreviewError($thumb);
	            };
	            file = self.fileManager.getFile(id);
	            params = {id: pid, 'index': ind, fileId: id};
	            evParams = [id, pid, ind];
	            if (!file || !isValidImage || (width <= maxWidth && height <= maxHeight)) {
	                if (isValidImage && file) {
	                    self._raise('fileimageresized', evParams);
	                }
	                counter.val++;
	                if (counter.val === numImgs) {
	                    self._raise('fileimagesresized');
	                }
	                if (!isValidImage) {
	                    throwError(self.msgImageResizeError, params, 'fileimageresizeerror');
	                    return;
	                }
	            }
	            type = type || self.resizeDefaultImageType;
	            chkWidth = width > maxWidth;
	            chkHeight = height > maxHeight;
	            if (self.resizePreference === 'width') {
	                ratio = chkWidth ? maxWidth / width : (chkHeight ? maxHeight / height : 1);
	            } else {
	                ratio = chkHeight ? maxHeight / height : (chkWidth ? maxWidth / width : 1);
	            }
	            self._resetCanvas();
	            width *= ratio;
	            height *= ratio;
	            canvas.width = width;
	            canvas.height = height;
	            try {
	                context.drawImage(img, 0, 0, width, height);
	                dataURI = canvas.toDataURL(type, self.resizeQuality);
	                if (exifObj) {
	                    exifStr = window.piexif.dump(exifObj);
	                    dataURI = window.piexif.insert(exifStr, dataURI);
	                }
	                blob = $h.dataURI2Blob(dataURI);
	                self.fileManager.setFile(id, blob);
	                self._raise('fileimageresized', evParams);
	                counter.val++;
	                if (counter.val === numImgs) {
	                    self._raise('fileimagesresized', [undefined, undefined]);
	                }
	                if (!(blob instanceof Blob)) {
	                    throwError(self.msgImageResizeError, params, 'fileimageresizeerror');
	                }
	            } catch (err) {
	                counter.val++;
	                if (counter.val === numImgs) {
	                    self._raise('fileimagesresized', [undefined, undefined]);
	                }
	                msg = self.msgImageResizeException.replace('{errors}', err.message);
	                throwError(msg, params, 'fileimageresizeexception');
	            }
	        },
	        _showProgress: function () {
	            var self = this;
	            if (self.$progress && self.$progress.length) {
	                self.$progress.show();
	            }
	        },
	        _hideProgress: function () {
	            var self = this;
	            if (self.$progress && self.$progress.length) {
	                self.$progress.hide();
	            }
	        },
	        _initBrowse: function ($container) {
	            var self = this, $el = self.$element;
	            if (self.showBrowse) {
	                self.$btnFile = $container.find('.btn-file').append($el);
	            } else {
	                $el.appendTo($container).attr('tabindex', -1);
	                $h.addCss($el, 'file-no-browse');
	            }
	        },
	        _initClickable: function () {
	            var self = this, $zone, $tmpZone;
	            if (!self.isClickable) {
	                return;
	            }
	            $zone = self.$dropZone;
	            if (!self.isAjaxUpload) {
	                $tmpZone = self.$preview.find('.file-default-preview');
	                if ($tmpZone.length) {
	                    $zone = $tmpZone;
	                }
	            }

	            $h.addCss($zone, 'clickable');
	            $zone.attr('tabindex', -1);
	            self._handler($zone, 'click', function (e) {
	                var $tar = $(e.target);
	                if (!$(self.elErrorContainer + ':visible').length &&
	                    (!$tar.parents('.file-preview-thumbnails').length || $tar.parents(
	                        '.file-default-preview').length)) {
	                    self.$element.data('zoneClicked', true).trigger('click');
	                    $zone.blur();
	                }
	            });
	        },
	        _initCaption: function () {
	            var self = this, cap = self.initialCaption || '';
	            if (self.overwriteInitial || $h.isEmpty(cap)) {
	                self.$caption.val('');
	                return false;
	            }
	            self._setCaption(cap);
	            return true;
	        },
	        _setCaption: function (content, isError) {
	            var self = this, title, out, icon, n, cap, file;
	            if (!self.$caption.length) {
	                return;
	            }
	            self.$captionContainer.removeClass('icon-visible');
	            if (isError) {
	                title = $('<div>' + self.msgValidationError + '</div>').text();
	                n = self.fileManager.count();
	                if (n) {
	                    file = self.fileManager.getFirstFile();
	                    cap = n === 1 && file ? file.nameFmt : self._getMsgSelected(n);
	                } else {
	                    cap = self._getMsgSelected(self.msgNo);
	                }
	                out = $h.isEmpty(content) ? cap : content;
	                icon = '<span class="' + self.msgValidationErrorClass + '">' + self.msgValidationErrorIcon + '</span>';
	            } else {
	                if ($h.isEmpty(content)) {
	                    return;
	                }
	                title = $('<div>' + content + '</div>').text();
	                out = title;
	                icon = self._getLayoutTemplate('fileIcon');
	            }
	            self.$captionContainer.addClass('icon-visible');
	            self.$caption.attr('title', title).val(out);
	            $h.setHtml(self.$captionIcon, icon);
	        },
	        _createContainer: function () {
	            var self = this, attribs = {'class': 'file-input file-input-new' + (self.rtl ? ' kv-rtl' : '')},
	                $container = $h.createElement($h.cspBuffer.stash(self._renderMain()));
	            $h.cspBuffer.apply($container);
	            $container.insertBefore(self.$element).attr(attribs);
	            self._initBrowse($container);
	            if (self.theme) {
	                $container.addClass('theme-' + self.theme);
	            }
	            return $container;
	        },
	        _refreshContainer: function () {
	            var self = this, $container = self.$container, $el = self.$element;
	            $el.insertAfter($container);
	            $h.setHtml($container, self._renderMain());
	            self._initBrowse($container);
	            self._validateDisabled();
	        },
	        _validateDisabled: function () {
	            var self = this;
	            self.$caption.attr({readonly: self.isDisabled});
	        },
	        _renderMain: function () {
	            var self = this,
	                dropCss = self.dropZoneEnabled ? ' file-drop-zone' : 'file-drop-disabled',
	                close = !self.showClose ? '' : self._getLayoutTemplate('close'),
	                preview = !self.showPreview ? '' : self._getLayoutTemplate('preview')
	                    .setTokens({'class': self.previewClass, 'dropClass': dropCss}),
	                css = self.isDisabled ? self.captionClass + ' file-caption-disabled' : self.captionClass,
	                caption = self.captionTemplate.setTokens({'class': css + ' kv-fileinput-caption'});
	            return self.mainTemplate.setTokens({
	                'class': self.mainClass + (!self.showBrowse && self.showCaption ? ' no-browse' : ''),
	                'preview': preview,
	                'close': close,
	                'caption': caption,
	                'upload': self._renderButton('upload'),
	                'remove': self._renderButton('remove'),
	                'cancel': self._renderButton('cancel'),
	                'pause': self._renderButton('pause'),
	                'browse': self._renderButton('browse')
	            });

	        },
	        _renderButton: function (type) {
	            var self = this, tmplt = self._getLayoutTemplate('btnDefault'), css = self[type + 'Class'],
	                title = self[type + 'Title'], icon = self[type + 'Icon'], label = self[type + 'Label'],
	                status = self.isDisabled ? ' disabled' : '', btnType = 'button';
	            switch (type) {
	                case 'remove':
	                    if (!self.showRemove) {
	                        return '';
	                    }
	                    break;
	                case 'cancel':
	                    if (!self.showCancel) {
	                        return '';
	                    }
	                    css += ' kv-hidden';
	                    break;
	                case 'pause':
	                    if (!self.showPause) {
	                        return '';
	                    }
	                    css += ' kv-hidden';
	                    break;
	                case 'upload':
	                    if (!self.showUpload) {
	                        return '';
	                    }
	                    if (self.isAjaxUpload && !self.isDisabled) {
	                        tmplt = self._getLayoutTemplate('btnLink').replace('{href}', self.uploadUrl);
	                    } else {
	                        btnType = 'submit';
	                    }
	                    break;
	                case 'browse':
	                    if (!self.showBrowse) {
	                        return '';
	                    }
	                    tmplt = self._getLayoutTemplate('btnBrowse');
	                    break;
	                default:
	                    return '';
	            }

	            css += type === 'browse' ? ' btn-file' : ' fileinput-' + type + ' fileinput-' + type + '-button';
	            if (!$h.isEmpty(label)) {
	                label = ' <span class="' + self.buttonLabelClass + '">' + label + '</span>';
	            }
	            return tmplt.setTokens({
	                'type': btnType, 'css': css, 'title': title, 'status': status, 'icon': icon, 'label': label
	            });
	        },
	        _renderThumbProgress: function () {
	            var self = this;
	            return '<div class="file-thumb-progress kv-hidden">' +
	                self.progressInfoTemplate.setTokens({percent: 101, status: self.msgUploadBegin, stats: ''}) +
	                '</div>';
	        },
	        _renderFileFooter: function (cat, caption, size, width, isError) {
	            var self = this, config = self.fileActionSettings, rem = config.showRemove, drg = config.showDrag,
	                upl = config.showUpload, zoom = config.showZoom, out, params,
	                template = self._getLayoutTemplate('footer'), tInd = self._getLayoutTemplate('indicator'),
	                ind = isError ? config.indicatorError : config.indicatorNew,
	                title = isError ? config.indicatorErrorTitle : config.indicatorNewTitle,
	                indicator = tInd.setTokens({'indicator': ind, 'indicatorTitle': title});
	            size = self._getSize(size);
	            params = {type: cat, caption: caption, size: size, width: width, progress: '', indicator: indicator};
	            if (self.isAjaxUpload) {
	                params.progress = self._renderThumbProgress();
	                params.actions = self._renderFileActions(params, upl, false, rem, zoom, drg, false, false, false);
	            } else {
	                params.actions = self._renderFileActions(params, false, false, false, zoom, drg, false, false, false);
	            }
	            out = template.setTokens(params);
	            out = $h.replaceTags(out, self.previewThumbTags);
	            return out;
	        },
	        _renderFileActions: function (
	            cfg,
	            showUpl,
	            showDwn,
	            showDel,
	            showZoom,
	            showDrag,
	            disabled,
	            url,
	            key,
	            isInit,
	            dUrl,
	            dFile
	        ) {
	            var self = this;
	            if (!cfg.type && isInit) {
	                cfg.type = 'image';
	            }
	            if (self.enableResumableUpload) {
	                showUpl = false;
	            } else {
	                if (typeof showUpl === 'function') {
	                    showUpl = showUpl(cfg);
	                }
	            }
	            if (typeof showDwn === 'function') {
	                showDwn = showDwn(cfg);
	            }
	            if (typeof showDel === 'function') {
	                showDel = showDel(cfg);
	            }
	            if (typeof showZoom === 'function') {
	                showZoom = showZoom(cfg);
	            }
	            if (typeof showDrag === 'function') {
	                showDrag = showDrag(cfg);
	            }
	            if (!showUpl && !showDwn && !showDel && !showZoom && !showDrag) {
	                return '';
	            }
	            var vUrl = url === false ? '' : ' data-url="' + url + '"', btnZoom = '', btnDrag = '', css,
	                vKey = key === false ? '' : ' data-key="' + key + '"', btnDelete = '', btnUpload = '', btnDownload = '',
	                template = self._getLayoutTemplate('actions'), config = self.fileActionSettings,
	                otherButtons = self.otherActionButtons.setTokens({'dataKey': vKey, 'key': key}),
	                removeClass = disabled ? config.removeClass + ' disabled' : config.removeClass;
	            if (showDel) {
	                btnDelete = self._getLayoutTemplate('actionDelete').setTokens({
	                    'removeClass': removeClass,
	                    'removeIcon': config.removeIcon,
	                    'removeTitle': config.removeTitle,
	                    'dataUrl': vUrl,
	                    'dataKey': vKey,
	                    'key': key
	                });
	            }
	            if (showUpl) {
	                btnUpload = self._getLayoutTemplate('actionUpload').setTokens({
	                    'uploadClass': config.uploadClass,
	                    'uploadIcon': config.uploadIcon,
	                    'uploadTitle': config.uploadTitle
	                });
	            }
	            if (showDwn) {
	                btnDownload = self._getLayoutTemplate('actionDownload').setTokens({
	                    'downloadClass': config.downloadClass,
	                    'downloadIcon': config.downloadIcon,
	                    'downloadTitle': config.downloadTitle,
	                    'downloadUrl': dUrl || self.initialPreviewDownloadUrl
	                });
	                btnDownload = btnDownload.setTokens({'filename': dFile, 'key': key});
	            }
	            if (showZoom) {
	                btnZoom = self._getLayoutTemplate('actionZoom').setTokens({
	                    'zoomClass': config.zoomClass,
	                    'zoomIcon': config.zoomIcon,
	                    'zoomTitle': config.zoomTitle
	                });
	            }
	            if (showDrag && isInit) {
	                css = 'drag-handle-init ' + config.dragClass;
	                btnDrag = self._getLayoutTemplate('actionDrag').setTokens({
	                    'dragClass': css,
	                    'dragTitle': config.dragTitle,
	                    'dragIcon': config.dragIcon
	                });
	            }
	            return template.setTokens({
	                'delete': btnDelete,
	                'upload': btnUpload,
	                'download': btnDownload,
	                'zoom': btnZoom,
	                'drag': btnDrag,
	                'other': otherButtons
	            });
	        },
	        _browse: function (e) {
	            var self = this;
	            if (e && e.isDefaultPrevented() || !self._raise('filebrowse')) {
	                return;
	            }
	            if (self.isError && !self.isAjaxUpload) {
	                self.clear();
	            }
	            if (self.focusCaptionOnBrowse) {
	                self.$captionContainer.focus();
	            }
	        },
	        _change: function (e) {
	            var self = this;
	            if (self.changeTriggered) {
	                return;
	            }
	            var $el = self.$element, isDragDrop = arguments.length > 1, isAjaxUpload = self.isAjaxUpload,
	                tfiles, files = isDragDrop ? arguments[1] : $el[0].files, ctr = self.fileManager.count(),
	                total, initCount, len, isSingleUpl = $h.isEmpty($el.attr('multiple')),
	                maxCount = !isAjaxUpload && isSingleUpl ? 1 : self.maxFileCount, maxTotCount = self.maxTotalFileCount,
	                inclAll = maxTotCount > 0 && maxTotCount > maxCount, flagSingle = (isSingleUpl && ctr > 0),
	                throwError = function (mesg, file, previewId, index) {
	                    var p1 = $.extend(true, {}, self._getOutData(null, {}, {}, files), {id: previewId, index: index}),
	                        p2 = {id: previewId, index: index, file: file, files: files};
	                    self.isPersistentError = true;
	                    return isAjaxUpload ? self._showFileError(mesg, p1) : self._showError(mesg, p2);
	                },
	                maxCountCheck = function (n, m, all) {
	                    var msg = all ? self.msgTotalFilesTooMany : self.msgFilesTooMany;
	                    msg = msg.replace('{m}', m).replace('{n}', n);
	                    self.isError = throwError(msg, null, null, null);
	                    self.$captionContainer.removeClass('icon-visible');
	                    self._setCaption('', true);
	                    self.$container.removeClass('file-input-new file-input-ajax-new');
	                };
	            self.reader = null;
	            self._resetUpload();
	            self._hideFileIcon();
	            if (self.dropZoneEnabled) {
	                self.$container.find('.file-drop-zone .' + self.dropZoneTitleClass).remove();
	            }
	            if (!isAjaxUpload) {
	                if (e.target && e.target.files === undefined) {
	                    files = e.target.value ? [{name: e.target.value.replace(/^.+\\/, '')}] : [];
	                } else {
	                    files = e.target.files || {};
	                }
	            }
	            tfiles = files;
	            if ($h.isEmpty(tfiles) || tfiles.length === 0) {
	                if (!isAjaxUpload) {
	                    self.clear();
	                }
	                self._raise('fileselectnone');
	                return;
	            }
	            self._resetErrors();
	            len = tfiles.length;
	            initCount = isAjaxUpload ? (self.fileManager.count() + len) : len;
	            total = self._getFileCount(initCount, inclAll ? false : undefined);
	            if (maxCount > 0 && total > maxCount) {
	                if (!self.autoReplace || len > maxCount) {
	                    maxCountCheck((self.autoReplace && len > maxCount ? len : total), maxCount);
	                    return;
	                }
	                if (total > maxCount) {
	                    self._resetPreviewThumbs(isAjaxUpload);
	                }
	            } else {
	                if (inclAll) {
	                    total = self._getFileCount(initCount, true);
	                    if (maxTotCount > 0 && total > maxTotCount) {
	                        if (!self.autoReplace || len > maxCount) {
	                            maxCountCheck((self.autoReplace && len > maxTotCount ? len : total), maxTotCount, true);
	                            return;
	                        }
	                        if (total > maxCount) {
	                            self._resetPreviewThumbs(isAjaxUpload);
	                        }
	                    }
	                }
	                if (!isAjaxUpload || flagSingle) {
	                    self._resetPreviewThumbs(false);
	                    if (flagSingle) {
	                        self.clearFileStack();
	                    }
	                } else {
	                    if (isAjaxUpload && ctr === 0 && (!self.previewCache.count(true) || self.overwriteInitial)) {
	                        self._resetPreviewThumbs(true);
	                    }
	                }
	            }
	            self.readFiles(tfiles);
	        },
	        _abort: function (params) {
	            var self = this, data;
	            if (self.ajaxAborted && typeof self.ajaxAborted === 'object' && self.ajaxAborted.message !== undefined) {
	                data = $.extend(true, {}, self._getOutData(null), params);
	                data.abortData = self.ajaxAborted.data || {};
	                data.abortMessage = self.ajaxAborted.message;
	                self._setProgress(101, self.$progress, self.msgCancelled);
	                self._showFileError(self.ajaxAborted.message, data, 'filecustomerror');
	                self.cancel();
	                return true;
	            }
	            return !!self.ajaxAborted;
	        },
	        _resetFileStack: function () {
	            var self = this, i = 0;
	            self._getThumbs().each(function () {
	                var $thumb = $(this), ind = $thumb.attr('data-fileindex'), pid = $thumb.attr('id');
	                if (ind === '-1' || ind === -1) {
	                    return;
	                }
	                if (!self.fileManager.getFile($thumb.attr('data-fileid'))) {
	                    $thumb.attr({'data-fileindex': i});
	                    i++;
	                } else {
	                    $thumb.attr({'data-fileindex': '-1'});
	                }
	                self._getZoom(pid).attr({
	                    'data-fileindex': $thumb.attr('data-fileindex')
	                });
	            });
	        },
	        _isFileSelectionValid: function (cnt) {
	            var self = this;
	            cnt = cnt || 0;
	            if (self.required && !self.getFilesCount()) {
	                self.$errorContainer.html('');
	                self._showFileError(self.msgFileRequired);
	                return false;
	            }
	            if (self.minFileCount > 0 && self._getFileCount(cnt) < self.minFileCount) {
	                self._noFilesError({});
	                return false;
	            }
	            return true;
	        },
	        _canPreview: function (file) {
	            var self = this;
	            if (!file || !self.showPreview || !self.$preview || !self.$preview.length) {
	                return false;
	            }
	            var name = file.name || '', type = file.type || '', size = (file.size || 0) / 1000,
	                cat = self._parseFileType(type, name), allowedTypes, allowedMimes, allowedExts, skipPreview,
	                types = self.allowedPreviewTypes, mimes = self.allowedPreviewMimeTypes,
	                exts = self.allowedPreviewExtensions || [], dTypes = self.disabledPreviewTypes,
	                dMimes = self.disabledPreviewMimeTypes, dExts = self.disabledPreviewExtensions || [],
	                maxSize = self.maxFilePreviewSize && parseFloat(self.maxFilePreviewSize) || 0,
	                expAllExt = new RegExp('\\.(' + exts.join('|') + ')$', 'i'),
	                expDisExt = new RegExp('\\.(' + dExts.join('|') + ')$', 'i');
	            allowedTypes = !types || types.indexOf(cat) !== -1;
	            allowedMimes = !mimes || mimes.indexOf(type) !== -1;
	            allowedExts = !exts.length || $h.compare(name, expAllExt);
	            skipPreview = (dTypes && dTypes.indexOf(cat) !== -1) || (dMimes && dMimes.indexOf(type) !== -1) ||
	                (dExts.length && $h.compare(name, expDisExt)) || (maxSize && !isNaN(maxSize) && size > maxSize);
	            return !skipPreview && (allowedTypes || allowedMimes || allowedExts);
	        },
	        addToStack: function (file, id) {
	            this.fileManager.add(file, id);
	        },
	        clearFileStack: function () {
	            var self = this;
	            self.fileManager.clear();
	            self._initResumableUpload();
	            if (self.enableResumableUpload) {
	                if (self.showPause === null) {
	                    self.showPause = true;
	                }
	                if (self.showCancel === null) {
	                    self.showCancel = false;
	                }
	            } else {
	                self.showPause = false;
	                if (self.showCancel === null) {
	                    self.showCancel = true;
	                }
	            }
	            return self.$element;
	        },
	        getFileStack: function () {
	            return this.fileManager.stack;
	        },
	        getFileList: function () {
	            return this.fileManager.list();
	        },
	        getFilesCount: function (includeInitial) {
	            var self = this, len = self.isAjaxUpload ? self.fileManager.count() : self._inputFileCount();
	            if (includeInitial) {
	                len += self.previewCache.count(true);
	            }
	            return self._getFileCount(len);
	        },
	        readFiles: function (files) {
	            this.reader = new FileReader();
	            var self = this, reader = self.reader, $container = self.$previewContainer,
	                $status = self.$previewStatus, msgLoading = self.msgLoading, msgProgress = self.msgProgress,
	                previewInitId = self.previewInitId, numFiles = files.length, settings = self.fileTypeSettings,
	                readFile, fileTypes = self.allowedFileTypes, typLen = fileTypes ? fileTypes.length : 0,
	                fileExt = self.allowedFileExtensions, strExt = $h.isEmpty(fileExt) ? '' : fileExt.join(', '),
	                throwError = function (msg, file, previewId, index, fileId) {
	                    var $thumb, p1 = $.extend(true, {}, self._getOutData(null, {}, {}, files),
	                        {id: previewId, index: index, fileId: fileId}),
	                        p2 = {id: previewId, index: index, fileId: fileId, file: file, files: files};
	                    self._previewDefault(file, true);
	                    $thumb = self._getFrame(previewId, true);
	                    if (self.isAjaxUpload) {
	                        setTimeout(function () {
	                            readFile(index + 1);
	                        }, self.processDelay);
	                    } else {
	                        self.unlock();
	                        numFiles = 0;
	                    }
	                    if (self.removeFromPreviewOnError && $thumb.length) {
	                        $thumb.remove();
	                    } else {
	                        self._initFileActions();
	                        $thumb.find('.kv-file-upload').remove();
	                    }
	                    self.isPersistentError = true;
	                    self.isError = self.isAjaxUpload ? self._showFileError(msg, p1) : self._showError(msg, p2);
	                    self._updateFileDetails(numFiles);
	                };
	            self.fileManager.clearImages();
	            $.each(files, function (key, file) {
	                var func = self.fileTypeSettings.image;
	                if (func && func(file.type)) {
	                    self.fileManager.totalImages++;
	                }
	            });
	            readFile = function (i) {
	                var $error = self.$errorContainer, errors, fm = self.fileManager;
	                if (i >= numFiles) {
	                    self.unlock();
	                    if (self.duplicateErrors.length) {
	                        errors = '<li>' + self.duplicateErrors.join('</li><li>') + '</li>';
	                        if ($error.find('ul').length === 0) {
	                            $h.setHtml($error, self.errorCloseButton + '<ul>' + errors + '</ul>');
	                        } else {
	                            $error.find('ul').append(errors);
	                        }
	                        $error.fadeIn(self.fadeDelay);
	                        self._handler($error.find('.kv-error-close'), 'click', function () {
	                            $error.fadeOut(self.fadeDelay);
	                        });
	                        self.duplicateErrors = [];
	                    }
	                    if (self.isAjaxUpload) {
	                        self._raise('filebatchselected', [fm.stack]);
	                        if (fm.count() === 0 && !self.isError) {
	                            self.reset();
	                        }
	                    } else {
	                        self._raise('filebatchselected', [files]);
	                    }
	                    $container.removeClass('file-thumb-loading');
	                    $status.html('');
	                    return;
	                }
	                self.lock(true);
	                var file = files[i], previewId = previewInitId + '-' + self._getFileId(file), fSizeKB, j, msg,
	                    fnText = settings.text, fnImage = settings.image, fnHtml = settings.html, typ, chk, typ1, typ2,
	                    caption = self._getFileName(file, ''), fileSize = (file && file.size || 0) / 1000,
	                    fileExtExpr = '', previewData = $h.createObjectURL(file), fileCount = 0,
	                    strTypes = '', fileId, canLoad, fileReaderAborted = false,
	                    func, knownTypes = 0, isText, isHtml, isImage, txtFlag, processFileLoaded = function () {
	                        var msg = msgProgress.setTokens({
	                            'index': i + 1,
	                            'files': numFiles,
	                            'percent': 50,
	                            'name': caption
	                        });
	                        setTimeout(function () {
	                            $status.html(msg);
	                            self._updateFileDetails(numFiles);
	                            readFile(i + 1);
	                        }, self.processDelay);
	                        if (self._raise('fileloaded', [file, previewId, i, reader]) && self.isAjaxUpload) {
	                            fm.add(file);
	                        }
	                    };
	                if (!file) {
	                    return;
	                }
	                fileId = fm.getId(file);
	                if (typLen > 0) {
	                    for (j = 0; j < typLen; j++) {
	                        typ1 = fileTypes[j];
	                        typ2 = self.msgFileTypes[typ1] || typ1;
	                        strTypes += j === 0 ? typ2 : ', ' + typ2;
	                    }
	                }
	                if (caption === false) {
	                    readFile(i + 1);
	                    return;
	                }
	                if (caption.length === 0) {
	                    msg = self.msgInvalidFileName.replace('{name}', $h.htmlEncode($h.getFileName(file), '[unknown]'));
	                    throwError(msg, file, previewId, i, fileId);
	                    return;
	                }
	                if (!$h.isEmpty(fileExt)) {
	                    fileExtExpr = new RegExp('\\.(' + fileExt.join('|') + ')$', 'i');
	                }
	                fSizeKB = fileSize.toFixed(2);
	                if (self.isAjaxUpload && fm.exists(fileId) || self._getFrame(previewId, true).length) {
	                    var p2 = {id: previewId, index: i, fileId: fileId, file: file, files: files};
	                    msg = self.msgDuplicateFile.setTokens({name: caption, size: fSizeKB});
	                    if (self.isAjaxUpload) {
	                        self.duplicateErrors.push(msg);
	                        self.isDuplicateError = true;
	                        self._raise('fileduplicateerror', [file, fileId, caption, fSizeKB, previewId, i]);
	                        readFile(i + 1);
	                        self._updateFileDetails(numFiles);
	                    } else {
	                        self._showError(msg, p2);
	                        self.unlock();
	                        numFiles = 0;
	                        self._clearFileInput();
	                        self.reset();
	                        self._updateFileDetails(numFiles);
	                    }
	                    return;
	                }
	                if (self.maxFileSize > 0 && fileSize > self.maxFileSize) {
	                    msg = self.msgSizeTooLarge.setTokens({
	                        'name': caption,
	                        'size': fSizeKB,
	                        'maxSize': self.maxFileSize
	                    });
	                    throwError(msg, file, previewId, i, fileId);
	                    return;
	                }
	                if (self.minFileSize !== null && fileSize <= $h.getNum(self.minFileSize)) {
	                    msg = self.msgSizeTooSmall.setTokens({
	                        'name': caption,
	                        'size': fSizeKB,
	                        'minSize': self.minFileSize
	                    });
	                    throwError(msg, file, previewId, i, fileId);
	                    return;
	                }
	                if (!$h.isEmpty(fileTypes) && $h.isArray(fileTypes)) {
	                    for (j = 0; j < fileTypes.length; j += 1) {
	                        typ = fileTypes[j];
	                        func = settings[typ];
	                        fileCount += !func || (typeof func !== 'function') ? 0 : (func(file.type,
	                            $h.getFileName(file)) ? 1 : 0);
	                    }
	                    if (fileCount === 0) {
	                        msg = self.msgInvalidFileType.setTokens({name: caption, types: strTypes});
	                        throwError(msg, file, previewId, i, fileId);
	                        return;
	                    }
	                }
	                if (fileCount === 0 && !$h.isEmpty(fileExt) && $h.isArray(fileExt) && !$h.isEmpty(fileExtExpr)) {
	                    chk = $h.compare(caption, fileExtExpr);
	                    fileCount += $h.isEmpty(chk) ? 0 : chk.length;
	                    if (fileCount === 0) {
	                        msg = self.msgInvalidFileExtension.setTokens({name: caption, extensions: strExt});
	                        throwError(msg, file, previewId, i, fileId);
	                        return;
	                    }
	                }
	                if (!self._canPreview(file)) {
	                    canLoad = self.isAjaxUpload && self._raise('filebeforeload', [file, i, reader]);
	                    if (self.isAjaxUpload && canLoad) {
	                        fm.add(file);
	                    }
	                    if (self.showPreview && canLoad) {
	                        $container.addClass('file-thumb-loading');
	                        self._previewDefault(file);
	                        self._initFileActions();
	                    }
	                    setTimeout(function () {
	                        if (canLoad) {
	                            self._updateFileDetails(numFiles);
	                        }
	                        readFile(i + 1);
	                        self._raise('fileloaded', [file, previewId, i]);
	                    }, 10);
	                    return;
	                }
	                isText = fnText(file.type, caption);
	                isHtml = fnHtml(file.type, caption);
	                isImage = fnImage(file.type, caption);
	                $status.html(msgLoading.replace('{index}', i + 1).replace('{files}', numFiles));
	                $container.addClass('file-thumb-loading');
	                reader.onerror = function (evt) {
	                    self._errorHandler(evt, caption);
	                };
	                reader.onload = function (theFile) {
	                    var hex, fileInfo, uint, byte, bytes = [], contents, mime, readTextImage = function (textFlag) {
	                        var newReader = new FileReader();
	                        newReader.onerror = function (theFileNew) {
	                            self._errorHandler(theFileNew, caption);
	                        };
	                        newReader.onload = function (theFileNew) {
	                            if (self.isAjaxUpload && !self._raise('filebeforeload', [file, i, reader])) {
	                                fileReaderAborted = true;
	                                self._resetCaption();
	                                reader.abort();
	                                $status.html('');
	                                $container.removeClass('file-thumb-loading');
	                                self.enable();
	                                return;
	                            }
	                            self._previewFile(i, file, theFileNew, previewData, fileInfo);
	                            self._initFileActions();
	                            processFileLoaded();
	                        };
	                        if (textFlag) {
	                            newReader.readAsText(file, self.textEncoding);
	                        } else {
	                            newReader.readAsDataURL(file);
	                        }
	                    };
	                    fileInfo = {'name': caption, 'type': file.type};
	                    $.each(settings, function (k, f) {
	                        if (k !== 'object' && k !== 'other' && typeof f === 'function' && f(file.type, caption)) {
	                            knownTypes++;
	                        }
	                    });
	                    if (knownTypes === 0) { // auto detect mime types from content if no known file types detected
	                        uint = new Uint8Array(theFile.target.result);
	                        for (j = 0; j < uint.length; j++) {
	                            byte = uint[j].toString(16);
	                            bytes.push(byte);
	                        }
	                        hex = bytes.join('').toLowerCase().substring(0, 8);
	                        mime = $h.getMimeType(hex, '', '');
	                        if ($h.isEmpty(mime)) { // look for ascii text content
	                            contents = $h.arrayBuffer2String(reader.result);
	                            mime = $h.isSvg(contents) ? 'image/svg+xml' : $h.getMimeType(hex, contents, file.type);
	                        }
	                        fileInfo = {'name': caption, 'type': mime};
	                        isText = fnText(mime, '');
	                        isHtml = fnHtml(mime, '');
	                        isImage = fnImage(mime, '');
	                        txtFlag = isText || isHtml;
	                        if (txtFlag || isImage) {
	                            readTextImage(txtFlag);
	                            return;
	                        }
	                    }
	                    if (self.isAjaxUpload && !self._raise('filebeforeload', [file, i, reader])) {
	                        fileReaderAborted = true;
	                        self._resetCaption();
	                        reader.abort();
	                        $status.html('');
	                        $container.removeClass('file-thumb-loading');
	                        self.enable();
	                        return;
	                    }
	                    self._previewFile(i, file, theFile, previewData, fileInfo);
	                    self._initFileActions();
	                    processFileLoaded();
	                };
	                reader.onprogress = function (data) {
	                    if (data.lengthComputable) {
	                        var fact = (data.loaded / data.total) * 100, progress = Math.ceil(fact);
	                        msg = msgProgress.setTokens({
	                            'index': i + 1,
	                            'files': numFiles,
	                            'percent': progress,
	                            'name': caption
	                        });
	                        setTimeout(function () {
	                            if (!fileReaderAborted) {
	                                $status.html(msg);
	                            }
	                        }, self.processDelay);
	                    }
	                };
	                if (isText || isHtml) {
	                    reader.readAsText(file, self.textEncoding);
	                } else {
	                    if (isImage) {
	                        reader.readAsDataURL(file);
	                    } else {
	                        reader.readAsArrayBuffer(file);
	                    }
	                }
	            };

	            readFile(0);
	            self._updateFileDetails(numFiles, true);
	        },
	        lock: function (selectMode) {
	            var self = this, $container = self.$container;
	            self._resetErrors();
	            self.disable();
	            if (!selectMode && self.showCancel) {
	                $container.find('.fileinput-cancel').show();
	            }
	            if (!selectMode && self.showPause) {
	                $container.find('.fileinput-pause').show();
	            }
	            self._raise('filelock', [self.fileManager.stack, self._getExtraData()]);
	            return self.$element;
	        },
	        unlock: function (reset) {
	            var self = this, $container = self.$container;
	            if (reset === undefined) {
	                reset = true;
	            }
	            self.enable();
	            $container.removeClass('is-locked');
	            if (self.showCancel) {
	                $container.find('.fileinput-cancel').hide();
	            }
	            if (self.showPause) {
	                $container.find('.fileinput-pause').hide();
	            }
	            if (reset) {
	                self._resetFileStack();
	            }
	            self._raise('fileunlock', [self.fileManager.stack, self._getExtraData()]);
	            return self.$element;
	        },
	        resume: function () {
	            var self = this, flag = false, rm = self.resumableManager;
	            if (!self.enableResumableUpload) {
	                return self.$element;
	            }
	            if (self.paused) {
	                self._toggleResumableProgress(self.progressPauseTemplate, self.msgUploadResume);
	            } else {
	                flag = true;
	            }
	            self.paused = false;
	            if (flag) {
	                self._toggleResumableProgress(self.progressInfoTemplate, self.msgUploadBegin);
	            }
	            setTimeout(function () {
	                rm.upload();
	            }, self.processDelay);
	            return self.$element;
	        },
	        pause: function () {
	            var self = this, rm = self.resumableManager, xhr = self.ajaxRequests, len = xhr.length, i,
	                pct = rm.getProgress(), actions = self.fileActionSettings, tm = self.taskManager,
	                pool = tm.getPool(rm.id);
	            if (!self.enableResumableUpload) {
	                return self.$element;
	            } else {
	                if (pool) {
	                    pool.cancel();
	                }
	            }
	            self._raise('fileuploadpaused', [self.fileManager, rm]);
	            if (len > 0) {
	                for (i = 0; i < len; i += 1) {
	                    self.paused = true;
	                    xhr[i].abort();
	                }
	            }
	            if (self.showPreview) {
	                self._getThumbs().each(function () {
	                    var $thumb = $(this), fileId = $thumb.attr('data-fileid'), t = self._getLayoutTemplate('stats'),
	                        stats, $indicator = $thumb.find('.file-upload-indicator');
	                    $thumb.removeClass('file-uploading');
	                    if ($indicator.attr('title') === actions.indicatorLoadingTitle) {
	                        self._setThumbStatus($thumb, 'Paused');
	                        stats = t.setTokens({pendingTime: self.msgPaused, uploadSpeed: ''});
	                        self.paused = true;
	                        self._setProgress(pct, $thumb.find('.file-thumb-progress'), pct + '%', stats);
	                    }
	                    if (!self.fileManager.getFile(fileId)) {
	                        $thumb.find('.kv-file-remove').removeClass('disabled').removeAttr('disabled');
	                    }
	                });
	            }
	            self._setProgress(101, self.$progress, self.msgPaused);
	            return self.$element;
	        },
	        cancel: function () {
	            var self = this, xhr = self.ajaxRequests,
	                rm = self.resumableManager, tm = self.taskManager,
	                pool = rm ? tm.getPool(rm.id) : undefined, len = xhr.length, i;

	            if (self.enableResumableUpload && pool) {
	                pool.cancel().done(function () {
	                    self._setProgressCancelled();
	                });
	                rm.reset();
	                self._raise('fileuploadcancelled', [self.fileManager, rm]);
	            } else {
	                self._raise('fileuploadcancelled', [self.fileManager]);
	            }
	            self._initAjax();
	            if (len > 0) {
	                for (i = 0; i < len; i += 1) {
	                    self.cancelling = true;
	                    xhr[i].abort();
	                }
	            }
	            self._getThumbs().each(function () {
	                var $thumb = $(this), fileId = $thumb.attr('data-fileid'), $prog = $thumb.find('.file-thumb-progress');
	                $thumb.removeClass('file-uploading');
	                self._setProgress(0, $prog);
	                $prog.hide();
	                if (!self.fileManager.getFile(fileId)) {
	                    $thumb.find('.kv-file-upload').removeClass('disabled').removeAttr('disabled');
	                    $thumb.find('.kv-file-remove').removeClass('disabled').removeAttr('disabled');
	                }
	                self.unlock();
	            });
	            setTimeout(function () {
	                self._setProgressCancelled();
	            }, self.processDelay);
	            return self.$element;
	        },
	        clear: function () {
	            var self = this, cap;
	            if (!self._raise('fileclear')) {
	                return;
	            }
	            self.$btnUpload.removeAttr('disabled');
	            self._getThumbs().find('video,audio,img').each(function () {
	                $h.cleanMemory($(this));
	            });
	            self._clearFileInput();
	            self._resetUpload();
	            self.clearFileStack();
	            self.isDuplicateError = false;
	            self.isPersistentError = false;
	            self._resetErrors(true);
	            if (self._hasInitialPreview()) {
	                self._showFileIcon();
	                self._resetPreview();
	                self._initPreviewActions();
	                self.$container.removeClass('file-input-new');
	            } else {
	                self._getThumbs().each(function () {
	                    self._clearObjects($(this));
	                });
	                if (self.isAjaxUpload) {
	                    self.previewCache.data = {};
	                }
	                self.$preview.html('');
	                cap = (!self.overwriteInitial && self.initialCaption.length > 0) ? self.initialCaption : '';
	                self.$caption.attr('title', '').val(cap);
	                $h.addCss(self.$container, 'file-input-new');
	                self._validateDefaultPreview();
	            }
	            if (self.$container.find($h.FRAMES).length === 0) {
	                if (!self._initCaption()) {
	                    self.$captionContainer.removeClass('icon-visible');
	                }
	            }
	            self._hideFileIcon();
	            if (self.focusCaptionOnClear) {
	                self.$captionContainer.focus();
	            }
	            self._setFileDropZoneTitle();
	            self._raise('filecleared');
	            return self.$element;
	        },
	        reset: function () {
	            var self = this;
	            if (!self._raise('filereset')) {
	                return;
	            }
	            self.lastProgress = 0;
	            self._resetPreview();
	            self.$container.find('.fileinput-filename').text('');
	            $h.addCss(self.$container, 'file-input-new');
	            if (self.getFrames().length) {
	                self.$container.removeClass('file-input-new');
	            }
	            self.clearFileStack();
	            self._setFileDropZoneTitle();
	            return self.$element;
	        },
	        disable: function () {
	            var self = this, $container = self.$container;
	            self.isDisabled = true;
	            self._raise('filedisabled');
	            self.$element.attr('disabled', 'disabled');
	            $container.addClass('is-locked');
	            $h.addCss($container.find('.btn-file'), 'disabled');
	            $container.find('.kv-fileinput-caption').addClass('file-caption-disabled');
	            $container.find('.fileinput-remove, .fileinput-upload, .file-preview-frame button')
	                .attr('disabled', true);
	            self._initDragDrop();
	            return self.$element;
	        },
	        enable: function () {
	            var self = this, $container = self.$container;
	            self.isDisabled = false;
	            self._raise('fileenabled');
	            self.$element.removeAttr('disabled');
	            $container.removeClass('is-locked');
	            $container.find('.kv-fileinput-caption').removeClass('file-caption-disabled');
	            $container.find('.fileinput-remove, .fileinput-upload, .file-preview-frame button')
	                .removeAttr('disabled');
	            $container.find('.btn-file').removeClass('disabled');
	            self._initDragDrop();
	            return self.$element;
	        },
	        upload: function () {
	            var self = this, fm = self.fileManager, totLen = fm.count(), i, outData,
	                hasExtraData = !$.isEmptyObject(self._getExtraData());
	            if (!self.isAjaxUpload || self.isDisabled || !self._isFileSelectionValid(totLen)) {
	                return;
	            }
	            self.lastProgress = 0;
	            self._resetUpload();
	            if (totLen === 0 && !hasExtraData) {
	                self._showFileError(self.msgUploadEmpty);
	                return;
	            }
	            self.cancelling = false;
	            self._showProgress();
	            self.lock();
	            if (totLen === 0 && hasExtraData) {
	                self._setProgress(2);
	                self._uploadExtraOnly();
	                return;
	            }
	            if (self.enableResumableUpload) {
	                return self.resume();
	            }
	            if (self.uploadAsync || self.enableResumableUpload) {
	                outData = self._getOutData(null);
	                self._raise('filebatchpreupload', [outData]);
	                self.fileBatchCompleted = false;
	                self.uploadCache = [];
	                $.each(self.getFileStack(), function (id) {
	                    var previewId = self._getThumbId(id);
	                    self.uploadCache.push({id: previewId, content: null, config: null, tags: null, append: true});
	                });
	                self.$preview.find('.file-preview-initial').removeClass($h.SORT_CSS);
	                self._initSortable();
	            }
	            self._setProgress(2);
	            self.hasInitData = false;
	            if (self.uploadAsync) {
	                i = 0;
	                $.each(fm.stack, function (id) {
	                    self._uploadSingle(i, id, true);
	                    i++;
	                });
	                return;
	            }
	            self._uploadBatch();
	            return self.$element;
	        },
	        destroy: function () {
	            var self = this, $form = self.$form, $cont = self.$container, $el = self.$element, ns = self.namespace;
	            $(document).off(ns);
	            $(window).off(ns);
	            if ($form && $form.length) {
	                $form.off(ns);
	            }
	            if (self.isAjaxUpload) {
	                self._clearFileInput();
	            }
	            self._cleanup();
	            self._initPreviewCache();
	            $el.insertBefore($cont).off(ns).removeData();
	            $cont.off().remove();
	            return $el;
	        },
	        refresh: function (options) {
	            var self = this, $el = self.$element;
	            if (typeof options !== 'object' || $h.isEmpty(options)) {
	                options = self.options;
	            } else {
	                options = $.extend(true, {}, self.options, options);
	            }
	            self._init(options, true);
	            self._listen();
	            return $el;
	        },
	        zoom: function (frameId) {
	            var self = this, $frame = self._getFrame(frameId);
	            self._showModal($frame);
	        },
	        getExif: function (frameId) {
	            var self = this, $frame = self._getFrame(frameId);
	            return $frame && $frame.data('exif') || null;
	        },
	        getFrames: function (cssFilter) {
	            var self = this, $frames;
	            cssFilter = cssFilter || '';
	            $frames = self.$preview.find($h.FRAMES + cssFilter);
	            if (self.reversePreviewOrder) {
	                $frames = $($frames.get().reverse());
	            }
	            return $frames;
	        },
	        getPreview: function () {
	            var self = this;
	            return {
	                content: self.initialPreview,
	                config: self.initialPreviewConfig,
	                tags: self.initialPreviewThumbTags
	            };
	        }
	    };

	    $.fn.fileinput = function (option) {
	        if (!$h.hasFileAPISupport() && !$h.isIE(9)) {
	            return;
	        }
	        var args = Array.apply(null, arguments), retvals = [];
	        args.shift();
	        this.each(function () {
	            var self = $(this), data = self.data('fileinput'), options = typeof option === 'object' && option,
	                theme = options.theme || self.data('theme'), l = {}, t = {},
	                lang = options.language || self.data('language') || $.fn.fileinput.defaults.language || 'en', opt;
	            if (!data) {
	                if (theme) {
	                    t = $.fn.fileinputThemes[theme] || {};
	                }
	                if (lang !== 'en' && !$h.isEmpty($.fn.fileinputLocales[lang])) {
	                    l = $.fn.fileinputLocales[lang] || {};
	                }
	                opt = $.extend(true, {}, $.fn.fileinput.defaults, t, $.fn.fileinputLocales.en, l, options, self.data());
	                data = new FileInput(this, opt);
	                self.data('fileinput', data);
	            }

	            if (typeof option === 'string') {
	                retvals.push(data[option].apply(data, args));
	            }
	        });
	        switch (retvals.length) {
	            case 0:
	                return this;
	            case 1:
	                return retvals[0];
	            default:
	                return retvals;
	        }
	    };

	    var IFRAME_ATTRIBS = 'class="kv-preview-data file-preview-pdf" src="{renderer}?file={data}" {style}';

	    $.fn.fileinput.defaults = {
	        language: 'en',
	        showCaption: true,
	        showBrowse: true,
	        showPreview: true,
	        showRemove: true,
	        showUpload: true,
	        showUploadStats: true,
	        showCancel: null,
	        showPause: null,
	        showClose: true,
	        showUploadedThumbs: true,
	        showConsoleLogs: false,
	        browseOnZoneClick: false,
	        autoReplace: false,
	        autoOrientImage: function () { // applicable for JPEG images only and non ios safari
	            var ua = window.navigator.userAgent, webkit = !!ua.match(/WebKit/i),
	                iOS = !!ua.match(/iP(od|ad|hone)/i), iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
	            return !iOSSafari;
	        },
	        autoOrientImageInitial: true,
	        required: false,
	        rtl: false,
	        hideThumbnailContent: false,
	        encodeUrl: true,
	        focusCaptionOnBrowse: true,
	        focusCaptionOnClear: true,
	        generateFileId: null,
	        previewClass: '',
	        captionClass: '',
	        frameClass: 'krajee-default',
	        mainClass: 'file-caption-main',
	        mainTemplate: null,
	        purifyHtml: true,
	        fileSizeGetter: null,
	        initialCaption: '',
	        initialPreview: [],
	        initialPreviewDelimiter: '*$$*',
	        initialPreviewAsData: false,
	        initialPreviewFileType: 'image',
	        initialPreviewConfig: [],
	        initialPreviewThumbTags: [],
	        previewThumbTags: {},
	        initialPreviewShowDelete: true,
	        initialPreviewDownloadUrl: '',
	        removeFromPreviewOnError: false,
	        deleteUrl: '',
	        deleteExtraData: {},
	        overwriteInitial: true,
	        sanitizeZoomCache: function (content) {
	            var $container = $h.createElement(content);
	            $container.find('input,textarea,select,datalist,form,.file-thumbnail-footer').remove();
	            return $container.html();
	        },
	        previewZoomButtonIcons: {
	            prev: '<i class="glyphicon glyphicon-triangle-left"></i>',
	            next: '<i class="glyphicon glyphicon-triangle-right"></i>',
	            toggleheader: '<i class="glyphicon glyphicon-resize-vertical"></i>',
	            fullscreen: '<i class="glyphicon glyphicon-fullscreen"></i>',
	            borderless: '<i class="glyphicon glyphicon-resize-full"></i>',
	            close: '<i class="glyphicon glyphicon-remove"></i>'
	        },
	        previewZoomButtonClasses: {
	            prev: 'btn btn-navigate',
	            next: 'btn btn-navigate',
	            toggleheader: 'btn btn-sm btn-kv btn-default btn-outline-secondary',
	            fullscreen: 'btn btn-sm btn-kv btn-default btn-outline-secondary',
	            borderless: 'btn btn-sm btn-kv btn-default btn-outline-secondary',
	            close: 'btn btn-sm btn-kv btn-default btn-outline-secondary'
	        },
	        previewTemplates: {},
	        previewContentTemplates: {},
	        preferIconicPreview: false,
	        preferIconicZoomPreview: false,
	        allowedFileTypes: null,
	        allowedFileExtensions: null,
	        allowedPreviewTypes: undefined,
	        allowedPreviewMimeTypes: null,
	        allowedPreviewExtensions: null,
	        disabledPreviewTypes: undefined,
	        disabledPreviewExtensions: ['msi', 'exe', 'com', 'zip', 'rar', 'app', 'vb', 'scr'],
	        disabledPreviewMimeTypes: null,
	        defaultPreviewContent: null,
	        customLayoutTags: {},
	        customPreviewTags: {},
	        previewFileIcon: '<i class="glyphicon glyphicon-file"></i>',
	        previewFileIconClass: 'file-other-icon',
	        previewFileIconSettings: {},
	        previewFileExtSettings: {},
	        buttonLabelClass: 'hidden-xs',
	        browseIcon: '<i class="glyphicon glyphicon-folder-open"></i>&nbsp;',
	        browseClass: 'btn btn-primary',
	        removeIcon: '<i class="glyphicon glyphicon-trash"></i>',
	        removeClass: 'btn btn-default btn-secondary',
	        cancelIcon: '<i class="glyphicon glyphicon-ban-circle"></i>',
	        cancelClass: 'btn btn-default btn-secondary',
	        pauseIcon: '<i class="glyphicon glyphicon-pause"></i>',
	        pauseClass: 'btn btn-default btn-secondary',
	        uploadIcon: '<i class="glyphicon glyphicon-upload"></i>',
	        uploadClass: 'btn btn-default btn-secondary',
	        uploadUrl: null,
	        uploadUrlThumb: null,
	        uploadAsync: true,
	        uploadParamNames: {
	            chunkCount: 'chunkCount',
	            chunkIndex: 'chunkIndex',
	            chunkSize: 'chunkSize',
	            chunkSizeStart: 'chunkSizeStart',
	            chunksUploaded: 'chunksUploaded',
	            fileBlob: 'fileBlob',
	            fileId: 'fileId',
	            fileName: 'fileName',
	            fileRelativePath: 'fileRelativePath',
	            fileSize: 'fileSize',
	            retryCount: 'retryCount'
	        },
	        maxAjaxThreads: 5,
	        fadeDelay: 800,
	        processDelay: 100,
	        queueDelay: 10, // must be lesser than process delay
	        progressDelay: 0, // must be lesser than process delay
	        enableResumableUpload: false,
	        resumableUploadOptions: {
	            fallback: null,
	            testUrl: null, // used for checking status of chunks/ files previously / partially uploaded
	            chunkSize: 2 * 1024, // in KB
	            maxThreads: 4,
	            maxRetries: 3,
	            showErrorLog: true
	        },
	        uploadExtraData: {},
	        zoomModalHeight: 480,
	        minImageWidth: null,
	        minImageHeight: null,
	        maxImageWidth: null,
	        maxImageHeight: null,
	        resizeImage: false,
	        resizePreference: 'width',
	        resizeQuality: 0.92,
	        resizeDefaultImageType: 'image/jpeg',
	        resizeIfSizeMoreThan: 0, // in KB
	        minFileSize: 0,
	        maxFileSize: 0,
	        maxFilePreviewSize: 25600, // 25 MB
	        minFileCount: 0,
	        maxFileCount: 0,
	        maxTotalFileCount: 0,
	        validateInitialCount: false,
	        msgValidationErrorClass: 'text-danger',
	        msgValidationErrorIcon: '<i class="glyphicon glyphicon-exclamation-sign"></i> ',
	        msgErrorClass: 'file-error-message',
	        progressThumbClass: 'progress-bar progress-bar-striped active',
	        progressClass: 'progress-bar bg-success progress-bar-success progress-bar-striped active',
	        progressInfoClass: 'progress-bar bg-info progress-bar-info progress-bar-striped active',
	        progressCompleteClass: 'progress-bar bg-success progress-bar-success',
	        progressPauseClass: 'progress-bar bg-primary progress-bar-primary progress-bar-striped active',
	        progressErrorClass: 'progress-bar bg-danger progress-bar-danger',
	        progressUploadThreshold: 99,
	        previewFileType: 'image',
	        elCaptionContainer: null,
	        elCaptionText: null,
	        elPreviewContainer: null,
	        elPreviewImage: null,
	        elPreviewStatus: null,
	        elErrorContainer: null,
	        errorCloseButton: $h.closeButton('kv-error-close'),
	        slugCallback: null,
	        dropZoneEnabled: true,
	        dropZoneTitleClass: 'file-drop-zone-title',
	        fileActionSettings: {},
	        otherActionButtons: '',
	        textEncoding: 'UTF-8',
	        ajaxSettings: {},
	        ajaxDeleteSettings: {},
	        showAjaxErrorDetails: true,
	        mergeAjaxCallbacks: false,
	        mergeAjaxDeleteCallbacks: false,
	        retryErrorUploads: true,
	        reversePreviewOrder: false,
	        usePdfRenderer: function () {
	            var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
	            return !!navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/i) || isIE11;
	        },
	        pdfRendererUrl: '',
	        pdfRendererTemplate: '<iframe ' + IFRAME_ATTRIBS + '></iframe>'
	    };

	    // noinspection HtmlUnknownAttribute
	    $.fn.fileinputLocales.en = {
	        fileSingle: 'file',
	        filePlural: 'files',
	        browseLabel: 'Browse &hellip;',
	        removeLabel: 'Remove',
	        removeTitle: 'Clear all unprocessed files',
	        cancelLabel: 'Cancel',
	        cancelTitle: 'Abort ongoing upload',
	        pauseLabel: 'Pause',
	        pauseTitle: 'Pause ongoing upload',
	        uploadLabel: 'Upload',
	        uploadTitle: 'Upload selected files',
	        msgNo: 'No',
	        msgNoFilesSelected: 'No files selected',
	        msgCancelled: 'Cancelled',
	        msgPaused: 'Paused',
	        msgPlaceholder: 'Select {files} ...',
	        msgZoomModalHeading: 'Detailed Preview',
	        msgFileRequired: 'You must select a file to upload.',
	        msgSizeTooSmall: 'File "{name}" (<b>{size} KB</b>) is too small and must be larger than <b>{minSize} KB</b>.',
	        msgSizeTooLarge: 'File "{name}" (<b>{size} KB</b>) exceeds maximum allowed upload size of <b>{maxSize} KB</b>.',
	        msgFilesTooLess: 'You must select at least <b>{n}</b> {files} to upload.',
	        msgFilesTooMany: 'Number of files selected for upload <b>({n})</b> exceeds maximum allowed limit of <b>{m}</b>.',
	        msgTotalFilesTooMany: 'You can upload a maximum of <b>{m}</b> files (<b>{n}</b> files detected).',
	        msgFileNotFound: 'File "{name}" not found!',
	        msgFileSecured: 'Security restrictions prevent reading the file "{name}".',
	        msgFileNotReadable: 'File "{name}" is not readable.',
	        msgFilePreviewAborted: 'File preview aborted for "{name}".',
	        msgFilePreviewError: 'An error occurred while reading the file "{name}".',
	        msgInvalidFileName: 'Invalid or unsupported characters in file name "{name}".',
	        msgInvalidFileType: 'Invalid type for file "{name}". Only "{types}" files are supported.',
	        msgInvalidFileExtension: 'Invalid extension for file "{name}". Only "{extensions}" files are supported.',
	        msgFileTypes: {
	            'image': 'image',
	            'html': 'HTML',
	            'text': 'text',
	            'video': 'video',
	            'audio': 'audio',
	            'flash': 'flash',
	            'pdf': 'PDF',
	            'object': 'object'
	        },
	        msgUploadAborted: 'The file upload was aborted',
	        msgUploadThreshold: 'Processing &hellip;',
	        msgUploadBegin: 'Initializing &hellip;',
	        msgUploadEnd: 'Done',
	        msgUploadResume: 'Resuming upload &hellip;',
	        msgUploadEmpty: 'No valid data available for upload.',
	        msgUploadError: 'Upload Error',
	        msgDeleteError: 'Delete Error',
	        msgProgressError: 'Error',
	        msgValidationError: 'Validation Error',
	        msgLoading: 'Loading file {index} of {files} &hellip;',
	        msgProgress: 'Loading file {index} of {files} - {name} - {percent}% completed.',
	        msgSelected: '{n} {files} selected',
	        msgFoldersNotAllowed: 'Drag & drop files only! {n} folder(s) dropped were skipped.',
	        msgImageWidthSmall: 'Width of image file "{name}" must be at least {size} px.',
	        msgImageHeightSmall: 'Height of image file "{name}" must be at least {size} px.',
	        msgImageWidthLarge: 'Width of image file "{name}" cannot exceed {size} px.',
	        msgImageHeightLarge: 'Height of image file "{name}" cannot exceed {size} px.',
	        msgImageResizeError: 'Could not get the image dimensions to resize.',
	        msgImageResizeException: 'Error while resizing the image.<pre>{errors}</pre>',
	        msgAjaxError: 'Something went wrong with the {operation} operation. Please try again later!',
	        msgAjaxProgressError: '{operation} failed',
	        msgDuplicateFile: 'File "{name}" of same size "{size} KB" has already been selected earlier. Skipping duplicate selection.',
	        msgResumableUploadRetriesExceeded: 'Upload aborted beyond <b>{max}</b> retries for file <b>{file}</b>! Error Details: <pre>{error}</pre>',
	        msgPendingTime: '{time} remaining',
	        msgCalculatingTime: 'calculating time remaining',
	        ajaxOperations: {
	            deleteThumb: 'file delete',
	            uploadThumb: 'file upload',
	            uploadBatch: 'batch file upload',
	            uploadExtra: 'form data upload'
	        },
	        dropZoneTitle: 'Drag & drop files here &hellip;',
	        dropZoneClickTitle: '<br>(or click to select {files})',
	        previewZoomButtonTitles: {
	            prev: 'View previous file',
	            next: 'View next file',
	            toggleheader: 'Toggle header',
	            fullscreen: 'Toggle full screen',
	            borderless: 'Toggle borderless mode',
	            close: 'Close detailed preview'
	        }
	    };

	    $.fn.fileinput.Constructor = FileInput;

	    /**
	     * Convert automatically file inputs with class 'file' into a bootstrap fileinput control.
	     */
	    $(document).ready(function () {
	        var $input = $('input.file[type=file]');
	        if ($input.length) {
	            $input.fileinput();
	        }
	    });
	}));
	});

	/*!
	 * FileInput Persian Translations
	 *
	 * This file must be loaded after 'fileinput.js'. Patterns in braces '{}', or
	 * any HTML markup tags in the messages must not be converted or translated.
	 *
	 * @see http://github.com/kartik-v/bootstrap-fileinput
	 * @author Milad Nekofar <milad@nekofar.com>
	 *
	 * NOTE: this file must be saved in UTF-8 encoding.
	 */
	(function ($) {

	    $.fn.fileinputLocales['fa'] = {
	        fileSingle: 'فایل',
	        filePlural: 'فایل‌ها',
	        browseLabel: 'مرور &hellip;',
	        removeLabel: 'حذف',
	        removeTitle: 'پاکسازی فایل‌های انتخاب شده',
	        cancelLabel: 'لغو',
	        cancelTitle: 'لغو بارگزاری جاری',
	        pauseLabel: 'Pause',
	        pauseTitle: 'Pause ongoing upload',
	        uploadLabel: 'بارگذاری',
	        uploadTitle: 'بارگذاری فایل‌های انتخاب شده',
	        msgNo: 'نه',
	        msgNoFilesSelected: 'هیچ فایلی انتخاب نشده است',
	        msgPaused: 'Paused',
	        msgCancelled: 'لغو شد',
	        msgPlaceholder: 'انتخاب {files} ...',
	        msgZoomModalHeading: 'نمایش با جزییات',
	        msgFileRequired: 'شما باید یک فایل برای بارگذاری انتخاب نمایید.',
	        msgSizeTooSmall: 'فایل "{name}" (<b>{size} کیلوبایت</b>) خیلی کوچک است و باید از <b>{minSize} کیلوبایت بزرگتر باشد</b>.',
	        msgSizeTooLarge: 'فایل "{name}" (<b>{size} کیلوبایت</b>) از حداکثر مجاز <b>{maxSize} کیلوبایت</b> بزرگتر است.',
	        msgFilesTooLess: 'شما باید حداقل <b>{n}</b> {files} فایل برای بارگذاری انتخاب کنید.',
	        msgFilesTooMany: 'تعداد فایل‌های انتخاب شده برای بارگذاری <b>({n})</b> از حداکثر مجاز عبور کرده است <b>{m}</b>.',
	        msgTotalFilesTooMany: 'You can upload a maximum of <b>{m}</b> files (<b>{n}</b> files detected).',
	        msgFileNotFound: 'فایل "{name}" یافت نشد!',
	        msgFileSecured: 'محدودیت های امنیتی مانع خواندن فایل "{name}" است.',
	        msgFileNotReadable: 'فایل "{name}" قابل نوشتن نیست.',
	        msgFilePreviewAborted: 'پیش نمایش فایل "{name}". به مشکل خورد',
	        msgFilePreviewError: 'در هنگام خواندن فایل "{name}" خطایی رخ داد.',
	        msgInvalidFileName: 'کاراکترهای غیرمجاز و یا ناشناخته در نام فایل "{name}".',
	        msgInvalidFileType: 'نوع فایل "{name}" معتبر نیست. فقط "{types}" پشیبانی می‌شوند.',
	        msgInvalidFileExtension: 'پسوند فایل "{name}" معتبر نیست. فقط "{extensions}" پشتیبانی می‌شوند.',
	        msgFileTypes: {
	            'image': 'عکس',
	            'html': 'اچ تا ام ال',
	            'text': 'متن',
	            'video': 'ویدئو',
	            'audio': 'صدا',
	            'flash': 'فلش',
	            'pdf': 'پی دی اف',
	            'object': 'دیگر'
	        },
	        msgUploadAborted: 'بارگذاری فایل به مشکل خورد.',
	        msgUploadThreshold: 'در حال پردازش &hellip;',
	        msgUploadBegin: 'در حال شروع &hellip;',
	        msgUploadEnd: 'انجام شد',
	        msgUploadResume: 'Resuming upload &hellip;',
	        msgUploadEmpty: 'هیچ داده معتبری برای بارگذاری موجود نیست.',
	        msgUploadError: 'Upload Error',
	        msgDeleteError: 'Delete Error',
	        msgProgressError: 'Error',
	        msgValidationError: 'خطای اعتبار سنجی',
	        msgLoading: 'بارگیری فایل {index} از {files} &hellip;',
	        msgProgress: 'بارگیری فایل {index} از {files} - {name} - {percent}% تمام شد.',
	        msgSelected: '{n} {files} انتخاب شده',
	        msgFoldersNotAllowed: 'فقط فایل‌ها را بکشید و رها کنید! {n} پوشه نادیده گرفته شد.',
	        msgImageWidthSmall: 'عرض فایل تصویر "{name}" باید حداقل {size} پیکسل باشد.',
	        msgImageHeightSmall: 'ارتفاع فایل تصویر "{name}" باید حداقل {size} پیکسل باشد.',
	        msgImageWidthLarge: 'عرض فایل تصویر "{name}" نمیتواند از {size} پیکسل بیشتر باشد.',
	        msgImageHeightLarge: 'ارتفاع فایل تصویر "{name}" نمی‌تواند از {size} پیکسل بیشتر باشد.',
	        msgImageResizeError: 'یافت نشد ابعاد تصویر را برای تغییر اندازه.',
	        msgImageResizeException: 'خطا در هنگام تغییر اندازه تصویر.<pre>{errors}</pre>',
	        msgAjaxError: 'به نظر مشکلی در حین {operation} روی داده است. لطفا دوباره تلاش کنید!',
	        msgAjaxProgressError: '{operation} لغو شد',
	        msgDuplicateFile: 'File "{name}" of same size "{size} KB" has already been selected earlier. Skipping duplicate selection.',
	        msgResumableUploadRetriesExceeded:  'Upload aborted beyond <b>{max}</b> retries for file <b>{file}</b>! Error Details: <pre>{error}</pre>',
	        msgPendingTime: '{time} remaining',
	        msgCalculatingTime: 'calculating time remaining',
	        ajaxOperations: {
	            deleteThumb: 'حذف فایل',
	            uploadThumb: 'بارگذاری فایل',
	            uploadBatch: 'بارگذاری جمعی فایلها',
	            uploadExtra: 'بارگذاری با کمک فُرم'
	        },
	        dropZoneTitle: 'فایل‌ها را بکشید و در اینجا رها کنید &hellip;',
	        dropZoneClickTitle: '<br>(یا برای انتخاب {files} کلیک کنید)',
	        fileActionSettings: {
	            removeTitle: 'حذف فایل',
	            uploadTitle: 'آپلود فایل',
	            uploadRetryTitle: 'بارگیری مجدد',
	            downloadTitle: 'دریافت فایل',
	            zoomTitle: 'دیدن جزئیات',
	            dragTitle: 'جابجایی / چیدمان',
	            indicatorNewTitle: 'آپلود نشده است',
	            indicatorSuccessTitle: 'آپلود شده',
	            indicatorErrorTitle: 'بارگذاری خطا',
	            indicatorPausedTitle: 'Upload Paused',
	            indicatorLoadingTitle:  'آپلود &hellip;'
	        },
	        previewZoomButtonTitles: {
	            prev: 'مشاهده فایل قبلی',
	            next: 'مشاهده فایل بعدی',
	            toggleheader: 'نمایش عنوان',
	            fullscreen: 'نمایش تمام صفحه',
	            borderless: 'نمایش حاشیه',
	            close: 'بستن نمایش با جزییات'
	        }
	    };
	})(window.jQuery);

	/*!
	 * bootstrap-fileinput v5.1.2
	 * http://plugins.krajee.com/file-input
	 *
	 * Font Awesome 5 icon theme configuration for bootstrap-fileinput. Requires font awesome 5 assets to be loaded.
	 *
	 * Author: Kartik Visweswaran
	 * Copyright: 2014 - 2020, Kartik Visweswaran, Krajee.com
	 *
	 * Licensed under the BSD-3-Clause
	 * https://github.com/kartik-v/bootstrap-fileinput/blob/master/LICENSE.md
	 */
	(function ($) {

	    $.fn.fileinputThemes.fas = {
	        fileActionSettings: {
	            removeIcon: '<i class="fas fa-trash-alt"></i>',
	            uploadIcon: '<i class="fas fa-upload"></i>',
	            uploadRetryIcon: '<i class="fas fa-redo-alt"></i>',
	            downloadIcon: '<i class="fas fa-download"></i>',
	            zoomIcon: '<i class="fas fa-search-plus"></i>',
	            dragIcon: '<i class="fas fa-arrows-alt"></i>',
	            indicatorNew: '<i class="fas fa-plus-circle text-warning"></i>',
	            indicatorSuccess: '<i class="fas fa-check-circle text-success"></i>',
	            indicatorError: '<i class="fas fa-exclamation-circle text-danger"></i>',
	            indicatorLoading: '<i class="fas fa-hourglass text-muted"></i>',
	            indicatorPaused: '<i class="fa fa-pause text-info"></i>'
	        },
	        layoutTemplates: {
	            fileIcon: '<i class="fas fa-file kv-caption-icon"></i> '
	        },
	        previewZoomButtonIcons: {
	            prev: '<i class="fas fa-caret-left fa-lg"></i>',
	            next: '<i class="fas fa-caret-right fa-lg"></i>',
	            toggleheader: '<i class="fas fa-fw fa-arrows-alt-v"></i>',
	            fullscreen: '<i class="fas fa-fw fa-arrows-alt"></i>',
	            borderless: '<i class="fas fa-fw fa-external-link-alt"></i>',
	            close: '<i class="fas fa-fw fa-times"></i>'
	        },
	        previewFileIcon: '<i class="fas fa-file"></i>',
	        browseIcon: '<i class="fas fa-folder-open"></i>',
	        removeIcon: '<i class="fas fa-trash-alt"></i>',
	        cancelIcon: '<i class="fas fa-ban"></i>',
	        pauseIcon: '<i class="fas fa-pause"></i>',
	        uploadIcon: '<i class="fas fa-upload"></i>',
	        msgValidationErrorIcon: '<i class="fas fa-exclamation-circle"></i> '
	    };
	})(window.jQuery);

	/* ====== Index ======

	1. SCROLLBAR SIDEBAR
	2. BACKDROP
	3. SIDEBAR MENU
	4. SIDEBAR TOGGLE FOR MOBILE
	5. SIDEBAR TOGGLE FOR VARIOUS SIDEBAR LAYOUT
	6. TODO LIST
	7. RIGHT SIDEBAR

	====== End ======*/

	$(document).ready(function () {

	  /*======== 1. SCROLLBAR SIDEBAR ========*/
	  var sidebarScrollbar = $(".sidebar-scrollbar");
	  if (sidebarScrollbar.length != 0) {
	    sidebarScrollbar.slimScroll({
	      opacity: 0.5,
	      height: "100%",
	      color: "#808080",
	      size: "5px",
	      touchScrollStep: 50
	    })
	      .mouseover(function () {
	        $(this)
	          .next(".slimScrollBar")
	          .css("opacity", 0.5);
	      });
	  }

	  /*======== 2. MOBILE OVERLAY ========*/
	  if ($(window).width() < 768) {
	    $(".sidebar-toggle").on("click", function () {
	      $("body").css("overflow", "hidden");
	      $('body').prepend('<div class="mobile-sticky-body-overlay"></div>');
	    });

	    $(document).on("click", '.mobile-sticky-body-overlay', function (e) {
	      $(this).remove();
	      $("#body").removeClass("sidebar-mobile-in").addClass("sidebar-mobile-out");
	      $("body").css("overflow", "auto");
	    });
	  }

	  /*======== 3. SIDEBAR MENU ========*/
	  var sidebar = $(".sidebar");
	  if (sidebar.length != 0) {
	    $(".sidebar .nav > .has-sub > a").click(function () {
	      $(this).parent().siblings().removeClass('expand');
	      $(this).parent().toggleClass('expand');
	    });

	    $(".sidebar .nav > .has-sub .has-sub > a").click(function () {
	      $(this).parent().toggleClass('expand');
	    });
	  }


	  /*======== 4. SIDEBAR TOGGLE FOR MOBILE ========*/
	  if ($(window).width() < 768) {
	    $(document).on("click", ".sidebar-toggle", function (e) {
	      e.preventDefault();
	      var min = "sidebar-mobile-in",
	        min_out = "sidebar-mobile-out",
	        body = "#body";
	      $(body).hasClass(min)
	        ? $(body)
	          .removeClass(min)
	          .addClass(min_out)
	        : $(body)
	          .addClass(min)
	          .removeClass(min_out);
	    });
	  }

	  /*======== 5. SIDEBAR TOGGLE FOR VARIOUS SIDEBAR LAYOUT ========*/
	  var body = $("#body");
	  if ($(window).width() >= 768) {

	    if (typeof window.isMinified === "undefined") {
	      window.isMinified = false;
	    }
	    if (typeof window.isCollapsed === "undefined") {
	      window.isCollapsed = false;
	    }

	    $("#sidebar-toggler").on("click", function () {
	      if (
	        body.hasClass("sidebar-fixed-offcanvas") ||
	        body.hasClass("sidebar-static-offcanvas")
	      ) {
	        $(this)
	          .addClass("sidebar-offcanvas-toggle")
	          .removeClass("sidebar-toggle");
	        if (window.isCollapsed === false) {
	          body.addClass("sidebar-collapse");
	          window.isCollapsed = true;
	          window.isMinified = false;
	        } else {
	          body.removeClass("sidebar-collapse");
	          body.addClass("sidebar-collapse-out");
	          setTimeout(function () {
	            body.removeClass("sidebar-collapse-out");
	          }, 300);
	          window.isCollapsed = false;
	        }
	      }

	      if (
	        body.hasClass("sidebar-fixed") ||
	        body.hasClass("sidebar-static")
	      ) {
	        $(this)
	          .addClass("sidebar-toggle")
	          .removeClass("sidebar-offcanvas-toggle");
	        if (window.isMinified === false) {
	          body
	            .removeClass("sidebar-collapse sidebar-minified-out")
	            .addClass("sidebar-minified");
	          window.isMinified = true;
	          window.isCollapsed = false;
	        } else {
	          body.removeClass("sidebar-minified");
	          body.addClass("sidebar-minified-out");
	          window.isMinified = false;
	        }
	      }
	    });
	  }

	  if ($(window).width() >= 768 && $(window).width() < 992) {
	    if (
	      body.hasClass("sidebar-fixed") ||
	      body.hasClass("sidebar-static")
	    ) {
	      body
	        .removeClass("sidebar-collapse sidebar-minified-out")
	        .addClass("sidebar-minified");
	      window.isMinified = true;
	    }
	  }

	  /*======== 6. TODO LIST ========*/

	  function todoCheckAll() {
	    var mdis = document.querySelectorAll(".todo-single-item .mdi");
	    mdis.forEach(function (fa) {
	      fa.addEventListener("click", function (e) {
	        e.stopPropagation();
	        e.target.parentElement.classList.toggle("finished");
	      });
	    });
	  }

	  if (document.querySelector("#todo")) {
	    var list = document.querySelector("#todo-list"),
	      todoInput = document.querySelector("#todo-input"),
	      todoInputForm = todoInput.querySelector("form"),
	      item = todoInputForm.querySelector("input");

	    document.querySelector("#add-task").addEventListener("click", function (e) {
	      e.preventDefault();
	      todoInput.classList.toggle("d-block");
	      item.focus();
	    });

	    todoInputForm.addEventListener("submit", function (e) {
	      e.preventDefault();
	      if (item.value.length <= 0) {
	        return;
	      }
	      list.innerHTML =
	        '<div class="todo-single-item d-flex flex-row justify-content-between">' +
	        '<i class="mdi"></i>' +
	        '<span>' +
	        item.value +
	        '</span>' +
	        '<span class="badge badge-primary">Today</span>' +
	        '</div>' +
	        list.innerHTML;
	      item.value = "";
	      //Close input field
	      todoInput.classList.toggle("d-block");
	      todoCheckAll();
	    });

	    todoCheckAll();
	  }

	  /*======== 7. RIGHT SIDEBAR ========*/

	  var rightSidebarIn = 'right-sidebar-in';
	  var rightSidebarOut = 'right-sidebar-out';

	  $('.nav-right-sidebar .nav-link').on('click', function () {

	    if (!body.hasClass(rightSidebarIn)) {
	      body.addClass(rightSidebarIn).removeClass(rightSidebarOut);

	    } else if ($(this).hasClass('show')) {
	      body.addClass(rightSidebarOut).removeClass(rightSidebarIn);
	    }
	  });

	  $('.card-right-sidebar .close').on('click', function () {
	    body.removeClass(rightSidebarIn).addClass(rightSidebarOut);
	  });

	  if ($(window).width() <= 1024) {

	    var togglerInClass = "right-sidebar-toggoler-in";
	    var togglerOutClass = "right-sidebar-toggoler-out";

	    body.addClass(togglerOutClass);

	    $('.btn-right-sidebar-toggler').on('click', function () {
	      if (body.hasClass(togglerOutClass)) {
	        body.addClass(togglerInClass).removeClass(togglerOutClass);
	      } else {
	        body.addClass(togglerOutClass).removeClass(togglerInClass);
	      }
	    });
	  }

	});

	/* ====== Index ======

	1. DUAL LINE CHART
	2. DUAL LINE CHART2
	3. LINE CHART
	4. LINE CHART1
	5. LINE CHART2
	6. AREA CHART
	7. AREA CHART1
	8. AREA CHART2
	9. AREA CHART3
	10. GRADIENT LINE CHART
	11. DOUGHNUT CHART
	12. POLAR CHART
	13. RADAR CHART
	14. CURRENT USER BAR CHART
	15. ANALYTICS - USER ACQUISITION
	16. ANALYTICS - ACTIVITY CHART
	17. HORIZONTAL BAR CHART1
	18. HORIZONTAL BAR CHART2
	19. DEVICE - DOUGHNUT CHART
	20. BAR CHART
	21. BAR CHART1
	22. BAR CHART2
	23. BAR CHART3
	24. GRADIENT LINE CHART1
	25. GRADIENT LINE CHART2
	26. GRADIENT LINE CHART3
	27. ACQUISITION3
	28. STATISTICS

	====== End ======*/

	$(document).ready(function () {

	  /*======== 1. DUAL LINE CHART ========*/
	  var dual = document.getElementById("dual-line");
	  if (dual !== null) {
	    var urChart = new Chart(dual, {
	      type: "line",
	      data: {
	        labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
	        datasets: [
	          {
	            label: "Old",
	            pointRadius: 4,
	            pointBackgroundColor: "rgba(255,255,255,1)",
	            pointBorderWidth: 2,
	            fill: false,
	            backgroundColor: "transparent",
	            borderWidth: 2,
	            borderColor: "#fdc506",
	            data: [0, 4, 3, 5.5, 3, 4.7, 0]
	          },
	          {
	            label: "New",
	            fill: false,
	            pointRadius: 4,
	            pointBackgroundColor: "rgba(255,255,255,1)",
	            pointBorderWidth: 2,
	            backgroundColor: "transparent",
	            borderWidth: 2,
	            borderColor: "#4c84ff",
	            data: [0, 2, 4.3, 3.8, 5.2, 1.8, 2.2]
	          }
	        ]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        layout: {
	          padding: {
	            right: 10
	          }
	        },

	        legend: {
	          display: false
	        },
	        scales: {
	          xAxes: [
	            {
	              gridLines: {
	                drawBorder: false,
	                display: false
	              },
	              ticks: {
	                display: false, // hide main x-axis line
	                beginAtZero: true
	              },
	              barPercentage: 1.8,
	              categoryPercentage: 0.2
	            }
	          ],
	          yAxes: [
	            {
	              gridLines: {
	                drawBorder: false, // hide main y-axis line
	                display: false
	              },
	              ticks: {
	                display: false,
	                beginAtZero: true
	              }
	            }
	          ]
	        },
	        tooltips: {
	          titleFontColor: "#888",
	          bodyFontColor: "#555",
	          titleFontSize: 12,
	          bodyFontSize: 14,
	          backgroundColor: "rgba(256,256,256,0.95)",
	          displayColors: true,
	          borderColor: "rgba(220, 220, 220, 0.9)",
	          borderWidth: 2
	        }
	      }
	    });
	  }
	  /*======== 1. DUAL LINE CHART2 ========*/
	  var dual3 = document.getElementById("dual-line3");
	  if (dual3 !== null) {
	    var urdChart = new Chart(dual3, {
	      type: "line",
	      data: {
	        labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
	        datasets: [
	          {
	            label: "Old",
	            pointRadius: 4,
	            pointBackgroundColor: "#fec400",
	            pointBorderWidth: 2,
	            fill: false,
	            backgroundColor: "transparent",
	            borderWidth: 2,
	            borderColor: "#fcdf80",
	            data: [0, 4, 3, 5.5, 3, 4.7, 0]
	          },
	          {
	            label: "New",
	            fill: false,
	            pointRadius: 4,
	            pointBackgroundColor: "#fec400",
	            pointBorderWidth: 2,
	            backgroundColor: "transparent",
	            borderWidth: 2,
	            borderColor: "#ffffff",
	            data: [0, 2, 4.3, 3.8, 5.2, 1.8, 2.2]
	          }
	        ]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        layout: {
	          padding: {
	            right: 10
	          }
	        },
	        scales: {
	          xAxes: [
	            {
	              gridLines: {
	                drawBorder: false,
	                display: false
	              },
	              ticks: {
	                display: false, // hide main x-axis line
	                beginAtZero: true
	              },
	              barPercentage: 1.8,
	              categoryPercentage: 0.2
	            }
	          ],
	          yAxes: [
	            {
	              gridLines: {
	                drawBorder: false, // hide main y-axis line
	                display: false
	              },
	              ticks: {
	                display: false,
	                beginAtZero: true
	              }
	            }
	          ]
	        },
	        tooltips: {
	          enabled: true
	        }
	      }
	    });
	  }
	  /*======== 3. LINE CHART ========*/
	  var ctx = document.getElementById("linechart");
	  if (ctx !== null) {
	    var chart = new Chart(ctx, {
	      // The type of chart we want to create
	      type: "line",

	      // The data for our dataset
	      data: {
	        labels: [
	          "Jan",
	          "Feb",
	          "Mar",
	          "Apr",
	          "May",
	          "Jun",
	          "Jul",
	          "Aug",
	          "Sep",
	          "Oct",
	          "Nov",
	          "Dec"
	        ],
	        datasets: [
	          {
	            label: "",
	            backgroundColor: "transparent",
	            borderColor: "rgb(82, 136, 255)",
	            data: [
	              100,
	              11000,
	              10000,
	              14000,
	              11000,
	              17000,
	              14500,
	              18000,
	              5000,
	              23000,
	              14000,
	              19000
	            ],
	            lineTension: 0.3,
	            pointRadius: 5,
	            pointBackgroundColor: "rgba(255,255,255,1)",
	            pointHoverBackgroundColor: "rgba(255,255,255,1)",
	            pointBorderWidth: 2,
	            pointHoverRadius: 8,
	            pointHoverBorderWidth: 1
	          }
	        ]
	      },

	      // Configuration options go here
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        layout: {
	          padding: {
	            right: 10
	          }
	        },
	        scales: {
	          xAxes: [
	            {
	              gridLines: {
	                display: false
	              }
	            }
	          ],
	          yAxes: [
	            {
	              gridLines: {
	                display: true,
	                color: "#eee",
	                zeroLineColor: "#eee",
	              },
	              ticks: {
	                callback: function (value) {
	                  var ranges = [
	                    { divider: 1e6, suffix: "M" },
	                    { divider: 1e4, suffix: "k" }
	                  ];
	                  function formatNumber(n) {
	                    for (var i = 0; i < ranges.length; i++) {
	                      if (n >= ranges[i].divider) {
	                        return (
	                          (n / ranges[i].divider).toString() + ranges[i].suffix
	                        );
	                      }
	                    }
	                    return n;
	                  }
	                  return formatNumber(value);
	                }
	              }
	            }
	          ]
	        },
	        tooltips: {
	          callbacks: {
	            title: function (tooltipItem, data) {
	              return data["labels"][tooltipItem[0]["index"]];
	            },
	            label: function (tooltipItem, data) {
	              return "$" + data["datasets"][0]["data"][tooltipItem["index"]];
	            }
	          },
	          responsive: true,
	          intersect: false,
	          enabled: true,
	          titleFontColor: "#888",
	          bodyFontColor: "#555",
	          titleFontSize: 12,
	          bodyFontSize: 18,
	          backgroundColor: "rgba(256,256,256,0.95)",
	          xPadding: 20,
	          yPadding: 10,
	          displayColors: false,
	          borderColor: "rgba(220, 220, 220, 0.9)",
	          borderWidth: 2,
	          caretSize: 10,
	          caretPadding: 15
	        }
	      }
	    });
	  }
	  /*======== 4. LINE CHART1 ========*/
	  var lchart1 = document.getElementById("linechart1");
	  if (lchart1 !== null) {
	    var urChart = new Chart(lchart1, {
	      type: "line",
	      data: {
	        labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
	        datasets: [
	          {
	            label: "Old",
	            pointRadius: 0,
	            pointBackgroundColor: "rgba(255,255,255,1)",
	            pointBorderWidth: 2,
	            fill: false,
	            backgroundColor: "transparent",
	            borderWidth: 2,
	            borderColor: "#fcdf80",
	            data: [0, 5, 2.5, 9.5, 3.3, 8, 0]
	          },
	          {
	            label: "New",
	            fill: false,
	            pointRadius: 0,
	            pointBackgroundColor: "rgba(255,255,255,1)",
	            pointBorderWidth: 2,
	            backgroundColor: "transparent",
	            borderWidth: 2,
	            borderColor: "#4c84ff",
	            data: [0, 2, 6, 5, 8.5, 3, 3.8]
	          }
	        ]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        scales: {
	          xAxes: [
	            {
	              gridLines: {
	                drawBorder: false,
	                display: false
	              },
	              ticks: {
	                display: false, // hide main x-axis line
	                beginAtZero: true
	              },
	              barPercentage: 1.8,
	              categoryPercentage: 0.2
	            }
	          ],
	          yAxes: [
	            {
	              gridLines: {
	                drawBorder: false, // hide main y-axis line
	                display: false
	              },
	              ticks: {
	                display: false,
	                beginAtZero: true
	              }
	            }
	          ]
	        },
	        tooltips: {
	          enabled: false
	        }
	      }
	    });
	  }
	  /*======== 5. LINE CHART2 ========*/
	  var lchart2 = document.getElementById("linechart2");
	  if (lchart2 !== null) {
	    var urChart2 = new Chart(lchart2, {
	      type: "line",
	      data: {
	        labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
	        datasets: [
	          {
	            label: "Old",
	            pointRadius: 0,
	            pointBackgroundColor: "rgba(255,255,255,1)",
	            pointBorderWidth: 2,
	            fill: false,
	            backgroundColor: "transparent",
	            borderWidth: 2,
	            borderColor: "#fcdf80",
	            data: [0, 5, 2.5, 9.5, 3.3, 8, 0]
	          },
	          {
	            label: "New",
	            fill: false,
	            pointRadius: 0,
	            pointBackgroundColor: "rgba(255,255,255,1)",
	            pointBorderWidth: 2,
	            backgroundColor: "transparent",
	            borderWidth: 2,
	            borderColor: "#ffffff",
	            data: [0, 2, 6, 5, 8.5, 3, 3.8]
	          }
	        ]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        scales: {
	          xAxes: [
	            {
	              gridLines: {
	                drawBorder: false,
	                display: false
	              },
	              ticks: {
	                display: false, // hide main x-axis line
	                beginAtZero: true
	              },
	              barPercentage: 1.8,
	              categoryPercentage: 0.2
	            }
	          ],
	          yAxes: [
	            {
	              gridLines: {
	                drawBorder: false, // hide main y-axis line
	                display: false
	              },
	              ticks: {
	                display: false,
	                beginAtZero: true
	              }
	            }
	          ]
	        },
	        tooltips: {
	          enabled: false
	        }
	      }
	    });
	  }
	  /*======== 6. AREA CHART ========*/
	  var area = document.getElementById("area-chart");
	  if (area !== null) {
	    var areaChart = new Chart(area, {
	      type: "line",
	      data: {
	        labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
	        datasets: [
	          {
	            label: "New",
	            pointHitRadius: 10,
	            pointRadius: 0,
	            fill: true,
	            backgroundColor: "rgba(76, 132, 255, 0.9)",
	            borderColor: "rgba(76, 132, 255, 0.9)",
	            data: [0, 4, 2, 6.5, 3, 4.7, 0]
	          },
	          {
	            label: "Old",
	            pointHitRadius: 10,
	            pointRadius: 0,
	            fill: true,
	            backgroundColor: "rgba(253, 197, 6, 0.9)",
	            borderColor: "rgba(253, 197, 6, 1)",
	            data: [0, 2, 4.3, 3.8, 5.2, 1.8, 2.2]
	          }
	        ]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        layout: {
	          padding: {
	            right: 10
	          }
	        },
	        scales: {
	          xAxes: [
	            {
	              gridLines: {
	                drawBorder: false,
	                display: false
	              },
	              ticks: {
	                display: false, // hide main x-axis line
	                beginAtZero: true
	              },
	              barPercentage: 1.8,
	              categoryPercentage: 0.2
	            }
	          ],
	          yAxes: [
	            {
	              gridLines: {
	                drawBorder: false, // hide main y-axis line
	                display: false
	              },
	              ticks: {
	                display: false,
	                beginAtZero: true
	              }
	            }
	          ]
	        },
	        tooltips: {
	          titleFontColor: "#888",
	          bodyFontColor: "#555",
	          titleFontSize: 12,
	          bodyFontSize: 14,
	          backgroundColor: "rgba(256,256,256,0.95)",
	          displayColors: true,
	          borderColor: "rgba(220, 220, 220, 0.9)",
	          borderWidth: 2
	        }
	      }
	    });
	  }
	  /*======== 7. AREA CHART1 ========*/
	  var area1 = document.getElementById("areaChart1");
	  if (area1 !== null) {
	    var areaChart = new Chart(area1, {
	      type: "line",
	      data: {
	        labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
	        datasets: [
	          {
	            label: "New",
	            pointRadius: 0.1,
	            fill: true,
	            lineTension: 0.3,
	            backgroundColor: "rgba(76, 132, 255, 0.9)",
	            borderColor: "rgba(76, 132, 255, 0.9)",
	            data: [0, 5, 2.5, 9, 3.5, 6.5, 0]
	          },
	          {
	            label: "Old",
	            pointRadius: 0.1,
	            fill: true,
	            lineTension: 0.3,
	            backgroundColor: "rgba(253, 197, 6, 0.9)",
	            borderColor: "rgba(253, 197, 6, 1)",
	            data: [0, 2, 5.5, 2.6, 5.7, 4, 2.8]
	          }
	        ]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        scales: {
	          xAxes: [
	            {
	              gridLines: {
	                drawBorder: false,
	                display: false
	              },
	              ticks: {
	                display: false, // hide main x-axis line
	                beginAtZero: true
	              },
	              barPercentage: 1.8,
	              categoryPercentage: 0.2
	            }
	          ],
	          yAxes: [
	            {
	              gridLines: {
	                drawBorder: false, // hide main y-axis line
	                display: false
	              },
	              ticks: {
	                display: false,
	                beginAtZero: true
	              }
	            }
	          ]
	        },
	        tooltips: {
	          enabled: false
	        }
	      }
	    });
	  }

	  /*======== 8. AREA CHART2 ========*/
	  var area2 = document.getElementById("areaChart2");
	  if (area2 !== null) {
	    var areaChart = new Chart(area2, {
	      type: "line",
	      data: {
	        labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
	        datasets: [
	          {
	            label: "New",
	            pointRadius: 0.1,
	            fill: true,
	            lineTension: 0.6,
	            backgroundColor: "rgba(255, 255, 255, 0.4)",
	            borderColor: "rgba(255, 255, 255,0)",
	            data: [0, 5, 2.5, 9, 3.5, 6.5, 0]
	          },
	          {
	            label: "Old",
	            pointRadius: 0.1,
	            fill: true,
	            lineTension: 0.6,
	            backgroundColor: "rgba(255, 255, 255, 0.8)",
	            borderColor: "rgba(255, 255, 255, 0)",
	            data: [0, 2, 5.5, 2.6, 5.7, 4, 2.8]
	          }
	        ]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        scales: {
	          xAxes: [
	            {
	              gridLines: {
	                drawBorder: false,
	                display: false
	              },
	              ticks: {
	                display: false, // hide main x-axis line
	                beginAtZero: true
	              },
	              barPercentage: 1.8,
	              categoryPercentage: 0.2
	            }
	          ],
	          yAxes: [
	            {
	              gridLines: {
	                drawBorder: false, // hide main y-axis line
	                display: false
	              },
	              ticks: {
	                display: false,
	                beginAtZero: true
	              }
	            }
	          ]
	        },
	        tooltips: {
	          enabled: false
	        }
	      }
	    });
	  }

	  /*======== 9. AREA CHART3 ========*/
	  var area3 = document.getElementById("area-chart3");
	  if (area3 !== null) {
	    var areaChart3 = new Chart(area3, {
	      type: "line",
	      data: {
	        labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
	        datasets: [
	          {
	            label: "New",
	            pointHitRadius: 10,
	            pointRadius: 0,
	            fill: true,
	            backgroundColor: "rgba(255, 255, 255, 0.4)",
	            borderColor: "rgba(255, 255, 255,0)",
	            data: [0, 4, 2, 6.5, 3, 4.7, 0]
	          },
	          {
	            label: "Old",
	            pointHitRadius: 10,
	            pointRadius: 0,
	            fill: true,
	            backgroundColor: "rgba(255, 255, 255, 0.8)",
	            borderColor: "rgba(255, 255, 255, 0)",
	            data: [0, 2, 4.3, 3.8, 5.2, 1.8, 2.2]
	          }
	        ]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        layout: {
	          padding: {
	            right: 10
	          }
	        },
	        scales: {
	          xAxes: [
	            {
	              gridLines: {
	                drawBorder: false,
	                display: false
	              },
	              ticks: {
	                display: false, // hide main x-axis line
	                beginAtZero: true
	              },
	              barPercentage: 1.8,
	              categoryPercentage: 0.2
	            }
	          ],
	          yAxes: [
	            {
	              gridLines: {
	                drawBorder: false, // hide main y-axis line
	                display: false
	              },
	              ticks: {
	                display: false,
	                beginAtZero: true
	              }
	            }
	          ]
	        },
	        tooltips: {
	          enabled: true
	        }
	      }
	    });
	  }
	  /*======== 10. GRADIENT LINE CHART ========*/
	  var line = document.getElementById("line");
	  if (line !== null) {
	    line = line.getContext("2d");
	    var gradientFill = line.createLinearGradient(0, 120, 0, 0);
	    gradientFill.addColorStop(0, "rgba(41,204,151,0.10196)");
	    gradientFill.addColorStop(1, "rgba(41,204,151,0.30196)");

	    var lChart = new Chart(line, {
	      type: "line",
	      data: {
	        labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
	        datasets: [
	          {
	            label: "Rev",
	            lineTension: 0,
	            pointRadius: 4,
	            pointBackgroundColor: "rgba(255,255,255,1)",
	            pointBorderWidth: 2,
	            fill: true,
	            backgroundColor: gradientFill,
	            borderColor: "#29cc97",
	            borderWidth: 2,
	            data: [0, 4, 3, 5.5, 3, 4.7, 1]
	          }
	        ]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        layout: {
	          padding: {
	            right: 10
	          }
	        },
	        scales: {
	          xAxes: [
	            {
	              gridLines: {
	                drawBorder: false,
	                display: false
	              },
	              ticks: {
	                display: false, // hide main x-axis line
	                beginAtZero: true
	              },
	              barPercentage: 1.8,
	              categoryPercentage: 0.2
	            }
	          ],
	          yAxes: [
	            {
	              gridLines: {
	                drawBorder: false, // hide main y-axis line
	                display: false
	              },
	              ticks: {
	                display: false,
	                beginAtZero: true
	              }
	            }
	          ]
	        },
	        tooltips: {
	          titleFontColor: "#888",
	          bodyFontColor: "#555",
	          titleFontSize: 12,
	          bodyFontSize: 14,
	          backgroundColor: "rgba(256,256,256,0.95)",
	          displayColors: true,
	          borderColor: "rgba(220, 220, 220, 0.9)",
	          borderWidth: 2
	        }
	      }
	    });
	  }
	  /*======== 11. DOUGHNUT CHART ========*/
	  var doughnut = document.getElementById("doChart");
	  if (doughnut !== null) {
	    var myDoughnutChart = new Chart(doughnut, {
	      type: "doughnut",
	      data: {
	        labels: ["completed", "unpaid", "pending", "canceled"],
	        datasets: [
	          {
	            label: ["completed", "unpaid", "pending", "canceled"],
	            data: [4100, 2500, 1800, 2300],
	            backgroundColor: ["#4c84ff", "#29cc97", "#8061ef", "#fec402"],
	            borderWidth: 1
	            // borderColor: ['#4c84ff','#29cc97','#8061ef','#fec402']
	            // hoverBorderColor: ['#4c84ff', '#29cc97', '#8061ef', '#fec402']
	          }
	        ]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        cutoutPercentage: 75,
	        tooltips: {
	          callbacks: {
	            title: function (tooltipItem, data) {
	              return "Order : " + data["labels"][tooltipItem[0]["index"]];
	            },
	            label: function (tooltipItem, data) {
	              return data["datasets"][0]["data"][tooltipItem["index"]];
	            }
	          },
	          titleFontColor: "#888",
	          bodyFontColor: "#555",
	          titleFontSize: 12,
	          bodyFontSize: 14,
	          backgroundColor: "rgba(256,256,256,0.95)",
	          displayColors: true,
	          borderColor: "rgba(220, 220, 220, 0.9)",
	          borderWidth: 2
	        }
	      }
	    });
	  }
	  /*======== 12. POLAR CHART ========*/
	  var polar = document.getElementById("polar");
	  if (polar !== null) {
	    var configPolar = {
	      data: {
	        datasets: [
	          {
	            data: [43, 23, 53, 33, 55],
	            backgroundColor: [
	              "rgba(41,204,151,0.5)",
	              "rgba(254,88,101,0.5)",
	              "rgba(128,97,239,0.5)",
	              "rgba(254,196,0,0.5)",
	              "rgba(76,132,255,0.5)"
	            ],
	            label: "" // for legend
	          }
	        ],
	        labels: ["Total Sales", "Rejected", "Completed", "Pending", "Reserve"]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          position: "right",
	          display: false
	        },
	        layout: {
	          padding: {
	            top: 10,
	            bottom: 10,
	            right: 10,
	            left: 10
	          }
	        },
	        title: {
	          display: false,
	          text: "Chart.js Polar Area Chart"
	        },
	        scale: {
	          ticks: {
	            beginAtZero: true,
	            fontColor: "#1b223c",
	            fontSize: 12,
	            stepSize: 10,
	            max: 60
	          },
	          reverse: false
	        },
	        animation: {
	          animateRotate: false,
	          animateScale: true
	        },
	        tooltips: {
	          titleFontColor: "#888",
	          bodyFontColor: "#555",
	          titleFontSize: 12,
	          bodyFontSize: 14,
	          backgroundColor: "rgba(256,256,256,0.95)",
	          displayColors: true,
	          borderColor: "rgba(220, 220, 220, 0.9)",
	          borderWidth: 2
	        }
	      }
	    };
	    window.myPolarArea = Chart.PolarArea(polar, configPolar);
	  }

	  /*======== 13. RADAR CHART ========*/
	  var radar = document.getElementById("radar");
	  if (radar !== null) {
	    var myRadar = new Chart(radar, {
	      type: "radar",
	      data: {
	        labels: [
	          "January",
	          "February",
	          "March",
	          "April",
	          "May",
	          "June",
	          "July",
	          "August",
	          "September",
	          "October",
	          "November",
	          "December"
	        ],
	        datasets: [
	          {
	            label: "Current Year",
	            backgroundColor: "rgba(76,132,255,0.2)",
	            borderColor: "#4c84ff",
	            pointBorderWidth: 2,
	            pointRadius: 4,
	            pointBorderColor: "rgba(76,132,255,1)",
	            pointBackgroundColor: "#ffffff",
	            data: [25, 31, 43, 48, 21, 36, 23, 12, 33, 36, 28, 55]
	          },
	          {
	            label: "Previous Year",
	            backgroundColor: "rgba(41, 204, 151, 0.2)",
	            borderColor: "#29cc97",
	            pointBorderWidth: 2,
	            pointRadius: 4,
	            pointBorderColor: "#29cc97",
	            pointBackgroundColor: "#ffffff",
	            data: [45, 77, 22, 12, 56, 43, 71, 23, 54, 19, 32, 55]
	          }
	        ]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        title: {
	          display: false,
	          text: "Chart.js Radar Chart"
	        },
	        layout: {
	          padding: {
	            top: 10,
	            bottom: 10,
	            right: 10,
	            left: 10
	          }
	        },
	        scale: {
	          ticks: {
	            beginAtZero: true,
	            fontColor: "#1b223c",
	            fontSize: 12,
	            stepSize: 10,
	            max: 60
	          }
	        },
	        tooltips: {
	          titleFontColor: "#888",
	          bodyFontColor: "#555",
	          titleFontSize: 12,
	          bodyFontSize: 14,
	          backgroundColor: "rgba(256,256,256,0.95)",
	          displayColors: true,
	          borderColor: "rgba(220, 220, 220, 0.9)",
	          borderWidth: 2
	        }
	      }
	    });
	  }
	  /*======== 14. CURRENT USER BAR CHART ========*/
	  var cUser = document.getElementById("currentUser");
	  if (cUser !== null) {
	    var myUChart = new Chart(cUser, {
	      type: "bar",
	      data: {
	        labels: [
	          "1h",
	          "10 m",
	          "50 m",
	          "30 m",
	          "40 m",
	          "20 m",
	          "30 m",
	          "25 m",
	          "20 m",
	          "5 m",
	          "10 m"
	        ],
	        datasets: [
	          {
	            label: "signup",
	            data: [15, 30, 27, 43, 39, 18, 42, 25, 13, 18, 59],
	            // data: [2, 3.2, 1.8, 2.1, 1.5, 3.5, 4, 2.3, 2.9, 4.5, 1.8, 3.4, 2.8],
	            backgroundColor: "#4c84ff"
	          }
	        ]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        scales: {
	          xAxes: [
	            {
	              gridLines: {
	                drawBorder: true,
	                display: false,
	              },
	              ticks: {
	                fontColor: "#8a909d",
	                fontFamily: "Roboto, sans-serif",
	                display: false, // hide main x-axis line
	                beginAtZero: true,
	                callback: function (tick, index, array) {
	                  return index % 2 ? "" : tick;
	                }
	              },
	              barPercentage: 1.8,
	              categoryPercentage: 0.2
	            }
	          ],
	          yAxes: [
	            {
	              gridLines: {
	                drawBorder: true,
	                display: true,
	                color: "#eee",
	                zeroLineColor: "#eee"
	              },
	              ticks: {
	                fontColor: "#8a909d",
	                fontFamily: "Roboto, sans-serif",
	                display: true,
	                beginAtZero: true
	              }
	            }
	          ]
	        },

	        tooltips: {
	          mode: "index",
	          titleFontColor: "#888",
	          bodyFontColor: "#555",
	          titleFontSize: 12,
	          bodyFontSize: 15,
	          backgroundColor: "rgba(256,256,256,0.95)",
	          displayColors: true,
	          xPadding: 10,
	          yPadding: 7,
	          borderColor: "rgba(220, 220, 220, 0.9)",
	          borderWidth: 2,
	          caretSize: 6,
	          caretPadding: 5
	        }
	      }
	    });
	  }
	  /*======== 15. ANALYTICS - USER ACQUISITION ========*/
	  var acquisition = document.getElementById("acquisition");
	  if (acquisition !== null) {
	    var acqData = [
	      {
	        first: [100, 180, 44, 75, 150, 66, 70],
	        second: [144, 44, 177, 76, 23, 189, 12],
	        third: [44, 167, 102, 123, 183, 88, 134]
	      },
	      {
	        first: [144, 44, 110, 5, 123, 89, 12],
	        second: [22, 123, 45, 130, 112, 54, 181],
	        third: [55, 44, 144, 75, 155, 166, 70]
	      },
	      {
	        first: [134, 80, 123, 65, 171, 33, 22],
	        second: [44, 144, 77, 76, 123, 89, 112],
	        third: [156, 23, 165, 88, 112, 54, 181]
	      }
	    ];

	    var configAcq = {
	      // The type of chart we want to create
	      type: "line",

	      // The data for our dataset
	      data: {
	        labels: [
	          "4 Jan",
	          "5 Jan",
	          "6 Jan",
	          "7 Jan",
	          "8 Jan",
	          "9 Jan",
	          "10 Jan"
	        ],
	        datasets: [
	          {
	            label: "Referral",
	            backgroundColor: "rgb(76, 132, 255)",
	            borderColor: "rgba(76, 132, 255,0)",
	            data: acqData[0].first,
	            lineTension: 0.3,
	            pointBackgroundColor: "rgba(76, 132, 255,0)",
	            pointHoverBackgroundColor: "rgba(76, 132, 255,1)",
	            pointHoverRadius: 3,
	            pointHitRadius: 30,
	            pointBorderWidth: 2,
	            pointStyle: "rectRounded"
	          },
	          {
	            label: "Direct",
	            backgroundColor: "rgb(254, 196, 0)",
	            borderColor: "rgba(254, 196, 0,0)",
	            data: acqData[0].second,
	            lineTension: 0.3,
	            pointBackgroundColor: "rgba(254, 196, 0,0)",
	            pointHoverBackgroundColor: "rgba(254, 196, 0,1)",
	            pointHoverRadius: 3,
	            pointHitRadius: 30,
	            pointBorderWidth: 2,
	            pointStyle: "rectRounded"
	          },
	          {
	            label: "Social",
	            backgroundColor: "rgb(41, 204, 151)",
	            borderColor: "rgba(41, 204, 151,0)",
	            data: acqData[0].third,
	            lineTension: 0.3,
	            pointBackgroundColor: "rgba(41, 204, 151,0)",
	            pointHoverBackgroundColor: "rgba(41, 204, 151,1)",
	            pointHoverRadius: 3,
	            pointHitRadius: 30,
	            pointBorderWidth: 2,
	            pointStyle: "rectRounded"
	          }
	        ]
	      },

	      // Configuration options go here
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        scales: {
	          xAxes: [
	            {
	              gridLines: {
	                display: false
	              }
	            }
	          ],
	          yAxes: [
	            {
	              gridLines: {
	                display: true,
	                color: "#eee",
	                zeroLineColor: "#eee"
	              },
	              ticks: {
	                beginAtZero: true,
	                stepSize: 50,
	                max: 200
	              }
	            }
	          ]
	        },
	        tooltips: {
	          mode: "index",
	          titleFontColor: "#888",
	          bodyFontColor: "#555",
	          titleFontSize: 12,
	          bodyFontSize: 15,
	          backgroundColor: "rgba(256,256,256,0.95)",
	          displayColors: true,
	          xPadding: 20,
	          yPadding: 10,
	          borderColor: "rgba(220, 220, 220, 0.9)",
	          borderWidth: 2,
	          caretSize: 10,
	          caretPadding: 15
	        }
	      }
	    };

	    var ctx = document.getElementById("acquisition").getContext("2d");
	    var lineAcq = new Chart(ctx, configAcq);
	    document.getElementById("acqLegend").innerHTML = lineAcq.generateLegend();

	    var items = document.querySelectorAll(
	      "#user-acquisition .nav-tabs .nav-item"
	    );
	    items.forEach(function (item, index) {
	      item.addEventListener("click", function () {
	        configAcq.data.datasets[0].data = acqData[index].first;
	        configAcq.data.datasets[1].data = acqData[index].second;
	        configAcq.data.datasets[2].data = acqData[index].third;
	        lineAcq.update();
	      });
	    });
	  }

	  /*======== 16. ANALYTICS - ACTIVITY CHART ========*/
	  var activity = document.getElementById("activity");
	  if (activity !== null) {
	    var activityData = [
	      {
	        first: [0, 65, 52, 115, 98, 165, 125],
	        second: [45, 38, 100, 87, 152, 187, 85]
	      },
	      {
	        first: [0, 65, 77, 33, 49, 100, 100],
	        second: [88, 33, 20, 44, 111, 140, 77]
	      },
	      {
	        first: [0, 40, 77, 55, 33, 116, 50],
	        second: [55, 32, 20, 55, 111, 134, 66]
	      },
	      {
	        first: [0, 44, 22, 77, 33, 151, 99],
	        second: [60, 32, 120, 55, 19, 134, 88]
	      }
	    ];

	    var config = {
	      // The type of chart we want to create
	      type: "line",
	      // The data for our dataset
	      data: {
	        labels: [
	          "4 Jan",
	          "5 Jan",
	          "6 Jan",
	          "7 Jan",
	          "8 Jan",
	          "9 Jan",
	          "10 Jan"
	        ],
	        datasets: [
	          {
	            label: "Active",
	            backgroundColor: "transparent",
	            borderColor: "rgb(82, 136, 255)",
	            data: activityData[0].first,
	            lineTension: 0,
	            pointRadius: 5,
	            pointBackgroundColor: "rgba(255,255,255,1)",
	            pointHoverBackgroundColor: "rgba(255,255,255,1)",
	            pointBorderWidth: 2,
	            pointHoverRadius: 7,
	            pointHoverBorderWidth: 1
	          },
	          {
	            label: "Inactive",
	            backgroundColor: "transparent",
	            borderColor: "rgb(255, 199, 15)",
	            data: activityData[0].second,
	            lineTension: 0,
	            borderDash: [10, 5],
	            borderWidth: 1,
	            pointRadius: 5,
	            pointBackgroundColor: "rgba(255,255,255,1)",
	            pointHoverBackgroundColor: "rgba(255,255,255,1)",
	            pointBorderWidth: 2,
	            pointHoverRadius: 7,
	            pointHoverBorderWidth: 1
	          }
	        ]
	      },
	      // Configuration options go here
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        scales: {
	          xAxes: [
	            {
	              gridLines: {
	                display: false,
	              },
	              ticks: {
	                fontColor: "#8a909d", // this here
	              },
	            }
	          ],
	          yAxes: [
	            {
	              gridLines: {
	                fontColor: "#8a909d",
	                fontFamily: "Roboto, sans-serif",
	                display: true,
	                color: "#eee",
	                zeroLineColor: "#eee"
	              },
	              ticks: {
	                // callback: function(tick, index, array) {
	                //   return (index % 2) ? "" : tick;
	                // }
	                stepSize: 50,
	                fontColor: "#8a909d",
	                fontFamily: "Roboto, sans-serif"
	              }
	            }
	          ]
	        },
	        tooltips: {
	          mode: "index",
	          intersect: false,
	          titleFontColor: "#888",
	          bodyFontColor: "#555",
	          titleFontSize: 12,
	          bodyFontSize: 15,
	          backgroundColor: "rgba(256,256,256,0.95)",
	          displayColors: true,
	          xPadding: 10,
	          yPadding: 7,
	          borderColor: "rgba(220, 220, 220, 0.9)",
	          borderWidth: 2,
	          caretSize: 6,
	          caretPadding: 5
	        }
	      }
	    };

	    var ctx = document.getElementById("activity").getContext("2d");
	    var myLine = new Chart(ctx, config);

	    var items = document.querySelectorAll("#user-activity .nav-tabs .nav-item");
	    items.forEach(function (item, index) {
	      item.addEventListener("click", function () {
	        config.data.datasets[0].data = activityData[index].first;
	        config.data.datasets[1].data = activityData[index].second;
	        myLine.update();
	      });
	    });
	  }

	  /*======== 17. HORIZONTAL BAR CHART1 ========*/
	  var hbar1 = document.getElementById("hbar1");
	  if (hbar1 !== null) {
	    var hbChart1 = new Chart(hbar1, {
	      type: "horizontalBar",
	      data: {
	        labels: ["India", "USA", "Turkey"],
	        datasets: [
	          {
	            label: "signup",
	            data: [18, 13, 9.5],
	            backgroundColor: "#4c84ff"
	          }
	        ]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        scales: {
	          xAxes: [
	            {
	              gridLines: {
	                drawBorder: false,
	                display: true,
	                color: "#eee",
	                zeroLineColor: "#eee",
	                tickMarkLength: 3
	              },
	              ticks: {
	                display: true, // false will hide main x-axis line
	                beginAtZero: true,
	                fontFamily: "Roboto, sans-serif",
	                fontColor: "#8a909d",
	                callback: function (value) {
	                  return value + " %";
	                }
	              }
	            }
	          ],
	          yAxes: [
	            {
	              gridLines: {
	                drawBorder: false, // hide main y-axis line
	                display: false
	              },
	              ticks: {
	                display: true,
	                beginAtZero: false,
	                fontFamily: "Roboto, sans-serif",
	                fontColor: "#8a909d",
	                fontSize: 14
	              },
	              barPercentage: 1.6,
	              categoryPercentage: 0.2
	            }
	          ]
	        },
	        tooltips: {
	          mode: "index",
	          titleFontColor: "#888",
	          bodyFontColor: "#555",
	          titleFontSize: 12,
	          bodyFontSize: 15,
	          backgroundColor: "rgba(256,256,256,0.95)",
	          displayColors: true,
	          xPadding: 10,
	          yPadding: 7,
	          borderColor: "rgba(220, 220, 220, 0.9)",
	          borderWidth: 2,
	          caretSize: 6,
	          caretPadding: 5
	        }
	      }
	    });
	  }
	  /*======== 18. HORIZONTAL BAR CHART2 ========*/
	  var hbar2 = document.getElementById("hbar2");
	  if (hbar2 !== null) {
	    var hbChart2 = new Chart(hbar2, {
	      type: "horizontalBar",
	      data: {
	        labels: ["Florida", "Poland", "UK"],
	        datasets: [
	          {
	            label: "signup",
	            data: [7.5, 4.6, 4],
	            backgroundColor: "#4c84ff"
	          }
	        ]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        scales: {
	          xAxes: [
	            {
	              gridLines: {
	                drawBorder: false,
	                display: true,
	                color: "#eee",
	                zeroLineColor: "#eee",
	                tickMarkLength: 3
	              },
	              ticks: {
	                display: true, // false will hide main x-axis line
	                beginAtZero: true,
	                fontFamily: "Roboto, sans-serif",
	                fontColor: "#8a909d",
	                max: 20,
	                callback: function (value) {
	                  return value + "%";
	                }
	              }
	            }
	          ],
	          yAxes: [
	            {
	              gridLines: {
	                drawBorder: false, // hide main y-axis line
	                display: false
	              },
	              ticks: {
	                display: true,
	                beginAtZero: false,
	                fontFamily: "Roboto, sans-serif",
	                fontColor: "#8a909d",
	                fontSize: 14
	              },
	              barPercentage: 1.6,
	              categoryPercentage: 0.2
	            }
	          ]
	        },
	        tooltips: {
	          mode: "index",
	          titleFontColor: "#888",
	          bodyFontColor: "#555",
	          titleFontSize: 12,
	          bodyFontSize: 15,
	          backgroundColor: "rgba(256,256,256,0.95)",
	          displayColors: true,
	          xPadding: 10,
	          yPadding: 7,
	          borderColor: "rgba(220, 220, 220, 0.9)",
	          borderWidth: 2,
	          caretSize: 6,
	          caretPadding: 5
	        }
	      }
	    });
	  }

	  /*======== 19. DEVICE - DOUGHNUT CHART ========*/
	  var deviceChart = document.getElementById("deviceChart");
	  if (deviceChart !== null) {
	    var mydeviceChart = new Chart(deviceChart, {
	      type: "doughnut",
	      data: {
	        labels: ["Desktop", "Tablet", "Mobile"],
	        datasets: [
	          {
	            label: ["Desktop", "Tablet", "Mobile"],
	            data: [60000, 15000, 25000],
	            backgroundColor: [
	              "rgba(76, 132, 255, 1)",
	              "rgba(76, 132, 255, 0.85)",
	              "rgba(76, 132, 255, 0.70)",
	            ],
	            borderWidth: 1
	          }
	        ]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        legend: {
	          display: false
	        },
	        cutoutPercentage: 75,
	        tooltips: {
	          callbacks: {
	            title: function (tooltipItem, data) {
	              return data["labels"][tooltipItem[0]["index"]];
	            },
	            label: function (tooltipItem, data) {
	              return (
	                data["datasets"][0]["data"][tooltipItem["index"]] + " Sessions"
	              );
	            }
	          },

	          titleFontColor: "#888",
	          bodyFontColor: "#555",
	          titleFontSize: 12,
	          bodyFontSize: 15,
	          backgroundColor: "rgba(256,256,256,0.95)",
	          displayColors: true,
	          xPadding: 10,
	          yPadding: 7,
	          borderColor: "rgba(220, 220, 220, 0.9)",
	          borderWidth: 2,
	          caretSize: 6,
	          caretPadding: 5
	        }
	      }
	    });
	  }
	});
	/*======== 20. BAR CHART ========*/
	var barX = document.getElementById("barChart");
	if (barX !== null) {
	  var myChart = new Chart(barX, {
	    type: "bar",
	    data: {
	      labels: [
	        "Jan",
	        "Feb",
	        "Mar",
	        "Apr",
	        "May",
	        "Jun",
	        "Jul",
	        "Aug",
	        "Sep",
	        "Oct",
	        "Nov",
	        "Dec"
	      ],
	      datasets: [
	        {
	          label: "signup",
	          data: [5, 6, 4.5, 5.5, 3, 6, 4.5, 6, 8, 3, 5.5, 4],
	          // data: [2, 3.2, 1.8, 2.1, 1.5, 3.5, 4, 2.3, 2.9, 4.5, 1.8, 3.4, 2.8],
	          backgroundColor: "#4c84ff"
	        }
	      ]
	    },
	    options: {
	      responsive: true,
	      maintainAspectRatio: false,
	      legend: {
	        display: false
	      },
	      scales: {
	        xAxes: [
	          {
	            gridLines: {
	              drawBorder: false,
	              display: false
	            },
	            ticks: {
	              display: false, // hide main x-axis line
	              beginAtZero: true
	            },
	            barPercentage: 1.8,
	            categoryPercentage: 0.2
	          }
	        ],
	        yAxes: [
	          {
	            gridLines: {
	              drawBorder: false, // hide main y-axis line
	              display: false
	            },
	            ticks: {
	              display: false,
	              beginAtZero: true
	            }
	          }
	        ]
	      },
	      tooltips: {
	        titleFontColor: "#888",
	        bodyFontColor: "#555",
	        titleFontSize: 12,
	        bodyFontSize: 15,
	        backgroundColor: "rgba(256,256,256,0.95)",
	        displayColors: false,
	        borderColor: "rgba(220, 220, 220, 0.9)",
	        borderWidth: 2
	      }
	    }
	  });
	}
	/*======== 21. BAR CHART1 ========*/
	var bar1 = document.getElementById("barChart1");
	if (bar1 !== null) {
	  var myChart = new Chart(bar1, {
	    type: "bar",
	    data: {
	      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
	      datasets: [
	        {
	          label: "signup",
	          data: [5, 7.5, 5.5, 6.5, 4, 9],
	          // data: [2, 3.2, 1.8, 2.1, 1.5, 3.5, 4, 2.3, 2.9, 4.5, 1.8, 3.4, 2.8],
	          backgroundColor: "#4c84ff"
	        }
	      ]
	    },
	    options: {
	      responsive: true,
	      maintainAspectRatio: false,
	      legend: {
	        display: false
	      },
	      scales: {
	        xAxes: [
	          {
	            gridLines: {
	              drawBorder: false,
	              display: false
	            },
	            ticks: {
	              display: false, // hide main x-axis line
	              beginAtZero: true
	            },
	            barPercentage: 1.8,
	            categoryPercentage: 0.2
	          }
	        ],
	        yAxes: [
	          {
	            gridLines: {
	              drawBorder: false, // hide main y-axis line
	              display: false
	            },
	            ticks: {
	              display: false,
	              beginAtZero: true
	            }
	          }
	        ]
	      },
	      tooltips: {
	        enabled: false
	      }
	    }
	  });
	}
	/*======== 22. BAR CHART2 ========*/
	var bar2 = document.getElementById("barChart2");
	if (bar2 !== null) {
	  var myChart2 = new Chart(bar2, {
	    type: "bar",
	    data: {
	      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
	      datasets: [
	        {
	          label: "signup",
	          data: [5, 7.5, 5.5, 6.5, 4, 9],
	          // data: [2, 3.2, 1.8, 2.1, 1.5, 3.5, 4, 2.3, 2.9, 4.5, 1.8, 3.4, 2.8],
	          backgroundColor: "#ffffff"
	        }
	      ]
	    },
	    options: {
	      responsive: true,
	      maintainAspectRatio: false,
	      legend: {
	        display: false
	      },
	      scales: {
	        xAxes: [
	          {
	            gridLines: {
	              drawBorder: false,
	              display: false
	            },
	            ticks: {
	              display: false, // hide main x-axis line
	              beginAtZero: true
	            },
	            barPercentage: 1.8,
	            categoryPercentage: 0.2
	          }
	        ],
	        yAxes: [
	          {
	            gridLines: {
	              drawBorder: false, // hide main y-axis line
	              display: false
	            },
	            ticks: {
	              display: false,
	              beginAtZero: true
	            }
	          }
	        ]
	      },
	      tooltips: {
	        enabled: false
	      }
	    }
	  });
	}
	/*======== 23. BAR CHART3 ========*/
	var bar3 = document.getElementById("barChart3");
	if (bar3 !== null) {
	  var bar_Chart = new Chart(bar3, {
	    type: "bar",
	    data: {
	      labels: [
	        "Jan",
	        "Feb",
	        "Mar",
	        "Apr",
	        "May",
	        "Jun",
	        "Jul",
	        "Aug",
	        "Sep",
	        "Oct",
	        "Nov",
	        "Dec"
	      ],
	      datasets: [
	        {
	          label: "signup",
	          data: [5, 6, 4.5, 5.5, 3, 6, 4.5, 6, 8, 3, 5.5, 4],
	          // data: [2, 3.2, 1.8, 2.1, 1.5, 3.5, 4, 2.3, 2.9, 4.5, 1.8, 3.4, 2.8],
	          backgroundColor: "#ffffff"
	        }
	      ]
	    },
	    options: {
	      responsive: true,
	      maintainAspectRatio: false,
	      legend: {
	        display: false
	      },
	      scales: {
	        xAxes: [
	          {
	            gridLines: {
	              drawBorder: false,
	              display: false
	            },
	            ticks: {
	              display: false, // hide main x-axis line
	              beginAtZero: true
	            },
	            barPercentage: 1.8,
	            categoryPercentage: 0.2
	          }
	        ],
	        yAxes: [
	          {
	            gridLines: {
	              drawBorder: false, // hide main y-axis line
	              display: false
	            },
	            ticks: {
	              display: false,
	              beginAtZero: true
	            }
	          }
	        ]
	      },
	      tooltips: {
	        enabled: true
	      }
	    }
	  });
	}

	/*======== 24. GRADIENT LINE CHART1 ========*/
	var gline1 = document.getElementById("gline1");
	if (gline1 !== null) {
	  gline1 = gline1.getContext("2d");
	  var gradientFill = gline1.createLinearGradient(0, 120, 0, 0);
	  gradientFill.addColorStop(0, "rgba(41,204,151,0.10196)");
	  gradientFill.addColorStop(1, "rgba(41,204,151,0.30196)");

	  var lChart = new Chart(gline1, {
	    type: "line",
	    data: {
	      labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
	      datasets: [
	        {
	          label: "Rev",
	          lineTension: 0,
	          pointRadius: 0.1,
	          pointBackgroundColor: "rgba(255,255,255,1)",
	          pointBorderWidth: 2,
	          fill: true,
	          backgroundColor: gradientFill,
	          borderColor: "#29cc97",
	          borderWidth: 2,
	          data: [0, 5.5, 4, 9, 4, 7, 4.7]
	        }
	      ]
	    },
	    options: {
	      responsive: true,
	      maintainAspectRatio: false,
	      legend: {
	        display: false
	      },
	      scales: {
	        xAxes: [
	          {
	            gridLines: {
	              drawBorder: false,
	              display: false
	            },
	            ticks: {
	              display: false, // hide main x-axis line
	              beginAtZero: true
	            },
	            barPercentage: 1.8,
	            categoryPercentage: 0.2
	          }
	        ],
	        yAxes: [
	          {
	            gridLines: {
	              drawBorder: false, // hide main y-axis line
	              display: false
	            },
	            ticks: {
	              display: false,
	              beginAtZero: true
	            }
	          }
	        ]
	      },
	      tooltips: {
	        enabled: false
	      }
	    }
	  });
	}
	/*======== 25. GRADIENT LINE CHART2 ========*/
	var gline2 = document.getElementById("gline2");
	if (gline2 !== null) {
	  gline2 = gline2.getContext("2d");
	  var gradientFill = gline2.createLinearGradient(0, 90, 0, 0);
	  gradientFill.addColorStop(0, "rgba(255,255,255,0.10196)");
	  gradientFill.addColorStop(1, "rgba(255,255,255,0.30196)");

	  var lChart2 = new Chart(gline2, {
	    type: "line",
	    data: {
	      labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
	      datasets: [
	        {
	          label: "Rev",
	          lineTension: 0,
	          pointRadius: 0.1,
	          pointBackgroundColor: "rgba(255,255,255,1)",
	          pointBorderWidth: 2,
	          fill: true,
	          backgroundColor: gradientFill,
	          borderColor: "#ffffff",
	          borderWidth: 2,
	          data: [0, 5.5, 4, 9, 4, 7, 4.7]
	        }
	      ]
	    },
	    options: {
	      responsive: true,
	      maintainAspectRatio: false,
	      legend: {
	        display: false
	      },
	      scales: {
	        xAxes: [
	          {
	            gridLines: {
	              drawBorder: false,
	              display: false
	            },
	            ticks: {
	              display: false, // hide main x-axis line
	              beginAtZero: true
	            },
	            barPercentage: 1.8,
	            categoryPercentage: 0.2
	          }
	        ],
	        yAxes: [
	          {
	            gridLines: {
	              drawBorder: false, // hide main y-axis line
	              display: false
	            },
	            ticks: {
	              display: false,
	              beginAtZero: true
	            }
	          }
	        ]
	      },
	      tooltips: {
	        enabled: false
	      }
	    }
	  });
	}
	/*======== 26. GRADIENT LINE CHART3 ========*/
	var gline3 = document.getElementById("line3");
	if (gline3 !== null) {
	  gline3 = gline3.getContext("2d");
	  var gradientFill = gline3.createLinearGradient(0, 90, 0, 0);
	  gradientFill.addColorStop(0, "rgba(255,255,255,0.10196)");
	  gradientFill.addColorStop(1, "rgba(255,255,255,0.30196)");

	  var lChart3 = new Chart(gline3, {
	    type: "line",
	    data: {
	      labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
	      datasets: [
	        {
	          label: "Rev",
	          lineTension: 0,
	          pointRadius: 4,
	          pointBackgroundColor: "#29cc97",
	          pointBorderWidth: 2,
	          fill: true,
	          backgroundColor: gradientFill,
	          borderColor: "#ffffff",
	          borderWidth: 2,
	          data: [0, 4, 3, 5.5, 3, 4.7, 1]
	        }
	      ]
	    },
	    options: {
	      responsive: true,
	      maintainAspectRatio: false,
	      layout: {
	        padding: {
	          right: 10
	        }
	      },
	      legend: {
	        display: false
	      },
	      scales: {
	        xAxes: [
	          {
	            gridLines: {
	              drawBorder: false,
	              display: false
	            },
	            ticks: {
	              display: false, // hide main x-axis line
	              beginAtZero: true
	            },
	            barPercentage: 1.8,
	            categoryPercentage: 0.2
	          }
	        ],
	        yAxes: [
	          {
	            gridLines: {
	              drawBorder: false, // hide main y-axis line
	              display: false
	            },
	            ticks: {
	              display: false,
	              beginAtZero: true
	            }
	          }
	        ]
	      },
	      tooltips: {
	        enabled: true
	      }
	    }
	  });
	}
	/*======== 27. ACQUISITION3 ========*/
	var acquisition3 = document.getElementById("bar3");
	if (acquisition3 !== null) {
	  var acChart3 = new Chart(acquisition3, {
	    // The type of chart we want to create
	    type: "bar",

	    // The data for our dataset
	    data: {
	      labels: ["4 Jan", "5 Jan", "6 Jan", "7 Jan", "8 Jan", "9 Jan", "10 Jan"],
	      datasets: [
	        {
	          label: "Referral",
	          backgroundColor: "rgb(76, 132, 255)",
	          borderColor: "rgba(76, 132, 255,0)",
	          data: [78, 90, 70, 75, 45, 52, 22],
	          pointBackgroundColor: "rgba(76, 132, 255,0)",
	          pointHoverBackgroundColor: "rgba(76, 132, 255,1)",
	          pointHoverRadius: 3,
	          pointHitRadius: 30
	        },
	        {
	          label: "Direct",
	          backgroundColor: "rgb(254, 196, 0)",
	          borderColor: "rgba(254, 196, 0,0)",
	          data: [88, 115, 80, 96, 65, 77, 38],
	          pointBackgroundColor: "rgba(254, 196, 0,0)",
	          pointHoverBackgroundColor: "rgba(254, 196, 0,1)",
	          pointHoverRadius: 3,
	          pointHitRadius: 30
	        },
	        {
	          label: "Social",
	          backgroundColor: "rgb(41, 204, 151)",
	          borderColor: "rgba(41, 204, 151,0)",
	          data: [103, 135, 102, 116, 83, 97, 55],
	          pointBackgroundColor: "rgba(41, 204, 151,0)",
	          pointHoverBackgroundColor: "rgba(41, 204, 151,1)",
	          pointHoverRadius: 3,
	          pointHitRadius: 30
	        }
	      ]
	    },

	    // Configuration options go here
	    options: {
	      responsive: true,
	      maintainAspectRatio: false,
	      legend: {
	        display: false
	      },
	      scales: {
	        xAxes: [
	          {
	            gridLines: {
	              display: false
	            }
	          }
	        ],
	        yAxes: [
	          {
	            gridLines: {
	              display: true
	            },
	            ticks: {
	              beginAtZero: true,
	              stepSize: 50,
	              fontColor: "#8a909d",
	              fontFamily: "Roboto, sans-serif",
	              max: 200
	            }
	          }
	        ]
	      },
	      tooltips: {}
	    }
	  });
	  document.getElementById("customLegend").innerHTML = acChart3.generateLegend();
	}
	/*======== 28. STATISTICS ========*/
	var mstat = document.getElementById("mstat");
	if (mstat !== null) {
	  var msdChart = new Chart(mstat, {
	    type: "line",
	    data: {
	      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
	      datasets: [
	        {
	          label: "Old",
	          pointRadius: 4,
	          pointBackgroundColor: "rgba(255,255,255,1)",
	          pointBorderWidth: 2,
	          fill: true,
	          lineTension: 0,
	          backgroundColor: "rgba(66,208,163,0.2)",
	          borderWidth: 2.5,
	          borderColor: "#42d0a3",
	          data: [10000, 17500, 2000, 11000, 19000, 10500, 18000]
	        },
	        {
	          label: "New",
	          pointRadius: 4,
	          pointBackgroundColor: "rgba(255,255,255,1)",
	          pointBorderWidth: 2,
	          fill: true,
	          lineTension: 0,
	          backgroundColor: "rgba(76,132,255,0.2)",
	          borderWidth: 2.5,
	          borderColor: "#4c84ff",
	          data: [2000, 11500, 10000, 14000, 11000, 16800, 14500]
	        }
	      ]
	    },
	    options: {
	      maintainAspectRatio: false,
	      legend: {
	        display: false
	      },
	      scales: {
	        xAxes: [
	          {
	            gridLines: {
	              drawBorder: true,
	              display: false
	            },
	            ticks: {
	              display: true, // hide main x-axis line
	              beginAtZero: true,
	              fontFamily: "Roboto, sans-serif",
	              fontColor: "#8a909d"
	            }
	          }
	        ],
	        yAxes: [
	          {
	            gridLines: {
	              drawBorder: true, // hide main y-axis line
	              display: true
	            },
	            ticks: {
	              callback: function (value) {
	                var ranges = [
	                  { divider: 1e6, suffix: "M" },
	                  { divider: 1e3, suffix: "k" }
	                ];
	                function formatNumber(n) {
	                  for (var i = 0; i < ranges.length; i++) {
	                    if (n >= ranges[i].divider) {
	                      return (
	                        (n / ranges[i].divider).toString() + ranges[i].suffix
	                      );
	                    }
	                  }
	                  return n;
	                }
	                return formatNumber(value);
	              },
	              stepSize: 5000,
	              fontColor: "#8a909d",
	              fontFamily: "Roboto, sans-serif",
	              beginAtZero: true
	            }
	          }
	        ]
	      },
	      tooltips: {
	        enabled: true
	      }
	    }
	  });
	}

	/* ====== Index ======

	1. BASIC MAP
	2. MAP WITH MARKER
	3. POLYGONAL MAP
	4. POLYLINE MAP
	5. MULTIPLE MARKER
	6. STYLED MAP

	====== End ======*/

	$(function () {

	  /*======== 1. BASIC MAP ========*/
	  function basicMap() {
	    var denver = new google.maps.LatLng(39.5501, -105.7821);
	    var map = new google.maps.Map(document.getElementById("basicMap"), {
	      zoom: 8,
	      center: denver
	    });
	  }

	  /*======== 2. MAP WITH MARKER ========*/
	  function markerMap() {
	    var colorado = new google.maps.LatLng(38.82505, -104.821752);
	    var map = new google.maps.Map(document.getElementById("mapMarker"), {
	      zoom: 8,
	      center: colorado
	    });

	    var contentString =
	      '<div id="content">' +
	      '<h4 id="infoTitle" class="info-title">Colorado</h4>' +
	      "</div>";

	    var infowindow = new google.maps.InfoWindow({
	      content: contentString
	    });
	    var marker = new google.maps.Marker({
	      position: colorado,
	      map: map
	    });
	    infowindow.open(map, marker);
	    marker.addListener("click", function () {
	      infowindow.open(map, marker);
	    });
	  }

	  /*======== 3. POLYGONAL MAP ========*/
	  function polyMap() {
	    var center = new google.maps.LatLng(37.347442, -91.242551);
	    var map = new google.maps.Map(document.getElementById("polygonalMap"), {
	      zoom: 5,
	      center: center,
	      mapTypeId: "terrain"
	    });

	    // Define the LatLng coordinates for the polygon's path.
	    var ractangleCoords = [
	      { lat: 39.086254, lng: -94.567509 },
	      { lat: 35.293261, lng: -97.210534 },
	      { lat: 36.058717, lng: -86.863566 },
	      { lat: 38.498833, lng: -90.133947 },
	      { lat: 39.086254, lng: -94.567509 }
	    ];

	    // Construct the polygon.
	    var kansasRact = new google.maps.Polygon({
	      paths: ractangleCoords,
	      strokeColor: "#4c84ff",
	      strokeOpacity: 0.8,
	      strokeWeight: 2,
	      fillColor: "#4c84ff",
	      fillOpacity: 0.35
	    });
	    kansasRact.setMap(map);
	  }

	  /*======== 4. POLYLINE MAP ========*/
	  function polylineMap() {
	    var center = new google.maps.LatLng(39.399273, -86.151248);
	    var map = new google.maps.Map(document.getElementById("polylineMap"), {
	      zoom: 5,
	      center: center,
	      mapTypeId: "terrain"
	    });

	    var flightPlanCoordinates = [
	      { lat: 39.08199, lng: -94.568882 },
	      { lat: 38.538338, lng: -90.220769 },
	      { lat: 39.399273, lng: -86.151248 },
	      { lat: 38.830073, lng: -77.098642 }
	    ];
	    var flightPath = new google.maps.Polyline({
	      path: flightPlanCoordinates,
	      geodesic: true,
	      strokeColor: "#4c84ff",
	      strokeOpacity: 1.0,
	      strokeWeight: 3
	    });

	    flightPath.setMap(map);
	  }

	  /*======== 5. MULTIPLE MARKER ========*/
	  function multiMarkerMap() {
	    var locations = [
	      ["Bondi Beach", -33.890542, 151.274856, 4],
	      ["Coogee Beach", -33.923036, 151.259052, 5],
	      ["Cronulla Beach", -34.028249, 151.157507, 3],
	      ["Manly Beach", -33.80010128657071, 151.28747820854187, 2],
	      ["Maroubra Beach", -33.950198, 151.259302, 1]
	    ];

	    var center = new google.maps.LatLng(-33.92, 151.25);
	    var map = new google.maps.Map(document.getElementById("multiMarkerMap"), {
	      zoom: 10,
	      center: center,
	      mapTypeId: google.maps.MapTypeId.ROADMAP
	    });

	    var infowindow = new google.maps.InfoWindow();

	    var marker, i;

	    for (i = 0; i < locations.length; i++) {
	      marker = new google.maps.Marker({
	        position: new google.maps.LatLng(locations[i][1], locations[i][2]),
	        map: map
	      });

	      google.maps.event.addListener(
	        marker,
	        "click",
	        (function (marker, i) {
	          return function () {
	            infowindow.setContent(locations[i][0]);
	            infowindow.open(map, marker);
	          };
	        })(marker, i)
	      );
	    }
	  }

	  /*======== 6. STYLED MAP ========*/
	  function styleMap() {
	    var style = [
	      {
	        stylers: [
	          {
	            hue: "#2c3e50"
	          },
	          {
	            saturation: 250
	          }
	        ]
	      },
	      {
	        featureType: "road",
	        elementType: "geometry",
	        stylers: [
	          {
	            lightness: 50
	          },
	          {
	            visibility: "simplified"
	          }
	        ]
	      },
	      {
	        featureType: "road",
	        elementType: "labels",
	        stylers: [
	          {
	            visibility: "off"
	          }
	        ]
	      }
	    ];

	    var dakota = new google.maps.LatLng(44.3341, -100.305);
	    var map = new google.maps.Map(document.getElementById("styleMap"), {
	      zoom: 7,
	      center: dakota,
	      mapTypeId: "roadmap",
	      styles: style
	    });
	  }

	  if (document.getElementById("google-map")) {
	    google.maps.event.addDomListener(window, "load", basicMap);

	    google.maps.event.addDomListener(window, "load", markerMap);

	    google.maps.event.addDomListener(window, "load", polyMap);

	    google.maps.event.addDomListener(window, "load", polylineMap);

	    google.maps.event.addDomListener(window, "load", multiMarkerMap);

	    google.maps.event.addDomListener(window, "load", styleMap);
	  }
	});

	/* ====== Index ======

	1. JEKYLL INSTANT SEARCH
	2. SCROLLBAR CONTENT
	3. TOOLTIPS AND POPOVER
	4. MULTIPLE SELECT
	4. LOADING BUTTON
	5. TOASTER
	6. PROGRESS BAR
	7. CIRCLE PROGRESS
	8. DATE PICKER

	====== End ======*/



	$(document).ready(function() {

	  /*======== 1. JEKYLL INSTANT SEARCH ========*/

	  // var searchInput = $('#search-input');
	  // if(searchInput.length != 0){
	  //   SimpleJekyllSearch.init({
	  //     searchInput: document.getElementById('search-input'),
	  //     resultsContainer: document.getElementById('search-results'),
	  //     dataSource: '/assets/data/search.json',
	  //     searchResultTemplate: '<li><div class="link"><a href="{link}">{label}</a></div><div class="location">{location}</div><\/li>',
	  //     noResultsText: '<li>No results found</li>',
	  //     limit: 10,
	  //     fuzzy: true,
	  //   });
	  // }


	  /*======== Upload =======*/

	  $(".artist-fileupload").fileinput({
	    theme: "fas",
	  });


	  /*======== 2. SCROLLBAR CONTENT ========*/


	  var dataScrollHeight = $("[data-scroll-height]");
	  function scrollWithBigMedia(media) {
	    if (media.matches) {
	      /* The viewport is greater than, or equal to media screen size */
	      dataScrollHeight.each(function () {
	        var scrollHeight = $(this).attr("data-scroll-height");
	        $(this).css({ height: scrollHeight + "px", overflow: "hidden" });
	      });

	      //For content that needs scroll
	      $(".slim-scroll")
	        .slimScroll({
	          opacity: 0,
	          height: "100%",
	          color: "#999",
	          size: "5px",
	          touchScrollStep: 50
	        })
	        .mouseover(function () {
	          $(this)
	            .next(".slimScrollBar")
	            .css("opacity", 0.4);
	        });
	    } else {
	      /* The viewport is less than media screen size */
	      dataScrollHeight.css({ height: "auto", overflow: "auto" });
	    }
	  }

	  if (dataScrollHeight.length != 0) {
	    var media = window.matchMedia("(min-width: 992px)");
	    scrollWithBigMedia(media); // Call listener function at run time
	    media.addListener(scrollWithBigMedia); // Attach listener function on state changes
	  }

	  var chatLeftContent = $('#chat-left-content');
	  if(chatLeftContent.length != 0){
	    chatLeftContent.slimScroll({});
	  }
	  var chatRightContent = $('#chat-right-content');
	  if(chatRightContent.length != 0){
	    chatRightContent.slimScroll({});
	  }

	  /*======== 3. TOOLTIPS AND POPOVER ========*/
	  var tooltip = $('[data-toggle="tooltip"]');
	  if(tooltip.length != 0){
	    tooltip.tooltip({
	      container: "body",
	      template:
	        '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
	    });
	  }

	  var popover = $('[data-toggle="popover"]');

	  if(popover.length != 0){
	    popover.popover();
	  }


	  /*======== 4. MULTIPLE SELECT ========*/
	  var multipleSelect = $(".js-example-basic-multiple");
	  if(multipleSelect.length != 0){
	    multipleSelect.select2();
	  }

	  /*======== 4. LOADING BUTTON ========*/

	  var laddaButton = $('.ladda-button');

	  if(laddaButton.length != 0){
	    Ladda.bind(".ladda-button", {
	      timeout: 5000
	    });

	    Ladda.bind(".progress-demo button", {
	      callback: function (instance) {
	        var progress = 0;
	        var interval = setInterval(function () {
	          progress = Math.min(progress + Math.random() * 0.1, 1);
	          instance.setProgress(progress);

	          if (progress === 1) {
	            instance.stop();
	            clearInterval(interval);
	          }
	        }, 200);
	      }
	    });
	  }

	  /*======== 5. TOASTER ========*/

	  var toaster = $('#toaster');

	  function callToaster(positionClass) {
	    toastr.options = {
	      closeButton: true,
	      debug: false,
	      newestOnTop: false,
	      progressBar: true,
	      positionClass: positionClass,
	      preventDuplicates: false,
	      onclick: null,
	      showDuration: "300",
	      hideDuration: "1000",
	      timeOut: "5000",
	      extendedTimeOut: "1000",
	      showEasing: "swing",
	      hideEasing: "linear",
	      showMethod: "fadeIn",
	      hideMethod: "fadeOut"
	    };
	    toastr.success("Welcome to Sleek Dashboard", "Howdy!");
	  }

	  if(toaster.length != 0){
	    if (document.dir != "rtl") {
	      callToaster("toast-top-right");
	    } else {
	      callToaster("toast-top-left");
	    }

	  }

	  /*======== 6. PROGRESS BAR ========*/
	  $('.slim-scroll-right-sidebar-2').slimScroll({
	    opacity: 0,
	    height: '100%',
	    color: "#999",
	    size: "5px",
	    touchScrollStep: 50
	  })
	    .mouseover(function () {
	      $(this)
	        .next(".slimScrollBar")
	        .css("opacity", 0.4);
	    });

	    /*======== 7. CIRCLE PROGRESS ========*/
	    var circle = $('.circle');
	    var gray = '#f5f6fa';

	    if(circle.length != 0){
	      circle.circleProgress({
	        lineCap: "round",
	        startAngle: 4.8,
	        emptyFill: [gray]
	      });
	    }

	  /*======== 8. DATE PICKER ========*/
	  // $('input[name="dateRange"]').daterangepicker({
	  //   autoUpdateInput: false,
	  //   singleDatePicker: true,
	  //   locale: {
	  //     cancelLabel: 'Clear'
	  //   }
	  // });

	  // $('input[name="dateRange"]').on('apply.daterangepicker', function (ev, picker) {
	  //   $(this).val(picker.startDate.format('MM/DD/YYYY'));
	  // });

	  // $('input[name="dateRange"]').on('cancel.daterangepicker', function (ev, picker) {
	  //   $(this).val('');
	  // });




	  $(document).on('change', '.check-all', function () {
	    $(this).closest('table').find('tbody :checkbox').prop('checked', $(this).is(':checked'));
	  });

	  $(document).on('change', 'tbody :checkbox', function () {
	    $(this).closest('table').find('.check-all')
	      .prop('checked', ($(this).closest('table').find('tbody :checkbox:checked').length == $(this).closest('table').find('tbody :checkbox').length));
	  });

	  $(document).on('change', '.delete-item , .check-all', function () {
	    var btn = $(this).closest('.card').find('.btn-delete');
	    var deleteForm = $(this).closest('.card').find('.delete-form');
	    btn.html('<i class="fa fa-trash"></i>');
	    deleteForm.html('');

	    var csrfToken = $('meta[name=csrf-token]').attr('content');
	    deleteForm.append('<input type="hidden" name="_token" value="'+csrfToken+'">');
	    deleteForm.append('<input type="hidden" name="_method" value="delete">');
	    $(this).closest('table').find('.delete-item:checked').each(function () {
	      deleteForm.append('<input type="hidden" name="id[]" value="' + $(this).val() + '">');
	    });

	    if ($(this).closest('table').find('.delete-item:checked').length > 0) {
	      btn.removeClass('d-none');
	    } else {
	      btn.addClass('d-none');
	    }
	  });

	  $('.btn-delete').on('click',function(e){
	    if(confirm('از حذف اطلاعات اطمینان دارید؟')){
	      $(this).closest('.card').find('.delete-form').submit();
	    }
	  });


	  $('.table-responsive-stack').find("th").each(function (i) {
	    $('.table-responsive-stack td:nth-child(' + (i + 1) + '):not(.not-dot)').prepend('<span class="table-responsive-stack-thead">' + $(this).text() + ':</span> ');
	    $('.table-responsive-stack-thead').hide();
	  });

	  $('.table-responsive-stack').each(function () {
	    $(this).find('.form-check').css('display', 'inline-flex');
	  });

	  function flexTable() {
	    if ($(window).width() < 768) {
	      $(".table-responsive-stack").each(function (i) {
	        $(this).find(".table-responsive-stack-thead").show();
	        $(this).find('thead').hide();
	      });
	    } else {
	      $(".table-responsive-stack").each(function (i) {
	        $(this).find(".table-responsive-stack-thead").hide();
	        $(this).find('thead').show();
	      });
	    }
	  }
	  flexTable();

	  window.onresize = function (event) {
	    flexTable();
	  };


	});

})));
//# sourceMappingURL=sleek.bundle.js.map
