export * from "./MenuDrop.js";
export * from "./MenuOpener.js";
export * from "./MenuList.js";
export * from "./MenuItem.js";
export * from "./MenuSubList.js";

import styles from "../styles/style.css?inline" with { type: "css" };

const stylesheet: CSSStyleSheet = typeof styles === "string"
  ? ((): CSSStyleSheet => {
    const stylesheet: CSSStyleSheet = new CSSStyleSheet();
    stylesheet.replaceSync(styles);
    return stylesheet;
  })()
  : styles;

(document.adoptedStyleSheets as CSSStyleSheet[]).push(stylesheet);