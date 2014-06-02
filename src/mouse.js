/**
 * @module Bacon.Browser.Mouse
 */
module $ from "jquery";
import "bacon";
import {domStream} from "./util";

/*
 * Base event streams
 */
var click = domStream("click");
var dblclick = domStream("dblclick");
var mousemove = domStream("mousemove");
var mouseup = domStream("mouseup");
var mousedown = domStream("mousedown");
var mouseenter = domStream("mouseenter");
var mouseleave = domStream("mouseleave");

/*
 * EventStream
 */

/**
 * Creates an event stream that returns a boolean whenever the mouse enters or
 * leaves the target.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 *
 * @returns EventStream of Boolean
 */
export var hover = target =>
  mouseenter(target).map(true).merge(mouseleave(target).map(false));

/**
 * Creates an EventStream of coordinates where clicks have occurred. If the
 * `useOffset` argument is given, the `click` events' `offsetX/offsetY` values
 * are used, otherwise `pageX/pageY` are given.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 * @param {Boolean} [useOffset=false] - Whether to use `pageX/pageY` (default)
 * or `offsetX/offsetY` (if flag is true) when creating the stream values.
 *
 * @returns EventStream of {x: Int, y: Int}
 */
export var clicks = (target, useOffset) =>
  click(target).map(ev => ({
    x: useOffset ? ev.offsetX : ev.pageX,
    y: useOffset ? ev.offsetY : ev.pageY
  }));

/**
 * Creates an EventStream of mouse movement deltas, based on the preceding
 * mousemove. The stream values represent the pixel x/y offsets.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 *
 * @returns EventStream of {x: Int, y: Int}
 *
 * @example
 * Bacon.Browser.Mouse.deltas().map(".x")
 *   .log("Mouse moved horizontally this many pixels:");
 */
export var deltas = target =>
  position(target).diff(null, (a, b) =>
    a ? {x: b.x - a.x, y: b.y - a.y} : {x: 0, y: 0})
  .toEventStream();

/*
 * Property
 */

/**
 * Creates a property that is true if the mouse is currently hovering over
 * `target`. This is simply the Property version of `Mouse.hover()`.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 *
 * @returns Property of Boolean
 */
export var hovering = target =>
  hover(target).toProperty();

/**
 * Creates a Property representing the current mouse position. If the
 * `useOffset` argument is given, the `mousemove` events' `offsetX/offsetY`
 * values are used. Otherwise `pageX/pageY` are given.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 * @param {Boolean} [useOffset=false] - Whether to use `pageX/pageY` (default)
 * or `offsetX/offsetY` (if flag is true) when creating the stream values.
 *
 * @returns Property of {x: Int, y: Int}
 */
export var position = (target, useOffset) =>
  mousemove(target)
    .map(ev => ({
      x: useOffset ? ev.offsetX : ev.pageX,
      y: useOffset ? ev.offsetY : ev.pageY
    })).toProperty();

/**
 * Creates a Property that is true if the mouse is currently up. If `target` is
 * given, returns true only when the mouse is hovering over `target` without
 * being held down.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 *
 * @returns Property of Boolean
 */
export var isUp = target =>
  isHeld().not().and(hovering(target));

/**
 * Creates a Property that is true if the mouse is currently down. If `target`
 * is given, returns true only when the mouse is hovering over `target` while
 * being held down.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 *
 * @returns Property of Boolean
 */
export var isDown = target =>
  isHeld().and(hovering(target));

/**
 * Creates a property that is true if the target is being "held" -- meaning, if
 * the mouse went down on it, and it hasn't been released. The difference
 * between this property and the one created by `isDown` is that `isDown` will
 * be 'false' if the mouse leaves the `target`.
 *
 * This is usually the function you want for drag-and-drop behaviors.
 *
 * @param {EventTarget} [target=document] - Target to watch for events on. This
 * can be anything `$()` accepts.
 *
 * @returns Property of Boolean
 */
export var isHeld = target =>
  mousedown(target).map(true)
  .merge(mouseup().map(false))
  .toProperty();
