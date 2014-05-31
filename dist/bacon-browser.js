(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("Bacon"), require("jQuery"));
	else if(typeof define === 'function' && define.amd)
		define(["Bacon", "jQuery"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("Bacon"), require("jQuery")) : factory(root["Bacon"], root["jQuery"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_7__) {
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
	var Gamepad = __webpack_require__(6);
	var bacon = __webpack_require__(1);
	bacon.Browser = {
	  Window: Window,
	  Mouse: Mouse,
	  Keyboard: Keyboard,
	  Touch: Touch,
	  Gamepad: Gamepad
	};
	


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __moduleName = "src/window";
	var $ = __webpack_require__(7);
	var bacon = __webpack_require__(1);
	var constantly = __webpack_require__(8).constantly;
	var $window = $(window);
	if (window.history && window.history.pushState) {
	  try {
	    throw undefined;
	  } catch (oldMethods) {
	    oldMethods = {};
	    ["pushState", "replaceState"].forEach(function(method) {
	      oldMethods[method] = window.history[method];
	      window.history[method] = function(state) {
	        var ret = oldMethods[method].apply(this, arguments);
	        $window.trigger("___bacon-browser-state___", [state]);
	        return ret;
	      };
	    });
	  }
	}
	var resize = constantly($window.asEventStream("resize"));
	var hashchanged = constantly($window.asEventStream("hashchanged"));
	var popstate = constantly($window.asEventStream("popstate"));
	var statechanged = constantly($window.asEventStream("___bacon-browser-state___", (function(_, s) {
	  return s;
	})).merge(popstate().map(".originalEvent.state")));
	var hash = (function() {
	  return hashchanged().map((function() {
	    return window.location.hash;
	  })).toProperty(window.location.hash);
	});
	var location = (function() {
	  return hashchanged().merge(statechanged()).map((function() {
	    return window.location;
	  })).toProperty(window.location);
	});
	var state = (function() {
	  return statechanged().toProperty();
	});
	var dimensions = (function() {
	  return resize().map((function() {
	    return ({
	      width: $window.outerWidth(),
	      height: $window.outerHeight()
	    });
	  })).toProperty({
	    width: $window.outerWidth(),
	    height: $window.outerHeight()
	  });
	});
	var height = (function() {
	  return dimensions().map(".height");
	});
	var width = (function() {
	  return dimensions().map(".width");
	});
	var animationFrames = constantly(bacon.fromBinder(function(sink) {
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
	}));
	module.exports = {
	  get resize() {
	    return resize;
	  },
	  get hashchanged() {
	    return hashchanged;
	  },
	  get popstate() {
	    return popstate;
	  },
	  get statechanged() {
	    return statechanged;
	  },
	  get hash() {
	    return hash;
	  },
	  get location() {
	    return location;
	  },
	  get state() {
	    return state;
	  },
	  get dimensions() {
	    return dimensions;
	  },
	  get height() {
	    return height;
	  },
	  get width() {
	    return width;
	  },
	  get animationFrames() {
	    return animationFrames;
	  },
	  __esModule: true
	};
	


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __moduleName = "src/mouse";
	var $ = __webpack_require__(7);
	__webpack_require__(1);
	var mousemove = domStream("mousemove");
	var mouseup = domStream("mouseup");
	var mousedown = domStream("mousedown");
	var click = domStream("click");
	var clicks = (function(target) {
	  return click(target).map((function(ev) {
	    return ({
	      x: target ? ev.offsetX : ev.pageX,
	      y: target ? ev.offsetY : ev.pageY
	    });
	  }));
	});
	var deltas = (function(target) {
	  return position(target).diff(null, (function(a, b) {
	    return a ? {
	      x: b.x - a.x,
	      y: b.y - a.y
	    } : {
	      x: 0,
	      y: 0
	    };
	  })).toEventStream();
	});
	var position = (function(target) {
	  return mousemove(target).map((function(ev) {
	    return ({
	      x: target ? ev.offsetX : ev.pageX,
	      y: target ? ev.offsetY : ev.pageY
	    });
	  })).toProperty();
	});
	var isUp = (function(upTarget, downTarget) {
	  return mouseup(upTarget).map(true).merge(mousedown(downTarget).map(false)).toProperty();
	});
	var isDown = (function(downTarget, upTarget) {
	  return isUp(upTarget, downTarget).not();
	});
	function domStream(name) {
	  var docStream = $(document).asEventStream(name);
	  return (function(target) {
	    return target ? $(target).asEventStream(name) : docStream;
	  });
	}
	module.exports = {
	  get mousemove() {
	    return mousemove;
	  },
	  get mouseup() {
	    return mouseup;
	  },
	  get mousedown() {
	    return mousedown;
	  },
	  get click() {
	    return click;
	  },
	  get clicks() {
	    return clicks;
	  },
	  get deltas() {
	    return deltas;
	  },
	  get position() {
	    return position;
	  },
	  get isUp() {
	    return isUp;
	  },
	  get isDown() {
	    return isDown;
	  },
	  __esModule: true
	};
	


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __moduleName = "src/keyboard";
	var $ = __webpack_require__(7);
	__webpack_require__(1);
	


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __moduleName = "src/touch";
	var $ = __webpack_require__(7);
	__webpack_require__(1);
	


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __moduleName = "src/gamepad";
	var $ = __webpack_require__(7);
	var animationFrames = __webpack_require__(2).animationFrames;
	var give = __webpack_require__(8).constantly;
	__webpack_require__(1);
	var $win = $(window);
	var gpFun = (navigator.getGamepads || navigator.webkitGetGamepads || navigator.mozGetGamepads || give([]));
	var getGamepads = (function() {
	  return gpFun.call(navigator);
	});
	var eventPad = (function(e) {
	  return getGamepads()[e.gamepad.index];
	});
	var gamepadconnected = give($win.asEventStream("gamepadconnected"));
	var gamepaddisconnected = give($win.asEventStream("gamepaddisconnected"));
	var connected = give(gamepadconnected().map(eventPad));
	var disconnected = give(gamepaddisconnected().map(eventPad));
	var gamepads = (function() {
	  return gamepadconnected().merge(gamepaddisconnected()).map(getGamepads).toProperty(getGamepads());
	});
	var buttons = (function(gamepad) {
	  return sampler().map((function() {
	    return getGamepads()[gamepad.id].buttons;
	  })).toProperty(getGamepads()[gamepad.id].buttons);
	});
	var button = (function(gamepad, index, isAnalog) {
	  return buttons(gamepad).map("." + index + "." + (isAnalog ? "value" : "pressed"));
	});
	var buttonpressed = (function(gamepad, index) {
	  return button(index).skipDuplicates().filter((function(x) {
	    return x;
	  }));
	});
	var axes = (function(gamepad) {
	  return sampler().map((function() {
	    return getGamepads()[gamepad.id].axes;
	  })).toProperty(getGamepads()[gamepad.id].axes);
	});
	var axis = (function(index) {
	  return axes().map("." + index);
	});
	var axismoved = (function(gamepad, index) {
	  return axis(index).skipDuplicates();
	});
	var sampler = give(animationFrames());
	module.exports = {
	  get gamepadconnected() {
	    return gamepadconnected;
	  },
	  get gamepaddisconnected() {
	    return gamepaddisconnected;
	  },
	  get connected() {
	    return connected;
	  },
	  get disconnected() {
	    return disconnected;
	  },
	  get gamepads() {
	    return gamepads;
	  },
	  get buttons() {
	    return buttons;
	  },
	  get button() {
	    return button;
	  },
	  get buttonpressed() {
	    return buttonpressed;
	  },
	  get axes() {
	    return axes;
	  },
	  get axis() {
	    return axis;
	  },
	  get axismoved() {
	    return axismoved;
	  },
	  get sampler() {
	    return sampler;
	  },
	  __esModule: true
	};
	


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_7__;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __moduleName = "src/util";
	function constantly(x) {
	  return (function() {
	    return x;
	  });
	}
	module.exports = {
	  get constantly() {
	    return constantly;
	  },
	  __esModule: true
	};
	


/***/ }
/******/ ])
})

//# sourceMappingURL=bacon-browser.js.map