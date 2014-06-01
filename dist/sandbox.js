var Mouse = Bacon.Browser.Mouse;
Mouse.hovering("div").log("Hovering over thim div:");
Mouse.isDown().log("Mouse is down");
Mouse.isDown("div").log("Mouse is down, and over div");
Mouse.isHeld("div").log("Holding thim div");

