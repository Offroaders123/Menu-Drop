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
}

class MenuOpenerElement extends ElementTemplate {
  constructor(){
    super();
  }
  parsedCallback() {
    this.button = document.createElement("button");
    this.button.append(...this.childNodes);
    this.append(this.button);
  }
}

class MenuListElement extends ElementTemplate {
}

class MenuItemElement extends ElementTemplate {
  parsedCallback() {
    this.tabIndex = "0";
  }
}

window.customElements.define("menu-drop",MenuDropElement);
window.customElements.define("menu-opener",MenuOpenerElement);
window.customElements.define("menu-list",MenuListElement);
window.customElements.define("menu-item",MenuItemElement);