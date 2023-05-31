import type MenuList from "./MenuList.js";
import type MenuItem from "./MenuItem.js";

export class MenuSubList extends HTMLElement {
  get opener() {
    return this.querySelector<MenuItem>(":scope > menu-item");
  }

  get list() {
    return this.querySelector<MenuList>(":scope > menu-list");
  }
}

window.customElements.define("menu-sub-list",MenuSubList);

declare global {
  interface HTMLElementTagNameMap {
    "menu-sub-list": MenuSubList;
  }
}

export default MenuSubList;