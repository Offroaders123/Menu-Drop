import MenuOpener from "./menu-opener.js";
import MenuList from "./menu-list.js";
import MenuItem from "./menu-item.js";

export class MenuDrop extends HTMLElement {
  #pointerType: typeof PointerEvent.prototype.pointerType | null = null;

  constructor() {
    super();

    this.addEventListener("keydown",event => {
      if (!(event.target instanceof Element)) return;

      // Target is essentially event.target, but it fixes it so that menu-opener is the element when the
      // inner button is focused, since the button doesn't have component methonds available to call.
      const target = (event.target.matches<HTMLButtonElement>("menu-opener button")) ? event.target.closest("menu-opener")! : event.target;

      if (event.key === "ArrowDown"){
        if (!this.isOpen) return;
        event.preventDefault();
        if (target.matches<MenuOpener | MenuList | MenuItem>("menu-opener, menu-list, menu-item")){
          target.list?.nextItem.focus();
        }
      }
      if (event.key === "ArrowUp"){
        if (!this.isOpen) return;
        event.preventDefault();
        if (target.matches<MenuOpener | MenuList | MenuItem>("menu-opener, menu-list, menu-item")){
          target.list?.previousItem.focus();
        }
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft"){
        if (!this.isOpen) return;
        event.preventDefault();
        if (target.matches("menu-list")){
          target.items[0].focus();
        }
      }
      if (event.key === "ArrowRight"){
        if (!this.isOpen) return;
        if (target.matches<MenuItem>("menu-sub-list > menu-item")){
          target.subList?.list?.open();
          target.subList?.list?.items[0].focus();
        }
      }
      if (event.key === "ArrowLeft"){
        if (!this.isOpen) return;
        if (target.matches<MenuItem>("menu-sub-list > menu-item") && target.subList?.list?.isOpen){
          target.subList?.list?.close();
        }
        if (target.matches<MenuItem>("menu-sub-list > menu-list menu-item")){
          target.list?.subList?.opener?.focus();
          target.list?.subList?.list?.close();
        }
      }
      if (event.key === "Escape"){
        if (!this.isOpen) return;
        event.preventDefault();
        if (target.matches<MenuItem>("menu-sub-list > menu-list menu-item")){
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
        if (target.matches("menu-item")){
          event.preventDefault();
          target.click();
        }
        if (target.matches<MenuItem>("menu-sub-list > menu-item")){
          target.subList?.list?.items[0].focus();
        }
      }

    });

    this.addEventListener("keyup",event => {
      if (!(event.target instanceof Element)) return;

      if (event.key === " "){
        if (!this.isOpen) return;
        if (event.target.matches("menu-item")){
          event.preventDefault();
          event.target.click();
        }
        if (event.target.matches<MenuItem>("menu-sub-list > menu-item")){
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
      this.#pointerType = event.pointerType;

      // See the keydown event declaration for more info :)
      const target = event.target.matches<HTMLButtonElement>("menu-opener button") ? event.target.closest("menu-opener")! : event.target;

      if (event.pointerType === "mouse"){
        if (event.button !== 0 || target.matches<MenuOpener | MenuList>("menu-opener, menu-list")) event.preventDefault();
        if (target.matches("menu-opener")){
          if (target !== document.activeElement) target.button?.focus();
          if (event.button === 0) this.toggle();
        }
        if (target.matches("menu-list")){
          target.focus();
          target.lists.filter(list => list.isOpen).forEach(list => list.close());
        }
      }
    });

    this.addEventListener("pointermove",event => {
      if (!(event.target instanceof Element)) return;

      if (event.pointerType === "mouse"){
        if (event.target === document.activeElement) return;
        if (event.target.matches("menu-item")) event.target.focus();
        if (event.target.matches<MenuItem>("menu-sub-list > menu-item")) event.target.subList?.list?.open();
        if (event.target.matches<MenuItem>(":not(menu-sub-list) > menu-item")) event.target.list?.lists.filter(list => list.isOpen).forEach(list => list.close());
      }
    });

    this.addEventListener("pointerup",event => {
      if (!(event.target instanceof HTMLElement)) return;
      if (event.pointerType === "mouse") return;

      if (event.target.matches("menu-list")){
        event.target.focus();
        event.target.lists.filter(list => list.isOpen).forEach(list => list.close());
      }
    });

    this.addEventListener("click",event => {
      if (!(event.target instanceof Element)) return;

      // See the pointerdown event for more info :O
      // @ts-ignore
      if (!("pointerType" in event)) event.pointerType = this.#pointerType;
      this.#pointerType = null;

      // See the keydown event declaration for more info :)
      const target = event.target.matches<HTMLButtonElement>("menu-opener button") ? event.target.closest("menu-opener")! : event.target;

      // @ts-ignore
      if (target.matches("menu-opener") && event.pointerType !== "mouse"){
        if (target !== document.activeElement) target.focus();
        this.toggle();
      }
      if (target.matches<MenuItem>("menu-sub-list > menu-item")) target.subList?.list?.toggle();
      if (target.matches<MenuItem>(":not(menu-sub-list) > menu-item")){
        this.opener?.button?.focus();
        this.close();
      }
    });

    this.addEventListener("contextmenu",event => {
      if (!(event.target instanceof HTMLElement)) return;
      event.preventDefault();
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