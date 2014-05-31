module $ from "jquery";
module bacon from "bacon";
import {constantly} from "./util";

// TODO - https://developer.mozilla.org/en-US/docs/Web/API/Window#Event_handlers

let $window = $(window);

if (window.history && window.history.pushState) {
  let oldMethods = {};
  ["pushState", "replaceState"].forEach(function(method) {
    oldMethods[method] = window.history[method];
    window.history[method] = function(state) {
      // We do it like this because the pushState/replaceState might fail.
      let ret = oldMethods[method].apply(this, arguments);
      $window.trigger("___bacon-browser-state___", [state]);
      return ret;
    };
  });
}

/**
 * Event wrapper for `window.onresize`
 *
 * @returns EventStream of resize Events
 */
export var resize = constantly($window.asEventStream("resize"));

/**
 * Event wrapper for `window.onhashchanged`
 *
 * @returns EventStream of hashchanged Events
 */
export var hashchanged = constantly($window.asEventStream("hashchanged"));

/**
 * Event wrapper for `window.onpopstate`
 *
 * @returns EventStream of popstate Events
 */
export var popstate = constantly($window.asEventStream("popstate"));

/**
 * Special event that fires whenever the current history state is set, whether
 * from `history.pushState`, `history.replaceState`, or by anything that
 * triggers `window.onpopstate`.
 *
 * @returns EventStream of statechanged Events
 */
export var statechanged = constantly(
  $window.asEventStream("___bacon-browser-state___",(_,s) => s)
    .merge(popstate().map(".originalEvent.state")));

/**
 * Property that represents the latest value of `window.location.hash`. Updates
 * on `window.onhashchanged`.
 *
 * @returns Property of `window.location.hash`
 */
export var hash = () =>
  hashchanged()
  .map(()=>window.location.hash)
  .toProperty(window.location.hash);

/**
 * Property that represents the latest value of `window.location`. Updates
 * whenever the URL changes either from a `hashchanged` or using the `history`
 * API, if available.
 *
 * @returns Property of `window.location`
 */
export var location = ()=>
  hashchanged()
  .merge(statechanged())
  .map(()=>window.location)
  .toProperty(window.location);

/**
 * Property that represents the current `history` state. Updates whenever
 * `history.pushState` or `history.replaceState` are called, or when anything
 * triggers `window.onpopstate`.
 *
 * @returns Property of history state
 */
export var state = ()=>statechanged().toProperty();

/**
 * Property of the current `window` outer dimensions, in pixels.
 *
 * @returns Property of {width: Int, height: Int}
 */
export var dimensions = ()=>resize()
  .map(()=>({width: $window.outerWidth(), height: $window.outerHeight()}))
  .toProperty({width: $window.outerWidth(), height: $window.outerHeight()});

/**
 * Property that represents the current window height.
 *
 * @returns Property of window's outer height
 */
export var height = ()=>dimensions().map(".height");

/**
 * Property that represents the current window width.
 *
 * @returns Property of window's outer width
 */
export var width = ()=>dimensions().map(".width");

/**
 * Event stream that fires whenever a browser animation frame is available. The
 * event value is a DOMHighResTimeStamp representing the time at which the frame
 * became ready (which may be noticeable earlier than when the event is actually
 * captured).
 *
 * @returns EventStream of DOMHighResTimeStamp
 */
export var animationFrames = constantly(bacon.fromBinder(function(sink) {
  let done = false,
      requestID;
  function request() {
    requestID = window.requestAnimationFrame(function(x) {
      sink(x);
      if (!done) {request();}
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
