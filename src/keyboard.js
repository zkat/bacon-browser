module $ from "jquery";
import "bacon";
import {domStream} from "./util";

/**
 * Event wrapper for `DOMElement.onkeydown`
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 *
 * @returns EventStream of keydown Events
 */
export var keydown = domStream("keydown");

/**
 * Event wrapper for `DOMElement.onkeyup`
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 *
 * @returns EventStream of keyup Events
 */
export var keyup = domStream("keyup");

/**
 * Event wrapper for `DOMElement.onkeypress`
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 *
 * @returns EventStream of keypress Events
 */
export var keypress = domStream("keypress");

/**
 * Stream of keydown keycodes. This is intended for handling key input meant for
 * something other than text processing. (detecting Escape, arrow keys, etc.)
 * The keycode values are normalized by jQuery for better cross-browser support.
 *
 * The `filter` argument will be used to filter which keycodes will actually
 * trigger the event. `filter` can be one of an integer matching the keycode, an
 * array of integers of the possible keycodes, or a function which will receive
 * the keycode as an argument and accept it into the stream if a truthy value is
 * returned.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 * @param {Int|[Int]|Function Bool} [filter] - Filter to determine whether to
 * accept a keycode.
 * @param {Boolean} [useKeyUp] - If true, listens for `keyup` events instead of
 * `keydown`
 *
 * If you're interested in handling input for the sake of text, use the built-in
 * `input` event on input/textarea elements.
 *
 * @returns EventStream of keycodes
 */
export var keycodes = (target, filter, useKeyup) =>
  (useKeyup?keyup:keydown)().map(".which").filter(
    !filter ? (x => x) :
    typeof filter === "function" ? filter :
      typeof filter === "number" ? (code => code === filter) :
      (code => ~filter.indexOf(code)));

/**
 * Creates a Property that is true if a key is currently up and `target` is
 * focused. If `filter` is provided, the property will toggle only when `filter`
 * matches the event keycode. See `Keyboard.keycodes()` for information on
 * `filter`.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 * @param {Int|[Int]|Function Bool} [filter] - Filter to determine whether to
 * accept a keycode.
 *
 * @returns Property of Boolean
 */
export var isUp = (target, filter) =>
  keycodes(target, filter).map(false)
  .merge(keycodes(target, filter, true).map(true))
  .skipDuplicates()
  .toProperty(true);

/**
 * Creates a Property that is true if a key is currently down and `target` is
 * focused. If `filter` is provided, the property will toggle only when `filter`
 * matches the event keycode. See `Keyboard.keycodes()` for information on
 * `filter`.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 * @param {Int|[Int]|Function Bool} [filter] - Filter to determine whether to
 * accept a keycode.
 *
 * @returns Property of Boolean
 */
export var isDown = (target, filter) => isUp(target, filter).not();

/**
 * Creates a Property whose value is an array of the keycodes currently held
 * down, if `target` is in focus. If `filter` is provided, the property will
 * toggle only when `filter` matches the event keycode. See
 * `Keyboard.keycodes()` for information on `filter`.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 * @param {Int|[Int]|Function Bool} [filter] - Filter to determine whether to
 * accept a keycode.
 *
 * @returns Property of Boolean
 */
export var held = (target, filter) =>
  keycodes(target, filter).map(code => [code, true])
  .merge(keycodes(target, filter, true).map(code => [code, false]))
  .scan([], (acc, [code, pressed]) => {
    if (pressed) {
      acc[code] = true;
    } else {
      delete acc[code];
    }
    return acc;
  }).map(acc => Object.keys(acc).map(x => +x))
  .skipDuplicates((a, b) => a.length === b.length);
