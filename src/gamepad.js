module $ from "jquery";
import animationFrames from "./window";
import constantly from "./util";
import "bacon";

let $window = $(window);

let getGamepads = ()=>(navigator.getGamepads ||
                       navigator.webkitGetGamepads ||
                       navigator.mozGetGamepads ||
                       (()=>[])).call(navigator);

// https://developer.mozilla.org/en-US/docs/Web/Guide/API/Gamepad
let Gamepad = {
  // TODO - shim these for Chrome. See above link.
  gamepadconnected: constantly($window.asEventStream("gamepadconnected")),
  gamepaddisconnected: constantly($window.asEventStream("gamepaddisconnected")),
  connected: constantly(Gamepad.gamepadconnected.map(e=>getGamepads()[e.gamepad.index])),
  disconnected: constantly(Gamepad.gamepaddisconnected.map(e=>getGamepads()[e.gamepad.index])),
  gamepads: ()=>Gamepad.gamepadconnected()
    .merge(Gamepad.gamepaddisconnected())
    .map(getGamepads)
    .toProperty(getGamepads()),
  buttons: gamepad=>Gamepad.sampler()
    .map(()=>getGamepads()[gamepad.id].buttons)
    .toProperty(getGamepads()[gamepad.id].buttons),
  button: (gamepad, index, isAnalog)=>Gamepad.buttons(gamepad)
    .map("."+index+"."+(isAnalog ? "value" : "pressed")),
  buttonpressed: (gamepad, index)=>Gamepad.button(index)
    .skipDuplicates().filter(x=>x),
  axes: gamepad=>Gamepad.sampler()
    .map(()=>getGamepads()[gamepad.id].axes)
    .toProperty(getGamepads()[gamepad.id].axes),
  axis: index=>Gamepad.axes()
    .map("."+index),
  axismoved: (gamepad, index)=>Gamepad.axis(index).skipDuplicates(),
  sampler: constantly(animationFrames())
};

export default Gamepad;
