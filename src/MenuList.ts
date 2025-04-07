import type { MenuDrop } from "./MenuDrop.js";
import type { MenuItem } from "./MenuItem.js";
import type { MenuSubList } from "./MenuSubList.js";

export interface MenuListCloseOptions {
  recursive?: boolean;
}

export class MenuList extends HTMLElement {
  override tabIndex = -1;

  constructor() {
    super();

    if (this.isOpen) {
      this.open();
    }
  }

  open(): void {
    if (this.isMainList) {
      const { left, bottom } = this.menu!.opener?.getBoundingClientRect() ?? new DOMRect();
      this.style.left = `${left satisfies number}px`;
      this.style.top = `${bottom satisfies number}px`;
      this.menu!.setAttribute("open", "");
    }

    this.setAttribute("open", "");

    if (this.isSubList) {
      this.subList!.setAttribute("open", "");
    }
  }

  close(options?: MenuListCloseOptions): void;
  close({ recursive = true }: MenuListCloseOptions = {}): void {
    if (recursive) {
      for (const list of this.lists) {
        if (list.isOpen) list.close();
      }
    }

    if (!this.isOpen) return;

    this.removeAttribute("open");

    if (this.isMainList) {
      this.removeAttribute("style");
      this.menu!.removeAttribute("open");
    }

    if (this.isSubList) {
      this.subList!.removeAttribute("open");
    }
  }

  toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  get items(): MenuItem[] {
    return [...this.querySelectorAll<MenuItem>(":scope > menu-item, :scope > menu-sub-list > menu-item")];
  }

  get lists(): MenuList[] {
    return [...this.querySelectorAll<MenuList>(":scope > menu-sub-list > menu-list")];
  }

  get visibility(): boolean {
    const { left, right, width } = this.getBoundingClientRect();
    return (left >= 0 && right <= window.innerWidth - width);
  }

  get isMainList(): boolean {
    return this.matches<MenuList>("menu-drop > menu-list");
  }

  get menu(): MenuDrop | null {
    return this.closest("menu-drop");
  }

  get isOpen(): boolean {
    return this.matches<MenuList>("[open]");
  }

  get list(): MenuList {
    return this;
  }

  get currentItem(): MenuItem | null {
    return this.items.find(item => item === document.activeElement) ?? null;
  }

  get nextItem(): MenuItem | null {
    const { currentItem, items } = this;
    if (currentItem === null) return null;

    const index = currentItem.index + 1;
    return items[index <= items.length - 1 ? index : 0] ?? null;
  }

  get previousItem(): MenuItem | null {
    const { currentItem, items } = this;
    if (currentItem === null) return null;

    const index = currentItem.index - 1;
    return items[index >= 0 ? index : items.length - 1] ?? null;
  }

  get subList(): MenuSubList | null {
    return this.closest("menu-sub-list");
  }

  get isSubList(): boolean {
    return this.subList !== null;
  }
}

customElements.define("menu-list", MenuList);

declare global {
  interface HTMLElementTagNameMap {
    "menu-list": MenuList;
  }
}