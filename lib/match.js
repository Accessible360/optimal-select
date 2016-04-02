'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = match;
/**
 * # Match
 *
 * Retrieves selector
 */

var defaultIgnore = {
  attribute: function attribute(attributeName) {
    return ['style', 'data-reactid', 'data-react-checksum'].indexOf(attributeName) > -1;
  }
};

/**
 * Get the path of the element
 * @param  {HTMLElement} node    - [description]
 * @param  {Object}      options - [description]
 * @return {String}              - [description]
 */
function match(node, options) {
  var path = [];
  var element = node;
  var length = path.length;

  var _options$ignore = options.ignore;
  var ignore = _options$ignore === undefined ? {} : _options$ignore;


  var ignoreClass = false;
  Object.keys(ignore).forEach(function (type) {
    if (type === 'class') {
      ignoreClass = true;
    }
    var predicate = ignore[type];
    if (typeof predicate === 'function') return;
    if (typeof predicate === 'number') {
      predicate = predicate.toString();
    }
    if (typeof predicate === 'string') {
      predicate = new RegExp(predicate);
    }
    // check class-/attributename for regex
    ignore[type] = predicate.test.bind(predicate);
  });
  if (ignoreClass) {
    (function () {
      var ignoreAttribute = ignore.attribute;
      ignore.attribute = function (name, value, defaultPredicate) {
        return ignore.class(value) || ignoreAttribute && ignoreAttribute(name, value, defaultPredicate);
      };
    })();
  }

  while (element !== document) {
    // global
    if (checkId(element, path, ignore)) break;
    if (checkClassGlobal(element, path, ignore)) break;
    if (checkAttributeGlobal(element, path, ignore)) break;
    if (checkTagGlobal(element, path, ignore)) break;

    // local
    checkClassLocal(element, path, ignore);

    // define only one selector each iteration
    if (path.length === length) {
      checkAttributeLocal(element, path, ignore);
    }
    if (path.length === length) {
      checkTagLocal(element, path, ignore);
    }

    if (path.length === length) {
      checkClassChild(element, path, ignore);
    }
    if (path.length === length) {
      checkAttributeChild(element, path, ignore);
    }
    if (path.length === length) {
      checkTagChild(element, path, ignore);
    }

    element = element.parentNode;
    length = path.length;
  }

  if (element === document) {
    path.unshift('*');
  }

  return path.join(' ');
}

/**
 * [checkClassGlobal description]
 * @param  {HTMLElement} element - [description]
 * @param  {Array}       path    - [description]
 * @param  {Object}      ignore  - [description]
 * @return {Boolean}             - [description]
 */
function checkClassGlobal(element, path, ignore) {
  return checkClass(element, path, ignore, document);
}

/**
 * [checkClassLocal description]
 * @param  {HTMLElement} element - [description]
 * @param  {Array}       path    - [description]
 * @param  {Object}      ignore  - [description]
 * @return {Boolean}             - [description]
 */
function checkClassLocal(element, path, ignore) {
  return checkClass(element, path, ignore, element.parentNode);
}

/**
 * [checkClassChild description]
 * @param  {HTMLElement} element - [description]
 * @param  {Array}       path    - [description]
 * @param  {Object}      ignore  - [description]
 * @return {Boolean}             - [description]
 */
function checkClassChild(element, path, ignore) {
  var className = element.getAttribute('class');
  if (checkIgnore(ignore.class, className)) {
    return false;
  }
  return checkChild(element, path, '.' + className.trim().replace(/\s+/g, '.'));
}

/**
 * [checkAttributeGlobal description]
 * @param  {HTMLElement} element - [description]
 * @param  {Array}       path    - [description]
 * @param  {Object}      ignore  - [description]
 * @return {Boolean}             - [description]
 */
function checkAttributeGlobal(element, path, ignore) {
  return checkAttribute(element, path, ignore, document);
}

/**
 * [checkAttributeLocal description]
 * @param  {HTMLElement} element - [description]
 * @param  {Array}       path    - [description]
 * @param  {Object}      ignore  - [description]
 * @return {Boolean}             - [description]
 */
function checkAttributeLocal(element, path, ignore) {
  return checkAttribute(element, path, ignore, element.parentNode);
}

/**
 * [checkAttributeChild description]
 * @param  {HTMLElement} element - [description]
 * @param  {Array}       path    - [description]
 * @param  {Object}      ignore  - [description]
 * @return {Boolean}             - [description]
 */
function checkAttributeChild(element, path, ignore) {
  var attributes = element.attributes;
  return Object.keys(attributes).some(function (key) {
    var attribute = attributes[key];
    var attributeName = attribute.name;
    var attributeValue = attribute.value;
    if (checkIgnore(ignore.attribute, attributeName, attributeValue, defaultIgnore.attribute)) {
      return false;
    }
    var pattern = '[' + attributeName + '="' + attributeValue + '"]';
    return checkChild(element, path, pattern);
  });
}

/**
 * [checkTagGlobal description]
 * @param  {HTMLElement} element - [description]
 * @param  {Array}       path    - [description]
 * @param  {Object}      ignore  - [description]
 * @return {Boolean}             - [description]
 */
function checkTagGlobal(element, path, ignore) {
  return checkTag(element, path, ignore, document);
}

/**
 * [checkTagLocal description]
 * @param  {HTMLElement} element - [description]
 * @param  {Array}       path    - [description]
 * @param  {Object}      ignore  - [description]
 * @return {Boolean}             - [description]
 */
function checkTagLocal(element, path, ignore) {
  return checkTag(element, path, ignore, element.parentNode);
}

/**
 * [checkTabChildren description]
 * @param  {HTMLElement} element - [description]
 * @param  {Array}       path    - [description]
 * @param  {Object}      ignore  - [description]
 * @return {Boolean}             - [description]
 */
function checkTagChild(element, path, ignore) {
  var tagName = element.tagName.toLowerCase();
  if (checkIgnore(ignore.tag, tagName)) {
    return false;
  }
  return checkChild(element, path, tagName);
}

/**
 * [checkId description]
 * @param  {HTMLElement} element - [description]
 * @param  {Array}       path    - [description]
 * @param  {Object}      ignore  - [description]
 * @return {Boolean}             - [description]
 */
function checkId(element, path, ignore) {
  var id = element.id;
  if (checkIgnore(ignore.id, id)) {
    return false;
  }
  path.unshift('#' + id);
  return true;
}

/**
 * [checkClass description]
 * @param  {HTMLElement} element - [description]
 * @param  {Array}       path    - [description]
 * @param  {Object}      ignore  - [description]
 * @param  {HTMLElement} parent  - [description]
 * @return {Boolean}             - [description]
 */
function checkClass(element, path, ignore, parent) {
  var className = element.getAttribute('class');
  if (checkIgnore(ignore.class, className)) {
    return false;
  }
  var matches = parent.getElementsByClassName(className);
  if (matches.length === 1) {
    path.unshift('.' + className.trim().replace(/\s+/g, '.'));
    return true;
  }
  return false;
}

/**
 * [checkAttribute description]
 * @param  {HTMLElement} element - [description]
 * @param  {Array}       path    - [description]
 * @param  {Object}      ignore  - [description]
 * @param  {HTMLElement} parent  - [description]
 * @return {Boolean}             - [description]
 */
function checkAttribute(element, path, ignore, parent) {
  var attributes = element.attributes;
  return Object.keys(attributes).some(function (key) {
    var attribute = attributes[key];
    var attributeName = attribute.name;
    var attributeValue = attribute.value;
    if (checkIgnore(ignore.attribute, attributeName, attributeValue, defaultIgnore.attribute)) {
      return false;
    }
    var pattern = '[' + attributeName + '="' + attributeValue + '"]';
    var matches = parent.querySelectorAll(pattern);
    if (matches.length === 1) {
      path.unshift(pattern);
      return true;
    }
  });
}

/**
 * [checkTag description]
 * @param  {HTMLElement} element - [description]
 * @param  {Array}       path    - [description]
 * @param  {HTMLElement} parent  - [description]
 * @param  {Object}      ignore  - [description]
 * @return {Boolean}             - [description]
 */
function checkTag(element, path, ignore, parent) {
  var tagName = element.tagName.toLowerCase();
  if (checkIgnore(ignore.tag, tagName)) {
    return false;
  }
  var matches = parent.getElementsByTagName(tagName);
  if (matches.length === 1) {
    path.unshift(tagName);
    return true;
  }
  return false;
}

/**
 * [checkChild description]
 * @param  {HTMLElement} element  - [description]
 * @param  {Array}       path     - [description]
 * @param  {String}      selector - [description]
 * @return {Boolean}              - [description]
 */
function checkChild(element, path, selector) {
  var parent = element.parentNode;
  var children = parent.children;
  for (var i = 0, l = children.length; i < l; i++) {
    if (children[i] === element) {
      path.unshift('> ' + selector + ':nth-child(' + (i + 1) + ')');
      return true;
    }
  }
  return false;
}

/**
 * [checkIgnore description]
 * @param  {Function} predicate        [description]
 * @param  {string}   name             [description]
 * @param  {string}   value            [description]
 * @param  {Function} defaultPredicate [description]
 * @return {boolean}                   [description]
 */
function checkIgnore(predicate, name, value, defaultPredicate) {
  if (!name) {
    return true;
  }
  var check = predicate || defaultPredicate;
  if (!check) {
    return false;
  }
  return check(name, value, defaultPredicate);
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QztHQUF0QztBQUdBLE1BQU0sVUFBVSxPQUFPLG9CQUFQLENBQTRCLE9BQTVCLENBQVYsQ0FMMEM7QUFNaEQsTUFBSSxRQUFRLE1BQVIsS0FBbUIsQ0FBbkIsRUFBc0I7QUFDeEIsU0FBSyxPQUFMLENBQWEsT0FBYixFQUR3QjtBQUV4QixXQUFPLElBQVAsQ0FGd0I7R0FBMUI7QUFJQSxTQUFPLEtBQVAsQ0FWZ0Q7Q0FBbEQ7Ozs7Ozs7OztBQW9CQSxTQUFTLFVBQVQsQ0FBcUIsT0FBckIsRUFBOEIsSUFBOUIsRUFBb0MsUUFBcEMsRUFBOEM7QUFDNUMsTUFBTSxTQUFTLFFBQVEsVUFBUixDQUQ2QjtBQUU1QyxNQUFNLFdBQVcsT0FBTyxRQUFQLENBRjJCO0FBRzVDLE9BQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLFNBQVMsTUFBVCxFQUFpQixJQUFJLENBQUosRUFBTyxHQUE1QyxFQUFpRDtBQUMvQyxRQUFJLFNBQVMsQ0FBVCxNQUFnQixPQUFoQixFQUF5QjtBQUMzQixXQUFLLE9BQUwsUUFBa0IsNEJBQXNCLElBQUUsQ0FBRixPQUF4QyxFQUQyQjtBQUUzQixhQUFPLElBQVAsQ0FGMkI7S0FBN0I7R0FERjtBQU1BLFNBQU8sS0FBUCxDQVQ0QztDQUE5Qzs7Ozs7Ozs7OztBQW9CQSxTQUFTLFdBQVQsQ0FBc0IsU0FBdEIsRUFBaUMsSUFBakMsRUFBdUMsS0FBdkMsRUFBOEMsZ0JBQTlDLEVBQWdFO0FBQzlELE1BQUksQ0FBQyxJQUFELEVBQU87QUFDVCxXQUFPLElBQVAsQ0FEUztHQUFYO0FBR0EsTUFBTSxRQUFRLGFBQWEsZ0JBQWIsQ0FKZ0Q7QUFLOUQsTUFBSSxDQUFDLEtBQUQsRUFBUTtBQUNWLFdBQU8sS0FBUCxDQURVO0dBQVo7QUFHQSxTQUFPLE1BQU0sSUFBTixFQUFZLEtBQVosRUFBbUIsZ0JBQW5CLENBQVAsQ0FSOEQ7Q0FBaEUiLCJmaWxlIjoibWF0Y2guanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqICMgTWF0Y2hcbiAqXG4gKiBSZXRyaWV2ZXMgc2VsZWN0b3JcbiAqL1xuXG5jb25zdCBkZWZhdWx0SWdub3JlID0ge1xuICBhdHRyaWJ1dGUgKGF0dHJpYnV0ZU5hbWUpIHtcbiAgICByZXR1cm4gW1xuICAgICAgJ3N0eWxlJyxcbiAgICAgICdkYXRhLXJlYWN0aWQnLFxuICAgICAgJ2RhdGEtcmVhY3QtY2hlY2tzdW0nXG4gICAgXS5pbmRleE9mKGF0dHJpYnV0ZU5hbWUpID4gLTFcbiAgfVxufVxuXG4vKipcbiAqIEdldCB0aGUgcGF0aCBvZiB0aGUgZWxlbWVudFxuICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IG5vZGUgICAgLSBbZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgICAgb3B0aW9ucyAtIFtkZXNjcmlwdGlvbl1cbiAqIEByZXR1cm4ge1N0cmluZ30gICAgICAgICAgICAgIC0gW2Rlc2NyaXB0aW9uXVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYXRjaCAobm9kZSwgb3B0aW9ucykge1xuICBjb25zdCBwYXRoID0gW11cbiAgdmFyIGVsZW1lbnQgPSBub2RlXG4gIHZhciBsZW5ndGggPSBwYXRoLmxlbmd0aFxuXG4gIGNvbnN0IHsgaWdub3JlID0ge30gfSA9IG9wdGlvbnNcblxuICB2YXIgaWdub3JlQ2xhc3MgPSBmYWxzZVxuICBPYmplY3Qua2V5cyhpZ25vcmUpLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICBpZiAodHlwZSA9PT0gJ2NsYXNzJykge1xuICAgICAgaWdub3JlQ2xhc3MgPSB0cnVlXG4gICAgfVxuICAgIHZhciBwcmVkaWNhdGUgPSBpZ25vcmVbdHlwZV1cbiAgICBpZiAodHlwZW9mIHByZWRpY2F0ZSA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuXG4gICAgaWYgKHR5cGVvZiBwcmVkaWNhdGUgPT09ICdudW1iZXInKSB7XG4gICAgICBwcmVkaWNhdGUgPSBwcmVkaWNhdGUudG9TdHJpbmcoKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHByZWRpY2F0ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHByZWRpY2F0ZSA9IG5ldyBSZWdFeHAocHJlZGljYXRlKVxuICAgIH1cbiAgICAvLyBjaGVjayBjbGFzcy0vYXR0cmlidXRlbmFtZSBmb3IgcmVnZXhcbiAgICBpZ25vcmVbdHlwZV0gPSBwcmVkaWNhdGUudGVzdC5iaW5kKHByZWRpY2F0ZSlcbiAgfSlcbiAgaWYgKGlnbm9yZUNsYXNzKSB7XG4gICAgY29uc3QgaWdub3JlQXR0cmlidXRlID0gaWdub3JlLmF0dHJpYnV0ZVxuICAgIGlnbm9yZS5hdHRyaWJ1dGUgPSAobmFtZSwgdmFsdWUsIGRlZmF1bHRQcmVkaWNhdGUpID0+IHtcbiAgICAgIHJldHVybiBpZ25vcmUuY2xhc3ModmFsdWUpIHx8IGlnbm9yZUF0dHJpYnV0ZSAmJiBpZ25vcmVBdHRyaWJ1dGUobmFtZSwgdmFsdWUsIGRlZmF1bHRQcmVkaWNhdGUpXG4gICAgfVxuICB9XG5cbiAgd2hpbGUgKGVsZW1lbnQgIT09IGRvY3VtZW50KSB7XG4gICAgLy8gZ2xvYmFsXG4gICAgaWYgKGNoZWNrSWQoZWxlbWVudCwgcGF0aCwgaWdub3JlKSkgYnJlYWtcbiAgICBpZiAoY2hlY2tDbGFzc0dsb2JhbChlbGVtZW50LCBwYXRoLCBpZ25vcmUpKSBicmVha1xuICAgIGlmIChjaGVja0F0dHJpYnV0ZUdsb2JhbChlbGVtZW50LCBwYXRoLCBpZ25vcmUpKSBicmVha1xuICAgIGlmIChjaGVja1RhZ0dsb2JhbChlbGVtZW50LCBwYXRoLCBpZ25vcmUpKSBicmVha1xuXG4gICAgLy8gbG9jYWxcbiAgICBjaGVja0NsYXNzTG9jYWwoZWxlbWVudCwgcGF0aCwgaWdub3JlKVxuXG4gICAgLy8gZGVmaW5lIG9ubHkgb25lIHNlbGVjdG9yIGVhY2ggaXRlcmF0aW9uXG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSBsZW5ndGgpIHtcbiAgICAgIGNoZWNrQXR0cmlidXRlTG9jYWwoZWxlbWVudCwgcGF0aCwgaWdub3JlKVxuICAgIH1cbiAgICBpZiAocGF0aC5sZW5ndGggPT09IGxlbmd0aCkge1xuICAgICAgY2hlY2tUYWdMb2NhbChlbGVtZW50LCBwYXRoLCBpZ25vcmUpXG4gICAgfVxuXG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSBsZW5ndGgpIHtcbiAgICAgIGNoZWNrQ2xhc3NDaGlsZChlbGVtZW50LCBwYXRoLCBpZ25vcmUpXG4gICAgfVxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gbGVuZ3RoKSB7XG4gICAgICBjaGVja0F0dHJpYnV0ZUNoaWxkKGVsZW1lbnQsIHBhdGgsIGlnbm9yZSlcbiAgICB9XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSBsZW5ndGgpIHtcbiAgICAgIGNoZWNrVGFnQ2hpbGQoZWxlbWVudCwgcGF0aCwgaWdub3JlKVxuICAgIH1cblxuICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGVcbiAgICBsZW5ndGggPSBwYXRoLmxlbmd0aFxuICB9XG5cbiAgaWYgKGVsZW1lbnQgPT09IGRvY3VtZW50KSB7XG4gICAgcGF0aC51bnNoaWZ0KCcqJylcbiAgfVxuXG4gIHJldHVybiBwYXRoLmpvaW4oJyAnKVxufVxuXG5cbi8qKlxuICogW2NoZWNrQ2xhc3NHbG9iYWwgZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZWxlbWVudCAtIFtkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge0FycmF5fSAgICAgICBwYXRoICAgIC0gW2Rlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7T2JqZWN0fSAgICAgIGlnbm9yZSAgLSBbZGVzY3JpcHRpb25dXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgICAgICAtIFtkZXNjcmlwdGlvbl1cbiAqL1xuZnVuY3Rpb24gY2hlY2tDbGFzc0dsb2JhbCAoZWxlbWVudCwgcGF0aCwgaWdub3JlKSB7XG4gIHJldHVybiBjaGVja0NsYXNzKGVsZW1lbnQsIHBhdGgsIGlnbm9yZSwgZG9jdW1lbnQpXG59XG5cbi8qKlxuICogW2NoZWNrQ2xhc3NMb2NhbCBkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBlbGVtZW50IC0gW2Rlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7QXJyYXl9ICAgICAgIHBhdGggICAgLSBbZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgICAgaWdub3JlICAtIFtkZXNjcmlwdGlvbl1cbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgICAgIC0gW2Rlc2NyaXB0aW9uXVxuICovXG5mdW5jdGlvbiBjaGVja0NsYXNzTG9jYWwgKGVsZW1lbnQsIHBhdGgsIGlnbm9yZSkge1xuICByZXR1cm4gY2hlY2tDbGFzcyhlbGVtZW50LCBwYXRoLCBpZ25vcmUsIGVsZW1lbnQucGFyZW50Tm9kZSlcbn1cblxuLyoqXG4gKiBbY2hlY2tDbGFzc0NoaWxkIGRlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSBbZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtBcnJheX0gICAgICAgcGF0aCAgICAtIFtkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge09iamVjdH0gICAgICBpZ25vcmUgIC0gW2Rlc2NyaXB0aW9uXVxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICAgICAgLSBbZGVzY3JpcHRpb25dXG4gKi9cbmZ1bmN0aW9uIGNoZWNrQ2xhc3NDaGlsZCAoZWxlbWVudCwgcGF0aCwgaWdub3JlKSB7XG4gIGNvbnN0IGNsYXNzTmFtZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjbGFzcycpXG4gIGlmIChjaGVja0lnbm9yZShpZ25vcmUuY2xhc3MsIGNsYXNzTmFtZSkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICByZXR1cm4gY2hlY2tDaGlsZChlbGVtZW50LCBwYXRoLCBgLiR7Y2xhc3NOYW1lLnRyaW0oKS5yZXBsYWNlKC9cXHMrL2csICcuJyl9YClcbn1cblxuLyoqXG4gKiBbY2hlY2tBdHRyaWJ1dGVHbG9iYWwgZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZWxlbWVudCAtIFtkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge0FycmF5fSAgICAgICBwYXRoICAgIC0gW2Rlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7T2JqZWN0fSAgICAgIGlnbm9yZSAgLSBbZGVzY3JpcHRpb25dXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgICAgICAtIFtkZXNjcmlwdGlvbl1cbiAqL1xuZnVuY3Rpb24gY2hlY2tBdHRyaWJ1dGVHbG9iYWwgKGVsZW1lbnQsIHBhdGgsIGlnbm9yZSkge1xuICByZXR1cm4gY2hlY2tBdHRyaWJ1dGUoZWxlbWVudCwgcGF0aCwgaWdub3JlLCBkb2N1bWVudClcbn1cblxuLyoqXG4gKiBbY2hlY2tBdHRyaWJ1dGVMb2NhbCBkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBlbGVtZW50IC0gW2Rlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7QXJyYXl9ICAgICAgIHBhdGggICAgLSBbZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgICAgaWdub3JlICAtIFtkZXNjcmlwdGlvbl1cbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgICAgIC0gW2Rlc2NyaXB0aW9uXVxuICovXG5mdW5jdGlvbiBjaGVja0F0dHJpYnV0ZUxvY2FsIChlbGVtZW50LCBwYXRoLCBpZ25vcmUpIHtcbiAgcmV0dXJuIGNoZWNrQXR0cmlidXRlKGVsZW1lbnQsIHBhdGgsIGlnbm9yZSwgZWxlbWVudC5wYXJlbnROb2RlKVxufVxuXG4vKipcbiAqIFtjaGVja0F0dHJpYnV0ZUNoaWxkIGRlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSBbZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtBcnJheX0gICAgICAgcGF0aCAgICAtIFtkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge09iamVjdH0gICAgICBpZ25vcmUgIC0gW2Rlc2NyaXB0aW9uXVxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICAgICAgLSBbZGVzY3JpcHRpb25dXG4gKi9cbmZ1bmN0aW9uIGNoZWNrQXR0cmlidXRlQ2hpbGQgKGVsZW1lbnQsIHBhdGgsIGlnbm9yZSkge1xuICBjb25zdCBhdHRyaWJ1dGVzID0gZWxlbWVudC5hdHRyaWJ1dGVzXG4gIHJldHVybiBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5zb21lKChrZXkpID0+IHtcbiAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2tleV1cbiAgICBjb25zdCBhdHRyaWJ1dGVOYW1lID0gYXR0cmlidXRlLm5hbWVcbiAgICBjb25zdCBhdHRyaWJ1dGVWYWx1ZSA9IGF0dHJpYnV0ZS52YWx1ZVxuICAgIGlmIChjaGVja0lnbm9yZShpZ25vcmUuYXR0cmlidXRlLCBhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVWYWx1ZSwgZGVmYXVsdElnbm9yZS5hdHRyaWJ1dGUpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgY29uc3QgcGF0dGVybiA9IGBbJHthdHRyaWJ1dGVOYW1lfT1cIiR7YXR0cmlidXRlVmFsdWV9XCJdYFxuICAgIHJldHVybiBjaGVja0NoaWxkKGVsZW1lbnQsIHBhdGgsIHBhdHRlcm4pXG4gIH0pXG59XG5cbi8qKlxuICogW2NoZWNrVGFnR2xvYmFsIGRlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSBbZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtBcnJheX0gICAgICAgcGF0aCAgICAtIFtkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge09iamVjdH0gICAgICBpZ25vcmUgIC0gW2Rlc2NyaXB0aW9uXVxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICAgICAgLSBbZGVzY3JpcHRpb25dXG4gKi9cbmZ1bmN0aW9uIGNoZWNrVGFnR2xvYmFsIChlbGVtZW50LCBwYXRoLCBpZ25vcmUpIHtcbiAgcmV0dXJuIGNoZWNrVGFnKGVsZW1lbnQsIHBhdGgsIGlnbm9yZSwgZG9jdW1lbnQpXG59XG5cbi8qKlxuICogW2NoZWNrVGFnTG9jYWwgZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZWxlbWVudCAtIFtkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge0FycmF5fSAgICAgICBwYXRoICAgIC0gW2Rlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7T2JqZWN0fSAgICAgIGlnbm9yZSAgLSBbZGVzY3JpcHRpb25dXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgICAgICAtIFtkZXNjcmlwdGlvbl1cbiAqL1xuZnVuY3Rpb24gY2hlY2tUYWdMb2NhbCAoZWxlbWVudCwgcGF0aCwgaWdub3JlKSB7XG4gIHJldHVybiBjaGVja1RhZyhlbGVtZW50LCBwYXRoLCBpZ25vcmUsIGVsZW1lbnQucGFyZW50Tm9kZSlcbn1cblxuLyoqXG4gKiBbY2hlY2tUYWJDaGlsZHJlbiBkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBlbGVtZW50IC0gW2Rlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7QXJyYXl9ICAgICAgIHBhdGggICAgLSBbZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgICAgaWdub3JlICAtIFtkZXNjcmlwdGlvbl1cbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgICAgIC0gW2Rlc2NyaXB0aW9uXVxuICovXG5mdW5jdGlvbiBjaGVja1RhZ0NoaWxkIChlbGVtZW50LCBwYXRoLCBpZ25vcmUpIHtcbiAgY29uc3QgdGFnTmFtZSA9IGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpXG4gIGlmIChjaGVja0lnbm9yZShpZ25vcmUudGFnLCB0YWdOYW1lKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiBjaGVja0NoaWxkKGVsZW1lbnQsIHBhdGgsIHRhZ05hbWUpXG59XG5cbi8qKlxuICogW2NoZWNrSWQgZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZWxlbWVudCAtIFtkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge0FycmF5fSAgICAgICBwYXRoICAgIC0gW2Rlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7T2JqZWN0fSAgICAgIGlnbm9yZSAgLSBbZGVzY3JpcHRpb25dXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgICAgICAtIFtkZXNjcmlwdGlvbl1cbiAqL1xuZnVuY3Rpb24gY2hlY2tJZCAoZWxlbWVudCwgcGF0aCwgaWdub3JlKSB7XG4gIGNvbnN0IGlkID0gZWxlbWVudC5pZFxuICBpZiAoY2hlY2tJZ25vcmUoaWdub3JlLmlkLCBpZCkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBwYXRoLnVuc2hpZnQoYCMke2lkfWApXG4gIHJldHVybiB0cnVlXG59XG5cbi8qKlxuICogW2NoZWNrQ2xhc3MgZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZWxlbWVudCAtIFtkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge0FycmF5fSAgICAgICBwYXRoICAgIC0gW2Rlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7T2JqZWN0fSAgICAgIGlnbm9yZSAgLSBbZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gcGFyZW50ICAtIFtkZXNjcmlwdGlvbl1cbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgICAgIC0gW2Rlc2NyaXB0aW9uXVxuICovXG5mdW5jdGlvbiBjaGVja0NsYXNzIChlbGVtZW50LCBwYXRoLCBpZ25vcmUsIHBhcmVudCkge1xuICBjb25zdCBjbGFzc05hbWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnY2xhc3MnKVxuICBpZiAoY2hlY2tJZ25vcmUoaWdub3JlLmNsYXNzLCBjbGFzc05hbWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgY29uc3QgbWF0Y2hlcyA9IHBhcmVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNsYXNzTmFtZSlcbiAgaWYgKG1hdGNoZXMubGVuZ3RoID09PSAxKSB7XG4gICAgcGF0aC51bnNoaWZ0KGAuJHtjbGFzc05hbWUudHJpbSgpLnJlcGxhY2UoL1xccysvZywgJy4nKX1gKVxuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8qKlxuICogW2NoZWNrQXR0cmlidXRlIGRlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSBbZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtBcnJheX0gICAgICAgcGF0aCAgICAtIFtkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge09iamVjdH0gICAgICBpZ25vcmUgIC0gW2Rlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IHBhcmVudCAgLSBbZGVzY3JpcHRpb25dXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgICAgICAtIFtkZXNjcmlwdGlvbl1cbiAqL1xuZnVuY3Rpb24gY2hlY2tBdHRyaWJ1dGUgKGVsZW1lbnQsIHBhdGgsIGlnbm9yZSwgcGFyZW50KSB7XG4gIGNvbnN0IGF0dHJpYnV0ZXMgPSBlbGVtZW50LmF0dHJpYnV0ZXNcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLnNvbWUoKGtleSkgPT4ge1xuICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNba2V5XVxuICAgIGNvbnN0IGF0dHJpYnV0ZU5hbWUgPSBhdHRyaWJ1dGUubmFtZVxuICAgIGNvbnN0IGF0dHJpYnV0ZVZhbHVlID0gYXR0cmlidXRlLnZhbHVlXG4gICAgaWYgKGNoZWNrSWdub3JlKGlnbm9yZS5hdHRyaWJ1dGUsIGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZVZhbHVlLCBkZWZhdWx0SWdub3JlLmF0dHJpYnV0ZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBjb25zdCBwYXR0ZXJuID0gYFske2F0dHJpYnV0ZU5hbWV9PVwiJHthdHRyaWJ1dGVWYWx1ZX1cIl1gXG4gICAgY29uc3QgbWF0Y2hlcyA9IHBhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHBhdHRlcm4pXG4gICAgaWYgKG1hdGNoZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICBwYXRoLnVuc2hpZnQocGF0dGVybilcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9KVxufVxuXG4vKipcbiAqIFtjaGVja1RhZyBkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBlbGVtZW50IC0gW2Rlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7QXJyYXl9ICAgICAgIHBhdGggICAgLSBbZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gcGFyZW50ICAtIFtkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge09iamVjdH0gICAgICBpZ25vcmUgIC0gW2Rlc2NyaXB0aW9uXVxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICAgICAgLSBbZGVzY3JpcHRpb25dXG4gKi9cbmZ1bmN0aW9uIGNoZWNrVGFnIChlbGVtZW50LCBwYXRoLCBpZ25vcmUsIHBhcmVudCkge1xuICBjb25zdCB0YWdOYW1lID0gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKClcbiAgaWYgKGNoZWNrSWdub3JlKGlnbm9yZS50YWcsIHRhZ05hbWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgY29uc3QgbWF0Y2hlcyA9IHBhcmVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSh0YWdOYW1lKVxuICBpZiAobWF0Y2hlcy5sZW5ndGggPT09IDEpIHtcbiAgICBwYXRoLnVuc2hpZnQodGFnTmFtZSlcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG4vKipcbiAqIFtjaGVja0NoaWxkIGRlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgIC0gW2Rlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7QXJyYXl9ICAgICAgIHBhdGggICAgIC0gW2Rlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7U3RyaW5nfSAgICAgIHNlbGVjdG9yIC0gW2Rlc2NyaXB0aW9uXVxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICAgICAgIC0gW2Rlc2NyaXB0aW9uXVxuICovXG5mdW5jdGlvbiBjaGVja0NoaWxkIChlbGVtZW50LCBwYXRoLCBzZWxlY3Rvcikge1xuICBjb25zdCBwYXJlbnQgPSBlbGVtZW50LnBhcmVudE5vZGVcbiAgY29uc3QgY2hpbGRyZW4gPSBwYXJlbnQuY2hpbGRyZW5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBjaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBpZiAoY2hpbGRyZW5baV0gPT09IGVsZW1lbnQpIHtcbiAgICAgIHBhdGgudW5zaGlmdChgPiAke3NlbGVjdG9yfTpudGgtY2hpbGQoJHtpKzF9KWApXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuLyoqXG4gKiBbY2hlY2tJZ25vcmUgZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gcHJlZGljYXRlICAgICAgICBbZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtzdHJpbmd9ICAgbmFtZSAgICAgICAgICAgICBbZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtzdHJpbmd9ICAgdmFsdWUgICAgICAgICAgICBbZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gZGVmYXVsdFByZWRpY2F0ZSBbZGVzY3JpcHRpb25dXG4gKiBAcmV0dXJuIHtib29sZWFufSAgICAgICAgICAgICAgICAgICBbZGVzY3JpcHRpb25dXG4gKi9cbmZ1bmN0aW9uIGNoZWNrSWdub3JlIChwcmVkaWNhdGUsIG5hbWUsIHZhbHVlLCBkZWZhdWx0UHJlZGljYXRlKSB7XG4gIGlmICghbmFtZSkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgY29uc3QgY2hlY2sgPSBwcmVkaWNhdGUgfHwgZGVmYXVsdFByZWRpY2F0ZVxuICBpZiAoIWNoZWNrKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgcmV0dXJuIGNoZWNrKG5hbWUsIHZhbHVlLCBkZWZhdWx0UHJlZGljYXRlKVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
