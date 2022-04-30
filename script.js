class ElementTemplate extends HTMLElement {
  constructor(...args) {
    super(...args);
    this.hasParsed = false;
  }
  connectedCallback() {
    if (this.hasParsed) return;
    const nodes = [this];
    let node = this;
    while (node.parentNode){
      node = node.parentNode;
      nodes.push(node);
    }
    if (nodes.some(node => node.nextSibling) || document.readyState !== "loading"){
      if (this.parsedCallback && !this.hasParsed) this.parsedCallback();
      this.hasParsed = true;
    } else {
      new MutationObserver((undefined,observer) => {
        if (nodes.some(node => node.nextSibling) || document.readyState !== "loading"){
          if (this.parsedCallback && !this.hasParsed) this.parsedCallback();
          this.hasParsed = true;
        }
      }).observe(this,{ childList: true });
    }
  }
}

class MenuDropElement extends ElementTemplate {
  get opener() {
    return this.querySelector("menu-opener");
  }
  get isOpen() {
    return this.list.isOpen;
  }
  get list() {
    return this.querySelector(":scope > menu-list");
  }
  get lists() {
    return [...this.querySelectorAll(":scope > menu-list")];
  }
  open() {
    this.list.open();
  }
  close() {
    this.list.close();
  }
  toggle() {
    this.list.toggle();
  }
  parsedCallback() {
    this.addEventListener("keydown",event => {
      // Target is essentially event.target, but it fixes it so that menu-opener is the element when the
      // inner button is focused, since the button doesn't have component methonds available to call.
      const target = event.target.matches("menu-opener button") ? event.target.closest("menu-opener") : event.target;

      if (event.key === "ArrowDown"){
        if (!this.isOpen) return;
        event.preventDefault();
        if (target.matches("menu-opener, menu-list, menu-item")){
          target.list.nextItem.focus();
        }
      }
      if (event.key === "ArrowUp"){
        if (!this.isOpen) return;
        event.preventDefault();
        if (target.matches("menu-opener, menu-list, menu-item")){
          target.list.previousItem.focus();
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
        if (target.matches("menu-sub-list > menu-item")){
          target.subList.list.open();
          target.subList.list.items[0].focus();
        }
      }
      if (event.key === "ArrowLeft"){
        if (!this.isOpen) return;
        if (target.matches("menu-sub-list > menu-item") && target.subList.list.isOpen){
          target.subList.list.close();
        }
        if (target.matches("menu-sub-list > menu-list menu-item")){
          target.list.subList.opener.focus();
          target.list.subList.list.close();
        }
      }
      if (event.key === "Escape"){
        if (!this.isOpen) return;
        event.preventDefault();
        if (target.matches("menu-sub-list > menu-list menu-item")){
          target.subList.opener.focus();
          target.list.close();
        } else {
          this.opener.button.focus();
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
        if (target.matches("menu-sub-list > menu-item")){
          target.subList.list.items[0].focus();
        }
      }

    });
    this.addEventListener("keyup",event => {
      if (event.key === " "){
        if (!this.isOpen) return;
        if (event.target.matches("menu-item")){
          event.preventDefault();
          event.target.click();
        }
        if (event.target.matches("menu-sub-list > menu-item")){
          event.target.subList.list.items[0].focus();
        }
      }
    });
    this.addEventListener("pointerdown",event => {
      // This is a workaround to be able to detect the pointerType within
      // click events for browsers that don't provide the value there.
      // All browsers support it in Pointer Events, so I just save the
      // value as a property on the element while the event takes place.
      this.__pointerType__ = event.pointerType;

      // See the keydown event declaration for more info :)
      const target = event.target.matches("menu-opener button") ? event.target.closest("menu-opener") : event.target;

      if (event.button !== 0 || target.matches("menu-list")) event.preventDefault();
      if (target.matches("menu-opener")){
        if (target !== document.activeElement) target.focus();
        if (event.button === 0) this.toggle();
      }
      if (target.matches("menu-list")){
        target.focus();
        target.lists.filter(list => list.isOpen).forEach(list => list.close());
      }
    });
    this.addEventListener("pointermove",event => {
      if (event.target === document.activeElement) return;
      if (event.target.matches("menu-item")) event.target.focus();
      if (event.target.matches("menu-sub-list > menu-item")) event.target.subList.list.open();
      if (event.target.matches(":not(menu-sub-list) > menu-item")) event.target.list.lists.filter(list => list.isOpen).forEach(list => list.close());
    });
    this.addEventListener("click",event => {
      // See the pointerdown event for more info :O
      if (!("pointerType" in event)) event.pointerType = this.__pointerType__;
      delete this.__pointerType__;

      // See the keydown event declaration for more info :)
      const target = event.target.matches("menu-opener button") ? event.target.closest("menu-opener") : event.target;

      if (target.matches("menu-opener") && event.pointerType !== "mouse"){
        if (target !== document.activeElement) target.focus();
        this.toggle();
      }
      if (target.matches("menu-sub-list > menu-item")) target.subList.list.toggle();
      if (target.matches(":not(menu-sub-list) > menu-item")){
        this.opener.focus();
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
}

class MenuOpenerElement extends ElementTemplate {
  constructor(){
    super();
  }
  get menu() {
    return this.closest("menu-drop");
  }
  get list() {
    return this.menu.list;
  }
  get button() {
    return this.querySelector("button");
  }
}

class MenuListElement extends ElementTemplate {
  get items() {
    return [...this.querySelectorAll(":scope > menu-item, :scope > menu-sub-list > menu-item")];
  }
  get lists() {
    return [...this.querySelectorAll(":scope > menu-sub-list > menu-list")];
  }
  get visibility() {
    const { left, right, width } = this.getBoundingClientRect();
    return (left >= 0 && right <= window.innerWidth - width);
  }
  get isMainList() {
    return this.matches("menu-drop > menu-list");
  }
  get menu() {
    return this.closest("menu-drop");
  }
  get isOpen() {
    return this.matches("[open]");
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
    return this.subList ? true : false;
  }
  open() {
    if (this.isMainList){
      const { left, bottom } = this.menu.opener.getBoundingClientRect();
      this.style.left = `${left}px`;
      this.style.top = `${bottom}px`;
    }
    this.setAttribute("open","");
    if (this.isSubList) this.subList.setAttribute("open","");
  }
  close({ recursive = true } = {}) {
    if (recursive) this.lists.filter(list => list.isOpen).forEach(list => list.close());
    if (!this.isOpen) return;
    this.removeAttribute("open");
    if (this.isMainList) this.removeAttribute("style");
    if (this.isSubList) this.subList.removeAttribute("open");
  }
  toggle() {
    this.isOpen ? this.close() : this.open();
  }
  parsedCallback() {
    this.tabIndex = "-1";
    if (this.isOpen) this.open();
  }
}

class MenuItemElement extends ElementTemplate {
  get list() {
    return this.closest("menu-list");
  }
  get index() {
    return this.list.items.indexOf(this);
  }
  get subList() {
    return this.closest("menu-sub-list");
  }
  parsedCallback() {
    this.tabIndex = "-1";
  }
}

class MenuSubListElement extends ElementTemplate {
  get opener() {
    return this.querySelector(":scope > menu-item");
  }
  get list() {
    return this.querySelector(":scope > menu-list");
  }
}

window.customElements.define("menu-drop",MenuDropElement);
window.customElements.define("menu-opener",MenuOpenerElement);
window.customElements.define("menu-list",MenuListElement);
window.customElements.define("menu-item",MenuItemElement);
window.customElements.define("menu-sub-list",MenuSubListElement);