export class MenuOpener extends HTMLElement {
  #isDefined = false;

  connectedCallback() {
    if (this.#isDefined || !this.isConnected) return;
    this.#isDefined = true;
  }

  get menu() {
    return this.closest("menu-drop");
  }

  get list() {
    return this.menu?.list ?? null;
  }

  get button() {
    return this.querySelector("button");
  }
}

window.customElements.define("menu-opener",MenuOpener);

declare global {
  interface HTMLElementTagNameMap {
    "menu-opener": MenuOpener;
  }
}

export default MenuOpener;