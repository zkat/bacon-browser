(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("Bacon"), require("jQuery"));
	else if(typeof define === 'function' && define.amd)
		define(["Bacon", "jQuery"], factory);
	else if(typeof exports === 'object')
		exports["bacon-browser"] = factory(require("Bacon"), require("jQuery"));
	else
		root["bacon-browser"] = factory(root["Bacon"], root["jQuery"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_6__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/ 		
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/ 		
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 		
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
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
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/ 	
/******/ 	
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __moduleName = "src/index";
	var Window = __webpack_require__(2);
	var Mouse = __webpack_require__(3);
	var Keyboard = __webpack_require__(4);
	var Touch = __webpack_require__(5);
	var bacon = __webpack_require__(1);
	bacon.Browser = {
	  Window: Window,
	  Mouse: Mouse,
	  Keyboard: Keyboard,
	  Touch: Touch
	};
	


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = Bacon;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __moduleName = "src/window";
	var $ = __webpack_require__(6);
	var bacon = __webpack_require__(1);
	var $window = $(window);
	if (window.history && window.history.pushState) {
	  var oldMethods = {};
	  ["pushState", "replaceState"].forEach(function(method) {
	    oldMethods[method] = window.history[method];
	    window.history[method] = function(state) {
	      var ret = oldMethods[method].apply(this, arguments);
	      $window.trigger("___bacon-browser-state___", [state]);
	      return ret;
	    };
	  });
	}
	var Window = {
	  resize: (function() {
	    return $window.asEventStream("resize");
	  }),
	  hashchange: (function() {
	    return $window.asEventStream("hashchanged");
	  }),
	  popstate: (function() {
	    return $window.asEventStream("popstate");
	  }),
	  statechange: (function() {
	    return $window.asEventStream("___bacon-browser-state___", (function(_, s) {
	      return s;
	    })).merge(Window.popstate().map(".originalEvent.state"));
	  }),
	  hash: (function() {
	    return Window.hashchange().map((function() {
	      return window.location.hash;
	    })).toProperty(window.location.hash);
	  }),
	  location: (function() {
	    return Window.hashchange().merge(Window.popstate()).map((function() {
	      return window.location;
	    })).toProperty(window.location);
	  }),
	  state: (function() {
	    return Window.statechange().toProperty();
	  }),
	  height: (function() {
	    return Window.dimensions().map(".height");
	  }),
	  width: (function() {
	    return Window.dimensions().map(".width");
	  }),
	  dimensions: (function() {
	    return Window.resize().map((function() {
	      return ({
	        width: $window.outerWidth(),
	        height: $window.outerHeight()
	      });
	    })).toProperty({
	      width: $window.outerWidth(),
	      height: $window.outerHeight()
	    });
	  }),
	  animationFrames: function() {
	    return bacon.fromBinder(function(sink) {
	      var done = false,
	          requestID;
	      function request() {
	        requestID = window.requestAnimationFrame(function(x) {
	          sink(x);
	          if (!done) {
	            request();
	          }
	        });
	      }
	      request();
	      return function stop() {
	        done = true;
	        if (requestID) {
	          window.cancelAnimationFrame(requestID);
	        }
	      };
	    });
	  }
	};
	var $__default = Window;
	module.exports = {
	  get default() {
	    return $__default;
	  },
	  __esModule: true
	};
	


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __moduleName = "src/mouse";
	var $ = __webpack_require__(6);
	__webpack_require__(1);
	function domStream(name) {
	  return function(target) {
	    return $(target || document).asEventStream(name);
	  };
	}
	var Mouse = {
	  mousemove: domStream("mousemove"),
	  mouseup: domStream("mouseup"),
	  mousedown: domStream("mousedown"),
	  click: domStream("click"),
	  clicks: function(target) {
	    return Mouse.click(target).map(function(ev) {
	      return {
	        x: target ? ev.offsetX : ev.pageX,
	        y: target ? ev.offsetY : ev.pageY
	      };
	    });
	  },
	  deltas: function(target) {
	    return Mouse.position(target).diff(null, function(a, b) {
	      return a ? {
	        x: b.x - a.x,
	        y: b.y - a.y
	      } : {
	        x: 0,
	        y: 0
	      };
	    }).toEventStream();
	  },
	  position: function(target) {
	    return Mouse.mousemove(target).map(function(ev) {
	      return {
	        x: target ? ev.offsetX : ev.pageX,
	        y: target ? ev.offsetY : ev.pageY
	      };
	    }).toProperty();
	  },
	  isUp: function(upTarget, downTarget) {
	    return Mouse.mouseup(upTarget).map(true).merge(Mouse.mousedown(downTarget).map(false)).toProperty();
	  },
	  isDown: function(downTarget, upTarget) {
	    return Mouse.isUp(upTarget, downTarget).not();
	  }
	};
	var $__default = Mouse;
	module.exports = {
	  get default() {
	    return $__default;
	  },
	  __esModule: true
	};
	


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __moduleName = "src/keyboard";
	var $ = __webpack_require__(6);
	__webpack_require__(1);
	var Keyboard = {};
	var $__default = Keyboard;
	module.exports = {
	  get default() {
	    return $__default;
	  },
	  __esModule: true
	};
	


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __moduleName = "src/touch";
	var $ = __webpack_require__(6);
	var Touch = {};
	var $__default = Touch;
	module.exports = {
	  get default() {
	    return $__default;
	  },
	  __esModule: true
	};
	


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = jQuery;

/***/ }
/******/ ])
})

//# sourceMappingURL=bacon-browser.js.map