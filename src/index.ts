type Opener = HTMLButtonElement;
type List = HTMLUListElement;
type Option = HTMLLIElement | HTMLAnchorElement;
type SubList = HTMLDivElement;

type Section = MenuDropElement | SubList;

class MenuDropElement extends HTMLElement {
  static #importMetaURL = (document.currentScript! as HTMLScriptElement).src;

  declare defined;
  declare shadowRoot: ShadowRoot & { alternateTimeout?: number; pointerType?: string; };

  declare container: HTMLDivElement;
  declare styles: HTMLLinkElement;
  declare opener: Opener;
  declare body: HTMLDivElement;
  declare main: List;

  constructor(){
    super();
    this.defined = false;
  }

  connectedCallback(){
    if (this.defined || !this.isConnected) return;
    this.defined = true;
    this.attachShadow({ mode: "open" });

    this.shadowRoot.addEventListener("keydown",event => {
      if (!(event.target instanceof HTMLElement)) return;

      if (event.key == "ArrowDown"){
        event.preventDefault();
        if (!this.matches("[data-open]")) return;

        if (event.target.matches(".opener, .list, .option")){
          var options = this.getOptions(
            (event.target.matches<Option>(".option"))
              ? event.target.closest<List>(".list")!
              : (event.target.matches<List>(".list"))
              ? event.target
              : undefined
            );
          var index = options.indexOf(event.target as Option) + 1;
          var option = options[(index <= options.length - 1) ? index : 0];
          option.focus();
        }

        if (event.target.matches(".sub-list[data-open] > .option")){
          this.close(event.target.closest<SubList>(".sub-list")!);
        }
      }

      if (event.key == "ArrowUp"){
        event.preventDefault();
        if (!this.matches("[data-open]")) return;

        if (event.target.matches(".opener, .list, .option")){
          var options = this.getOptions(
            (event.target.matches<Option>(".option"))
              ? event.target.closest<List>(".list")!
              : (event.target.matches<List>(".list"))
              ? event.target
              : undefined
            );
          var index = options.indexOf(event.target as Option) - 1;
          var option = options[(index >= 0) ? index : options.length - 1];
          option.focus();
        }

        if (event.target.matches(".sub-list[data-open] > .option")){
          this.close(event.target.closest<SubList>(".sub-list")!);
        }
      }

      if (event.key == "ArrowRight" || event.key == "ArrowLeft"){
        event.preventDefault();
        if (!this.matches("[data-open]")) return;

        if (event.target.matches<List>(".list")){
          var options = this.getOptions(event.target);
          options[0].focus();
        }
      }

      if (event.key == "ArrowRight"){
        if (!this.matches("[data-open]")) return;

        if (event.target.matches(".sub-list > .option")){
          var subList = event.target.closest<SubList>(".sub-list")!;
          var option = this.getOptions(subList.querySelector<List>(".list")!)[0];
          this.open(subList);
          option.focus();
        }
      }

      if (event.key == "ArrowLeft"){
        if (!this.matches("[data-open]")) return;

        if (event.target.matches(".sub-list[data-open] > .option")){
          this.close(event.target.closest<SubList>(".sub-list")!);
          return;
        }

        if (event.target.matches(".sub-list > .list .option")){
          var subList = event.target.closest<List>(".list")!.closest<SubList>(".sub-list")!;
          var option = subList.querySelector<Option>(".option")!;
          this.close(subList);
          option.focus();
        }
      }

      if (event.key == "Escape"){
        if (!this.matches("[data-open]")) return;
        event.preventDefault();

        this.close(
          (event.target.matches(".sub-list > .list .option"))
            ? event.target.closest<List>(".list")!.closest<SubList>(".sub-list")!
            : undefined
          );

        ((event.target.matches(".sub-list > .list .option"))
          ? event.target.closest<List>(".list")!.closest<SubList>(".sub-list")!.querySelector<Option>(".option")!
          : this.opener
        ).focus();
      }

      if (event.key == "Tab"){
        if (this.matches("[data-open]")){
          event.preventDefault();
        }
      }

      if (event.key == "Enter"){
        if (!this.matches("[data-open]")) return;

        if (event.target.matches(":not(a).option")){
          event.preventDefault();
          event.target.click();
        }

        if (event.target.matches(".sub-list > .option")){
          this.getOptions(event.target.closest<SubList>(".sub-list")!.querySelector<List>(".list")!)[0].focus();
        }
      }
    });

    this.shadowRoot.addEventListener("keyup",event => {
      if (!(event.target instanceof HTMLElement)) return;

      if (event.key == " "){
        if (!this.matches("[data-open]")) return;

        if (event.target.matches(".option")){
          event.preventDefault();
          event.target.click();
        }

        if (event.target.matches(".sub-list > .option")){
          this.getOptions(event.target.closest<SubList>(".sub-list")!.querySelector<List>(".list")!)[0].focus();
        }
      }
    });

    this.shadowRoot.addEventListener("pointerdown",event => {
      if (!(event.target instanceof HTMLElement)) return;

      this.shadowRoot!.pointerType = event.pointerType;

      if (event.pointerType != "mouse"){
        if (event.target.matches<Opener>(".opener") && this.matches("[data-alternate]")){
          this.shadowRoot!.alternateTimeout = window.setTimeout(() => {
            if (event.target != this.shadowRoot!.activeElement) (event.target as Opener).focus();
            this.toggle();
          },500);
        }
      }

      if (event.pointerType == "mouse"){
        if ((event.button != 0 && !event.target.matches("a")) || event.target.matches(".opener, .list")){
          event.preventDefault();
        }

        if (event.target.matches(".opener") && !this.matches("[data-alternate]")){
          if (event.target != this.shadowRoot!.activeElement){
            event.target.focus();
          }

          if (event.button == 0){
            this.toggle();
          }
        }

        if (event.target.matches(".list")){
          event.target.querySelectorAll<SubList>(":scope > li > .sub-list[data-open]").forEach(subList => this.close(subList));
          event.target.focus();
        }
      }
    });

    this.shadowRoot.addEventListener("pointermove",event => {
      if (!(event.target instanceof HTMLElement)) return;

      if (event.pointerType != "mouse"){
        if (event.target.matches(".opener") && this.matches("[data-alternate]")){
          if (!("alternateTimeout" in this.shadowRoot)) return;
          window.clearTimeout(this.shadowRoot!.alternateTimeout);
          delete this.shadowRoot!.alternateTimeout;
        }
      }

      if (event.pointerType == "mouse"){
        if (event.target == this.shadowRoot!.activeElement) return;
        if (event.target.matches(".option")){
          event.target.focus();
        }

        if (event.target.matches(".sub-list > .option")){
          this.open(event.target.closest<SubList>(".sub-list")!);
        }

        if (event.target.matches(":not(.sub-list) > .option")){
          event.target.closest<List>(".list")!.querySelectorAll<SubList>(":scope > li > .sub-list[data-open]").forEach(subList => this.close(subList));
        }
      }
    });

    this.shadowRoot.addEventListener("pointerout",event => {
      if (!(event.target instanceof HTMLElement)) return;
      if (event.pointerType == "mouse") return;

      if (event.target.matches(".opener") && this.matches("[data-alternate]")){
        if (!("alternateTimeout" in this.shadowRoot)) return;

        window.clearTimeout(this.shadowRoot!.alternateTimeout);
        delete this.shadowRoot!.alternateTimeout;
      }
    });

    this.shadowRoot.addEventListener("pointerup",event => {
      if (!(event.target instanceof HTMLElement)) return;
      if (event.pointerType == "mouse") return;

      if (event.target.matches(".list")){
        event.target.querySelectorAll<SubList>(":scope > li > .sub-list[data-open]").forEach(subList => this.close(subList));
        event.target.focus();
      }
    });

    this.shadowRoot.addEventListener("click",eventOld => {
      let event = eventOld as MouseEvent & { pointerType?: typeof PointerEvent.prototype.pointerType; };
      if (!(event.target instanceof HTMLElement)) return;

      if (!("pointerType" in event)){
        event.pointerType = this.shadowRoot!.pointerType;
      }
      delete this.shadowRoot!.pointerType;

      if (event.target.matches(".opener") && !this.matches("[data-alternate]")){
        if (event.pointerType == "mouse") return;

        if (event.target != this.shadowRoot!.activeElement){
          event.target.focus();
        }
        this.toggle();
      }

      if (event.target.matches(".sub-list > .option")){
        this[
          (event.pointerType != "mouse")
            ? "open"
            : "toggle"
          ](event.target.closest<SubList>(".sub-list")!);
        return;
      }

      if (event.target.matches<Option>(".option")){
        if (this.matches("[data-select]") && event.target.matches(":not([data-no-select])") && event.target.matches(":not([data-disabled])")){
          this.select(event.target);
        }
        this.close();
        this.opener.focus();
      }
    });

    this.shadowRoot.addEventListener("contextmenu",event => {
      if (!(event.target instanceof HTMLElement)) return;

      if (!event.target.matches("a")){
        event.preventDefault();
      }

      if (event.target.matches(".opener") && this.matches("[data-alternate]")){
        if (event.target != this.shadowRoot!.activeElement){
          event.target.focus();
        }
        this.toggle();
      }
    });

    this.shadowRoot.addEventListener("focusout",event => {
      window.requestAnimationFrame(() => {
        if (document.activeElement == this) return;
        if (this.matches("[data-open]")){
          this.close();
        }
      });
    });

    window.requestAnimationFrame(() => {
      this.container = document.createElement("div");
      this.container.part.add("container");
      this.container.classList.add("container");
      this.container.setAttribute("ontouchstart","");

      this.styles = document.createElement("link");
      this.styles.rel = "stylesheet";
      this.styles.href = `${new URL("../styles/styles.css",MenuDropElement.#importMetaURL)}`;

      this.opener = this.querySelector("button") || document.createElement("button");
      this.opener.part.add("opener");
      this.opener.classList.add("opener");

      this.body = document.createElement("div");
      this.body.part.add("body");
      this.body.classList.add("body");

      this.main = this.querySelector("ul") || document.createElement("ul");
      this.main.part.add("list");
      this.main.part.add("main");
      this.main.classList.add("list");
      this.main.classList.add("main");
      this.main.tabIndex = -1;

      this.main.querySelectorAll<List>("ul").forEach(list => {
        var subList: SubList = document.createElement("div");
        var option = list.closest<Opener>("li")!;
        var opener = document.createElement("span");

        subList.part.add("sub-list");
        subList.classList.add("sub-list");

        opener.textContent = this.getTextNodes(option)[0].textContent;

        this.getTextNodes(option)[0].textContent = "";

        list.part.add("list");
        list.classList.add("list");
        list.tabIndex = -1;
        list.parentElement!.insertBefore(subList,list);

        subList.appendChild(opener);
        subList.appendChild(list);
      });

      this.main.querySelectorAll<Option>("li, a, .sub-list > span").forEach(option => {
        if (option.querySelector(":scope > hr")){
          option.classList.add("pass-through");
        }
        if (option.querySelector(":scope > :is(a,hr,.sub-list)")) return;

        option.part.add("option");
        option.classList.add("option");
        option.tabIndex = -1;

        if (option.matches("[data-shortcuts]")){
          var shortcuts = JSON.parse(option.getAttribute("data-shortcuts")!);

          if ("macOS" in shortcuts){
            shortcuts.macOS = shortcuts.macOS
              .replace(/Ctrl/g,"⌃")
              .replace(/Option/g,"⌥")
              .replace(/Shift/g,"⇧")
              .replace(/Cmd/g,"⌘")
              .replace(/Return/g,"↵")
              .replace(/Enter/g,"⌤")
              .replace(/\+/g,"");
          }

          var shortcut = document.createElement("span");
          shortcut.part.add("shortcut");
          shortcut.classList.add("shortcut");

          shortcut.textContent = shortcuts[
            (/(macOS|Mac|iPhone|iPad|iPod)/i.test(("userAgentData" in navigator)
              ? navigator.userAgentData.platform
              // @ts-expect-error
              : navigator.platform
            ) && "macOS" in shortcuts)
              ? "macOS"
              : "default"
          ];

          option.appendChild(shortcut);
        }

        if (option.matches("[onclick]")){
          option.setAttribute("onclick",`window.setTimeout(${option.onclick});`);
        }

        if (option.querySelector(":scope > :is(img,svg)")){
          var icon = option.querySelector<HTMLImageElement | SVGSVGElement>(":scope > :is(img,svg)")!;
          icon.part.add("icon");
          icon.classList.add("icon");

          if (icon instanceof HTMLImageElement){
            icon.draggable = false;
          }
        }
      });

      this.main.querySelectorAll("hr").forEach(divider => {
        divider.part.add("divider");
        divider.classList.add("divider");
      });

      this.shadowRoot!.appendChild(this.container);
      this.container.appendChild(this.styles);
      this.container.appendChild(this.opener);
      this.container.appendChild(this.body);
      this.body.appendChild(this.main);
      this.innerHTML = "";

      if (this.matches("[data-select]") && !this.matches("[data-select='no-appearance']")){
        if (this.getAttribute("data-select") != ""){
          this.setAttribute("data-select","");
        }

        new ResizeObserver(() => {
          this.opener.style.minWidth = `${this.main.offsetWidth}px`;
        }).observe(this.main);

        if (this.main.querySelector(".option[data-selected]")){
          this.opener.textContent = this.getTextNodes(this.main.querySelector<Option>(".option[data-selected]")!)[0].textContent;
        }
      }
    });
  }

  open(section: Section = this){
    var list = (section == this)
      ? this.main
      : section.querySelector<List>(".list")!;

    if (section == this){
      var bounds = this.opener.getBoundingClientRect();

      this.body.style.left = `calc(${
        bounds.left - parseInt(window.getComputedStyle(this).getPropertyValue("--safe-area-inset-left"))
          + ((CSS.supports("-webkit-touch-callout: none"))
              ? window.visualViewport!.offsetLeft
              : 0
        )
      }px + var(--safe-area-inset-left))`;

      this.body.style.top = `calc(${
        bounds.bottom - parseInt(window.getComputedStyle(this).getPropertyValue("--safe-area-inset-top"))
          + ((CSS.supports("-webkit-touch-callout: none"))
              ? window.visualViewport!.offsetTop
              : 0
        )
      }px + var(--safe-area-inset-top))`;

      this.body.style.width = `${bounds.width}px`;
    }

    Array.from(
      (
        (section == this)
          ? this.main
          : section.closest<List>(".list")!
      ).querySelectorAll<SubList>(".sub-list[data-open]")!)
        .filter(subList => subList != list.closest(".sub-list"))
        .forEach(subList => this.close(subList,false)
    );

    list.part.add(
      (this.getVisibility(section))
        ? "left"
        : "right"
    );

    list.classList.add(
      (this.getVisibility(section))
        ? "left"
        : "right"
    );

    section.setAttribute("data-open","");
    list.part.add("open");
  }

  close(section: Section = this,recursive = true){
    var list = (section == this)
      ? this.main
      : section.querySelector<List>(".list")!;

    if (recursive){
      list.querySelectorAll<SubList>(".sub-list[data-open]").forEach(subList => this.close(subList,false));
    }
    if (!section.matches("[data-open]")) return;

    section.removeAttribute("data-open");
    list.part.remove("open");

    if (section == this){
      this.body.removeAttribute("style");
    }

    if (list.matches(".left")){
      list.part.remove("left");
      list.classList.remove("left");
    }

    if (list.matches(".right")){
      list.part.remove("right");
      list.classList.remove("right");
    }
  }

  toggle(section: Section = this){
    (!section.matches("[data-open]"))
      ? this.open(section)
      : this.close(section);
  }

  select(option: number | string | Option){
    if (!this.matches("[data-select]")) return;
    if (!option && option != 0) return;

    if (typeof option == "number"){
      option = this.getOptions()[option];
    }

    if (typeof option == "string"){
      option = this.main.querySelector<Option>(`[data-value="${option}"]`)!;
    }

    if (!this.main.contains(option)) return;

    this.getOptions(option.closest<List>(".list")!)
      .filter(option => option.matches("[data-selected]"))
      .forEach(option => option.removeAttribute("data-selected"));

    option.setAttribute("data-selected","");

    if (!this.matches("[data-select='no-appearance']")){
      this.opener.textContent = this.getTextNodes(option)[0].textContent;
    }

    return option;
  }

  getOptions(container: List = this.main): Option[] {
    var elements = container.querySelectorAll<Option>(":scope > .option, :scope > li > .option, :scope > li > .sub-list > .option")!;
    return Array.from(elements)
      .filter(element => ((window.getComputedStyle(element).getPropertyValue("display") != "none") && !element.matches("[data-disabled]")));
  }

  getVisibility(element: HTMLElement = this.main){
    var bounds = element.getBoundingClientRect();
    return (bounds.left >= 0 && bounds.right <= window.innerWidth - bounds.width);
  }

  getTextNodes(element: HTMLElement){
    return Array.from(element.childNodes)
      .filter(node => node.nodeType == Node.TEXT_NODE && node.textContent?.replace(/\s/g,"").length);
  }

  focus({ preventScroll = false }: FocusOptions = {}){
    this.opener.focus({ preventScroll });
  }

  blur(){
    (this.shadowRoot!.activeElement! as HTMLElement).blur();
  }
}

window.customElements.define("menu-drop",MenuDropElement);