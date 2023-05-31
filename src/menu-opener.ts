export class MenuOpener extends HTMLElement {
  #button = document.createElement("button");

  declare readonly shadowRoot: ShadowRoot;

  constructor() {
    super();
    this.attachShadow({ mode: "open", delegatesFocus: true });
    
    this.#button.append(document.createElement("slot"));
    this.shadowRoot.append(this.#button);
  }

  override focus(options?: FocusOptions) {
    this.#button.focus(options);
  }

  get menu() {
    return this.closest("menu-drop");
  }

  get list() {
    return this.menu?.list ?? null;
  }

  get button() {
    return this.#button;
  }
}

window.customElements.define("menu-opener",MenuOpener);

declare global {
  interface HTMLElementTagNameMap {
    "menu-opener": MenuOpener;
  }
}

export default MenuOpener;