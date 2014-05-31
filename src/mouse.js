module $ from "jquery";
import "bacon";

export var mousemove = domStream("mousemove");

export var mouseup = domStream("mouseup");

export var mousedown = domStream("mousedown");

export var click = domStream("click");

export var clicks = function(target) {
  return click(target).map(function(ev) {
    return {
      x: target ? ev.offsetX : ev.pageX,
      y: target ? ev.offsetY : ev.pageY
    };
  });
};

export var deltas = function(target) {
  return position(target).diff(null, function(a, b) {
    return a ? {x: b.x - a.x, y: b.y - a.y} : {x: 0, y: 0};
  }).toEventStream();
};

export var position = function(target) {
  return mousemove(target)
    .map(function(ev) {
      return {
        x: target ? ev.offsetX : ev.pageX,
        y: target ? ev.offsetY : ev.pageY
      };
    }).toProperty();
};

export var isUp = function(upTarget, downTarget) {
  return mouseup(upTarget).map(true)
    .merge(mousedown(downTarget).map(false))
    .toProperty();
};

export var isDown = function(downTarget, upTarget) {
  return isUp(upTarget, downTarget).not();
};

function domStream(name) {
  let docStream = $(document).asEventStream(name);
  return function(target) {
    return target ? $(target).asEventStream(name) : docStream;
  };
}
