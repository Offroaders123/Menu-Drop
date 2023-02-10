export * from "./menu-drop.js";
export * from "./menu-opener.js";
export * from "./menu-list.js";
export * from "./menu-item.js";
export * from "./menu-sub-list.js";

import stylesheet from "../style.css" assert { type: "css" };

document.adoptedStyleSheets = [...document.adoptedStyleSheets,stylesheet];