export class MenuItem extends HTMLElement {
  constructor() {
    super();
    this.tabIndex = -1;
  }

  get list() {
    return this.closest("menu-list");
  }

  get index() {
    return this.list?.items.indexOf(this) ?? 0;
  }

  get subList() {
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