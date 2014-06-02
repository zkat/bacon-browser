module $ from "jquery";
import "bacon";
import {domStream} from "./util";

/*
 * Base event streams
 */
var keydown = domStream("keydown");
var keyup = domStream("keyup");

/*
 * EventStream
 */

/**
 * Stream of keydown keyCodes. This is intended for handling key input meant for
 * something other than text processing. (detecting Escape, arrow keys, etc.)
 * The keyCode values are normalized by jQuery for better cross-browser support.
 *
 * The `filter` argument will be used to filter which keyCodes will actually
 * trigger the event. `filter` can be one of an integer matching the keyCode, an
 * array of integers of the possible keyCodes, or a function which will receive
 * the keyCode as an argument and accept it into the stream if a truthy value is
 * returned.
 *
 * If `useKeyup` is truthy, `keyCodes()` will only fire on the `keyup` event,
 * instead of the default `keydown`.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 * @param {Int|[Int]|Function Bool} [filter] - Filter to determine whether to
 * accept a keyCode.
 * @param {Boolean} [useKeyUp] - If true, listens for `keyup` events instead of
 * `keydown`
 *
 * If you're interested in handling input for the sake of text, use the built-in
 * `input` event on input/textarea elements.
 *
 * @returns EventStream of keyCodes
 */
export var keyCodes = (target, filter, useKeyup) =>
  (useKeyup?keyup:keydown)().map(".which").filter(
    !filter ? (x => x) :
    typeof filter === "function" ? filter :
      typeof filter === "number" ? (code => code === filter) :
      (code => ~filter.indexOf(code)));

/*
 * Property
 */

/**
 * Creates a Property that is true if a key is currently up and `target` is
 * focused. If `filter` is provided, the property will toggle only when `filter`
 * matches the event keyCode. See `Keyboard.keyCodes()` for information on
 * `filter`.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 * @param {Int|[Int]|Function Bool} [filter] - Filter to determine whether to
 * accept a keyCode.
 *
 * @returns Property of Boolean
 */
export var isUp = (target, filter) =>
  keyCodes(target, filter).map(false)
  .merge(keyCodes(target, filter, true).map(true))
  .skipDuplicates()
  .toProperty(true);

/**
 * Creates a Property that is true if a key is currently down and `target` is
 * focused. If `filter` is provided, the property will toggle only when `filter`
 * matches the event keyCode. See `Keyboard.keyCodes()` for information on
 * `filter`.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 * @param {Int|[Int]|Function Bool} [filter] - Filter to determine whether to
 * accept a keyCode.
 *
 * @returns Property of Boolean
 */
export var isDown = (target, filter) => isUp(target, filter).not();

/**
 * Alias for `Keyboard.isDown()`
 */
export var isHeld = isDown;

/**
 * Creates a Property whose value is an array of the keyCodes currently held
 * down, if `target` is in focus. If `filter` is provided, the property will
 * toggle only when `filter` matches the event keyCode. See
 * `Keyboard.keyCodes()` for information on `filter`.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 * @param {Int|[Int]|Function Bool} [filter] - Filter to determine whether to
 * accept a keyCode.
 *
 * @returns Property of [Int]
 */
export var held = (target, filter) => {
  let _acc = [];
  return keyCodes(target, filter).doAction((code) => _acc[code] = true)
    .merge(keyCodes(target, filter, true).doAction((code) => delete _acc[code]))
           .map(() => Object.keys(_acc).map(x => +x))
           .skipDuplicates((a, b) => a.length === b.length);
};
