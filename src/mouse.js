module $ from "jquery";
import "bacon";

// TODO - abstraction over touch, whimel
function domStream(name) {
  return function(target) {
    return $(target||document).asEventStream(name);
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
      return a ? {x: b.x - a.x, y: b.y - a.y} : {x: 0, y: 0};
    }).toEventStream();
  },
  position: function(target) {
    return Mouse.mousemove(target)
      .map(function(ev) {
        return {
          x: target ? ev.offsetX : ev.pageX,
          y: target ? ev.offsetY : ev.pageY
        };
      }).toProperty();
  },
  isUp: function(upTarget, downTarget) {
    return Mouse.mouseup(upTarget).map(true)
      .merge(Mouse.mousedown(downTarget).map(false))
      .toProperty();
  },
  isDown: function(downTarget, upTarget) {
    return Mouse.isUp(upTarget, downTarget).not();
  }
};

export default Mouse;
