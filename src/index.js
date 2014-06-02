/*
 * @module Bacon.Browser
 *
 * Contains a variety of modules with high-level utilities.
 */
module Window from "./window";
module Mouse from "./mouse";
module Keyboard from "./keyboard";
module Touch from "./touch";
module Gamepad from "./gamepad";

module bacon from "bacon";

bacon.Browser = {
  Window: Window,
  Mouse: Mouse,
  Keyboard: Keyboard,
  Touch: Touch,
  Gamepad: Gamepad
};
