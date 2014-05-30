module $ from "jquery";
import animationFrames from "./window";
import "bacon";

var $window = $(window);

var getGamepads = navigator.getGamepads ||
      navigator.webkitGetGamepads ||
      navigator.mozGetGamepads ||
      (()=>[]);

// https://developer.mozilla.org/en-US/docs/Web/Guide/API/Gamepad
var Gamepad = {
  // TODO - shim these for Chrome. See above link.
  gamepadconnected: ()=>$window.asEventStream("gamepadconnected"),
  gamepaddisconnected: ()=>$window.asEventStream("gamepaddisconnected"),
  connected: ()=>Gamepad.gamepadconnected.map((e)=>getGamepads()[e.gamepad.index]),
  disconnected: ()=>Gamepad.gamepaddisconnected.map((e)=>getGamepads()[e.gamepad.index]),
  gamepads: ()=>Gamepad.gamepadconnected()
    .merge(Gamepad.gamepaddisconnected())
    .map(()=>getGamepads())
    .toProperty(getGamepads()),
  buttons: (gamepad)=>Gamepad.sampler()
    .map(()=>getGamepads()[gamepad.id].buttons)
    .toProperty(getGamepads()[gamepad.id].buttons),
  button: (gamepad, index, isAnalog)=>Gamepad.buttons(gamepad)
    .map("."+index+"."+(isAnalog ? "value" : "pressed")),
  buttonpressed: (gamepad, index)=>Gamepad.button(index)
    .skipDuplicates().filter((x)=>x),
  axes: (gamepad)=>Gamepad.sampler()
    .map(()=>getGamepads()[gamepad.id].axes)
    .toProperty(getGamepads()[gamepad.id].axes),
  axis: (index)=>Gamepad.axes()
    .map("."+index),
  axismoved: (gamepad, index)=>Gamepad.axis(index).skipDuplicates(),
  sampler: ()=>animationFrames()
};

export default Gamepad;
