module $ from "jquery";
module bacon from "bacon";
import {constantly} from "./util";

let $window = $(window);

// Sort of cribbed from CanJS :)
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

/*
 * Base event streams
 */
var resize = constantly($window.asEventStream("resize"));
var hashchanged = constantly($window.asEventStream("hashchanged"));
var popstate = constantly($window.asEventStream("popstate"));

/*
 * EventStream
 */

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

/*
 * Property
 */

/**
 * The latest value of `window.location`. Updates whenever the URL changes
 * either from a `hashchanged` or using the `history` API, if available.
 *
 * @returns Property of `window.location`
 */
export var location = ()=>
  hashchanged()
  .merge(statechanged())
  .map(()=>window.location)
  .toProperty(window.location);

/**
 * The latest value of `window.location.hash`. Updates whenever the URL changes
 * either from a `hashchanged` or using the `history` API, if available.
 *
 * @returns Property of `window.location.hash`
 */
export var hash = () => location().map(".hash");

/**
 * The current `history` state. Updates whenever `history.pushState` or
 * `history.replaceState` are called, or when anything triggers
 * `window.onpopstate`.
 *
 * @returns Property of history state
 */
export var state = () => statechanged().toProperty();

/**
 * The current `window` outer dimensions, in pixels.
 *
 * @returns Property of {width: Int, height: Int}
 */
export var dimensions = () => resize()
  .map(()=>({width: $window.outerWidth(), height: $window.outerHeight()}))
  .toProperty({width: $window.outerWidth(), height: $window.outerHeight()});

/**
 * The current window height.
 *
 * @returns Property of window's outer height
 */
export var height = ()=>dimensions().map(".height");

/**
 * The current window width.
 *
 * @returns Property of window's outer width
 */
export var width = ()=>dimensions().map(".width");

/**
 * The current scroll position of `target` (defaulting to `document`) in
 * the form of an object with x and y properties.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 *
 * @returns Property of `element`'s x and y scroll positions.
 */
export var scroll = (el=$(document)) =>
  $(el).asEventStream("scroll")
  .map(()=>({x: el.scrollLeft(), y: el.scrollTop()}))
  .toProperty({x: el.scrollLeft(), y: el.scrollTop()});

/**
 * The horizontal scroll position for `target`.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 *
 * @returns Property of `target`'s horizontal scroll position.
 */
export var scrollX = (el=$(document)) => scroll(el).map(".x");

/**
 * The vertical scroll position for `target`.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 *
 * @returns Property of `target`'s vertical scroll position.
 */
export var scrollY = (el=$(document)) => scroll(el).map(".y");
