import MenuOpener from "./menu-opener.js";
import MenuList from "./menu-list.js";
import MenuItem from "./menu-item.js";

const stylesheet = new CSSStyleSheet();

fetch(new URL("../src/style.css",import.meta.url)).then(async response => {
  const result = await response.text();
  stylesheet.replaceSync(result);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets,stylesheet];
});

export class MenuDrop extends HTMLElement {
  #isDefined = false;
  #__pointerType__: string | null = null;

  connectedCallback() {
    if (this.#isDefined || !this.isConnected) return;
    this.#isDefined = true;

    this.addEventListener("keydown",event => {
      if (!(event.target instanceof Element)) return;

      // Target is essentially event.target, but it fixes it so that menu-opener is the element when the
      // inner button is focused, since the button doesn't have component methonds available to call.
      const target = (event.target.matches("menu-opener button")) ? event.target.closest("menu-opener")! : event.target;

      if (event.key === "ArrowDown"){
        if (!this.isOpen) return;
        event.preventDefault();
        if (target instanceof MenuOpener || target instanceof MenuList || target instanceof MenuItem){
          target.list?.nextItem.focus();
        }
      }
      if (event.key === "ArrowUp"){
        if (!this.isOpen) return;
        event.preventDefault();
        if (target instanceof MenuOpener || target instanceof MenuList || target instanceof MenuItem){
          target.list?.previousItem.focus();
        }
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft"){
        if (!this.isOpen) return;
        event.preventDefault();
        if (target instanceof MenuList){
          target.items[0].focus();
        }
      }
      if (event.key === "ArrowRight"){
        if (!this.isOpen) return;
        if (target instanceof MenuItem && target.matches("menu-sub-list > :scope")){
          target.subList?.list?.open();
          target.subList?.list?.items[0].focus();
        }
      }
      if (event.key === "ArrowLeft"){
        if (!this.isOpen) return;
        if (target instanceof MenuItem && target.matches("menu-sub-list > :scope") && target.subList?.list?.isOpen){
          target.subList?.list?.close();
        }
        if (target instanceof MenuItem && target.matches("menu-sub-list > menu-list :scope")){
          target.list?.subList?.opener?.focus();
          target.list?.subList?.list?.close();
        }
      }
      if (event.key === "Escape"){
        if (!this.isOpen) return;
        event.preventDefault();
        if (target instanceof MenuItem && target.matches("menu-sub-list > menu-list :scope")){
          target.subList?.opener?.focus();
          target.list?.close();
        } else {
          this.opener?.button?.focus();
          this.close();
        }
      }
      if (event.key === "Tab"){
        if (this.isOpen) event.preventDefault();
      }
      if (event.key === "Enter"){
        if (!this.isOpen) return;
        if (target instanceof MenuItem){
          event.preventDefault();
          target.click();
        }
        if (target instanceof MenuItem && target.matches("menu-sub-list > :scope")){
          target.subList?.list?.items[0].focus();
        }
      }

    });

    this.addEventListener("keyup",event => {
      if (!(event.target instanceof Element)) return;

      if (event.key === " "){
        if (!this.isOpen) return;
        if (event.target instanceof MenuItem){
          event.preventDefault();
          event.target.click();
        }
        if (event.target instanceof MenuItem && event.target.matches("menu-sub-list > :scope")){
          event.target.subList?.list?.items[0].focus();
        }
      }
    });

    this.addEventListener("pointerdown",event => {
      if (!(event.target instanceof Element)) return;

      // This is a workaround to be able to detect the pointerType within
      // click events for browsers that don't provide the value there.
      // All browsers support it in Pointer Events, so I just save the
      // value as a property on the element while the event takes place.
      this.#__pointerType__ = event.pointerType;

      // See the keydown event declaration for more info :)
      const target = event.target.matches("menu-opener button") ? event.target.closest("menu-opener")! : event.target;

      if (event.button !== 0 || target.matches("menu-list")) event.preventDefault();
      if (target instanceof MenuOpener){
        if (target !== document.activeElement) target.focus();
        if (event.button === 0) this.toggle();
      }
      if (target instanceof MenuList){
        target.focus();
        target.lists.filter(list => list.isOpen).forEach(list => list.close());
      }
    });

    this.addEventListener("pointermove",event => {
      if (!(event.target instanceof Element)) return;

      if (event.target === document.activeElement) return;
      if (event.target instanceof MenuItem) event.target.focus();
      if (event.target instanceof MenuItem && event.target.matches("menu-sub-list > :scope")) event.target.subList?.list?.open();
      if (event.target instanceof MenuItem && event.target.matches(":not(menu-sub-list) > :scope")) event.target.list?.lists.filter(list => list.isOpen).forEach(list => list.close());
    });

    this.addEventListener("click",event => {
      if (!(event.target instanceof Element)) return;

      // See the pointerdown event for more info :O
      // @ts-ignore
      if (!("pointerType" in event)) event.pointerType = this.#__pointerType__;
      this.#__pointerType__ = null;

      // See the keydown event declaration for more info :)
      const target = event.target.matches("menu-opener button") ? event.target.closest("menu-opener")! : event.target;

      // @ts-ignore
      if (target instanceof MenuOpener && event.pointerType !== "mouse"){
        if (target !== document.activeElement) target.focus();
        this.toggle();
      }
      if (target instanceof MenuItem && target.matches("menu-sub-list > :scope")) target.subList?.list?.toggle();
      if (target instanceof MenuItem && target.matches(":not(menu-sub-list) > :scope")){
        this.opener?.focus();
        this.close();
      }
    });

    this.addEventListener("focusout",() => {
      window.requestAnimationFrame(() => {
        if (this.contains(document.activeElement)) return;
        if (this.isOpen) this.close();
      });
    });
  }

  open() {
    this.list?.open();
  }

  close() {
    this.list?.close();
  }

  toggle() {
    this.list?.toggle();
  }

  get opener() {
    return this.querySelector("menu-opener");
  }

  get isOpen() {
    return this.list?.isOpen ?? false;
  }

  get list() {
    return this.querySelector<MenuList>(":scope > menu-list");
  }

  get lists() {
    return [...this.querySelectorAll<MenuList>(":scope > menu-list")];
  }
}

window.customElements.define("menu-drop",MenuDrop);

declare global {
  interface HTMLElementTagNameMap {
    "menu-drop": MenuDrop;
  }
}

export default MenuDrop;