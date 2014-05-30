import Window from "./window";
import Mouse from "./mouse";
import Keyboard from "./keyboard";
import Touch from "./touch";

module bacon from "bacon";

bacon.Browser = {
  Window: Window,
  Mouse: Mouse,
  Keyboard: Keyboard,
  Touch: Touch
};
