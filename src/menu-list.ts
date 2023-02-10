import type MenuItem from "./menu-item.js";

export class MenuList extends HTMLElement {
  constructor() {
    super();
    this.tabIndex = -1;
    if (this.isOpen) this.open();
  }

  open() {
    if (this.isMainList){
      this.menu?.setAttribute("open","");

      const { left, bottom } = this.menu?.opener?.getBoundingClientRect() ?? {};
      this.style.left = `${left}px`;
      this.style.top = `${bottom}px`;
    }
    this.setAttribute("open","");
    if (this.isSubList) this.subList?.setAttribute("open","");
  }

  close({ recursive = true } = {}) {
    if (recursive) this.lists.filter(list => list.isOpen).forEach(list => list.close());
    if (!this.isOpen) return;
    this.removeAttribute("open");
    if (this.isMainList){
      this.removeAttribute("style");
      this.menu?.removeAttribute("open");
    }
    if (this.isSubList) this.subList?.removeAttribute("open");
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  get items() {
    return [...this.querySelectorAll<MenuItem>(":scope > menu-item, :scope > menu-sub-list > menu-item")];
  }

  get lists() {
    return [...this.querySelectorAll<MenuList>(":scope > menu-sub-list > menu-list")];
  }

  get visibility() {
    const { left, right, width } = this.getBoundingClientRect();
    return (left >= 0 && right <= window.innerWidth - width);
  }

  get isMainList() {
    return this.matches<MenuList>("menu-drop > menu-list");
  }

  get menu() {
    return this.closest("menu-drop");
  }

  get isOpen() {
    return this.matches<MenuList>("[open]");
  }

  get list() {
    return this;
  }

  get currentItem() {
    return this.items.filter(item => item === document.activeElement)[0];
  }

  get nextItem() {
    const { currentItem, items } = this;
    const index = currentItem?.index + 1;
    return items[index <= items.length - 1 ? index : 0];
  }

  get previousItem() {
    const { currentItem, items } = this;
    const index = currentItem?.index - 1;
    return items[index >= 0 ? index : items.length - 1];
  }

  get subList() {
    return this.closest("menu-sub-list");
  }

  get isSubList() {
    return (this.subList !== null);
  }
}

window.customElements.define("menu-list",MenuList);

declare global {
  interface HTMLElementTagNameMap {
    "menu-list": MenuList;
  }
}

export default MenuList;