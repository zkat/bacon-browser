module $ from "jquery";
import "bacon";

export var mousemove = domStream("mousemove");

export var mouseup = domStream("mouseup");

export var mousedown = domStream("mousedown");

export var click = domStream("click");

export var clicks = target =>
  click(target).map(ev => ({
    x: target ? ev.offsetX : ev.pageX,
    y: target ? ev.offsetY : ev.pageY
  }));

export var deltas = target =>
  position(target).diff(null, (a, b) =>
    a ? {x: b.x - a.x, y: b.y - a.y} : {x: 0, y: 0})
  .toEventStream();

export var position = target =>
  mousemove(target)
    .map(ev => ({
      x: target ? ev.offsetX : ev.pageX,
      y: target ? ev.offsetY : ev.pageY
    })).toProperty();

export var isUp = (upTarget, downTarget) =>
  mouseup(upTarget).map(true)
  .merge(mousedown(downTarget).map(false))
  .toProperty();

export var isDown = (downTarget, upTarget) => isUp(upTarget, downTarget).not();

function domStream(name) {
  let docStream = $(document).asEventStream(name);
  return target => target ? $(target).asEventStream(name) : docStream;
}
