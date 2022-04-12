const styles = new CSSStyleSheet();
styles.replaceSync(`
  menu-drop {
    position: relative;
    display: inline;
    background: lightblue;
  }
  menu-opener {
    display: contents;
  }
  menu-opener button {
    background: red;
  }
  menu-list ul {
    position: absolute;
  }
  menu-list menu-list {
    display: contents;
  }
  menu-item {
    display: contents;
  }
`);
document.adoptedStyleSheets = [...document.adoptedStyleSheets,styles];

/* https://www.google.com/search?q=callback+when+all+element+children+load+innerhtml */
/* https://stackoverflow.com/questions/48663678/how-to-have-a-connectedcallback-for-when-all-child-custom-elements-have-been-c */
/* https://github.com/WICG/webcomponents/issues/551#issuecomment-431258689 */
/* https://stackoverflow.com/questions/20910147/how-to-move-all-html-element-children-to-another-parent-using-javascript */

const debug = false;

class MenuDropTemplate extends HTMLElement {
  constructor() {
    super();
    this.hasParsed = false;
  }
  get parentNodes() {
    const parentNodes = [];
    let i = this;
    while (i.parentNode){
      i = i.parentNode;
      parentNodes.push(i);
    }
    return parentNodes;
  }
  connectedCallback() {
    if (this.hasParsed || !this.isConnected) return;

    if (debug) console.log("connectedCallback\n",this.children,performance.now());
    if (debug) window.requestAnimationFrame(() => console.log("requestAnimationFrame\n",this.children,performance.now()));

    const { parentNodes } = this;
    parentNodes.unshift(this);

    if (parentNodes.some(element => element.nextSibling) || document.readyState !== "loading"){
      if (debug) console.log("document.readyState");
      this.parsedCallback();
    } else {
      new MutationObserver((undefined,observer) => {
        if (parentNodes.some(element => element.nextSibling) || document.readyState !== "loading"){
          if (debug) console.log("mutationObserver");
          this.parsedCallback();
          observer.disconnect();
        }
      }).observe(this,{ childList: true });
    }
  }
  parsedCallback() {
    this.hasParsed = true;

    if (debug) console.log("parsedCallback\n",this.children,performance.now());
  }
}

class MenuDropElement extends MenuDropTemplate {
  constructor() {
    super();
  }
}

window.customElements.define("menu-drop",MenuDropElement);

class MenuOpenerElement extends MenuDropTemplate {
  constructor() {
    super();
  }
  connectedCallback() {
    super.connectedCallback();
  }
  parsedCallback() {
    super.parsedCallback();

    const button = document.createElement("button");
    button.append(...this.childNodes);
    this.append(button);
  }
}

window.customElements.define("menu-opener",MenuOpenerElement);

class MenuListElement extends MenuDropTemplate {
  constructor() {
    super();
  }
  connectedCallback() {
    super.connectedCallback();
  }
  parsedCallback() {
    super.parsedCallback();

    const list = document.createElement("ul");
    list.append(...this.childNodes);
    this.append(list);
  }
}

window.customElements.define("menu-list",MenuListElement);

class MenuItemElement extends MenuDropTemplate {
  constructor() {
    super();
  }
  connectedCallback() {
    super.connectedCallback();
  }
  parsedCallback() {
    super.parsedCallback();

    const item = document.createElement("li");
    item.append(...this.childNodes);
    this.append(item);
  }
}

window.customElements.define("menu-item",MenuItemElement);