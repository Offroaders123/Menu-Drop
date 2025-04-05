import type { MenuList } from "./MenuList.js";
import type { MenuItem } from "./MenuItem.js";

export class MenuSubList extends HTMLElement {
  get opener(): MenuItem | null {
    return this.querySelector<MenuItem>(":scope > menu-item");
  }

  get list(): MenuList | null {
    return this.querySelector<MenuList>(":scope > menu-list");
  }
}

customElements.define("menu-sub-list",MenuSubList);

declare global {
  interface HTMLElementTagNameMap {
    "menu-sub-list": MenuSubList;
  }
}