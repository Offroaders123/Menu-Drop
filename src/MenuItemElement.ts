export class MenuItemElement extends HTMLElement {
  #isDefined = false;

  connectedCallback() {
    if (this.#isDefined || !this.isConnected) return;
    this.#isDefined = true;

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

declare global {
  interface HTMLElementTagNameMap {
    "menu-item": MenuItemElement;
  }
}

window.customElements.define("menu-item",MenuItemElement);