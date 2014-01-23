////////////////////////////////////////////////////////////////////////////////
// below from shindig dynamic-size-util.js
////////////////////////////////////////////////////////////////////////////////
  /**
   * @private
   */
  function getElementComputedStyle(elem, attr) {
    if (window.getComputedStyle) {
      var style = window.getComputedStyle(elem, null);
    } else {
      var style = elem.currentStyle;
    }
    return attr && style ? style[attr] : style;
  }
  /**
   * Parse out the value (specified in px) for a CSS attribute of an element.
   *
   * @param {Element} elem the element with the attribute to look for.
   * @param {string} attr the CSS attribute name of interest.
   * @return {number} the value of the px attr of the elem, undefined if the attr was undefined.
   * @private
   */
  function parseIntFromElemPxAttribute(elem, attr) {
    var value = getElementComputedStyle(elem, attr);
    if (value) {
      value.match(/^([0-9]+)/);
      return parseInt(RegExp.$1, 10);
    }
  }
  /**
   * Get the height (truthy) or width (falsey)
   */
  var getDimen = function (height) {
    var result = 0;
    var queue = [document.body];

    while (queue.length > 0) {
      var elem = queue.shift();
      var children = elem.childNodes;

      /*
       * Here, we are checking if we are a container that clips its overflow with
       * a specific height, because if so, we should ignore children
       */

      // check that elem is actually an element, could be a text node otherwise
      if (typeof elem.style !== 'undefined' && elem !== document.body) {
        // Get the overflowY value, looking in the computed style if necessary
        var overflow = elem.style[height ? 'overflowY' : 'overflowX'];
        if (!overflow) {
          overflow = getElementComputedStyle(elem, height ? 'overflowY' : 'overflowX');
        }

        // The only non-clipping values of overflow is 'visible'. We assume that 'inherit'
        // is also non-clipping at the moment, but should we check this?
        if (overflow != 'visible' && overflow != 'inherit') {
          // Make sure this element explicitly specifies a height
          var size = elem.style[height ? 'height' : 'width'];
          if (!size) {
            size = getElementComputedStyle(elem, height ? 'height' : 'width');
          }
          if (size && size.length > 0 && size != 'auto') {
            // We can safely ignore the children of this element,
            // so move onto the next in the queue
            continue;
          }
        }
      }

      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (typeof child.style != 'undefined') {  // Don't measure text nodes
          var start = child.offsetTop,
              dimenEnd = 'marginBottom',
              size = child.offsetHeight,
              dir = getElementComputedStyle(child, 'direction');

          if (!height) {
            start = child.offsetLeft;
            dimenEnd = 'marginRight';
            size = child.offsetWidth;

            // compute offsetRight
            if (dir == 'rtl' && typeof start != 'undefined' && typeof size != 'undefined' && child.offsetParent) {
              start = child.offsetParent.offsetWidth - start - size;
            }
          }

          if (typeof start != 'undefined' && typeof size != 'undefined') {
            // offsetHeight already accounts for borderBottom, paddingBottom.
            var end = start + size + (parseIntFromElemPxAttribute(child, dimenEnd) || 0);
            result = Math.max(result, end);
          }
        }
        queue.push(child);
      }
    }

    // Add border, padding and margin of the containing body.
    return result +
        (parseIntFromElemPxAttribute(document.body, height ? 'borderBottom' : 'borderRight') || 0) +
        (parseIntFromElemPxAttribute(document.body, height ? 'marginBottom' : 'marginRight') || 0) +
        (parseIntFromElemPxAttribute(document.body, height ? 'paddingBottom' : 'paddingRight') || 0);
  };
////////////////////////////////////////////////////////////////////////////////
