var Mouse = Bacon.Browser.Mouse;
Mouse.hovering("div").log("Hovering over the div:");
Mouse.isDown().log("Mouse is down");
Mouse.isDown("div").log("Mouse is down, and over div");
Mouse.isHeld("div").log("Holding the div");

