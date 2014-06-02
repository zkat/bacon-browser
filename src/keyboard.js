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
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 *
 * If you're interested in handling input for the sake of text, use the built-in
 * `input` event on input/textarea elements.
 *
 * @returns EventStream of keycodes
 */
export var keycodes = target => keydown().map(".which");
