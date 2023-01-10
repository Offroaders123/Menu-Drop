import { MenuOpenerElement } from "./menu-opener.js";
import { MenuListElement } from "./menu-list.js";
import { MenuItemElement } from "./menu-item.js";

export class MenuDropElement extends HTMLElement {
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
        if (target instanceof MenuOpenerElement || target instanceof MenuListElement || target instanceof MenuItemElement){
          target.list?.nextItem.focus();
        }
      }
      if (event.key === "ArrowUp"){
        if (!this.isOpen) return;
        event.preventDefault();
        if (target instanceof MenuOpenerElement || target instanceof MenuListElement || target instanceof MenuItemElement){
          target.list?.previousItem.focus();
        }
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft"){
        if (!this.isOpen) return;
        event.preventDefault();
        if (target instanceof MenuListElement){
          target.items[0].focus();
        }
      }
      if (event.key === "ArrowRight"){
        if (!this.isOpen) return;
        if (target instanceof MenuItemElement && target.matches("menu-sub-list > :scope")){
          target.subList?.list?.open();
          target.subList?.list?.items[0].focus();
        }
      }
      if (event.key === "ArrowLeft"){
        if (!this.isOpen) return;
        if (target instanceof MenuItemElement && target.matches("menu-sub-list > :scope") && target.subList?.list?.isOpen){
          target.subList?.list?.close();
        }
        if (target instanceof MenuItemElement && target.matches("menu-sub-list > menu-list :scope")){
          target.list?.subList?.opener?.focus();
          target.list?.subList?.list?.close();
        }
      }
      if (event.key === "Escape"){
        if (!this.isOpen) return;
        event.preventDefault();
        if (target instanceof MenuItemElement && target.matches("menu-sub-list > menu-list :scope")){
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
        if (target instanceof MenuItemElement){
          event.preventDefault();
          target.click();
        }
        if (target instanceof MenuItemElement && target.matches("menu-sub-list > :scope")){
          target.subList?.list?.items[0].focus();
        }
      }

    });

    this.addEventListener("keyup",event => {
      if (!(event.target instanceof Element)) return;

      if (event.key === " "){
        if (!this.isOpen) return;
        if (event.target instanceof MenuItemElement){
          event.preventDefault();
          event.target.click();
        }
        if (event.target instanceof MenuItemElement && event.target.matches("menu-sub-list > :scope")){
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
      if (target instanceof MenuOpenerElement){
        if (target !== document.activeElement) target.focus();
        if (event.button === 0) this.toggle();
      }
      if (target instanceof MenuListElement){
        target.focus();
        target.lists.filter(list => list.isOpen).forEach(list => list.close());
      }
    });

    this.addEventListener("pointermove",event => {
      if (!(event.target instanceof Element)) return;

      if (event.target === document.activeElement) return;
      if (event.target instanceof MenuItemElement) event.target.focus();
      if (event.target instanceof MenuItemElement && event.target.matches("menu-sub-list > :scope")) event.target.subList?.list?.open();
      if (event.target instanceof MenuItemElement && event.target.matches(":not(menu-sub-list) > :scope")) event.target.list?.lists.filter(list => list.isOpen).forEach(list => list.close());
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
      if (target instanceof MenuOpenerElement && event.pointerType !== "mouse"){
        if (target !== document.activeElement) target.focus();
        this.toggle();
      }
      if (target instanceof MenuItemElement && target.matches("menu-sub-list > :scope")) target.subList?.list?.toggle();
      if (target instanceof MenuItemElement && target.matches(":not(menu-sub-list) > :scope")){
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
    return this.querySelector<MenuListElement>(":scope > menu-list");
  }

  get lists() {
    return [...this.querySelectorAll<MenuListElement>(":scope > menu-list")];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menu-drop": MenuDropElement;
  }
}

window.customElements.define("menu-drop",MenuDropElement);