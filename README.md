# bacon-browser

`bacon-browser` is
[hosted at Github](http://github.com/zkat/bacon-browser). `bacon-browser` is
a public domain work, dedicated using
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Feel free to do
whatever you want with it.

# Quickstart

### Install

`$ npm install bacon-browser`
or
`$ bower install bacon-browser`

### Example

```javascript

// Window utility example
var Window = Bacon.Browser.Window;
var pageState = Bacon.combineTemplate({
  location: Window.location(),
  state: Window.state()
})

pageState.log("page state:");

history.pushState({pageId: 1}, null, "/pagse/1");
history.replaceState({pageId: 1}, null, "/pages/1");
history.back();
history.forward();

var display = $("<div>").appendTo("body");
Window.dimensions().onValue(function(dims) {
  display.text("window width: " + dims.width +
               " window height: " + dims.height);
})

// Mouse utilities
var Mouse = Bacon.Browser.Mouse;

// Just some jQuery code to create a 100pxx100px pink box with position: fixed
var box = $("<div>").appendTo("body");
box.css({
  "background-color": "hotpink",
  "height": "100px",
  "width": "100px",
  "position": "fixed"
});

// Mouse.isHeld(target) is a property that is true while the target is
// "grabbed". This is different from isDown(target) because it's true even if the
// mouse leaves the area of the target. This is useful for drag drop behaviors
// where the target might not be able to follow the mouse past a certain point, if
// at all.
var boxIsHeld = Mouse.isHeld(box);
boxIsHeld.onValue(function(isHeld) {
  if (isHeld) {
    // Mouse.deltas() returns {x: Int, y: Int} objects for every mousemove which
    // represent the number of pixels in those axes that the mouse has moved since
    // the last mousemove.
    Mouse.deltas()
    // and we only use this stream until the box is no longer being held.
    .takeWhile(boxIsHeld)
    // Finally we set the css position based on the deltas.
    .onValue(function(delta) {
      var pos = box.position();
      box.css({
        left: pos.left + delta.x,
        top: pos.top + delta.y
      });
    });
  }
});

```

# Introduction

`bacon-browser` is a collection of browser-related `Bacon.Observable`s for use
with [Bacon.js](https://github.com/baconjs/bacon.js). It provides a variety of
useful utilities for commonly-performed tasks, such as checking whether a DOM
elevent is being "held" with a mouse click (for drag and drop), properties that
represent the `window` dimensions (instead of having to hook into
`window.onresize` yourself), hooking into browser `animationFrames`, and many
more.

`bacon-browser` does not provide pre-made event streams for standard DOM events
-- it is a (usually small) wrapper on top of many of them providing
higher-level, FRPish interaction. Use `jQuery#asEventStream`, provided by
`Bacon` itself, for that.

# Documentation

`bacon-browser` plugs into the `Bacon` object, regardless of whether it's
included through CommonJS, AMD, or as a global variable. It enriches the object
with a new `Browser` module, with several other modules listed below it.

All exported values under every modules are functions that return either
`EventStream` or `Property` objects. While you should be able to treat all of
them as if new streams or properties were created, it is not allowed to
side-effect the return values of these functions, as they may be (and often are)
cached.

## Bacon.Browser.Window

### EventStream

#### `statechanged()`

Special `EventStream` that fires whenever the current history state is set,
whether from `history.pushState`, `history.replaceState`, or by anything that
triggers `window.onpopstate`.

#### `animationFrames()`

Event stream that fires whenever a browser animation frame is available. The
event value is a `DOMHighResTimeStamp` representing the time at which the frame
became ready (which may be noticeable earlier than when the event is actually
captured).

### Property

#### `location()`

The latest value of `window.location`. Updates whenever the URL changes either
from a `hashchanged` or using the `history` API, if available.

#### `hash()`

The latest value of `window.location.hash`. Updates whenever the URL changes
either from a `hashchanged` or using the `history` API, if available.

#### `state()`

The current `history` state. Updates whenever `history.pushState` or
`history.replaceState` are called, or when anything triggers
`window.onpopstate`.

#### `dimensions()`

The current `window` outer dimensions, in pixels.

#### `height()`

The current window height.

#### `width()`

The current window width.

## Bacon.Browser.Mouse

### EventStream

#### `hover([target=document])`

Creates an event stream that returns a boolean whenever the mouse enters or
leaves the target.

#### `clicks([target=document [, useOffset=false]])`

Creates an `EventStream` of coordinates where clicks have occurred. If the
`useOffset` argument is given, the `click` events' `offsetX/offsetY` values are
used, otherwise `pageX/pageY` are given.

#### `deltas([target=document])`

Creates an EventStream of mouse movement deltas, based on the preceding
mousemove. The stream values represent the pixel x/y offsets.

### Property

#### `hovering([target=document])`

`true` if the mouse is currently hovering over `target`, otherwise `false`. This
is simply the `Property` version of `Mouse.hover()`.

#### `position([target=document [, useOffset=false]])`

The current mouse position as `{x: Int, y: Int}`. If the `useOffset` argument is
given, the `mousemove` events' `offsetX/offsetY` values are used. Otherwise
`pageX/pageY` are given.

#### `isUp([target=document])`

`true` if the mouse is currently up, otherwise `false`. If `target` is given,
returns `true` only when the mouse is hovering over `target` without being held
down.

#### `isDown([target=document])`

`true` if the mouse is currently down. If `target` is given, returns `true` only
when the mouse is hovering over `target` while being held down.

#### `isHeld([target=document])`

`true` if the target is being "held" -- meaning, if the mouse was pressed on it,
and it hasn't been released. The difference between this property and the one
created by `Mouse.isDown()` is that `isDown()` will be `false` if the mouse
leaves the `target`.

This is usually the function you want for drag-and-drop behaviors.

## Bacon.Browser.Keyboard

### EventStream

#### `keyCodes([target=document [, filter [, useKeyup]]])`

Stream of `keydownEvent.keyCode`s. This is intended for handling key input meant
for something other than text processing. (detecting `escape`, arrow keys, etc.)
The `keyCode` values are normalized by `jQuery` for better cross-browser support.

The `filter` argument will be used to filter which `keyCode`s will actually
trigger the event. `filter` can be one of an integer matching the `keyCode`, an
array of integers of the possible `keyCode`s, or a function which will receive
the `keyCode` as an argument and accept it into the stream if a truthy value is
returned.

If `useKeyup` is truthy, `keyCodes()` will only fire on the `keyup` event,
instead of the default `keydown`.

### Property

#### `isUp([target=document [, filter]])`

`true` if a key is currently up and `target` is focused. If `filter` is
provided, the property will toggle only when `filter` matches the event
keyCode. See `Keyboard.keyCodes()` for information on `filter`.

#### `isDown([target=document [, filter]])`

`true` if a key is currently down and `target` is focused. If `filter` is
provided, the property will toggle only when `filter` matches the event
keyCode. See `Keyboard.keyCodes()` for information on `filter`.

#### `isHeld([target=document [, filter]])`

Alias for `Keyboard.isDown()`.

#### `held([target=document [, filter]])`

An array of the `keyCode`s currently held down, if `target` is in focus. If
`filter` is provided, the property will toggle only when `filter` matches the
event `keyCode`. See `Keyboard.keyCodes()` for information on `filter`.
