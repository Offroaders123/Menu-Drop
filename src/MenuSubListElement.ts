import type { MenuListElement } from "./MenuListElement.js";
import type { MenuItemElement } from "./MenuItemElement.js";

export class MenuSubListElement extends HTMLElement {
  #isDefined = false;

  connectedCallback() {
    if (this.#isDefined || !this.isConnected) return;
    this.#isDefined = true;
  }

  get opener() {
    return this.querySelector<MenuItemElement>(":scope > menu-item");
  }

  get list() {
    return this.querySelector<MenuListElement>(":scope > menu-list");
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menu-sub-list": MenuSubListElement;
  }
}

window.customElements.define("menu-sub-list",MenuSubListElement);