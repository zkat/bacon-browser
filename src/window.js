module $ from "jquery";
module bacon from "bacon";
import constantly from "./util";

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

let Window = {
  resize: constantly($window.asEventStream("resize")),
  hashchange: constantly($window.asEventStream("hashchanged")),
  popstate: constantly($window.asEventStream("popstate")),
  statechange: constantly($window.asEventStream("___bacon-browser-state___",(_,s) => s)
    .merge(Window.popstate().map(".originalEvent.state"))),
  hash: ()=>
    Window.hashchange()
    .map(()=>window.location.hash)
    .toProperty(window.location.hash),
  location: ()=>
    Window.hashchange()
    .merge(Window.popstate())
    .map(()=>window.location)
    .toProperty(window.location),
  state: ()=>Window.statechange().toProperty(),
  height: ()=>Window.dimensions().map(".height"),
  width: ()=>Window.dimensions().map(".width"),
  dimensions: ()=>Window.resize()
    .map(()=>({width: $window.outerWidth(), height: $window.outerHeight()}))
    .toProperty({width: $window.outerWidth(), height: $window.outerHeight()}),
  animationFrames: constantly(bacon.fromBinder(function(sink) {
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
  }))
};

export default Window;
