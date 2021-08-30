class MenuDropElement extends HTMLElement {
  constructor(){
    super();
    this.defined = false;
  }
  connectedCallback(){
    if (this.defined || !this.isConnected) return;
    this.defined = true;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.addEventListener("keydown",event => {
      if (event.key == "ArrowDown"){
        event.preventDefault();
        if (!this.matches("[data-open]")) return;
        if (event.target.matches(".opener, .list, .option")){
          var options = this.getOptions((event.target.matches(".option")) ? event.target.closest(".list") : (event.target.matches(".list")) ? event.target : undefined), index = options.indexOf(event.target) + 1, option = options[(index <= options.length - 1) ? index : 0];
          option.focus();
        }
        if (event.target.matches(".sub-list[data-open] > .option")) this.close(event.target.closest(".sub-list"));
      }
      if (event.key == "ArrowUp"){
        event.preventDefault();
        if (!this.matches("[data-open]")) return;
        if (event.target.matches(".opener, .list, .option")){
          var options = this.getOptions((event.target.matches(".option")) ? event.target.closest(".list") : (event.target.matches(".list")) ? event.target : undefined), index = options.indexOf(event.target) - 1, option = options[(index >= 0) ? index : options.length - 1];
          option.focus();
        }
        if (event.target.matches(".sub-list[data-open] > .option")) this.close(event.target.closest(".sub-list"));
      }
      if (event.key == "ArrowRight" || event.key == "ArrowLeft"){
        event.preventDefault();
        if (!this.matches("[data-open]")) return;
        if (event.target.matches(".list")){
          var options = this.getOptions(event.target), index = options.indexOf(event.target) + 1;
          options[(index <= options.length - 1) ? index : 0].focus();
        }
      }
      if (event.key == "ArrowRight"){
        if (!this.matches("[data-open]")) return;
        if (event.target.matches(".sub-list > .option")){
          var subList = event.target.closest(".sub-list"), option = this.getOptions(subList.querySelector(".list"))[0];
          this.open(subList);
          option.focus();
        }
      }
      if (event.key == "ArrowLeft"){
        if (!this.matches("[data-open]")) return;
        if (event.target.matches(".sub-list[data-open] > .option")) return this.close(event.target.closest(".sub-list"));
        if (event.target.matches(".sub-list > .list .option")){
          var subList = event.target.closest(".list").closest(".sub-list"), option = subList.querySelector(".option");
          this.close(subList);
          option.focus();
        }
      }
      if (event.key == "Escape"){
        if (!this.matches("[data-open]")) return;
        event.preventDefault();
        this.close((event.target.matches(".sub-list > .list .option")) ? event.target.closest(".list").closest(".sub-list") : undefined);
        ((event.target.matches(".sub-list > .list .option")) ? event.target.closest(".list").closest(".sub-list").querySelector(".option") : this.opener).focus();
      }
      if (event.key == "Tab"){
        if (this.matches("[data-open]")) event.preventDefault();
      }
      if (event.key == "Enter"){
        if (!this.matches("[data-open]")) return;
        if (event.target.matches(":not(a).option")){
          event.preventDefault();
          event.target.click();
        }
        if (event.target.matches(".sub-list > .option")) this.getOptions(event.target.closest(".sub-list").querySelector(".list"))[0].focus();
      }
    });
    this.shadowRoot.addEventListener("keyup",event => {
      if (event.key == " "){
        if (!this.matches("[data-open]")) return;
        if (event.target.matches(".option")){
          event.preventDefault();
          event.target.click();
        }
        if (event.target.matches(".sub-list > .option")) this.getOptions(event.target.closest(".sub-list").querySelector(".list"))[0].focus();
      }
    });
    this.shadowRoot.addEventListener("pointerdown",event => {
      this.shadowRoot.pointerType = event.pointerType;
      if (event.pointerType != "mouse") return;
      if ((event.button != 0 && !event.target.matches("a")) || event.target.matches(".opener, .list")) event.preventDefault();
      if (event.target.matches(".opener")){
        event.preventDefault();
        if (event.target != this.shadowRoot.activeElement) event.target.focus();
        if (event.button == 0) this.toggle();
      }
      if (event.target.matches(".list")){
        event.target.querySelectorAll(":scope > li > .sub-list[data-open]").forEach(subList => this.close(subList));
        event.target.focus();
      }
    });
    this.shadowRoot.addEventListener("pointermove",event => {
      if (event.pointerType != "mouse") return;
      if (event.target == this.shadowRoot.activeElement) return;
      if (event.target.matches(".option")) event.target.focus();
      if (event.target.matches(".sub-list > .option")) this.open(event.target.closest(".sub-list"));
      if (event.target.matches(":not(.sub-list) > .option")) event.target.closest(".list").querySelectorAll(":scope > li > .sub-list[data-open]").forEach(subList => this.close(subList));
    });
    this.shadowRoot.addEventListener("pointerup",event => {
      if (event.pointerType == "mouse") return;
      if (event.target.matches(".list")){
        event.target.querySelectorAll(":scope > li > .sub-list[data-open]").forEach(subList => this.close(subList));
        event.target.focus();
      }
    });
    this.shadowRoot.addEventListener("click",event => {
      if (!("pointerType" in event)) event.pointerType = this.shadowRoot.pointerType;
      delete this.shadowRoot.pointerType;
      if (event.target.matches(".opener")){
        if (event.pointerType == "mouse") return;
        if (event.target != this.shadowRoot.activeElement) event.target.focus();
        this.toggle();
      }
      if (event.target.matches(".sub-list > .option")) return this[(!event.pointerType == "mouse") ? "open" : "toggle"](event.target.closest(".sub-list"));
      if (event.target.matches(".option")){
        if (this.matches("[data-select]") && !event.target.matches("[data-no-select]") && !event.target.matches("[data-disabled]")) this.select(event.target);
        this.close();
        this.opener.focus();
      }
    });
    this.shadowRoot.addEventListener("contextmenu",event => {
      if (!event.target.matches("a")) event.preventDefault();
    });
    this.shadowRoot.addEventListener("focusout",event => {
      window.requestAnimationFrame(() => {
        if (document.activeElement == this) return;
        if (this.matches("[data-open]")) this.close();
      });
    });
    window.requestAnimationFrame(() => {
      this.container = document.createElement("div");
      this.container.part = "container";
      this.container.classList.add("container");
      this.container.setAttribute("ontouchstart","");
      this.styles = document.createElement("link");
      this.styles.rel = "stylesheet";
      this.styles.href = "https://offroaders123.github.io/Menu-Drop-Component/styles.css";
      this.opener = this.querySelector("button") || document.createElement("button");
      this.opener.part = "opener";
      this.opener.classList.add("opener");
      this.body = document.createElement("div");
      this.body.part = "body";
      this.body.classList.add("body");
      this.main = this.querySelector("ul") || document.createElement("ul");
      this.main.part = "list";
      this.main.classList.add("list");
      this.main.classList.add("main");
      this.main.tabIndex = -1;
      this.main.querySelectorAll("ul").forEach(list => {
        var subList = document.createElement("div"), option = list.closest("li"), opener = document.createElement("span");
        subList.part = "sub-list";
        subList.classList.add("sub-list");
        opener.textContent = option.childNodes[0].textContent;
        option.childNodes[0].textContent = "";
        list.part = "list";
        list.classList.add("list");
        list.tabIndex = -1;
        list.parentElement.insertBefore(subList,list);
        subList.appendChild(opener);
        subList.appendChild(list);
      });
      this.main.querySelectorAll("li, a, .sub-list > span").forEach(option => {
        if (option.querySelector(":scope > hr")) option.classList.add("pass-through");
        if (option.querySelector(":scope > :is(a,hr,.sub-list)")) return;
        option.part = "option";
        option.classList.add("option");
        option.tabIndex = -1;
        if (option.matches("[data-icon]")) option.style.setProperty("--option-icon-image",`url("${new URL(option.getAttribute("data-icon"),document.baseURI).href}")`);
        if (option.matches("[data-shortcuts]")){
          var shortcuts = JSON.parse(option.getAttribute("data-shortcuts"));
          if ("macOS" in shortcuts) shortcuts.macOS = shortcuts.macOS.replace(/Ctrl/g,"⌃").replace(/Option/g,"⌥").replace(/Shift/g,"⇧").replace(/Cmd/g,"⌘").replace(/\+/g,"");
          var shortcut = document.createElement("span");
          shortcut.part = "shortcut";
          shortcut.classList.add("shortcut");
          shortcut.textContent = shortcuts[(/(Mac|iPhone|iPad|iPod)/i.test(navigator.platform) && "macOS" in shortcuts) ? "macOS" : "default"];
          option.appendChild(shortcut);
        }
        if (option.matches("[onclick]")) option.setAttribute("onclick",`window.setTimeout(${option.onclick});`);
      });
      this.main.querySelectorAll("hr").forEach(divider => {
        divider.part = "divider";
        divider.classList.add("divider");
      });
      this.shadowRoot.appendChild(this.container);
      this.container.appendChild(this.styles);
      this.container.appendChild(this.opener);
      this.container.appendChild(this.body);
      this.body.appendChild(this.main);
      this.innerHTML = "";
      if (this.matches("[data-select]")){
        new ResizeObserver(() => this.opener.style.minWidth = `${this.main.offsetWidth}px`).observe(this.main);
        if (!this.matches("[data-select='no-rename']") && this.main.querySelector(".option[data-selected]")) this.opener.textContent = this.main.querySelector(".option[data-selected]").childNodes[0].textContent;
      }
    });
  }
  open(section = this){
    if (section == this){
      var bounds = this.opener.getBoundingClientRect();
      this.body.style.left = `calc(${bounds.left - parseInt(window.getComputedStyle(this).getPropertyValue("--safe-area-inset-left")) + ((CSS.supports("-webkit-touch-callout: none")) ? window.visualViewport.offsetLeft : 0)}px + var(--safe-area-inset-left))`;
      this.body.style.top = `calc(${bounds.bottom - parseInt(window.getComputedStyle(this).getPropertyValue("--safe-area-inset-top")) + ((CSS.supports("-webkit-touch-callout: none")) ? window.visualViewport.offsetTop : 0)}px + var(--safe-area-inset-top))`;
      this.body.style.width = `${bounds.width}px`;
    }
    ((section == this) ? this.main : section.closest(".list")).querySelectorAll(".sub-list[data-open]").forEach(subList => this.close(subList,false));
    ((section == this) ? this.main : section.querySelector(".list")).classList.add((this.getVisibility(section)) ? "left" : "right");
    section.setAttribute("data-open","");
  }
  close(section = this,recursive = true){
    var list = (section == this) ? this.main : section.querySelector(".list");
    if (recursive) list.querySelectorAll(".sub-list[data-open]").forEach(subList => this.close(subList,false));
    if (!section.matches("[data-open]")) return;
    section.removeAttribute("data-open");
    if (section == this) this.body.removeAttribute("style");
    if (list.matches(".left")) list.classList.remove("left");
    if (list.matches(".right")) list.classList.remove("right");
  }
  toggle(section = this){
    (!section.matches("[data-open]")) ? this.open(section) : this.close(section);
  }
  select(option){
    if (!this.matches("[data-select]")) return;
    if (!option && option != 0) return;
    if (typeof option == "number") option = this.getOptions()[option];
    if (typeof option == "string") option = this.main.querySelector(`[data-value="${option}"]`);
    if (!this.main.contains(option)) return;
    this.getOptions(option.closest(".list")).filter(option => option.matches("[data-selected]")).forEach(option => option.removeAttribute("data-selected"));
    option.setAttribute("data-selected","");
    if (!this.matches("[data-select='no-rename']")) this.opener.textContent = option.childNodes[0].textContent;
    return option;
  }
  getOptions(container = this.main){
    var elements = container.querySelectorAll(":scope > .option, :scope > li > .option, :scope > li > .sub-list > .option");
    return Array.from(elements).filter(element => ((window.getComputedStyle(element).getPropertyValue("display") != "none") && !element.matches("[data-disabled]")));
  }
  getVisibility(element = this.main){
    var bounds = element.getBoundingClientRect();
    return (bounds.left >= 0 && bounds.right <= window.innerWidth - bounds.width);
  }
}
window.customElements.define("menu-drop",MenuDropElement);