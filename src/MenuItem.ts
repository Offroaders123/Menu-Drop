import type MenuList from "./MenuList.js";
import type MenuSubList from "./MenuSubList.js";

export interface MenuItemLike extends HTMLElement {
  readonly list: MenuList | null;
}

export class MenuItem extends HTMLElement implements MenuItemLike {
  constructor() {
    super();
    this.tabIndex = -1;
  }

  get list(): MenuList | null {
    return this.closest("menu-list");
  }

  get index(): number {
    return this.list?.items.indexOf(this) ?? 0;
  }

  get subList(): MenuSubList | null {
    return this.closest("menu-sub-list");
  }
}

window.customElements.define("menu-item",MenuItem);

declare global {
  interface HTMLElementTagNameMap {
    "menu-item": MenuItem;
  }
}

export default MenuItem;