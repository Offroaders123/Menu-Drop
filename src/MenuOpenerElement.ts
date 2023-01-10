export class MenuOpenerElement extends HTMLElement {
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

declare global {
  interface HTMLElementTagNameMap {
    "menu-opener": MenuOpenerElement;
  }
}

window.customElements.define("menu-opener",MenuOpenerElement);