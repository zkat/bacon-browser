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
