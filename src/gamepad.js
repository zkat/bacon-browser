module $ from "jquery";
import {animationFrames} from "./window";
import {constantly as give} from "./util";
import "bacon";

let $win = $(window);

let gpFun = (navigator.getGamepads ||
             navigator.webkitGetGamepads ||
             navigator.mozGetGamepads ||
             give([]));
let getGamepads = ()=>gpFun.call(navigator);

let eventPad = e => getGamepads()[e.gamepad.index];

// https://developer.mozilla.org/en-US/docs/Web/Guide/API/Gamepad

// TODO - shim these for Chrome. See above link.

/**
 * Event wrapper for `window.ongamepadconnected`
 *
 * @returns EventStream of gamepadconnected Events
 */
export var gamepadconnected = give($win.asEventStream("gamepadconnected"));

/**
 * Event wrapper for `window.ongamepaddisconnected`
 *
 * @returns EventStream of gamepaddisconnected Events
 */
export var gamepaddisconnected = give($win.asEventStream("gamepaddisconnected"));

/**
 * Event stream returning gamepad objects whenever they're connected.
 *
 * @returns EventStream of Gamepad
 */
export var connected = give(gamepadconnected().map(eventPad));

/**
 * Event stream returning gamepad objects whenever they're disconnected.
 *
 * @returns EventStream of Gamepad
 */
export var disconnected = give(gamepaddisconnected().map(eventPad));

/**
 * Property that represents the current gamepad array.
 *
 * @returns Property of GamepadList
 */
export var gamepads = () =>
  gamepadconnected()
  .merge(gamepaddisconnected())
  .map(getGamepads)
  .toProperty(getGamepads());

/**
 * Property that represents the currently-pressed buttons on `gamepad`.
 *
 * @returns Property of ButtonList
 */
export var buttons = gamepad =>
  sampler()
  .map(()=>getGamepads()[gamepad.id].buttons)
  .toProperty(getGamepads()[gamepad.id].buttons);

export var button = (gamepad, index, isAnalog) =>
  buttons(gamepad).map("."+index+"."+(isAnalog ? "value" : "pressed"));

export var buttonpressed = (gamepad, index) =>
  button(index).skipDuplicates().filter(x=>x);

export var axes = gamepad =>
  sampler()
  .map(()=>getGamepads()[gamepad.id].axes)
  .toProperty(getGamepads()[gamepad.id].axes);

export var axis = index => axes().map("."+index);

export var axismoved = (gamepad, index) => axis(index).skipDuplicates();

export var sampler = give(animationFrames());
