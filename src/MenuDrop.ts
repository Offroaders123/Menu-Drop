import MenuOpener from "./MenuOpener.js";
import MenuList from "./MenuList.js";
import MenuItem from "./MenuItem.js";

import type { MenuItemLike } from "./MenuItem.js";

export class MenuDrop extends HTMLElement {
  #pointerType: typeof PointerEvent.prototype.pointerType | null = null;

  constructor() {
    super();

    this.addEventListener("keydown",event => {
      if (!(event.target instanceof Element)) return;

      if (event.key === "ArrowDown"){
        if (!this.isOpen) return;
        event.preventDefault();

        if (event.target.matches<MenuItemLike>("menu-opener, menu-list, menu-item")){
          event.target.list?.nextItem?.focus();
        }
      }

      if (event.key === "ArrowUp"){
        if (!this.isOpen) return;
        event.preventDefault();

        if (event.target.matches<MenuItemLike>("menu-opener, menu-list, menu-item")){
          event.target.list?.previousItem?.focus();
        }
      }

      if (event.key === "ArrowRight" || event.key === "ArrowLeft"){
        if (!this.isOpen) return;
        event.preventDefault();

        if (event.target.matches("menu-list")){
          event.target.items[0]?.focus();
        }
      }

      if (event.key === "ArrowRight"){
        if (!this.isOpen) return;

        if (event.target.matches<MenuItem>("menu-sub-list > menu-item")){
          event.target.subList?.list?.open();
          event.target.subList?.list?.items[0]?.focus();
        }
      }

      if (event.key === "ArrowLeft"){
        if (!this.isOpen) return;

        if (event.target.matches<MenuItem>("menu-sub-list > menu-item") && event.target.subList?.list?.isOpen){
          event.target.subList?.list?.close();
        }

        if (event.target.matches<MenuItem>("menu-sub-list > menu-list menu-item")){
          event.target.list?.subList?.opener?.focus();
          event.target.list?.subList?.list?.close();
        }
      }

      if (event.key === "Escape"){
        if (!this.isOpen) return;
        event.preventDefault();

        if (event.target.matches<MenuItem>("menu-sub-list > menu-list menu-item")){
          event.target.list?.subList?.opener?.focus();
          event.target.list?.close();
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

        if (event.target.matches("menu-item")){
          event.preventDefault();
          event.target.click();
        }

        if (event.target.matches<MenuItem>("menu-sub-list > menu-item")){
          event.target.subList?.list?.items[0]?.focus();
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
          event.target.subList?.list?.items[0]?.focus();
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

      if (event.pointerType === "mouse"){
        if (event.button !== 0 || event.target.matches<MenuOpener | MenuList>("menu-opener, menu-list")){
          event.preventDefault();
        }

        if (event.target.matches("menu-opener")){
          if (event.target !== document.activeElement) event.target.button?.focus();
          if (event.button === 0) this.toggle();
        }

        if (event.target.matches("menu-list")){
          event.target.focus();

          for (const list of event.target.lists){
            if (list.isOpen) list.close();
          }
        }
      }
    });

    this.addEventListener("pointermove",event => {
      if (!(event.target instanceof Element)) return;

      if (event.pointerType === "mouse" && event.target !== document.activeElement){
        if (event.target.matches("menu-item")) event.target.focus();
        if (event.target.matches<MenuItem>("menu-sub-list > menu-item")) event.target.subList?.list?.open();

        if (event.target.matches<MenuItem>(":not(menu-sub-list) > menu-item")){
          for (const list of event.target.list?.lists ?? []){
            if (list.isOpen) list.close();
          }
        }
      }
    });

    this.addEventListener("pointerup",event => {
      if (!(event.target instanceof HTMLElement)) return;
      if (event.pointerType === "mouse") return;

      if (event.target.matches("menu-list")){
        event.target.focus();

        for (const list of event.target.lists){
          if (list.isOpen) list.close();
        }
      }
    });

    this.addEventListener("click",event => {
      if (!(event.target instanceof Element)) return;

      // See the pointerdown event for more info :O
      // @ts-ignore
      if (!("pointerType" in event)) event.pointerType = this.#pointerType;
      this.#pointerType = null;

      // @ts-ignore
      if (event.target.matches("menu-opener") && event.pointerType !== "mouse"){
        if (event.target !== document.activeElement) event.target.focus();
        this.toggle();
      }

      if (event.target.matches<MenuItem>("menu-sub-list > menu-item")){
        event.target.subList?.list?.toggle();
      }

      if (event.target.matches<MenuItem>(":not(menu-sub-list) > menu-item")){
        this.opener?.button?.focus();
        this.close();
      }
    });

    this.addEventListener("contextmenu",event => {
      if (!(event.target instanceof HTMLElement)) return;
      event.preventDefault();
    });

    this.addEventListener("focusout",async () => {
      await new Promise(resolve => window.requestAnimationFrame(resolve));
      if (this.contains(document.activeElement)) return;

      if (this.isOpen) this.close();
    });
  }

  open(): void {
    this.list?.open();
  }

  close(): void {
    this.list?.close();
  }

  toggle(): void {
    this.list?.toggle();
  }

  get opener(): MenuOpener | null {
    return this.querySelector("menu-opener");
  }

  get isOpen(): boolean {
    return this.list?.isOpen ?? false;
  }

  get list(): MenuList | null {
    return this.querySelector<MenuList>(":scope > menu-list");
  }

  get lists(): MenuList[] {
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