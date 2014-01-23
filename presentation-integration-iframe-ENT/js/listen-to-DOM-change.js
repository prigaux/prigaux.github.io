// solution used: MutationObserver (http://caniuse.com/mutationobserver)
// defaults to MutationEvents (deprecated and bad) or onpropertychange (IE specific)
//
// from https://gist.github.com/oleics/5627526 
//
var listenToDOMChange = (function() {
  function bindEvent(object, event, fn) {
    if(object.addEventListener) object.addEventListener(event, fn, false);
    else object.attachEvent('on'+event.toLowerCase(), fn);
  }

  function listenToDOMChange(document, cb) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    
    if(MutationObserver) { // DOM4 (Chrome, Firefox)
      //console.log('using MutationObserver');
      var observer = new MutationObserver(function(mutations) {
        onDOMChange();
      });
      observer.observe(document, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true
      });
    } else if(isDOMSubtreeModifiedSupported(document)) { // IE9, older Firefox
      //console.log('using DOMSubtreeModified');
      bindEvent(document, 'DOMSubtreeModified', onDOMChange);
    } else if(isDOMNodeInsertedSupported(document)) { // Opera
      //console.log('using DOMNodeInserted / DOMNodeRemoved');
      bindEvent(document, 'DOMNodeInserted', onDOMChange);
      bindEvent(document, 'DOMNodeRemoved', onDOMChange);
    } else if('onpropertychange' in document.body) { // IE
      //console.log('using propertychange');
      bindEvent(document, 'PropertyChange', onDOMChange);
    } else {
      console.log('can not detect changes of the DOM');
    }
    
    function onDOMChange() {
      cb(document);
    }
  }

  function isDOMSubtreeModifiedSupported(document) {
    var p = document.createElement('p'), flag = false;
    bindEvent(p, 'DOMSubtreeModified', function() { flag = true; });
    p.setAttribute('id', 'target');
    return flag;
  }

  function isDOMNodeInsertedSupported(document) {
    var p = document.createElement('p'), flag = false;
    bindEvent(p, 'DOMNodeInserted', function() { flag = true; });
    p.appendChild(document.createElement('p'));
    return flag;
  }
  
  return listenToDOMChange;
}).call(this);
