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
	  * Bootstrap v4.6.0 (https://getbootstrap.com/)
	  * Copyright 2011-2021 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
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
	   * Bootstrap (v4.6.0): util.js
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
	  var VERSION = '4.6.0';
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
	  var VERSION$1 = '4.6.0';
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
	  var VERSION$2 = '4.6.0';
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
	        this._updateInterval();

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

	    _proto._updateInterval = function _updateInterval() {
	      var element = this._activeElement || this._element.querySelector(SELECTOR_ACTIVE_ITEM);

	      if (!element) {
	        return;
	      }

	      var elementInterval = parseInt(element.getAttribute('data-interval'), 10);

	      if (elementInterval) {
	        this._config.defaultInterval = this._config.defaultInterval || this._config.interval;
	        this._config.interval = elementInterval;
	      } else {
	        this._config.interval = this._config.defaultInterval || this._config.interval;
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

	      this._activeElement = nextElement;
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
	  var VERSION$3 = '4.6.0';
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
	  var VERSION$4 = '4.6.0';
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
	      } // Totally disable Popper for Dropdowns in Navbar


	      if (!this._inNavbar && usePopper) {
	        /**
	         * Check for Popper dependency
	         * Popper - https://popper.js.org
	         */
	        if (typeof Popper__default['default'] === 'undefined') {
	          throw new TypeError('Bootstrap\'s dropdowns require Popper (https://popper.js.org)');
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
	      }; // Disable Popper if we have a static display

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
	  var VERSION$5 = '4.6.0';
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

	          if (_this9._config.backdrop === 'static') {
	            _this9._triggerBackdropTransition();
	          } else {
	            _this9.hide();
	          }
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
	   * Bootstrap (v4.6.0): tools/sanitizer.js
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
	  var VERSION$6 = '4.6.0';
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
	    customClass: '(string|function)',
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
	    customClass: '',
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
	        throw new TypeError('Bootstrap\'s tooltips require Popper (https://popper.js.org)');
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
	        $__default['default'](tip).addClass(CLASS_NAME_SHOW$4);
	        $__default['default'](tip).addClass(this.config.customClass); // If this is a touch-enabled device we add extra
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
	  var VERSION$7 = '4.6.0';
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
	  var VERSION$8 = '4.6.0';
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
	  var VERSION$9 = '4.6.0';
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
	  var VERSION$a = '4.6.0';
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

	var persianDate$1 = createCommonjsModule(function (module, exports) {
	/*!
	 * 
	 * persian-date -  1.1.0-rc2
	 * Reza Babakhani <babakhani.reza@gmail.com>
	 * http://babakhani.github.io/PersianWebToolkit/docs/persian-date/
	 * Under MIT license 
	 * 
	 * 
	 */
	(function webpackUniversalModuleDefinition(root, factory) {
		module.exports = factory();
	})(commonjsGlobal, function() {
	return /******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};
	/******/
	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {
	/******/
	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;
	/******/
	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			i: moduleId,
	/******/ 			l: false,
	/******/ 			exports: {}
	/******/ 		};
	/******/
	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	/******/
	/******/ 		// Flag the module as loaded
	/******/ 		module.l = true;
	/******/
	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}
	/******/
	/******/
	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;
	/******/
	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;
	/******/
	/******/ 	// identity function for calling harmony imports with the correct context
	/******/ 	__webpack_require__.i = function(value) { return value; };
	/******/
	/******/ 	// define getter function for harmony exports
	/******/ 	__webpack_require__.d = function(exports, name, getter) {
	/******/ 		if(!__webpack_require__.o(exports, name)) {
	/******/ 			Object.defineProperty(exports, name, {
	/******/ 				configurable: false,
	/******/ 				enumerable: true,
	/******/ 				get: getter
	/******/ 			});
	/******/ 		}
	/******/ 	};
	/******/
	/******/ 	// getDefaultExport function for compatibility with non-harmony modules
	/******/ 	__webpack_require__.n = function(module) {
	/******/ 		var getter = module && module.__esModule ?
	/******/ 			function getDefault() { return module['default']; } :
	/******/ 			function getModuleExports() { return module; };
	/******/ 		__webpack_require__.d(getter, 'a', getter);
	/******/ 		return getter;
	/******/ 	};
	/******/
	/******/ 	// Object.prototype.hasOwnProperty.call
	/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
	/******/
	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";
	/******/
	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(__webpack_require__.s = 8);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ (function(module, exports, __webpack_require__) {


	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var durationUnit = __webpack_require__(4).durationUnit;

	var Helpers = function () {
	    function Helpers() {
	        _classCallCheck(this, Helpers);
	    }

	    _createClass(Helpers, [{
	        key: 'toPersianDigit',


	        /**
	         * @description return converted string to persian digit
	         * @param digit
	         * @returns {string|*}
	         */
	        value: function toPersianDigit(digit) {
	            var latinDigit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	            return digit.toString().replace(/\d+/g, function (digit) {
	                var enDigitArr = [],
	                    peDigitArr = [],
	                    i = void 0,
	                    j = void 0;
	                for (i = 0; i < digit.length; i += 1) {
	                    enDigitArr.push(digit.charCodeAt(i));
	                }
	                for (j = 0; j < enDigitArr.length; j += 1) {
	                    peDigitArr.push(String.fromCharCode(enDigitArr[j] + (!!latinDigit && latinDigit === true ? 1584 : 1728)));
	                }
	                return peDigitArr.join('');
	            });
	        }

	        /**
	         * @param number
	         * @param targetLength
	         * @returns {string}
	         */

	    }, {
	        key: 'leftZeroFill',
	        value: function leftZeroFill(number, targetLength) {
	            var output = number + '';
	            while (output.length < targetLength) {
	                output = '0' + output;
	            }
	            return output;
	        }

	        /**
	         * @description normalize duration params and return valid param
	         * @return {{unit: *, value: *}}
	         */

	    }, {
	        key: 'normalizeDuration',
	        value: function normalizeDuration() {
	            var unit = void 0,
	                value = void 0;
	            if (typeof arguments[0] === 'string') {
	                unit = arguments[0];
	                value = arguments[1];
	            } else {
	                value = arguments[0];
	                unit = arguments[1];
	            }
	            if (durationUnit.year.indexOf(unit) > -1) {
	                unit = 'year';
	            } else if (durationUnit.month.indexOf(unit) > -1) {
	                unit = 'month';
	            } else if (durationUnit.week.indexOf(unit) > -1) {
	                unit = 'week';
	            } else if (durationUnit.day.indexOf(unit) > -1) {
	                unit = 'day';
	            } else if (durationUnit.hour.indexOf(unit) > -1) {
	                unit = 'hour';
	            } else if (durationUnit.minute.indexOf(unit) > -1) {
	                unit = 'minute';
	            } else if (durationUnit.second.indexOf(unit) > -1) {
	                unit = 'second';
	            } else if (durationUnit.millisecond.indexOf(unit) > -1) {
	                unit = 'millisecond';
	            }
	            return {
	                unit: unit,
	                value: value
	            };
	        }

	        /**
	         *
	         * @param number
	         * @returns {number}
	         */

	    }, {
	        key: 'absRound',
	        value: function absRound(number) {
	            if (number < 0) {
	                return Math.ceil(number);
	            } else {
	                return Math.floor(number);
	            }
	        }

	        /**
	         *
	         * @param number
	         * @return {number}
	         */

	    }, {
	        key: 'absFloor',
	        value: function absFloor(number) {
	            if (number < 0) {
	                // -0 -> 0
	                return Math.ceil(number) || 0;
	            } else {
	                return Math.floor(number);
	            }
	        }
	    }]);

	    return Helpers;
	}();

	module.exports = Helpers;

	/***/ }),
	/* 1 */
	/***/ (function(module, exports, __webpack_require__) {


	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var TypeChecking = __webpack_require__(10);
	var Algorithms = __webpack_require__(2);
	var Helpers = __webpack_require__(0);
	var Duration = __webpack_require__(5);
	var Validator = __webpack_require__(11);
	var toPersianDigit = new Helpers().toPersianDigit;
	var leftZeroFill = new Helpers().leftZeroFill;
	var normalizeDuration = new Helpers().normalizeDuration;
	var fa = __webpack_require__(7);
	var en = __webpack_require__(6);

	/**
	 * @description persian date class
	 */

	var PersianDateClass = function () {

	    /**
	     * @param input
	     * @return {PersianDateClass}
	     */
	    function PersianDateClass(input) {
	        _classCallCheck(this, PersianDateClass);

	        this.calendarType = PersianDateClass.calendarType;
	        this.localType = PersianDateClass.localType;
	        this.leapYearMode = PersianDateClass.leapYearMode;

	        this.algorithms = new Algorithms(this);
	        this.version = "1.1.0-rc2";
	        this._utcMode = false;
	        if (this.localType !== 'fa') {
	            this.formatPersian = false;
	        } else {
	            this.formatPersian = '_default';
	        }
	        this.State = this.algorithms.State;
	        this.setup(input);
	        if (this.State.isInvalidDate) {
	            // Return Date like message
	            return new Date([-1, -1]);
	        }
	        return this;
	    }

	    /**
	     * @param input
	     */


	    _createClass(PersianDateClass, [{
	        key: 'setup',
	        value: function setup(input) {
	            // Convert Any thing to Gregorian Date
	            if (TypeChecking.isDate(input)) {
	                this._gDateToCalculators(input);
	            } else if (TypeChecking.isArray(input)) {
	                if (!Validator.validateInputArray(input)) {
	                    this.State.isInvalidDate = true;
	                    return false;
	                }
	                this.algorithmsCalc([input[0], input[1] ? input[1] : 1, input[2] ? input[2] : 1, input[3] ? input[3] : 0, input[4] ? input[4] : 0, input[5] ? input[5] : 0, input[6] ? input[6] : 0]);
	            } else if (TypeChecking.isNumber(input)) {
	                var fromUnix = new Date(input);
	                this._gDateToCalculators(fromUnix);
	            }
	            // instance of pDate
	            else if (input instanceof PersianDateClass) {
	                    this.algorithmsCalc([input.year(), input.month(), input.date(), input.hour(), input.minute(), input.second(), input.millisecond()]);
	                }
	                // ASP.NET JSON Date
	                else if (input && input.substring(0, 6) === '/Date(') {
	                        var fromDotNet = new Date(parseInt(input.substr(6)));
	                        this._gDateToCalculators(fromDotNet);
	                    } else {
	                        var now = new Date();
	                        this._gDateToCalculators(now);
	                    }
	        }

	        /**
	         * @param input
	         * @return {*}
	         * @private
	         */

	    }, {
	        key: '_getSyncedClass',
	        value: function _getSyncedClass(input) {
	            var syncedCelander = PersianDateClass.toCalendar(this.calendarType).toLocale(this.localType).toLeapYearMode(this.leapYearMode);
	            return new syncedCelander(input);
	        }

	        /**
	         * @param inputgDate
	         * @private
	         */

	    }, {
	        key: '_gDateToCalculators',
	        value: function _gDateToCalculators(inputgDate) {
	            this.algorithms.calcGregorian([inputgDate.getFullYear(), inputgDate.getMonth(), inputgDate.getDate(), inputgDate.getHours(), inputgDate.getMinutes(), inputgDate.getSeconds(), inputgDate.getMilliseconds()]);
	        }

	        /**
	         * @since 1.0.0
	         * @description Helper method that return date range name like week days name, month names, month days names (specially in persian calendar).
	         * @static
	         * @return {*}
	         */

	    }, {
	        key: 'rangeName',


	        /**
	         * @since 1.0.0
	         * @description Helper method that return date range name like week days name, month names, month days names (specially in persian calendar).
	         * @return {*}
	         */
	        value: function rangeName() {
	            var t = this.calendarType;
	            if (this.localType === 'fa') {
	                if (t === 'persian') {
	                    return fa.persian;
	                } else {
	                    return fa.gregorian;
	                }
	            } else {
	                if (t === 'persian') {
	                    return en.persian;
	                } else {
	                    return en.gregorian;
	                }
	            }
	        }

	        /**
	         * @since 1.0.0
	         * @param input
	         * @return {PersianDateClass}
	         */

	    }, {
	        key: 'toLeapYearMode',
	        value: function toLeapYearMode(input) {
	            this.leapYearMode = input;
	            if (input === 'astronomical' && this.calendarType == 'persian') {
	                this.leapYearMode = 'astronomical';
	            } else if (input === 'algorithmic' && this.calendarType == 'persian') {
	                this.leapYearMode = 'algorithmic';
	            }
	            this.algorithms.updateFromGregorian();
	            return this;
	        }

	        /**
	         * @since 1.0.0
	         * @static
	         * @param input
	         * @return {PersianDateClass}
	         */

	    }, {
	        key: 'toCalendar',


	        /**
	         * @since 1.0.0
	         * @param input
	         * @return {PersianDateClass}
	         */
	        value: function toCalendar(input) {
	            this.calendarType = input;
	            this.algorithms.updateFromGregorian();
	            return this;
	        }

	        /**
	         * @since 1.0.0
	         * @static
	         * @param input
	         * @return {PersianDateClass}
	         */

	    }, {
	        key: 'toLocale',


	        /**
	         * @since 1.0.0
	         * @param input
	         * @return {PersianDateClass}
	         */
	        value: function toLocale(input) {
	            this.localType = input;
	            if (this.localType !== 'fa') {
	                this.formatPersian = false;
	            } else {
	                this.formatPersian = '_default';
	            }
	            return this;
	        }

	        /**
	         * @return {*}
	         * @private
	         */

	    }, {
	        key: '_locale',
	        value: function _locale() {
	            var t = this.calendarType;
	            if (this.localType === 'fa') {
	                if (t === 'persian') {
	                    return fa.persian;
	                } else {
	                    return fa.gregorian;
	                }
	            } else {
	                if (t === 'persian') {
	                    return en.persian;
	                } else {
	                    return en.gregorian;
	                }
	            }
	        }

	        /**
	         * @param input
	         * @private
	         */

	    }, {
	        key: '_weekName',
	        value: function _weekName(input) {
	            return this._locale().weekdays[input - 1];
	        }

	        /**
	         * @param input
	         * @private
	         */

	    }, {
	        key: '_weekNameShort',
	        value: function _weekNameShort(input) {
	            return this._locale().weekdaysShort[input - 1];
	        }

	        /**
	         * @param input
	         * @private
	         */

	    }, {
	        key: '_weekNameMin',
	        value: function _weekNameMin(input) {
	            return this._locale().weekdaysMin[input - 1];
	        }

	        /**
	         * @param input
	         * @return {*}
	         * @private
	         */

	    }, {
	        key: '_dayName',
	        value: function _dayName(input) {
	            return this._locale().persianDaysName[input - 1];
	        }

	        /**
	         * @param input
	         * @private
	         */

	    }, {
	        key: '_monthName',
	        value: function _monthName(input) {
	            return this._locale().months[input - 1];
	        }

	        /**
	         * @param input
	         * @private
	         */

	    }, {
	        key: '_monthNameShort',
	        value: function _monthNameShort(input) {
	            return this._locale().monthsShort[input - 1];
	        }

	        /**
	         * @param obj
	         * @returns {boolean}
	         */

	    }, {
	        key: 'isPersianDate',


	        /**
	         * @param obj
	         * @return {boolean}
	         */
	        value: function isPersianDate(obj) {
	            return obj instanceof PersianDateClass;
	        }

	        /**
	         * @returns {PersianDate}
	         */

	    }, {
	        key: 'clone',
	        value: function clone() {
	            return this._getSyncedClass(this.State.gDate);
	        }

	        /**
	         * @since 1.0.0
	         * @param dateArray
	         * @return {*}
	         */

	    }, {
	        key: 'algorithmsCalc',
	        value: function algorithmsCalc(dateArray) {
	            if (this.isPersianDate(dateArray)) {
	                dateArray = [dateArray.year(), dateArray.month(), dateArray.date(), dateArray.hour(), dateArray.minute(), dateArray.second(), dateArray.millisecond()];
	            }
	            if (this.calendarType === 'persian' && this.leapYearMode == 'algorithmic') {
	                return this.algorithms.calcPersian(dateArray);
	            } else if (this.calendarType === 'persian' && this.leapYearMode == 'astronomical') {
	                return this.algorithms.calcPersiana(dateArray);
	            } else if (this.calendarType === 'gregorian') {
	                dateArray[1] = dateArray[1] - 1;
	                return this.algorithms.calcGregorian(dateArray);
	            }
	        }

	        /**
	         * @since 1.0.0
	         * @return {*}
	         */

	    }, {
	        key: 'calendar',
	        value: function calendar() {
	            var key = void 0;
	            if (this.calendarType == 'persian') {
	                if (this.leapYearMode == 'astronomical') {
	                    key = 'persianAstro';
	                } else if (this.leapYearMode == 'algorithmic') {
	                    key = 'persianAlgo';
	                }
	            } else {
	                key = 'gregorian';
	            }
	            return this.State[key];
	        }

	        /**
	         * @description return Duration object
	         * @param input
	         * @param key
	         * @returns {Duration}
	         */

	    }, {
	        key: 'duration',


	        /**
	         * @description return Duration object
	         * @param input
	         * @param key
	         * @returns {Duration}
	         */
	        value: function duration(input, key) {
	            return new Duration(input, key);
	        }

	        /**
	         * @description check if passed object is duration
	         * @param obj
	         * @returns {boolean}
	         */

	    }, {
	        key: 'isDuration',


	        /**
	         * @description check if passed object is duration
	         * @param obj
	         * @returns {boolean}
	         */
	        value: function isDuration(obj) {
	            return obj instanceof Duration;
	        }

	        /**
	         * @param input
	         * @returns {*}
	         */

	    }, {
	        key: 'years',
	        value: function years(input) {
	            return this.year(input);
	        }

	        /**
	         * @param input
	         * @returns {*}
	         */

	    }, {
	        key: 'year',
	        value: function year(input) {
	            if (input || input === 0) {
	                this.algorithmsCalc([input, this.month(), this.date(), this.hour(), this.minute(), this.second(), this.millisecond()]);
	                return this;
	            } else {
	                return this.calendar().year;
	            }
	        }

	        /**
	         * @param input
	         * @returns {*}
	         */

	    }, {
	        key: 'month',
	        value: function month(input) {
	            if (input || input === 0) {
	                this.algorithmsCalc([this.year(), input, this.date()]);
	                return this;
	            } else {
	                return this.calendar().month + 1;
	            }
	        }

	        /**
	         * Day of week
	         * @returns {Function|Date.toJSON.day|date_json.day|PersianDate.day|day|output.day|*}
	         */

	    }, {
	        key: 'days',
	        value: function days() {
	            return this.day();
	        }

	        /**
	         * @returns {Function|Date.toJSON.day|date_json.day|PersianDate.day|day|output.day|*}
	         */

	    }, {
	        key: 'day',
	        value: function day() {
	            return this.calendar().weekday;
	        }

	        /**
	         * Day of Months
	         * @param input
	         * @returns {*}
	         */

	    }, {
	        key: 'dates',
	        value: function dates(input) {
	            return this.date(input);
	        }

	        /**
	         * @param input
	         * @returns {*}
	         */

	    }, {
	        key: 'date',
	        value: function date(input) {
	            if (input || input === 0) {
	                this.algorithmsCalc([this.year(), this.month(), input]);
	                return this;
	            } else {
	                return this.calendar().day;
	            }
	        }

	        /**
	         * @param input
	         * @returns {*}
	         */

	    }, {
	        key: 'hour',
	        value: function hour(input) {
	            return this.hours(input);
	        }

	        /**
	         * @param input
	         * @returns {*}
	         */

	    }, {
	        key: 'hours',
	        value: function hours(input) {
	            if (input || input === 0) {
	                if (input === 0) {
	                    input = 24;
	                }
	                this.algorithmsCalc([this.year(), this.month(), this.date(), input]);
	                return this;
	            } else {
	                return this.State.gDate.getHours();
	            }
	        }

	        /**
	         * @param input
	         * @returns {*}
	         */

	    }, {
	        key: 'minute',
	        value: function minute(input) {
	            return this.minutes(input);
	        }

	        /**
	         * @param input
	         * @returns {*}
	         */

	    }, {
	        key: 'minutes',
	        value: function minutes(input) {
	            if (input || input === 0) {
	                this.algorithmsCalc([this.year(), this.month(), this.date(), this.hour(), input]);
	                return this;
	            } else {
	                return this.State.gDate.getMinutes();
	            }
	        }

	        /**
	         * @param input
	         * @returns {*}
	         */

	    }, {
	        key: 'second',
	        value: function second(input) {
	            return this.seconds(input);
	        }

	        /**
	         * @param input
	         * @returns {*}
	         */

	    }, {
	        key: 'seconds',
	        value: function seconds(input) {
	            if (input || input === 0) {
	                this.algorithmsCalc([this.year(), this.month(), this.date(), this.hour(), this.minute(), input]);
	                return this;
	            } else {
	                return this.State.gDate.getSeconds();
	            }
	        }

	        /**
	         * @param input
	         * @returns {*}
	         * Getter Setter
	         */

	    }, {
	        key: 'millisecond',
	        value: function millisecond(input) {
	            return this.milliseconds(input);
	        }

	        /**
	         * @param input
	         * @returns {*}
	         */

	    }, {
	        key: 'milliseconds',
	        value: function milliseconds(input) {
	            if (input || input === 0) {
	                this.algorithmsCalc([this.year(), this.month(), this.date(), this.hour(), this.minute(), this.second(), input]);
	                return this;
	            } else {
	                return this.State.gregorian.millisecond;
	            }
	        }

	        /**
	         * Return Milliseconds since the Unix Epoch (1318874398806)
	         * @returns {*}
	         * @private
	         */
	        //    _valueOf () {
	        //        return this.State.gDate.valueOf();
	        //    }


	    }, {
	        key: 'unix',


	        /**
	         * Return Unix Timestamp (1318874398)
	         * @param timestamp
	         * @returns {*}
	         */
	        value: function unix(timestamp) {
	            var output = void 0;
	            if (timestamp) {
	                return this._getSyncedClass(timestamp * 1000);
	            } else {
	                var str = this.State.gDate.valueOf().toString();
	                output = str.substring(0, str.length - 3);
	            }
	            return parseInt(output);
	        }

	        /**
	         * @returns {*}
	         */

	    }, {
	        key: 'valueOf',
	        value: function valueOf() {
	            return this.State.gDate.valueOf();
	        }

	        /**
	         * @param year
	         * @param month
	         * @returns {*}
	         * @since 1.0.0
	         */

	    }, {
	        key: 'getFirstWeekDayOfMonth',


	        /**
	         * @param year
	         * @param month
	         * @returns {*}
	         * @since 1.0.0
	         */
	        value: function getFirstWeekDayOfMonth(year, month) {
	            return this._getSyncedClass([year, month, 1]).day();
	        }

	        /**
	         * @param input
	         * @param val
	         * @param asFloat
	         * @returns {*}
	         */

	    }, {
	        key: 'diff',
	        value: function diff(input, val, asFloat) {
	            var self = this,
	                inputMoment = input,
	                zoneDiff = 0,
	                diff = self.State.gDate - inputMoment.toDate() - zoneDiff,
	                year = self.year() - inputMoment.year(),
	                month = self.month() - inputMoment.month(),
	                date = (self.date() - inputMoment.date()) * -1,
	                output = void 0;

	            if (val === 'months' || val === 'month') {
	                output = year * 12 + month + date / 30;
	            } else if (val === 'years' || val === 'year') {
	                output = year + (month + date / 30) / 12;
	            } else {
	                output = val === 'seconds' || val === 'second' ? diff / 1e3 : // 1000
	                val === 'minutes' || val === 'minute' ? diff / 6e4 : // 1000 * 60
	                val === 'hours' || val === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
	                val === 'days' || val === 'day' ? diff / 864e5 : // 1000 * 60 * 60 * 24
	                val === 'weeks' || val === 'week' ? diff / 6048e5 : // 1000 * 60 * 60 * 24 * 7
	                diff;
	            }
	            return asFloat ? output : Math.round(output);
	        }

	        /**
	         * @param key
	         * @returns {*}
	         */

	    }, {
	        key: 'startOf',
	        value: function startOf(key) {
	            var syncedCelander = PersianDateClass.toCalendar(this.calendarType).toLocale(this.localType);
	            var newArray = new PersianDateClass(this.valueOf() - (this.calendar().weekday - 1) * 86400000).toArray();
	            // Simplify this\
	            /* jshint ignore:start */
	            switch (key) {
	                case 'years':
	                case 'year':
	                    return new syncedCelander([this.year(), 1, 1]);
	                case 'months':
	                case 'month':
	                    return new syncedCelander([this.year(), this.month(), 1]);
	                case 'days':
	                case 'day':
	                    return new syncedCelander([this.year(), this.month(), this.date(), 0, 0, 0]);
	                case 'hours':
	                case 'hour':
	                    return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), 0, 0]);
	                case 'minutes':
	                case 'minute':
	                    return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), this.minutes(), 0]);
	                case 'seconds':
	                case 'second':
	                    return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), this.minutes(), this.seconds()]);
	                case 'weeks':
	                case 'week':
	                    return new syncedCelander(newArray);
	                default:
	                    return this.clone();
	            }
	            /* jshint ignore:end */
	        }

	        /**
	         * @param key
	         * @returns {*}
	         */
	        /* eslint-disable no-case-declarations */

	    }, {
	        key: 'endOf',
	        value: function endOf(key) {
	            var syncedCelander = PersianDateClass.toCalendar(this.calendarType).toLocale(this.localType);
	            // Simplify this
	            switch (key) {
	                case 'years':
	                case 'year':
	                    var days = this.isLeapYear() ? 30 : 29;
	                    return new syncedCelander([this.year(), 12, days, 23, 59, 59]);
	                case 'months':
	                case 'month':
	                    var monthDays = this.daysInMonth(this.year(), this.month());
	                    return new syncedCelander([this.year(), this.month(), monthDays, 23, 59, 59]);
	                case 'days':
	                case 'day':
	                    return new syncedCelander([this.year(), this.month(), this.date(), 23, 59, 59]);
	                case 'hours':
	                case 'hour':
	                    return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), 59, 59]);
	                case 'minutes':
	                case 'minute':
	                    return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), this.minutes(), 59]);
	                case 'seconds':
	                case 'second':
	                    return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), this.minutes(), this.seconds()]);
	                case 'weeks':
	                case 'week':
	                    var weekDayNumber = this.calendar().weekday;
	                    return new syncedCelander([this.year(), this.month(), this.date() + (7 - weekDayNumber)]);
	                default:
	                    return this.clone();
	            }
	            /* eslint-enable no-case-declarations */
	        }

	        /**
	         * @returns {*}
	         */

	    }, {
	        key: 'sod',
	        value: function sod() {
	            return this.startOf('day');
	        }

	        /**
	         * @returns {*}
	         */

	    }, {
	        key: 'eod',
	        value: function eod() {
	            return this.endOf('day');
	        }

	        /** Get the timezone offset in minutes.
	         * @return {*}
	         */

	    }, {
	        key: 'zone',
	        value: function zone(input) {
	            if (input || input === 0) {
	                this.State.zone = input;
	                return this;
	            } else {
	                return this.State.zone;
	            }
	        }

	        /**
	         * @returns {PersianDate}
	         */

	    }, {
	        key: 'local',
	        value: function local() {
	            var utcStamp = void 0;
	            if (this._utcMode) {
	                var ThatDayOffset = new Date(this.toDate()).getTimezoneOffset();
	                var offsetMils = ThatDayOffset * 60 * 1000;
	                if (ThatDayOffset < 0) {
	                    utcStamp = this.valueOf() - offsetMils;
	                } else {
	                    /* istanbul ignore next */
	                    utcStamp = this.valueOf() + offsetMils;
	                }
	                this.toCalendar(PersianDateClass.calendarType);
	                var utcDate = new Date(utcStamp);
	                this._gDateToCalculators(utcDate);
	                this._utcMode = false;
	                this.zone(ThatDayOffset);
	                return this;
	            } else {
	                return this;
	            }
	        }

	        /**
	         * @param input
	         * @return {*}
	         */

	    }, {
	        key: 'utc',


	        /**
	         * @description Current date/time in UTC mode
	         * @param input
	         * @returns {*}
	         */
	        value: function utc(input) {
	            var utcStamp = void 0;
	            if (input) {
	                return this._getSyncedClass(input).utc();
	            }
	            if (this._utcMode) {
	                return this;
	            } else {
	                var offsetMils = this.zone() * 60 * 1000;
	                if (this.zone() < 0) {
	                    utcStamp = this.valueOf() + offsetMils;
	                } else {
	                    /* istanbul ignore next */
	                    utcStamp = this.valueOf() - offsetMils;
	                }
	                var utcDate = new Date(utcStamp),
	                    d = this._getSyncedClass(utcDate);
	                this.algorithmsCalc(d);
	                this._utcMode = true;
	                this.zone(0);
	                return this;
	            }
	        }

	        /**
	         * @returns {boolean}
	         */

	    }, {
	        key: 'isUtc',
	        value: function isUtc() {
	            return this._utcMode;
	        }

	        /**
	         * @returns {boolean}
	         * @link https://fa.wikipedia.org/wiki/%D8%B3%D8%A7%D8%B9%D8%AA_%D8%AA%D8%A7%D8%A8%D8%B3%D8%AA%D8%A7%D9%86%DB%8C
	         */

	    }, {
	        key: 'isDST',
	        value: function isDST() {
	            var month = this.month(),
	                day = this.date();
	            if (month == 1 && day > 1 || month == 6 && day < 31 || month < 6 && month >= 2) {
	                return true;
	            } else {
	                return false;
	            }
	        }

	        /**
	         * @returns {boolean}
	         */

	    }, {
	        key: 'isLeapYear',
	        value: function isLeapYear(year) {
	            if (year === undefined) {
	                year = this.year();
	            }
	            if (this.calendarType == 'persian' && this.leapYearMode === 'algorithmic') {
	                return this.algorithms.leap_persian(year);
	            }
	            if (this.calendarType == 'persian' && this.leapYearMode === 'astronomical') {
	                return this.algorithms.leap_persiana(year);
	            } else if (this.calendarType == 'gregorian') {
	                return this.algorithms.leap_gregorian(year);
	            }
	        }

	        /**
	         * @param yearInput
	         * @param monthInput
	         * @returns {number}
	         */

	    }, {
	        key: 'daysInMonth',
	        value: function daysInMonth(yearInput, monthInput) {
	            var year = yearInput ? yearInput : this.year(),
	                month = monthInput ? monthInput : this.month();
	            if (this.calendarType === 'persian') {
	                if (month < 1 || month > 12) return 0;
	                if (month < 7) return 31;
	                if (month < 12) return 30;
	                if (this.isLeapYear(year)) {
	                    return 30;
	                }
	                return 29;
	            }
	            if (this.calendarType === 'gregorian') {
	                return new Date(year, month, 0).getDate();
	            }
	        }

	        /**
	         * @description Return Native Javascript Date
	         * @returns {*|PersianDate.gDate}
	         */

	    }, {
	        key: 'toDate',
	        value: function toDate() {
	            return this.State.gDate;
	        }

	        /**
	         * @description Returns Array Of Persian Date
	         * @returns {array}
	         */

	    }, {
	        key: 'toArray',
	        value: function toArray() {
	            return [this.year(), this.month(), this.date(), this.hour(), this.minute(), this.second(), this.millisecond()];
	        }

	        /**
	         * @returns {*}
	         */

	    }, {
	        key: 'formatNumber',
	        value: function formatNumber() {
	            var output = void 0,
	                self = this;

	            // if default conf dosent set follow golbal config
	            if (this.formatPersian === '_default') {
	                if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	                    /* istanbul ignore next */
	                    if (self.formatPersian === false) {
	                        output = false;
	                    } else {
	                        // Default Conf
	                        output = true;
	                    }
	                }
	                /* istanbul ignore next */
	                else {
	                        if (window.formatPersian === false) {
	                            output = false;
	                        } else {
	                            // Default Conf
	                            output = true;
	                        }
	                    }
	            } else {
	                if (this.formatPersian === true) {
	                    output = true;
	                } else if (this.formatPersian === false) {
	                    output = false;
	                }
	            }
	            return output;
	        }

	        /**
	         * @param inputString
	         * @returns {*}
	         */

	    }, {
	        key: 'format',
	        value: function format(inputString) {
	            if (this.State.isInvalidDate) {
	                return false;
	            }
	            var self = this,
	                formattingTokens = /([[^[]*])|(\\)?(Mo|MM?M?M?|Do|DD?D?D?|dddddd?|ddddd?|dddd?|do?|w[o|w]?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|SS?S?|zz?|ZZ?|X|LT|ll?l?l?|LL?L?L?)/g,
	                info = {
	                year: self.year(),
	                month: self.month(),
	                hour: self.hours(),
	                minute: self.minutes(),
	                second: self.seconds(),
	                date: self.date(),
	                timezone: self.zone(),
	                unix: self.unix()
	            },
	                formatToPersian = self.formatNumber();

	            var checkPersian = function checkPersian(i) {
	                if (formatToPersian) {
	                    return toPersianDigit(i);
	                } else {
	                    return i;
	                }
	            };

	            /* jshint ignore:start */
	            function replaceFunction(input) {
	                switch (input) {
	                    // AM/PM
	                    case 'a':
	                        {
	                            if (formatToPersian) return info.hour >= 12 ? 'ب ظ' : 'ق ظ';else return info.hour >= 12 ? 'PM' : 'AM';
	                        }
	                    // Hours (Int)
	                    case 'H':
	                        {
	                            return checkPersian(info.hour);
	                        }
	                    case 'HH':
	                        {
	                            return checkPersian(leftZeroFill(info.hour, 2));
	                        }
	                    case 'h':
	                        {
	                            return checkPersian(info.hour % 12);
	                        }
	                    case 'hh':
	                        {
	                            return checkPersian(leftZeroFill(info.hour % 12, 2));
	                        }
	                    // Minutes
	                    case 'm':
	                        {
	                            return checkPersian(leftZeroFill(info.minute, 2));
	                        }
	                    // Two Digit Minutes
	                    case 'mm':
	                        {
	                            return checkPersian(leftZeroFill(info.minute, 2));
	                        }
	                    // Second
	                    case 's':
	                        {
	                            return checkPersian(info.second);
	                        }
	                    case 'ss':
	                        {
	                            return checkPersian(leftZeroFill(info.second, 2));
	                        }
	                    // Day (Int)
	                    case 'D':
	                        {
	                            return checkPersian(leftZeroFill(info.date));
	                        }
	                    // Return Two Digit
	                    case 'DD':
	                        {
	                            return checkPersian(leftZeroFill(info.date, 2));
	                        }
	                    // Return day Of Month
	                    case 'DDD':
	                        {
	                            var t = self.startOf('year');
	                            return checkPersian(leftZeroFill(self.diff(t, 'days'), 3));
	                        }
	                    // Return Day of Year
	                    case 'DDDD':
	                        {
	                            var _t = self.startOf('year');
	                            return checkPersian(leftZeroFill(self.diff(_t, 'days'), 3));
	                        }
	                    // Return day Of week
	                    case 'd':
	                        {
	                            return checkPersian(self.calendar().weekday);
	                        }
	                    // Return week day name abbr
	                    case 'ddd':
	                        {
	                            return self._weekNameShort(self.calendar().weekday);
	                        }
	                    case 'dddd':
	                        {
	                            return self._weekName(self.calendar().weekday);
	                        }
	                    // Return Persian Day Name
	                    case 'ddddd':
	                        {
	                            return self._dayName(self.calendar().day);
	                        }
	                    // Return Persian Day Name
	                    case 'dddddd':
	                        {
	                            return self._weekNameMin(self.calendar().weekday);
	                        }
	                    // Return Persian Day Name
	                    case 'w':
	                        {
	                            var _t2 = self.startOf('year'),
	                                day = parseInt(self.diff(_t2, 'days') / 7) + 1;
	                            return checkPersian(day);
	                        }
	                    // Return Persian Day Name
	                    case 'ww':
	                        {
	                            var _t3 = self.startOf('year'),
	                                _day = leftZeroFill(parseInt(self.diff(_t3, 'days') / 7) + 1, 2);
	                            return checkPersian(_day);
	                        }
	                    // Month  (Int)
	                    case 'M':
	                        {
	                            return checkPersian(info.month);
	                        }
	                    // Two Digit Month (Str)
	                    case 'MM':
	                        {
	                            return checkPersian(leftZeroFill(info.month, 2));
	                        }
	                    // Abbr String of Month (Str)
	                    case 'MMM':
	                        {
	                            return self._monthNameShort(info.month);
	                        }
	                    // Full String name of Month (Str)
	                    case 'MMMM':
	                        {
	                            return self._monthName(info.month);
	                        }
	                    // Year
	                    // Two Digit Year (Str)
	                    case 'YY':
	                        {
	                            var yearDigitArray = info.year.toString().split('');
	                            return checkPersian(yearDigitArray[2] + yearDigitArray[3]);
	                        }
	                    // Full Year (Int)
	                    case 'YYYY':
	                        {
	                            return checkPersian(info.year);
	                        }
	                    /* istanbul ignore next */
	                    case 'Z':
	                        {
	                            var flag = '+',
	                                hours = Math.round(info.timezone / 60),
	                                minutes = info.timezone % 60;

	                            if (minutes < 0) {
	                                minutes *= -1;
	                            }
	                            if (hours < 0) {
	                                flag = '-';
	                                hours *= -1;
	                            }

	                            var z = flag + leftZeroFill(hours, 2) + ':' + leftZeroFill(minutes, 2);
	                            return checkPersian(z);
	                        }
	                    /* istanbul ignore next */
	                    case 'ZZ':
	                        {
	                            var _flag = '+',
	                                _hours = Math.round(info.timezone / 60),
	                                _minutes = info.timezone % 60;

	                            if (_minutes < 0) {
	                                _minutes *= -1;
	                            }
	                            if (_hours < 0) {
	                                _flag = '-';
	                                _hours *= -1;
	                            }
	                            var _z = _flag + leftZeroFill(_hours, 2) + '' + leftZeroFill(_minutes, 2);
	                            return checkPersian(_z);
	                        }
	                    /* istanbul ignore next */
	                    case 'X':
	                        {
	                            return self.unix();
	                        }
	                    // 8:30 PM
	                    case 'LT':
	                        {
	                            return self.format('H:m a');
	                        }
	                    // 09/04/1986
	                    case 'L':
	                        {
	                            return self.format('YYYY/MM/DD');
	                        }
	                    // 9/4/1986
	                    case 'l':
	                        {
	                            return self.format('YYYY/M/D');
	                        }
	                    // September 4th 1986
	                    case 'LL':
	                        {
	                            return self.format('MMMM DD YYYY');
	                        }
	                    // Sep 4 1986
	                    case 'll':
	                        {
	                            return self.format('MMM DD YYYY');
	                        }
	                    //September 4th 1986 8:30 PM
	                    case 'LLL':
	                        {
	                            return self.format('MMMM YYYY DD   H:m  a');
	                        }
	                    // Sep 4 1986 8:30 PM
	                    case 'lll':
	                        {
	                            return self.format('MMM YYYY DD   H:m  a');
	                        }
	                    //Thursday, September 4th 1986 8:30 PM
	                    case 'LLLL':
	                        {
	                            return self.format('dddd D MMMM YYYY  H:m  a');
	                        }
	                    // Thu, Sep 4 1986 8:30 PM
	                    case 'llll':
	                        {
	                            return self.format('ddd D MMM YYYY  H:m  a');
	                        }
	                }
	            }

	            /* jshint ignore:end */

	            if (inputString) {
	                return inputString.replace(formattingTokens, replaceFunction);
	            } else {
	                var _inputString = 'YYYY-MM-DD HH:mm:ss a';
	                return _inputString.replace(formattingTokens, replaceFunction);
	            }
	        }

	        /**
	         * @param key
	         * @param value
	         * @returns {PersianDate}
	         */

	    }, {
	        key: 'add',
	        value: function add(key, value) {
	            if (value === 0) {
	                return this;
	            }
	            var unit = normalizeDuration(key, value).unit,
	                arr = this.toArray();
	            value = normalizeDuration(key, value).value;
	            if (unit === 'year') {
	                var normalizedDate = arr[2],
	                    monthDays = this.daysInMonth(arr[0] + value, arr[1]);
	                if (arr[2] > monthDays) {
	                    normalizedDate = monthDays;
	                }
	                var tempDate = new PersianDateClass([arr[0] + value, arr[1], normalizedDate, arr[3], arr[4], arr[5], arr[6], arr[7]]);
	                return tempDate;
	            }
	            if (unit === 'month') {
	                var tempYear = Math.floor(value / 12);
	                var remainingMonth = value - tempYear * 12,
	                    calcedMonth = null;
	                if (arr[1] + remainingMonth > 12) {
	                    tempYear += 1;
	                    calcedMonth = arr[1] + remainingMonth - 12;
	                } else {
	                    calcedMonth = arr[1] + remainingMonth;
	                }
	                var normalizaedDate = arr[2],
	                    tempDateArray = new PersianDateClass([arr[0] + tempYear, calcedMonth, 1, arr[3], arr[4], arr[5], arr[6], arr[7]]).toArray(),
	                    _monthDays = this.daysInMonth(arr[0] + tempYear, calcedMonth);
	                if (arr[2] > _monthDays) {
	                    normalizaedDate = _monthDays;
	                }
	                return new PersianDateClass([tempDateArray[0], tempDateArray[1], normalizaedDate, tempDateArray[3], tempDateArray[4], tempDateArray[5], tempDateArray[6], tempDateArray[7]]);
	            }
	            if (unit === 'day') {
	                var calcedDay = new PersianDateClass(this.valueOf()).hour(12),
	                    newMillisecond = calcedDay.valueOf() + value * 86400000,
	                    newDate = new PersianDateClass(newMillisecond);
	                return newDate.hour(arr[3]);
	            }
	            if (unit === 'week') {
	                var _calcedDay = new PersianDateClass(this.valueOf()).hour(12),
	                    _newMillisecond = _calcedDay.valueOf() + 7 * value * 86400000,
	                    _newDate = new PersianDateClass(_newMillisecond);
	                return _newDate.hour(arr[3]);
	            }
	            if (unit === 'hour') {
	                var _newMillisecond2 = this.valueOf() + value * 3600000;
	                return this.unix(_newMillisecond2 / 1000);
	            }
	            if (unit === 'minute') {
	                var _newMillisecond3 = this.valueOf() + value * 60000;
	                return this.unix(_newMillisecond3 / 1000);
	            }
	            if (unit === 'second') {
	                var _newMillisecond4 = this.valueOf() + value * 1000;
	                return this.unix(_newMillisecond4 / 1000);
	            }
	            if (unit === 'millisecond') {
	                var _newMillisecond5 = this.valueOf() + value;
	                return this.unix(_newMillisecond5 / 1000);
	            }
	            return this._getSyncedClass(this.valueOf());
	        }

	        /**
	         * @param key
	         * @param value
	         * @returns {PersianDate}
	         */

	    }, {
	        key: 'subtract',
	        value: function subtract(key, value) {
	            return this.add(key, value * -1);
	        }

	        /**
	         * check if a date is same as b
	         * @param dateA
	         * @param dateB
	         * @since 1.0.0
	         * @return {boolean}
	         * @static
	         */

	    }, {
	        key: 'isSameDay',


	        /**
	         * @param dateB
	         * @since 1.0.0
	         * @return {PersianDateClass|*|boolean}
	         */
	        value: function isSameDay(dateB) {
	            return this && dateB && this.date() == dateB.date() && this.year() == dateB.year() && this.month() == dateB.month();
	        }

	        /**
	         * @desc check if a month is same as b
	         * @param {Date} dateA
	         * @param {Date} dateB
	         * @return {boolean}
	         * @since 1.0.0
	         * @static
	         */

	    }, {
	        key: 'isSameMonth',


	        /**
	         * @desc check two for month similarity
	         * @param dateA
	         * @param dateB
	         * @since 1.0.0
	         * @return {*|boolean}
	         */
	        value: function isSameMonth(dateB) {
	            return this && dateB && this.year() == this.year() && this.month() == dateB.month();
	        }
	    }], [{
	        key: 'rangeName',
	        value: function rangeName() {
	            var p = PersianDateClass,
	                t = p.calendarType;
	            if (p.localType === 'fa') {
	                if (t === 'persian') {
	                    return fa.persian;
	                } else {
	                    return fa.gregorian;
	                }
	            } else {
	                if (t === 'persian') {
	                    return en.persian;
	                } else {
	                    return en.gregorian;
	                }
	            }
	        }
	    }, {
	        key: 'toLeapYearMode',
	        value: function toLeapYearMode(input) {
	            var d = PersianDateClass;
	            d.leapYearMode = input;
	            return d;
	        }
	    }, {
	        key: 'toCalendar',
	        value: function toCalendar(input) {
	            var d = PersianDateClass;
	            d.calendarType = input;
	            return d;
	        }

	        /**
	         * @since 1.0.0
	         * @static
	         * @param input
	         * @return {PersianDateClass}
	         */

	    }, {
	        key: 'toLocale',
	        value: function toLocale(input) {
	            var d = PersianDateClass;
	            d.localType = input;
	            if (d.localType !== 'fa') {
	                d.formatPersian = false;
	            } else {
	                d.formatPersian = '_default';
	            }
	            return d;
	        }
	    }, {
	        key: 'isPersianDate',
	        value: function isPersianDate(obj) {
	            return obj instanceof PersianDateClass;
	        }
	    }, {
	        key: 'duration',
	        value: function duration(input, key) {
	            return new Duration(input, key);
	        }
	    }, {
	        key: 'isDuration',
	        value: function isDuration(obj) {
	            return obj instanceof Duration;
	        }
	    }, {
	        key: 'unix',
	        value: function unix(timestamp) {
	            if (timestamp) {
	                return new PersianDateClass(timestamp * 1000);
	            } else {
	                return new PersianDateClass().unix();
	            }
	        }
	    }, {
	        key: 'getFirstWeekDayOfMonth',
	        value: function getFirstWeekDayOfMonth(year, month) {
	            return new PersianDateClass([year, month, 1]).day();
	        }
	    }, {
	        key: 'utc',
	        value: function utc(input) {
	            if (input) {
	                return new PersianDateClass(input).utc();
	            } else {
	                return new PersianDateClass().utc();
	            }
	        }
	    }, {
	        key: 'isSameDay',
	        value: function isSameDay(dateA, dateB) {
	            return dateA && dateB && dateA.date() == dateB.date() && dateA.year() == dateB.year() && dateA.month() == dateB.month();
	        }
	    }, {
	        key: 'isSameMonth',
	        value: function isSameMonth(dateA, dateB) {
	            return dateA && dateB && dateA.year() == dateB.year() && dateA.month() == dateB.month();
	        }
	    }]);

	    return PersianDateClass;
	}();

	/**
	 * @type {PersianDateClass}
	 */


	module.exports = PersianDateClass;

	/***/ }),
	/* 2 */
	/***/ (function(module, exports, __webpack_require__) {


	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// Start algorithm class
	var ASTRO = __webpack_require__(3);
	var State = __webpack_require__(9);

	var Algorithms = function () {
	    function Algorithms(parent) {
	        _classCallCheck(this, Algorithms);

	        this.parent = parent;
	        this.ASTRO = new ASTRO();
	        this.State = new State();
	        /*  You may notice that a variety of array variables logically local
	         to functions are declared globally here.  In JavaScript, construction
	         of an array variable from source code occurs as the code is
	         interpreted.  Making these variables pseudo-globals permits us
	         to avoid overhead constructing and disposing of them in each
	         call on the function in which whey are used.  */
	        // TODO this block didnt used in main agorithm
	        this.J0000 = 1721424.5; // Julian date of Gregorian epoch: 0000-01-01
	        this.J1970 = 2440587.5; // Julian date at Unix epoch: 1970-01-01
	        this.JMJD = 2400000.5; // Epoch of Modified Julian Date system
	        this.NormLeap = [false /*"Normal year"*/, true /*"Leap year"*/];
	        // TODO END
	        this.GREGORIAN_EPOCH = 1721425.5;
	        this.PERSIAN_EPOCH = 1948320.5;
	    }

	    /**
	     * @desc LEAP_GREGORIAN  --  Is a given year in the Gregorian calendar a leap year ?
	     * @param year
	     * @return {boolean}
	     */


	    _createClass(Algorithms, [{
	        key: 'leap_gregorian',
	        value: function leap_gregorian(year) {
	            return year % 4 === 0 && !(year % 100 === 0 && year % 400 !== 0);
	        }

	        /**
	         * @desc Determine Julian day number from Gregorian calendar date
	         * @param {*} year
	         * @param {*} month
	         * @param {*} day
	         */

	    }, {
	        key: 'gregorian_to_jd',
	        value: function gregorian_to_jd(year, month, day) {
	            return this.GREGORIAN_EPOCH - 1 + 365 * (year - 1) + Math.floor((year - 1) / 4) + -Math.floor((year - 1) / 100) + Math.floor((year - 1) / 400) + Math.floor((367 * month - 362) / 12 + (month <= 2 ? 0 : this.leap_gregorian(year) ? -1 : -2) + day);
	        }

	        /**
	         * @desc Calculate Gregorian calendar date from Julian day
	         * @param {*} jd
	         */

	    }, {
	        key: 'jd_to_gregorian',
	        value: function jd_to_gregorian(jd) {
	            var wjd = void 0,
	                depoch = void 0,
	                quadricent = void 0,
	                dqc = void 0,
	                cent = void 0,
	                dcent = void 0,
	                quad = void 0,
	                dquad = void 0,
	                yindex = void 0,
	                year = void 0,
	                yearday = void 0,
	                leapadj = void 0,
	                month = void 0,
	                day = void 0;

	            wjd = Math.floor(jd - 0.5) + 0.5;
	            depoch = wjd - this.GREGORIAN_EPOCH;
	            quadricent = Math.floor(depoch / 146097);
	            dqc = this.ASTRO.mod(depoch, 146097);
	            cent = Math.floor(dqc / 36524);
	            dcent = this.ASTRO.mod(dqc, 36524);
	            quad = Math.floor(dcent / 1461);
	            dquad = this.ASTRO.mod(dcent, 1461);
	            yindex = Math.floor(dquad / 365);
	            year = quadricent * 400 + cent * 100 + quad * 4 + yindex;
	            if (!(cent === 4 || yindex === 4)) {
	                year++;
	            }
	            yearday = wjd - this.gregorian_to_jd(year, 1, 1);
	            leapadj = wjd < this.gregorian_to_jd(year, 3, 1) ? 0 : this.leap_gregorian(year) ? 1 : 2;
	            month = Math.floor(((yearday + leapadj) * 12 + 373) / 367);
	            day = wjd - this.gregorian_to_jd(year, month, 1) + 1;

	            return [year, month, day];
	        }

	        /**
	         * @param {*} year
	         */
	        //    leap_julian (year) {
	        //        return this.ASTRO.mod(year, 4) === ((year > 0) ? 0 : 3);
	        //    }


	        /**
	         * @desc Calculate Julian calendar date from Julian day
	         * @param {*} td
	         */
	        //    jd_to_julian (td) {
	        //        let z, a, b, c, d, e, year, month, day;
	        //
	        //        td += 0.5;
	        //        z = Math.floor(td);
	        //
	        //        a = z;
	        //        b = a + 1524;
	        //        c = Math.floor((b - 122.1) / 365.25);
	        //        d = Math.floor(365.25 * c);
	        //        e = Math.floor((b - d) / 30.6001);
	        //
	        //        month = Math.floor((e < 14) ? (e - 1) : (e - 13));
	        //        year = Math.floor((month > 2) ? (c - 4716) : (c - 4715));
	        //        day = b - d - Math.floor(30.6001 * e);
	        //
	        //        /*  If year is less than 1, subtract one to convert from
	        //         a zero based date system to the common era system in
	        //         which the year -1 (1 B.C.E) is followed by year 1 (1 C.E.).  */
	        //
	        //        if (year < 1) {
	        //            year--;
	        //        }
	        //
	        //        return [year, month, day];
	        //    }


	        /**
	         * @desc TEHRAN_EQUINOX  --  Determine Julian day and fraction of the
	         March equinox at the Tehran meridian in
	         a given Gregorian year.
	         * @param {*} year
	         */

	    }, {
	        key: 'tehran_equinox',
	        value: function tehran_equinox(year) {
	            var equJED = void 0,
	                equJD = void 0,
	                equAPP = void 0,
	                equTehran = void 0,
	                dtTehran = void 0;

	            //  March equinox in dynamical time
	            equJED = this.ASTRO.equinox(year, 0);

	            //  Correct for delta T to obtain Universal time
	            equJD = equJED - this.ASTRO.deltat(year) / (24 * 60 * 60);

	            //  Apply the equation of time to yield the apparent time at Greenwich
	            equAPP = equJD + this.ASTRO.equationOfTime(equJED);

	            /*  Finally, we must correct for the constant difference between
	             the Greenwich meridian andthe time zone standard for
	             Iran Standard time, 52°30' to the East.  */

	            dtTehran = (52 + 30 / 60.0 + 0 / (60.0 * 60.0)) / 360;
	            equTehran = equAPP + dtTehran;

	            return equTehran;
	        }

	        /**
	         * @desc TEHRAN_EQUINOX_JD  --  Calculate Julian day during which the
	         March equinox, reckoned from the Tehran
	         meridian, occurred for a given Gregorian
	         year.
	         * @param {*} year
	         */

	    }, {
	        key: 'tehran_equinox_jd',
	        value: function tehran_equinox_jd(year) {
	            var ep = void 0,
	                epg = void 0;

	            ep = this.tehran_equinox(year);
	            epg = Math.floor(ep);

	            return epg;
	        }

	        /**
	         * @desc  PERSIANA_YEAR  --  Determine the year in the Persian
	         astronomical calendar in which a
	         given Julian day falls.  Returns an
	         array of two elements:
	          [0]  Persian year
	         [1]  Julian day number containing
	         equinox for this year.
	         * @param {*} jd
	         */

	    }, {
	        key: 'persiana_year',
	        value: function persiana_year(jd) {
	            var guess = this.jd_to_gregorian(jd)[0] - 2,
	                lasteq = void 0,
	                nexteq = void 0,
	                adr = void 0;

	            lasteq = this.tehran_equinox_jd(guess);
	            while (lasteq > jd) {
	                guess--;
	                lasteq = this.tehran_equinox_jd(guess);
	            }
	            nexteq = lasteq - 1;
	            while (!(lasteq <= jd && jd < nexteq)) {
	                lasteq = nexteq;
	                guess++;
	                nexteq = this.tehran_equinox_jd(guess);
	            }
	            adr = Math.round((lasteq - this.PERSIAN_EPOCH) / this.ASTRO.TropicalYear) + 1;

	            return [adr, lasteq];
	        }

	        /**
	         * @desc Calculate date in the Persian astronomical
	         calendar from Julian day.
	         * @param {*} jd
	         */

	    }, {
	        key: 'jd_to_persiana',
	        value: function jd_to_persiana(jd) {
	            var year = void 0,
	                month = void 0,
	                day = void 0,
	                adr = void 0,
	                equinox = void 0,
	                yday = void 0;

	            jd = Math.floor(jd) + 0.5;
	            adr = this.persiana_year(jd);
	            year = adr[0];
	            equinox = adr[1];
	            day = Math.floor((jd - equinox) / 30) + 1;

	            yday = Math.floor(jd) - this.persiana_to_jd(year, 1, 1) + 1;
	            month = yday <= 186 ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
	            day = Math.floor(jd) - this.persiana_to_jd(year, month, 1) + 1;

	            return [year, month, day];
	        }

	        /**
	         * @desc Obtain Julian day from a given Persian
	         astronomical calendar date.
	         * @param {*} year
	         * @param {*} month
	         * @param {*} day
	         */

	    }, {
	        key: 'persiana_to_jd',
	        value: function persiana_to_jd(year, month, day) {
	            var adr = void 0,
	                equinox = void 0,
	                guess = void 0,
	                jd = void 0;

	            guess = this.PERSIAN_EPOCH - 1 + this.ASTRO.TropicalYear * (year - 1 - 1);
	            adr = [year - 1, 0];

	            while (adr[0] < year) {
	                adr = this.persiana_year(guess);
	                guess = adr[1] + (this.ASTRO.TropicalYear + 2);
	            }
	            equinox = adr[1];

	            jd = equinox + (month <= 7 ? (month - 1) * 31 : (month - 1) * 30 + 6) + (day - 1);
	            return jd;
	        }

	        /**
	         * @desc Is a given year a leap year in the Persian astronomical calendar ?
	         * @param {*} year
	         */

	    }, {
	        key: 'leap_persiana',
	        value: function leap_persiana(year) {
	            return this.persiana_to_jd(year + 1, 1, 1) - this.persiana_to_jd(year, 1, 1) > 365;
	        }

	        /**
	         * @desc Is a given year a leap year in the Persian calendar ?
	         * also nasa use this algorithm https://eclipse.gsfc.nasa.gov/SKYCAL/algorithm.js search for 'getLastDayOfPersianMonth' and you can find it
	         * @param {*} year
	         *
	         */

	    }, {
	        key: 'leap_persian',
	        value: function leap_persian(year) {
	            return ((year - (year > 0 ? 474 : 473)) % 2820 + 474 + 38) * 682 % 2816 < 682;
	        }

	        /**
	         * @desc Determine Julian day from Persian date
	         * @param {*} year
	         * @param {*} month
	         * @param {*} day
	         */

	    }, {
	        key: 'persian_to_jd',
	        value: function persian_to_jd(year, month, day) {
	            var epbase = void 0,
	                epyear = void 0;

	            epbase = year - (year >= 0 ? 474 : 473);
	            epyear = 474 + this.ASTRO.mod(epbase, 2820);

	            return day + (month <= 7 ? (month - 1) * 31 : (month - 1) * 30 + 6) + Math.floor((epyear * 682 - 110) / 2816) + (epyear - 1) * 365 + Math.floor(epbase / 2820) * 1029983 + (this.PERSIAN_EPOCH - 1);
	        }

	        /**
	         * @desc Calculate Persian date from Julian day
	         * @param {*} jd
	         */

	    }, {
	        key: 'jd_to_persian',
	        value: function jd_to_persian(jd) {
	            var year = void 0,
	                month = void 0,
	                day = void 0,
	                depoch = void 0,
	                cycle = void 0,
	                cyear = void 0,
	                ycycle = void 0,
	                aux1 = void 0,
	                aux2 = void 0,
	                yday = void 0;

	            jd = Math.floor(jd) + 0.5;

	            depoch = jd - this.persian_to_jd(475, 1, 1);
	            cycle = Math.floor(depoch / 1029983);
	            cyear = this.ASTRO.mod(depoch, 1029983);
	            if (cyear === 1029982) {
	                ycycle = 2820;
	            } else {
	                aux1 = Math.floor(cyear / 366);
	                aux2 = this.ASTRO.mod(cyear, 366);
	                ycycle = Math.floor((2134 * aux1 + 2816 * aux2 + 2815) / 1028522) + aux1 + 1;
	            }
	            year = ycycle + 2820 * cycle + 474;
	            if (year <= 0) {
	                year--;
	            }
	            yday = jd - this.persian_to_jd(year, 1, 1) + 1;
	            month = yday <= 186 ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
	            day = jd - this.persian_to_jd(year, month, 1) + 1;
	            return [year, month, day];
	        }

	        /**
	         *
	         * @param {*} weekday
	         */

	    }, {
	        key: 'gWeekDayToPersian',
	        value: function gWeekDayToPersian(weekday) {
	            if (weekday + 2 === 8) {
	                return 1;
	            } else if (weekday + 2 === 7) {
	                return 7;
	            } else {
	                return weekday + 2;
	            }
	        }

	        /**
	         * @desc updateFromGregorian  --  Update all calendars from Gregorian.
	         "Why not Julian date?" you ask.  Because
	         starting from Gregorian guarantees we're
	         already snapped to an integral second, so
	         we don't get roundoff errors in other
	         calendars.
	         */

	    }, {
	        key: 'updateFromGregorian',
	        value: function updateFromGregorian() {
	            var j = void 0,
	                year = void 0,
	                mon = void 0,
	                mday = void 0,
	                hour = void 0,
	                min = void 0,
	                sec = void 0,
	                weekday = void 0,
	                utime = void 0,
	                perscal = void 0;

	            year = this.State.gregorian.year;
	            mon = this.State.gregorian.month;
	            mday = this.State.gregorian.day;
	            hour = 0; //this.State.gregorian.hour;
	            min = 0; //this.State.gregorian.minute;
	            sec = 0; //this.State.gregorian.second;

	            this.State.gDate = new Date(year, mon, mday, this.State.gregorian.hour, this.State.gregorian.minute, this.State.gregorian.second, this.State.gregorian.millisecond);

	            if (this.parent._utcMode === false) {
	                this.State.zone = this.State.gDate.getTimezoneOffset();
	            }

	            // Added for this algorithms cant parse 2016,13,32 successfully
	            this.State.gregorian.year = this.State.gDate.getFullYear();
	            this.State.gregorian.month = this.State.gDate.getMonth();
	            this.State.gregorian.day = this.State.gDate.getDate();

	            //  Update Julian day
	            // ---------------------------------------------------------------------------
	            j = this.gregorian_to_jd(year, mon + 1, mday) + Math.floor(sec + 60 * (min + 60 * hour) + 0.5) / 86400.0;

	            this.State.julianday = j;
	            this.State.modifiedjulianday = j - this.JMJD;

	            //  Update day of week in Gregorian box
	            // ---------------------------------------------------------------------------
	            weekday = this.ASTRO.jwday(j);
	            // Move to 1 indexed number
	            this.State.gregorian.weekday = weekday + 1;

	            //  Update leap year status in Gregorian box
	            // ---------------------------------------------------------------------------
	            this.State.gregorian.leap = this.NormLeap[this.leap_gregorian(year) ? 1 : 0];

	            //  Update Julian Calendar
	            // ---------------------------------------------------------------------------
	            //        julcal = this.jd_to_julian(j);
	            //
	            //        this.State.juliancalendar.year = julcal[0];
	            //        this.State.juliancalendar.month = julcal[1] - 1;
	            //        this.State.juliancalendar.day = julcal[2];
	            //        this.State.juliancalendar.leap = this.NormLeap[this.leap_julian(julcal[0]) ? 1 : 0];
	            weekday = this.ASTRO.jwday(j);
	            //        this.State.juliancalendar.weekday = weekday;

	            //  Update Persian Calendar
	            // ---------------------------------------------------------------------------
	            if (this.parent.calendarType == 'persian' && this.parent.leapYearMode == 'algorithmic') {
	                perscal = this.jd_to_persian(j);
	                this.State.persian.year = perscal[0];
	                this.State.persian.month = perscal[1] - 1;
	                this.State.persian.day = perscal[2];
	                this.State.persian.weekday = this.gWeekDayToPersian(weekday);
	                this.State.persian.leap = this.NormLeap[this.leap_persian(perscal[0]) ? 1 : 0];
	            }

	            //  Update Persian Astronomical Calendar
	            // ---------------------------------------------------------------------------
	            if (this.parent.calendarType == 'persian' && this.parent.leapYearMode == 'astronomical') {
	                perscal = this.jd_to_persiana(j);
	                this.State.persianAstro.year = perscal[0];
	                this.State.persianAstro.month = perscal[1] - 1;
	                this.State.persianAstro.day = perscal[2];
	                this.State.persianAstro.weekday = this.gWeekDayToPersian(weekday);
	                this.State.persianAstro.leap = this.NormLeap[this.leap_persiana(perscal[0]) ? 1 : 0];
	            }
	            //  Update Gregorian serial number
	            // ---------------------------------------------------------------------------
	            if (this.State.gregserial.day !== null) {
	                this.State.gregserial.day = j - this.J0000;
	            }

	            //  Update Unix time()
	            // ---------------------------------------------------------------------------
	            utime = (j - this.J1970) * (60 * 60 * 24 * 1000);

	            this.State.unixtime = Math.round(utime / 1000);
	        }

	        /**
	         * @desc Perform calculation starting with a Gregorian date
	         * @param {*} dateArray
	         */

	    }, {
	        key: 'calcGregorian',
	        value: function calcGregorian(dateArray) {
	            if (dateArray[0] || dateArray[0] === 0) {
	                this.State.gregorian.year = dateArray[0];
	            }
	            if (dateArray[1] || dateArray[1] === 0) {
	                this.State.gregorian.month = dateArray[1];
	            }
	            if (dateArray[2] || dateArray[2] === 0) {
	                this.State.gregorian.day = dateArray[2];
	            }
	            if (dateArray[3] || dateArray[3] === 0) {
	                this.State.gregorian.hour = dateArray[3];
	            }
	            if (dateArray[4] || dateArray[4] === 0) {
	                this.State.gregorian.minute = dateArray[4];
	            }
	            if (dateArray[5] || dateArray[5] === 0) {
	                this.State.gregorian.second = dateArray[5];
	            }
	            if (dateArray[6] || dateArray[6] === 0) {
	                this.State.gregorian.millisecond = dateArray[6];
	            }
	            this.updateFromGregorian();
	        }

	        /**
	         * @desc Perform calculation starting with a Julian date
	         */

	    }, {
	        key: 'calcJulian',
	        value: function calcJulian() {
	            var j = void 0,
	                date = void 0;
	            j = this.State.julianday;
	            date = this.jd_to_gregorian(j);
	            this.State.gregorian.year = date[0];
	            this.State.gregorian.month = date[1] - 1;
	            this.State.gregorian.day = date[2];
	            //        this.State.gregorian.hour = this.pad(time[0], 2, " ");
	            //        this.State.gregorian.minute = this.pad(time[1], 2, "0");
	            //        this.State.gregorian.second = this.pad(time[2], 2, "0");
	            this.updateFromGregorian();
	        }

	        /**
	         * @desc Set Julian date and update all calendars
	         * @param {*} j
	         */

	    }, {
	        key: 'setJulian',
	        value: function setJulian(j) {
	            this.State.julianday = j;
	            this.calcJulian();
	        }

	        /**
	         * @desc  Update from Persian calendar
	         * @param {*} dateArray
	         */

	    }, {
	        key: 'calcPersian',
	        value: function calcPersian(dateArray) {
	            if (dateArray[0] || dateArray[0] === 0) {
	                this.State.persian.year = dateArray[0];
	            }
	            if (dateArray[1] || dateArray[1] === 0) {
	                this.State.persian.month = dateArray[1];
	            }
	            if (dateArray[2] || dateArray[2] === 0) {
	                this.State.persian.day = dateArray[2];
	            }
	            if (dateArray[3] || dateArray[3] === 0) {
	                this.State.gregorian.hour = dateArray[3];
	            }
	            if (dateArray[4] || dateArray[4] === 0) {
	                this.State.gregorian.minute = dateArray[4];
	            }
	            if (dateArray[5] || dateArray[5] === 0) {
	                this.State.gregorian.second = dateArray[5];
	            }
	            if (dateArray[6] || dateArray[6] === 0) {
	                this.State.gregorian.millisecond = dateArray[6];
	            }

	            this.setJulian(this.persian_to_jd(this.State.persian.year, this.State.persian.month, this.State.persian.day));
	        }

	        /**
	         * @desc Update from Persian astronomical calendar
	         * @param {*} dateArray
	         */

	    }, {
	        key: 'calcPersiana',
	        value: function calcPersiana(dateArray) {
	            if (dateArray[0] || dateArray[0] === 0) {
	                this.State.persianAstro.year = dateArray[0];
	            }
	            if (dateArray[1] || dateArray[1] === 0) {
	                this.State.persianAstro.month = dateArray[1];
	            }
	            if (dateArray[2] || dateArray[2] === 0) {
	                this.State.persianAstro.day = dateArray[2];
	            }

	            if (dateArray[3] || dateArray[3] === 0) {
	                this.State.gregorian.hour = dateArray[3];
	            }
	            if (dateArray[4] || dateArray[4] === 0) {
	                this.State.gregorian.minute = dateArray[4];
	            }
	            if (dateArray[5] || dateArray[5] === 0) {
	                this.State.gregorian.second = dateArray[5];
	            }
	            if (dateArray[6] || dateArray[6] === 0) {
	                this.State.gregorian.millisecond = dateArray[6];
	            }
	            this.setJulian(this.persiana_to_jd(this.State.persianAstro.year, this.State.persianAstro.month, this.State.persianAstro.day + 0.5));
	        }
	    }]);

	    return Algorithms;
	}();

	module.exports = Algorithms;

	/***/ }),
	/* 3 */
	/***/ (function(module, exports, __webpack_require__) {


	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*
	 JavaScript functions for positional astronomy
	 by John Walker  --  September, MIM
	 http://www.fourmilab.ch/
	 This program is in the public domain.
	 */

	var ASTRO = function () {
	    function ASTRO() {
	        _classCallCheck(this, ASTRO);

	        //  Frequently-used constants
	        this.J2000 = 2451545.0; // Julian day of J2000 epoch
	        this.JulianCentury = 36525.0; // Days in Julian century
	        this.JulianMillennium = this.JulianCentury * 10; // Days in Julian millennium
	        //        this.AstronomicalUnit = 149597870.0;           // Astronomical unit in kilometres
	        this.TropicalYear = 365.24219878; // Mean solar tropical year

	        /*  OBLIQEQ  --  Calculate the obliquity of the ecliptic for a given
	         Julian date.  This uses Laskar's tenth-degree
	         polynomial fit (J. Laskar, Astronomy and
	         Astrophysics, Vol. 157, page 68 [1986]) which is
	         accurate to within 0.01 arc second between AD 1000
	         and AD 3000, and within a few seconds of arc for
	         +/-10000 years around AD 2000.  If we're outside the
	         range in which this fit is valid (deep time) we
	         simply return the J2000 value of the obliquity, which
	         happens to be almost precisely the mean.  */
	        this.oterms = [-4680.93, -1.55, 1999.25, -51.38, -249.67, -39.05, 7.12, 27.87, 5.79, 2.45];
	        /* Periodic terms for nutation in longiude (delta \Psi) and
	         obliquity (delta \Epsilon) as given in table 21.A of
	         Meeus, "Astronomical Algorithms", first edition. */
	        this.nutArgMult = [0, 0, 0, 0, 1, -2, 0, 0, 2, 2, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, -2, 1, 0, 2, 2, 0, 0, 0, 2, 1, 0, 0, 1, 2, 2, -2, -1, 0, 2, 2, -2, 0, 1, 0, 0, -2, 0, 0, 2, 1, 0, 0, -1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1, 0, 1, 2, 0, -1, 2, 2, 0, 0, -1, 0, 1, 0, 0, 1, 2, 1, -2, 0, 2, 0, 0, 0, 0, -2, 2, 1, 2, 0, 0, 2, 2, 0, 0, 2, 2, 2, 0, 0, 2, 0, 0, -2, 0, 1, 2, 2, 0, 0, 0, 2, 0, -2, 0, 0, 2, 0, 0, 0, -1, 2, 1, 0, 2, 0, 0, 0, 2, 0, -1, 0, 1, -2, 2, 0, 2, 2, 0, 1, 0, 0, 1, -2, 0, 1, 0, 1, 0, -1, 0, 0, 1, 0, 0, 2, -2, 0, 2, 0, -1, 2, 1, 2, 0, 1, 2, 2, 0, 1, 0, 2, 2, -2, 1, 1, 0, 0, 0, -1, 0, 2, 2, 2, 0, 0, 2, 1, 2, 0, 1, 0, 0, -2, 0, 2, 2, 2, -2, 0, 1, 2, 1, 2, 0, -2, 0, 1, 2, 0, 0, 0, 1, 0, -1, 1, 0, 0, -2, -1, 0, 2, 1, -2, 0, 0, 0, 1, 0, 0, 2, 2, 1, -2, 0, 2, 0, 1, -2, 1, 0, 2, 1, 0, 0, 1, -2, 0, -1, 0, 1, 0, 0, -2, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 2, 0, -1, -1, 1, 0, 0, 0, 1, 1, 0, 0, 0, -1, 1, 2, 2, 2, -1, -1, 2, 2, 0, 0, -2, 2, 2, 0, 0, 3, 2, 2, 2, -1, 0, 2, 2];

	        this.nutArgCoeff = [-171996, -1742, 92095, 89, /*  0,  0,  0,  0,  1 */
	        -13187, -16, 5736, -31, /* -2,  0,  0,  2,  2 */
	        -2274, -2, 977, -5, /*  0,  0,  0,  2,  2 */
	        2062, 2, -895, 5, /*  0,  0,  0,  0,  2 */
	        1426, -34, 54, -1, /*  0,  1,  0,  0,  0 */
	        712, 1, -7, 0, /*  0,  0,  1,  0,  0 */
	        -517, 12, 224, -6, /* -2,  1,  0,  2,  2 */
	        -386, -4, 200, 0, /*  0,  0,  0,  2,  1 */
	        -301, 0, 129, -1, /*  0,  0,  1,  2,  2 */
	        217, -5, -95, 3, /* -2, -1,  0,  2,  2 */
	        -158, 0, 0, 0, /* -2,  0,  1,  0,  0 */
	        129, 1, -70, 0, /* -2,  0,  0,  2,  1 */
	        123, 0, -53, 0, /*  0,  0, -1,  2,  2 */
	        63, 0, 0, 0, /*  2,  0,  0,  0,  0 */
	        63, 1, -33, 0, /*  0,  0,  1,  0,  1 */
	        -59, 0, 26, 0, /*  2,  0, -1,  2,  2 */
	        -58, -1, 32, 0, /*  0,  0, -1,  0,  1 */
	        -51, 0, 27, 0, /*  0,  0,  1,  2,  1 */
	        48, 0, 0, 0, /* -2,  0,  2,  0,  0 */
	        46, 0, -24, 0, /*  0,  0, -2,  2,  1 */
	        -38, 0, 16, 0, /*  2,  0,  0,  2,  2 */
	        -31, 0, 13, 0, /*  0,  0,  2,  2,  2 */
	        29, 0, 0, 0, /*  0,  0,  2,  0,  0 */
	        29, 0, -12, 0, /* -2,  0,  1,  2,  2 */
	        26, 0, 0, 0, /*  0,  0,  0,  2,  0 */
	        -22, 0, 0, 0, /* -2,  0,  0,  2,  0 */
	        21, 0, -10, 0, /*  0,  0, -1,  2,  1 */
	        17, -1, 0, 0, /*  0,  2,  0,  0,  0 */
	        16, 0, -8, 0, /*  2,  0, -1,  0,  1 */
	        -16, 1, 7, 0, /* -2,  2,  0,  2,  2 */
	        -15, 0, 9, 0, /*  0,  1,  0,  0,  1 */
	        -13, 0, 7, 0, /* -2,  0,  1,  0,  1 */
	        -12, 0, 6, 0, /*  0, -1,  0,  0,  1 */
	        11, 0, 0, 0, /*  0,  0,  2, -2,  0 */
	        -10, 0, 5, 0, /*  2,  0, -1,  2,  1 */
	        -8, 0, 3, 0, /*  2,  0,  1,  2,  2 */
	        7, 0, -3, 0, /*  0,  1,  0,  2,  2 */
	        -7, 0, 0, 0, /* -2,  1,  1,  0,  0 */
	        -7, 0, 3, 0, /*  0, -1,  0,  2,  2 */
	        -7, 0, 3, 0, /*  2,  0,  0,  2,  1 */
	        6, 0, 0, 0, /*  2,  0,  1,  0,  0 */
	        6, 0, -3, 0, /* -2,  0,  2,  2,  2 */
	        6, 0, -3, 0, /* -2,  0,  1,  2,  1 */
	        -6, 0, 3, 0, /*  2,  0, -2,  0,  1 */
	        -6, 0, 3, 0, /*  2,  0,  0,  0,  1 */
	        5, 0, 0, 0, /*  0, -1,  1,  0,  0 */
	        -5, 0, 3, 0, /* -2, -1,  0,  2,  1 */
	        -5, 0, 3, 0, /* -2,  0,  0,  0,  1 */
	        -5, 0, 3, 0, /*  0,  0,  2,  2,  1 */
	        4, 0, 0, 0, /* -2,  0,  2,  0,  1 */
	        4, 0, 0, 0, /* -2,  1,  0,  2,  1 */
	        4, 0, 0, 0, /*  0,  0,  1, -2,  0 */
	        -4, 0, 0, 0, /* -1,  0,  1,  0,  0 */
	        -4, 0, 0, 0, /* -2,  1,  0,  0,  0 */
	        -4, 0, 0, 0, /*  1,  0,  0,  0,  0 */
	        3, 0, 0, 0, /*  0,  0,  1,  2,  0 */
	        -3, 0, 0, 0, /* -1, -1,  1,  0,  0 */
	        -3, 0, 0, 0, /*  0,  1,  1,  0,  0 */
	        -3, 0, 0, 0, /*  0, -1,  1,  2,  2 */
	        -3, 0, 0, 0, /*  2, -1, -1,  2,  2 */
	        -3, 0, 0, 0, /*  0,  0, -2,  2,  2 */
	        -3, 0, 0, 0, /*  0,  0,  3,  2,  2 */
	        -3, 0, 0, 0 /*  2, -1,  0,  2,  2 */
	        ];

	        /**
	         * @desc Table of observed Delta T values at the beginning of even numbered years from 1620 through 2002.
	         * @type Array
	         */
	        this.deltaTtab = [121, 112, 103, 95, 88, 82, 77, 72, 68, 63, 60, 56, 53, 51, 48, 46, 44, 42, 40, 38, 35, 33, 31, 29, 26, 24, 22, 20, 18, 16, 14, 12, 11, 10, 9, 8, 7, 7, 7, 7, 7, 7, 8, 8, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 15, 15, 14, 13, 13.1, 12.5, 12.2, 12, 12, 12, 12, 12, 12, 11.9, 11.6, 11, 10.2, 9.2, 8.2, 7.1, 6.2, 5.6, 5.4, 5.3, 5.4, 5.6, 5.9, 6.2, 6.5, 6.8, 7.1, 7.3, 7.5, 7.6, 7.7, 7.3, 6.2, 5.2, 2.7, 1.4, -1.2, -2.8, -3.8, -4.8, -5.5, -5.3, -5.6, -5.7, -5.9, -6, -6.3, -6.5, -6.2, -4.7, -2.8, -0.1, 2.6, 5.3, 7.7, 10.4, 13.3, 16, 18.2, 20.2, 21.1, 22.4, 23.5, 23.8, 24.3, 24, 23.9, 23.9, 23.7, 24, 24.3, 25.3, 26.2, 27.3, 28.2, 29.1, 30, 30.7, 31.4, 32.2, 33.1, 34, 35, 36.5, 38.3, 40.2, 42.2, 44.5, 46.5, 48.5, 50.5, 52.2, 53.8, 54.9, 55.8, 56.9, 58.3, 60, 61.6, 63, 65, 66.6];

	        /*  EQUINOX  --  Determine the Julian Ephemeris Day of an
	         equinox or solstice.  The "which" argument
	         selects the item to be computed:
	          0   March equinox
	         1   June solstice
	         2   September equinox
	         3   December solstice
	          */
	        /**
	         * @desc Periodic terms to obtain true time
	         * @type Array
	         */
	        this.EquinoxpTerms = [485, 324.96, 1934.136, 203, 337.23, 32964.467, 199, 342.08, 20.186, 182, 27.85, 445267.112, 156, 73.14, 45036.886, 136, 171.52, 22518.443, 77, 222.54, 65928.934, 74, 296.72, 3034.906, 70, 243.58, 9037.513, 58, 119.81, 33718.147, 52, 297.17, 150.678, 50, 21.02, 2281.226, 45, 247.54, 29929.562, 44, 325.15, 31555.956, 29, 60.93, 4443.417, 18, 155.12, 67555.328, 17, 288.79, 4562.452, 16, 198.04, 62894.029, 14, 199.76, 31436.921, 12, 95.39, 14577.848, 12, 287.11, 31931.756, 12, 320.81, 34777.259, 9, 227.73, 1222.114, 8, 15.45, 16859.074];

	        this.JDE0tab1000 = [new Array(1721139.29189, 365242.13740, 0.06134, 0.00111, -0.00071), new Array(1721233.25401, 365241.72562, -0.05323, 0.00907, 0.00025), new Array(1721325.70455, 365242.49558, -0.11677, -0.00297, 0.00074), new Array(1721414.39987, 365242.88257, -0.00769, -0.00933, -0.00006)];

	        this.JDE0tab2000 = [new Array(2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057), new Array(2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030), new Array(2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078), new Array(2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032)];
	    }

	    /**
	     *
	     * @param Degrees to radians.
	     * @return {number}
	     */


	    _createClass(ASTRO, [{
	        key: "dtr",
	        value: function dtr(d) {
	            return d * Math.PI / 180.0;
	        }

	        /**
	         * @desc Radians to degrees.
	         * @param r
	         * @return {number}
	         */

	    }, {
	        key: "rtd",
	        value: function rtd(r) {
	            return r * 180.0 / Math.PI;
	        }

	        /**
	         * @desc Range reduce angle in degrees.
	         * @param a
	         * @return {number}
	         */

	    }, {
	        key: "fixangle",
	        value: function fixangle(a) {
	            return a - 360.0 * Math.floor(a / 360.0);
	        }

	        /**
	         * @desc Range reduce angle in radians.
	         * @param a
	         * @return {number}
	         */

	    }, {
	        key: "fixangr",
	        value: function fixangr(a) {
	            return a - 2 * Math.PI * Math.floor(a / (2 * Math.PI));
	        }

	        /**
	         * @desc  Sine of an angle in degrees
	         * @param d
	         * @return {number}
	         */

	    }, {
	        key: "dsin",
	        value: function dsin(d) {
	            return Math.sin(this.dtr(d));
	        }

	        /**
	         * @desc Cosine of an angle in degrees
	         * @param d
	         * @return {number}
	         */

	    }, {
	        key: "dcos",
	        value: function dcos(d) {
	            return Math.cos(this.dtr(d));
	        }

	        /**
	         * @desc Modulus function which works for non-integers.
	         * @param a
	         * @param b
	         * @return {number}
	         */

	    }, {
	        key: "mod",
	        value: function mod(a, b) {
	            return a - b * Math.floor(a / b);
	        }

	        /**
	         *
	         * @param j
	         * @return {number}
	         */

	    }, {
	        key: "jwday",
	        value: function jwday(j) {
	            return this.mod(Math.floor(j + 1.5), 7);
	        }

	        /**
	         *
	         * @param jd
	         * @return {number|*}
	         */

	    }, {
	        key: "obliqeq",
	        value: function obliqeq(jd) {
	            var eps, u, v, i;
	            v = u = (jd - this.J2000) / (this.JulianCentury * 100);
	            eps = 23 + 26 / 60.0 + 21.448 / 3600.0;

	            if (Math.abs(u) < 1.0) {
	                for (i = 0; i < 10; i++) {
	                    eps += this.oterms[i] / 3600.0 * v;
	                    v *= u;
	                }
	            }
	            return eps;
	        }

	        /**
	         * @desc  Calculate the nutation in longitude, deltaPsi, and
	         obliquity, deltaEpsilon for a given Julian date
	         jd.  Results are returned as a two element Array
	         giving (deltaPsi, deltaEpsilon) in degrees.
	         * @param jd
	         * @return Object
	         */

	    }, {
	        key: "nutation",
	        value: function nutation(jd) {
	            var deltaPsi,
	                deltaEpsilon,
	                i,
	                j,
	                t = (jd - 2451545.0) / 36525.0,
	                t2,
	                t3,
	                to10,
	                ta = [],
	                dp = 0,
	                de = 0,
	                ang;

	            t3 = t * (t2 = t * t);

	            /* Calculate angles.  The correspondence between the elements
	             of our array and the terms cited in Meeus are:
	              ta[0] = D  ta[0] = M  ta[2] = M'  ta[3] = F  ta[4] = \Omega
	              */

	            ta[0] = this.dtr(297.850363 + 445267.11148 * t - 0.0019142 * t2 + t3 / 189474.0);
	            ta[1] = this.dtr(357.52772 + 35999.05034 * t - 0.0001603 * t2 - t3 / 300000.0);
	            ta[2] = this.dtr(134.96298 + 477198.867398 * t + 0.0086972 * t2 + t3 / 56250.0);
	            ta[3] = this.dtr(93.27191 + 483202.017538 * t - 0.0036825 * t2 + t3 / 327270);
	            ta[4] = this.dtr(125.04452 - 1934.136261 * t + 0.0020708 * t2 + t3 / 450000.0);

	            /* Range reduce the angles in case the sine and cosine functions
	             don't do it as accurately or quickly. */

	            for (i = 0; i < 5; i++) {
	                ta[i] = this.fixangr(ta[i]);
	            }

	            to10 = t / 10.0;
	            for (i = 0; i < 63; i++) {
	                ang = 0;
	                for (j = 0; j < 5; j++) {
	                    if (this.nutArgMult[i * 5 + j] !== 0) {
	                        ang += this.nutArgMult[i * 5 + j] * ta[j];
	                    }
	                }
	                dp += (this.nutArgCoeff[i * 4 + 0] + this.nutArgCoeff[i * 4 + 1] * to10) * Math.sin(ang);
	                de += (this.nutArgCoeff[i * 4 + 2] + this.nutArgCoeff[i * 4 + 3] * to10) * Math.cos(ang);
	            }

	            /* Return the result, converting from ten thousandths of arc
	             seconds to radians in the process. */

	            deltaPsi = dp / (3600.0 * 10000.0);
	            deltaEpsilon = de / (3600.0 * 10000.0);

	            return [deltaPsi, deltaEpsilon];
	        }

	        /**
	         * @desc  Determine the difference, in seconds, between
	         Dynamical time and Universal time.
	         * @param year
	         * @return {*}
	         */

	    }, {
	        key: "deltat",
	        value: function deltat(year) {
	            var dt, f, i, t;

	            if (year >= 1620 && year <= 2000) {
	                i = Math.floor((year - 1620) / 2);
	                f = (year - 1620) / 2 - i;
	                /* Fractional part of year */
	                dt = this.deltaTtab[i] + (this.deltaTtab[i + 1] - this.deltaTtab[i]) * f;
	            } else {
	                t = (year - 2000) / 100;
	                if (year < 948) {
	                    dt = 2177 + 497 * t + 44.1 * t * t;
	                } else {
	                    dt = 102 + 102 * t + 25.3 * t * t;
	                    if (year > 2000 && year < 2100) {
	                        dt += 0.37 * (year - 2100);
	                    }
	                }
	            }
	            return dt;
	        }

	        /**
	         *
	         * @param year
	         * @param which
	         * @return {*}
	         */

	    }, {
	        key: "equinox",
	        value: function equinox(year, which) {
	            var deltaL = void 0,
	                i = void 0,
	                j = void 0,
	                JDE0 = void 0,
	                JDE = void 0,
	                JDE0tab = void 0,
	                S = void 0,
	                T = void 0,
	                W = void 0,
	                Y = void 0;
	            /*  Initialise terms for mean equinox and solstices.  We
	             have two sets: one for years prior to 1000 and a second
	             for subsequent years.  */

	            if (year < 1000) {
	                JDE0tab = this.JDE0tab1000;
	                Y = year / 1000;
	            } else {
	                JDE0tab = this.JDE0tab2000;
	                Y = (year - 2000) / 1000;
	            }

	            JDE0 = JDE0tab[which][0] + JDE0tab[which][1] * Y + JDE0tab[which][2] * Y * Y + JDE0tab[which][3] * Y * Y * Y + JDE0tab[which][4] * Y * Y * Y * Y;
	            T = (JDE0 - 2451545.0) / 36525;
	            W = 35999.373 * T - 2.47;
	            deltaL = 1 + 0.0334 * this.dcos(W) + 0.0007 * this.dcos(2 * W);
	            S = 0;
	            for (i = j = 0; i < 24; i++) {
	                S += this.EquinoxpTerms[j] * this.dcos(this.EquinoxpTerms[j + 1] + this.EquinoxpTerms[j + 2] * T);
	                j += 3;
	            }
	            JDE = JDE0 + S * 0.00001 / deltaL;
	            return JDE;
	        }

	        /**
	         * @desc  Position of the Sun.  Please see the comments
	         on the return statement at the end of this function
	         which describe the array it returns.  We return
	         intermediate values because they are useful in a
	         variety of other contexts.
	         * @param jd
	         * @return Object
	         */

	    }, {
	        key: "sunpos",
	        value: function sunpos(jd) {
	            var T = void 0,
	                T2 = void 0,
	                L0 = void 0,
	                M = void 0,
	                e = void 0,
	                C = void 0,
	                sunLong = void 0,
	                sunAnomaly = void 0,
	                sunR = void 0,
	                Omega = void 0,
	                Lambda = void 0,
	                epsilon = void 0,
	                epsilon0 = void 0,
	                Alpha = void 0,
	                Delta = void 0,
	                AlphaApp = void 0,
	                DeltaApp = void 0;

	            T = (jd - this.J2000) / this.JulianCentury;
	            T2 = T * T;
	            L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T2;
	            L0 = this.fixangle(L0);
	            M = 357.52911 + 35999.05029 * T + -0.0001537 * T2;
	            M = this.fixangle(M);
	            e = 0.016708634 + -0.000042037 * T + -0.0000001267 * T2;
	            C = (1.914602 + -0.004817 * T + -0.000014 * T2) * this.dsin(M) + (0.019993 - 0.000101 * T) * this.dsin(2 * M) + 0.000289 * this.dsin(3 * M);
	            sunLong = L0 + C;
	            sunAnomaly = M + C;
	            sunR = 1.000001018 * (1 - e * e) / (1 + e * this.dcos(sunAnomaly));
	            Omega = 125.04 - 1934.136 * T;
	            Lambda = sunLong + -0.00569 + -0.00478 * this.dsin(Omega);
	            epsilon0 = this.obliqeq(jd);
	            epsilon = epsilon0 + 0.00256 * this.dcos(Omega);
	            Alpha = this.rtd(Math.atan2(this.dcos(epsilon0) * this.dsin(sunLong), this.dcos(sunLong)));
	            Alpha = this.fixangle(Alpha);
	            Delta = this.rtd(Math.asin(this.dsin(epsilon0) * this.dsin(sunLong)));
	            AlphaApp = this.rtd(Math.atan2(this.dcos(epsilon) * this.dsin(Lambda), this.dcos(Lambda)));
	            AlphaApp = this.fixangle(AlphaApp);
	            DeltaApp = this.rtd(Math.asin(this.dsin(epsilon) * this.dsin(Lambda)));

	            return [//  Angular quantities are expressed in decimal degrees
	            L0, //  [0] Geometric mean longitude of the Sun
	            M, //  [1] Mean anomaly of the Sun
	            e, //  [2] Eccentricity of the Earth's orbit
	            C, //  [3] Sun's equation of the Centre
	            sunLong, //  [4] Sun's true longitude
	            sunAnomaly, //  [5] Sun's true anomaly
	            sunR, //  [6] Sun's radius vector in AU
	            Lambda, //  [7] Sun's apparent longitude at true equinox of the date
	            Alpha, //  [8] Sun's true right ascension
	            Delta, //  [9] Sun's true declination
	            AlphaApp, // [10] Sun's apparent right ascension
	            DeltaApp // [11] Sun's apparent declination
	            ];
	        }

	        /**
	         * @desc Compute equation of time for a given moment. Returns the equation of time as a fraction of a day.
	         * @param jd
	         * @return {number|*}
	         */

	    }, {
	        key: "equationOfTime",
	        value: function equationOfTime(jd) {
	            var alpha = void 0,
	                deltaPsi = void 0,
	                E = void 0,
	                epsilon = void 0,
	                L0 = void 0,
	                tau = void 0;
	            tau = (jd - this.J2000) / this.JulianMillennium;
	            L0 = 280.4664567 + 360007.6982779 * tau + 0.03032028 * tau * tau + tau * tau * tau / 49931 + -(tau * tau * tau * tau / 15300) + -(tau * tau * tau * tau * tau / 2000000);
	            L0 = this.fixangle(L0);
	            alpha = this.sunpos(jd)[10];
	            deltaPsi = this.nutation(jd)[0];
	            epsilon = this.obliqeq(jd) + this.nutation(jd)[1];
	            E = L0 + -0.0057183 + -alpha + deltaPsi * this.dcos(epsilon);
	            E = E - 20.0 * Math.floor(E / 20.0);
	            E = E / (24 * 60);
	            return E;
	        }
	    }]);

	    return ASTRO;
	}();

	module.exports = ASTRO;

	/***/ }),
	/* 4 */
	/***/ (function(module, exports, __webpack_require__) {


	/**
	 * Constants
	 * @module constants
	 */

	module.exports = {
	    durationUnit: {
	        year: ['y', 'years', 'year'],
	        month: ['M', 'months', 'month'],
	        day: ['d', 'days', 'day'],
	        hour: ['h', 'hours', 'hour'],
	        minute: ['m', 'minutes', 'minute'],
	        second: ['s', 'second', 'seconds'],
	        millisecond: ['ms', 'milliseconds', 'millisecond'],
	        week: ['W', 'w', 'weeks', 'week']
	    }
	};

	/***/ }),
	/* 5 */
	/***/ (function(module, exports, __webpack_require__) {


	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Helpers = __webpack_require__(0);
	var normalizeDuration = new Helpers().normalizeDuration;
	var absRound = new Helpers().absRound;
	var absFloor = new Helpers().absFloor;
	/**
	 * Duration object constructor
	 * @param duration
	 * @class Duration
	 * @constructor
	 */

	var Duration = function () {
	    function Duration(key, value) {
	        _classCallCheck(this, Duration);

	        var duration = {},
	            data = this._data = {},
	            milliseconds = 0,
	            normalizedUnit = normalizeDuration(key, value),
	            unit = normalizedUnit.unit;
	        duration[unit] = normalizedUnit.value;
	        milliseconds = duration.milliseconds || duration.millisecond || duration.ms || 0;

	        var years = duration.years || duration.year || duration.y || 0,
	            months = duration.months || duration.month || duration.M || 0,
	            weeks = duration.weeks || duration.w || duration.week || 0,
	            days = duration.days || duration.d || duration.day || 0,
	            hours = duration.hours || duration.hour || duration.h || 0,
	            minutes = duration.minutes || duration.minute || duration.m || 0,
	            seconds = duration.seconds || duration.second || duration.s || 0;
	        // representation for dateAddRemove
	        this._milliseconds = milliseconds + seconds * 1e3 + minutes * 6e4 + hours * 36e5;
	        // Because of dateAddRemove treats 24 hours as different from a
	        // day when working around DST, we need to store them separately
	        this._days = days + weeks * 7;
	        // It is impossible translate months into days without knowing
	        // which months you are are talking about, so we have to store
	        // it separately.
	        this._months = months + years * 12;
	        // The following code bubbles up values, see the tests for
	        // examples of what that means.
	        data.milliseconds = milliseconds % 1000;
	        seconds += absFloor(milliseconds / 1000);
	        data.seconds = seconds % 60;
	        minutes += absRound(seconds / 60);
	        data.minutes = minutes % 60;
	        hours += absRound(minutes / 60);
	        data.hours = hours % 24;
	        days += absRound(hours / 24);
	        days += weeks * 7;
	        data.days = days % 30;
	        months += absRound(days / 30);
	        data.months = months % 12;
	        years += absRound(months / 12);
	        data.years = years;
	        return this;
	    }

	    _createClass(Duration, [{
	        key: 'valueOf',
	        value: function valueOf() {
	            return this._milliseconds + this._days * 864e5 + this._months * 2592e6;
	        }
	    }]);

	    return Duration;
	}();

	module.exports = Duration;

	/***/ }),
	/* 6 */
	/***/ (function(module, exports, __webpack_require__) {


	/**
	 * Constants
	 * @module constants
	 */

	module.exports = {
	    gregorian: {
	        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	        weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	        weekdaysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
	    },
	    persian: {
	        months: ['Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar', 'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'],
	        monthsShort: ['Far', 'Ord', 'Kho', 'Tir', 'Mor', 'Sha', 'Meh', 'Aba', 'Aza', 'Dey', 'Bah', 'Esf'],
	        weekdays: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
	        weekdaysShort: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
	        weekdaysMin: ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'],
	        persianDaysName: ['Urmazd', 'Bahman', 'Ordibehesht', 'Shahrivar', 'Sepandarmaz', 'Khurdad', 'Amordad', 'Dey-be-azar', 'Azar', 'Aban', 'Khorshid', 'Mah', 'Tir', 'Gush', 'Dey-be-mehr', 'Mehr', 'Sorush', 'Rashn', 'Farvardin', 'Bahram', 'Ram', 'Bad', 'Dey-be-din', 'Din', 'Ord', 'Ashtad', 'Asman', 'Zamyad', 'Mantre-sepand', 'Anaram', 'Ziadi']
	    }
	};

	/***/ }),
	/* 7 */
	/***/ (function(module, exports, __webpack_require__) {


	/**
	 * Constants
	 * @module constants
	 */

	module.exports = {
	    gregorian: {
	        months: 'ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر'.split('_'),
	        monthsShort: 'ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر'.split('_'),
	        weekdays: '\u06CC\u06A9\u200C\u0634\u0646\u0628\u0647_\u062F\u0648\u0634\u0646\u0628\u0647_\u0633\u0647\u200C\u0634\u0646\u0628\u0647_\u0686\u0647\u0627\u0631\u0634\u0646\u0628\u0647_\u067E\u0646\u062C\u200C\u0634\u0646\u0628\u0647_\u062C\u0645\u0639\u0647_\u0634\u0646\u0628\u0647'.split('_'),
	        weekdaysShort: '\u06CC\u06A9\u200C\u0634\u0646\u0628\u0647_\u062F\u0648\u0634\u0646\u0628\u0647_\u0633\u0647\u200C\u0634\u0646\u0628\u0647_\u0686\u0647\u0627\u0631\u0634\u0646\u0628\u0647_\u067E\u0646\u062C\u200C\u0634\u0646\u0628\u0647_\u062C\u0645\u0639\u0647_\u0634\u0646\u0628\u0647'.split('_'),
	        weekdaysMin: 'ی_د_س_چ_پ_ج_ش'.split('_')
	    },
	    persian: {
	        months: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
	        monthsShort: ['فرو', 'ارد', 'خرد', 'تیر', 'مرد', 'شهر', 'مهر', 'آبا', 'آذر', 'دی', 'بهم', 'اسف'],
	        weekdays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهار شنبه', '\u067E\u0646\u062C\u200C\u0634\u0646\u0628\u0647', 'جمعه'],
	        weekdaysShort: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
	        weekdaysMin: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
	        persianDaysName: ['اورمزد', 'بهمن', 'اوردیبهشت', 'شهریور', 'سپندارمذ', 'خورداد', 'امرداد', 'دی به آذز', 'آذز', 'آبان', 'خورشید', 'ماه', 'تیر', 'گوش', 'دی به مهر', 'مهر', 'سروش', 'رشن', 'فروردین', 'بهرام', 'رام', 'باد', 'دی به دین', 'دین', 'ارد', 'اشتاد', 'آسمان', 'زامیاد', 'مانتره سپند', 'انارام', 'زیادی']
	    }
	};

	/***/ }),
	/* 8 */
	/***/ (function(module, exports, __webpack_require__) {


	var PersianDateClass = __webpack_require__(1);
	PersianDateClass.calendarType = 'persian';
	PersianDateClass.leapYearMode = 'astronomical';
	PersianDateClass.localType = 'fa';
	module.exports = PersianDateClass;

	/***/ }),
	/* 9 */
	/***/ (function(module, exports, __webpack_require__) {


	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Container = function Container() {
	    _classCallCheck(this, Container);

	    this.isInvalidDate = null;

	    this.gDate = null;
	    /**
	     *
	     * @type {number}
	     */
	    this.modifiedjulianday = 0;

	    /**
	     *
	     * @type {number}
	     */
	    this.julianday = 0;

	    /**
	     *
	     * @type {{day: number}}
	     */
	    this.gregserial = {
	        day: 0
	    };

	    this.zone = 0;

	    /**
	     *
	     * @type {{year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number, weekday: number, unix: number, leap: number}}
	     */
	    this.gregorian = {
	        year: 0,
	        month: 0,
	        day: 0,
	        hour: 0,
	        minute: 0,
	        second: 0,
	        millisecond: 0,
	        weekday: 0,
	        unix: 0,
	        leap: 0
	    };

	    /**
	     *
	     * @type {{year: number, month: number, day: number, leap: number, weekday: number}}
	     */
	    this.juliancalendar = {
	        year: 0,
	        month: 0,
	        day: 0,
	        leap: 0,
	        weekday: 0
	    };

	    /**
	     *
	     * @type {{year: number, month: number, day: number, leap: number, weekday: number}}
	     */
	    this.islamic = {
	        year: 0,
	        month: 0,
	        day: 0,
	        leap: 0,
	        weekday: 0
	    };

	    /**
	     *
	     * @type {{year: number, month: number, day: number, leap: number, weekday: number}}
	     */
	    this.persianAlgo = this.persian = {
	        year: 0,
	        month: 0,
	        day: 0,
	        leap: 0,
	        weekday: 0
	    };

	    /**
	     *
	     * @type {{year: number, month: number, day: number, leap: number, weekday: number}}
	     */
	    this.persianAstro = {
	        year: 0,
	        month: 0,
	        day: 0,
	        leap: 0,
	        weekday: 0
	    };

	    /**
	     *
	     * @type {{year: number, week: number, day: number}}
	     */
	    this.isoweek = {
	        year: 0,
	        week: 0,
	        day: 0
	    };

	    /**
	     *
	     * @type {{year: number, day: number}}
	     */
	    this.isoday = {
	        year: 0,
	        day: 0
	    };
	};

	module.exports = Container;

	/***/ }),
	/* 10 */
	/***/ (function(module, exports, __webpack_require__) {


	module.exports = {
	    /**
	     * @param input
	     * @returns {boolean}
	     */
	    isArray: function isArray(input) {
	        return Object.prototype.toString.call(input) === '[object Array]';
	    },


	    /**
	     *
	     * @param input
	     * @returns {boolean}
	     */
	    isNumber: function isNumber(input) {
	        return typeof input === 'number';
	    },


	    /**
	     *
	     * @param input
	     * @returns {boolean}
	     */
	    isDate: function isDate(input) {
	        return input instanceof Date;
	    }
	};

	/***/ }),
	/* 11 */
	/***/ (function(module, exports, __webpack_require__) {


	module.exports = {
	  /**
	   * @param input
	   * @returns {boolean}
	   */
	  validateInputArray: function validateInputArray(input) {
	    var out = true;
	    // Check month
	    if (input[1] < 1 || input[1] > 12) {
	      out = false;
	    }
	    // Check date
	    if (input[2] < 1 || input[1] > 31) {
	      out = false;
	    }
	    // Check hour 
	    if (input[3] < 0 || input[3] > 24) {
	      out = false;
	    }
	    // Check minute 
	    if (input[4] < 0 || input[4] > 60) {
	      out = false;
	    }
	    // Check second 
	    if (input[5] < 0 || input[5] > 60) {
	      out = false;
	    }
	    return out;
	  }
	};

	/***/ })
	/******/ ]);
	});
	});

	var persianDate$2 = unwrapExports(persianDate$1);

	var persianDatepicker_min = createCommonjsModule(function (module, exports) {
	/*
	** persian-datepicker - v1.2.0
	** Reza Babakhani <babakhani.reza@gmail.com>
	** http://babakhani.github.io/PersianWebToolkit/docs/datepicker
	** Under MIT license 
	*/ 

	!function(e,t){module.exports=t();}(commonjsGlobal,function(){return function(e){function t(n){if(i[n])return i[n].exports;var a=i[n]={i:n,l:!1,exports:{}};return e[n].call(a.exports,a,a.exports,t),a.l=!0,a.exports}var i={};return t.m=e,t.c=i,t.i=function(e){return e},t.d=function(e,i,n){t.o(e,i)||Object.defineProperty(e,i,{configurable:!1,enumerable:!0,get:n});},t.n=function(e){var i=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(i,"a",i),i},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=5)}([function(e,t,i){var n={debounce:function(e,t,i){var n;return function(){var a=this,o=arguments,s=function(){n=null,i||e.apply(a,o);},r=i&&!n;clearTimeout(n),n=setTimeout(s,t),r&&e.apply(a,o);}},log:function(e){console.log(e);},isMobile:function(){var e=!1;return function(t){(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(t)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(t.substr(0,4)))&&(e=!0);}(navigator.userAgent||navigator.vendor||window.opera),e}(),debug:function(e,t){window.persianDatepickerDebug&&(e.constructor.name?console.log("Debug: "+e.constructor.name+" : "+t):console.log("Debug: "+t));},delay:function(e,t){clearTimeout(window.datepickerTimer),window.datepickerTimer=setTimeout(e,t);}};e.exports=n;},function(e,t,i){e.exports='\n<div id="plotId" class="datepicker-plot-area {{cssClass}}">\n    {{#navigator.enabled}}\n        <div data-navigator class="datepicker-navigator">\n            <div class="pwt-btn pwt-btn-next">{{navigator.text.btnNextText}}</div>\n            <div class="pwt-btn pwt-btn-switch">{{navigator.switch.text}}</div>\n            <div class="pwt-btn pwt-btn-prev">{{navigator.text.btnPrevText}}</div>\n        </div>\n    {{/navigator.enabled}}\n    <div class="datepicker-grid-view" >\n    {{#days.enabled}}\n        {{#days.viewMode}}\n        <div class="datepicker-day-view" >    \n            <div class="month-grid-box">\n                <div class="header">\n                    <div class="title"></div>\n                    <div class="header-row">\n                        {{#weekdays.list}}\n                            <div class="header-row-cell">{{.}}</div>\n                        {{/weekdays.list}}\n                    </div>\n                </div>    \n                <table cellspacing="0" class="table-days">\n                    <tbody>\n                        {{#days.list}}\n                           \n                            <tr>\n                                {{#.}}\n                                    {{#enabled}}\n                                        <td data-date="{{dataDate}}" data-unix="{{dataUnix}}" >\n                                            <span  class="{{#otherMonth}}other-month{{/otherMonth}}">{{title}}</span>\n                                            {{#altCalendarShowHint}}\n                                            <i  class="alter-calendar-day">{{alterCalTitle}}</i>\n                                            {{/altCalendarShowHint}}\n                                        </td>\n                                    {{/enabled}}\n                                    {{^enabled}}\n                                        <td data-date="{{dataDate}}" data-unix="{{dataUnix}}" class="disabled">\n                                            <span class="{{#otherMonth}}other-month{{/otherMonth}}">{{title}}</span>\n                                            {{#altCalendarShowHint}}\n                                            <i  class="alter-calendar-day">{{alterCalTitle}}</i>\n                                            {{/altCalendarShowHint}}\n                                        </td>\n                                    {{/enabled}}\n                                    \n                                {{/.}}\n                            </tr>\n                        {{/days.list}}\n                    </tbody>\n                </table>\n            </div>\n        </div>\n        {{/days.viewMode}}\n    {{/days.enabled}}\n    \n    {{#month.enabled}}\n        {{#month.viewMode}}\n            <div class="datepicker-month-view">\n                {{#month.list}}\n                    {{#enabled}}               \n                        <div data-year="{{year}}" data-month="{{dataMonth}}" class="month-item {{#selected}}selected{{/selected}}">{{title}}</small></div>\n                    {{/enabled}}\n                    {{^enabled}}               \n                        <div data-year="{{year}}"data-month="{{dataMonth}}" class="month-item month-item-disable {{#selected}}selected{{/selected}}">{{title}}</small></div>\n                    {{/enabled}}\n                {{/month.list}}\n            </div>\n        {{/month.viewMode}}\n    {{/month.enabled}}\n    \n    {{#year.enabled }}\n        {{#year.viewMode }}\n            <div class="datepicker-year-view" >\n                {{#year.list}}\n                    {{#enabled}}\n                        <div data-year="{{dataYear}}" class="year-item {{#selected}}selected{{/selected}}">{{title}}</div>\n                    {{/enabled}}\n                    {{^enabled}}\n                        <div data-year="{{dataYear}}" class="year-item year-item-disable {{#selected}}selected{{/selected}}">{{title}}</div>\n                    {{/enabled}}                    \n                {{/year.list}}\n            </div>\n        {{/year.viewMode }}\n    {{/year.enabled }}\n    \n    </div>\n    {{#time}}\n    {{#enabled}}\n    <div class="datepicker-time-view">\n        {{#hour.enabled}}\n            <div class="hour time-segment" data-time-key="hour">\n                <div class="up-btn" data-time-key="hour">▲</div>\n                <input disabled value="{{hour.title}}" type="text" placeholder="hour" class="hour-input">\n                <div class="down-btn" data-time-key="hour">▼</div>                    \n            </div>       \n            <div class="divider">\n                <span>:</span>\n            </div>\n        {{/hour.enabled}}\n        {{#minute.enabled}}\n            <div class="minute time-segment" data-time-key="minute" >\n                <div class="up-btn" data-time-key="minute">▲</div>\n                <input disabled value="{{minute.title}}" type="text" placeholder="minute" class="minute-input">\n                <div class="down-btn" data-time-key="minute">▼</div>\n            </div>        \n            <div class="divider second-divider">\n                <span>:</span>\n            </div>\n        {{/minute.enabled}}\n        {{#second.enabled}}\n            <div class="second time-segment" data-time-key="second"  >\n                <div class="up-btn" data-time-key="second" >▲</div>\n                <input disabled value="{{second.title}}"  type="text" placeholder="second" class="second-input">\n                <div class="down-btn" data-time-key="second" >▼</div>\n            </div>\n            <div class="divider meridian-divider"></div>\n            <div class="divider meridian-divider"></div>\n        {{/second.enabled}}\n        {{#meridian.enabled}}\n            <div class="meridian time-segment" data-time-key="meridian" >\n                <div class="up-btn" data-time-key="meridian">▲</div>\n                <input disabled value="{{meridian.title}}" type="text" class="meridian-input">\n                <div class="down-btn" data-time-key="meridian">▼</div>\n            </div>\n        {{/meridian.enabled}}\n    </div>\n    {{/enabled}}\n    {{/time}}\n    \n    {{#toolbox}}\n    {{#enabled}}\n    <div class="toolbox">\n        {{#toolbox.submitButton.enabled}}\n            <div class="pwt-btn-submit">{{submitButtonText}}</div>\n        {{/toolbox.submitButton.enabled}}        \n        {{#toolbox.todayButton.enabled}}\n            <div class="pwt-btn-today">{{todayButtonText}}</div>\n        {{/toolbox.todayButton.enabled}}        \n        {{#toolbox.calendarSwitch.enabled}}\n            <div class="pwt-btn-calendar">{{calendarSwitchText}}</div>\n        {{/toolbox.calendarSwitch.enabled}}\n    </div>\n    {{/enabled}}\n    {{^enabled}}\n        {{#onlyTimePicker}}\n        <div class="toolbox">\n            <div class="pwt-btn-submit">{{submitButtonText}}</div>\n        </div>\n        {{/onlyTimePicker}}\n    {{/enabled}}\n    {{/toolbox}}\n</div>\n';},function(e,t,i){function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var a=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}(),o=i(11),s=i(12),r=i(13),l=i(6),d=i(3),c=i(7),u=i(8),h=i(10),m=function(){function e(t,i){return n(this,e),this.components(t,i)}return a(e,[{key:"components",value:function(e,t){return this.initialUnix=null,this.inputElement=e,this.options=new u(t,this),this.PersianDate=new h(this),this.state=new o(this),this.api=new d(this),this.input=new l(this,e),this.view=new r(this),this.toolbox=new s(this),this.updateInput=function(e){this.input.update(e);},this.state.setViewDateTime("unix",this.input.getOnInitState()),this.state.setSelectedDateTime("unix",this.input.getOnInitState()),this.view.render(),this.navigator=new c(this),this.api}}]),e}();e.exports=m;},function(e,t,i){function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var a=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}(),o=function(){function e(t){n(this,e),this.model=t;}return a(e,[{key:"show",value:function(){return this.model.view.show(),this.model.options.onShow(this.model),this.model}},{key:"getState",value:function(){return this.model.state}},{key:"hide",value:function(){return this.model.view.hide(),this.model.options.onHide(this.model),this.model}},{key:"toggle",value:function(){return this.model.view.toggle(),this.model.options.onToggle(this.model),this.model}},{key:"destroy",value:function(){this.model&&(this.model.view.destroy(),this.model.options.onDestroy(this.model),delete this.model);}},{key:"setDate",value:function(e){return this.model.state.setSelectedDateTime("unix",e),this.model.state.setViewDateTime("unix",e),this.model.state.setSelectedDateTime("unix",e),this.model.view.render(this.view),this.model.options.onSet(e),this.model}},{key:"options",get:function(){return this.model.options},set:function(e){var t=$.extend(!0,this.model.options,e);this.model.view.destroy(),this.model.components(this.model.inputElement,t);}}]),e}();e.exports=o;},function(e,t,i){var n=i(0),a={calendarType:"persian",calendar:{persian:{locale:"fa",showHint:!1,leapYearMode:"algorithmic"},gregorian:{locale:"en",showHint:!1}},responsive:!0,inline:!1,initialValue:!0,initialValueType:"gregorian",persianDigit:!0,viewMode:"day",format:"LLLL",formatter:function(e){var t=this;return this.model.PersianDate.date(e).format(t.format)},altField:!1,altFormat:"unix",altFieldFormatter:function(e){var t=this,i=t.altFormat.toLowerCase(),n=void 0;return "gregorian"===i||"g"===i?new Date(e):"unix"===i||"u"===i?e:(n=this.model.PersianDate.date(e),n.format(t.altFormat))},minDate:null,maxDate:null,navigator:{enabled:!0,scroll:{enabled:!0},text:{btnNextText:"<",btnPrevText:">"},onNext:function(e){n.debug(e,"Event: onNext");},onPrev:function(e){n.debug(e,"Event: onPrev");},onSwitch:function(e){n.debug(e,"dayPicker Event: onSwitch");}},toolbox:{enabled:!0,text:{btnToday:"امروز"},submitButton:{enabled:n.isMobile,text:{fa:"تایید",en:"submit"},onSubmit:function(e){n.debug(e,"dayPicker Event: onSubmit");}},todayButton:{enabled:!0,text:{fa:"امروز",en:"today"},onToday:function(e){n.debug(e,"dayPicker Event: onToday");}},calendarSwitch:{enabled:!0,format:"MMMM",onSwitch:function(e){n.debug(e,"dayPicker Event: onSwitch");}},onToday:function(e){n.debug(e,"dayPicker Event: onToday");}},onlyTimePicker:!1,onlySelectOnDate:!0,checkDate:function(){return !0},checkMonth:function(){return !0},checkYear:function(){return !0},timePicker:{enabled:!1,step:1,hour:{enabled:!0,step:null},minute:{enabled:!0,step:null},second:{enabled:!0,step:null},meridian:{enabled:!1}},dayPicker:{enabled:!0,titleFormat:"YYYY MMMM",titleFormatter:function(e,t){return this.model.PersianDate.date([e,t]).format(this.model.options.dayPicker.titleFormat)},onSelect:function(e){n.debug(this,"dayPicker Event: onSelect : "+e);}},monthPicker:{enabled:!0,titleFormat:"YYYY",titleFormatter:function(e){return this.model.PersianDate.date(e).format(this.model.options.monthPicker.titleFormat)},onSelect:function(e){n.debug(this,"monthPicker Event: onSelect : "+e);}},yearPicker:{enabled:!0,titleFormat:"YYYY",titleFormatter:function(e){var t=12*parseInt(e/12,10),i=this.model.PersianDate.date([t]),n=this.model.PersianDate.date([t+11]);return i.format(this.model.options.yearPicker.titleFormat)+"-"+n.format(this.model.options.yearPicker.titleFormat)},onSelect:function(e){n.debug(this,"yearPicker Event: onSelect : "+e);}},onSelect:function(e){n.debug(this,"datepicker Event: onSelect : "+e);},onSet:function(e){n.debug(this,"datepicker Event: onSet : "+e);},position:"auto",onShow:function(e){n.debug(e,"Event: onShow ");},onHide:function(e){n.debug(e,"Event: onHide ");},onToggle:function(e){n.debug(e,"Event: onToggle ");},onDestroy:function(e){n.debug(e,"Event: onDestroy ");},autoClose:!1,template:null,observer:!1,inputDelay:800};e.exports=a;},function(e,t,i){var n=i(2);!function(e){e.fn.persianDatepicker=e.fn.pDatepicker=function(t){var i=Array.prototype.slice.call(arguments),a=null,o=this;return this||e.error("Invalid selector"),e(this).each(function(){var s=[],r=i.concat(s),l=e(this).data("datepicker"),d=null;l&&"string"==typeof r[0]?(d=r[0],a=l[d](r[0])):o.pDatePicker=new n(this,t);}),e(this).data("datepicker",o.pDatePicker),o.pDatePicker};}(jQuery);},function(e,t,i){function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var a=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}(),o=i(0),s=i(9),r=function(){function e(t,i){return n(this,e),this.model=t,this._firstUpdate=!0,this.elem=i,this.model.options.observer&&this.observe(),this.addInitialClass(),this.initialUnix=null,0==this.model.options.inline&&this._attachInputElementEvents(),this}return a(e,[{key:"addInitialClass",value:function(){$(this.elem).addClass("pwt-datepicker-input-element");}},{key:"parseInput",value:function(e){var t=new s,i=this;if(void 0!==t.parse(e)){var n=this.model.PersianDate.date(t.parse(e)).valueOf();i.model.state.setSelectedDateTime("unix",n),i.model.state.setViewDateTime("unix",n),i.model.view.render();}}},{key:"observe",value:function(){function e(e){t.parseInput(e.val());}var t=this;$(t.elem).bind("paste",function(e){o.delay(function(){t.parseInput(e.target.value);},60);});var i=void 0,n=t.model.options.inputDelay,a=!1,s=[17,91];$(document).keydown(function(e){$.inArray(e.keyCode,s)>0&&(a=!0);}).keyup(function(e){$.inArray(e.keyCode,s)>0&&(a=!1);}),$(t.elem).bind("keyup",function(t){var o=$(this),r=!1;(8===t.keyCode||t.keyCode<105&&t.keyCode>96||t.keyCode<58&&t.keyCode>47||a&&(86==t.keyCode||$.inArray(t.keyCode,s)>0))&&(r=!0),r&&(clearTimeout(i),i=setTimeout(function(){e(o);},n));}),$(t.elem).on("keydown",function(){clearTimeout(i);});}},{key:"_attachInputElementEvents",value:function(){var e=this,t=function t(i){$(i.target).is(e.elem)||$(i.target).is(e.model.view.$container)||0!=$(i.target).closest("#"+e.model.view.$container.attr("id")).length||$(i.target).is($(e.elem).children())||(e.model.api.hide(),$("body").unbind("click",t));};$(this.elem).on("focus click",o.debounce(function(i){return e.model.api.show(),!1===e.model.state.ui.isInline&&$("body").unbind("click",t).bind("click",t),o.isMobile&&$(this).blur(),i.stopPropagation(),!1},200)),$(this.elem).on("keydown",o.debounce(function(t){if(9===t.which)return e.model.api.hide(),!1},200));}},{key:"getInputPosition",value:function(){return $(this.elem).offset()}},{key:"getInputSize",value:function(){return {width:$(this.elem).outerWidth(),height:$(this.elem).outerHeight()}}},{key:"_updateAltField",value:function(e){var t=this.model.options.altFieldFormatter(e);$(this.model.options.altField).val(t);}},{key:"_updateInputField",value:function(e){var t=this.model.options.formatter(e);$(this.elem).val()!=t&&$(this.elem).val(t);}},{key:"update",value:function(e){0==this.model.options.initialValue&&this._firstUpdate?this._firstUpdate=!1:(this._updateInputField(e),this._updateAltField(e));}},{key:"getOnInitState",value:function(){var e=null,t=$(this.elem),i=void 0;if((i="INPUT"===t[0].nodeName?t[0].getAttribute("value"):t.data("date"))&&i.match("^([0-1][0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$")){var n=i.split(":"),a=new Date;a.setHours(n[0]),a.setMinutes(n[1]),n[2]?a.setSeconds(n[2]):a.setSeconds(0),this.initialUnix=a.valueOf();}else {if("persian"===this.model.options.initialValueType&&i){var o=new s,r=new persianDate(o.parse(i)).valueOf();e=new Date(r).valueOf();}else "unix"===this.model.options.initialValueType&&i?e=parseInt(i):i&&(e=new Date(i).valueOf());this.initialUnix=e&&"undefined"!=e?e:(new Date).valueOf();}return this.initialUnix}}]),e}();e.exports=r;},function(e,t,i){function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var a=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}(),o=i(14),s=function(){function e(t){return n(this,e),this.model=t,this.liveAttach(),this._attachEvents(),this}return a(e,[{key:"liveAttach",value:function(){if(this.model.options.navigator.scroll.enabled){var e=this,t=$("#"+e.model.view.id+" .datepicker-grid-view")[0];o(t).wheel(function(t,i){i>0?e.model.state.navigate("next"):e.model.state.navigate("prev"),e.model.view.render(),t.preventDefault();}),this.model.options.timePicker.enabled&&$("#"+e.model.view.id+" .time-segment").each(function(){o(this).wheel(function(t,i){var n=$(t.target),a=n.data("time-key")?n.data("time-key"):n.parents("[data-time-key]").data("time-key");a&&(i>0?e.timeUp(a):e.timeDown(a)),e.model.view.render(),t.preventDefault();});});}}},{key:"timeUp",value:function(e){if(void 0!=this.model.options.timePicker[e]){var t=void 0,i=void 0,n=this;"meridian"==e?(t=12,i="PM"==this.model.state.view.meridian?this.model.PersianDate.date(this.model.state.selected.unixDate).add("hour",t).valueOf():this.model.PersianDate.date(this.model.state.selected.unixDate).subtract("hour",t).valueOf(),this.model.state.meridianToggle()):(t=this.model.options.timePicker[e].step,i=this.model.PersianDate.date(this.model.state.selected.unixDate).add(e,t).valueOf()),this.model.state.setViewDateTime("unix",i),this.model.state.setSelectedDateTime("unix",i),this.model.view.renderTimePartial(),clearTimeout(this.scrollDelayTimeDown),this.scrollDelayTimeUp=setTimeout(function(){n.model.view.markSelectedDay();},300);}}},{key:"timeDown",value:function(e){if(void 0!=this.model.options.timePicker[e]){var t=void 0,i=void 0,n=this;"meridian"==e?(t=12,i="AM"==this.model.state.view.meridian?this.model.PersianDate.date(this.model.state.selected.unixDate).add("hour",t).valueOf():this.model.PersianDate.date(this.model.state.selected.unixDate).subtract("hour",t).valueOf(),this.model.state.meridianToggle()):(t=this.model.options.timePicker[e].step,i=this.model.PersianDate.date(this.model.state.selected.unixDate).subtract(e,t).valueOf()),this.model.state.setViewDateTime("unix",i),this.model.state.setSelectedDateTime("unix",i),this.model.view.renderTimePartial(),clearTimeout(this.scrollDelayTimeDown),this.scrollDelayTimeDown=setTimeout(function(){n.model.view.markSelectedDay();},300);}}},{key:"_attachEvents",value:function(){var e=this;this.model.options.navigator.enabled&&$(document).on("click","#"+e.model.view.id+" .pwt-btn",function(){$(this).is(".pwt-btn-next")?(e.model.state.navigate("next"),e.model.view.render(),e.model.options.navigator.onNext(e.model)):$(this).is(".pwt-btn-switch")?(e.model.state.switchViewMode(),e.model.view.render(),e.model.options.navigator.onSwitch(e.model)):$(this).is(".pwt-btn-prev")&&(e.model.state.navigate("prev"),e.model.view.render(),e.model.options.navigator.onPrev(e.model));}),this.model.options.timePicker.enabled&&($(document).on("click","#"+e.model.view.id+" .up-btn",function(){var t=$(this).data("time-key");e.timeUp(t),e.model.options.onSelect(e.model.state.selected.unixDate);}),$(document).on("click","#"+e.model.view.id+" .down-btn",function(){var t=$(this).data("time-key");e.timeDown(t),e.model.options.onSelect(e.model.state.selected.unixDate);})),this.model.options.dayPicker.enabled&&$(document).on("click","#"+e.model.view.id+" .datepicker-day-view td:not(.disabled)",function(){var t=$(this).data("unix"),i=void 0;e.model.state.setSelectedDateTime("unix",t),i=e.model.state.selected.month!==e.model.state.view.month,e.model.state.setViewDateTime("unix",e.model.state.selected.unixDate),e.model.options.autoClose&&(e.model.view.hide(),e.model.options.onHide(e)),i?e.model.view.render():e.model.view.markSelectedDay(),e.model.options.dayPicker.onSelect(t),e.model.options.onSelect(t);}),this.model.options.monthPicker.enabled&&$(document).on("click","#"+e.model.view.id+" .datepicker-month-view .month-item:not(.month-item-disable)",function(){var t=$(this).data("month"),i=$(this).data("year");e.model.state.switchViewModeTo("day"),e.model.options.onlySelectOnDate||(e.model.state.setSelectedDateTime("year",i),e.model.state.setSelectedDateTime("month",t),e.model.options.autoClose&&(e.model.view.hide(),e.model.options.onHide(e))),e.model.state.setViewDateTime("month",t),e.model.view.render(),e.model.options.monthPicker.onSelect(t),e.model.options.onSelect(e.model.state.selected.unixDate);}),this.model.options.yearPicker.enabled&&$(document).on("click","#"+e.model.view.id+" .datepicker-year-view .year-item:not(.year-item-disable)",function(){var t=$(this).data("year");e.model.state.switchViewModeTo("month"),e.model.options.onlySelectOnDate||(e.model.state.setSelectedDateTime("year",t),e.model.options.autoClose&&(e.model.view.hide(),e.model.options.onHide(e))),e.model.state.setViewDateTime("year",t),e.model.view.render(),e.model.options.yearPicker.onSelect(t),e.model.options.onSelect(e.model.state.selected.unixDate);});}}]),e}();e.exports=s;},function(e,t,i){function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var a=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}(),o=i(4),s=i(1),r=function(){function e(t,i){return n(this,e),this.model=i,this._compatibility($.extend(!0,this,o,t))}return a(e,[{key:"_compatibility",value:function(e){e.inline&&(e.toolbox.submitButton.enabled=!1),e.template||(e.template=s),persianDate.toCalendar(e.calendarType),persianDate.toLocale(e.calendar[e.calendarType].locale),e.onlyTimePicker&&(e.dayPicker.enabled=!1,e.monthPicker.enabled=!1,e.yearPicker.enabled=!1,e.navigator.enabled=!1,e.toolbox.enabled=!1,e.timePicker.enabled=!0),null===e.timePicker.hour.step&&(e.timePicker.hour.step=e.timePicker.step),null===e.timePicker.minute.step&&(e.timePicker.minute.step=e.timePicker.step),null===e.timePicker.second.step&&(e.timePicker.second.step=e.timePicker.step),!1===e.dayPicker.enabled&&(e.onlySelectOnDate=!1),e._viewModeList=[],e.dayPicker.enabled&&e._viewModeList.push("day"),e.monthPicker.enabled&&e._viewModeList.push("month"),e.yearPicker.enabled&&e._viewModeList.push("year");}}]),e}();e.exports=r;},function(e,t,i){function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var a=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}(),o=function(){function e(){n(this,e),this.pattern={iso:/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?$/g,jalali:/^[1-4]\d{3}(\/|-|\.)((0?[1-6](\/|-|\.)((3[0-1])|([1-2][0-9])|(0?[1-9])))|((1[0-2]|(0?[7-9]))(\/|-|\.)(30|([1-2][0-9])|(0?[1-9]))))$/g};}return a(e,[{key:"parse",value:function(e){var t=this,i=new RegExp(t.pattern.iso),n=new RegExp(t.pattern.jalali);return String.prototype.toEnglishDigits=function(){var e="۰".charCodeAt(0);return this.replace(/[۰-۹]/g,function(t){return t.charCodeAt(0)-e})},e=e.toEnglishDigits(),n.test(e)?e.split(/\/|-|\,|\./).map(Number):i.test(e)?e.split(/\/|-|\,|\:|\T|\Z/g).map(Number):void 0}}]),e}();e.exports=o;},function(e,t,i){function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var a=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}(),o=function(){function e(t){return n(this,e),this.model=t,this.model.options.calendar_=this.model.options.calendarType,this.model.options.locale_=this.model.options.calendar[this.model.options.calendarType].locale,this}return a(e,[{key:"date",value:function(e){window.inspdCount||0===window.inspdCount?window.inspdCount++:window.inspdCount=0;var t=this,i=void 0,n=void 0;return n=persianDate.toCalendar(t.model.options.calendar_),this.model.options.calendar[this.model.options.calendarType].leapYearMode&&n.toLeapYearMode(this.model.options.calendar[this.model.options.calendarType].leapYearMode),i=new n(e),i.toLocale(t.model.options.locale_)}}]),e}();e.exports=o;},function(e,t,i){function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var a=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}(),o=function(){function e(t){return n(this,e),this.model=t,this.filetredDate=this.model.options.minDate||this.model.options.maxDate,this.viewModeList=this.model.options._viewModeList,this.viewMode=this.viewModeList.indexOf(t.options.viewMode)>0?t.options.viewMode:this.viewModeList[0],this.viewModeIndex=this.viewModeList.indexOf(t.options.viewMode)>0?this.viewModeList.indexOf(t.options.viewMode):0,this.filterDate={start:{year:0,month:0,date:0,hour:0,minute:0,second:0,unixDate:0},end:{year:0,month:0,date:0,hour:0,minute:0,second:0,unixDate:0}},this.view={year:0,month:0,date:0,hour:0,minute:0,second:0,unixDate:0,dateObject:null,meridian:"AM"},this.selected={year:0,month:0,date:0,hour:0,hour12:0,minute:0,second:0,unixDate:0,dateObject:null},this.ui={isOpen:!1,isInline:this.model.options.inline},this._setFilterDate(this.model.options.minDate,this.model.options.maxDate),this}return a(e,[{key:"_setFilterDate",value:function(e,t){var i=this;e||(e=-2e15),t||(t=2e15);var n=i.model.PersianDate.date(e);i.filterDate.start.unixDate=e,i.filterDate.start.hour=n.hour(),i.filterDate.start.minute=n.minute(),i.filterDate.start.second=n.second(),i.filterDate.start.month=n.month(),i.filterDate.start.date=n.date(),i.filterDate.start.year=n.year();var a=i.model.PersianDate.date(t);i.filterDate.end.unixDate=t,i.filterDate.end.hour=a.hour(),i.filterDate.end.minute=a.minute(),i.filterDate.end.second=a.second(),i.filterDate.end.month=a.month(),i.filterDate.end.date=a.date(),i.filterDate.end.year=a.year();}},{key:"navigate",value:function(e){if("next"==e){if("year"==this.viewMode&&this.setViewDateTime("year",this.view.year+12),"month"==this.viewMode){var t=this.view.year+1;0===t&&(t=1),this.setViewDateTime("year",t);}if("day"==this.viewMode){var i=this.view.year+1;0===i&&(i=1),this.view.month+1==13?(this.setViewDateTime("year",i),this.setViewDateTime("month",1)):this.setViewDateTime("month",this.view.month+1);}}else {if("year"==this.viewMode&&this.setViewDateTime("year",this.view.year-12),"month"==this.viewMode){var n=this.view.year-1;0===n&&(n=-1),this.setViewDateTime("year",n);}if("day"==this.viewMode)if(this.view.month-1<=0){var a=this.view.year-1;0===a&&(a=-1),this.setViewDateTime("year",a),this.setViewDateTime("month",12);}else this.setViewDateTime("month",this.view.month-1);}}},{key:"switchViewMode",value:function(){return this.viewModeIndex=this.viewModeIndex+1>=this.viewModeList.length?0:this.viewModeIndex+1,this.viewMode=this.viewModeList[this.viewModeIndex]?this.viewModeList[this.viewModeIndex]:this.viewModeList[0],this._setViewDateTimeUnix(),this}},{key:"switchViewModeTo",value:function(e){this.viewModeList.indexOf(e)>=0&&(this.viewMode=e,this.viewModeIndex=this.viewModeList.indexOf(e));}},{key:"setSelectedDateTime",value:function(e,t){var i=this;switch(e){case"unix":i.selected.unixDate=t;var n=this.model.PersianDate.date(t);i.selected.year=n.year(),i.selected.month=n.month(),i.selected.date=n.date(),i.selected.hour=n.hour(),i.selected.hour12=n.format("hh"),i.selected.minute=n.minute(),i.selected.second=n.second();break;case"year":this.selected.year=t;break;case"month":this.selected.month=t;break;case"date":this.selected.date=t;break;case"hour":this.selected.hour=t;break;case"minute":this.selected.minute=t;break;case"second":this.selected.second=t;}return i._updateSelectedUnix(),this}},{key:"_updateSelectedUnix",value:function(){return this.selected.dateObject=this.model.PersianDate.date([this.selected.year,this.selected.month,this.selected.date,this.view.hour,this.view.minute,this.view.second]),this.selected.unixDate=this.selected.dateObject.valueOf(),this.model.updateInput(this.selected.unixDate),this}},{key:"_setViewDateTimeUnix",value:function(){var e=(new persianDate).daysInMonth(this.view.year,this.view.month);return this.view.date>e&&(this.view.date=e),this.view.dateObject=this.model.PersianDate.date([this.view.year,this.view.month,this.view.date,this.view.hour,this.view.minute,this.view.second]),this.view.year=this.view.dateObject.year(),this.view.month=this.view.dateObject.month(),this.view.date=this.view.dateObject.date(),this.view.hour=this.view.dateObject.hour(),this.view.hour12=this.view.dateObject.format("hh"),this.view.minute=this.view.dateObject.minute(),this.view.second=this.view.dateObject.second(),this.view.unixDate=this.view.dateObject.valueOf(),this}},{key:"setViewDateTime",value:function(e,t){var i=this;switch(e){case"unix":var n=this.model.PersianDate.date(t);i.view.year=n.year(),i.view.month=n.month(),i.view.date=n.date(),i.view.hour=n.hour(),i.view.minute=n.minute(),i.view.second=n.second();break;case"year":this.view.year=t;break;case"month":this.view.month=t;break;case"date":this.view.date=t;break;case"hour":this.view.hour=t;break;case"minute":this.view.minute=t;break;case"second":this.view.second=t;}return this._setViewDateTimeUnix(),this}},{key:"meridianToggle",value:function(){var e=this;"AM"===e.view.meridian?e.view.meridian="PM":"PM"===e.view.meridian&&(e.view.meridian="AM");}}]),e}();e.exports=o;},function(e,t,i){function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var a=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}(),o=function(){function e(t){return n(this,e),this.model=t,this._attachEvents(),this}return a(e,[{key:"_toggleCalendartype",value:function(){var e=this;"persian"==e.model.options.calendar_?(e.model.options.calendar_="gregorian",e.model.options.locale_=this.model.options.calendar.gregorian.locale):(e.model.options.calendar_="persian",e.model.options.locale_=this.model.options.calendar.persian.locale);}},{key:"_attachEvents",value:function(){var e=this;$(document).on("click","#"+e.model.view.id+" .pwt-btn-today",function(){e.model.state.setSelectedDateTime("unix",(new Date).valueOf()),e.model.state.setViewDateTime("unix",(new Date).valueOf()),e.model.view.reRender(),e.model.options.toolbox.onToday(e.model),e.model.options.toolbox.todayButton.onToday(e.model);}),$(document).on("click","#"+e.model.view.id+" .pwt-btn-calendar",function(){e._toggleCalendartype(),e.model.state.setSelectedDateTime("unix",e.model.state.selected.unixDate),e.model.state.setViewDateTime("unix",e.model.state.view.unixDate),e.model.view.render(),e.model.options.toolbox.calendarSwitch.onSwitch(e.model);}),$(document).on("click","#"+e.model.view.id+" .pwt-btn-submit",function(){e.model.view.hide(),e.model.options.toolbox.submitButton.onSubmit(e.model),e.model.options.onHide(this);});}}]),e}();e.exports=o;},function(e,t,i){function n(e){if(Array.isArray(e)){for(var t=0,i=Array(e.length);t<e.length;t++)i[t]=e[t];return i}return Array.from(e)}function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var o=function(){function e(e,t){var i=[],n=!0,a=!1,o=void 0;try{for(var s,r=e[Symbol.iterator]();!(n=(s=r.next()).done)&&(i.push(s.value),!t||i.length!==t);n=!0);}catch(e){a=!0,o=e;}finally{try{!n&&r.return&&r.return();}finally{if(a)throw o}}return i}return function(t,i){if(Array.isArray(t))return t;if(Symbol.iterator in Object(t))return e(t,i);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),s=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}(),r=i(1),l=i(0),d=i(15),c=function(){function e(t){a(this,e),this.yearsViewCount=12,this.model=t,this.rendered=null,this.$container=null,this.id="persianDateInstance-"+parseInt(1e3*Math.random(100));var i=this;return this.model.state.ui.isInline?this.$container=$('<div  id="'+this.id+'" class="datepicker-container-inline"></div>').appendTo(i.model.inputElement):(this.$container=$('<div  id="'+this.id+'" class="datepicker-container"></div>').appendTo("body"),this.hide(),this.setPickerBoxPosition(),this.addCompatibilityClass()),this}return s(e,[{key:"addCompatibilityClass",value:function(){l.isMobile&&this.model.options.responsive&&this.$container.addClass("pwt-mobile-view");}},{key:"destroy",value:function(){this.$container.remove();}},{key:"setPickerBoxPosition",value:function(){var e=this.model.input.getInputPosition(),t=this.model.input.getInputSize();if(l.isMobile&&this.model.options.responsive)return !1;"auto"===this.model.options.position?this.$container.css({left:e.left+"px",top:t.height+e.top+"px"}):this.$container.css({left:this.model.options.position[1]+e.left+"px",top:this.model.options.position[0]+e.top+"px"});}},{key:"show",value:function(){this.$container.removeClass("pwt-hide"),this.setPickerBoxPosition();}},{key:"hide",value:function(){this.$container.addClass("pwt-hide");}},{key:"toggle",value:function(){this.$container.toggleClass("pwt-hide");}},{key:"_getNavSwitchText",value:function(e){var t=void 0;return "day"==this.model.state.viewMode?t=this.model.options.dayPicker.titleFormatter.call(this,e.year,e.month):"month"==this.model.state.viewMode?t=this.model.options.monthPicker.titleFormatter.call(this,e.dateObject.valueOf()):"year"==this.model.state.viewMode&&(t=this.model.options.yearPicker.titleFormatter.call(this,e.year)),t}},{key:"checkYearAccess",value:function(e){if(this.model.state.filetredDate){var t=this.model.state.filterDate.start.year,i=this.model.state.filterDate.end.year;if(t&&e<t)return !1;if(i&&e>i)return !1}return this.model.options.checkYear(e)}},{key:"_getYearViewModel",value:function(e){var t=this,i=this.model.options.yearPicker.enabled;if(!i)return {enabled:!1};var a=[].concat(n(Array(this.yearsViewCount).keys())).map(function(i){return i+parseInt(e.year/t.yearsViewCount)*t.yearsViewCount}),o=[],s=this.model.PersianDate.date(),r=!0,l=!1,d=void 0;try{for(var c,u=a[Symbol.iterator]();!(r=(c=u.next()).done);r=!0){var h=c.value;s.year([h]),o.push({title:s.format("YYYY"),enabled:this.checkYearAccess(h),dataYear:h,selected:this.model.state.selected.year==h});}}catch(e){l=!0,d=e;}finally{try{!r&&u.return&&u.return();}finally{if(l)throw d}}return {enabled:i,viewMode:"year"==this.model.state.viewMode,list:o}}},{key:"checkMonthAccess",value:function(e){e+=1;var t=this.model.state.view.year;if(this.model.state.filetredDate){var i=this.model.state.filterDate.start.month,n=this.model.state.filterDate.end.month,a=this.model.state.filterDate.start.year,o=this.model.state.filterDate.end.year;if(i&&n&&(t==o&&e>n||t>o)||t==a&&e<i||t<a)return !1;if(n&&(t==o&&e>n||t>o))return !1;if(i&&(t==a&&e<i||t<a))return !1}return this.model.options.checkMonth(e,t)}},{key:"_getMonthViewModel",value:function(){var e=this.model.options.monthPicker.enabled;if(!e)return {enabled:!1};var t=[],i=this,n=!0,a=!1,s=void 0;try{for(var r,l=i.model.PersianDate.date().rangeName().months.entries()[Symbol.iterator]();!(n=(r=l.next()).done);n=!0){var d=o(r.value,2),c=d[0],u=d[1];t.push({title:u,enabled:this.checkMonthAccess(c),year:this.model.state.view.year,dataMonth:c+1,selected:this.model.state.selected.year==this.model.state.view.year&&this.model.state.selected.month==c+1});}}catch(e){a=!0,s=e;}finally{try{!n&&l.return&&l.return();}finally{if(a)throw s}}return {enabled:e,viewMode:"month"==this.model.state.viewMode,list:t}}},{key:"checkDayAccess",value:function(e){var t=this;if(t.minDate=this.model.options.minDate,t.maxDate=this.model.options.maxDate,t.model.state.filetredDate)if(t.minDate&&t.maxDate){if(t.minDate=t.model.PersianDate.date(t.minDate).startOf("day").valueOf(),t.maxDate=t.model.PersianDate.date(t.maxDate).endOf("day").valueOf(),!(e>=t.minDate&&e<=t.maxDate))return !1}else if(t.minDate){if(t.minDate=t.model.PersianDate.date(t.minDate).startOf("day").valueOf(),e<=t.minDate)return !1}else if(t.maxDate&&(t.maxDate=t.model.PersianDate.date(t.maxDate).endOf("day").valueOf(),e>=t.maxDate))return !1;return t.model.options.checkDate(e)}},{key:"_getDayViewModel",value:function(){if("day"!=this.model.state.viewMode)return [];var e=this.model.options.dayPicker.enabled;if(!e)return {enabled:!1};var t=this.model.state.view.month,i=this.model.state.view.year,n=this.model.PersianDate.date(),a=n.daysInMonth(i,t),s=n.getFirstWeekDayOfMonth(i,t)-1,r=[],l=0,d=0,c=[["null","null","null","null","null","null","null"],["null","null","null","null","null","null","null"],["null","null","null","null","null","null","null"],["null","null","null","null","null","null","null"],["null","null","null","null","null","null","null"],["null","null","null","null","null","null","null"]],u=this._getAnotherCalendar(),h=!0,m=!1,v=void 0;try{for(var p,f=c.entries()[Symbol.iterator]();!(h=(p=f.next()).done);h=!0){var w=o(p.value,2),y=w[0],b=w[1];r[y]=[];var k=!0,g=!1,D=void 0;try{for(var x,P=b.entries()[Symbol.iterator]();!(k=(x=P.next()).done);k=!0){var T=o(x.value,1),M=T[0],S=void 0,O=void 0;0===y&&M<s?(S=this.model.state.view.dateObject.startOf("month").hour(12).subtract("days",s-M),O=!0):0===y&&M>=s||y<=5&&l<a?(l+=1,S=new persianDate([this.model.state.view.year,this.model.state.view.month,l]),O=!1):(d+=1,S=this.model.state.view.dateObject.endOf("month").hour(12).add("days",d),O=!0),r[y].push({title:S.format("D"),alterCalTitle:new persianDate(S.valueOf()).toCalendar(u[0]).toLocale(u[1]).format("D"),dataDate:[S.year(),S.month(),S.date()].join(","),dataUnix:S.hour(12).valueOf(),otherMonth:O,enabled:this.checkDayAccess(S.valueOf())});}}catch(e){g=!0,D=e;}finally{try{!k&&P.return&&P.return();}finally{if(g)throw D}}}}catch(e){m=!0,v=e;}finally{try{!h&&f.return&&f.return();}finally{if(m)throw v}}return {enabled:e,viewMode:"day"==this.model.state.viewMode,list:r}}},{key:"markSelectedDay",value:function(){var e=this.model.state.selected;this.$container.find(".table-days td").each(function(){$(this).data("date")==[e.year,e.month,e.date].join(",")?$(this).addClass("selected"):$(this).removeClass("selected");});}},{key:"markToday",value:function(){var e=new persianDate;this.$container.find(".table-days td").each(function(){$(this).data("date")==[e.year(),e.month(),e.date()].join(",")?$(this).addClass("today"):$(this).removeClass("today");});}},{key:"_getTimeViewModel",value:function(){var e=this.model.options.timePicker.enabled;if(!e)return {enabled:!1};var t=void 0;return t=this.model.options.timePicker.meridian.enabled?this.model.state.view.dateObject.format("hh"):this.model.state.view.dateObject.format("HH"),{enabled:e,hour:{title:t,enabled:this.model.options.timePicker.hour.enabled},minute:{title:this.model.state.view.dateObject.format("mm"),enabled:this.model.options.timePicker.minute.enabled},second:{title:this.model.state.view.dateObject.format("ss"),enabled:this.model.options.timePicker.second.enabled},meridian:{title:this.model.state.view.dateObject.format("a"),enabled:this.model.options.timePicker.meridian.enabled}}}},{key:"_getWeekViewModel",value:function(){return {enabled:!0,list:this.model.PersianDate.date().rangeName().weekdaysMin}}},{key:"getCssClass",value:function(){return [this.model.state.ui.isInline?"datepicker-plot-area-inline-view":"",this.model.options.timePicker.meridian.enabled?"":"datepicker-state-no-meridian",this.model.options.onlyTimePicker?"datepicker-state-only-time":"",this.model.options.timePicker.second.enabled?"":"datepicker-state-no-second","gregorian"==this.model.options.calendar_?"datepicker-gregorian":"datepicker-persian"].join(" ")}},{key:"getViewModel",value:function(e){var t=this._getAnotherCalendar();return {plotId:"",navigator:{enabled:this.model.options.navigator.enabled,switch:{enabled:!0,text:this._getNavSwitchText(e)},text:this.model.options.navigator.text},selected:this.model.state.selected,time:this._getTimeViewModel(e),days:this._getDayViewModel(e),weekdays:this._getWeekViewModel(e),month:this._getMonthViewModel(e),year:this._getYearViewModel(e),toolbox:this.model.options.toolbox,cssClass:this.getCssClass(),onlyTimePicker:this.model.options.onlyTimePicker,altCalendarShowHint:this.model.options.calendar[t[0]].showHint,calendarSwitchText:this.model.state.view.dateObject.toCalendar(t[0]).toLocale(t[1]).format(this.model.options.toolbox.calendarSwitch.format),todayButtonText:this._getButtonText().todayButtontext,submitButtonText:this._getButtonText().submitButtonText}}},{key:"_getButtonText",value:function(){var e={};return "fa"==this.model.options.locale_?(e.todayButtontext=this.model.options.toolbox.todayButton.text.fa,e.submitButtonText=this.model.options.toolbox.submitButton.text.fa):"en"==this.model.options.locale_&&(e.todayButtontext=this.model.options.toolbox.todayButton.text.en,e.submitButtonText=this.model.options.toolbox.submitButton.text.en),e}},{key:"_getAnotherCalendar",value:function(){var e=this,t=void 0,i=void 0;return "persian"==e.model.options.calendar_?(t="gregorian",i=e.model.options.calendar.gregorian.locale):(t="persian",i=e.model.options.calendar.persian.locale),[t,i]}},{key:"renderTimePartial",value:function(){var e=this._getTimeViewModel(this.model.state.view);this.$container.find('[data-time-key="hour"] input').val(e.hour.title),this.$container.find('[data-time-key="minute"] input').val(e.minute.title),this.$container.find('[data-time-key="second"] input').val(e.second.title),this.$container.find('[data-time-key="meridian"] input').val(e.meridian.title);}},{key:"render",value:function(e){e||(e=this.model.state.view),l.debug(this,"render"),d.parse(r),this.rendered=$(d.render(this.model.options.template,this.getViewModel(e))),this.$container.empty().append(this.rendered),this.markSelectedDay(),this.markToday(),this.afterRender();}},{key:"reRender",value:function(){var e=this.model.state.view;this.render(e);}},{key:"afterRender",value:function(){this.model.navigator&&this.model.navigator.liveAttach();}}]),e}();e.exports=c;},function(e,t,i){!function(t,i){var n=function(e){return new n.Instance(e)};n.SUPPORT="wheel",n.ADD_EVENT="addEventListener",n.REMOVE_EVENT="removeEventListener",n.PREFIX="",n.READY=!1,n.Instance=function(e){return n.READY||(n.normalise.browser(),n.READY=!0),this.element=e,this.handlers=[],this},n.Instance.prototype={wheel:function(e,t){return n.event.add(this,n.SUPPORT,e,t),"DOMMouseScroll"===n.SUPPORT&&n.event.add(this,"MozMousePixelScroll",e,t),this},unwheel:function(e,t){return void 0===e&&(e=this.handlers.slice(-1)[0])&&(e=e.original),n.event.remove(this,n.SUPPORT,e,t),"DOMMouseScroll"===n.SUPPORT&&n.event.remove(this,"MozMousePixelScroll",e,t),this}},n.event={add:function(e,i,a,o){var s=a;a=function(e){e||(e=t.event);var i=n.normalise.event(e),a=n.normalise.delta(e);return s(i,a[0],a[1],a[2])},e.element[n.ADD_EVENT](n.PREFIX+i,a,o||!1),e.handlers.push({original:s,normalised:a});},remove:function(e,t,i,a){for(var o,s=i,r={},l=0,d=e.handlers.length;l<d;++l)r[e.handlers[l].original]=e.handlers[l];o=r[s],i=o.normalised,e.element[n.REMOVE_EVENT](n.PREFIX+t,i,a||!1);for(var c in e.handlers)if(e.handlers[c]==o){e.handlers.splice(c,1);break}}};var a,o;n.normalise={browser:function(){"onwheel"in i||i.documentMode>=9||(n.SUPPORT=void 0!==i.onmousewheel?"mousewheel":"DOMMouseScroll"),t.addEventListener||(n.ADD_EVENT="attachEvent",n.REMOVE_EVENT="detachEvent",n.PREFIX="on");},event:function(e){var t={originalEvent:e,target:e.target||e.srcElement,type:"wheel",deltaMode:"MozMousePixelScroll"===e.type?0:1,deltaX:0,deltaZ:0,preventDefault:function(){e.preventDefault?e.preventDefault():e.returnValue=!1;},stopPropagation:function(){e.stopPropagation?e.stopPropagation():e.cancelBubble=!1;}};return e.wheelDelta&&(t.deltaY=-.025*e.wheelDelta),e.wheelDeltaX&&(t.deltaX=-.025*e.wheelDeltaX),e.detail&&(t.deltaY=e.detail),t},delta:function(e){var t,i=0,n=0,s=0,r=0,l=0;return e.deltaY&&(s=-1*e.deltaY,i=s),e.deltaX&&(n=e.deltaX,i=-1*n),e.wheelDelta&&(i=e.wheelDelta),e.wheelDeltaY&&(s=e.wheelDeltaY),e.wheelDeltaX&&(n=-1*e.wheelDeltaX),e.detail&&(i=-1*e.detail),0===i?[0,0,0]:(r=Math.abs(i),(!a||r<a)&&(a=r),l=Math.max(Math.abs(s),Math.abs(n)),(!o||l<o)&&(o=l),t=i>0?"floor":"ceil",i=Math[t](i/a),n=Math[t](n/o),s=Math[t](s/o),[i,n,s])}},"function"==typeof t.define&&t.define.amd?t.define("hamster",[],function(){return n}):e.exports=n;}(window,window.document);},function(e,t,i){var n,a,o;/*!
	 * mustache.js - Logic-less {{mustache}} templates with JavaScript
	 * http://github.com/janl/mustache.js
	 */
	!function(i,s){"object"==typeof t&&t&&"string"!=typeof t.nodeName?s(t):(a=[t],n=s,void 0!==(o="function"==typeof n?n.apply(t,a):n)&&(e.exports=o));}(0,function(e){function t(e){return "function"==typeof e}function i(e){return f(e)?"array":typeof e}function n(e){return e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function a(e,t){return null!=e&&"object"==typeof e&&t in e}function o(e,t){return null!=e&&"object"!=typeof e&&e.hasOwnProperty&&e.hasOwnProperty(t)}function s(e,t){return w.call(e,t)}function r(e){return !s(y,e)}function l(e){return String(e).replace(/[&<>"'`=\/]/g,function(e){return b[e]})}function d(t,i){function a(e){if("string"==typeof e&&(e=e.split(g,2)),!f(e)||2!==e.length)throw new Error("Invalid tags: "+e);o=new RegExp(n(e[0])+"\\s*"),s=new RegExp("\\s*"+n(e[1])),l=new RegExp("\\s*"+n("}"+e[1]));}if(!t)return [];var o,s,l,d=[],m=[],v=[],p=!1,w=!1;a(i||e.tags);for(var y,b,T,M,S,O,E=new h(t);!E.eos();){if(y=E.pos,T=E.scanUntil(o))for(var $=0,C=T.length;$<C;++$)M=T.charAt($),r(M)?v.push(m.length):w=!0,m.push(["text",M,y,y+1]),y+=1,"\n"===M&&function(){if(p&&!w)for(;v.length;)delete m[v.pop()];else v=[];p=!1,w=!1;}();if(!E.scan(o))break;if(p=!0,b=E.scan(P)||"name",E.scan(k),"="===b?(T=E.scanUntil(D),E.scan(D),E.scanUntil(s)):"{"===b?(T=E.scanUntil(l),E.scan(x),E.scanUntil(s),b="&"):T=E.scanUntil(s),!E.scan(s))throw new Error("Unclosed tag at "+E.pos);if(S=[b,T,y,E.pos],m.push(S),"#"===b||"^"===b)d.push(S);else if("/"===b){if(!(O=d.pop()))throw new Error('Unopened section "'+T+'" at '+y);if(O[1]!==T)throw new Error('Unclosed section "'+O[1]+'" at '+y)}else "name"===b||"{"===b||"&"===b?w=!0:"="===b&&a(T);}if(O=d.pop())throw new Error('Unclosed section "'+O[1]+'" at '+E.pos);return u(c(m))}function c(e){for(var t,i,n=[],a=0,o=e.length;a<o;++a)(t=e[a])&&("text"===t[0]&&i&&"text"===i[0]?(i[1]+=t[1],i[3]=t[3]):(n.push(t),i=t));return n}function u(e){for(var t,i,n=[],a=n,o=[],s=0,r=e.length;s<r;++s)switch(t=e[s],t[0]){case"#":case"^":a.push(t),o.push(t),a=t[4]=[];break;case"/":i=o.pop(),i[5]=t[2],a=o.length>0?o[o.length-1][4]:n;break;default:a.push(t);}return n}function h(e){this.string=e,this.tail=e,this.pos=0;}function m(e,t){this.view=e,this.cache={".":this.view},this.parent=t;}function v(){this.cache={};}var p=Object.prototype.toString,f=Array.isArray||function(e){return "[object Array]"===p.call(e)},w=RegExp.prototype.test,y=/\S/,b={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"},k=/\s*/,g=/\s+/,D=/\s*=/,x=/\s*\}/,P=/#|\^|\/|>|\{|&|=|!/;h.prototype.eos=function(){return ""===this.tail},h.prototype.scan=function(e){var t=this.tail.match(e);if(!t||0!==t.index)return "";var i=t[0];return this.tail=this.tail.substring(i.length),this.pos+=i.length,i},h.prototype.scanUntil=function(e){var t,i=this.tail.search(e);switch(i){case-1:t=this.tail,this.tail="";break;case 0:t="";break;default:t=this.tail.substring(0,i),this.tail=this.tail.substring(i);}return this.pos+=t.length,t},m.prototype.push=function(e){return new m(e,this)},m.prototype.lookup=function(e){var i,n=this.cache;if(n.hasOwnProperty(e))i=n[e];else {for(var s,r,l,d=this,c=!1;d;){if(e.indexOf(".")>0)for(s=d.view,r=e.split("."),l=0;null!=s&&l<r.length;)l===r.length-1&&(c=a(s,r[l])||o(s,r[l])),s=s[r[l++]];else s=d.view[e],c=a(d.view,e);if(c){i=s;break}d=d.parent;}n[e]=i;}return t(i)&&(i=i.call(this.view)),i},v.prototype.clearCache=function(){this.cache={};},v.prototype.parse=function(t,i){var n=this.cache,a=t+":"+(i||e.tags).join(":"),o=n[a];return null==o&&(o=n[a]=d(t,i)),o},v.prototype.render=function(e,t,i,n){var a=this.parse(e,n),o=t instanceof m?t:new m(t);return this.renderTokens(a,o,i,e,n)},v.prototype.renderTokens=function(e,t,i,n,a){for(var o,s,r,l="",d=0,c=e.length;d<c;++d)r=void 0,o=e[d],s=o[0],"#"===s?r=this.renderSection(o,t,i,n):"^"===s?r=this.renderInverted(o,t,i,n):">"===s?r=this.renderPartial(o,t,i,a):"&"===s?r=this.unescapedValue(o,t):"name"===s?r=this.escapedValue(o,t):"text"===s&&(r=this.rawValue(o)),void 0!==r&&(l+=r);return l},v.prototype.renderSection=function(e,i,n,a){function o(e){return s.render(e,i,n)}var s=this,r="",l=i.lookup(e[1]);if(l){if(f(l))for(var d=0,c=l.length;d<c;++d)r+=this.renderTokens(e[4],i.push(l[d]),n,a);else if("object"==typeof l||"string"==typeof l||"number"==typeof l)r+=this.renderTokens(e[4],i.push(l),n,a);else if(t(l)){if("string"!=typeof a)throw new Error("Cannot use higher-order sections without the original template");l=l.call(i.view,a.slice(e[3],e[5]),o),null!=l&&(r+=l);}else r+=this.renderTokens(e[4],i,n,a);return r}},v.prototype.renderInverted=function(e,t,i,n){var a=t.lookup(e[1]);if(!a||f(a)&&0===a.length)return this.renderTokens(e[4],t,i,n)},v.prototype.renderPartial=function(e,i,n,a){if(n){var o=t(n)?n(e[1]):n[e[1]];return null!=o?this.renderTokens(this.parse(o,a),i,n,o):void 0}},v.prototype.unescapedValue=function(e,t){var i=t.lookup(e[1]);if(null!=i)return i},v.prototype.escapedValue=function(t,i){var n=i.lookup(t[1]);if(null!=n)return e.escape(n)},v.prototype.rawValue=function(e){return e[1]},e.name="mustache.js",e.version="3.0.1",e.tags=["{{","}}"];var T=new v;return e.clearCache=function(){return T.clearCache()},e.parse=function(e,t){return T.parse(e,t)},e.render=function(e,t,n,a){if("string"!=typeof e)throw new TypeError('Invalid template! Template should be a "string" but "'+i(e)+'" was given as the first argument for mustache#render(template, view, partials)');return T.render(e,t,n,a)},e.to_html=function(i,n,a,o){var s=e.render(i,n,a);if(!t(o))return s;o(s);},e.escape=l,e.Scanner=h,e.Context=m,e.Writer=v,e});}])});
	});

	unwrapExports(persianDatepicker_min);
	var persianDatepicker_min_1 = persianDatepicker_min.persianDatepicker;

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


	    /*======== 2. SCROLLBAR CONTENT ========*/


	  $('.date ,.date-time').each(function (k, v) {
	    var timePicker, format;
	    if ($(this).hasClass('date-time')) {
	      timePicker = true;
	      format = ($(this).data('format') === undefined) ? "YYYY-MM-DD HH:mm:ss" : $(this).data('format');
	    } else {
	      timePicker = false;
	      format = ($(this).data('format') === undefined) ? "YYYY-MM-DD" : $(this).data('format');
	    }
	    var calendarType = ($('html').attr('lang') == 'fa' ? "persian" : "gregorian");
	    if ($(this).data('type') !== undefined) {
	      calendarType = $(this).data('type');
	    }
	    if (calendarType == 'gregorian') {
	      $(this).css('direction', 'ltr');
	    }

	    $(this).pDatepicker({
	      "inline": false,
	      "format": format,
	      "viewMode": "day",
	      "initialValue": false,
	      "minDate": null,
	      "maxDate": null,
	      "autoClose": true,
	      "position": "auto",
	      "altFormat": "X",
	      "altField": $(this).data('alt'),
	      "onlyTimePicker": false,
	      "onlySelectOnDate": true,
	      "calendarType": calendarType,
	      "inputDelay": 800,
	      "observer": false,
	      "calendar": {
	        "persian": {
	          "locale": "fa",
	          "showHint": false,
	          "leapYearMode": "algorithmic"
	        },
	        "gregorian": {
	          "locale": "en",
	          "showHint": false
	        }
	      },
	      "navigator": {
	        "enabled": true,
	        "scroll": {
	          "enabled": true
	        },
	        "text": {
	          "btnNextText": "<",
	          "btnPrevText": ">"
	        }
	      },
	      "toolbox": {
	        "enabled": true,
	        "calendarSwitch": {
	          "enabled": false,
	          "format": "MMMM"
	        },
	        "todayButton": {
	          "enabled": true,
	          "text": {
	            "fa": "امروز",
	            "en": "Today"
	          }
	        },
	        "submitButton": {
	          "enabled": true,
	          "text": {
	            "fa": "تایید",
	            "en": "Submit"
	          }
	        },
	        "text": {
	          "btnToday": "امروز"
	        }
	      },
	      "timePicker": {
	        "enabled": timePicker,
	        "step": 1,
	        "hour": {
	          "enabled": timePicker,
	          "step": null
	        },
	        "minute": {
	          "enabled": timePicker,
	          "step": null
	        },
	        "second": {
	          "enabled": timePicker,
	          "step": null
	        },
	        "meridian": {
	          "enabled": false
	        }
	      },
	      "dayPicker": {
	        "enabled": true,
	        "titleFormat": "YYYY MMMM"
	      },
	      "monthPicker": {
	        "enabled": true,
	        "titleFormat": "YYYY"
	      },
	      "yearPicker": {
	        "enabled": true,
	        "titleFormat": "YYYY"
	      },
	      "responsive": true,
	    });
	  });


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


	  // if(toaster.length != 0){
	  //   if (document.dir != "rtl") {
	  //     callToaster("toast-top-right");
	  //   } else {
	  //     callToaster("toast-top-left");
	  //   }
	  // }

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


	  $(document).on('change', '.check-all', function () {
	    $(this).closest('table').find('tbody :checkbox').prop('checked', $(this).is(':checked'));
	  });

	  $(document).on('change', 'tbody :checkbox', function () {
	    $(this).closest('table').find('.check-all')
	      .prop('checked', ($(this).closest('table').find('tbody :checkbox:checked').length == $(this).closest('table').find('tbody :checkbox').length));
	  });

	  $(document).on('change', '.check-all', function () {
	    $(this).closest('table').find('tbody :checkbox')
	      .prop('checked', $(this).is(':checked'))
	      .closest('tr').toggleClass('table-active', $(this).is(':checked'));
	  });

	  $(document).on('change', 'tbody :checkbox', function () {
	    $(this).closest('tr').toggleClass('table-active', this.checked);

	    $(this).closest('table').find('.check-all').prop('checked', ($(this).closest('table').find('tbody :checkbox:checked').length == $(this).closest('table').find('tbody :checkbox').length));
	  });

	  $(document).on('change', '.delete-item , .check-all', function () {
	    var btn = $(this).closest('.card').find('.delete-btn');
	    var deleteForm = $('#delete-form');
	    btn.html('<i class="fa fa-trash"></i>');
	    deleteForm.html('');

	    var csrfToken = $('meta[name=csrf-token]').attr('content');
	    deleteForm.append('<input type="hidden" name="_token" value="'+csrfToken+'">');
	    deleteForm.append('<input type="hidden" name="_method" value="delete">');
	    $(this).closest('table').find('.delete-item:checked').each(function () {
	      deleteForm.append('<input type="hidden" name="deleteId[]" value="' + $(this).val() + '">');
	    });

	    if ($(this).closest('table').find('.delete-item:checked').length > 0) {
	      btn.removeClass('d-none');
	    } else {
	      btn.addClass('d-none');
	    }
	  });


	  $('.delete-btn').on('click',function(e){
	    if(confirm('از حذف اطلاعات اطمینان دارید؟')){
	      $('#delete-form').submit();
	    }
	  });

	  // $(document).on('change', '.delete-item , .check-all', function () {
	  //   var btn = $('.delete-btn');
	  //   btn.html('حذف');
	  //   $(this).closest('table').find('.delete-item:checked').each(function () {
	  //     btn.append('<input type="hidden" name="deleteId[]" value="' + $(this).val() + '">');
	  //   });
	  // });


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
	  //
	  // if(toaster.length != 0){
	  //   if (document.dir != "rtl") {
	  //     callToaster("toast-top-right");
	  //   } else {
	  //     callToaster("toast-top-left");
	  //   }
	  //
	  // }



	  FilePond.registerPlugin(FilePondPluginImagePreview);
	  FilePond.registerPlugin(FilePondPluginFilePoster);
	  $(".files").each(function(){
	    $(this).filepond({
	      allowReplace:true,
	      files:$(this).data('files'),
	      server: {
	        headers: {
	          'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
	          'Accept': 'application/json',
	        },
	        process: {
	          onerror: (response) => {
	            var serverResponse = JSON.parse(response);
	            toastr.error(serverResponse.errors.file);
	          },
	          onload: (formData) => {
	           var  serverResponse = JSON.parse(formData);
	            $("input[name='remove_"+$(this).data('name')+"']").remove();
	            $('#submit-form').append('<input type="hidden" id="upload-'+serverResponse.uuid+'" name="'+$(this).data('name')+'" value="'+ serverResponse.uuid +'">');
	            return  serverResponse.uuid;
	          },
	        },
	        revert: {
	          onerror: (response) => {
	            var serverResponse = JSON.parse(response);
	            toastr.error(serverResponse.errors.file);
	          },
	          onload: (formData) => {
	           var  serverResponse = JSON.parse(formData);
	            $('#upload-'+serverResponse.uuid).remove();
	          },
	        },
	        remove: (source, load, error) => {
	          $('#submit-form').append('<input type="hidden"  id="remove_'+source+'" name="remove_'+$(this).data('name')+'" value="'+ source +'">');
	          $("#upload-"+source).remove();
	          error('oh my goodness');
	          load();
	        },
	      },
	      credits:false
	    });


	  });

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

	window.persianDate=persianDate$2;

})));
//# sourceMappingURL=sleek.bundle.js.map
