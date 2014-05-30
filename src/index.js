module Window from "./window";
module Mouse from "./mouse";
module Keyboard from "./keyboard";
module Touch from "./touch";

module bacon from "bacon";

bacon.Browser = {
  Window: Window,
  Mouse: Mouse,
  Keyboard: Keyboard,
  Touch: Touch
};
