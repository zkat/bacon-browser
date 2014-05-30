(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["bacon-browser"] = factory();
	else
		root["bacon-browser"] = factory();
})(this, function() {
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
	var Window = __webpack_require__(1);
	var Mouse = __webpack_require__(2);
	var Keyboard = __webpack_require__(3);
	var Touch = __webpack_require__(4);
	var bacon = __webpack_require__(5);
	bacon.Browser = {
	  Window: Window,
	  Mouse: Mouse,
	  Keyboard: Keyboard,
	  Touch: Touch
	};
	


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __moduleName = "src/window";
	var $ = __webpack_require__(6);
	var bacon = __webpack_require__(5);
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
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __moduleName = "src/mouse";
	var $ = __webpack_require__(6);
	__webpack_require__(5);
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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __moduleName = "src/keyboard";
	var $ = __webpack_require__(6);
	__webpack_require__(5);
	var Keyboard = {};
	var $__default = Keyboard;
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
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {module.exports = function() {
	  "use strict";
	  var __moduleName = "node_modules/baconjs/dist/Bacon";
	  (function() {
	    var Bacon,
	        BufferingSource,
	        Bus,
	        CompositeUnsubscribe,
	        ConsumingSource,
	        Desc,
	        Dispatcher,
	        End,
	        Error,
	        Event,
	        EventStream,
	        Initial,
	        Next,
	        None,
	        Observable,
	        Property,
	        PropertyDispatcher,
	        Some,
	        Source,
	        UpdateBarrier,
	        addPropertyInitValueToStream,
	        assert,
	        assertArray,
	        assertEventStream,
	        assertFunction,
	        assertNoArguments,
	        assertString,
	        cloneArray,
	        compositeUnsubscribe,
	        containsDuplicateDeps,
	        convertArgsToFunction,
	        describe,
	        end,
	        eventIdCounter,
	        flatMap_,
	        former,
	        idCounter,
	        initial,
	        isArray,
	        isFieldKey,
	        isFunction,
	        isObservable,
	        latterF,
	        liftCallback,
	        makeFunction,
	        makeFunctionArgs,
	        makeFunction_,
	        makeObservable,
	        makeSpawner,
	        next,
	        nop,
	        partiallyApplied,
	        recursionDepth,
	        registerObs,
	        spys,
	        toCombinator,
	        toEvent,
	        toFieldExtractor,
	        toFieldKey,
	        toOption,
	        toSimpleExtractor,
	        withDescription,
	        withMethodCallSupport,
	        _,
	        _ref,
	        __slice = [].slice,
	        __hasProp = {}.hasOwnProperty,
	        __extends = function(child, parent) {
	          for (var key in parent) {
	            if (__hasProp.call(parent, key))
	              child[key] = parent[key];
	          }
	          function ctor() {
	            this.constructor = child;
	          }
	          ctor.prototype = parent.prototype;
	          child.prototype = new ctor();
	          child.__super__ = parent.prototype;
	          return child;
	        },
	        __bind = function(fn, me) {
	          return function() {
	            return fn.apply(me, arguments);
	          };
	        };
	    Bacon = {toString: function() {
	        return "Bacon";
	      }};
	    Bacon.version = '0.7.13';
	    Bacon.fromBinder = function(binder, eventTransformer) {
	      if (eventTransformer == null) {
	        eventTransformer = _.id;
	      }
	      return new EventStream(describe(Bacon, "fromBinder", binder, eventTransformer), function(sink) {
	        var unbinder;
	        return unbinder = binder(function() {
	          var args,
	              event,
	              reply,
	              value,
	              _i,
	              _len;
	          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	          value = eventTransformer.apply(null, args);
	          if (!(isArray(value) && _.last(value) instanceof Event)) {
	            value = [value];
	          }
	          reply = Bacon.more;
	          for (_i = 0, _len = value.length; _i < _len; _i++) {
	            event = value[_i];
	            reply = sink(event = toEvent(event));
	            if (reply === Bacon.noMore || event.isEnd()) {
	              if (unbinder != null) {
	                unbinder();
	              } else {
	                Bacon.scheduler.setTimeout((function() {
	                  return unbinder();
	                }), 0);
	              }
	              return reply;
	            }
	          }
	          return reply;
	        });
	      });
	    };
	    Bacon.$ = {asEventStream: function(eventName, selector, eventTransformer) {
	        var _ref;
	        if (isFunction(selector)) {
	          _ref = [selector, null], eventTransformer = _ref[0], selector = _ref[1];
	        }
	        return withDescription(this.selector || this, "asEventStream", eventName, Bacon.fromBinder((function(_this) {
	          return function(handler) {
	            _this.on(eventName, selector, handler);
	            return function() {
	              return _this.off(eventName, selector, handler);
	            };
	          };
	        })(this), eventTransformer));
	      }};
	    if ((_ref = typeof jQuery !== "undefined" && jQuery !== null ? jQuery : typeof Zepto !== "undefined" && Zepto !== null ? Zepto : null) != null) {
	      _ref.fn.asEventStream = Bacon.$.asEventStream;
	    }
	    Bacon.fromEventTarget = function(target, eventName, eventTransformer) {
	      var sub,
	          unsub,
	          _ref1,
	          _ref2,
	          _ref3,
	          _ref4;
	      sub = (_ref1 = target.addEventListener) != null ? _ref1 : (_ref2 = target.addListener) != null ? _ref2 : target.bind;
	      unsub = (_ref3 = target.removeEventListener) != null ? _ref3 : (_ref4 = target.removeListener) != null ? _ref4 : target.unbind;
	      return withDescription(Bacon, "fromEventTarget", target, eventName, Bacon.fromBinder(function(handler) {
	        sub.call(target, eventName, handler);
	        return function() {
	          return unsub.call(target, eventName, handler);
	        };
	      }, eventTransformer));
	    };
	    Bacon.fromPromise = function(promise, abort) {
	      return withDescription(Bacon, "fromPromise", promise, Bacon.fromBinder(function(handler) {
	        promise.then(handler, function(e) {
	          return handler(new Error(e));
	        });
	        return function() {
	          if (abort) {
	            return typeof promise.abort === "function" ? promise.abort() : void 0;
	          }
	        };
	      }, (function(value) {
	        return [value, end()];
	      })));
	    };
	    Bacon.noMore = ["<no-more>"];
	    Bacon.more = ["<more>"];
	    Bacon.later = function(delay, value) {
	      return withDescription(Bacon, "later", delay, value, Bacon.sequentially(delay, [value]));
	    };
	    Bacon.sequentially = function(delay, values) {
	      var index;
	      index = 0;
	      return withDescription(Bacon, "sequentially", delay, values, Bacon.fromPoll(delay, function() {
	        var value;
	        value = values[index++];
	        if (index < values.length) {
	          return value;
	        } else if (index === values.length) {
	          return [value, end()];
	        } else {
	          return end();
	        }
	      }));
	    };
	    Bacon.repeatedly = function(delay, values) {
	      var index;
	      index = 0;
	      return withDescription(Bacon, "repeatedly", delay, values, Bacon.fromPoll(delay, function() {
	        return values[index++ % values.length];
	      }));
	    };
	    Bacon.spy = function(spy) {
	      return spys.push(spy);
	    };
	    spys = [];
	    registerObs = function(obs) {
	      var spy,
	          _i,
	          _len,
	          _results;
	      if (spys.length) {
	        if (!registerObs.running) {
	          try {
	            registerObs.running = true;
	            _results = [];
	            for (_i = 0, _len = spys.length; _i < _len; _i++) {
	              spy = spys[_i];
	              _results.push(spy(obs));
	            }
	            return _results;
	          } finally {
	            delete registerObs.running;
	          }
	        }
	      }
	    };
	    withMethodCallSupport = function(wrapped) {
	      return function() {
	        var args,
	            context,
	            f,
	            methodName;
	        f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	        if (typeof f === "object" && args.length) {
	          context = f;
	          methodName = args[0];
	          f = function() {
	            return context[methodName].apply(context, arguments);
	          };
	          args = args.slice(1);
	        }
	        return wrapped.apply(null, [f].concat(__slice.call(args)));
	      };
	    };
	    liftCallback = function(desc, wrapped) {
	      return withMethodCallSupport(function() {
	        var args,
	            f,
	            stream;
	        f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	        stream = partiallyApplied(wrapped, [function(values, callback) {
	          return f.apply(null, __slice.call(values).concat([callback]));
	        }]);
	        return withDescription.apply(null, [Bacon, desc, f].concat(__slice.call(args), [Bacon.combineAsArray(args).flatMap(stream)]));
	      });
	    };
	    Bacon.fromCallback = liftCallback("fromCallback", function() {
	      var args,
	          f;
	      f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	      return Bacon.fromBinder(function(handler) {
	        makeFunction(f, args)(handler);
	        return nop;
	      }, (function(value) {
	        return [value, end()];
	      }));
	    });
	    Bacon.fromNodeCallback = liftCallback("fromNodeCallback", function() {
	      var args,
	          f;
	      f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	      return Bacon.fromBinder(function(handler) {
	        makeFunction(f, args)(handler);
	        return nop;
	      }, function(error, value) {
	        if (error) {
	          return [new Error(error), end()];
	        }
	        return [value, end()];
	      });
	    });
	    Bacon.fromPoll = function(delay, poll) {
	      return withDescription(Bacon, "fromPoll", delay, poll, Bacon.fromBinder((function(handler) {
	        var id;
	        id = Bacon.scheduler.setInterval(handler, delay);
	        return function() {
	          return Bacon.scheduler.clearInterval(id);
	        };
	      }), poll));
	    };
	    Bacon.interval = function(delay, value) {
	      if (value == null) {
	        value = {};
	      }
	      return withDescription(Bacon, "interval", delay, value, Bacon.fromPoll(delay, function() {
	        return next(value);
	      }));
	    };
	    Bacon.constant = function(value) {
	      return new Property(describe(Bacon, "constant", value), function(sink) {
	        sink(initial(value));
	        sink(end());
	        return nop;
	      });
	    };
	    Bacon.never = function() {
	      return withDescription(Bacon, "never", Bacon.fromArray([]));
	    };
	    Bacon.once = function(value) {
	      return withDescription(Bacon, "once", value, Bacon.fromArray([value]));
	    };
	    Bacon.fromArray = function(values) {
	      assertArray(values);
	      values = cloneArray(values);
	      return new EventStream(describe(Bacon, "fromArray", values), function(sink) {
	        var reply,
	            unsubd,
	            value;
	        unsubd = false;
	        reply = Bacon.more;
	        while ((reply !== Bacon.noMore) && !unsubd) {
	          if (_.empty(values)) {
	            sink(end());
	            reply = Bacon.noMore;
	          } else {
	            value = _.popHead(values);
	            reply = sink(toEvent(value));
	          }
	        }
	        return function() {
	          return unsubd = true;
	        };
	      });
	    };
	    Bacon.mergeAll = function() {
	      var streams;
	      streams = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	      if (isArray(streams[0])) {
	        streams = streams[0];
	      }
	      if (streams.length) {
	        return new EventStream(describe.apply(null, [Bacon, "mergeAll"].concat(__slice.call(streams))), function(sink) {
	          var ends,
	              sinks,
	              smartSink;
	          ends = 0;
	          smartSink = function(obs) {
	            return function(unsubBoth) {
	              return obs.subscribeInternal(function(event) {
	                var reply;
	                if (event.isEnd()) {
	                  ends++;
	                  if (ends === streams.length) {
	                    return sink(end());
	                  } else {
	                    return Bacon.more;
	                  }
	                } else {
	                  reply = sink(event);
	                  if (reply === Bacon.noMore) {
	                    unsubBoth();
	                  }
	                  return reply;
	                }
	              });
	            };
	          };
	          sinks = _.map(smartSink, streams);
	          return compositeUnsubscribe.apply(null, sinks);
	        });
	      } else {
	        return Bacon.never();
	      }
	    };
	    Bacon.zipAsArray = function() {
	      var streams;
	      streams = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	      if (isArray(streams[0])) {
	        streams = streams[0];
	      }
	      return withDescription.apply(null, [Bacon, "zipAsArray"].concat(__slice.call(streams), [Bacon.zipWith(streams, function() {
	        var xs;
	        xs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	        return xs;
	      })]));
	    };
	    Bacon.zipWith = function() {
	      var f,
	          streams,
	          _ref1;
	      f = arguments[0], streams = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	      if (!isFunction(f)) {
	        _ref1 = [f, streams[0]], streams = _ref1[0], f = _ref1[1];
	      }
	      streams = _.map((function(s) {
	        return s.toEventStream();
	      }), streams);
	      return withDescription.apply(null, [Bacon, "zipWith", f].concat(__slice.call(streams), [Bacon.when(streams, f)]));
	    };
	    Bacon.groupSimultaneous = function() {
	      var s,
	          sources,
	          streams;
	      streams = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	      if (streams.length === 1 && isArray(streams[0])) {
	        streams = streams[0];
	      }
	      sources = (function() {
	        var _i,
	            _len,
	            _results;
	        _results = [];
	        for (_i = 0, _len = streams.length; _i < _len; _i++) {
	          s = streams[_i];
	          _results.push(new BufferingSource(s));
	        }
	        return _results;
	      })();
	      return withDescription.apply(null, [Bacon, "groupSimultaneous"].concat(__slice.call(streams), [Bacon.when(sources, (function() {
	        var xs;
	        xs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	        return xs;
	      }))]));
	    };
	    Bacon.combineAsArray = function() {
	      var index,
	          s,
	          sources,
	          stream,
	          streams,
	          _i,
	          _len;
	      streams = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	      if (streams.length === 1 && isArray(streams[0])) {
	        streams = streams[0];
	      }
	      for (index = _i = 0, _len = streams.length; _i < _len; index = ++_i) {
	        stream = streams[index];
	        if (!(isObservable(stream))) {
	          streams[index] = Bacon.constant(stream);
	        }
	      }
	      if (streams.length) {
	        sources = (function() {
	          var _j,
	              _len1,
	              _results;
	          _results = [];
	          for (_j = 0, _len1 = streams.length; _j < _len1; _j++) {
	            s = streams[_j];
	            _results.push(new Source(s, true, s.subscribeInternal));
	          }
	          return _results;
	        })();
	        return withDescription.apply(null, [Bacon, "combineAsArray"].concat(__slice.call(streams), [Bacon.when(sources, (function() {
	          var xs;
	          xs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	          return xs;
	        })).toProperty()]));
	      } else {
	        return Bacon.constant([]);
	      }
	    };
	    Bacon.onValues = function() {
	      var f,
	          streams,
	          _i;
	      streams = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), f = arguments[_i++];
	      return Bacon.combineAsArray(streams).onValues(f);
	    };
	    Bacon.combineWith = function() {
	      var f,
	          streams;
	      f = arguments[0], streams = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	      return withDescription.apply(null, [Bacon, "combineWith", f].concat(__slice.call(streams), [Bacon.combineAsArray(streams).map(function(values) {
	        return f.apply(null, values);
	      })]));
	    };
	    Bacon.combineTemplate = function(template) {
	      var applyStreamValue,
	          combinator,
	          compile,
	          compileTemplate,
	          constantValue,
	          current,
	          funcs,
	          mkContext,
	          setValue,
	          streams;
	      funcs = [];
	      streams = [];
	      current = function(ctxStack) {
	        return ctxStack[ctxStack.length - 1];
	      };
	      setValue = function(ctxStack, key, value) {
	        return current(ctxStack)[key] = value;
	      };
	      applyStreamValue = function(key, index) {
	        return function(ctxStack, values) {
	          return setValue(ctxStack, key, values[index]);
	        };
	      };
	      constantValue = function(key, value) {
	        return function(ctxStack) {
	          return setValue(ctxStack, key, value);
	        };
	      };
	      mkContext = function(template) {
	        if (isArray(template)) {
	          return [];
	        } else {
	          return {};
	        }
	      };
	      compile = function(key, value) {
	        var popContext,
	            pushContext;
	        if (isObservable(value)) {
	          streams.push(value);
	          return funcs.push(applyStreamValue(key, streams.length - 1));
	        } else if (value === Object(value) && typeof value !== "function" && !(value instanceof RegExp) && !(value instanceof Date)) {
	          pushContext = function(key) {
	            return function(ctxStack) {
	              var newContext;
	              newContext = mkContext(value);
	              setValue(ctxStack, key, newContext);
	              return ctxStack.push(newContext);
	            };
	          };
	          popContext = function(ctxStack) {
	            return ctxStack.pop();
	          };
	          funcs.push(pushContext(key));
	          compileTemplate(value);
	          return funcs.push(popContext);
	        } else {
	          return funcs.push(constantValue(key, value));
	        }
	      };
	      compileTemplate = function(template) {
	        return _.each(template, compile);
	      };
	      compileTemplate(template);
	      combinator = function(values) {
	        var ctxStack,
	            f,
	            rootContext,
	            _i,
	            _len;
	        rootContext = mkContext(template);
	        ctxStack = [rootContext];
	        for (_i = 0, _len = funcs.length; _i < _len; _i++) {
	          f = funcs[_i];
	          f(ctxStack, values);
	        }
	        return rootContext;
	      };
	      return withDescription(Bacon, "combineTemplate", template, Bacon.combineAsArray(streams).map(combinator));
	    };
	    Bacon.retry = function(options) {
	      var interval,
	          isRetryable,
	          maxRetries,
	          retries,
	          retry,
	          source;
	      if (!isFunction(options.source)) {
	        throw "'source' option has to be a function";
	      }
	      source = options.source;
	      retries = options.retries || 0;
	      maxRetries = options.maxRetries || retries;
	      interval = options.interval || function() {
	        return 0;
	      };
	      isRetryable = options.isRetryable || function() {
	        return true;
	      };
	      retry = function(context) {
	        var nextAttemptOptions;
	        nextAttemptOptions = {
	          source: source,
	          retries: retries - 1,
	          maxRetries: maxRetries,
	          interval: interval,
	          isRetryable: isRetryable
	        };
	        return Bacon.later(interval(context)).filter(false).concat(Bacon.retry(nextAttemptOptions));
	      };
	      return withDescription(Bacon, "retry", options, source().flatMapError(function(e) {
	        if (isRetryable(e) && retries > 0) {
	          return retry({
	            error: e,
	            retriesDone: maxRetries - retries
	          });
	        } else {
	          return Bacon.once(new Bacon.Error(e));
	        }
	      }));
	    };
	    eventIdCounter = 0;
	    Event = (function() {
	      function Event() {
	        this.id = ++eventIdCounter;
	      }
	      Event.prototype.isEvent = function() {
	        return true;
	      };
	      Event.prototype.isEnd = function() {
	        return false;
	      };
	      Event.prototype.isInitial = function() {
	        return false;
	      };
	      Event.prototype.isNext = function() {
	        return false;
	      };
	      Event.prototype.isError = function() {
	        return false;
	      };
	      Event.prototype.hasValue = function() {
	        return false;
	      };
	      Event.prototype.filter = function() {
	        return true;
	      };
	      Event.prototype.inspect = function() {
	        return this.toString();
	      };
	      Event.prototype.log = function() {
	        return this.toString();
	      };
	      return Event;
	    })();
	    Next = (function(_super) {
	      __extends(Next, _super);
	      function Next(valueF) {
	        Next.__super__.constructor.call(this);
	        if (isFunction(valueF)) {
	          this.value = _.cached(valueF);
	        } else {
	          this.value = _.always(valueF);
	        }
	      }
	      Next.prototype.isNext = function() {
	        return true;
	      };
	      Next.prototype.hasValue = function() {
	        return true;
	      };
	      Next.prototype.fmap = function(f) {
	        var value;
	        value = this.value;
	        return this.apply(function() {
	          return f(value());
	        });
	      };
	      Next.prototype.apply = function(value) {
	        return new Next(value);
	      };
	      Next.prototype.filter = function(f) {
	        return f(this.value());
	      };
	      Next.prototype.toString = function() {
	        return _.toString(this.value());
	      };
	      Next.prototype.log = function() {
	        return this.value();
	      };
	      return Next;
	    })(Event);
	    Initial = (function(_super) {
	      __extends(Initial, _super);
	      function Initial() {
	        return Initial.__super__.constructor.apply(this, arguments);
	      }
	      Initial.prototype.isInitial = function() {
	        return true;
	      };
	      Initial.prototype.isNext = function() {
	        return false;
	      };
	      Initial.prototype.apply = function(value) {
	        return new Initial(value);
	      };
	      Initial.prototype.toNext = function() {
	        return new Next(this.value);
	      };
	      return Initial;
	    })(Next);
	    End = (function(_super) {
	      __extends(End, _super);
	      function End() {
	        return End.__super__.constructor.apply(this, arguments);
	      }
	      End.prototype.isEnd = function() {
	        return true;
	      };
	      End.prototype.fmap = function() {
	        return this;
	      };
	      End.prototype.apply = function() {
	        return this;
	      };
	      End.prototype.toString = function() {
	        return "<end>";
	      };
	      return End;
	    })(Event);
	    Error = (function(_super) {
	      __extends(Error, _super);
	      function Error(error) {
	        this.error = error;
	      }
	      Error.prototype.isError = function() {
	        return true;
	      };
	      Error.prototype.fmap = function() {
	        return this;
	      };
	      Error.prototype.apply = function() {
	        return this;
	      };
	      Error.prototype.toString = function() {
	        return "<error> " + _.toString(this.error);
	      };
	      return Error;
	    })(Event);
	    idCounter = 0;
	    Observable = (function() {
	      function Observable(desc) {
	        this.flatMapError = __bind(this.flatMapError, this);
	        this.id = ++idCounter;
	        withDescription(desc, this);
	      }
	      Observable.prototype.onValue = function() {
	        var f;
	        f = makeFunctionArgs(arguments);
	        return this.subscribe(function(event) {
	          if (event.hasValue()) {
	            return f(event.value());
	          }
	        });
	      };
	      Observable.prototype.onValues = function(f) {
	        return this.onValue(function(args) {
	          return f.apply(null, args);
	        });
	      };
	      Observable.prototype.onError = function() {
	        var f;
	        f = makeFunctionArgs(arguments);
	        return this.subscribe(function(event) {
	          if (event.isError()) {
	            return f(event.error);
	          }
	        });
	      };
	      Observable.prototype.onEnd = function() {
	        var f;
	        f = makeFunctionArgs(arguments);
	        return this.subscribe(function(event) {
	          if (event.isEnd()) {
	            return f();
	          }
	        });
	      };
	      Observable.prototype.errors = function() {
	        return withDescription(this, "errors", this.filter(function() {
	          return false;
	        }));
	      };
	      Observable.prototype.filter = function() {
	        var args,
	            f;
	        f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	        return convertArgsToFunction(this, f, args, function(f) {
	          return withDescription(this, "filter", f, this.withHandler(function(event) {
	            if (event.filter(f)) {
	              return this.push(event);
	            } else {
	              return Bacon.more;
	            }
	          }));
	        });
	      };
	      Observable.prototype.takeWhile = function() {
	        var args,
	            f;
	        f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	        return convertArgsToFunction(this, f, args, function(f) {
	          return withDescription(this, "takeWhile", f, this.withHandler(function(event) {
	            if (event.filter(f)) {
	              return this.push(event);
	            } else {
	              this.push(end());
	              return Bacon.noMore;
	            }
	          }));
	        });
	      };
	      Observable.prototype.endOnError = function() {
	        var args,
	            f;
	        f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	        if (f == null) {
	          f = true;
	        }
	        return convertArgsToFunction(this, f, args, function(f) {
	          return withDescription(this, "endOnError", this.withHandler(function(event) {
	            if (event.isError() && f(event.error)) {
	              this.push(event);
	              return this.push(end());
	            } else {
	              return this.push(event);
	            }
	          }));
	        });
	      };
	      Observable.prototype.take = function(count) {
	        if (count <= 0) {
	          return Bacon.never();
	        }
	        return withDescription(this, "take", count, this.withHandler(function(event) {
	          if (!event.hasValue()) {
	            return this.push(event);
	          } else {
	            count--;
	            if (count > 0) {
	              return this.push(event);
	            } else {
	              if (count === 0) {
	                this.push(event);
	              }
	              this.push(end());
	              return Bacon.noMore;
	            }
	          }
	        }));
	      };
	      Observable.prototype.map = function() {
	        var args,
	            p;
	        p = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	        if (p instanceof Property) {
	          return p.sampledBy(this, former);
	        } else {
	          return convertArgsToFunction(this, p, args, function(f) {
	            return withDescription(this, "map", f, this.withHandler(function(event) {
	              return this.push(event.fmap(f));
	            }));
	          });
	        }
	      };
	      Observable.prototype.mapError = function() {
	        var f;
	        f = makeFunctionArgs(arguments);
	        return withDescription(this, "mapError", f, this.withHandler(function(event) {
	          if (event.isError()) {
	            return this.push(next(f(event.error)));
	          } else {
	            return this.push(event);
	          }
	        }));
	      };
	      Observable.prototype.mapEnd = function() {
	        var f;
	        f = makeFunctionArgs(arguments);
	        return withDescription(this, "mapEnd", f, this.withHandler(function(event) {
	          if (event.isEnd()) {
	            this.push(next(f(event)));
	            this.push(end());
	            return Bacon.noMore;
	          } else {
	            return this.push(event);
	          }
	        }));
	      };
	      Observable.prototype.doAction = function() {
	        var f;
	        f = makeFunctionArgs(arguments);
	        return withDescription(this, "doAction", f, this.withHandler(function(event) {
	          if (event.hasValue()) {
	            f(event.value());
	          }
	          return this.push(event);
	        }));
	      };
	      Observable.prototype.skip = function(count) {
	        return withDescription(this, "skip", count, this.withHandler(function(event) {
	          if (!event.hasValue()) {
	            return this.push(event);
	          } else if (count > 0) {
	            count--;
	            return Bacon.more;
	          } else {
	            return this.push(event);
	          }
	        }));
	      };
	      Observable.prototype.skipDuplicates = function(isEqual) {
	        if (isEqual == null) {
	          isEqual = function(a, b) {
	            return a === b;
	          };
	        }
	        return withDescription(this, "skipDuplicates", this.withStateMachine(None, function(prev, event) {
	          if (!event.hasValue()) {
	            return [prev, [event]];
	          } else if (event.isInitial() || prev === None || !isEqual(prev.get(), event.value())) {
	            return [new Some(event.value()), [event]];
	          } else {
	            return [prev, []];
	          }
	        }));
	      };
	      Observable.prototype.skipErrors = function() {
	        return withDescription(this, "skipErrors", this.withHandler(function(event) {
	          if (event.isError()) {
	            return Bacon.more;
	          } else {
	            return this.push(event);
	          }
	        }));
	      };
	      Observable.prototype.withStateMachine = function(initState, f) {
	        var state;
	        state = initState;
	        return withDescription(this, "withStateMachine", initState, f, this.withHandler(function(event) {
	          var fromF,
	              newState,
	              output,
	              outputs,
	              reply,
	              _i,
	              _len;
	          fromF = f(state, event);
	          newState = fromF[0], outputs = fromF[1];
	          state = newState;
	          reply = Bacon.more;
	          for (_i = 0, _len = outputs.length; _i < _len; _i++) {
	            output = outputs[_i];
	            reply = this.push(output);
	            if (reply === Bacon.noMore) {
	              return reply;
	            }
	          }
	          return reply;
	        }));
	      };
	      Observable.prototype.scan = function(seed, f, options) {
	        var acc,
	            f_,
	            resultProperty,
	            subscribe;
	        if (options == null) {
	          options = {};
	        }
	        f_ = toCombinator(f);
	        f = options.lazyF ? f_ : function(x, y) {
	          return f_(x(), y());
	        };
	        acc = toOption(seed).map(function(x) {
	          return _.always(x);
	        });
	        subscribe = (function(_this) {
	          return function(sink) {
	            var initSent,
	                reply,
	                sendInit,
	                unsub;
	            initSent = false;
	            unsub = nop;
	            reply = Bacon.more;
	            sendInit = function() {
	              if (!initSent) {
	                return acc.forEach(function(valueF) {
	                  initSent = true;
	                  reply = sink(new Initial(valueF));
	                  if (reply === Bacon.noMore) {
	                    unsub();
	                    return unsub = nop;
	                  }
	                });
	              }
	            };
	            unsub = _this.subscribeInternal(function(event) {
	              var next,
	                  prev;
	              if (event.hasValue()) {
	                if (initSent && event.isInitial()) {
	                  return Bacon.more;
	                } else {
	                  if (!event.isInitial()) {
	                    sendInit();
	                  }
	                  initSent = true;
	                  prev = acc.getOrElse(function() {
	                    return void 0;
	                  });
	                  next = _.cached(function() {
	                    return f(prev, event.value);
	                  });
	                  acc = new Some(next);
	                  if (options.eager) {
	                    next();
	                  }
	                  return sink(event.apply(next));
	                }
	              } else {
	                if (event.isEnd()) {
	                  reply = sendInit();
	                }
	                if (reply !== Bacon.noMore) {
	                  return sink(event);
	                }
	              }
	            });
	            UpdateBarrier.whenDoneWith(resultProperty, sendInit);
	            return unsub;
	          };
	        })(this);
	        return resultProperty = new Property(describe(this, "scan", seed, f), subscribe);
	      };
	      Observable.prototype.fold = function(seed, f, options) {
	        return withDescription(this, "fold", seed, f, this.scan(seed, f, options).sampledBy(this.filter(false).mapEnd().toProperty()));
	      };
	      Observable.prototype.zip = function(other, f) {
	        if (f == null) {
	          f = Array;
	        }
	        return withDescription(this, "zip", other, Bacon.zipWith([this, other], f));
	      };
	      Observable.prototype.diff = function(start, f) {
	        f = toCombinator(f);
	        return withDescription(this, "diff", start, f, this.scan([start], function(prevTuple, next) {
	          return [next, f(prevTuple[0], next)];
	        }).filter(function(tuple) {
	          return tuple.length === 2;
	        }).map(function(tuple) {
	          return tuple[1];
	        }));
	      };
	      Observable.prototype.flatMap = function() {
	        return flatMap_(this, makeSpawner(arguments));
	      };
	      Observable.prototype.flatMapFirst = function() {
	        return flatMap_(this, makeSpawner(arguments), true);
	      };
	      Observable.prototype.flatMapWithConcurrencyLimit = function() {
	        var args,
	            limit;
	        limit = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	        return withDescription.apply(null, [this, "flatMapWithConcurrencyLimit", limit].concat(__slice.call(args), [flatMap_(this, makeSpawner(args), false, limit)]));
	      };
	      Observable.prototype.flatMapLatest = function() {
	        var f,
	            stream;
	        f = makeSpawner(arguments);
	        stream = this.toEventStream();
	        return withDescription(this, "flatMapLatest", f, stream.flatMap(function(value) {
	          return makeObservable(f(value)).takeUntil(stream);
	        }));
	      };
	      Observable.prototype.flatMapError = function(fn) {
	        return withDescription(this, "flatMapError", fn, this.mapError(function(err) {
	          return new Bacon.Error(err);
	        }).flatMap(function(x) {
	          if (x instanceof Bacon.Error) {
	            return fn(x.error);
	          } else {
	            return Bacon.once(x);
	          }
	        }));
	      };
	      Observable.prototype.flatMapConcat = function() {
	        return withDescription.apply(null, [this, "flatMapConcat"].concat(__slice.call(arguments), [this.flatMapWithConcurrencyLimit.apply(this, [1].concat(__slice.call(arguments)))]));
	      };
	      Observable.prototype.bufferingThrottle = function(minimumInterval) {
	        return withDescription(this, "bufferingThrottle", minimumInterval, this.flatMapConcat(function(x) {
	          return Bacon.once(x).concat(Bacon.later(minimumInterval).filter(false));
	        }));
	      };
	      Observable.prototype.not = function() {
	        return withDescription(this, "not", this.map(function(x) {
	          return !x;
	        }));
	      };
	      Observable.prototype.log = function() {
	        var args;
	        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	        this.subscribe(function(event) {
	          return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log.apply(console, __slice.call(args).concat([event.log()])) : void 0 : void 0;
	        });
	        return this;
	      };
	      Observable.prototype.slidingWindow = function(n, minValues) {
	        if (minValues == null) {
	          minValues = 0;
	        }
	        return withDescription(this, "slidingWindow", n, minValues, this.scan([], (function(window, value) {
	          return window.concat([value]).slice(-n);
	        })).filter((function(values) {
	          return values.length >= minValues;
	        })));
	      };
	      Observable.prototype.combine = function(other, f) {
	        var combinator;
	        combinator = toCombinator(f);
	        return withDescription(this, "combine", other, f, Bacon.combineAsArray(this, other).map(function(values) {
	          return combinator(values[0], values[1]);
	        }));
	      };
	      Observable.prototype.decode = function(cases) {
	        return withDescription(this, "decode", cases, this.combine(Bacon.combineTemplate(cases), function(key, values) {
	          return values[key];
	        }));
	      };
	      Observable.prototype.awaiting = function(other) {
	        return withDescription(this, "awaiting", other, Bacon.groupSimultaneous(this, other).map(function(_arg) {
	          var myValues,
	              otherValues;
	          myValues = _arg[0], otherValues = _arg[1];
	          return otherValues.length === 0;
	        }).toProperty(false).skipDuplicates());
	      };
	      Observable.prototype.name = function(name) {
	        this.toString = function() {
	          return name;
	        };
	        return this;
	      };
	      Observable.prototype.withDescription = function() {
	        return describe.apply(null, arguments).apply(this);
	      };
	      return Observable;
	    })();
	    Observable.prototype.reduce = Observable.prototype.fold;
	    Observable.prototype.assign = Observable.prototype.onValue;
	    flatMap_ = function(root, f, firstOnly, limit) {
	      return new EventStream(describe(root, "flatMap" + (firstOnly ? "First" : ""), f), function(sink) {
	        var checkEnd,
	            checkQueue,
	            composite,
	            queue,
	            spawn;
	        composite = new CompositeUnsubscribe();
	        queue = [];
	        spawn = function(event) {
	          var child;
	          child = makeObservable(f(event.value()));
	          return composite.add(function(unsubAll, unsubMe) {
	            return child.subscribeInternal(function(event) {
	              var reply;
	              if (event.isEnd()) {
	                checkQueue();
	                checkEnd(unsubMe);
	                return Bacon.noMore;
	              } else {
	                if (event instanceof Initial) {
	                  event = event.toNext();
	                }
	                reply = sink(event);
	                if (reply === Bacon.noMore) {
	                  unsubAll();
	                }
	                return reply;
	              }
	            });
	          });
	        };
	        checkQueue = function() {
	          var event;
	          event = _.popHead(queue);
	          if (event) {
	            return spawn(event);
	          }
	        };
	        checkEnd = function(unsub) {
	          unsub();
	          if (composite.empty()) {
	            return sink(end());
	          }
	        };
	        composite.add(function(__, unsubRoot) {
	          return root.subscribeInternal(function(event) {
	            if (event.isEnd()) {
	              return checkEnd(unsubRoot);
	            } else if (event.isError()) {
	              return sink(event);
	            } else if (firstOnly && composite.count() > 1) {
	              return Bacon.more;
	            } else {
	              if (composite.unsubscribed) {
	                return Bacon.noMore;
	              }
	              if (limit && composite.count() > limit) {
	                return queue.push(event);
	              } else {
	                return spawn(event);
	              }
	            }
	          });
	        });
	        return composite.unsubscribe;
	      });
	    };
	    EventStream = (function(_super) {
	      __extends(EventStream, _super);
	      function EventStream(desc, subscribe) {
	        var dispatcher;
	        if (isFunction(desc)) {
	          subscribe = desc;
	          desc = [];
	        }
	        EventStream.__super__.constructor.call(this, desc);
	        assertFunction(subscribe);
	        dispatcher = new Dispatcher(subscribe);
	        this.subscribeInternal = dispatcher.subscribe;
	        this.subscribe = UpdateBarrier.wrappedSubscribe(this);
	        this.hasSubscribers = dispatcher.hasSubscribers;
	        registerObs(this);
	      }
	      EventStream.prototype.delay = function(delay) {
	        return withDescription(this, "delay", delay, this.flatMap(function(value) {
	          return Bacon.later(delay, value);
	        }));
	      };
	      EventStream.prototype.debounce = function(delay) {
	        return withDescription(this, "debounce", delay, this.flatMapLatest(function(value) {
	          return Bacon.later(delay, value);
	        }));
	      };
	      EventStream.prototype.debounceImmediate = function(delay) {
	        return withDescription(this, "debounceImmediate", delay, this.flatMapFirst(function(value) {
	          return Bacon.once(value).concat(Bacon.later(delay).filter(false));
	        }));
	      };
	      EventStream.prototype.throttle = function(delay) {
	        return withDescription(this, "throttle", delay, this.bufferWithTime(delay).map(function(values) {
	          return values[values.length - 1];
	        }));
	      };
	      EventStream.prototype.bufferWithTime = function(delay) {
	        return withDescription(this, "bufferWithTime", delay, this.bufferWithTimeOrCount(delay, Number.MAX_VALUE));
	      };
	      EventStream.prototype.bufferWithCount = function(count) {
	        return withDescription(this, "bufferWithCount", count, this.bufferWithTimeOrCount(void 0, count));
	      };
	      EventStream.prototype.bufferWithTimeOrCount = function(delay, count) {
	        var flushOrSchedule;
	        flushOrSchedule = function(buffer) {
	          if (buffer.values.length === count) {
	            return buffer.flush();
	          } else if (delay !== void 0) {
	            return buffer.schedule();
	          }
	        };
	        return withDescription(this, "bufferWithTimeOrCount", delay, count, this.buffer(delay, flushOrSchedule, flushOrSchedule));
	      };
	      EventStream.prototype.buffer = function(delay, onInput, onFlush) {
	        var buffer,
	            delayMs,
	            reply;
	        if (onInput == null) {
	          onInput = (function() {});
	        }
	        if (onFlush == null) {
	          onFlush = (function() {});
	        }
	        buffer = {
	          scheduled: false,
	          end: null,
	          values: [],
	          flush: function() {
	            var reply;
	            this.scheduled = false;
	            if (this.values.length > 0) {
	              reply = this.push(next(this.values));
	              this.values = [];
	              if (this.end != null) {
	                return this.push(this.end);
	              } else if (reply !== Bacon.noMore) {
	                return onFlush(this);
	              }
	            } else {
	              if (this.end != null) {
	                return this.push(this.end);
	              }
	            }
	          },
	          schedule: function() {
	            if (!this.scheduled) {
	              this.scheduled = true;
	              return delay((function(_this) {
	                return function() {
	                  return _this.flush();
	                };
	              })(this));
	            }
	          }
	        };
	        reply = Bacon.more;
	        if (!isFunction(delay)) {
	          delayMs = delay;
	          delay = function(f) {
	            return Bacon.scheduler.setTimeout(f, delayMs);
	          };
	        }
	        return withDescription(this, "buffer", this.withHandler(function(event) {
	          buffer.push = this.push;
	          if (event.isError()) {
	            reply = this.push(event);
	          } else if (event.isEnd()) {
	            buffer.end = event;
	            if (!buffer.scheduled) {
	              buffer.flush();
	            }
	          } else {
	            buffer.values.push(event.value());
	            onInput(buffer);
	          }
	          return reply;
	        }));
	      };
	      EventStream.prototype.merge = function(right) {
	        var left;
	        assertEventStream(right);
	        left = this;
	        return withDescription(left, "merge", right, Bacon.mergeAll(this, right));
	      };
	      EventStream.prototype.toProperty = function(initValue) {
	        if (arguments.length === 0) {
	          initValue = None;
	        }
	        return withDescription(this, "toProperty", initValue, this.scan(initValue, latterF, {lazyF: true}));
	      };
	      EventStream.prototype.toEventStream = function() {
	        return this;
	      };
	      EventStream.prototype.sampledBy = function(sampler, combinator) {
	        return withDescription(this, "sampledBy", sampler, combinator, this.toProperty().sampledBy(sampler, combinator));
	      };
	      EventStream.prototype.concat = function(right) {
	        var left;
	        left = this;
	        return new EventStream(describe(left, "concat", right), function(sink) {
	          var unsubLeft,
	              unsubRight;
	          unsubRight = nop;
	          unsubLeft = left.subscribeInternal(function(e) {
	            if (e.isEnd()) {
	              return unsubRight = right.subscribeInternal(sink);
	            } else {
	              return sink(e);
	            }
	          });
	          return function() {
	            unsubLeft();
	            return unsubRight();
	          };
	        });
	      };
	      EventStream.prototype.takeUntil = function(stopper) {
	        var endMarker;
	        endMarker = {};
	        return withDescription(this, "takeUntil", stopper, Bacon.groupSimultaneous(this.mapEnd(endMarker), stopper.skipErrors()).withHandler(function(event) {
	          var data,
	              reply,
	              value,
	              _i,
	              _len,
	              _ref1;
	          if (!event.hasValue()) {
	            return this.push(event);
	          } else {
	            _ref1 = event.value(), data = _ref1[0], stopper = _ref1[1];
	            if (stopper.length) {
	              return this.push(end());
	            } else {
	              reply = Bacon.more;
	              for (_i = 0, _len = data.length; _i < _len; _i++) {
	                value = data[_i];
	                if (value === endMarker) {
	                  reply = this.push(end());
	                } else {
	                  reply = this.push(next(value));
	                }
	              }
	              return reply;
	            }
	          }
	        }));
	      };
	      EventStream.prototype.skipUntil = function(starter) {
	        var started;
	        started = starter.take(1).map(true).toProperty(false);
	        return withDescription(this, "skipUntil", starter, this.filter(started));
	      };
	      EventStream.prototype.skipWhile = function() {
	        var args,
	            f,
	            ok;
	        f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	        ok = false;
	        return convertArgsToFunction(this, f, args, function(f) {
	          return withDescription(this, "skipWhile", f, this.withHandler(function(event) {
	            if (ok || !event.hasValue() || !f(event.value())) {
	              if (event.hasValue()) {
	                ok = true;
	              }
	              return this.push(event);
	            } else {
	              return Bacon.more;
	            }
	          }));
	        });
	      };
	      EventStream.prototype.holdWhen = function(valve) {
	        var putToHold,
	            releaseHold,
	            valve_;
	        valve_ = valve.startWith(false);
	        releaseHold = valve_.filter(function(x) {
	          return !x;
	        });
	        putToHold = valve_.filter(_.id);
	        return withDescription(this, "holdWhen", valve, this.filter(false).merge(valve_.flatMapConcat((function(_this) {
	          return function(shouldHold) {
	            if (!shouldHold) {
	              return _this.takeUntil(putToHold);
	            } else {
	              return _this.scan([], (function(xs, x) {
	                return xs.concat(x);
	              }), {eager: true}).sampledBy(releaseHold).take(1).flatMap(Bacon.fromArray);
	            }
	          };
	        })(this))));
	      };
	      EventStream.prototype.startWith = function(seed) {
	        return withDescription(this, "startWith", seed, Bacon.once(seed).concat(this));
	      };
	      EventStream.prototype.withHandler = function(handler) {
	        var dispatcher;
	        dispatcher = new Dispatcher(this.subscribeInternal, handler);
	        return new EventStream(describe(this, "withHandler", handler), dispatcher.subscribe);
	      };
	      return EventStream;
	    })(Observable);
	    Property = (function(_super) {
	      __extends(Property, _super);
	      function Property(desc, subscribe, handler) {
	        if (isFunction(desc)) {
	          handler = subscribe;
	          subscribe = desc;
	          desc = [];
	        }
	        Property.__super__.constructor.call(this, desc);
	        assertFunction(subscribe);
	        if (handler === true) {
	          this.subscribeInternal = subscribe;
	        } else {
	          this.subscribeInternal = new PropertyDispatcher(this, subscribe, handler).subscribe;
	        }
	        this.subscribe = UpdateBarrier.wrappedSubscribe(this);
	        registerObs(this);
	      }
	      Property.prototype.sampledBy = function(sampler, combinator) {
	        var lazy,
	            result,
	            samplerSource,
	            stream,
	            thisSource;
	        if (combinator != null) {
	          combinator = toCombinator(combinator);
	        } else {
	          lazy = true;
	          combinator = function(f) {
	            return f();
	          };
	        }
	        thisSource = new Source(this, false, this.subscribeInternal, lazy);
	        samplerSource = new Source(sampler, true, sampler.subscribeInternal, lazy);
	        stream = Bacon.when([thisSource, samplerSource], combinator);
	        result = sampler instanceof Property ? stream.toProperty() : stream;
	        return withDescription(this, "sampledBy", sampler, combinator, result);
	      };
	      Property.prototype.sample = function(interval) {
	        return withDescription(this, "sample", interval, this.sampledBy(Bacon.interval(interval, {})));
	      };
	      Property.prototype.changes = function() {
	        return new EventStream(describe(this, "changes"), (function(_this) {
	          return function(sink) {
	            return _this.subscribeInternal(function(event) {
	              if (!event.isInitial()) {
	                return sink(event);
	              }
	            });
	          };
	        })(this));
	      };
	      Property.prototype.withHandler = function(handler) {
	        return new Property(describe(this, "withHandler", handler), this.subscribeInternal, handler);
	      };
	      Property.prototype.toProperty = function() {
	        assertNoArguments(arguments);
	        return this;
	      };
	      Property.prototype.toEventStream = function() {
	        return new EventStream(describe(this, "toEventStream"), (function(_this) {
	          return function(sink) {
	            return _this.subscribeInternal(function(event) {
	              if (event.isInitial()) {
	                event = event.toNext();
	              }
	              return sink(event);
	            });
	          };
	        })(this));
	      };
	      Property.prototype.and = function(other) {
	        return withDescription(this, "and", other, this.combine(other, function(x, y) {
	          return x && y;
	        }));
	      };
	      Property.prototype.or = function(other) {
	        return withDescription(this, "or", other, this.combine(other, function(x, y) {
	          return x || y;
	        }));
	      };
	      Property.prototype.delay = function(delay) {
	        return this.delayChanges("delay", delay, function(changes) {
	          return changes.delay(delay);
	        });
	      };
	      Property.prototype.debounce = function(delay) {
	        return this.delayChanges("debounce", delay, function(changes) {
	          return changes.debounce(delay);
	        });
	      };
	      Property.prototype.throttle = function(delay) {
	        return this.delayChanges("throttle", delay, function(changes) {
	          return changes.throttle(delay);
	        });
	      };
	      Property.prototype.delayChanges = function() {
	        var desc,
	            f,
	            _i;
	        desc = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), f = arguments[_i++];
	        return withDescription.apply(null, [this].concat(__slice.call(desc), [addPropertyInitValueToStream(this, f(this.changes()))]));
	      };
	      Property.prototype.takeUntil = function(stopper) {
	        var changes;
	        changes = this.changes().takeUntil(stopper);
	        return withDescription(this, "takeUntil", stopper, addPropertyInitValueToStream(this, changes));
	      };
	      Property.prototype.startWith = function(value) {
	        return withDescription(this, "startWith", value, this.scan(value, function(prev, next) {
	          return next;
	        }));
	      };
	      Property.prototype.bufferingThrottle = function() {
	        var _ref1;
	        return (_ref1 = Property.__super__.bufferingThrottle.apply(this, arguments)).bufferingThrottle.apply(_ref1, arguments).toProperty();
	      };
	      return Property;
	    })(Observable);
	    convertArgsToFunction = function(obs, f, args, method) {
	      var sampled;
	      if (f instanceof Property) {
	        sampled = f.sampledBy(obs, function(p, s) {
	          return [p, s];
	        });
	        return method.apply(sampled, [function(_arg) {
	          var p,
	              s;
	          p = _arg[0], s = _arg[1];
	          return p;
	        }]).map(function(_arg) {
	          var p,
	              s;
	          p = _arg[0], s = _arg[1];
	          return s;
	        });
	      } else {
	        f = makeFunction(f, args);
	        return method.apply(obs, [f]);
	      }
	    };
	    addPropertyInitValueToStream = function(property, stream) {
	      var justInitValue;
	      justInitValue = new EventStream(describe(property, "justInitValue"), function(sink) {
	        var unsub,
	            value;
	        value = null;
	        unsub = property.subscribeInternal(function(event) {
	          if (event.hasValue()) {
	            value = event;
	          }
	          return Bacon.noMore;
	        });
	        UpdateBarrier.whenDoneWith(justInitValue, function() {
	          if (value != null) {
	            sink(value);
	          }
	          return sink(end());
	        });
	        return unsub;
	      });
	      return justInitValue.concat(stream).toProperty();
	    };
	    Dispatcher = (function() {
	      function Dispatcher(subscribe, handleEvent) {
	        var done,
	            ended,
	            prevError,
	            pushIt,
	            pushing,
	            queue,
	            removeSub,
	            subscriptions,
	            unsubscribeFromSource,
	            waiters;
	        if (subscribe == null) {
	          subscribe = function() {
	            return nop;
	          };
	        }
	        subscriptions = [];
	        queue = [];
	        pushing = false;
	        ended = false;
	        this.hasSubscribers = function() {
	          return subscriptions.length > 0;
	        };
	        prevError = null;
	        unsubscribeFromSource = nop;
	        removeSub = function(subscription) {
	          return subscriptions = _.without(subscription, subscriptions);
	        };
	        waiters = null;
	        done = function() {
	          var w,
	              ws,
	              _i,
	              _len,
	              _results;
	          if (waiters != null) {
	            ws = waiters;
	            waiters = null;
	            _results = [];
	            for (_i = 0, _len = ws.length; _i < _len; _i++) {
	              w = ws[_i];
	              _results.push(w());
	            }
	            return _results;
	          }
	        };
	        pushIt = function(event) {
	          var reply,
	              sub,
	              success,
	              tmp,
	              _i,
	              _len;
	          if (!pushing) {
	            if (event === prevError) {
	              return;
	            }
	            if (event.isError()) {
	              prevError = event;
	            }
	            success = false;
	            try {
	              pushing = true;
	              tmp = subscriptions;
	              for (_i = 0, _len = tmp.length; _i < _len; _i++) {
	                sub = tmp[_i];
	                reply = sub.sink(event);
	                if (reply === Bacon.noMore || event.isEnd()) {
	                  removeSub(sub);
	                }
	              }
	              success = true;
	            } finally {
	              pushing = false;
	              if (!success) {
	                queue = [];
	              }
	            }
	            success = true;
	            while (queue.length) {
	              event = queue.shift();
	              this.push(event);
	            }
	            done(event);
	            if (this.hasSubscribers()) {
	              return Bacon.more;
	            } else {
	              unsubscribeFromSource();
	              return Bacon.noMore;
	            }
	          } else {
	            queue.push(event);
	            return Bacon.more;
	          }
	        };
	        this.push = (function(_this) {
	          return function(event) {
	            return UpdateBarrier.inTransaction(event, _this, pushIt, [event]);
	          };
	        })(this);
	        if (handleEvent == null) {
	          handleEvent = function(event) {
	            return this.push(event);
	          };
	        }
	        this.handleEvent = (function(_this) {
	          return function(event) {
	            if (event.isEnd()) {
	              ended = true;
	            }
	            return handleEvent.apply(_this, [event]);
	          };
	        })(this);
	        this.subscribe = (function(_this) {
	          return function(sink) {
	            var subscription,
	                unsubSrc;
	            if (ended) {
	              sink(end());
	              return nop;
	            } else {
	              assertFunction(sink);
	              subscription = {sink: sink};
	              subscriptions.push(subscription);
	              if (subscriptions.length === 1) {
	                unsubSrc = subscribe(_this.handleEvent);
	                unsubscribeFromSource = function() {
	                  unsubSrc();
	                  return unsubscribeFromSource = nop;
	                };
	              }
	              assertFunction(unsubscribeFromSource);
	              return function() {
	                removeSub(subscription);
	                if (!_this.hasSubscribers()) {
	                  return unsubscribeFromSource();
	                }
	              };
	            }
	          };
	        })(this);
	      }
	      return Dispatcher;
	    })();
	    PropertyDispatcher = (function(_super) {
	      __extends(PropertyDispatcher, _super);
	      function PropertyDispatcher(p, subscribe, handleEvent) {
	        var current,
	            currentValueRootId,
	            ended,
	            push;
	        PropertyDispatcher.__super__.constructor.call(this, subscribe, handleEvent);
	        current = None;
	        currentValueRootId = void 0;
	        push = this.push;
	        subscribe = this.subscribe;
	        ended = false;
	        this.push = (function(_this) {
	          return function(event) {
	            if (event.isEnd()) {
	              ended = true;
	            }
	            if (event.hasValue()) {
	              current = new Some(event);
	              currentValueRootId = UpdateBarrier.currentEventId();
	            }
	            return push.apply(_this, [event]);
	          };
	        })(this);
	        this.subscribe = (function(_this) {
	          return function(sink) {
	            var dispatchingId,
	                initSent,
	                maybeSubSource,
	                reply,
	                valId;
	            initSent = false;
	            reply = Bacon.more;
	            maybeSubSource = function() {
	              if (reply === Bacon.noMore) {
	                return nop;
	              } else if (ended) {
	                sink(end());
	                return nop;
	              } else {
	                return subscribe.apply(this, [sink]);
	              }
	            };
	            if (current.isDefined && (_this.hasSubscribers() || ended)) {
	              dispatchingId = UpdateBarrier.currentEventId();
	              valId = currentValueRootId;
	              if (!ended && valId && dispatchingId && dispatchingId !== valId) {
	                UpdateBarrier.whenDoneWith(p, function() {
	                  if (currentValueRootId === valId) {
	                    return sink(initial(current.get().value()));
	                  }
	                });
	                return maybeSubSource();
	              } else {
	                UpdateBarrier.inTransaction(void 0, _this, (function() {
	                  return reply = sink(initial(current.get().value()));
	                }), []);
	                return maybeSubSource();
	              }
	            } else {
	              return maybeSubSource();
	            }
	          };
	        })(this);
	      }
	      return PropertyDispatcher;
	    })(Dispatcher);
	    Bus = (function(_super) {
	      __extends(Bus, _super);
	      function Bus() {
	        var ended,
	            guardedSink,
	            sink,
	            subscribeAll,
	            subscribeInput,
	            subscriptions,
	            unsubAll,
	            unsubscribeInput;
	        sink = void 0;
	        subscriptions = [];
	        ended = false;
	        guardedSink = (function(_this) {
	          return function(input) {
	            return function(event) {
	              if (event.isEnd()) {
	                unsubscribeInput(input);
	                return Bacon.noMore;
	              } else {
	                return sink(event);
	              }
	            };
	          };
	        })(this);
	        unsubAll = function() {
	          var sub,
	              _i,
	              _len,
	              _results;
	          _results = [];
	          for (_i = 0, _len = subscriptions.length; _i < _len; _i++) {
	            sub = subscriptions[_i];
	            _results.push(typeof sub.unsub === "function" ? sub.unsub() : void 0);
	          }
	          return _results;
	        };
	        subscribeInput = function(subscription) {
	          return subscription.unsub = subscription.input.subscribeInternal(guardedSink(subscription.input));
	        };
	        unsubscribeInput = function(input) {
	          var i,
	              sub,
	              _i,
	              _len;
	          for (i = _i = 0, _len = subscriptions.length; _i < _len; i = ++_i) {
	            sub = subscriptions[i];
	            if (sub.input === input) {
	              if (typeof sub.unsub === "function") {
	                sub.unsub();
	              }
	              subscriptions.splice(i, 1);
	              return;
	            }
	          }
	        };
	        subscribeAll = (function(_this) {
	          return function(newSink) {
	            var subscription,
	                _i,
	                _len,
	                _ref1;
	            sink = newSink;
	            _ref1 = cloneArray(subscriptions);
	            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
	              subscription = _ref1[_i];
	              subscribeInput(subscription);
	            }
	            return unsubAll;
	          };
	        })(this);
	        Bus.__super__.constructor.call(this, describe(Bacon, "Bus"), subscribeAll);
	        this.plug = (function(_this) {
	          return function(input) {
	            var sub;
	            if (ended) {
	              return;
	            }
	            sub = {input: input};
	            subscriptions.push(sub);
	            if ((sink != null)) {
	              subscribeInput(sub);
	            }
	            return function() {
	              return unsubscribeInput(input);
	            };
	          };
	        })(this);
	        this.push = (function(_this) {
	          return function(value) {
	            return typeof sink === "function" ? sink(next(value)) : void 0;
	          };
	        })(this);
	        this.error = (function(_this) {
	          return function(error) {
	            return typeof sink === "function" ? sink(new Error(error)) : void 0;
	          };
	        })(this);
	        this.end = (function(_this) {
	          return function() {
	            ended = true;
	            unsubAll();
	            return typeof sink === "function" ? sink(end()) : void 0;
	          };
	        })(this);
	      }
	      return Bus;
	    })(EventStream);
	    Source = (function() {
	      function Source(obs, sync, subscribe, lazy) {
	        this.obs = obs;
	        this.sync = sync;
	        this.subscribe = subscribe;
	        this.lazy = lazy != null ? lazy : false;
	        this.queue = [];
	        if (this.subscribe == null) {
	          this.subscribe = this.obs.subscribeInternal;
	        }
	        this.toString = this.obs.toString;
	      }
	      Source.prototype.markEnded = function() {
	        return this.ended = true;
	      };
	      Source.prototype.consume = function() {
	        if (this.lazy) {
	          return _.always(this.queue[0]);
	        } else {
	          return this.queue[0];
	        }
	      };
	      Source.prototype.push = function(x) {
	        return this.queue = [x];
	      };
	      Source.prototype.mayHave = function() {
	        return true;
	      };
	      Source.prototype.hasAtLeast = function() {
	        return this.queue.length;
	      };
	      Source.prototype.flatten = true;
	      return Source;
	    })();
	    ConsumingSource = (function(_super) {
	      __extends(ConsumingSource, _super);
	      function ConsumingSource() {
	        return ConsumingSource.__super__.constructor.apply(this, arguments);
	      }
	      ConsumingSource.prototype.consume = function() {
	        return this.queue.shift();
	      };
	      ConsumingSource.prototype.push = function(x) {
	        return this.queue.push(x);
	      };
	      ConsumingSource.prototype.mayHave = function(c) {
	        return !this.ended || this.queue.length >= c;
	      };
	      ConsumingSource.prototype.hasAtLeast = function(c) {
	        return this.queue.length >= c;
	      };
	      ConsumingSource.prototype.flatten = false;
	      return ConsumingSource;
	    })(Source);
	    BufferingSource = (function(_super) {
	      __extends(BufferingSource, _super);
	      function BufferingSource(obs) {
	        this.obs = obs;
	        BufferingSource.__super__.constructor.call(this, this.obs, true, this.obs.subscribeInternal);
	      }
	      BufferingSource.prototype.consume = function() {
	        var values;
	        values = this.queue;
	        this.queue = [];
	        return function() {
	          return values;
	        };
	      };
	      BufferingSource.prototype.push = function(x) {
	        return this.queue.push(x());
	      };
	      BufferingSource.prototype.hasAtLeast = function() {
	        return true;
	      };
	      return BufferingSource;
	    })(Source);
	    Source.isTrigger = function(s) {
	      if (s instanceof Source) {
	        return s.sync;
	      } else {
	        return s instanceof EventStream;
	      }
	    };
	    Source.fromObservable = function(s) {
	      if (s instanceof Source) {
	        return s;
	      } else if (s instanceof Property) {
	        return new Source(s, false);
	      } else {
	        return new ConsumingSource(s, true);
	      }
	    };
	    describe = function() {
	      var args,
	          context,
	          method;
	      context = arguments[0], method = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
	      if ((context || method) instanceof Desc) {
	        return context || method;
	      } else {
	        return new Desc(context, method, args);
	      }
	    };
	    Desc = (function() {
	      function Desc(context, method, args) {
	        var collectDeps,
	            dependsOn,
	            findDeps,
	            flatDeps;
	        findDeps = function(x) {
	          if (isArray(x)) {
	            return _.flatMap(findDeps, x);
	          } else if (isObservable(x)) {
	            return [x];
	          } else if (x instanceof Source) {
	            return [x.obs];
	          } else {
	            return [];
	          }
	        };
	        flatDeps = null;
	        collectDeps = function(o) {
	          var dep,
	              deps,
	              _i,
	              _len,
	              _results;
	          deps = o.internalDeps();
	          _results = [];
	          for (_i = 0, _len = deps.length; _i < _len; _i++) {
	            dep = deps[_i];
	            flatDeps[dep.id] = true;
	            _results.push(collectDeps(dep));
	          }
	          return _results;
	        };
	        dependsOn = function(b) {
	          if (flatDeps == null) {
	            flatDeps = {};
	            collectDeps(this);
	          }
	          return flatDeps[b.id];
	        };
	        this.apply = function(obs) {
	          var deps;
	          deps = _.cached((function() {
	            return findDeps([context].concat(args));
	          }));
	          obs.internalDeps = obs.internalDeps || deps;
	          obs.dependsOn = dependsOn;
	          obs.deps = deps;
	          obs.toString = function() {
	            return _.toString(context) + "." + _.toString(method) + "(" + _.map(_.toString, args) + ")";
	          };
	          obs.inspect = function() {
	            return obs.toString();
	          };
	          obs.desc = function() {
	            return {
	              context: context,
	              method: method,
	              args: args
	            };
	          };
	          return obs;
	        };
	      }
	      return Desc;
	    })();
	    withDescription = function() {
	      var desc,
	          obs,
	          _i;
	      desc = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), obs = arguments[_i++];
	      return describe.apply(null, desc).apply(obs);
	    };
	    Bacon.when = function() {
	      var f,
	          i,
	          index,
	          ix,
	          len,
	          needsBarrier,
	          pat,
	          patSources,
	          pats,
	          patterns,
	          resultStream,
	          s,
	          sources,
	          triggerFound,
	          usage,
	          _i,
	          _j,
	          _len,
	          _len1,
	          _ref1;
	      patterns = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	      if (patterns.length === 0) {
	        return Bacon.never();
	      }
	      len = patterns.length;
	      usage = "when: expecting arguments in the form (Observable+,function)+";
	      assert(usage, len % 2 === 0);
	      sources = [];
	      pats = [];
	      i = 0;
	      while (i < len) {
	        patSources = _.toArray(patterns[i]);
	        f = patterns[i + 1];
	        pat = {
	          f: (isFunction(f) ? f : (function() {
	            return f;
	          })),
	          ixs: []
	        };
	        triggerFound = false;
	        for (_i = 0, _len = patSources.length; _i < _len; _i++) {
	          s = patSources[_i];
	          index = _.indexOf(sources, s);
	          if (!triggerFound) {
	            triggerFound = Source.isTrigger(s);
	          }
	          if (index < 0) {
	            sources.push(s);
	            index = sources.length - 1;
	          }
	          _ref1 = pat.ixs;
	          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
	            ix = _ref1[_j];
	            if (ix.index === index) {
	              ix.count++;
	            }
	          }
	          pat.ixs.push({
	            index: index,
	            count: 1
	          });
	        }
	        assert("At least one EventStream required", triggerFound || (!patSources.length));
	        if (patSources.length > 0) {
	          pats.push(pat);
	        }
	        i = i + 2;
	      }
	      if (!sources.length) {
	        return Bacon.never();
	      }
	      sources = _.map(Source.fromObservable, sources);
	      needsBarrier = (_.any(sources, function(s) {
	        return s.flatten;
	      })) && (containsDuplicateDeps(_.map((function(s) {
	        return s.obs;
	      }), sources)));
	      return resultStream = new EventStream(describe.apply(null, [Bacon, "when"].concat(__slice.call(patterns))), function(sink) {
	        var cannotMatch,
	            cannotSync,
	            ends,
	            match,
	            nonFlattened,
	            part,
	            triggers;
	        triggers = [];
	        ends = false;
	        match = function(p) {
	          var _k,
	              _len2,
	              _ref2;
	          _ref2 = p.ixs;
	          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
	            i = _ref2[_k];
	            if (!sources[i.index].hasAtLeast(i.count)) {
	              return false;
	            }
	          }
	          return true;
	        };
	        cannotSync = function(source) {
	          return !source.sync || source.ended;
	        };
	        cannotMatch = function(p) {
	          var _k,
	              _len2,
	              _ref2;
	          _ref2 = p.ixs;
	          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
	            i = _ref2[_k];
	            if (!sources[i.index].mayHave(i.count)) {
	              return true;
	            }
	          }
	        };
	        nonFlattened = function(trigger) {
	          return !trigger.source.flatten;
	        };
	        part = function(source) {
	          return function(unsubAll) {
	            var flush,
	                flushLater,
	                flushWhileTriggers;
	            flushLater = function() {
	              return UpdateBarrier.whenDoneWith(resultStream, flush);
	            };
	            flushWhileTriggers = function() {
	              var functions,
	                  p,
	                  reply,
	                  trigger,
	                  _k,
	                  _len2;
	              if (triggers.length > 0) {
	                reply = Bacon.more;
	                trigger = triggers.pop();
	                for (_k = 0, _len2 = pats.length; _k < _len2; _k++) {
	                  p = pats[_k];
	                  if (match(p)) {
	                    functions = (function() {
	                      var _l,
	                          _len3,
	                          _ref2,
	                          _results;
	                      _ref2 = p.ixs;
	                      _results = [];
	                      for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
	                        i = _ref2[_l];
	                        _results.push(sources[i.index].consume());
	                      }
	                      return _results;
	                    })();
	                    reply = sink(trigger.e.apply(function() {
	                      var fun,
	                          values;
	                      values = (function() {
	                        var _l,
	                            _len3,
	                            _results;
	                        _results = [];
	                        for (_l = 0, _len3 = functions.length; _l < _len3; _l++) {
	                          fun = functions[_l];
	                          _results.push(fun());
	                        }
	                        return _results;
	                      })();
	                      return p.f.apply(p, values);
	                    }));
	                    if (triggers.length && needsBarrier) {
	                      triggers = _.filter(nonFlattened, triggers);
	                    }
	                    if (reply === Bacon.noMore) {
	                      return reply;
	                    } else {
	                      return flushWhileTriggers();
	                    }
	                  }
	                }
	              } else {
	                return Bacon.more;
	              }
	            };
	            flush = function() {
	              var reply;
	              reply = flushWhileTriggers();
	              if (ends) {
	                ends = false;
	                if (_.all(sources, cannotSync) || _.all(pats, cannotMatch)) {
	                  reply = Bacon.noMore;
	                  sink(end());
	                }
	              }
	              if (reply === Bacon.noMore) {
	                unsubAll();
	              }
	              return reply;
	            };
	            return source.subscribe(function(e) {
	              var reply;
	              if (e.isEnd()) {
	                ends = true;
	                source.markEnded();
	                flushLater();
	              } else if (e.isError()) {
	                reply = sink(e);
	              } else {
	                source.push(e.value);
	                if (source.sync) {
	                  triggers.push({
	                    source: source,
	                    e: e
	                  });
	                  if (needsBarrier) {
	                    flushLater();
	                  } else {
	                    flush();
	                  }
	                }
	              }
	              if (reply === Bacon.noMore) {
	                unsubAll();
	              }
	              return reply || Bacon.more;
	            });
	          };
	        };
	        return compositeUnsubscribe.apply(null, (function() {
	          var _k,
	              _len2,
	              _results;
	          _results = [];
	          for (_k = 0, _len2 = sources.length; _k < _len2; _k++) {
	            s = sources[_k];
	            _results.push(part(s));
	          }
	          return _results;
	        })());
	      });
	    };
	    containsDuplicateDeps = function(observables, state) {
	      var checkObservable;
	      if (state == null) {
	        state = [];
	      }
	      checkObservable = function(obs) {
	        var deps;
	        if (Bacon._.contains(state, obs)) {
	          return true;
	        } else {
	          deps = obs.internalDeps();
	          if (deps.length) {
	            state.push(obs);
	            return Bacon._.any(deps, checkObservable);
	          } else {
	            state.push(obs);
	            return false;
	          }
	        }
	      };
	      return Bacon._.any(observables, checkObservable);
	    };
	    Bacon.update = function() {
	      var i,
	          initial,
	          lateBindFirst,
	          patterns;
	      initial = arguments[0], patterns = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	      lateBindFirst = function(f) {
	        return function() {
	          var args;
	          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	          return function(i) {
	            return f.apply(null, [i].concat(args));
	          };
	        };
	      };
	      i = patterns.length - 1;
	      while (i > 0) {
	        if (!(patterns[i] instanceof Function)) {
	          patterns[i] = (function(x) {
	            return function() {
	              return x;
	            };
	          })(patterns[i]);
	        }
	        patterns[i] = lateBindFirst(patterns[i]);
	        i = i - 2;
	      }
	      return withDescription.apply(null, [Bacon, "update", initial].concat(__slice.call(patterns), [Bacon.when.apply(Bacon, patterns).scan(initial, (function(x, f) {
	        return f(x);
	      }))]));
	    };
	    compositeUnsubscribe = function() {
	      var ss;
	      ss = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	      return new CompositeUnsubscribe(ss).unsubscribe;
	    };
	    CompositeUnsubscribe = (function() {
	      function CompositeUnsubscribe(ss) {
	        var s,
	            _i,
	            _len;
	        if (ss == null) {
	          ss = [];
	        }
	        this.unsubscribe = __bind(this.unsubscribe, this);
	        this.unsubscribed = false;
	        this.subscriptions = [];
	        this.starting = [];
	        for (_i = 0, _len = ss.length; _i < _len; _i++) {
	          s = ss[_i];
	          this.add(s);
	        }
	      }
	      CompositeUnsubscribe.prototype.add = function(subscription) {
	        var ended,
	            unsub,
	            unsubMe;
	        if (this.unsubscribed) {
	          return;
	        }
	        ended = false;
	        unsub = nop;
	        this.starting.push(subscription);
	        unsubMe = (function(_this) {
	          return function() {
	            if (_this.unsubscribed) {
	              return;
	            }
	            ended = true;
	            _this.remove(unsub);
	            return _.remove(subscription, _this.starting);
	          };
	        })(this);
	        unsub = subscription(this.unsubscribe, unsubMe);
	        if (!(this.unsubscribed || ended)) {
	          this.subscriptions.push(unsub);
	        }
	        _.remove(subscription, this.starting);
	        return unsub;
	      };
	      CompositeUnsubscribe.prototype.remove = function(unsub) {
	        if (this.unsubscribed) {
	          return;
	        }
	        if ((_.remove(unsub, this.subscriptions)) !== void 0) {
	          return unsub();
	        }
	      };
	      CompositeUnsubscribe.prototype.unsubscribe = function() {
	        var s,
	            _i,
	            _len,
	            _ref1;
	        if (this.unsubscribed) {
	          return;
	        }
	        this.unsubscribed = true;
	        _ref1 = this.subscriptions;
	        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
	          s = _ref1[_i];
	          s();
	        }
	        this.subscriptions = [];
	        return this.starting = [];
	      };
	      CompositeUnsubscribe.prototype.count = function() {
	        if (this.unsubscribed) {
	          return 0;
	        }
	        return this.subscriptions.length + this.starting.length;
	      };
	      CompositeUnsubscribe.prototype.empty = function() {
	        return this.count() === 0;
	      };
	      return CompositeUnsubscribe;
	    })();
	    Bacon.CompositeUnsubscribe = CompositeUnsubscribe;
	    Some = (function() {
	      function Some(value) {
	        this.value = value;
	      }
	      Some.prototype.getOrElse = function() {
	        return this.value;
	      };
	      Some.prototype.get = function() {
	        return this.value;
	      };
	      Some.prototype.filter = function(f) {
	        if (f(this.value)) {
	          return new Some(this.value);
	        } else {
	          return None;
	        }
	      };
	      Some.prototype.map = function(f) {
	        return new Some(f(this.value));
	      };
	      Some.prototype.forEach = function(f) {
	        return f(this.value);
	      };
	      Some.prototype.isDefined = true;
	      Some.prototype.toArray = function() {
	        return [this.value];
	      };
	      Some.prototype.inspect = function() {
	        return "Some(" + this.value + ")";
	      };
	      Some.prototype.toString = function() {
	        return this.inspect();
	      };
	      return Some;
	    })();
	    None = {
	      getOrElse: function(value) {
	        return value;
	      },
	      filter: function() {
	        return None;
	      },
	      map: function() {
	        return None;
	      },
	      forEach: function() {},
	      isDefined: false,
	      toArray: function() {
	        return [];
	      },
	      inspect: function() {
	        return "None";
	      },
	      toString: function() {
	        return this.inspect();
	      }
	    };
	    UpdateBarrier = (function() {
	      var afterTransaction,
	          afters,
	          currentEventId,
	          findIndependent,
	          flush,
	          inTransaction,
	          independent,
	          rootEvent,
	          waiters,
	          whenDoneWith,
	          wrappedSubscribe;
	      rootEvent = void 0;
	      waiters = [];
	      afters = [];
	      afterTransaction = function(f) {
	        if (rootEvent) {
	          return afters.push(f);
	        } else {
	          return f();
	        }
	      };
	      independent = function(waiter) {
	        return !_.any(waiters, (function(other) {
	          return waiter.obs.dependsOn(other.obs);
	        }));
	      };
	      whenDoneWith = function(obs, f) {
	        if (rootEvent) {
	          return waiters.push({
	            obs: obs,
	            f: f
	          });
	        } else {
	          return f();
	        }
	      };
	      findIndependent = function() {
	        while (!independent(waiters[0])) {
	          waiters.push(_.popHead(waiters));
	        }
	        return _.popHead(waiters);
	      };
	      flush = function() {
	        var _results;
	        _results = [];
	        while (waiters.length) {
	          _results.push(findIndependent().f());
	        }
	        return _results;
	      };
	      inTransaction = function(event, context, f, args) {
	        var result;
	        if (rootEvent) {
	          return f.apply(context, args);
	        } else {
	          rootEvent = event;
	          try {
	            result = f.apply(context, args);
	            flush();
	          } finally {
	            rootEvent = void 0;
	            while (afters.length) {
	              f = afters.splice(0, 1)[0];
	              f();
	            }
	          }
	          return result;
	        }
	      };
	      currentEventId = function() {
	        if (rootEvent) {
	          return rootEvent.id;
	        } else {
	          return void 0;
	        }
	      };
	      wrappedSubscribe = function(obs) {
	        return function(sink) {
	          var doUnsub,
	              unsub,
	              unsubd;
	          unsubd = false;
	          doUnsub = function() {};
	          unsub = function() {
	            unsubd = true;
	            return doUnsub();
	          };
	          if (!unsubd) {
	            doUnsub = obs.subscribeInternal(function(event) {
	              return afterTransaction(function() {
	                var reply;
	                if (!unsubd) {
	                  reply = sink(event);
	                  if (reply === Bacon.noMore) {
	                    return unsub();
	                  }
	                }
	              });
	            });
	          }
	          return unsub;
	        };
	      };
	      return {
	        whenDoneWith: whenDoneWith,
	        inTransaction: inTransaction,
	        currentEventId: currentEventId,
	        wrappedSubscribe: wrappedSubscribe
	      };
	    })();
	    Bacon.EventStream = EventStream;
	    Bacon.Property = Property;
	    Bacon.Observable = Observable;
	    Bacon.Bus = Bus;
	    Bacon.Initial = Initial;
	    Bacon.Next = Next;
	    Bacon.End = End;
	    Bacon.Error = Error;
	    nop = function() {};
	    latterF = function(_, x) {
	      return x();
	    };
	    former = function(x, _) {
	      return x;
	    };
	    initial = function(value) {
	      return new Initial(_.always(value));
	    };
	    next = function(value) {
	      return new Next(_.always(value));
	    };
	    end = function() {
	      return new End();
	    };
	    toEvent = function(x) {
	      if (x instanceof Event) {
	        return x;
	      } else {
	        return next(x);
	      }
	    };
	    cloneArray = function(xs) {
	      return xs.slice(0);
	    };
	    assert = function(message, condition) {
	      if (!condition) {
	        throw message;
	      }
	    };
	    assertEventStream = function(event) {
	      if (!(event instanceof EventStream)) {
	        throw "not an EventStream : " + event;
	      }
	    };
	    assertFunction = function(f) {
	      return assert("not a function : " + f, isFunction(f));
	    };
	    isFunction = function(f) {
	      return typeof f === "function";
	    };
	    isArray = function(xs) {
	      return xs instanceof Array;
	    };
	    isObservable = function(x) {
	      return x instanceof Observable;
	    };
	    assertArray = function(xs) {
	      if (!isArray(xs)) {
	        throw "not an array : " + xs;
	      }
	    };
	    assertNoArguments = function(args) {
	      return assert("no arguments supported", args.length === 0);
	    };
	    assertString = function(x) {
	      if (typeof x !== "string") {
	        throw "not a string : " + x;
	      }
	    };
	    partiallyApplied = function(f, applied) {
	      return function() {
	        var args;
	        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	        return f.apply(null, applied.concat(args));
	      };
	    };
	    makeSpawner = function(args) {
	      if (args.length === 1 && isObservable(args[0])) {
	        return _.always(args[0]);
	      } else {
	        return makeFunctionArgs(args);
	      }
	    };
	    makeFunctionArgs = function(args) {
	      args = Array.prototype.slice.call(args);
	      return makeFunction_.apply(null, args);
	    };
	    makeFunction_ = withMethodCallSupport(function() {
	      var args,
	          f;
	      f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	      if (isFunction(f)) {
	        if (args.length) {
	          return partiallyApplied(f, args);
	        } else {
	          return f;
	        }
	      } else if (isFieldKey(f)) {
	        return toFieldExtractor(f, args);
	      } else {
	        return _.always(f);
	      }
	    });
	    makeFunction = function(f, args) {
	      return makeFunction_.apply(null, [f].concat(__slice.call(args)));
	    };
	    makeObservable = function(x) {
	      if (isObservable(x)) {
	        return x;
	      } else {
	        return Bacon.once(x);
	      }
	    };
	    isFieldKey = function(f) {
	      return (typeof f === "string") && f.length > 1 && f.charAt(0) === ".";
	    };
	    Bacon.isFieldKey = isFieldKey;
	    toFieldExtractor = function(f, args) {
	      var partFuncs,
	          parts;
	      parts = f.slice(1).split(".");
	      partFuncs = _.map(toSimpleExtractor(args), parts);
	      return function(value) {
	        var _i,
	            _len;
	        for (_i = 0, _len = partFuncs.length; _i < _len; _i++) {
	          f = partFuncs[_i];
	          value = f(value);
	        }
	        return value;
	      };
	    };
	    toSimpleExtractor = function(args) {
	      return function(key) {
	        return function(value) {
	          var fieldValue;
	          if (value == null) {
	            return void 0;
	          } else {
	            fieldValue = value[key];
	            if (isFunction(fieldValue)) {
	              return fieldValue.apply(value, args);
	            } else {
	              return fieldValue;
	            }
	          }
	        };
	      };
	    };
	    toFieldKey = function(f) {
	      return f.slice(1);
	    };
	    toCombinator = function(f) {
	      var key;
	      if (isFunction(f)) {
	        return f;
	      } else if (isFieldKey(f)) {
	        key = toFieldKey(f);
	        return function(left, right) {
	          return left[key](right);
	        };
	      } else {
	        return assert("not a function or a field key: " + f, false);
	      }
	    };
	    toOption = function(v) {
	      if (v instanceof Some || v === None) {
	        return v;
	      } else {
	        return new Some(v);
	      }
	    };
	    _ = {
	      indexOf: Array.prototype.indexOf ? function(xs, x) {
	        return xs.indexOf(x);
	      } : function(xs, x) {
	        var i,
	            y,
	            _i,
	            _len;
	        for (i = _i = 0, _len = xs.length; _i < _len; i = ++_i) {
	          y = xs[i];
	          if (x === y) {
	            return i;
	          }
	        }
	        return -1;
	      },
	      indexWhere: function(xs, f) {
	        var i,
	            y,
	            _i,
	            _len;
	        for (i = _i = 0, _len = xs.length; _i < _len; i = ++_i) {
	          y = xs[i];
	          if (f(y)) {
	            return i;
	          }
	        }
	        return -1;
	      },
	      head: function(xs) {
	        return xs[0];
	      },
	      always: function(x) {
	        return function() {
	          return x;
	        };
	      },
	      negate: function(f) {
	        return function(x) {
	          return !f(x);
	        };
	      },
	      empty: function(xs) {
	        return xs.length === 0;
	      },
	      tail: function(xs) {
	        return xs.slice(1, xs.length);
	      },
	      filter: function(f, xs) {
	        var filtered,
	            x,
	            _i,
	            _len;
	        filtered = [];
	        for (_i = 0, _len = xs.length; _i < _len; _i++) {
	          x = xs[_i];
	          if (f(x)) {
	            filtered.push(x);
	          }
	        }
	        return filtered;
	      },
	      map: function(f, xs) {
	        var x,
	            _i,
	            _len,
	            _results;
	        _results = [];
	        for (_i = 0, _len = xs.length; _i < _len; _i++) {
	          x = xs[_i];
	          _results.push(f(x));
	        }
	        return _results;
	      },
	      each: function(xs, f) {
	        var key,
	            value,
	            _results;
	        _results = [];
	        for (key in xs) {
	          value = xs[key];
	          _results.push(f(key, value));
	        }
	        return _results;
	      },
	      toArray: function(xs) {
	        if (isArray(xs)) {
	          return xs;
	        } else {
	          return [xs];
	        }
	      },
	      contains: function(xs, x) {
	        return _.indexOf(xs, x) !== -1;
	      },
	      id: function(x) {
	        return x;
	      },
	      last: function(xs) {
	        return xs[xs.length - 1];
	      },
	      all: function(xs, f) {
	        var x,
	            _i,
	            _len;
	        if (f == null) {
	          f = _.id;
	        }
	        for (_i = 0, _len = xs.length; _i < _len; _i++) {
	          x = xs[_i];
	          if (!f(x)) {
	            return false;
	          }
	        }
	        return true;
	      },
	      any: function(xs, f) {
	        var x,
	            _i,
	            _len;
	        if (f == null) {
	          f = _.id;
	        }
	        for (_i = 0, _len = xs.length; _i < _len; _i++) {
	          x = xs[_i];
	          if (f(x)) {
	            return true;
	          }
	        }
	        return false;
	      },
	      without: function(x, xs) {
	        return _.filter((function(y) {
	          return y !== x;
	        }), xs);
	      },
	      remove: function(x, xs) {
	        var i;
	        i = _.indexOf(xs, x);
	        if (i >= 0) {
	          return xs.splice(i, 1);
	        }
	      },
	      popHead: function(xs) {
	        return xs.splice(0, 1)[0];
	      },
	      fold: function(xs, seed, f) {
	        var x,
	            _i,
	            _len;
	        for (_i = 0, _len = xs.length; _i < _len; _i++) {
	          x = xs[_i];
	          seed = f(seed, x);
	        }
	        return seed;
	      },
	      flatMap: function(f, xs) {
	        return _.fold(xs, [], (function(ys, x) {
	          return ys.concat(f(x));
	        }));
	      },
	      cached: function(f) {
	        var value;
	        value = None;
	        return function() {
	          if (value === None) {
	            value = f();
	            f = null;
	          }
	          return value;
	        };
	      },
	      toString: function(obj) {
	        var ex,
	            internals,
	            key,
	            value;
	        try {
	          recursionDepth++;
	          if (obj == null) {
	            return "undefined";
	          } else if (isFunction(obj)) {
	            return "function";
	          } else if (isArray(obj)) {
	            if (recursionDepth > 5) {
	              return "[..]";
	            }
	            return "[" + _.map(_.toString, obj).toString() + "]";
	          } else if (((obj != null ? obj.toString : void 0) != null) && obj.toString !== Object.prototype.toString) {
	            return obj.toString();
	          } else if (typeof obj === "object") {
	            if (recursionDepth > 5) {
	              return "{..}";
	            }
	            internals = (function() {
	              var _results;
	              _results = [];
	              for (key in obj) {
	                if (!__hasProp.call(obj, key))
	                  continue;
	                value = (function() {
	                  try {
	                    return obj[key];
	                  } catch (_error) {
	                    ex = _error;
	                    return ex;
	                  }
	                })();
	                _results.push(_.toString(key) + ":" + _.toString(value));
	              }
	              return _results;
	            })();
	            return "{" + internals + "}";
	          } else {
	            return obj;
	          }
	        } finally {
	          recursionDepth--;
	        }
	      }
	    };
	    recursionDepth = 0;
	    Bacon._ = _;
	    Bacon.scheduler = {
	      setTimeout: function(f, d) {
	        return setTimeout(f, d);
	      },
	      setInterval: function(f, i) {
	        return setInterval(f, i);
	      },
	      clearInterval: function(id) {
	        return clearInterval(id);
	      },
	      now: function() {
	        return new Date().getTime();
	      }
	    };
	    if (('function' !== "undefined" && __webpack_require__(7) !== null) && (__webpack_require__(8) != null)) {
	      !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() {
	        return Bacon;
	      }.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	      this.Bacon = Bacon;
	    } else if (typeof module !== "undefined" && module !== null) {
	      module.exports = Bacon;
	      Bacon.Bacon = Bacon;
	    } else {
	      this.Bacon = Bacon;
	    }
	  }).call(this);
	  return {};
	}.call(typeof global !== 'undefined' ? global : this);
	
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)(module), (function() { return this; }())))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function() {
	  "use strict";
	  var __moduleName = "node_modules/jquery/dist/jquery";
	  (function(global, factory) {
	    if (typeof module === "object" && typeof module.exports === "object") {
	      module.exports = global.document ? factory(global, true) : function(w) {
	        if (!w.document) {
	          throw new Error("jQuery requires a window with a document");
	        }
	        return factory(w);
	      };
	    } else {
	      factory(global);
	    }
	  }(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
	    var arr = [];
	    var slice = arr.slice;
	    var concat = arr.concat;
	    var push = arr.push;
	    var indexOf = arr.indexOf;
	    var class2type = {};
	    var toString = class2type.toString;
	    var hasOwn = class2type.hasOwnProperty;
	    var support = {};
	    var document = window.document,
	        version = "2.1.1",
	        jQuery = function(selector, context) {
	          return new jQuery.fn.init(selector, context);
	        },
	        rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
	        rmsPrefix = /^-ms-/,
	        rdashAlpha = /-([\da-z])/gi,
	        fcamelCase = function(all, letter) {
	          return letter.toUpperCase();
	        };
	    jQuery.fn = jQuery.prototype = {
	      jquery: version,
	      constructor: jQuery,
	      selector: "",
	      length: 0,
	      toArray: function() {
	        return slice.call(this);
	      },
	      get: function(num) {
	        return num != null ? (num < 0 ? this[num + this.length] : this[num]) : slice.call(this);
	      },
	      pushStack: function(elems) {
	        var ret = jQuery.merge(this.constructor(), elems);
	        ret.prevObject = this;
	        ret.context = this.context;
	        return ret;
	      },
	      each: function(callback, args) {
	        return jQuery.each(this, callback, args);
	      },
	      map: function(callback) {
	        return this.pushStack(jQuery.map(this, function(elem, i) {
	          return callback.call(elem, i, elem);
	        }));
	      },
	      slice: function() {
	        return this.pushStack(slice.apply(this, arguments));
	      },
	      first: function() {
	        return this.eq(0);
	      },
	      last: function() {
	        return this.eq(-1);
	      },
	      eq: function(i) {
	        var len = this.length,
	            j = +i + (i < 0 ? len : 0);
	        return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
	      },
	      end: function() {
	        return this.prevObject || this.constructor(null);
	      },
	      push: push,
	      sort: arr.sort,
	      splice: arr.splice
	    };
	    jQuery.extend = jQuery.fn.extend = function() {
	      var options,
	          name,
	          src,
	          copy,
	          copyIsArray,
	          clone,
	          target = arguments[0] || {},
	          i = 1,
	          length = arguments.length,
	          deep = false;
	      if (typeof target === "boolean") {
	        deep = target;
	        target = arguments[i] || {};
	        i++;
	      }
	      if (typeof target !== "object" && !jQuery.isFunction(target)) {
	        target = {};
	      }
	      if (i === length) {
	        target = this;
	        i--;
	      }
	      for (; i < length; i++) {
	        if ((options = arguments[i]) != null) {
	          for (name in options) {
	            src = target[name];
	            copy = options[name];
	            if (target === copy) {
	              continue;
	            }
	            if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
	              if (copyIsArray) {
	                copyIsArray = false;
	                clone = src && jQuery.isArray(src) ? src : [];
	              } else {
	                clone = src && jQuery.isPlainObject(src) ? src : {};
	              }
	              target[name] = jQuery.extend(deep, clone, copy);
	            } else if (copy !== undefined) {
	              target[name] = copy;
	            }
	          }
	        }
	      }
	      return target;
	    };
	    jQuery.extend({
	      expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),
	      isReady: true,
	      error: function(msg) {
	        throw new Error(msg);
	      },
	      noop: function() {},
	      isFunction: function(obj) {
	        return jQuery.type(obj) === "function";
	      },
	      isArray: Array.isArray,
	      isWindow: function(obj) {
	        return obj != null && obj === obj.window;
	      },
	      isNumeric: function(obj) {
	        return !jQuery.isArray(obj) && obj - parseFloat(obj) >= 0;
	      },
	      isPlainObject: function(obj) {
	        if (jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
	          return false;
	        }
	        if (obj.constructor && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
	          return false;
	        }
	        return true;
	      },
	      isEmptyObject: function(obj) {
	        var name;
	        for (name in obj) {
	          return false;
	        }
	        return true;
	      },
	      type: function(obj) {
	        if (obj == null) {
	          return obj + "";
	        }
	        return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj;
	      },
	      globalEval: function(code) {
	        var script,
	            indirect = eval;
	        code = jQuery.trim(code);
	        if (code) {
	          if (code.indexOf("use strict") === 1) {
	            script = document.createElement("script");
	            script.text = code;
	            document.head.appendChild(script).parentNode.removeChild(script);
	          } else {
	            indirect(code);
	          }
	        }
	      },
	      camelCase: function(string) {
	        return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
	      },
	      nodeName: function(elem, name) {
	        return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	      },
	      each: function(obj, callback, args) {
	        var value,
	            i = 0,
	            length = obj.length,
	            isArray = isArraylike(obj);
	        if (args) {
	          if (isArray) {
	            for (; i < length; i++) {
	              value = callback.apply(obj[i], args);
	              if (value === false) {
	                break;
	              }
	            }
	          } else {
	            for (i in obj) {
	              value = callback.apply(obj[i], args);
	              if (value === false) {
	                break;
	              }
	            }
	          }
	        } else {
	          if (isArray) {
	            for (; i < length; i++) {
	              value = callback.call(obj[i], i, obj[i]);
	              if (value === false) {
	                break;
	              }
	            }
	          } else {
	            for (i in obj) {
	              value = callback.call(obj[i], i, obj[i]);
	              if (value === false) {
	                break;
	              }
	            }
	          }
	        }
	        return obj;
	      },
	      trim: function(text) {
	        return text == null ? "" : (text + "").replace(rtrim, "");
	      },
	      makeArray: function(arr, results) {
	        var ret = results || [];
	        if (arr != null) {
	          if (isArraylike(Object(arr))) {
	            jQuery.merge(ret, typeof arr === "string" ? [arr] : arr);
	          } else {
	            push.call(ret, arr);
	          }
	        }
	        return ret;
	      },
	      inArray: function(elem, arr, i) {
	        return arr == null ? -1 : indexOf.call(arr, elem, i);
	      },
	      merge: function(first, second) {
	        var len = +second.length,
	            j = 0,
	            i = first.length;
	        for (; j < len; j++) {
	          first[i++] = second[j];
	        }
	        first.length = i;
	        return first;
	      },
	      grep: function(elems, callback, invert) {
	        var callbackInverse,
	            matches = [],
	            i = 0,
	            length = elems.length,
	            callbackExpect = !invert;
	        for (; i < length; i++) {
	          callbackInverse = !callback(elems[i], i);
	          if (callbackInverse !== callbackExpect) {
	            matches.push(elems[i]);
	          }
	        }
	        return matches;
	      },
	      map: function(elems, callback, arg) {
	        var value,
	            i = 0,
	            length = elems.length,
	            isArray = isArraylike(elems),
	            ret = [];
	        if (isArray) {
	          for (; i < length; i++) {
	            value = callback(elems[i], i, arg);
	            if (value != null) {
	              ret.push(value);
	            }
	          }
	        } else {
	          for (i in elems) {
	            value = callback(elems[i], i, arg);
	            if (value != null) {
	              ret.push(value);
	            }
	          }
	        }
	        return concat.apply([], ret);
	      },
	      guid: 1,
	      proxy: function(fn, context) {
	        var tmp,
	            args,
	            proxy;
	        if (typeof context === "string") {
	          tmp = fn[context];
	          context = fn;
	          fn = tmp;
	        }
	        if (!jQuery.isFunction(fn)) {
	          return undefined;
	        }
	        args = slice.call(arguments, 2);
	        proxy = function() {
	          return fn.apply(context || this, args.concat(slice.call(arguments)));
	        };
	        proxy.guid = fn.guid = fn.guid || jQuery.guid++;
	        return proxy;
	      },
	      now: Date.now,
	      support: support
	    });
	    jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	      class2type["[object " + name + "]"] = name.toLowerCase();
	    });
	    function isArraylike(obj) {
	      var length = obj.length,
	          type = jQuery.type(obj);
	      if (type === "function" || jQuery.isWindow(obj)) {
	        return false;
	      }
	      if (obj.nodeType === 1 && length) {
	        return true;
	      }
	      return type === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
	    }
	    var Sizzle = (function(window) {
	      var i,
	          support,
	          Expr,
	          getText,
	          isXML,
	          tokenize,
	          compile,
	          select,
	          outermostContext,
	          sortInput,
	          hasDuplicate,
	          setDocument,
	          document,
	          docElem,
	          documentIsHTML,
	          rbuggyQSA,
	          rbuggyMatches,
	          matches,
	          contains,
	          expando = "sizzle" + -(new Date()),
	          preferredDoc = window.document,
	          dirruns = 0,
	          done = 0,
	          classCache = createCache(),
	          tokenCache = createCache(),
	          compilerCache = createCache(),
	          sortOrder = function(a, b) {
	            if (a === b) {
	              hasDuplicate = true;
	            }
	            return 0;
	          },
	          strundefined = typeof undefined,
	          MAX_NEGATIVE = 1 << 31,
	          hasOwn = ({}).hasOwnProperty,
	          arr = [],
	          pop = arr.pop,
	          push_native = arr.push,
	          push = arr.push,
	          slice = arr.slice,
	          indexOf = arr.indexOf || function(elem) {
	            var i = 0,
	                len = this.length;
	            for (; i < len; i++) {
	              if (this[i] === elem) {
	                return i;
	              }
	            }
	            return -1;
	          },
	          booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
	          whitespace = "[\\x20\\t\\r\\n\\f]",
	          characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
	          identifier = characterEncoding.replace("w", "w#"),
	          attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace + "*([*^$|!~]?=)" + whitespace + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace + "*\\]",
	          pseudos = ":(" + characterEncoding + ")(?:\\((" + "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" + "((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" + ".*" + ")\\)|)",
	          rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),
	          rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
	          rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),
	          rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"),
	          rpseudo = new RegExp(pseudos),
	          ridentifier = new RegExp("^" + identifier + "$"),
	          matchExpr = {
	            "ID": new RegExp("^#(" + characterEncoding + ")"),
	            "CLASS": new RegExp("^\\.(" + characterEncoding + ")"),
	            "TAG": new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
	            "ATTR": new RegExp("^" + attributes),
	            "PSEUDO": new RegExp("^" + pseudos),
	            "CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
	            "bool": new RegExp("^(?:" + booleans + ")$", "i"),
	            "needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
	          },
	          rinputs = /^(?:input|select|textarea|button)$/i,
	          rheader = /^h\d$/i,
	          rnative = /^[^{]+\{\s*\[native \w/,
	          rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
	          rsibling = /[+~]/,
	          rescape = /'|\\/g,
	          runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),
	          funescape = function(_, escaped, escapedWhitespace) {
	            var high = "0x" + escaped - 0x10000;
	            return high !== high || escapedWhitespace ? escaped : high < 0 ? String.fromCharCode(high + 0x10000) : String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
	          };
	      try {
	        push.apply((arr = slice.call(preferredDoc.childNodes)), preferredDoc.childNodes);
	        arr[preferredDoc.childNodes.length].nodeType;
	      } catch (e) {
	        push = {apply: arr.length ? function(target, els) {
	            push_native.apply(target, slice.call(els));
	          } : function(target, els) {
	            var j = target.length,
	                i = 0;
	            while ((target[j++] = els[i++])) {}
	            target.length = j - 1;
	          }};
	      }
	      function Sizzle(selector, context, results, seed) {
	        var match,
	            elem,
	            m,
	            nodeType,
	            i,
	            groups,
	            old,
	            nid,
	            newContext,
	            newSelector;
	        if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
	          setDocument(context);
	        }
	        context = context || document;
	        results = results || [];
	        if (!selector || typeof selector !== "string") {
	          return results;
	        }
	        if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
	          return [];
	        }
	        if (documentIsHTML && !seed) {
	          if ((match = rquickExpr.exec(selector))) {
	            if ((m = match[1])) {
	              if (nodeType === 9) {
	                elem = context.getElementById(m);
	                if (elem && elem.parentNode) {
	                  if (elem.id === m) {
	                    results.push(elem);
	                    return results;
	                  }
	                } else {
	                  return results;
	                }
	              } else {
	                if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) && contains(context, elem) && elem.id === m) {
	                  results.push(elem);
	                  return results;
	                }
	              }
	            } else if (match[2]) {
	              push.apply(results, context.getElementsByTagName(selector));
	              return results;
	            } else if ((m = match[3]) && support.getElementsByClassName && context.getElementsByClassName) {
	              push.apply(results, context.getElementsByClassName(m));
	              return results;
	            }
	          }
	          if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
	            nid = old = expando;
	            newContext = context;
	            newSelector = nodeType === 9 && selector;
	            if (nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
	              groups = tokenize(selector);
	              if ((old = context.getAttribute("id"))) {
	                nid = old.replace(rescape, "\\$&");
	              } else {
	                context.setAttribute("id", nid);
	              }
	              nid = "[id='" + nid + "'] ";
	              i = groups.length;
	              while (i--) {
	                groups[i] = nid + toSelector(groups[i]);
	              }
	              newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
	              newSelector = groups.join(",");
	            }
	            if (newSelector) {
	              try {
	                push.apply(results, newContext.querySelectorAll(newSelector));
	                return results;
	              } catch (qsaError) {} finally {
	                if (!old) {
	                  context.removeAttribute("id");
	                }
	              }
	            }
	          }
	        }
	        return select(selector.replace(rtrim, "$1"), context, results, seed);
	      }
	      function createCache() {
	        var keys = [];
	        function cache(key, value) {
	          if (keys.push(key + " ") > Expr.cacheLength) {
	            delete cache[keys.shift()];
	          }
	          return (cache[key + " "] = value);
	        }
	        return cache;
	      }
	      function markFunction(fn) {
	        fn[expando] = true;
	        return fn;
	      }
	      function assert(fn) {
	        var div = document.createElement("div");
	        try {
	          return !!fn(div);
	        } catch (e) {
	          return false;
	        } finally {
	          if (div.parentNode) {
	            div.parentNode.removeChild(div);
	          }
	          div = null;
	        }
	      }
	      function addHandle(attrs, handler) {
	        var arr = attrs.split("|"),
	            i = attrs.length;
	        while (i--) {
	          Expr.attrHandle[arr[i]] = handler;
	        }
	      }
	      function siblingCheck(a, b) {
	        var cur = b && a,
	            diff = cur && a.nodeType === 1 && b.nodeType === 1 && (~b.sourceIndex || MAX_NEGATIVE) - (~a.sourceIndex || MAX_NEGATIVE);
	        if (diff) {
	          return diff;
	        }
	        if (cur) {
	          while ((cur = cur.nextSibling)) {
	            if (cur === b) {
	              return -1;
	            }
	          }
	        }
	        return a ? 1 : -1;
	      }
	      function createInputPseudo(type) {
	        return function(elem) {
	          var name = elem.nodeName.toLowerCase();
	          return name === "input" && elem.type === type;
	        };
	      }
	      function createButtonPseudo(type) {
	        return function(elem) {
	          var name = elem.nodeName.toLowerCase();
	          return (name === "input" || name === "button") && elem.type === type;
	        };
	      }
	      function createPositionalPseudo(fn) {
	        return markFunction(function(argument) {
	          argument = +argument;
	          return markFunction(function(seed, matches) {
	            var j,
	                matchIndexes = fn([], seed.length, argument),
	                i = matchIndexes.length;
	            while (i--) {
	              if (seed[(j = matchIndexes[i])]) {
	                seed[j] = !(matches[j] = seed[j]);
	              }
	            }
	          });
	        });
	      }
	      function testContext(context) {
	        return context && typeof context.getElementsByTagName !== strundefined && context;
	      }
	      support = Sizzle.support = {};
	      isXML = Sizzle.isXML = function(elem) {
	        var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	        return documentElement ? documentElement.nodeName !== "HTML" : false;
	      };
	      setDocument = Sizzle.setDocument = function(node) {
	        var hasCompare,
	            doc = node ? node.ownerDocument || node : preferredDoc,
	            parent = doc.defaultView;
	        if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
	          return document;
	        }
	        document = doc;
	        docElem = doc.documentElement;
	        documentIsHTML = !isXML(doc);
	        if (parent && parent !== parent.top) {
	          if (parent.addEventListener) {
	            parent.addEventListener("unload", function() {
	              setDocument();
	            }, false);
	          } else if (parent.attachEvent) {
	            parent.attachEvent("onunload", function() {
	              setDocument();
	            });
	          }
	        }
	        support.attributes = assert(function(div) {
	          div.className = "i";
	          return !div.getAttribute("className");
	        });
	        support.getElementsByTagName = assert(function(div) {
	          div.appendChild(doc.createComment(""));
	          return !div.getElementsByTagName("*").length;
	        });
	        support.getElementsByClassName = rnative.test(doc.getElementsByClassName) && assert(function(div) {
	          div.innerHTML = "<div class='a'></div><div class='a i'></div>";
	          div.firstChild.className = "i";
	          return div.getElementsByClassName("i").length === 2;
	        });
	        support.getById = assert(function(div) {
	          docElem.appendChild(div).id = expando;
	          return !doc.getElementsByName || !doc.getElementsByName(expando).length;
	        });
	        if (support.getById) {
	          Expr.find["ID"] = function(id, context) {
	            if (typeof context.getElementById !== strundefined && documentIsHTML) {
	              var m = context.getElementById(id);
	              return m && m.parentNode ? [m] : [];
	            }
	          };
	          Expr.filter["ID"] = function(id) {
	            var attrId = id.replace(runescape, funescape);
	            return function(elem) {
	              return elem.getAttribute("id") === attrId;
	            };
	          };
	        } else {
	          delete Expr.find["ID"];
	          Expr.filter["ID"] = function(id) {
	            var attrId = id.replace(runescape, funescape);
	            return function(elem) {
	              var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
	              return node && node.value === attrId;
	            };
	          };
	        }
	        Expr.find["TAG"] = support.getElementsByTagName ? function(tag, context) {
	          if (typeof context.getElementsByTagName !== strundefined) {
	            return context.getElementsByTagName(tag);
	          }
	        } : function(tag, context) {
	          var elem,
	              tmp = [],
	              i = 0,
	              results = context.getElementsByTagName(tag);
	          if (tag === "*") {
	            while ((elem = results[i++])) {
	              if (elem.nodeType === 1) {
	                tmp.push(elem);
	              }
	            }
	            return tmp;
	          }
	          return results;
	        };
	        Expr.find["CLASS"] = support.getElementsByClassName && function(className, context) {
	          if (typeof context.getElementsByClassName !== strundefined && documentIsHTML) {
	            return context.getElementsByClassName(className);
	          }
	        };
	        rbuggyMatches = [];
	        rbuggyQSA = [];
	        if ((support.qsa = rnative.test(doc.querySelectorAll))) {
	          assert(function(div) {
	            div.innerHTML = "<select msallowclip=''><option selected=''></option></select>";
	            if (div.querySelectorAll("[msallowclip^='']").length) {
	              rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
	            }
	            if (!div.querySelectorAll("[selected]").length) {
	              rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
	            }
	            if (!div.querySelectorAll(":checked").length) {
	              rbuggyQSA.push(":checked");
	            }
	          });
	          assert(function(div) {
	            var input = doc.createElement("input");
	            input.setAttribute("type", "hidden");
	            div.appendChild(input).setAttribute("name", "D");
	            if (div.querySelectorAll("[name=d]").length) {
	              rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
	            }
	            if (!div.querySelectorAll(":enabled").length) {
	              rbuggyQSA.push(":enabled", ":disabled");
	            }
	            div.querySelectorAll("*,:x");
	            rbuggyQSA.push(",.*:");
	          });
	        }
	        if ((support.matchesSelector = rnative.test((matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)))) {
	          assert(function(div) {
	            support.disconnectedMatch = matches.call(div, "div");
	            matches.call(div, "[s!='']:x");
	            rbuggyMatches.push("!=", pseudos);
	          });
	        }
	        rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
	        rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));
	        hasCompare = rnative.test(docElem.compareDocumentPosition);
	        contains = hasCompare || rnative.test(docElem.contains) ? function(a, b) {
	          var adown = a.nodeType === 9 ? a.documentElement : a,
	              bup = b && b.parentNode;
	          return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
	        } : function(a, b) {
	          if (b) {
	            while ((b = b.parentNode)) {
	              if (b === a) {
	                return true;
	              }
	            }
	          }
	          return false;
	        };
	        sortOrder = hasCompare ? function(a, b) {
	          if (a === b) {
	            hasDuplicate = true;
	            return 0;
	          }
	          var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
	          if (compare) {
	            return compare;
	          }
	          compare = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1;
	          if (compare & 1 || (!support.sortDetached && b.compareDocumentPosition(a) === compare)) {
	            if (a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
	              return -1;
	            }
	            if (b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
	              return 1;
	            }
	            return sortInput ? (indexOf.call(sortInput, a) - indexOf.call(sortInput, b)) : 0;
	          }
	          return compare & 4 ? -1 : 1;
	        } : function(a, b) {
	          if (a === b) {
	            hasDuplicate = true;
	            return 0;
	          }
	          var cur,
	              i = 0,
	              aup = a.parentNode,
	              bup = b.parentNode,
	              ap = [a],
	              bp = [b];
	          if (!aup || !bup) {
	            return a === doc ? -1 : b === doc ? 1 : aup ? -1 : bup ? 1 : sortInput ? (indexOf.call(sortInput, a) - indexOf.call(sortInput, b)) : 0;
	          } else if (aup === bup) {
	            return siblingCheck(a, b);
	          }
	          cur = a;
	          while ((cur = cur.parentNode)) {
	            ap.unshift(cur);
	          }
	          cur = b;
	          while ((cur = cur.parentNode)) {
	            bp.unshift(cur);
	          }
	          while (ap[i] === bp[i]) {
	            i++;
	          }
	          return i ? siblingCheck(ap[i], bp[i]) : ap[i] === preferredDoc ? -1 : bp[i] === preferredDoc ? 1 : 0;
	        };
	        return doc;
	      };
	      Sizzle.matches = function(expr, elements) {
	        return Sizzle(expr, null, null, elements);
	      };
	      Sizzle.matchesSelector = function(elem, expr) {
	        if ((elem.ownerDocument || elem) !== document) {
	          setDocument(elem);
	        }
	        expr = expr.replace(rattributeQuotes, "='$1']");
	        if (support.matchesSelector && documentIsHTML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
	          try {
	            var ret = matches.call(elem, expr);
	            if (ret || support.disconnectedMatch || elem.document && elem.document.nodeType !== 11) {
	              return ret;
	            }
	          } catch (e) {}
	        }
	        return Sizzle(expr, document, null, [elem]).length > 0;
	      };
	      Sizzle.contains = function(context, elem) {
	        if ((context.ownerDocument || context) !== document) {
	          setDocument(context);
	        }
	        return contains(context, elem);
	      };
	      Sizzle.attr = function(elem, name) {
	        if ((elem.ownerDocument || elem) !== document) {
	          setDocument(elem);
	        }
	        var fn = Expr.attrHandle[name.toLowerCase()],
	            val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : undefined;
	        return val !== undefined ? val : support.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
	      };
	      Sizzle.error = function(msg) {
	        throw new Error("Syntax error, unrecognized expression: " + msg);
	      };
	      Sizzle.uniqueSort = function(results) {
	        var elem,
	            duplicates = [],
	            j = 0,
	            i = 0;
	        hasDuplicate = !support.detectDuplicates;
	        sortInput = !support.sortStable && results.slice(0);
	        results.sort(sortOrder);
	        if (hasDuplicate) {
	          while ((elem = results[i++])) {
	            if (elem === results[i]) {
	              j = duplicates.push(i);
	            }
	          }
	          while (j--) {
	            results.splice(duplicates[j], 1);
	          }
	        }
	        sortInput = null;
	        return results;
	      };
	      getText = Sizzle.getText = function(elem) {
	        var node,
	            ret = "",
	            i = 0,
	            nodeType = elem.nodeType;
	        if (!nodeType) {
	          while ((node = elem[i++])) {
	            ret += getText(node);
	          }
	        } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
	          if (typeof elem.textContent === "string") {
	            return elem.textContent;
	          } else {
	            for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
	              ret += getText(elem);
	            }
	          }
	        } else if (nodeType === 3 || nodeType === 4) {
	          return elem.nodeValue;
	        }
	        return ret;
	      };
	      Expr = Sizzle.selectors = {
	        cacheLength: 50,
	        createPseudo: markFunction,
	        match: matchExpr,
	        attrHandle: {},
	        find: {},
	        relative: {
	          ">": {
	            dir: "parentNode",
	            first: true
	          },
	          " ": {dir: "parentNode"},
	          "+": {
	            dir: "previousSibling",
	            first: true
	          },
	          "~": {dir: "previousSibling"}
	        },
	        preFilter: {
	          "ATTR": function(match) {
	            match[1] = match[1].replace(runescape, funescape);
	            match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape);
	            if (match[2] === "~=") {
	              match[3] = " " + match[3] + " ";
	            }
	            return match.slice(0, 4);
	          },
	          "CHILD": function(match) {
	            match[1] = match[1].toLowerCase();
	            if (match[1].slice(0, 3) === "nth") {
	              if (!match[3]) {
	                Sizzle.error(match[0]);
	              }
	              match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
	              match[5] = +((match[7] + match[8]) || match[3] === "odd");
	            } else if (match[3]) {
	              Sizzle.error(match[0]);
	            }
	            return match;
	          },
	          "PSEUDO": function(match) {
	            var excess,
	                unquoted = !match[6] && match[2];
	            if (matchExpr["CHILD"].test(match[0])) {
	              return null;
	            }
	            if (match[3]) {
	              match[2] = match[4] || match[5] || "";
	            } else if (unquoted && rpseudo.test(unquoted) && (excess = tokenize(unquoted, true)) && (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {
	              match[0] = match[0].slice(0, excess);
	              match[2] = unquoted.slice(0, excess);
	            }
	            return match.slice(0, 3);
	          }
	        },
	        filter: {
	          "TAG": function(nodeNameSelector) {
	            var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
	            return nodeNameSelector === "*" ? function() {
	              return true;
	            } : function(elem) {
	              return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
	            };
	          },
	          "CLASS": function(className) {
	            var pattern = classCache[className + " "];
	            return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function(elem) {
	              return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "");
	            });
	          },
	          "ATTR": function(name, operator, check) {
	            return function(elem) {
	              var result = Sizzle.attr(elem, name);
	              if (result == null) {
	                return operator === "!=";
	              }
	              if (!operator) {
	                return true;
	              }
	              result += "";
	              return operator === "=" ? result === check : operator === "!=" ? result !== check : operator === "^=" ? check && result.indexOf(check) === 0 : operator === "*=" ? check && result.indexOf(check) > -1 : operator === "$=" ? check && result.slice(-check.length) === check : operator === "~=" ? (" " + result + " ").indexOf(check) > -1 : operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" : false;
	            };
	          },
	          "CHILD": function(type, what, argument, first, last) {
	            var simple = type.slice(0, 3) !== "nth",
	                forward = type.slice(-4) !== "last",
	                ofType = what === "of-type";
	            return first === 1 && last === 0 ? function(elem) {
	              return !!elem.parentNode;
	            } : function(elem, context, xml) {
	              var cache,
	                  outerCache,
	                  node,
	                  diff,
	                  nodeIndex,
	                  start,
	                  dir = simple !== forward ? "nextSibling" : "previousSibling",
	                  parent = elem.parentNode,
	                  name = ofType && elem.nodeName.toLowerCase(),
	                  useCache = !xml && !ofType;
	              if (parent) {
	                if (simple) {
	                  while (dir) {
	                    node = elem;
	                    while ((node = node[dir])) {
	                      if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
	                        return false;
	                      }
	                    }
	                    start = dir = type === "only" && !start && "nextSibling";
	                  }
	                  return true;
	                }
	                start = [forward ? parent.firstChild : parent.lastChild];
	                if (forward && useCache) {
	                  outerCache = parent[expando] || (parent[expando] = {});
	                  cache = outerCache[type] || [];
	                  nodeIndex = cache[0] === dirruns && cache[1];
	                  diff = cache[0] === dirruns && cache[2];
	                  node = nodeIndex && parent.childNodes[nodeIndex];
	                  while ((node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop())) {
	                    if (node.nodeType === 1 && ++diff && node === elem) {
	                      outerCache[type] = [dirruns, nodeIndex, diff];
	                      break;
	                    }
	                  }
	                } else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) {
	                  diff = cache[1];
	                } else {
	                  while ((node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop())) {
	                    if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
	                      if (useCache) {
	                        (node[expando] || (node[expando] = {}))[type] = [dirruns, diff];
	                      }
	                      if (node === elem) {
	                        break;
	                      }
	                    }
	                  }
	                }
	                diff -= last;
	                return diff === first || (diff % first === 0 && diff / first >= 0);
	              }
	            };
	          },
	          "PSEUDO": function(pseudo, argument) {
	            var args,
	                fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error("unsupported pseudo: " + pseudo);
	            if (fn[expando]) {
	              return fn(argument);
	            }
	            if (fn.length > 1) {
	              args = [pseudo, pseudo, "", argument];
	              return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function(seed, matches) {
	                var idx,
	                    matched = fn(seed, argument),
	                    i = matched.length;
	                while (i--) {
	                  idx = indexOf.call(seed, matched[i]);
	                  seed[idx] = !(matches[idx] = matched[i]);
	                }
	              }) : function(elem) {
	                return fn(elem, 0, args);
	              };
	            }
	            return fn;
	          }
	        },
	        pseudos: {
	          "not": markFunction(function(selector) {
	            var input = [],
	                results = [],
	                matcher = compile(selector.replace(rtrim, "$1"));
	            return matcher[expando] ? markFunction(function(seed, matches, context, xml) {
	              var elem,
	                  unmatched = matcher(seed, null, xml, []),
	                  i = seed.length;
	              while (i--) {
	                if ((elem = unmatched[i])) {
	                  seed[i] = !(matches[i] = elem);
	                }
	              }
	            }) : function(elem, context, xml) {
	              input[0] = elem;
	              matcher(input, null, xml, results);
	              return !results.pop();
	            };
	          }),
	          "has": markFunction(function(selector) {
	            return function(elem) {
	              return Sizzle(selector, elem).length > 0;
	            };
	          }),
	          "contains": markFunction(function(text) {
	            return function(elem) {
	              return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
	            };
	          }),
	          "lang": markFunction(function(lang) {
	            if (!ridentifier.test(lang || "")) {
	              Sizzle.error("unsupported lang: " + lang);
	            }
	            lang = lang.replace(runescape, funescape).toLowerCase();
	            return function(elem) {
	              var elemLang;
	              do {
	                if ((elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang"))) {
	                  elemLang = elemLang.toLowerCase();
	                  return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
	                }
	              } while ((elem = elem.parentNode) && elem.nodeType === 1);
	              return false;
	            };
	          }),
	          "target": function(elem) {
	            var hash = window.location && window.location.hash;
	            return hash && hash.slice(1) === elem.id;
	          },
	          "root": function(elem) {
	            return elem === docElem;
	          },
	          "focus": function(elem) {
	            return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
	          },
	          "enabled": function(elem) {
	            return elem.disabled === false;
	          },
	          "disabled": function(elem) {
	            return elem.disabled === true;
	          },
	          "checked": function(elem) {
	            var nodeName = elem.nodeName.toLowerCase();
	            return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
	          },
	          "selected": function(elem) {
	            if (elem.parentNode) {
	              elem.parentNode.selectedIndex;
	            }
	            return elem.selected === true;
	          },
	          "empty": function(elem) {
	            for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
	              if (elem.nodeType < 6) {
	                return false;
	              }
	            }
	            return true;
	          },
	          "parent": function(elem) {
	            return !Expr.pseudos["empty"](elem);
	          },
	          "header": function(elem) {
	            return rheader.test(elem.nodeName);
	          },
	          "input": function(elem) {
	            return rinputs.test(elem.nodeName);
	          },
	          "button": function(elem) {
	            var name = elem.nodeName.toLowerCase();
	            return name === "input" && elem.type === "button" || name === "button";
	          },
	          "text": function(elem) {
	            var attr;
	            return elem.nodeName.toLowerCase() === "input" && elem.type === "text" && ((attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
	          },
	          "first": createPositionalPseudo(function() {
	            return [0];
	          }),
	          "last": createPositionalPseudo(function(matchIndexes, length) {
	            return [length - 1];
	          }),
	          "eq": createPositionalPseudo(function(matchIndexes, length, argument) {
	            return [argument < 0 ? argument + length : argument];
	          }),
	          "even": createPositionalPseudo(function(matchIndexes, length) {
	            var i = 0;
	            for (; i < length; i += 2) {
	              matchIndexes.push(i);
	            }
	            return matchIndexes;
	          }),
	          "odd": createPositionalPseudo(function(matchIndexes, length) {
	            var i = 1;
	            for (; i < length; i += 2) {
	              matchIndexes.push(i);
	            }
	            return matchIndexes;
	          }),
	          "lt": createPositionalPseudo(function(matchIndexes, length, argument) {
	            var i = argument < 0 ? argument + length : argument;
	            for (; --i >= 0; ) {
	              matchIndexes.push(i);
	            }
	            return matchIndexes;
	          }),
	          "gt": createPositionalPseudo(function(matchIndexes, length, argument) {
	            var i = argument < 0 ? argument + length : argument;
	            for (; ++i < length; ) {
	              matchIndexes.push(i);
	            }
	            return matchIndexes;
	          })
	        }
	      };
	      Expr.pseudos["nth"] = Expr.pseudos["eq"];
	      for (i in {
	        radio: true,
	        checkbox: true,
	        file: true,
	        password: true,
	        image: true
	      }) {
	        Expr.pseudos[i] = createInputPseudo(i);
	      }
	      for (i in {
	        submit: true,
	        reset: true
	      }) {
	        Expr.pseudos[i] = createButtonPseudo(i);
	      }
	      function setFilters() {}
	      setFilters.prototype = Expr.filters = Expr.pseudos;
	      Expr.setFilters = new setFilters();
	      tokenize = Sizzle.tokenize = function(selector, parseOnly) {
	        var matched,
	            match,
	            tokens,
	            type,
	            soFar,
	            groups,
	            preFilters,
	            cached = tokenCache[selector + " "];
	        if (cached) {
	          return parseOnly ? 0 : cached.slice(0);
	        }
	        soFar = selector;
	        groups = [];
	        preFilters = Expr.preFilter;
	        while (soFar) {
	          if (!matched || (match = rcomma.exec(soFar))) {
	            if (match) {
	              soFar = soFar.slice(match[0].length) || soFar;
	            }
	            groups.push((tokens = []));
	          }
	          matched = false;
	          if ((match = rcombinators.exec(soFar))) {
	            matched = match.shift();
	            tokens.push({
	              value: matched,
	              type: match[0].replace(rtrim, " ")
	            });
	            soFar = soFar.slice(matched.length);
	          }
	          for (type in Expr.filter) {
	            if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
	              matched = match.shift();
	              tokens.push({
	                value: matched,
	                type: type,
	                matches: match
	              });
	              soFar = soFar.slice(matched.length);
	            }
	          }
	          if (!matched) {
	            break;
	          }
	        }
	        return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) : tokenCache(selector, groups).slice(0);
	      };
	      function toSelector(tokens) {
	        var i = 0,
	            len = tokens.length,
	            selector = "";
	        for (; i < len; i++) {
	          selector += tokens[i].value;
	        }
	        return selector;
	      }
	      function addCombinator(matcher, combinator, base) {
	        var dir = combinator.dir,
	            checkNonElements = base && dir === "parentNode",
	            doneName = done++;
	        return combinator.first ? function(elem, context, xml) {
	          while ((elem = elem[dir])) {
	            if (elem.nodeType === 1 || checkNonElements) {
	              return matcher(elem, context, xml);
	            }
	          }
	        } : function(elem, context, xml) {
	          var oldCache,
	              outerCache,
	              newCache = [dirruns, doneName];
	          if (xml) {
	            while ((elem = elem[dir])) {
	              if (elem.nodeType === 1 || checkNonElements) {
	                if (matcher(elem, context, xml)) {
	                  return true;
	                }
	              }
	            }
	          } else {
	            while ((elem = elem[dir])) {
	              if (elem.nodeType === 1 || checkNonElements) {
	                outerCache = elem[expando] || (elem[expando] = {});
	                if ((oldCache = outerCache[dir]) && oldCache[0] === dirruns && oldCache[1] === doneName) {
	                  return (newCache[2] = oldCache[2]);
	                } else {
	                  outerCache[dir] = newCache;
	                  if ((newCache[2] = matcher(elem, context, xml))) {
	                    return true;
	                  }
	                }
	              }
	            }
	          }
	        };
	      }
	      function elementMatcher(matchers) {
	        return matchers.length > 1 ? function(elem, context, xml) {
	          var i = matchers.length;
	          while (i--) {
	            if (!matchers[i](elem, context, xml)) {
	              return false;
	            }
	          }
	          return true;
	        } : matchers[0];
	      }
	      function multipleContexts(selector, contexts, results) {
	        var i = 0,
	            len = contexts.length;
	        for (; i < len; i++) {
	          Sizzle(selector, contexts[i], results);
	        }
	        return results;
	      }
	      function condense(unmatched, map, filter, context, xml) {
	        var elem,
	            newUnmatched = [],
	            i = 0,
	            len = unmatched.length,
	            mapped = map != null;
	        for (; i < len; i++) {
	          if ((elem = unmatched[i])) {
	            if (!filter || filter(elem, context, xml)) {
	              newUnmatched.push(elem);
	              if (mapped) {
	                map.push(i);
	              }
	            }
	          }
	        }
	        return newUnmatched;
	      }
	      function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
	        if (postFilter && !postFilter[expando]) {
	          postFilter = setMatcher(postFilter);
	        }
	        if (postFinder && !postFinder[expando]) {
	          postFinder = setMatcher(postFinder, postSelector);
	        }
	        return markFunction(function(seed, results, context, xml) {
	          var temp,
	              i,
	              elem,
	              preMap = [],
	              postMap = [],
	              preexisting = results.length,
	              elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []),
	              matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems,
	              matcherOut = matcher ? postFinder || (seed ? preFilter : preexisting || postFilter) ? [] : results : matcherIn;
	          if (matcher) {
	            matcher(matcherIn, matcherOut, context, xml);
	          }
	          if (postFilter) {
	            temp = condense(matcherOut, postMap);
	            postFilter(temp, [], context, xml);
	            i = temp.length;
	            while (i--) {
	              if ((elem = temp[i])) {
	                matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
	              }
	            }
	          }
	          if (seed) {
	            if (postFinder || preFilter) {
	              if (postFinder) {
	                temp = [];
	                i = matcherOut.length;
	                while (i--) {
	                  if ((elem = matcherOut[i])) {
	                    temp.push((matcherIn[i] = elem));
	                  }
	                }
	                postFinder(null, (matcherOut = []), temp, xml);
	              }
	              i = matcherOut.length;
	              while (i--) {
	                if ((elem = matcherOut[i]) && (temp = postFinder ? indexOf.call(seed, elem) : preMap[i]) > -1) {
	                  seed[temp] = !(results[temp] = elem);
	                }
	              }
	            }
	          } else {
	            matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut);
	            if (postFinder) {
	              postFinder(null, results, matcherOut, xml);
	            } else {
	              push.apply(results, matcherOut);
	            }
	          }
	        });
	      }
	      function matcherFromTokens(tokens) {
	        var checkContext,
	            matcher,
	            j,
	            len = tokens.length,
	            leadingRelative = Expr.relative[tokens[0].type],
	            implicitRelative = leadingRelative || Expr.relative[" "],
	            i = leadingRelative ? 1 : 0,
	            matchContext = addCombinator(function(elem) {
	              return elem === checkContext;
	            }, implicitRelative, true),
	            matchAnyContext = addCombinator(function(elem) {
	              return indexOf.call(checkContext, elem) > -1;
	            }, implicitRelative, true),
	            matchers = [function(elem, context, xml) {
	              return (!leadingRelative && (xml || context !== outermostContext)) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
	            }];
	        for (; i < len; i++) {
	          if ((matcher = Expr.relative[tokens[i].type])) {
	            matchers = [addCombinator(elementMatcher(matchers), matcher)];
	          } else {
	            matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);
	            if (matcher[expando]) {
	              j = ++i;
	              for (; j < len; j++) {
	                if (Expr.relative[tokens[j].type]) {
	                  break;
	                }
	              }
	              return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector(tokens.slice(0, i - 1).concat({value: tokens[i - 2].type === " " ? "*" : ""})).replace(rtrim, "$1"), matcher, i < j && matcherFromTokens(tokens.slice(i, j)), j < len && matcherFromTokens((tokens = tokens.slice(j))), j < len && toSelector(tokens));
	            }
	            matchers.push(matcher);
	          }
	        }
	        return elementMatcher(matchers);
	      }
	      function matcherFromGroupMatchers(elementMatchers, setMatchers) {
	        var bySet = setMatchers.length > 0,
	            byElement = elementMatchers.length > 0,
	            superMatcher = function(seed, context, xml, results, outermost) {
	              var elem,
	                  j,
	                  matcher,
	                  matchedCount = 0,
	                  i = "0",
	                  unmatched = seed && [],
	                  setMatched = [],
	                  contextBackup = outermostContext,
	                  elems = seed || byElement && Expr.find["TAG"]("*", outermost),
	                  dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
	                  len = elems.length;
	              if (outermost) {
	                outermostContext = context !== document && context;
	              }
	              for (; i !== len && (elem = elems[i]) != null; i++) {
	                if (byElement && elem) {
	                  j = 0;
	                  while ((matcher = elementMatchers[j++])) {
	                    if (matcher(elem, context, xml)) {
	                      results.push(elem);
	                      break;
	                    }
	                  }
	                  if (outermost) {
	                    dirruns = dirrunsUnique;
	                  }
	                }
	                if (bySet) {
	                  if ((elem = !matcher && elem)) {
	                    matchedCount--;
	                  }
	                  if (seed) {
	                    unmatched.push(elem);
	                  }
	                }
	              }
	              matchedCount += i;
	              if (bySet && i !== matchedCount) {
	                j = 0;
	                while ((matcher = setMatchers[j++])) {
	                  matcher(unmatched, setMatched, context, xml);
	                }
	                if (seed) {
	                  if (matchedCount > 0) {
	                    while (i--) {
	                      if (!(unmatched[i] || setMatched[i])) {
	                        setMatched[i] = pop.call(results);
	                      }
	                    }
	                  }
	                  setMatched = condense(setMatched);
	                }
	                push.apply(results, setMatched);
	                if (outermost && !seed && setMatched.length > 0 && (matchedCount + setMatchers.length) > 1) {
	                  Sizzle.uniqueSort(results);
	                }
	              }
	              if (outermost) {
	                dirruns = dirrunsUnique;
	                outermostContext = contextBackup;
	              }
	              return unmatched;
	            };
	        return bySet ? markFunction(superMatcher) : superMatcher;
	      }
	      compile = Sizzle.compile = function(selector, match) {
	        var i,
	            setMatchers = [],
	            elementMatchers = [],
	            cached = compilerCache[selector + " "];
	        if (!cached) {
	          if (!match) {
	            match = tokenize(selector);
	          }
	          i = match.length;
	          while (i--) {
	            cached = matcherFromTokens(match[i]);
	            if (cached[expando]) {
	              setMatchers.push(cached);
	            } else {
	              elementMatchers.push(cached);
	            }
	          }
	          cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
	          cached.selector = selector;
	        }
	        return cached;
	      };
	      select = Sizzle.select = function(selector, context, results, seed) {
	        var i,
	            tokens,
	            token,
	            type,
	            find,
	            compiled = typeof selector === "function" && selector,
	            match = !seed && tokenize((selector = compiled.selector || selector));
	        results = results || [];
	        if (match.length === 1) {
	          tokens = match[0] = match[0].slice(0);
	          if (tokens.length > 2 && (token = tokens[0]).type === "ID" && support.getById && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {
	            context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];
	            if (!context) {
	              return results;
	            } else if (compiled) {
	              context = context.parentNode;
	            }
	            selector = selector.slice(tokens.shift().value.length);
	          }
	          i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
	          while (i--) {
	            token = tokens[i];
	            if (Expr.relative[(type = token.type)]) {
	              break;
	            }
	            if ((find = Expr.find[type])) {
	              if ((seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context))) {
	                tokens.splice(i, 1);
	                selector = seed.length && toSelector(tokens);
	                if (!selector) {
	                  push.apply(results, seed);
	                  return results;
	                }
	                break;
	              }
	            }
	          }
	        }
	        (compiled || compile(selector, match))(seed, context, !documentIsHTML, results, rsibling.test(selector) && testContext(context.parentNode) || context);
	        return results;
	      };
	      support.sortStable = expando.split("").sort(sortOrder).join("") === expando;
	      support.detectDuplicates = !!hasDuplicate;
	      setDocument();
	      support.sortDetached = assert(function(div1) {
	        return div1.compareDocumentPosition(document.createElement("div")) & 1;
	      });
	      if (!assert(function(div) {
	        div.innerHTML = "<a href='#'></a>";
	        return div.firstChild.getAttribute("href") === "#";
	      })) {
	        addHandle("type|href|height|width", function(elem, name, isXML) {
	          if (!isXML) {
	            return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
	          }
	        });
	      }
	      if (!support.attributes || !assert(function(div) {
	        div.innerHTML = "<input/>";
	        div.firstChild.setAttribute("value", "");
	        return div.firstChild.getAttribute("value") === "";
	      })) {
	        addHandle("value", function(elem, name, isXML) {
	          if (!isXML && elem.nodeName.toLowerCase() === "input") {
	            return elem.defaultValue;
	          }
	        });
	      }
	      if (!assert(function(div) {
	        return div.getAttribute("disabled") == null;
	      })) {
	        addHandle(booleans, function(elem, name, isXML) {
	          var val;
	          if (!isXML) {
	            return elem[name] === true ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
	          }
	        });
	      }
	      return Sizzle;
	    })(window);
	    jQuery.find = Sizzle;
	    jQuery.expr = Sizzle.selectors;
	    jQuery.expr[":"] = jQuery.expr.pseudos;
	    jQuery.unique = Sizzle.uniqueSort;
	    jQuery.text = Sizzle.getText;
	    jQuery.isXMLDoc = Sizzle.isXML;
	    jQuery.contains = Sizzle.contains;
	    var rneedsContext = jQuery.expr.match.needsContext;
	    var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);
	    var risSimple = /^.[^:#\[\.,]*$/;
	    function winnow(elements, qualifier, not) {
	      if (jQuery.isFunction(qualifier)) {
	        return jQuery.grep(elements, function(elem, i) {
	          return !!qualifier.call(elem, i, elem) !== not;
	        });
	      }
	      if (qualifier.nodeType) {
	        return jQuery.grep(elements, function(elem) {
	          return (elem === qualifier) !== not;
	        });
	      }
	      if (typeof qualifier === "string") {
	        if (risSimple.test(qualifier)) {
	          return jQuery.filter(qualifier, elements, not);
	        }
	        qualifier = jQuery.filter(qualifier, elements);
	      }
	      return jQuery.grep(elements, function(elem) {
	        return (indexOf.call(qualifier, elem) >= 0) !== not;
	      });
	    }
	    jQuery.filter = function(expr, elems, not) {
	      var elem = elems[0];
	      if (not) {
	        expr = ":not(" + expr + ")";
	      }
	      return elems.length === 1 && elem.nodeType === 1 ? jQuery.find.matchesSelector(elem, expr) ? [elem] : [] : jQuery.find.matches(expr, jQuery.grep(elems, function(elem) {
	        return elem.nodeType === 1;
	      }));
	    };
	    jQuery.fn.extend({
	      find: function(selector) {
	        var i,
	            len = this.length,
	            ret = [],
	            self = this;
	        if (typeof selector !== "string") {
	          return this.pushStack(jQuery(selector).filter(function() {
	            for (i = 0; i < len; i++) {
	              if (jQuery.contains(self[i], this)) {
	                return true;
	              }
	            }
	          }));
	        }
	        for (i = 0; i < len; i++) {
	          jQuery.find(selector, self[i], ret);
	        }
	        ret = this.pushStack(len > 1 ? jQuery.unique(ret) : ret);
	        ret.selector = this.selector ? this.selector + " " + selector : selector;
	        return ret;
	      },
	      filter: function(selector) {
	        return this.pushStack(winnow(this, selector || [], false));
	      },
	      not: function(selector) {
	        return this.pushStack(winnow(this, selector || [], true));
	      },
	      is: function(selector) {
	        return !!winnow(this, typeof selector === "string" && rneedsContext.test(selector) ? jQuery(selector) : selector || [], false).length;
	      }
	    });
	    var rootjQuery,
	        rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
	        init = jQuery.fn.init = function(selector, context) {
	          var match,
	              elem;
	          if (!selector) {
	            return this;
	          }
	          if (typeof selector === "string") {
	            if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {
	              match = [null, selector, null];
	            } else {
	              match = rquickExpr.exec(selector);
	            }
	            if (match && (match[1] || !context)) {
	              if (match[1]) {
	                context = context instanceof jQuery ? context[0] : context;
	                jQuery.merge(this, jQuery.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document, true));
	                if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
	                  for (match in context) {
	                    if (jQuery.isFunction(this[match])) {
	                      this[match](context[match]);
	                    } else {
	                      this.attr(match, context[match]);
	                    }
	                  }
	                }
	                return this;
	              } else {
	                elem = document.getElementById(match[2]);
	                if (elem && elem.parentNode) {
	                  this.length = 1;
	                  this[0] = elem;
	                }
	                this.context = document;
	                this.selector = selector;
	                return this;
	              }
	            } else if (!context || context.jquery) {
	              return (context || rootjQuery).find(selector);
	            } else {
	              return this.constructor(context).find(selector);
	            }
	          } else if (selector.nodeType) {
	            this.context = this[0] = selector;
	            this.length = 1;
	            return this;
	          } else if (jQuery.isFunction(selector)) {
	            return typeof rootjQuery.ready !== "undefined" ? rootjQuery.ready(selector) : selector(jQuery);
	          }
	          if (selector.selector !== undefined) {
	            this.selector = selector.selector;
	            this.context = selector.context;
	          }
	          return jQuery.makeArray(selector, this);
	        };
	    init.prototype = jQuery.fn;
	    rootjQuery = jQuery(document);
	    var rparentsprev = /^(?:parents|prev(?:Until|All))/,
	        guaranteedUnique = {
	          children: true,
	          contents: true,
	          next: true,
	          prev: true
	        };
	    jQuery.extend({
	      dir: function(elem, dir, until) {
	        var matched = [],
	            truncate = until !== undefined;
	        while ((elem = elem[dir]) && elem.nodeType !== 9) {
	          if (elem.nodeType === 1) {
	            if (truncate && jQuery(elem).is(until)) {
	              break;
	            }
	            matched.push(elem);
	          }
	        }
	        return matched;
	      },
	      sibling: function(n, elem) {
	        var matched = [];
	        for (; n; n = n.nextSibling) {
	          if (n.nodeType === 1 && n !== elem) {
	            matched.push(n);
	          }
	        }
	        return matched;
	      }
	    });
	    jQuery.fn.extend({
	      has: function(target) {
	        var targets = jQuery(target, this),
	            l = targets.length;
	        return this.filter(function() {
	          var i = 0;
	          for (; i < l; i++) {
	            if (jQuery.contains(this, targets[i])) {
	              return true;
	            }
	          }
	        });
	      },
	      closest: function(selectors, context) {
	        var cur,
	            i = 0,
	            l = this.length,
	            matched = [],
	            pos = rneedsContext.test(selectors) || typeof selectors !== "string" ? jQuery(selectors, context || this.context) : 0;
	        for (; i < l; i++) {
	          for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
	            if (cur.nodeType < 11 && (pos ? pos.index(cur) > -1 : cur.nodeType === 1 && jQuery.find.matchesSelector(cur, selectors))) {
	              matched.push(cur);
	              break;
	            }
	          }
	        }
	        return this.pushStack(matched.length > 1 ? jQuery.unique(matched) : matched);
	      },
	      index: function(elem) {
	        if (!elem) {
	          return (this[0] && this[0].parentNode) ? this.first().prevAll().length : -1;
	        }
	        if (typeof elem === "string") {
	          return indexOf.call(jQuery(elem), this[0]);
	        }
	        return indexOf.call(this, elem.jquery ? elem[0] : elem);
	      },
	      add: function(selector, context) {
	        return this.pushStack(jQuery.unique(jQuery.merge(this.get(), jQuery(selector, context))));
	      },
	      addBack: function(selector) {
	        return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
	      }
	    });
	    function sibling(cur, dir) {
	      while ((cur = cur[dir]) && cur.nodeType !== 1) {}
	      return cur;
	    }
	    jQuery.each({
	      parent: function(elem) {
	        var parent = elem.parentNode;
	        return parent && parent.nodeType !== 11 ? parent : null;
	      },
	      parents: function(elem) {
	        return jQuery.dir(elem, "parentNode");
	      },
	      parentsUntil: function(elem, i, until) {
	        return jQuery.dir(elem, "parentNode", until);
	      },
	      next: function(elem) {
	        return sibling(elem, "nextSibling");
	      },
	      prev: function(elem) {
	        return sibling(elem, "previousSibling");
	      },
	      nextAll: function(elem) {
	        return jQuery.dir(elem, "nextSibling");
	      },
	      prevAll: function(elem) {
	        return jQuery.dir(elem, "previousSibling");
	      },
	      nextUntil: function(elem, i, until) {
	        return jQuery.dir(elem, "nextSibling", until);
	      },
	      prevUntil: function(elem, i, until) {
	        return jQuery.dir(elem, "previousSibling", until);
	      },
	      siblings: function(elem) {
	        return jQuery.sibling((elem.parentNode || {}).firstChild, elem);
	      },
	      children: function(elem) {
	        return jQuery.sibling(elem.firstChild);
	      },
	      contents: function(elem) {
	        return elem.contentDocument || jQuery.merge([], elem.childNodes);
	      }
	    }, function(name, fn) {
	      jQuery.fn[name] = function(until, selector) {
	        var matched = jQuery.map(this, fn, until);
	        if (name.slice(-5) !== "Until") {
	          selector = until;
	        }
	        if (selector && typeof selector === "string") {
	          matched = jQuery.filter(selector, matched);
	        }
	        if (this.length > 1) {
	          if (!guaranteedUnique[name]) {
	            jQuery.unique(matched);
	          }
	          if (rparentsprev.test(name)) {
	            matched.reverse();
	          }
	        }
	        return this.pushStack(matched);
	      };
	    });
	    var rnotwhite = (/\S+/g);
	    var optionsCache = {};
	    function createOptions(options) {
	      var object = optionsCache[options] = {};
	      jQuery.each(options.match(rnotwhite) || [], function(_, flag) {
	        object[flag] = true;
	      });
	      return object;
	    }
	    jQuery.Callbacks = function(options) {
	      options = typeof options === "string" ? (optionsCache[options] || createOptions(options)) : jQuery.extend({}, options);
	      var memory,
	          fired,
	          firing,
	          firingStart,
	          firingLength,
	          firingIndex,
	          list = [],
	          stack = !options.once && [],
	          fire = function(data) {
	            memory = options.memory && data;
	            fired = true;
	            firingIndex = firingStart || 0;
	            firingStart = 0;
	            firingLength = list.length;
	            firing = true;
	            for (; list && firingIndex < firingLength; firingIndex++) {
	              if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
	                memory = false;
	                break;
	              }
	            }
	            firing = false;
	            if (list) {
	              if (stack) {
	                if (stack.length) {
	                  fire(stack.shift());
	                }
	              } else if (memory) {
	                list = [];
	              } else {
	                self.disable();
	              }
	            }
	          },
	          self = {
	            add: function() {
	              if (list) {
	                var start = list.length;
	                (function add(args) {
	                  jQuery.each(args, function(_, arg) {
	                    var type = jQuery.type(arg);
	                    if (type === "function") {
	                      if (!options.unique || !self.has(arg)) {
	                        list.push(arg);
	                      }
	                    } else if (arg && arg.length && type !== "string") {
	                      add(arg);
	                    }
	                  });
	                })(arguments);
	                if (firing) {
	                  firingLength = list.length;
	                } else if (memory) {
	                  firingStart = start;
	                  fire(memory);
	                }
	              }
	              return this;
	            },
	            remove: function() {
	              if (list) {
	                jQuery.each(arguments, function(_, arg) {
	                  var index;
	                  while ((index = jQuery.inArray(arg, list, index)) > -1) {
	                    list.splice(index, 1);
	                    if (firing) {
	                      if (index <= firingLength) {
	                        firingLength--;
	                      }
	                      if (index <= firingIndex) {
	                        firingIndex--;
	                      }
	                    }
	                  }
	                });
	              }
	              return this;
	            },
	            has: function(fn) {
	              return fn ? jQuery.inArray(fn, list) > -1 : !!(list && list.length);
	            },
	            empty: function() {
	              list = [];
	              firingLength = 0;
	              return this;
	            },
	            disable: function() {
	              list = stack = memory = undefined;
	              return this;
	            },
	            disabled: function() {
	              return !list;
	            },
	            lock: function() {
	              stack = undefined;
	              if (!memory) {
	                self.disable();
	              }
	              return this;
	            },
	            locked: function() {
	              return !stack;
	            },
	            fireWith: function(context, args) {
	              if (list && (!fired || stack)) {
	                args = args || [];
	                args = [context, args.slice ? args.slice() : args];
	                if (firing) {
	                  stack.push(args);
	                } else {
	                  fire(args);
	                }
	              }
	              return this;
	            },
	            fire: function() {
	              self.fireWith(this, arguments);
	              return this;
	            },
	            fired: function() {
	              return !!fired;
	            }
	          };
	      return self;
	    };
	    jQuery.extend({
	      Deferred: function(func) {
	        var tuples = [["resolve", "done", jQuery.Callbacks("once memory"), "resolved"], ["reject", "fail", jQuery.Callbacks("once memory"), "rejected"], ["notify", "progress", jQuery.Callbacks("memory")]],
	            state = "pending",
	            promise = {
	              state: function() {
	                return state;
	              },
	              always: function() {
	                deferred.done(arguments).fail(arguments);
	                return this;
	              },
	              then: function() {
	                var fns = arguments;
	                return jQuery.Deferred(function(newDefer) {
	                  jQuery.each(tuples, function(i, tuple) {
	                    var fn = jQuery.isFunction(fns[i]) && fns[i];
	                    deferred[tuple[1]](function() {
	                      var returned = fn && fn.apply(this, arguments);
	                      if (returned && jQuery.isFunction(returned.promise)) {
	                        returned.promise().done(newDefer.resolve).fail(newDefer.reject).progress(newDefer.notify);
	                      } else {
	                        newDefer[tuple[0] + "With"](this === promise ? newDefer.promise() : this, fn ? [returned] : arguments);
	                      }
	                    });
	                  });
	                  fns = null;
	                }).promise();
	              },
	              promise: function(obj) {
	                return obj != null ? jQuery.extend(obj, promise) : promise;
	              }
	            },
	            deferred = {};
	        promise.pipe = promise.then;
	        jQuery.each(tuples, function(i, tuple) {
	          var list = tuple[2],
	              stateString = tuple[3];
	          promise[tuple[1]] = list.add;
	          if (stateString) {
	            list.add(function() {
	              state = stateString;
	            }, tuples[i ^ 1][2].disable, tuples[2][2].lock);
	          }
	          deferred[tuple[0]] = function() {
	            deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments);
	            return this;
	          };
	          deferred[tuple[0] + "With"] = list.fireWith;
	        });
	        promise.promise(deferred);
	        if (func) {
	          func.call(deferred, deferred);
	        }
	        return deferred;
	      },
	      when: function(subordinate) {
	        var i = 0,
	            resolveValues = slice.call(arguments),
	            length = resolveValues.length,
	            remaining = length !== 1 || (subordinate && jQuery.isFunction(subordinate.promise)) ? length : 0,
	            deferred = remaining === 1 ? subordinate : jQuery.Deferred(),
	            updateFunc = function(i, contexts, values) {
	              return function(value) {
	                contexts[i] = this;
	                values[i] = arguments.length > 1 ? slice.call(arguments) : value;
	                if (values === progressValues) {
	                  deferred.notifyWith(contexts, values);
	                } else if (!(--remaining)) {
	                  deferred.resolveWith(contexts, values);
	                }
	              };
	            },
	            progressValues,
	            progressContexts,
	            resolveContexts;
	        if (length > 1) {
	          progressValues = new Array(length);
	          progressContexts = new Array(length);
	          resolveContexts = new Array(length);
	          for (; i < length; i++) {
	            if (resolveValues[i] && jQuery.isFunction(resolveValues[i].promise)) {
	              resolveValues[i].promise().done(updateFunc(i, resolveContexts, resolveValues)).fail(deferred.reject).progress(updateFunc(i, progressContexts, progressValues));
	            } else {
	              --remaining;
	            }
	          }
	        }
	        if (!remaining) {
	          deferred.resolveWith(resolveContexts, resolveValues);
	        }
	        return deferred.promise();
	      }
	    });
	    var readyList;
	    jQuery.fn.ready = function(fn) {
	      jQuery.ready.promise().done(fn);
	      return this;
	    };
	    jQuery.extend({
	      isReady: false,
	      readyWait: 1,
	      holdReady: function(hold) {
	        if (hold) {
	          jQuery.readyWait++;
	        } else {
	          jQuery.ready(true);
	        }
	      },
	      ready: function(wait) {
	        if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
	          return;
	        }
	        jQuery.isReady = true;
	        if (wait !== true && --jQuery.readyWait > 0) {
	          return;
	        }
	        readyList.resolveWith(document, [jQuery]);
	        if (jQuery.fn.triggerHandler) {
	          jQuery(document).triggerHandler("ready");
	          jQuery(document).off("ready");
	        }
	      }
	    });
	    function completed() {
	      document.removeEventListener("DOMContentLoaded", completed, false);
	      window.removeEventListener("load", completed, false);
	      jQuery.ready();
	    }
	    jQuery.ready.promise = function(obj) {
	      if (!readyList) {
	        readyList = jQuery.Deferred();
	        if (document.readyState === "complete") {
	          setTimeout(jQuery.ready);
	        } else {
	          document.addEventListener("DOMContentLoaded", completed, false);
	          window.addEventListener("load", completed, false);
	        }
	      }
	      return readyList.promise(obj);
	    };
	    jQuery.ready.promise();
	    var access = jQuery.access = function(elems, fn, key, value, chainable, emptyGet, raw) {
	      var i = 0,
	          len = elems.length,
	          bulk = key == null;
	      if (jQuery.type(key) === "object") {
	        chainable = true;
	        for (i in key) {
	          jQuery.access(elems, fn, i, key[i], true, emptyGet, raw);
	        }
	      } else if (value !== undefined) {
	        chainable = true;
	        if (!jQuery.isFunction(value)) {
	          raw = true;
	        }
	        if (bulk) {
	          if (raw) {
	            fn.call(elems, value);
	            fn = null;
	          } else {
	            bulk = fn;
	            fn = function(elem, key, value) {
	              return bulk.call(jQuery(elem), value);
	            };
	          }
	        }
	        if (fn) {
	          for (; i < len; i++) {
	            fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
	          }
	        }
	      }
	      return chainable ? elems : bulk ? fn.call(elems) : len ? fn(elems[0], key) : emptyGet;
	    };
	    jQuery.acceptData = function(owner) {
	      return owner.nodeType === 1 || owner.nodeType === 9 || !(+owner.nodeType);
	    };
	    function Data() {
	      Object.defineProperty(this.cache = {}, 0, {get: function() {
	          return {};
	        }});
	      this.expando = jQuery.expando + Math.random();
	    }
	    Data.uid = 1;
	    Data.accepts = jQuery.acceptData;
	    Data.prototype = {
	      key: function(owner) {
	        if (!Data.accepts(owner)) {
	          return 0;
	        }
	        var descriptor = {},
	            unlock = owner[this.expando];
	        if (!unlock) {
	          unlock = Data.uid++;
	          try {
	            descriptor[this.expando] = {value: unlock};
	            Object.defineProperties(owner, descriptor);
	          } catch (e) {
	            descriptor[this.expando] = unlock;
	            jQuery.extend(owner, descriptor);
	          }
	        }
	        if (!this.cache[unlock]) {
	          this.cache[unlock] = {};
	        }
	        return unlock;
	      },
	      set: function(owner, data, value) {
	        var prop,
	            unlock = this.key(owner),
	            cache = this.cache[unlock];
	        if (typeof data === "string") {
	          cache[data] = value;
	        } else {
	          if (jQuery.isEmptyObject(cache)) {
	            jQuery.extend(this.cache[unlock], data);
	          } else {
	            for (prop in data) {
	              cache[prop] = data[prop];
	            }
	          }
	        }
	        return cache;
	      },
	      get: function(owner, key) {
	        var cache = this.cache[this.key(owner)];
	        return key === undefined ? cache : cache[key];
	      },
	      access: function(owner, key, value) {
	        var stored;
	        if (key === undefined || ((key && typeof key === "string") && value === undefined)) {
	          stored = this.get(owner, key);
	          return stored !== undefined ? stored : this.get(owner, jQuery.camelCase(key));
	        }
	        this.set(owner, key, value);
	        return value !== undefined ? value : key;
	      },
	      remove: function(owner, key) {
	        var i,
	            name,
	            camel,
	            unlock = this.key(owner),
	            cache = this.cache[unlock];
	        if (key === undefined) {
	          this.cache[unlock] = {};
	        } else {
	          if (jQuery.isArray(key)) {
	            name = key.concat(key.map(jQuery.camelCase));
	          } else {
	            camel = jQuery.camelCase(key);
	            if (key in cache) {
	              name = [key, camel];
	            } else {
	              name = camel;
	              name = name in cache ? [name] : (name.match(rnotwhite) || []);
	            }
	          }
	          i = name.length;
	          while (i--) {
	            delete cache[name[i]];
	          }
	        }
	      },
	      hasData: function(owner) {
	        return !jQuery.isEmptyObject(this.cache[owner[this.expando]] || {});
	      },
	      discard: function(owner) {
	        if (owner[this.expando]) {
	          delete this.cache[owner[this.expando]];
	        }
	      }
	    };
	    var data_priv = new Data();
	    var data_user = new Data();
	    var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	        rmultiDash = /([A-Z])/g;
	    function dataAttr(elem, key, data) {
	      var name;
	      if (data === undefined && elem.nodeType === 1) {
	        name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();
	        data = elem.getAttribute(name);
	        if (typeof data === "string") {
	          try {
	            data = data === "true" ? true : data === "false" ? false : data === "null" ? null : +data + "" === data ? +data : rbrace.test(data) ? jQuery.parseJSON(data) : data;
	          } catch (e) {}
	          data_user.set(elem, key, data);
	        } else {
	          data = undefined;
	        }
	      }
	      return data;
	    }
	    jQuery.extend({
	      hasData: function(elem) {
	        return data_user.hasData(elem) || data_priv.hasData(elem);
	      },
	      data: function(elem, name, data) {
	        return data_user.access(elem, name, data);
	      },
	      removeData: function(elem, name) {
	        data_user.remove(elem, name);
	      },
	      _data: function(elem, name, data) {
	        return data_priv.access(elem, name, data);
	      },
	      _removeData: function(elem, name) {
	        data_priv.remove(elem, name);
	      }
	    });
	    jQuery.fn.extend({
	      data: function(key, value) {
	        var i,
	            name,
	            data,
	            elem = this[0],
	            attrs = elem && elem.attributes;
	        if (key === undefined) {
	          if (this.length) {
	            data = data_user.get(elem);
	            if (elem.nodeType === 1 && !data_priv.get(elem, "hasDataAttrs")) {
	              i = attrs.length;
	              while (i--) {
	                if (attrs[i]) {
	                  name = attrs[i].name;
	                  if (name.indexOf("data-") === 0) {
	                    name = jQuery.camelCase(name.slice(5));
	                    dataAttr(elem, name, data[name]);
	                  }
	                }
	              }
	              data_priv.set(elem, "hasDataAttrs", true);
	            }
	          }
	          return data;
	        }
	        if (typeof key === "object") {
	          return this.each(function() {
	            data_user.set(this, key);
	          });
	        }
	        return access(this, function(value) {
	          var data,
	              camelKey = jQuery.camelCase(key);
	          if (elem && value === undefined) {
	            data = data_user.get(elem, key);
	            if (data !== undefined) {
	              return data;
	            }
	            data = data_user.get(elem, camelKey);
	            if (data !== undefined) {
	              return data;
	            }
	            data = dataAttr(elem, camelKey, undefined);
	            if (data !== undefined) {
	              return data;
	            }
	            return;
	          }
	          this.each(function() {
	            var data = data_user.get(this, camelKey);
	            data_user.set(this, camelKey, value);
	            if (key.indexOf("-") !== -1 && data !== undefined) {
	              data_user.set(this, key, value);
	            }
	          });
	        }, null, value, arguments.length > 1, null, true);
	      },
	      removeData: function(key) {
	        return this.each(function() {
	          data_user.remove(this, key);
	        });
	      }
	    });
	    jQuery.extend({
	      queue: function(elem, type, data) {
	        var queue;
	        if (elem) {
	          type = (type || "fx") + "queue";
	          queue = data_priv.get(elem, type);
	          if (data) {
	            if (!queue || jQuery.isArray(data)) {
	              queue = data_priv.access(elem, type, jQuery.makeArray(data));
	            } else {
	              queue.push(data);
	            }
	          }
	          return queue || [];
	        }
	      },
	      dequeue: function(elem, type) {
	        type = type || "fx";
	        var queue = jQuery.queue(elem, type),
	            startLength = queue.length,
	            fn = queue.shift(),
	            hooks = jQuery._queueHooks(elem, type),
	            next = function() {
	              jQuery.dequeue(elem, type);
	            };
	        if (fn === "inprogress") {
	          fn = queue.shift();
	          startLength--;
	        }
	        if (fn) {
	          if (type === "fx") {
	            queue.unshift("inprogress");
	          }
	          delete hooks.stop;
	          fn.call(elem, next, hooks);
	        }
	        if (!startLength && hooks) {
	          hooks.empty.fire();
	        }
	      },
	      _queueHooks: function(elem, type) {
	        var key = type + "queueHooks";
	        return data_priv.get(elem, key) || data_priv.access(elem, key, {empty: jQuery.Callbacks("once memory").add(function() {
	            data_priv.remove(elem, [type + "queue", key]);
	          })});
	      }
	    });
	    jQuery.fn.extend({
	      queue: function(type, data) {
	        var setter = 2;
	        if (typeof type !== "string") {
	          data = type;
	          type = "fx";
	          setter--;
	        }
	        if (arguments.length < setter) {
	          return jQuery.queue(this[0], type);
	        }
	        return data === undefined ? this : this.each(function() {
	          var queue = jQuery.queue(this, type, data);
	          jQuery._queueHooks(this, type);
	          if (type === "fx" && queue[0] !== "inprogress") {
	            jQuery.dequeue(this, type);
	          }
	        });
	      },
	      dequeue: function(type) {
	        return this.each(function() {
	          jQuery.dequeue(this, type);
	        });
	      },
	      clearQueue: function(type) {
	        return this.queue(type || "fx", []);
	      },
	      promise: function(type, obj) {
	        var tmp,
	            count = 1,
	            defer = jQuery.Deferred(),
	            elements = this,
	            i = this.length,
	            resolve = function() {
	              if (!(--count)) {
	                defer.resolveWith(elements, [elements]);
	              }
	            };
	        if (typeof type !== "string") {
	          obj = type;
	          type = undefined;
	        }
	        type = type || "fx";
	        while (i--) {
	          tmp = data_priv.get(elements[i], type + "queueHooks");
	          if (tmp && tmp.empty) {
	            count++;
	            tmp.empty.add(resolve);
	          }
	        }
	        resolve();
	        return defer.promise(obj);
	      }
	    });
	    var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;
	    var cssExpand = ["Top", "Right", "Bottom", "Left"];
	    var isHidden = function(elem, el) {
	      elem = el || elem;
	      return jQuery.css(elem, "display") === "none" || !jQuery.contains(elem.ownerDocument, elem);
	    };
	    var rcheckableType = (/^(?:checkbox|radio)$/i);
	    (function() {
	      var fragment = document.createDocumentFragment(),
	          div = fragment.appendChild(document.createElement("div")),
	          input = document.createElement("input");
	      input.setAttribute("type", "radio");
	      input.setAttribute("checked", "checked");
	      input.setAttribute("name", "t");
	      div.appendChild(input);
	      support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;
	      div.innerHTML = "<textarea>x</textarea>";
	      support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
	    })();
	    var strundefined = typeof undefined;
	    support.focusinBubbles = "onfocusin" in window;
	    var rkeyEvent = /^key/,
	        rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
	        rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	        rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;
	    function returnTrue() {
	      return true;
	    }
	    function returnFalse() {
	      return false;
	    }
	    function safeActiveElement() {
	      try {
	        return document.activeElement;
	      } catch (err) {}
	    }
	    jQuery.event = {
	      global: {},
	      add: function(elem, types, handler, data, selector) {
	        var handleObjIn,
	            eventHandle,
	            tmp,
	            events,
	            t,
	            handleObj,
	            special,
	            handlers,
	            type,
	            namespaces,
	            origType,
	            elemData = data_priv.get(elem);
	        if (!elemData) {
	          return;
	        }
	        if (handler.handler) {
	          handleObjIn = handler;
	          handler = handleObjIn.handler;
	          selector = handleObjIn.selector;
	        }
	        if (!handler.guid) {
	          handler.guid = jQuery.guid++;
	        }
	        if (!(events = elemData.events)) {
	          events = elemData.events = {};
	        }
	        if (!(eventHandle = elemData.handle)) {
	          eventHandle = elemData.handle = function(e) {
	            return typeof jQuery !== strundefined && jQuery.event.triggered !== e.type ? jQuery.event.dispatch.apply(elem, arguments) : undefined;
	          };
	        }
	        types = (types || "").match(rnotwhite) || [""];
	        t = types.length;
	        while (t--) {
	          tmp = rtypenamespace.exec(types[t]) || [];
	          type = origType = tmp[1];
	          namespaces = (tmp[2] || "").split(".").sort();
	          if (!type) {
	            continue;
	          }
	          special = jQuery.event.special[type] || {};
	          type = (selector ? special.delegateType : special.bindType) || type;
	          special = jQuery.event.special[type] || {};
	          handleObj = jQuery.extend({
	            type: type,
	            origType: origType,
	            data: data,
	            handler: handler,
	            guid: handler.guid,
	            selector: selector,
	            needsContext: selector && jQuery.expr.match.needsContext.test(selector),
	            namespace: namespaces.join(".")
	          }, handleObjIn);
	          if (!(handlers = events[type])) {
	            handlers = events[type] = [];
	            handlers.delegateCount = 0;
	            if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
	              if (elem.addEventListener) {
	                elem.addEventListener(type, eventHandle, false);
	              }
	            }
	          }
	          if (special.add) {
	            special.add.call(elem, handleObj);
	            if (!handleObj.handler.guid) {
	              handleObj.handler.guid = handler.guid;
	            }
	          }
	          if (selector) {
	            handlers.splice(handlers.delegateCount++, 0, handleObj);
	          } else {
	            handlers.push(handleObj);
	          }
	          jQuery.event.global[type] = true;
	        }
	      },
	      remove: function(elem, types, handler, selector, mappedTypes) {
	        var j,
	            origCount,
	            tmp,
	            events,
	            t,
	            handleObj,
	            special,
	            handlers,
	            type,
	            namespaces,
	            origType,
	            elemData = data_priv.hasData(elem) && data_priv.get(elem);
	        if (!elemData || !(events = elemData.events)) {
	          return;
	        }
	        types = (types || "").match(rnotwhite) || [""];
	        t = types.length;
	        while (t--) {
	          tmp = rtypenamespace.exec(types[t]) || [];
	          type = origType = tmp[1];
	          namespaces = (tmp[2] || "").split(".").sort();
	          if (!type) {
	            for (type in events) {
	              jQuery.event.remove(elem, type + types[t], handler, selector, true);
	            }
	            continue;
	          }
	          special = jQuery.event.special[type] || {};
	          type = (selector ? special.delegateType : special.bindType) || type;
	          handlers = events[type] || [];
	          tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");
	          origCount = j = handlers.length;
	          while (j--) {
	            handleObj = handlers[j];
	            if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
	              handlers.splice(j, 1);
	              if (handleObj.selector) {
	                handlers.delegateCount--;
	              }
	              if (special.remove) {
	                special.remove.call(elem, handleObj);
	              }
	            }
	          }
	          if (origCount && !handlers.length) {
	            if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
	              jQuery.removeEvent(elem, type, elemData.handle);
	            }
	            delete events[type];
	          }
	        }
	        if (jQuery.isEmptyObject(events)) {
	          delete elemData.handle;
	          data_priv.remove(elem, "events");
	        }
	      },
	      trigger: function(event, data, elem, onlyHandlers) {
	        var i,
	            cur,
	            tmp,
	            bubbleType,
	            ontype,
	            handle,
	            special,
	            eventPath = [elem || document],
	            type = hasOwn.call(event, "type") ? event.type : event,
	            namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];
	        cur = tmp = elem = elem || document;
	        if (elem.nodeType === 3 || elem.nodeType === 8) {
	          return;
	        }
	        if (rfocusMorph.test(type + jQuery.event.triggered)) {
	          return;
	        }
	        if (type.indexOf(".") >= 0) {
	          namespaces = type.split(".");
	          type = namespaces.shift();
	          namespaces.sort();
	        }
	        ontype = type.indexOf(":") < 0 && "on" + type;
	        event = event[jQuery.expando] ? event : new jQuery.Event(type, typeof event === "object" && event);
	        event.isTrigger = onlyHandlers ? 2 : 3;
	        event.namespace = namespaces.join(".");
	        event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
	        event.result = undefined;
	        if (!event.target) {
	          event.target = elem;
	        }
	        data = data == null ? [event] : jQuery.makeArray(data, [event]);
	        special = jQuery.event.special[type] || {};
	        if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
	          return;
	        }
	        if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {
	          bubbleType = special.delegateType || type;
	          if (!rfocusMorph.test(bubbleType + type)) {
	            cur = cur.parentNode;
	          }
	          for (; cur; cur = cur.parentNode) {
	            eventPath.push(cur);
	            tmp = cur;
	          }
	          if (tmp === (elem.ownerDocument || document)) {
	            eventPath.push(tmp.defaultView || tmp.parentWindow || window);
	          }
	        }
	        i = 0;
	        while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {
	          event.type = i > 1 ? bubbleType : special.bindType || type;
	          handle = (data_priv.get(cur, "events") || {})[event.type] && data_priv.get(cur, "handle");
	          if (handle) {
	            handle.apply(cur, data);
	          }
	          handle = ontype && cur[ontype];
	          if (handle && handle.apply && jQuery.acceptData(cur)) {
	            event.result = handle.apply(cur, data);
	            if (event.result === false) {
	              event.preventDefault();
	            }
	          }
	        }
	        event.type = type;
	        if (!onlyHandlers && !event.isDefaultPrevented()) {
	          if ((!special._default || special._default.apply(eventPath.pop(), data) === false) && jQuery.acceptData(elem)) {
	            if (ontype && jQuery.isFunction(elem[type]) && !jQuery.isWindow(elem)) {
	              tmp = elem[ontype];
	              if (tmp) {
	                elem[ontype] = null;
	              }
	              jQuery.event.triggered = type;
	              elem[type]();
	              jQuery.event.triggered = undefined;
	              if (tmp) {
	                elem[ontype] = tmp;
	              }
	            }
	          }
	        }
	        return event.result;
	      },
	      dispatch: function(event) {
	        event = jQuery.event.fix(event);
	        var i,
	            j,
	            ret,
	            matched,
	            handleObj,
	            handlerQueue = [],
	            args = slice.call(arguments),
	            handlers = (data_priv.get(this, "events") || {})[event.type] || [],
	            special = jQuery.event.special[event.type] || {};
	        args[0] = event;
	        event.delegateTarget = this;
	        if (special.preDispatch && special.preDispatch.call(this, event) === false) {
	          return;
	        }
	        handlerQueue = jQuery.event.handlers.call(this, event, handlers);
	        i = 0;
	        while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
	          event.currentTarget = matched.elem;
	          j = 0;
	          while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {
	            if (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) {
	              event.handleObj = handleObj;
	              event.data = handleObj.data;
	              ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
	              if (ret !== undefined) {
	                if ((event.result = ret) === false) {
	                  event.preventDefault();
	                  event.stopPropagation();
	                }
	              }
	            }
	          }
	        }
	        if (special.postDispatch) {
	          special.postDispatch.call(this, event);
	        }
	        return event.result;
	      },
	      handlers: function(event, handlers) {
	        var i,
	            matches,
	            sel,
	            handleObj,
	            handlerQueue = [],
	            delegateCount = handlers.delegateCount,
	            cur = event.target;
	        if (delegateCount && cur.nodeType && (!event.button || event.type !== "click")) {
	          for (; cur !== this; cur = cur.parentNode || this) {
	            if (cur.disabled !== true || event.type !== "click") {
	              matches = [];
	              for (i = 0; i < delegateCount; i++) {
	                handleObj = handlers[i];
	                sel = handleObj.selector + " ";
	                if (matches[sel] === undefined) {
	                  matches[sel] = handleObj.needsContext ? jQuery(sel, this).index(cur) >= 0 : jQuery.find(sel, this, null, [cur]).length;
	                }
	                if (matches[sel]) {
	                  matches.push(handleObj);
	                }
	              }
	              if (matches.length) {
	                handlerQueue.push({
	                  elem: cur,
	                  handlers: matches
	                });
	              }
	            }
	          }
	        }
	        if (delegateCount < handlers.length) {
	          handlerQueue.push({
	            elem: this,
	            handlers: handlers.slice(delegateCount)
	          });
	        }
	        return handlerQueue;
	      },
	      props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
	      fixHooks: {},
	      keyHooks: {
	        props: "char charCode key keyCode".split(" "),
	        filter: function(event, original) {
	          if (event.which == null) {
	            event.which = original.charCode != null ? original.charCode : original.keyCode;
	          }
	          return event;
	        }
	      },
	      mouseHooks: {
	        props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
	        filter: function(event, original) {
	          var eventDoc,
	              doc,
	              body,
	              button = original.button;
	          if (event.pageX == null && original.clientX != null) {
	            eventDoc = event.target.ownerDocument || document;
	            doc = eventDoc.documentElement;
	            body = eventDoc.body;
	            event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
	            event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
	          }
	          if (!event.which && button !== undefined) {
	            event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
	          }
	          return event;
	        }
	      },
	      fix: function(event) {
	        if (event[jQuery.expando]) {
	          return event;
	        }
	        var i,
	            prop,
	            copy,
	            type = event.type,
	            originalEvent = event,
	            fixHook = this.fixHooks[type];
	        if (!fixHook) {
	          this.fixHooks[type] = fixHook = rmouseEvent.test(type) ? this.mouseHooks : rkeyEvent.test(type) ? this.keyHooks : {};
	        }
	        copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;
	        event = new jQuery.Event(originalEvent);
	        i = copy.length;
	        while (i--) {
	          prop = copy[i];
	          event[prop] = originalEvent[prop];
	        }
	        if (!event.target) {
	          event.target = document;
	        }
	        if (event.target.nodeType === 3) {
	          event.target = event.target.parentNode;
	        }
	        return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
	      },
	      special: {
	        load: {noBubble: true},
	        focus: {
	          trigger: function() {
	            if (this !== safeActiveElement() && this.focus) {
	              this.focus();
	              return false;
	            }
	          },
	          delegateType: "focusin"
	        },
	        blur: {
	          trigger: function() {
	            if (this === safeActiveElement() && this.blur) {
	              this.blur();
	              return false;
	            }
	          },
	          delegateType: "focusout"
	        },
	        click: {
	          trigger: function() {
	            if (this.type === "checkbox" && this.click && jQuery.nodeName(this, "input")) {
	              this.click();
	              return false;
	            }
	          },
	          _default: function(event) {
	            return jQuery.nodeName(event.target, "a");
	          }
	        },
	        beforeunload: {postDispatch: function(event) {
	            if (event.result !== undefined && event.originalEvent) {
	              event.originalEvent.returnValue = event.result;
	            }
	          }}
	      },
	      simulate: function(type, elem, event, bubble) {
	        var e = jQuery.extend(new jQuery.Event(), event, {
	          type: type,
	          isSimulated: true,
	          originalEvent: {}
	        });
	        if (bubble) {
	          jQuery.event.trigger(e, null, elem);
	        } else {
	          jQuery.event.dispatch.call(elem, e);
	        }
	        if (e.isDefaultPrevented()) {
	          event.preventDefault();
	        }
	      }
	    };
	    jQuery.removeEvent = function(elem, type, handle) {
	      if (elem.removeEventListener) {
	        elem.removeEventListener(type, handle, false);
	      }
	    };
	    jQuery.Event = function(src, props) {
	      if (!(this instanceof jQuery.Event)) {
	        return new jQuery.Event(src, props);
	      }
	      if (src && src.type) {
	        this.originalEvent = src;
	        this.type = src.type;
	        this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === undefined && src.returnValue === false ? returnTrue : returnFalse;
	      } else {
	        this.type = src;
	      }
	      if (props) {
	        jQuery.extend(this, props);
	      }
	      this.timeStamp = src && src.timeStamp || jQuery.now();
	      this[jQuery.expando] = true;
	    };
	    jQuery.Event.prototype = {
	      isDefaultPrevented: returnFalse,
	      isPropagationStopped: returnFalse,
	      isImmediatePropagationStopped: returnFalse,
	      preventDefault: function() {
	        var e = this.originalEvent;
	        this.isDefaultPrevented = returnTrue;
	        if (e && e.preventDefault) {
	          e.preventDefault();
	        }
	      },
	      stopPropagation: function() {
	        var e = this.originalEvent;
	        this.isPropagationStopped = returnTrue;
	        if (e && e.stopPropagation) {
	          e.stopPropagation();
	        }
	      },
	      stopImmediatePropagation: function() {
	        var e = this.originalEvent;
	        this.isImmediatePropagationStopped = returnTrue;
	        if (e && e.stopImmediatePropagation) {
	          e.stopImmediatePropagation();
	        }
	        this.stopPropagation();
	      }
	    };
	    jQuery.each({
	      mouseenter: "mouseover",
	      mouseleave: "mouseout",
	      pointerenter: "pointerover",
	      pointerleave: "pointerout"
	    }, function(orig, fix) {
	      jQuery.event.special[orig] = {
	        delegateType: fix,
	        bindType: fix,
	        handle: function(event) {
	          var ret,
	              target = this,
	              related = event.relatedTarget,
	              handleObj = event.handleObj;
	          if (!related || (related !== target && !jQuery.contains(target, related))) {
	            event.type = handleObj.origType;
	            ret = handleObj.handler.apply(this, arguments);
	            event.type = fix;
	          }
	          return ret;
	        }
	      };
	    });
	    if (!support.focusinBubbles) {
	      jQuery.each({
	        focus: "focusin",
	        blur: "focusout"
	      }, function(orig, fix) {
	        var handler = function(event) {
	          jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true);
	        };
	        jQuery.event.special[fix] = {
	          setup: function() {
	            var doc = this.ownerDocument || this,
	                attaches = data_priv.access(doc, fix);
	            if (!attaches) {
	              doc.addEventListener(orig, handler, true);
	            }
	            data_priv.access(doc, fix, (attaches || 0) + 1);
	          },
	          teardown: function() {
	            var doc = this.ownerDocument || this,
	                attaches = data_priv.access(doc, fix) - 1;
	            if (!attaches) {
	              doc.removeEventListener(orig, handler, true);
	              data_priv.remove(doc, fix);
	            } else {
	              data_priv.access(doc, fix, attaches);
	            }
	          }
	        };
	      });
	    }
	    jQuery.fn.extend({
	      on: function(types, selector, data, fn, one) {
	        var origFn,
	            type;
	        if (typeof types === "object") {
	          if (typeof selector !== "string") {
	            data = data || selector;
	            selector = undefined;
	          }
	          for (type in types) {
	            this.on(type, selector, data, types[type], one);
	          }
	          return this;
	        }
	        if (data == null && fn == null) {
	          fn = selector;
	          data = selector = undefined;
	        } else if (fn == null) {
	          if (typeof selector === "string") {
	            fn = data;
	            data = undefined;
	          } else {
	            fn = data;
	            data = selector;
	            selector = undefined;
	          }
	        }
	        if (fn === false) {
	          fn = returnFalse;
	        } else if (!fn) {
	          return this;
	        }
	        if (one === 1) {
	          origFn = fn;
	          fn = function(event) {
	            jQuery().off(event);
	            return origFn.apply(this, arguments);
	          };
	          fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
	        }
	        return this.each(function() {
	          jQuery.event.add(this, types, fn, data, selector);
	        });
	      },
	      one: function(types, selector, data, fn) {
	        return this.on(types, selector, data, fn, 1);
	      },
	      off: function(types, selector, fn) {
	        var handleObj,
	            type;
	        if (types && types.preventDefault && types.handleObj) {
	          handleObj = types.handleObj;
	          jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler);
	          return this;
	        }
	        if (typeof types === "object") {
	          for (type in types) {
	            this.off(type, selector, types[type]);
	          }
	          return this;
	        }
	        if (selector === false || typeof selector === "function") {
	          fn = selector;
	          selector = undefined;
	        }
	        if (fn === false) {
	          fn = returnFalse;
	        }
	        return this.each(function() {
	          jQuery.event.remove(this, types, fn, selector);
	        });
	      },
	      trigger: function(type, data) {
	        return this.each(function() {
	          jQuery.event.trigger(type, data, this);
	        });
	      },
	      triggerHandler: function(type, data) {
	        var elem = this[0];
	        if (elem) {
	          return jQuery.event.trigger(type, data, elem, true);
	        }
	      }
	    });
	    var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	        rtagName = /<([\w:]+)/,
	        rhtml = /<|&#?\w+;/,
	        rnoInnerhtml = /<(?:script|style|link)/i,
	        rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	        rscriptType = /^$|\/(?:java|ecma)script/i,
	        rscriptTypeMasked = /^true\/(.*)/,
	        rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
	        wrapMap = {
	          option: [1, "<select multiple='multiple'>", "</select>"],
	          thead: [1, "<table>", "</table>"],
	          col: [2, "<table><colgroup>", "</colgroup></table>"],
	          tr: [2, "<table><tbody>", "</tbody></table>"],
	          td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
	          _default: [0, "", ""]
	        };
	    wrapMap.optgroup = wrapMap.option;
	    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	    wrapMap.th = wrapMap.td;
	    function manipulationTarget(elem, content) {
	      return jQuery.nodeName(elem, "table") && jQuery.nodeName(content.nodeType !== 11 ? content : content.firstChild, "tr") ? elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody")) : elem;
	    }
	    function disableScript(elem) {
	      elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
	      return elem;
	    }
	    function restoreScript(elem) {
	      var match = rscriptTypeMasked.exec(elem.type);
	      if (match) {
	        elem.type = match[1];
	      } else {
	        elem.removeAttribute("type");
	      }
	      return elem;
	    }
	    function setGlobalEval(elems, refElements) {
	      var i = 0,
	          l = elems.length;
	      for (; i < l; i++) {
	        data_priv.set(elems[i], "globalEval", !refElements || data_priv.get(refElements[i], "globalEval"));
	      }
	    }
	    function cloneCopyEvent(src, dest) {
	      var i,
	          l,
	          type,
	          pdataOld,
	          pdataCur,
	          udataOld,
	          udataCur,
	          events;
	      if (dest.nodeType !== 1) {
	        return;
	      }
	      if (data_priv.hasData(src)) {
	        pdataOld = data_priv.access(src);
	        pdataCur = data_priv.set(dest, pdataOld);
	        events = pdataOld.events;
	        if (events) {
	          delete pdataCur.handle;
	          pdataCur.events = {};
	          for (type in events) {
	            for (i = 0, l = events[type].length; i < l; i++) {
	              jQuery.event.add(dest, type, events[type][i]);
	            }
	          }
	        }
	      }
	      if (data_user.hasData(src)) {
	        udataOld = data_user.access(src);
	        udataCur = jQuery.extend({}, udataOld);
	        data_user.set(dest, udataCur);
	      }
	    }
	    function getAll(context, tag) {
	      var ret = context.getElementsByTagName ? context.getElementsByTagName(tag || "*") : context.querySelectorAll ? context.querySelectorAll(tag || "*") : [];
	      return tag === undefined || tag && jQuery.nodeName(context, tag) ? jQuery.merge([context], ret) : ret;
	    }
	    function fixInput(src, dest) {
	      var nodeName = dest.nodeName.toLowerCase();
	      if (nodeName === "input" && rcheckableType.test(src.type)) {
	        dest.checked = src.checked;
	      } else if (nodeName === "input" || nodeName === "textarea") {
	        dest.defaultValue = src.defaultValue;
	      }
	    }
	    jQuery.extend({
	      clone: function(elem, dataAndEvents, deepDataAndEvents) {
	        var i,
	            l,
	            srcElements,
	            destElements,
	            clone = elem.cloneNode(true),
	            inPage = jQuery.contains(elem.ownerDocument, elem);
	        if (!support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {
	          destElements = getAll(clone);
	          srcElements = getAll(elem);
	          for (i = 0, l = srcElements.length; i < l; i++) {
	            fixInput(srcElements[i], destElements[i]);
	          }
	        }
	        if (dataAndEvents) {
	          if (deepDataAndEvents) {
	            srcElements = srcElements || getAll(elem);
	            destElements = destElements || getAll(clone);
	            for (i = 0, l = srcElements.length; i < l; i++) {
	              cloneCopyEvent(srcElements[i], destElements[i]);
	            }
	          } else {
	            cloneCopyEvent(elem, clone);
	          }
	        }
	        destElements = getAll(clone, "script");
	        if (destElements.length > 0) {
	          setGlobalEval(destElements, !inPage && getAll(elem, "script"));
	        }
	        return clone;
	      },
	      buildFragment: function(elems, context, scripts, selection) {
	        var elem,
	            tmp,
	            tag,
	            wrap,
	            contains,
	            j,
	            fragment = context.createDocumentFragment(),
	            nodes = [],
	            i = 0,
	            l = elems.length;
	        for (; i < l; i++) {
	          elem = elems[i];
	          if (elem || elem === 0) {
	            if (jQuery.type(elem) === "object") {
	              jQuery.merge(nodes, elem.nodeType ? [elem] : elem);
	            } else if (!rhtml.test(elem)) {
	              nodes.push(context.createTextNode(elem));
	            } else {
	              tmp = tmp || fragment.appendChild(context.createElement("div"));
	              tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
	              wrap = wrapMap[tag] || wrapMap._default;
	              tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, "<$1></$2>") + wrap[2];
	              j = wrap[0];
	              while (j--) {
	                tmp = tmp.lastChild;
	              }
	              jQuery.merge(nodes, tmp.childNodes);
	              tmp = fragment.firstChild;
	              tmp.textContent = "";
	            }
	          }
	        }
	        fragment.textContent = "";
	        i = 0;
	        while ((elem = nodes[i++])) {
	          if (selection && jQuery.inArray(elem, selection) !== -1) {
	            continue;
	          }
	          contains = jQuery.contains(elem.ownerDocument, elem);
	          tmp = getAll(fragment.appendChild(elem), "script");
	          if (contains) {
	            setGlobalEval(tmp);
	          }
	          if (scripts) {
	            j = 0;
	            while ((elem = tmp[j++])) {
	              if (rscriptType.test(elem.type || "")) {
	                scripts.push(elem);
	              }
	            }
	          }
	        }
	        return fragment;
	      },
	      cleanData: function(elems) {
	        var data,
	            elem,
	            type,
	            key,
	            special = jQuery.event.special,
	            i = 0;
	        for (; (elem = elems[i]) !== undefined; i++) {
	          if (jQuery.acceptData(elem)) {
	            key = elem[data_priv.expando];
	            if (key && (data = data_priv.cache[key])) {
	              if (data.events) {
	                for (type in data.events) {
	                  if (special[type]) {
	                    jQuery.event.remove(elem, type);
	                  } else {
	                    jQuery.removeEvent(elem, type, data.handle);
	                  }
	                }
	              }
	              if (data_priv.cache[key]) {
	                delete data_priv.cache[key];
	              }
	            }
	          }
	          delete data_user.cache[elem[data_user.expando]];
	        }
	      }
	    });
	    jQuery.fn.extend({
	      text: function(value) {
	        return access(this, function(value) {
	          return value === undefined ? jQuery.text(this) : this.empty().each(function() {
	            if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
	              this.textContent = value;
	            }
	          });
	        }, null, value, arguments.length);
	      },
	      append: function() {
	        return this.domManip(arguments, function(elem) {
	          if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
	            var target = manipulationTarget(this, elem);
	            target.appendChild(elem);
	          }
	        });
	      },
	      prepend: function() {
	        return this.domManip(arguments, function(elem) {
	          if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
	            var target = manipulationTarget(this, elem);
	            target.insertBefore(elem, target.firstChild);
	          }
	        });
	      },
	      before: function() {
	        return this.domManip(arguments, function(elem) {
	          if (this.parentNode) {
	            this.parentNode.insertBefore(elem, this);
	          }
	        });
	      },
	      after: function() {
	        return this.domManip(arguments, function(elem) {
	          if (this.parentNode) {
	            this.parentNode.insertBefore(elem, this.nextSibling);
	          }
	        });
	      },
	      remove: function(selector, keepData) {
	        var elem,
	            elems = selector ? jQuery.filter(selector, this) : this,
	            i = 0;
	        for (; (elem = elems[i]) != null; i++) {
	          if (!keepData && elem.nodeType === 1) {
	            jQuery.cleanData(getAll(elem));
	          }
	          if (elem.parentNode) {
	            if (keepData && jQuery.contains(elem.ownerDocument, elem)) {
	              setGlobalEval(getAll(elem, "script"));
	            }
	            elem.parentNode.removeChild(elem);
	          }
	        }
	        return this;
	      },
	      empty: function() {
	        var elem,
	            i = 0;
	        for (; (elem = this[i]) != null; i++) {
	          if (elem.nodeType === 1) {
	            jQuery.cleanData(getAll(elem, false));
	            elem.textContent = "";
	          }
	        }
	        return this;
	      },
	      clone: function(dataAndEvents, deepDataAndEvents) {
	        dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
	        deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
	        return this.map(function() {
	          return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
	        });
	      },
	      html: function(value) {
	        return access(this, function(value) {
	          var elem = this[0] || {},
	              i = 0,
	              l = this.length;
	          if (value === undefined && elem.nodeType === 1) {
	            return elem.innerHTML;
	          }
	          if (typeof value === "string" && !rnoInnerhtml.test(value) && !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {
	            value = value.replace(rxhtmlTag, "<$1></$2>");
	            try {
	              for (; i < l; i++) {
	                elem = this[i] || {};
	                if (elem.nodeType === 1) {
	                  jQuery.cleanData(getAll(elem, false));
	                  elem.innerHTML = value;
	                }
	              }
	              elem = 0;
	            } catch (e) {}
	          }
	          if (elem) {
	            this.empty().append(value);
	          }
	        }, null, value, arguments.length);
	      },
	      replaceWith: function() {
	        var arg = arguments[0];
	        this.domManip(arguments, function(elem) {
	          arg = this.parentNode;
	          jQuery.cleanData(getAll(this));
	          if (arg) {
	            arg.replaceChild(elem, this);
	          }
	        });
	        return arg && (arg.length || arg.nodeType) ? this : this.remove();
	      },
	      detach: function(selector) {
	        return this.remove(selector, true);
	      },
	      domManip: function(args, callback) {
	        args = concat.apply([], args);
	        var fragment,
	            first,
	            scripts,
	            hasScripts,
	            node,
	            doc,
	            i = 0,
	            l = this.length,
	            set = this,
	            iNoClone = l - 1,
	            value = args[0],
	            isFunction = jQuery.isFunction(value);
	        if (isFunction || (l > 1 && typeof value === "string" && !support.checkClone && rchecked.test(value))) {
	          return this.each(function(index) {
	            var self = set.eq(index);
	            if (isFunction) {
	              args[0] = value.call(this, index, self.html());
	            }
	            self.domManip(args, callback);
	          });
	        }
	        if (l) {
	          fragment = jQuery.buildFragment(args, this[0].ownerDocument, false, this);
	          first = fragment.firstChild;
	          if (fragment.childNodes.length === 1) {
	            fragment = first;
	          }
	          if (first) {
	            scripts = jQuery.map(getAll(fragment, "script"), disableScript);
	            hasScripts = scripts.length;
	            for (; i < l; i++) {
	              node = fragment;
	              if (i !== iNoClone) {
	                node = jQuery.clone(node, true, true);
	                if (hasScripts) {
	                  jQuery.merge(scripts, getAll(node, "script"));
	                }
	              }
	              callback.call(this[i], node, i);
	            }
	            if (hasScripts) {
	              doc = scripts[scripts.length - 1].ownerDocument;
	              jQuery.map(scripts, restoreScript);
	              for (i = 0; i < hasScripts; i++) {
	                node = scripts[i];
	                if (rscriptType.test(node.type || "") && !data_priv.access(node, "globalEval") && jQuery.contains(doc, node)) {
	                  if (node.src) {
	                    if (jQuery._evalUrl) {
	                      jQuery._evalUrl(node.src);
	                    }
	                  } else {
	                    jQuery.globalEval(node.textContent.replace(rcleanScript, ""));
	                  }
	                }
	              }
	            }
	          }
	        }
	        return this;
	      }
	    });
	    jQuery.each({
	      appendTo: "append",
	      prependTo: "prepend",
	      insertBefore: "before",
	      insertAfter: "after",
	      replaceAll: "replaceWith"
	    }, function(name, original) {
	      jQuery.fn[name] = function(selector) {
	        var elems,
	            ret = [],
	            insert = jQuery(selector),
	            last = insert.length - 1,
	            i = 0;
	        for (; i <= last; i++) {
	          elems = i === last ? this : this.clone(true);
	          jQuery(insert[i])[original](elems);
	          push.apply(ret, elems.get());
	        }
	        return this.pushStack(ret);
	      };
	    });
	    var iframe,
	        elemdisplay = {};
	    function actualDisplay(name, doc) {
	      var style,
	          elem = jQuery(doc.createElement(name)).appendTo(doc.body),
	          display = window.getDefaultComputedStyle && (style = window.getDefaultComputedStyle(elem[0])) ? style.display : jQuery.css(elem[0], "display");
	      elem.detach();
	      return display;
	    }
	    function defaultDisplay(nodeName) {
	      var doc = document,
	          display = elemdisplay[nodeName];
	      if (!display) {
	        display = actualDisplay(nodeName, doc);
	        if (display === "none" || !display) {
	          iframe = (iframe || jQuery("<iframe frameborder='0' width='0' height='0'/>")).appendTo(doc.documentElement);
	          doc = iframe[0].contentDocument;
	          doc.write();
	          doc.close();
	          display = actualDisplay(nodeName, doc);
	          iframe.detach();
	        }
	        elemdisplay[nodeName] = display;
	      }
	      return display;
	    }
	    var rmargin = (/^margin/);
	    var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");
	    var getStyles = function(elem) {
	      return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
	    };
	    function curCSS(elem, name, computed) {
	      var width,
	          minWidth,
	          maxWidth,
	          ret,
	          style = elem.style;
	      computed = computed || getStyles(elem);
	      if (computed) {
	        ret = computed.getPropertyValue(name) || computed[name];
	      }
	      if (computed) {
	        if (ret === "" && !jQuery.contains(elem.ownerDocument, elem)) {
	          ret = jQuery.style(elem, name);
	        }
	        if (rnumnonpx.test(ret) && rmargin.test(name)) {
	          width = style.width;
	          minWidth = style.minWidth;
	          maxWidth = style.maxWidth;
	          style.minWidth = style.maxWidth = style.width = ret;
	          ret = computed.width;
	          style.width = width;
	          style.minWidth = minWidth;
	          style.maxWidth = maxWidth;
	        }
	      }
	      return ret !== undefined ? ret + "" : ret;
	    }
	    function addGetHookIf(conditionFn, hookFn) {
	      return {get: function() {
	          if (conditionFn()) {
	            delete this.get;
	            return;
	          }
	          return (this.get = hookFn).apply(this, arguments);
	        }};
	    }
	    (function() {
	      var pixelPositionVal,
	          boxSizingReliableVal,
	          docElem = document.documentElement,
	          container = document.createElement("div"),
	          div = document.createElement("div");
	      if (!div.style) {
	        return;
	      }
	      div.style.backgroundClip = "content-box";
	      div.cloneNode(true).style.backgroundClip = "";
	      support.clearCloneStyle = div.style.backgroundClip === "content-box";
	      container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" + "position:absolute";
	      container.appendChild(div);
	      function computePixelPositionAndBoxSizingReliable() {
	        div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" + "box-sizing:border-box;display:block;margin-top:1%;top:1%;" + "border:1px;padding:1px;width:4px;position:absolute";
	        div.innerHTML = "";
	        docElem.appendChild(container);
	        var divStyle = window.getComputedStyle(div, null);
	        pixelPositionVal = divStyle.top !== "1%";
	        boxSizingReliableVal = divStyle.width === "4px";
	        docElem.removeChild(container);
	      }
	      if (window.getComputedStyle) {
	        jQuery.extend(support, {
	          pixelPosition: function() {
	            computePixelPositionAndBoxSizingReliable();
	            return pixelPositionVal;
	          },
	          boxSizingReliable: function() {
	            if (boxSizingReliableVal == null) {
	              computePixelPositionAndBoxSizingReliable();
	            }
	            return boxSizingReliableVal;
	          },
	          reliableMarginRight: function() {
	            var ret,
	                marginDiv = div.appendChild(document.createElement("div"));
	            marginDiv.style.cssText = div.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" + "box-sizing:content-box;display:block;margin:0;border:0;padding:0";
	            marginDiv.style.marginRight = marginDiv.style.width = "0";
	            div.style.width = "1px";
	            docElem.appendChild(container);
	            ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);
	            docElem.removeChild(container);
	            return ret;
	          }
	        });
	      }
	    })();
	    jQuery.swap = function(elem, options, callback, args) {
	      var ret,
	          name,
	          old = {};
	      for (name in options) {
	        old[name] = elem.style[name];
	        elem.style[name] = options[name];
	      }
	      ret = callback.apply(elem, args || []);
	      for (name in options) {
	        elem.style[name] = old[name];
	      }
	      return ret;
	    };
	    var rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	        rnumsplit = new RegExp("^(" + pnum + ")(.*)$", "i"),
	        rrelNum = new RegExp("^([+-])=(" + pnum + ")", "i"),
	        cssShow = {
	          position: "absolute",
	          visibility: "hidden",
	          display: "block"
	        },
	        cssNormalTransform = {
	          letterSpacing: "0",
	          fontWeight: "400"
	        },
	        cssPrefixes = ["Webkit", "O", "Moz", "ms"];
	    function vendorPropName(style, name) {
	      if (name in style) {
	        return name;
	      }
	      var capName = name[0].toUpperCase() + name.slice(1),
	          origName = name,
	          i = cssPrefixes.length;
	      while (i--) {
	        name = cssPrefixes[i] + capName;
	        if (name in style) {
	          return name;
	        }
	      }
	      return origName;
	    }
	    function setPositiveNumber(elem, value, subtract) {
	      var matches = rnumsplit.exec(value);
	      return matches ? Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || "px") : value;
	    }
	    function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
	      var i = extra === (isBorderBox ? "border" : "content") ? 4 : name === "width" ? 1 : 0,
	          val = 0;
	      for (; i < 4; i += 2) {
	        if (extra === "margin") {
	          val += jQuery.css(elem, extra + cssExpand[i], true, styles);
	        }
	        if (isBorderBox) {
	          if (extra === "content") {
	            val -= jQuery.css(elem, "padding" + cssExpand[i], true, styles);
	          }
	          if (extra !== "margin") {
	            val -= jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
	          }
	        } else {
	          val += jQuery.css(elem, "padding" + cssExpand[i], true, styles);
	          if (extra !== "padding") {
	            val += jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
	          }
	        }
	      }
	      return val;
	    }
	    function getWidthOrHeight(elem, name, extra) {
	      var valueIsBorderBox = true,
	          val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
	          styles = getStyles(elem),
	          isBorderBox = jQuery.css(elem, "boxSizing", false, styles) === "border-box";
	      if (val <= 0 || val == null) {
	        val = curCSS(elem, name, styles);
	        if (val < 0 || val == null) {
	          val = elem.style[name];
	        }
	        if (rnumnonpx.test(val)) {
	          return val;
	        }
	        valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === elem.style[name]);
	        val = parseFloat(val) || 0;
	      }
	      return (val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles)) + "px";
	    }
	    function showHide(elements, show) {
	      var display,
	          elem,
	          hidden,
	          values = [],
	          index = 0,
	          length = elements.length;
	      for (; index < length; index++) {
	        elem = elements[index];
	        if (!elem.style) {
	          continue;
	        }
	        values[index] = data_priv.get(elem, "olddisplay");
	        display = elem.style.display;
	        if (show) {
	          if (!values[index] && display === "none") {
	            elem.style.display = "";
	          }
	          if (elem.style.display === "" && isHidden(elem)) {
	            values[index] = data_priv.access(elem, "olddisplay", defaultDisplay(elem.nodeName));
	          }
	        } else {
	          hidden = isHidden(elem);
	          if (display !== "none" || !hidden) {
	            data_priv.set(elem, "olddisplay", hidden ? display : jQuery.css(elem, "display"));
	          }
	        }
	      }
	      for (index = 0; index < length; index++) {
	        elem = elements[index];
	        if (!elem.style) {
	          continue;
	        }
	        if (!show || elem.style.display === "none" || elem.style.display === "") {
	          elem.style.display = show ? values[index] || "" : "none";
	        }
	      }
	      return elements;
	    }
	    jQuery.extend({
	      cssHooks: {opacity: {get: function(elem, computed) {
	            if (computed) {
	              var ret = curCSS(elem, "opacity");
	              return ret === "" ? "1" : ret;
	            }
	          }}},
	      cssNumber: {
	        "columnCount": true,
	        "fillOpacity": true,
	        "flexGrow": true,
	        "flexShrink": true,
	        "fontWeight": true,
	        "lineHeight": true,
	        "opacity": true,
	        "order": true,
	        "orphans": true,
	        "widows": true,
	        "zIndex": true,
	        "zoom": true
	      },
	      cssProps: {"float": "cssFloat"},
	      style: function(elem, name, value, extra) {
	        if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
	          return;
	        }
	        var ret,
	            type,
	            hooks,
	            origName = jQuery.camelCase(name),
	            style = elem.style;
	        name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(style, origName));
	        hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
	        if (value !== undefined) {
	          type = typeof value;
	          if (type === "string" && (ret = rrelNum.exec(value))) {
	            value = (ret[1] + 1) * ret[2] + parseFloat(jQuery.css(elem, name));
	            type = "number";
	          }
	          if (value == null || value !== value) {
	            return;
	          }
	          if (type === "number" && !jQuery.cssNumber[origName]) {
	            value += "px";
	          }
	          if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
	            style[name] = "inherit";
	          }
	          if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
	            style[name] = value;
	          }
	        } else {
	          if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
	            return ret;
	          }
	          return style[name];
	        }
	      },
	      css: function(elem, name, extra, styles) {
	        var val,
	            num,
	            hooks,
	            origName = jQuery.camelCase(name);
	        name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(elem.style, origName));
	        hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
	        if (hooks && "get" in hooks) {
	          val = hooks.get(elem, true, extra);
	        }
	        if (val === undefined) {
	          val = curCSS(elem, name, styles);
	        }
	        if (val === "normal" && name in cssNormalTransform) {
	          val = cssNormalTransform[name];
	        }
	        if (extra === "" || extra) {
	          num = parseFloat(val);
	          return extra === true || jQuery.isNumeric(num) ? num || 0 : val;
	        }
	        return val;
	      }
	    });
	    jQuery.each(["height", "width"], function(i, name) {
	      jQuery.cssHooks[name] = {
	        get: function(elem, computed, extra) {
	          if (computed) {
	            return rdisplayswap.test(jQuery.css(elem, "display")) && elem.offsetWidth === 0 ? jQuery.swap(elem, cssShow, function() {
	              return getWidthOrHeight(elem, name, extra);
	            }) : getWidthOrHeight(elem, name, extra);
	          }
	        },
	        set: function(elem, value, extra) {
	          var styles = extra && getStyles(elem);
	          return setPositiveNumber(elem, value, extra ? augmentWidthOrHeight(elem, name, extra, jQuery.css(elem, "boxSizing", false, styles) === "border-box", styles) : 0);
	        }
	      };
	    });
	    jQuery.cssHooks.marginRight = addGetHookIf(support.reliableMarginRight, function(elem, computed) {
	      if (computed) {
	        return jQuery.swap(elem, {"display": "inline-block"}, curCSS, [elem, "marginRight"]);
	      }
	    });
	    jQuery.each({
	      margin: "",
	      padding: "",
	      border: "Width"
	    }, function(prefix, suffix) {
	      jQuery.cssHooks[prefix + suffix] = {expand: function(value) {
	          var i = 0,
	              expanded = {},
	              parts = typeof value === "string" ? value.split(" ") : [value];
	          for (; i < 4; i++) {
	            expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
	          }
	          return expanded;
	        }};
	      if (!rmargin.test(prefix)) {
	        jQuery.cssHooks[prefix + suffix].set = setPositiveNumber;
	      }
	    });
	    jQuery.fn.extend({
	      css: function(name, value) {
	        return access(this, function(elem, name, value) {
	          var styles,
	              len,
	              map = {},
	              i = 0;
	          if (jQuery.isArray(name)) {
	            styles = getStyles(elem);
	            len = name.length;
	            for (; i < len; i++) {
	              map[name[i]] = jQuery.css(elem, name[i], false, styles);
	            }
	            return map;
	          }
	          return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
	        }, name, value, arguments.length > 1);
	      },
	      show: function() {
	        return showHide(this, true);
	      },
	      hide: function() {
	        return showHide(this);
	      },
	      toggle: function(state) {
	        if (typeof state === "boolean") {
	          return state ? this.show() : this.hide();
	        }
	        return this.each(function() {
	          if (isHidden(this)) {
	            jQuery(this).show();
	          } else {
	            jQuery(this).hide();
	          }
	        });
	      }
	    });
	    function Tween(elem, options, prop, end, easing) {
	      return new Tween.prototype.init(elem, options, prop, end, easing);
	    }
	    jQuery.Tween = Tween;
	    Tween.prototype = {
	      constructor: Tween,
	      init: function(elem, options, prop, end, easing, unit) {
	        this.elem = elem;
	        this.prop = prop;
	        this.easing = easing || "swing";
	        this.options = options;
	        this.start = this.now = this.cur();
	        this.end = end;
	        this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px");
	      },
	      cur: function() {
	        var hooks = Tween.propHooks[this.prop];
	        return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
	      },
	      run: function(percent) {
	        var eased,
	            hooks = Tween.propHooks[this.prop];
	        if (this.options.duration) {
	          this.pos = eased = jQuery.easing[this.easing](percent, this.options.duration * percent, 0, 1, this.options.duration);
	        } else {
	          this.pos = eased = percent;
	        }
	        this.now = (this.end - this.start) * eased + this.start;
	        if (this.options.step) {
	          this.options.step.call(this.elem, this.now, this);
	        }
	        if (hooks && hooks.set) {
	          hooks.set(this);
	        } else {
	          Tween.propHooks._default.set(this);
	        }
	        return this;
	      }
	    };
	    Tween.prototype.init.prototype = Tween.prototype;
	    Tween.propHooks = {_default: {
	        get: function(tween) {
	          var result;
	          if (tween.elem[tween.prop] != null && (!tween.elem.style || tween.elem.style[tween.prop] == null)) {
	            return tween.elem[tween.prop];
	          }
	          result = jQuery.css(tween.elem, tween.prop, "");
	          return !result || result === "auto" ? 0 : result;
	        },
	        set: function(tween) {
	          if (jQuery.fx.step[tween.prop]) {
	            jQuery.fx.step[tween.prop](tween);
	          } else if (tween.elem.style && (tween.elem.style[jQuery.cssProps[tween.prop]] != null || jQuery.cssHooks[tween.prop])) {
	            jQuery.style(tween.elem, tween.prop, tween.now + tween.unit);
	          } else {
	            tween.elem[tween.prop] = tween.now;
	          }
	        }
	      }};
	    Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {set: function(tween) {
	        if (tween.elem.nodeType && tween.elem.parentNode) {
	          tween.elem[tween.prop] = tween.now;
	        }
	      }};
	    jQuery.easing = {
	      linear: function(p) {
	        return p;
	      },
	      swing: function(p) {
	        return 0.5 - Math.cos(p * Math.PI) / 2;
	      }
	    };
	    jQuery.fx = Tween.prototype.init;
	    jQuery.fx.step = {};
	    var fxNow,
	        timerId,
	        rfxtypes = /^(?:toggle|show|hide)$/,
	        rfxnum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i"),
	        rrun = /queueHooks$/,
	        animationPrefilters = [defaultPrefilter],
	        tweeners = {"*": [function(prop, value) {
	            var tween = this.createTween(prop, value),
	                target = tween.cur(),
	                parts = rfxnum.exec(value),
	                unit = parts && parts[3] || (jQuery.cssNumber[prop] ? "" : "px"),
	                start = (jQuery.cssNumber[prop] || unit !== "px" && +target) && rfxnum.exec(jQuery.css(tween.elem, prop)),
	                scale = 1,
	                maxIterations = 20;
	            if (start && start[3] !== unit) {
	              unit = unit || start[3];
	              parts = parts || [];
	              start = +target || 1;
	              do {
	                scale = scale || ".5";
	                start = start / scale;
	                jQuery.style(tween.elem, prop, start + unit);
	              } while (scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations);
	            }
	            if (parts) {
	              start = tween.start = +start || +target || 0;
	              tween.unit = unit;
	              tween.end = parts[1] ? start + (parts[1] + 1) * parts[2] : +parts[2];
	            }
	            return tween;
	          }]};
	    function createFxNow() {
	      setTimeout(function() {
	        fxNow = undefined;
	      });
	      return (fxNow = jQuery.now());
	    }
	    function genFx(type, includeWidth) {
	      var which,
	          i = 0,
	          attrs = {height: type};
	      includeWidth = includeWidth ? 1 : 0;
	      for (; i < 4; i += 2 - includeWidth) {
	        which = cssExpand[i];
	        attrs["margin" + which] = attrs["padding" + which] = type;
	      }
	      if (includeWidth) {
	        attrs.opacity = attrs.width = type;
	      }
	      return attrs;
	    }
	    function createTween(value, prop, animation) {
	      var tween,
	          collection = (tweeners[prop] || []).concat(tweeners["*"]),
	          index = 0,
	          length = collection.length;
	      for (; index < length; index++) {
	        if ((tween = collection[index].call(animation, prop, value))) {
	          return tween;
	        }
	      }
	    }
	    function defaultPrefilter(elem, props, opts) {
	      var prop,
	          value,
	          toggle,
	          tween,
	          hooks,
	          oldfire,
	          display,
	          checkDisplay,
	          anim = this,
	          orig = {},
	          style = elem.style,
	          hidden = elem.nodeType && isHidden(elem),
	          dataShow = data_priv.get(elem, "fxshow");
	      if (!opts.queue) {
	        hooks = jQuery._queueHooks(elem, "fx");
	        if (hooks.unqueued == null) {
	          hooks.unqueued = 0;
	          oldfire = hooks.empty.fire;
	          hooks.empty.fire = function() {
	            if (!hooks.unqueued) {
	              oldfire();
	            }
	          };
	        }
	        hooks.unqueued++;
	        anim.always(function() {
	          anim.always(function() {
	            hooks.unqueued--;
	            if (!jQuery.queue(elem, "fx").length) {
	              hooks.empty.fire();
	            }
	          });
	        });
	      }
	      if (elem.nodeType === 1 && ("height" in props || "width" in props)) {
	        opts.overflow = [style.overflow, style.overflowX, style.overflowY];
	        display = jQuery.css(elem, "display");
	        checkDisplay = display === "none" ? data_priv.get(elem, "olddisplay") || defaultDisplay(elem.nodeName) : display;
	        if (checkDisplay === "inline" && jQuery.css(elem, "float") === "none") {
	          style.display = "inline-block";
	        }
	      }
	      if (opts.overflow) {
	        style.overflow = "hidden";
	        anim.always(function() {
	          style.overflow = opts.overflow[0];
	          style.overflowX = opts.overflow[1];
	          style.overflowY = opts.overflow[2];
	        });
	      }
	      for (prop in props) {
	        value = props[prop];
	        if (rfxtypes.exec(value)) {
	          delete props[prop];
	          toggle = toggle || value === "toggle";
	          if (value === (hidden ? "hide" : "show")) {
	            if (value === "show" && dataShow && dataShow[prop] !== undefined) {
	              hidden = true;
	            } else {
	              continue;
	            }
	          }
	          orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem, prop);
	        } else {
	          display = undefined;
	        }
	      }
	      if (!jQuery.isEmptyObject(orig)) {
	        if (dataShow) {
	          if ("hidden" in dataShow) {
	            hidden = dataShow.hidden;
	          }
	        } else {
	          dataShow = data_priv.access(elem, "fxshow", {});
	        }
	        if (toggle) {
	          dataShow.hidden = !hidden;
	        }
	        if (hidden) {
	          jQuery(elem).show();
	        } else {
	          anim.done(function() {
	            jQuery(elem).hide();
	          });
	        }
	        anim.done(function() {
	          var prop;
	          data_priv.remove(elem, "fxshow");
	          for (prop in orig) {
	            jQuery.style(elem, prop, orig[prop]);
	          }
	        });
	        for (prop in orig) {
	          tween = createTween(hidden ? dataShow[prop] : 0, prop, anim);
	          if (!(prop in dataShow)) {
	            dataShow[prop] = tween.start;
	            if (hidden) {
	              tween.end = tween.start;
	              tween.start = prop === "width" || prop === "height" ? 1 : 0;
	            }
	          }
	        }
	      } else if ((display === "none" ? defaultDisplay(elem.nodeName) : display) === "inline") {
	        style.display = display;
	      }
	    }
	    function propFilter(props, specialEasing) {
	      var index,
	          name,
	          easing,
	          value,
	          hooks;
	      for (index in props) {
	        name = jQuery.camelCase(index);
	        easing = specialEasing[name];
	        value = props[index];
	        if (jQuery.isArray(value)) {
	          easing = value[1];
	          value = props[index] = value[0];
	        }
	        if (index !== name) {
	          props[name] = value;
	          delete props[index];
	        }
	        hooks = jQuery.cssHooks[name];
	        if (hooks && "expand" in hooks) {
	          value = hooks.expand(value);
	          delete props[name];
	          for (index in value) {
	            if (!(index in props)) {
	              props[index] = value[index];
	              specialEasing[index] = easing;
	            }
	          }
	        } else {
	          specialEasing[name] = easing;
	        }
	      }
	    }
	    function Animation(elem, properties, options) {
	      var result,
	          stopped,
	          index = 0,
	          length = animationPrefilters.length,
	          deferred = jQuery.Deferred().always(function() {
	            delete tick.elem;
	          }),
	          tick = function() {
	            if (stopped) {
	              return false;
	            }
	            var currentTime = fxNow || createFxNow(),
	                remaining = Math.max(0, animation.startTime + animation.duration - currentTime),
	                temp = remaining / animation.duration || 0,
	                percent = 1 - temp,
	                index = 0,
	                length = animation.tweens.length;
	            for (; index < length; index++) {
	              animation.tweens[index].run(percent);
	            }
	            deferred.notifyWith(elem, [animation, percent, remaining]);
	            if (percent < 1 && length) {
	              return remaining;
	            } else {
	              deferred.resolveWith(elem, [animation]);
	              return false;
	            }
	          },
	          animation = deferred.promise({
	            elem: elem,
	            props: jQuery.extend({}, properties),
	            opts: jQuery.extend(true, {specialEasing: {}}, options),
	            originalProperties: properties,
	            originalOptions: options,
	            startTime: fxNow || createFxNow(),
	            duration: options.duration,
	            tweens: [],
	            createTween: function(prop, end) {
	              var tween = jQuery.Tween(elem, animation.opts, prop, end, animation.opts.specialEasing[prop] || animation.opts.easing);
	              animation.tweens.push(tween);
	              return tween;
	            },
	            stop: function(gotoEnd) {
	              var index = 0,
	                  length = gotoEnd ? animation.tweens.length : 0;
	              if (stopped) {
	                return this;
	              }
	              stopped = true;
	              for (; index < length; index++) {
	                animation.tweens[index].run(1);
	              }
	              if (gotoEnd) {
	                deferred.resolveWith(elem, [animation, gotoEnd]);
	              } else {
	                deferred.rejectWith(elem, [animation, gotoEnd]);
	              }
	              return this;
	            }
	          }),
	          props = animation.props;
	      propFilter(props, animation.opts.specialEasing);
	      for (; index < length; index++) {
	        result = animationPrefilters[index].call(animation, elem, props, animation.opts);
	        if (result) {
	          return result;
	        }
	      }
	      jQuery.map(props, createTween, animation);
	      if (jQuery.isFunction(animation.opts.start)) {
	        animation.opts.start.call(elem, animation);
	      }
	      jQuery.fx.timer(jQuery.extend(tick, {
	        elem: elem,
	        anim: animation,
	        queue: animation.opts.queue
	      }));
	      return animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
	    }
	    jQuery.Animation = jQuery.extend(Animation, {
	      tweener: function(props, callback) {
	        if (jQuery.isFunction(props)) {
	          callback = props;
	          props = ["*"];
	        } else {
	          props = props.split(" ");
	        }
	        var prop,
	            index = 0,
	            length = props.length;
	        for (; index < length; index++) {
	          prop = props[index];
	          tweeners[prop] = tweeners[prop] || [];
	          tweeners[prop].unshift(callback);
	        }
	      },
	      prefilter: function(callback, prepend) {
	        if (prepend) {
	          animationPrefilters.unshift(callback);
	        } else {
	          animationPrefilters.push(callback);
	        }
	      }
	    });
	    jQuery.speed = function(speed, easing, fn) {
	      var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
	        complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
	        duration: speed,
	        easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
	      };
	      opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration : opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;
	      if (opt.queue == null || opt.queue === true) {
	        opt.queue = "fx";
	      }
	      opt.old = opt.complete;
	      opt.complete = function() {
	        if (jQuery.isFunction(opt.old)) {
	          opt.old.call(this);
	        }
	        if (opt.queue) {
	          jQuery.dequeue(this, opt.queue);
	        }
	      };
	      return opt;
	    };
	    jQuery.fn.extend({
	      fadeTo: function(speed, to, easing, callback) {
	        return this.filter(isHidden).css("opacity", 0).show().end().animate({opacity: to}, speed, easing, callback);
	      },
	      animate: function(prop, speed, easing, callback) {
	        var empty = jQuery.isEmptyObject(prop),
	            optall = jQuery.speed(speed, easing, callback),
	            doAnimation = function() {
	              var anim = Animation(this, jQuery.extend({}, prop), optall);
	              if (empty || data_priv.get(this, "finish")) {
	                anim.stop(true);
	              }
	            };
	        doAnimation.finish = doAnimation;
	        return empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
	      },
	      stop: function(type, clearQueue, gotoEnd) {
	        var stopQueue = function(hooks) {
	          var stop = hooks.stop;
	          delete hooks.stop;
	          stop(gotoEnd);
	        };
	        if (typeof type !== "string") {
	          gotoEnd = clearQueue;
	          clearQueue = type;
	          type = undefined;
	        }
	        if (clearQueue && type !== false) {
	          this.queue(type || "fx", []);
	        }
	        return this.each(function() {
	          var dequeue = true,
	              index = type != null && type + "queueHooks",
	              timers = jQuery.timers,
	              data = data_priv.get(this);
	          if (index) {
	            if (data[index] && data[index].stop) {
	              stopQueue(data[index]);
	            }
	          } else {
	            for (index in data) {
	              if (data[index] && data[index].stop && rrun.test(index)) {
	                stopQueue(data[index]);
	              }
	            }
	          }
	          for (index = timers.length; index--; ) {
	            if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
	              timers[index].anim.stop(gotoEnd);
	              dequeue = false;
	              timers.splice(index, 1);
	            }
	          }
	          if (dequeue || !gotoEnd) {
	            jQuery.dequeue(this, type);
	          }
	        });
	      },
	      finish: function(type) {
	        if (type !== false) {
	          type = type || "fx";
	        }
	        return this.each(function() {
	          var index,
	              data = data_priv.get(this),
	              queue = data[type + "queue"],
	              hooks = data[type + "queueHooks"],
	              timers = jQuery.timers,
	              length = queue ? queue.length : 0;
	          data.finish = true;
	          jQuery.queue(this, type, []);
	          if (hooks && hooks.stop) {
	            hooks.stop.call(this, true);
	          }
	          for (index = timers.length; index--; ) {
	            if (timers[index].elem === this && timers[index].queue === type) {
	              timers[index].anim.stop(true);
	              timers.splice(index, 1);
	            }
	          }
	          for (index = 0; index < length; index++) {
	            if (queue[index] && queue[index].finish) {
	              queue[index].finish.call(this);
	            }
	          }
	          delete data.finish;
	        });
	      }
	    });
	    jQuery.each(["toggle", "show", "hide"], function(i, name) {
	      var cssFn = jQuery.fn[name];
	      jQuery.fn[name] = function(speed, easing, callback) {
	        return speed == null || typeof speed === "boolean" ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
	      };
	    });
	    jQuery.each({
	      slideDown: genFx("show"),
	      slideUp: genFx("hide"),
	      slideToggle: genFx("toggle"),
	      fadeIn: {opacity: "show"},
	      fadeOut: {opacity: "hide"},
	      fadeToggle: {opacity: "toggle"}
	    }, function(name, props) {
	      jQuery.fn[name] = function(speed, easing, callback) {
	        return this.animate(props, speed, easing, callback);
	      };
	    });
	    jQuery.timers = [];
	    jQuery.fx.tick = function() {
	      var timer,
	          i = 0,
	          timers = jQuery.timers;
	      fxNow = jQuery.now();
	      for (; i < timers.length; i++) {
	        timer = timers[i];
	        if (!timer() && timers[i] === timer) {
	          timers.splice(i--, 1);
	        }
	      }
	      if (!timers.length) {
	        jQuery.fx.stop();
	      }
	      fxNow = undefined;
	    };
	    jQuery.fx.timer = function(timer) {
	      jQuery.timers.push(timer);
	      if (timer()) {
	        jQuery.fx.start();
	      } else {
	        jQuery.timers.pop();
	      }
	    };
	    jQuery.fx.interval = 13;
	    jQuery.fx.start = function() {
	      if (!timerId) {
	        timerId = setInterval(jQuery.fx.tick, jQuery.fx.interval);
	      }
	    };
	    jQuery.fx.stop = function() {
	      clearInterval(timerId);
	      timerId = null;
	    };
	    jQuery.fx.speeds = {
	      slow: 600,
	      fast: 200,
	      _default: 400
	    };
	    jQuery.fn.delay = function(time, type) {
	      time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
	      type = type || "fx";
	      return this.queue(type, function(next, hooks) {
	        var timeout = setTimeout(next, time);
	        hooks.stop = function() {
	          clearTimeout(timeout);
	        };
	      });
	    };
	    (function() {
	      var input = document.createElement("input"),
	          select = document.createElement("select"),
	          opt = select.appendChild(document.createElement("option"));
	      input.type = "checkbox";
	      support.checkOn = input.value !== "";
	      support.optSelected = opt.selected;
	      select.disabled = true;
	      support.optDisabled = !opt.disabled;
	      input = document.createElement("input");
	      input.value = "t";
	      input.type = "radio";
	      support.radioValue = input.value === "t";
	    })();
	    var nodeHook,
	        boolHook,
	        attrHandle = jQuery.expr.attrHandle;
	    jQuery.fn.extend({
	      attr: function(name, value) {
	        return access(this, jQuery.attr, name, value, arguments.length > 1);
	      },
	      removeAttr: function(name) {
	        return this.each(function() {
	          jQuery.removeAttr(this, name);
	        });
	      }
	    });
	    jQuery.extend({
	      attr: function(elem, name, value) {
	        var hooks,
	            ret,
	            nType = elem.nodeType;
	        if (!elem || nType === 3 || nType === 8 || nType === 2) {
	          return;
	        }
	        if (typeof elem.getAttribute === strundefined) {
	          return jQuery.prop(elem, name, value);
	        }
	        if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
	          name = name.toLowerCase();
	          hooks = jQuery.attrHooks[name] || (jQuery.expr.match.bool.test(name) ? boolHook : nodeHook);
	        }
	        if (value !== undefined) {
	          if (value === null) {
	            jQuery.removeAttr(elem, name);
	          } else if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
	            return ret;
	          } else {
	            elem.setAttribute(name, value + "");
	            return value;
	          }
	        } else if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
	          return ret;
	        } else {
	          ret = jQuery.find.attr(elem, name);
	          return ret == null ? undefined : ret;
	        }
	      },
	      removeAttr: function(elem, value) {
	        var name,
	            propName,
	            i = 0,
	            attrNames = value && value.match(rnotwhite);
	        if (attrNames && elem.nodeType === 1) {
	          while ((name = attrNames[i++])) {
	            propName = jQuery.propFix[name] || name;
	            if (jQuery.expr.match.bool.test(name)) {
	              elem[propName] = false;
	            }
	            elem.removeAttribute(name);
	          }
	        }
	      },
	      attrHooks: {type: {set: function(elem, value) {
	            if (!support.radioValue && value === "radio" && jQuery.nodeName(elem, "input")) {
	              var val = elem.value;
	              elem.setAttribute("type", value);
	              if (val) {
	                elem.value = val;
	              }
	              return value;
	            }
	          }}}
	    });
	    boolHook = {set: function(elem, value, name) {
	        if (value === false) {
	          jQuery.removeAttr(elem, name);
	        } else {
	          elem.setAttribute(name, name);
	        }
	        return name;
	      }};
	    jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function(i, name) {
	      var getter = attrHandle[name] || jQuery.find.attr;
	      attrHandle[name] = function(elem, name, isXML) {
	        var ret,
	            handle;
	        if (!isXML) {
	          handle = attrHandle[name];
	          attrHandle[name] = ret;
	          ret = getter(elem, name, isXML) != null ? name.toLowerCase() : null;
	          attrHandle[name] = handle;
	        }
	        return ret;
	      };
	    });
	    var rfocusable = /^(?:input|select|textarea|button)$/i;
	    jQuery.fn.extend({
	      prop: function(name, value) {
	        return access(this, jQuery.prop, name, value, arguments.length > 1);
	      },
	      removeProp: function(name) {
	        return this.each(function() {
	          delete this[jQuery.propFix[name] || name];
	        });
	      }
	    });
	    jQuery.extend({
	      propFix: {
	        "for": "htmlFor",
	        "class": "className"
	      },
	      prop: function(elem, name, value) {
	        var ret,
	            hooks,
	            notxml,
	            nType = elem.nodeType;
	        if (!elem || nType === 3 || nType === 8 || nType === 2) {
	          return;
	        }
	        notxml = nType !== 1 || !jQuery.isXMLDoc(elem);
	        if (notxml) {
	          name = jQuery.propFix[name] || name;
	          hooks = jQuery.propHooks[name];
	        }
	        if (value !== undefined) {
	          return hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined ? ret : (elem[name] = value);
	        } else {
	          return hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null ? ret : elem[name];
	        }
	      },
	      propHooks: {tabIndex: {get: function(elem) {
	            return elem.hasAttribute("tabindex") || rfocusable.test(elem.nodeName) || elem.href ? elem.tabIndex : -1;
	          }}}
	    });
	    if (!support.optSelected) {
	      jQuery.propHooks.selected = {get: function(elem) {
	          var parent = elem.parentNode;
	          if (parent && parent.parentNode) {
	            parent.parentNode.selectedIndex;
	          }
	          return null;
	        }};
	    }
	    jQuery.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
	      jQuery.propFix[this.toLowerCase()] = this;
	    });
	    var rclass = /[\t\r\n\f]/g;
	    jQuery.fn.extend({
	      addClass: function(value) {
	        var classes,
	            elem,
	            cur,
	            clazz,
	            j,
	            finalValue,
	            proceed = typeof value === "string" && value,
	            i = 0,
	            len = this.length;
	        if (jQuery.isFunction(value)) {
	          return this.each(function(j) {
	            jQuery(this).addClass(value.call(this, j, this.className));
	          });
	        }
	        if (proceed) {
	          classes = (value || "").match(rnotwhite) || [];
	          for (; i < len; i++) {
	            elem = this[i];
	            cur = elem.nodeType === 1 && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : " ");
	            if (cur) {
	              j = 0;
	              while ((clazz = classes[j++])) {
	                if (cur.indexOf(" " + clazz + " ") < 0) {
	                  cur += clazz + " ";
	                }
	              }
	              finalValue = jQuery.trim(cur);
	              if (elem.className !== finalValue) {
	                elem.className = finalValue;
	              }
	            }
	          }
	        }
	        return this;
	      },
	      removeClass: function(value) {
	        var classes,
	            elem,
	            cur,
	            clazz,
	            j,
	            finalValue,
	            proceed = arguments.length === 0 || typeof value === "string" && value,
	            i = 0,
	            len = this.length;
	        if (jQuery.isFunction(value)) {
	          return this.each(function(j) {
	            jQuery(this).removeClass(value.call(this, j, this.className));
	          });
	        }
	        if (proceed) {
	          classes = (value || "").match(rnotwhite) || [];
	          for (; i < len; i++) {
	            elem = this[i];
	            cur = elem.nodeType === 1 && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : "");
	            if (cur) {
	              j = 0;
	              while ((clazz = classes[j++])) {
	                while (cur.indexOf(" " + clazz + " ") >= 0) {
	                  cur = cur.replace(" " + clazz + " ", " ");
	                }
	              }
	              finalValue = value ? jQuery.trim(cur) : "";
	              if (elem.className !== finalValue) {
	                elem.className = finalValue;
	              }
	            }
	          }
	        }
	        return this;
	      },
	      toggleClass: function(value, stateVal) {
	        var type = typeof value;
	        if (typeof stateVal === "boolean" && type === "string") {
	          return stateVal ? this.addClass(value) : this.removeClass(value);
	        }
	        if (jQuery.isFunction(value)) {
	          return this.each(function(i) {
	            jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
	          });
	        }
	        return this.each(function() {
	          if (type === "string") {
	            var className,
	                i = 0,
	                self = jQuery(this),
	                classNames = value.match(rnotwhite) || [];
	            while ((className = classNames[i++])) {
	              if (self.hasClass(className)) {
	                self.removeClass(className);
	              } else {
	                self.addClass(className);
	              }
	            }
	          } else if (type === strundefined || type === "boolean") {
	            if (this.className) {
	              data_priv.set(this, "__className__", this.className);
	            }
	            this.className = this.className || value === false ? "" : data_priv.get(this, "__className__") || "";
	          }
	        });
	      },
	      hasClass: function(selector) {
	        var className = " " + selector + " ",
	            i = 0,
	            l = this.length;
	        for (; i < l; i++) {
	          if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) >= 0) {
	            return true;
	          }
	        }
	        return false;
	      }
	    });
	    var rreturn = /\r/g;
	    jQuery.fn.extend({val: function(value) {
	        var hooks,
	            ret,
	            isFunction,
	            elem = this[0];
	        if (!arguments.length) {
	          if (elem) {
	            hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];
	            if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
	              return ret;
	            }
	            ret = elem.value;
	            return typeof ret === "string" ? ret.replace(rreturn, "") : ret == null ? "" : ret;
	          }
	          return;
	        }
	        isFunction = jQuery.isFunction(value);
	        return this.each(function(i) {
	          var val;
	          if (this.nodeType !== 1) {
	            return;
	          }
	          if (isFunction) {
	            val = value.call(this, i, jQuery(this).val());
	          } else {
	            val = value;
	          }
	          if (val == null) {
	            val = "";
	          } else if (typeof val === "number") {
	            val += "";
	          } else if (jQuery.isArray(val)) {
	            val = jQuery.map(val, function(value) {
	              return value == null ? "" : value + "";
	            });
	          }
	          hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];
	          if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
	            this.value = val;
	          }
	        });
	      }});
	    jQuery.extend({valHooks: {
	        option: {get: function(elem) {
	            var val = jQuery.find.attr(elem, "value");
	            return val != null ? val : jQuery.trim(jQuery.text(elem));
	          }},
	        select: {
	          get: function(elem) {
	            var value,
	                option,
	                options = elem.options,
	                index = elem.selectedIndex,
	                one = elem.type === "select-one" || index < 0,
	                values = one ? null : [],
	                max = one ? index + 1 : options.length,
	                i = index < 0 ? max : one ? index : 0;
	            for (; i < max; i++) {
	              option = options[i];
	              if ((option.selected || i === index) && (support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {
	                value = jQuery(option).val();
	                if (one) {
	                  return value;
	                }
	                values.push(value);
	              }
	            }
	            return values;
	          },
	          set: function(elem, value) {
	            var optionSet,
	                option,
	                options = elem.options,
	                values = jQuery.makeArray(value),
	                i = options.length;
	            while (i--) {
	              option = options[i];
	              if ((option.selected = jQuery.inArray(option.value, values) >= 0)) {
	                optionSet = true;
	              }
	            }
	            if (!optionSet) {
	              elem.selectedIndex = -1;
	            }
	            return values;
	          }
	        }
	      }});
	    jQuery.each(["radio", "checkbox"], function() {
	      jQuery.valHooks[this] = {set: function(elem, value) {
	          if (jQuery.isArray(value)) {
	            return (elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0);
	          }
	        }};
	      if (!support.checkOn) {
	        jQuery.valHooks[this].get = function(elem) {
	          return elem.getAttribute("value") === null ? "on" : elem.value;
	        };
	      }
	    });
	    jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick " + "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + "change select submit keydown keypress keyup error contextmenu").split(" "), function(i, name) {
	      jQuery.fn[name] = function(data, fn) {
	        return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
	      };
	    });
	    jQuery.fn.extend({
	      hover: function(fnOver, fnOut) {
	        return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
	      },
	      bind: function(types, data, fn) {
	        return this.on(types, null, data, fn);
	      },
	      unbind: function(types, fn) {
	        return this.off(types, null, fn);
	      },
	      delegate: function(selector, types, data, fn) {
	        return this.on(types, selector, data, fn);
	      },
	      undelegate: function(selector, types, fn) {
	        return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
	      }
	    });
	    var nonce = jQuery.now();
	    var rquery = (/\?/);
	    jQuery.parseJSON = function(data) {
	      return JSON.parse(data + "");
	    };
	    jQuery.parseXML = function(data) {
	      var xml,
	          tmp;
	      if (!data || typeof data !== "string") {
	        return null;
	      }
	      try {
	        tmp = new DOMParser();
	        xml = tmp.parseFromString(data, "text/xml");
	      } catch (e) {
	        xml = undefined;
	      }
	      if (!xml || xml.getElementsByTagName("parsererror").length) {
	        jQuery.error("Invalid XML: " + data);
	      }
	      return xml;
	    };
	    var ajaxLocParts,
	        ajaxLocation,
	        rhash = /#.*$/,
	        rts = /([?&])_=[^&]*/,
	        rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
	        rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	        rnoContent = /^(?:GET|HEAD)$/,
	        rprotocol = /^\/\//,
	        rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
	        prefilters = {},
	        transports = {},
	        allTypes = "*/".concat("*");
	    try {
	      ajaxLocation = location.href;
	    } catch (e) {
	      ajaxLocation = document.createElement("a");
	      ajaxLocation.href = "";
	      ajaxLocation = ajaxLocation.href;
	    }
	    ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];
	    function addToPrefiltersOrTransports(structure) {
	      return function(dataTypeExpression, func) {
	        if (typeof dataTypeExpression !== "string") {
	          func = dataTypeExpression;
	          dataTypeExpression = "*";
	        }
	        var dataType,
	            i = 0,
	            dataTypes = dataTypeExpression.toLowerCase().match(rnotwhite) || [];
	        if (jQuery.isFunction(func)) {
	          while ((dataType = dataTypes[i++])) {
	            if (dataType[0] === "+") {
	              dataType = dataType.slice(1) || "*";
	              (structure[dataType] = structure[dataType] || []).unshift(func);
	            } else {
	              (structure[dataType] = structure[dataType] || []).push(func);
	            }
	          }
	        }
	      };
	    }
	    function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
	      var inspected = {},
	          seekingTransport = (structure === transports);
	      function inspect(dataType) {
	        var selected;
	        inspected[dataType] = true;
	        jQuery.each(structure[dataType] || [], function(_, prefilterOrFactory) {
	          var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
	          if (typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]) {
	            options.dataTypes.unshift(dataTypeOrTransport);
	            inspect(dataTypeOrTransport);
	            return false;
	          } else if (seekingTransport) {
	            return !(selected = dataTypeOrTransport);
	          }
	        });
	        return selected;
	      }
	      return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
	    }
	    function ajaxExtend(target, src) {
	      var key,
	          deep,
	          flatOptions = jQuery.ajaxSettings.flatOptions || {};
	      for (key in src) {
	        if (src[key] !== undefined) {
	          (flatOptions[key] ? target : (deep || (deep = {})))[key] = src[key];
	        }
	      }
	      if (deep) {
	        jQuery.extend(true, target, deep);
	      }
	      return target;
	    }
	    function ajaxHandleResponses(s, jqXHR, responses) {
	      var ct,
	          type,
	          finalDataType,
	          firstDataType,
	          contents = s.contents,
	          dataTypes = s.dataTypes;
	      while (dataTypes[0] === "*") {
	        dataTypes.shift();
	        if (ct === undefined) {
	          ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
	        }
	      }
	      if (ct) {
	        for (type in contents) {
	          if (contents[type] && contents[type].test(ct)) {
	            dataTypes.unshift(type);
	            break;
	          }
	        }
	      }
	      if (dataTypes[0] in responses) {
	        finalDataType = dataTypes[0];
	      } else {
	        for (type in responses) {
	          if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
	            finalDataType = type;
	            break;
	          }
	          if (!firstDataType) {
	            firstDataType = type;
	          }
	        }
	        finalDataType = finalDataType || firstDataType;
	      }
	      if (finalDataType) {
	        if (finalDataType !== dataTypes[0]) {
	          dataTypes.unshift(finalDataType);
	        }
	        return responses[finalDataType];
	      }
	    }
	    function ajaxConvert(s, response, jqXHR, isSuccess) {
	      var conv2,
	          current,
	          conv,
	          tmp,
	          prev,
	          converters = {},
	          dataTypes = s.dataTypes.slice();
	      if (dataTypes[1]) {
	        for (conv in s.converters) {
	          converters[conv.toLowerCase()] = s.converters[conv];
	        }
	      }
	      current = dataTypes.shift();
	      while (current) {
	        if (s.responseFields[current]) {
	          jqXHR[s.responseFields[current]] = response;
	        }
	        if (!prev && isSuccess && s.dataFilter) {
	          response = s.dataFilter(response, s.dataType);
	        }
	        prev = current;
	        current = dataTypes.shift();
	        if (current) {
	          if (current === "*") {
	            current = prev;
	          } else if (prev !== "*" && prev !== current) {
	            conv = converters[prev + " " + current] || converters["* " + current];
	            if (!conv) {
	              for (conv2 in converters) {
	                tmp = conv2.split(" ");
	                if (tmp[1] === current) {
	                  conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
	                  if (conv) {
	                    if (conv === true) {
	                      conv = converters[conv2];
	                    } else if (converters[conv2] !== true) {
	                      current = tmp[0];
	                      dataTypes.unshift(tmp[1]);
	                    }
	                    break;
	                  }
	                }
	              }
	            }
	            if (conv !== true) {
	              if (conv && s["throws"]) {
	                response = conv(response);
	              } else {
	                try {
	                  response = conv(response);
	                } catch (e) {
	                  return {
	                    state: "parsererror",
	                    error: conv ? e : "No conversion from " + prev + " to " + current
	                  };
	                }
	              }
	            }
	          }
	        }
	      }
	      return {
	        state: "success",
	        data: response
	      };
	    }
	    jQuery.extend({
	      active: 0,
	      lastModified: {},
	      etag: {},
	      ajaxSettings: {
	        url: ajaxLocation,
	        type: "GET",
	        isLocal: rlocalProtocol.test(ajaxLocParts[1]),
	        global: true,
	        processData: true,
	        async: true,
	        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	        accepts: {
	          "*": allTypes,
	          text: "text/plain",
	          html: "text/html",
	          xml: "application/xml, text/xml",
	          json: "application/json, text/javascript"
	        },
	        contents: {
	          xml: /xml/,
	          html: /html/,
	          json: /json/
	        },
	        responseFields: {
	          xml: "responseXML",
	          text: "responseText",
	          json: "responseJSON"
	        },
	        converters: {
	          "* text": String,
	          "text html": true,
	          "text json": jQuery.parseJSON,
	          "text xml": jQuery.parseXML
	        },
	        flatOptions: {
	          url: true,
	          context: true
	        }
	      },
	      ajaxSetup: function(target, settings) {
	        return settings ? ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) : ajaxExtend(jQuery.ajaxSettings, target);
	      },
	      ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
	      ajaxTransport: addToPrefiltersOrTransports(transports),
	      ajax: function(url, options) {
	        if (typeof url === "object") {
	          options = url;
	          url = undefined;
	        }
	        options = options || {};
	        var transport,
	            cacheURL,
	            responseHeadersString,
	            responseHeaders,
	            timeoutTimer,
	            parts,
	            fireGlobals,
	            i,
	            s = jQuery.ajaxSetup({}, options),
	            callbackContext = s.context || s,
	            globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery(callbackContext) : jQuery.event,
	            deferred = jQuery.Deferred(),
	            completeDeferred = jQuery.Callbacks("once memory"),
	            statusCode = s.statusCode || {},
	            requestHeaders = {},
	            requestHeadersNames = {},
	            state = 0,
	            strAbort = "canceled",
	            jqXHR = {
	              readyState: 0,
	              getResponseHeader: function(key) {
	                var match;
	                if (state === 2) {
	                  if (!responseHeaders) {
	                    responseHeaders = {};
	                    while ((match = rheaders.exec(responseHeadersString))) {
	                      responseHeaders[match[1].toLowerCase()] = match[2];
	                    }
	                  }
	                  match = responseHeaders[key.toLowerCase()];
	                }
	                return match == null ? null : match;
	              },
	              getAllResponseHeaders: function() {
	                return state === 2 ? responseHeadersString : null;
	              },
	              setRequestHeader: function(name, value) {
	                var lname = name.toLowerCase();
	                if (!state) {
	                  name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
	                  requestHeaders[name] = value;
	                }
	                return this;
	              },
	              overrideMimeType: function(type) {
	                if (!state) {
	                  s.mimeType = type;
	                }
	                return this;
	              },
	              statusCode: function(map) {
	                var code;
	                if (map) {
	                  if (state < 2) {
	                    for (code in map) {
	                      statusCode[code] = [statusCode[code], map[code]];
	                    }
	                  } else {
	                    jqXHR.always(map[jqXHR.status]);
	                  }
	                }
	                return this;
	              },
	              abort: function(statusText) {
	                var finalText = statusText || strAbort;
	                if (transport) {
	                  transport.abort(finalText);
	                }
	                done(0, finalText);
	                return this;
	              }
	            };
	        deferred.promise(jqXHR).complete = completeDeferred.add;
	        jqXHR.success = jqXHR.done;
	        jqXHR.error = jqXHR.fail;
	        s.url = ((url || s.url || ajaxLocation) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");
	        s.type = options.method || options.type || s.method || s.type;
	        s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().match(rnotwhite) || [""];
	        if (s.crossDomain == null) {
	          parts = rurl.exec(s.url.toLowerCase());
	          s.crossDomain = !!(parts && (parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] || (parts[3] || (parts[1] === "http:" ? "80" : "443")) !== (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? "80" : "443"))));
	        }
	        if (s.data && s.processData && typeof s.data !== "string") {
	          s.data = jQuery.param(s.data, s.traditional);
	        }
	        inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
	        if (state === 2) {
	          return jqXHR;
	        }
	        fireGlobals = s.global;
	        if (fireGlobals && jQuery.active++ === 0) {
	          jQuery.event.trigger("ajaxStart");
	        }
	        s.type = s.type.toUpperCase();
	        s.hasContent = !rnoContent.test(s.type);
	        cacheURL = s.url;
	        if (!s.hasContent) {
	          if (s.data) {
	            cacheURL = (s.url += (rquery.test(cacheURL) ? "&" : "?") + s.data);
	            delete s.data;
	          }
	          if (s.cache === false) {
	            s.url = rts.test(cacheURL) ? cacheURL.replace(rts, "$1_=" + nonce++) : cacheURL + (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce++;
	          }
	        }
	        if (s.ifModified) {
	          if (jQuery.lastModified[cacheURL]) {
	            jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]);
	          }
	          if (jQuery.etag[cacheURL]) {
	            jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL]);
	          }
	        }
	        if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
	          jqXHR.setRequestHeader("Content-Type", s.contentType);
	        }
	        jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]);
	        for (i in s.headers) {
	          jqXHR.setRequestHeader(i, s.headers[i]);
	        }
	        if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
	          return jqXHR.abort();
	        }
	        strAbort = "abort";
	        for (i in {
	          success: 1,
	          error: 1,
	          complete: 1
	        }) {
	          jqXHR[i](s[i]);
	        }
	        transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
	        if (!transport) {
	          done(-1, "No Transport");
	        } else {
	          jqXHR.readyState = 1;
	          if (fireGlobals) {
	            globalEventContext.trigger("ajaxSend", [jqXHR, s]);
	          }
	          if (s.async && s.timeout > 0) {
	            timeoutTimer = setTimeout(function() {
	              jqXHR.abort("timeout");
	            }, s.timeout);
	          }
	          try {
	            state = 1;
	            transport.send(requestHeaders, done);
	          } catch (e) {
	            if (state < 2) {
	              done(-1, e);
	            } else {
	              throw e;
	            }
	          }
	        }
	        function done(status, nativeStatusText, responses, headers) {
	          var isSuccess,
	              success,
	              error,
	              response,
	              modified,
	              statusText = nativeStatusText;
	          if (state === 2) {
	            return;
	          }
	          state = 2;
	          if (timeoutTimer) {
	            clearTimeout(timeoutTimer);
	          }
	          transport = undefined;
	          responseHeadersString = headers || "";
	          jqXHR.readyState = status > 0 ? 4 : 0;
	          isSuccess = status >= 200 && status < 300 || status === 304;
	          if (responses) {
	            response = ajaxHandleResponses(s, jqXHR, responses);
	          }
	          response = ajaxConvert(s, response, jqXHR, isSuccess);
	          if (isSuccess) {
	            if (s.ifModified) {
	              modified = jqXHR.getResponseHeader("Last-Modified");
	              if (modified) {
	                jQuery.lastModified[cacheURL] = modified;
	              }
	              modified = jqXHR.getResponseHeader("etag");
	              if (modified) {
	                jQuery.etag[cacheURL] = modified;
	              }
	            }
	            if (status === 204 || s.type === "HEAD") {
	              statusText = "nocontent";
	            } else if (status === 304) {
	              statusText = "notmodified";
	            } else {
	              statusText = response.state;
	              success = response.data;
	              error = response.error;
	              isSuccess = !error;
	            }
	          } else {
	            error = statusText;
	            if (status || !statusText) {
	              statusText = "error";
	              if (status < 0) {
	                status = 0;
	              }
	            }
	          }
	          jqXHR.status = status;
	          jqXHR.statusText = (nativeStatusText || statusText) + "";
	          if (isSuccess) {
	            deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
	          } else {
	            deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
	          }
	          jqXHR.statusCode(statusCode);
	          statusCode = undefined;
	          if (fireGlobals) {
	            globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [jqXHR, s, isSuccess ? success : error]);
	          }
	          completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);
	          if (fireGlobals) {
	            globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
	            if (!(--jQuery.active)) {
	              jQuery.event.trigger("ajaxStop");
	            }
	          }
	        }
	        return jqXHR;
	      },
	      getJSON: function(url, data, callback) {
	        return jQuery.get(url, data, callback, "json");
	      },
	      getScript: function(url, callback) {
	        return jQuery.get(url, undefined, callback, "script");
	      }
	    });
	    jQuery.each(["get", "post"], function(i, method) {
	      jQuery[method] = function(url, data, callback, type) {
	        if (jQuery.isFunction(data)) {
	          type = type || callback;
	          callback = data;
	          data = undefined;
	        }
	        return jQuery.ajax({
	          url: url,
	          type: method,
	          dataType: type,
	          data: data,
	          success: callback
	        });
	      };
	    });
	    jQuery.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(i, type) {
	      jQuery.fn[type] = function(fn) {
	        return this.on(type, fn);
	      };
	    });
	    jQuery._evalUrl = function(url) {
	      return jQuery.ajax({
	        url: url,
	        type: "GET",
	        dataType: "script",
	        async: false,
	        global: false,
	        "throws": true
	      });
	    };
	    jQuery.fn.extend({
	      wrapAll: function(html) {
	        var wrap;
	        if (jQuery.isFunction(html)) {
	          return this.each(function(i) {
	            jQuery(this).wrapAll(html.call(this, i));
	          });
	        }
	        if (this[0]) {
	          wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);
	          if (this[0].parentNode) {
	            wrap.insertBefore(this[0]);
	          }
	          wrap.map(function() {
	            var elem = this;
	            while (elem.firstElementChild) {
	              elem = elem.firstElementChild;
	            }
	            return elem;
	          }).append(this);
	        }
	        return this;
	      },
	      wrapInner: function(html) {
	        if (jQuery.isFunction(html)) {
	          return this.each(function(i) {
	            jQuery(this).wrapInner(html.call(this, i));
	          });
	        }
	        return this.each(function() {
	          var self = jQuery(this),
	              contents = self.contents();
	          if (contents.length) {
	            contents.wrapAll(html);
	          } else {
	            self.append(html);
	          }
	        });
	      },
	      wrap: function(html) {
	        var isFunction = jQuery.isFunction(html);
	        return this.each(function(i) {
	          jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
	        });
	      },
	      unwrap: function() {
	        return this.parent().each(function() {
	          if (!jQuery.nodeName(this, "body")) {
	            jQuery(this).replaceWith(this.childNodes);
	          }
	        }).end();
	      }
	    });
	    jQuery.expr.filters.hidden = function(elem) {
	      return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
	    };
	    jQuery.expr.filters.visible = function(elem) {
	      return !jQuery.expr.filters.hidden(elem);
	    };
	    var r20 = /%20/g,
	        rbracket = /\[\]$/,
	        rCRLF = /\r?\n/g,
	        rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	        rsubmittable = /^(?:input|select|textarea|keygen)/i;
	    function buildParams(prefix, obj, traditional, add) {
	      var name;
	      if (jQuery.isArray(obj)) {
	        jQuery.each(obj, function(i, v) {
	          if (traditional || rbracket.test(prefix)) {
	            add(prefix, v);
	          } else {
	            buildParams(prefix + "[" + (typeof v === "object" ? i : "") + "]", v, traditional, add);
	          }
	        });
	      } else if (!traditional && jQuery.type(obj) === "object") {
	        for (name in obj) {
	          buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
	        }
	      } else {
	        add(prefix, obj);
	      }
	    }
	    jQuery.param = function(a, traditional) {
	      var prefix,
	          s = [],
	          add = function(key, value) {
	            value = jQuery.isFunction(value) ? value() : (value == null ? "" : value);
	            s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
	          };
	      if (traditional === undefined) {
	        traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	      }
	      if (jQuery.isArray(a) || (a.jquery && !jQuery.isPlainObject(a))) {
	        jQuery.each(a, function() {
	          add(this.name, this.value);
	        });
	      } else {
	        for (prefix in a) {
	          buildParams(prefix, a[prefix], traditional, add);
	        }
	      }
	      return s.join("&").replace(r20, "+");
	    };
	    jQuery.fn.extend({
	      serialize: function() {
	        return jQuery.param(this.serializeArray());
	      },
	      serializeArray: function() {
	        return this.map(function() {
	          var elements = jQuery.prop(this, "elements");
	          return elements ? jQuery.makeArray(elements) : this;
	        }).filter(function() {
	          var type = this.type;
	          return this.name && !jQuery(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
	        }).map(function(i, elem) {
	          var val = jQuery(this).val();
	          return val == null ? null : jQuery.isArray(val) ? jQuery.map(val, function(val) {
	            return {
	              name: elem.name,
	              value: val.replace(rCRLF, "\r\n")
	            };
	          }) : {
	            name: elem.name,
	            value: val.replace(rCRLF, "\r\n")
	          };
	        }).get();
	      }
	    });
	    jQuery.ajaxSettings.xhr = function() {
	      try {
	        return new XMLHttpRequest();
	      } catch (e) {}
	    };
	    var xhrId = 0,
	        xhrCallbacks = {},
	        xhrSuccessStatus = {
	          0: 200,
	          1223: 204
	        },
	        xhrSupported = jQuery.ajaxSettings.xhr();
	    if (window.ActiveXObject) {
	      jQuery(window).on("unload", function() {
	        for (var key in xhrCallbacks) {
	          xhrCallbacks[key]();
	        }
	      });
	    }
	    support.cors = !!xhrSupported && ("withCredentials" in xhrSupported);
	    support.ajax = xhrSupported = !!xhrSupported;
	    jQuery.ajaxTransport(function(options) {
	      var callback;
	      if (support.cors || xhrSupported && !options.crossDomain) {
	        return {
	          send: function(headers, complete) {
	            var i,
	                xhr = options.xhr(),
	                id = ++xhrId;
	            xhr.open(options.type, options.url, options.async, options.username, options.password);
	            if (options.xhrFields) {
	              for (i in options.xhrFields) {
	                xhr[i] = options.xhrFields[i];
	              }
	            }
	            if (options.mimeType && xhr.overrideMimeType) {
	              xhr.overrideMimeType(options.mimeType);
	            }
	            if (!options.crossDomain && !headers["X-Requested-With"]) {
	              headers["X-Requested-With"] = "XMLHttpRequest";
	            }
	            for (i in headers) {
	              xhr.setRequestHeader(i, headers[i]);
	            }
	            callback = function(type) {
	              return function() {
	                if (callback) {
	                  delete xhrCallbacks[id];
	                  callback = xhr.onload = xhr.onerror = null;
	                  if (type === "abort") {
	                    xhr.abort();
	                  } else if (type === "error") {
	                    complete(xhr.status, xhr.statusText);
	                  } else {
	                    complete(xhrSuccessStatus[xhr.status] || xhr.status, xhr.statusText, typeof xhr.responseText === "string" ? {text: xhr.responseText} : undefined, xhr.getAllResponseHeaders());
	                  }
	                }
	              };
	            };
	            xhr.onload = callback();
	            xhr.onerror = callback("error");
	            callback = xhrCallbacks[id] = callback("abort");
	            try {
	              xhr.send(options.hasContent && options.data || null);
	            } catch (e) {
	              if (callback) {
	                throw e;
	              }
	            }
	          },
	          abort: function() {
	            if (callback) {
	              callback();
	            }
	          }
	        };
	      }
	    });
	    jQuery.ajaxSetup({
	      accepts: {script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},
	      contents: {script: /(?:java|ecma)script/},
	      converters: {"text script": function(text) {
	          jQuery.globalEval(text);
	          return text;
	        }}
	    });
	    jQuery.ajaxPrefilter("script", function(s) {
	      if (s.cache === undefined) {
	        s.cache = false;
	      }
	      if (s.crossDomain) {
	        s.type = "GET";
	      }
	    });
	    jQuery.ajaxTransport("script", function(s) {
	      if (s.crossDomain) {
	        var script,
	            callback;
	        return {
	          send: function(_, complete) {
	            script = jQuery("<script>").prop({
	              async: true,
	              charset: s.scriptCharset,
	              src: s.url
	            }).on("load error", callback = function(evt) {
	              script.remove();
	              callback = null;
	              if (evt) {
	                complete(evt.type === "error" ? 404 : 200, evt.type);
	              }
	            });
	            document.head.appendChild(script[0]);
	          },
	          abort: function() {
	            if (callback) {
	              callback();
	            }
	          }
	        };
	      }
	    });
	    var oldCallbacks = [],
	        rjsonp = /(=)\?(?=&|$)|\?\?/;
	    jQuery.ajaxSetup({
	      jsonp: "callback",
	      jsonpCallback: function() {
	        var callback = oldCallbacks.pop() || (jQuery.expando + "_" + (nonce++));
	        this[callback] = true;
	        return callback;
	      }
	    });
	    jQuery.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {
	      var callbackName,
	          overwritten,
	          responseContainer,
	          jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? "url" : typeof s.data === "string" && !(s.contentType || "").indexOf("application/x-www-form-urlencoded") && rjsonp.test(s.data) && "data");
	      if (jsonProp || s.dataTypes[0] === "jsonp") {
	        callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;
	        if (jsonProp) {
	          s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
	        } else if (s.jsonp !== false) {
	          s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
	        }
	        s.converters["script json"] = function() {
	          if (!responseContainer) {
	            jQuery.error(callbackName + " was not called");
	          }
	          return responseContainer[0];
	        };
	        s.dataTypes[0] = "json";
	        overwritten = window[callbackName];
	        window[callbackName] = function() {
	          responseContainer = arguments;
	        };
	        jqXHR.always(function() {
	          window[callbackName] = overwritten;
	          if (s[callbackName]) {
	            s.jsonpCallback = originalSettings.jsonpCallback;
	            oldCallbacks.push(callbackName);
	          }
	          if (responseContainer && jQuery.isFunction(overwritten)) {
	            overwritten(responseContainer[0]);
	          }
	          responseContainer = overwritten = undefined;
	        });
	        return "script";
	      }
	    });
	    jQuery.parseHTML = function(data, context, keepScripts) {
	      if (!data || typeof data !== "string") {
	        return null;
	      }
	      if (typeof context === "boolean") {
	        keepScripts = context;
	        context = false;
	      }
	      context = context || document;
	      var parsed = rsingleTag.exec(data),
	          scripts = !keepScripts && [];
	      if (parsed) {
	        return [context.createElement(parsed[1])];
	      }
	      parsed = jQuery.buildFragment([data], context, scripts);
	      if (scripts && scripts.length) {
	        jQuery(scripts).remove();
	      }
	      return jQuery.merge([], parsed.childNodes);
	    };
	    var _load = jQuery.fn.load;
	    jQuery.fn.load = function(url, params, callback) {
	      if (typeof url !== "string" && _load) {
	        return _load.apply(this, arguments);
	      }
	      var selector,
	          type,
	          response,
	          self = this,
	          off = url.indexOf(" ");
	      if (off >= 0) {
	        selector = jQuery.trim(url.slice(off));
	        url = url.slice(0, off);
	      }
	      if (jQuery.isFunction(params)) {
	        callback = params;
	        params = undefined;
	      } else if (params && typeof params === "object") {
	        type = "POST";
	      }
	      if (self.length > 0) {
	        jQuery.ajax({
	          url: url,
	          type: type,
	          dataType: "html",
	          data: params
	        }).done(function(responseText) {
	          response = arguments;
	          self.html(selector ? jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) : responseText);
	        }).complete(callback && function(jqXHR, status) {
	          self.each(callback, response || [jqXHR.responseText, status, jqXHR]);
	        });
	      }
	      return this;
	    };
	    jQuery.expr.filters.animated = function(elem) {
	      return jQuery.grep(jQuery.timers, function(fn) {
	        return elem === fn.elem;
	      }).length;
	    };
	    var docElem = window.document.documentElement;
	    function getWindow(elem) {
	      return jQuery.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
	    }
	    jQuery.offset = {setOffset: function(elem, options, i) {
	        var curPosition,
	            curLeft,
	            curCSSTop,
	            curTop,
	            curOffset,
	            curCSSLeft,
	            calculatePosition,
	            position = jQuery.css(elem, "position"),
	            curElem = jQuery(elem),
	            props = {};
	        if (position === "static") {
	          elem.style.position = "relative";
	        }
	        curOffset = curElem.offset();
	        curCSSTop = jQuery.css(elem, "top");
	        curCSSLeft = jQuery.css(elem, "left");
	        calculatePosition = (position === "absolute" || position === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1;
	        if (calculatePosition) {
	          curPosition = curElem.position();
	          curTop = curPosition.top;
	          curLeft = curPosition.left;
	        } else {
	          curTop = parseFloat(curCSSTop) || 0;
	          curLeft = parseFloat(curCSSLeft) || 0;
	        }
	        if (jQuery.isFunction(options)) {
	          options = options.call(elem, i, curOffset);
	        }
	        if (options.top != null) {
	          props.top = (options.top - curOffset.top) + curTop;
	        }
	        if (options.left != null) {
	          props.left = (options.left - curOffset.left) + curLeft;
	        }
	        if ("using" in options) {
	          options.using.call(elem, props);
	        } else {
	          curElem.css(props);
	        }
	      }};
	    jQuery.fn.extend({
	      offset: function(options) {
	        if (arguments.length) {
	          return options === undefined ? this : this.each(function(i) {
	            jQuery.offset.setOffset(this, options, i);
	          });
	        }
	        var docElem,
	            win,
	            elem = this[0],
	            box = {
	              top: 0,
	              left: 0
	            },
	            doc = elem && elem.ownerDocument;
	        if (!doc) {
	          return;
	        }
	        docElem = doc.documentElement;
	        if (!jQuery.contains(docElem, elem)) {
	          return box;
	        }
	        if (typeof elem.getBoundingClientRect !== strundefined) {
	          box = elem.getBoundingClientRect();
	        }
	        win = getWindow(doc);
	        return {
	          top: box.top + win.pageYOffset - docElem.clientTop,
	          left: box.left + win.pageXOffset - docElem.clientLeft
	        };
	      },
	      position: function() {
	        if (!this[0]) {
	          return;
	        }
	        var offsetParent,
	            offset,
	            elem = this[0],
	            parentOffset = {
	              top: 0,
	              left: 0
	            };
	        if (jQuery.css(elem, "position") === "fixed") {
	          offset = elem.getBoundingClientRect();
	        } else {
	          offsetParent = this.offsetParent();
	          offset = this.offset();
	          if (!jQuery.nodeName(offsetParent[0], "html")) {
	            parentOffset = offsetParent.offset();
	          }
	          parentOffset.top += jQuery.css(offsetParent[0], "borderTopWidth", true);
	          parentOffset.left += jQuery.css(offsetParent[0], "borderLeftWidth", true);
	        }
	        return {
	          top: offset.top - parentOffset.top - jQuery.css(elem, "marginTop", true),
	          left: offset.left - parentOffset.left - jQuery.css(elem, "marginLeft", true)
	        };
	      },
	      offsetParent: function() {
	        return this.map(function() {
	          var offsetParent = this.offsetParent || docElem;
	          while (offsetParent && (!jQuery.nodeName(offsetParent, "html") && jQuery.css(offsetParent, "position") === "static")) {
	            offsetParent = offsetParent.offsetParent;
	          }
	          return offsetParent || docElem;
	        });
	      }
	    });
	    jQuery.each({
	      scrollLeft: "pageXOffset",
	      scrollTop: "pageYOffset"
	    }, function(method, prop) {
	      var top = "pageYOffset" === prop;
	      jQuery.fn[method] = function(val) {
	        return access(this, function(elem, method, val) {
	          var win = getWindow(elem);
	          if (val === undefined) {
	            return win ? win[prop] : elem[method];
	          }
	          if (win) {
	            win.scrollTo(!top ? val : window.pageXOffset, top ? val : window.pageYOffset);
	          } else {
	            elem[method] = val;
	          }
	        }, method, val, arguments.length, null);
	      };
	    });
	    jQuery.each(["top", "left"], function(i, prop) {
	      jQuery.cssHooks[prop] = addGetHookIf(support.pixelPosition, function(elem, computed) {
	        if (computed) {
	          computed = curCSS(elem, prop);
	          return rnumnonpx.test(computed) ? jQuery(elem).position()[prop] + "px" : computed;
	        }
	      });
	    });
	    jQuery.each({
	      Height: "height",
	      Width: "width"
	    }, function(name, type) {
	      jQuery.each({
	        padding: "inner" + name,
	        content: type,
	        "": "outer" + name
	      }, function(defaultExtra, funcName) {
	        jQuery.fn[funcName] = function(margin, value) {
	          var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"),
	              extra = defaultExtra || (margin === true || value === true ? "margin" : "border");
	          return access(this, function(elem, type, value) {
	            var doc;
	            if (jQuery.isWindow(elem)) {
	              return elem.document.documentElement["client" + name];
	            }
	            if (elem.nodeType === 9) {
	              doc = elem.documentElement;
	              return Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name]);
	            }
	            return value === undefined ? jQuery.css(elem, type, extra) : jQuery.style(elem, type, value, extra);
	          }, type, chainable ? margin : undefined, chainable, null);
	        };
	      });
	    });
	    jQuery.fn.size = function() {
	      return this.length;
	    };
	    jQuery.fn.andSelf = jQuery.fn.addBack;
	    if (typeof define === "function" && define.amd) {
	      define("jquery", [], function() {
	        return jQuery;
	      });
	    }
	    var _jQuery = window.jQuery,
	        _$ = window.$;
	    jQuery.noConflict = function(deep) {
	      if (window.$ === jQuery) {
	        window.$ = _$;
	      }
	      if (deep && window.jQuery === jQuery) {
	        window.jQuery = _jQuery;
	      }
	      return jQuery;
	    };
	    if (typeof noGlobal === strundefined) {
	      window.jQuery = window.$ = jQuery;
	    }
	    return jQuery;
	  }));
	  return {};
	}.call(typeof global !== 'undefined' ? global : this);
	


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;
	
	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __moduleName = "node_modules/webpack/buildin/module";
	module.exports = function(module) {
	  if (!module.webpackPolyfill) {
	    module.deprecate = function() {};
	    module.paths = [];
	    module.children = [];
	    module.webpackPolyfill = 1;
	  }
	  return module;
	};
	


/***/ }
/******/ ])
})

//# sourceMappingURL=bacon-browser.full.js.map