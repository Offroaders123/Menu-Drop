import type { MenuList } from "./menu-list.js";
import type { MenuItem } from "./menu-item.js";

export class MenuSubList extends HTMLElement {
  #isDefined = false;

  connectedCallback() {
    if (this.#isDefined || !this.isConnected) return;
    this.#isDefined = true;
  }

  get opener() {
    return this.querySelector<MenuItem>(":scope > menu-item");
  }

  get list() {
    return this.querySelector<MenuList>(":scope > menu-list");
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menu-sub-list": MenuSubList;
  }
}

window.customElements.define("menu-sub-list",MenuSubList);