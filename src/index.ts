export * from "./MenuDrop.js";
export * from "./MenuOpener.js";
export * from "./MenuList.js";
export * from "./MenuItem.js";
export * from "./MenuSubList.js";

import styles from "../styles/style.css" assert { type: "css" };

const stylesheet: CSSStyleSheet = typeof styles === "string"
  ? await new CSSStyleSheet().replace(styles)
  : styles;

document.adoptedStyleSheets = [...document.adoptedStyleSheets,stylesheet];