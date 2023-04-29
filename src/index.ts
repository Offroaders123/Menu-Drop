type MenuDropOpener = HTMLButtonElement;
type MenuDropList = HTMLUListElement;
type MenuDropOption = HTMLLIElement | HTMLAnchorElement;
type MenuDropSubList = HTMLDivElement;

type MenuDropSection = MenuDropElement | MenuDropSubList;

class MenuDropElement extends HTMLElement {
  static #importMetaURL = (document.currentScript! as HTMLScriptElement).src;

  declare readonly shadowRoot: ShadowRoot & {
    alternateTimeout?: number;
    pointerType?: string;
  };

  #isDefined;
  /**
   * The internal wrapper for all of the element's Shadow DOM content.
  */
  declare readonly container: HTMLDivElement;
  /**
   * The internal stylesheet for the element's default styles.
  */
  declare readonly styles: HTMLLinkElement;
  /**
   * The top-level opener button for accessing the menu.
  */
  declare readonly opener: MenuDropOpener;
  /**
   * The internal wrapper for the element's menu lists.
  */
  declare readonly body: HTMLDivElement;
  /**
   * The top-level list within the menu.
  */
  declare readonly main: MenuDropList;

  constructor(){
    super();
    this.attachShadow({ mode: "open" });
    this.#isDefined = false;
  }

  connectedCallback(){
    if (this.#isDefined || !this.isConnected) return;
    this.#isDefined = true;

    this.shadowRoot.addEventListener("keydown",event => {
      if (!(event.target instanceof HTMLElement)) return;

      if (event.key == "ArrowDown"){
        event.preventDefault();
        if (!this.matches("[data-open]")) return;

        if (event.target.matches(".opener, .list, .option")){
          const options = this.getOptions(
            (event.target.matches<MenuDropOption>(".option"))
              ? event.target.closest<MenuDropList>(".list")!
              : (event.target.matches<MenuDropList>(".list"))
              ? event.target
              : undefined
            );
          const index = options.indexOf(event.target as MenuDropOption) + 1;
          const option = options[(index <= options.length - 1) ? index : 0];
          option.focus();
        }

        if (event.target.matches(".sub-list[data-open] > .option")){
          this.close(event.target.closest<MenuDropSubList>(".sub-list")!);
        }
      }

      if (event.key == "ArrowUp"){
        event.preventDefault();
        if (!this.matches("[data-open]")) return;

        if (event.target.matches(".opener, .list, .option")){
          const options = this.getOptions(
            (event.target.matches<MenuDropOption>(".option"))
              ? event.target.closest<MenuDropList>(".list")!
              : (event.target.matches<MenuDropList>(".list"))
              ? event.target
              : undefined
            );
          const index = options.indexOf(event.target as MenuDropOption) - 1;
          const option = options[(index >= 0) ? index : options.length - 1];
          option.focus();
        }

        if (event.target.matches(".sub-list[data-open] > .option")){
          this.close(event.target.closest<MenuDropSubList>(".sub-list")!);
        }
      }

      if (event.key == "ArrowRight" || event.key == "ArrowLeft"){
        event.preventDefault();
        if (!this.matches("[data-open]")) return;

        if (event.target.matches<MenuDropList>(".list")){
          const options = this.getOptions(event.target);
          options[0].focus();
        }
      }

      if (event.key == "ArrowRight"){
        if (!this.matches("[data-open]")) return;

        if (event.target.matches(".sub-list > .option")){
          const subList = event.target.closest<MenuDropSubList>(".sub-list")!;
          const option = this.getOptions(subList.querySelector<MenuDropList>(".list")!)[0];
          this.open(subList);
          option.focus();
        }
      }

      if (event.key == "ArrowLeft"){
        if (!this.matches("[data-open]")) return;

        if (event.target.matches(".sub-list[data-open] > .option")){
          this.close(event.target.closest<MenuDropSubList>(".sub-list")!);
          return;
        }

        if (event.target.matches(".sub-list > .list .option")){
          const subList = event.target.closest<MenuDropList>(".list")!.closest<MenuDropSubList>(".sub-list")!;
          const option = subList.querySelector<MenuDropOption>(".option")!;
          this.close(subList);
          option.focus();
        }
      }

      if (event.key == "Escape"){
        if (!this.matches("[data-open]")) return;
        event.preventDefault();

        this.close(
          (event.target.matches(".sub-list > .list .option"))
            ? event.target.closest<MenuDropList>(".list")!.closest<MenuDropSubList>(".sub-list")!
            : undefined
          );

        ((event.target.matches(".sub-list > .list .option"))
          ? event.target.closest<MenuDropList>(".list")!.closest<MenuDropSubList>(".sub-list")!.querySelector<MenuDropOption>(".option")!
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
          this.getOptions(event.target.closest<MenuDropSubList>(".sub-list")!.querySelector<MenuDropList>(".list")!)[0].focus();
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
          this.getOptions(event.target.closest<MenuDropSubList>(".sub-list")!.querySelector<MenuDropList>(".list")!)[0].focus();
        }
      }
    });

    this.shadowRoot.addEventListener("pointerdown",event => {
      if (!(event.target instanceof HTMLElement)) return;

      this.shadowRoot.pointerType = event.pointerType;

      if (event.pointerType != "mouse"){
        if (event.target.matches<MenuDropOpener>(".opener") && this.matches("[data-alternate]")){
          this.shadowRoot.alternateTimeout = window.setTimeout(() => {
            if (event.target != this.shadowRoot.activeElement) (event.target as MenuDropOpener).focus();
            this.toggle();
          },500);
        }
      }

      if (event.pointerType == "mouse"){
        if ((event.button != 0 && !event.target.matches("a")) || event.target.matches(".opener, .list")){
          event.preventDefault();
        }

        if (event.target.matches(".opener") && !this.matches("[data-alternate]")){
          if (event.target != this.shadowRoot.activeElement){
            event.target.focus();
          }

          if (event.button == 0){
            this.toggle();
          }
        }

        if (event.target.matches(".list")){
          event.target.querySelectorAll<MenuDropSubList>(":scope > li > .sub-list[data-open]").forEach(subList => this.close(subList));
          event.target.focus();
        }
      }
    });

    this.shadowRoot.addEventListener("pointermove",event => {
      if (!(event.target instanceof HTMLElement)) return;

      if (event.pointerType != "mouse"){
        if (event.target.matches(".opener") && this.matches("[data-alternate]")){
          if (!("alternateTimeout" in this.shadowRoot)) return;
          window.clearTimeout(this.shadowRoot.alternateTimeout);
          delete this.shadowRoot.alternateTimeout;
        }
      }

      if (event.pointerType == "mouse"){
        if (event.target == this.shadowRoot.activeElement) return;
        if (event.target.matches(".option")){
          event.target.focus();
        }

        if (event.target.matches(".sub-list > .option")){
          this.open(event.target.closest<MenuDropSubList>(".sub-list")!);
        }

        if (event.target.matches(":not(.sub-list) > .option")){
          event.target.closest<MenuDropList>(".list")!.querySelectorAll<MenuDropSubList>(":scope > li > .sub-list[data-open]").forEach(subList => this.close(subList));
        }
      }
    });

    this.shadowRoot.addEventListener("pointerout",event => {
      if (!(event.target instanceof HTMLElement)) return;
      if (event.pointerType == "mouse") return;

      if (event.target.matches(".opener") && this.matches("[data-alternate]")){
        if (!("alternateTimeout" in this.shadowRoot)) return;

        window.clearTimeout(this.shadowRoot.alternateTimeout);
        delete this.shadowRoot.alternateTimeout;
      }
    });

    this.shadowRoot.addEventListener("pointerup",event => {
      if (!(event.target instanceof HTMLElement)) return;
      if (event.pointerType == "mouse") return;

      if (event.target.matches(".list")){
        event.target.querySelectorAll<MenuDropSubList>(":scope > li > .sub-list[data-open]").forEach(subList => this.close(subList));
        event.target.focus();
      }
    });

    this.shadowRoot.addEventListener("click",eventOld => {
      let event = eventOld as MouseEvent & { pointerType?: typeof PointerEvent.prototype.pointerType; };
      if (!(event.target instanceof HTMLElement)) return;

      if (!("pointerType" in event)){
        event.pointerType = this.shadowRoot.pointerType;
      }
      delete this.shadowRoot.pointerType;

      if (event.target.matches(".opener") && !this.matches("[data-alternate]")){
        if (event.pointerType == "mouse") return;

        if (event.target != this.shadowRoot.activeElement){
          event.target.focus();
        }
        this.toggle();
      }

      if (event.target.matches(".sub-list > .option")){
        this[
          (event.pointerType != "mouse")
            ? "open"
            : "toggle"
          ](event.target.closest<MenuDropSubList>(".sub-list")!);
        return;
      }

      if (event.target.matches<MenuDropOption>(".option")){
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
        if (event.target != this.shadowRoot.activeElement){
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
      // @ts-expect-error
      this.container = document.createElement("div");
      this.container.part.add("container");
      this.container.classList.add("container");
      this.container.setAttribute("ontouchstart","");

      // @ts-expect-error
      this.styles = document.createElement("link");
      this.styles.rel = "stylesheet";
      this.styles.href = `${new URL("../styles/styles.css",MenuDropElement.#importMetaURL)}`;

      // @ts-expect-error
      this.opener = this.querySelector("button") || document.createElement("button");
      this.opener.part.add("opener");
      this.opener.classList.add("opener");

      // @ts-expect-error
      this.body = document.createElement("div");
      this.body.part.add("body");
      this.body.classList.add("body");

      // @ts-expect-error
      this.main = this.querySelector("ul") || document.createElement("ul");
      this.main.part.add("list");
      this.main.part.add("main");
      this.main.classList.add("list");
      this.main.classList.add("main");
      this.main.tabIndex = -1;

      this.main.querySelectorAll<MenuDropList>("ul").forEach(list => {
        const subList: MenuDropSubList = document.createElement("div");
        const option = list.closest<MenuDropOpener>("li")!;
        const opener = document.createElement("span");

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

      this.main.querySelectorAll<MenuDropOption>("li, a, .sub-list > span").forEach(option => {
        if (option.querySelector(":scope > hr")){
          option.classList.add("pass-through");
        }
        if (option.querySelector(":scope > :is(a,hr,.sub-list)")) return;

        option.part.add("option");
        option.classList.add("option");
        option.tabIndex = -1;

        if (option.matches("[data-shortcuts]")){
          const shortcuts = JSON.parse(option.getAttribute("data-shortcuts")!);

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

          const shortcut = document.createElement("span");
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
          const icon = option.querySelector<HTMLImageElement | SVGSVGElement>(":scope > :is(img,svg)")!;
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

      this.shadowRoot.appendChild(this.container);
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
          this.opener.textContent = this.getTextNodes(this.main.querySelector<MenuDropOption>(".option[data-selected]")!)[0].textContent;
        }
      }
    });
  }

  /**
   * Opens the top-level list within the menu.
   * 
   * @param section This is used internally to open specific lists within the menu.
  */
  open(section: MenuDropSection = this){
    const list = (section == this)
      ? this.main
      : section.querySelector<MenuDropList>(".list")!;

    if (section == this){
      const bounds = this.opener.getBoundingClientRect();

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
          : section.closest<MenuDropList>(".list")!
      )
        .querySelectorAll<MenuDropSubList>(".sub-list[data-open]")!
    )
      .filter(subList => subList != list.closest(".sub-list"))
      .forEach(subList => this.close(subList,false));

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

  /**
   * Closes the top-level list within the menu.
   * 
   * @param section This is used internally to close specific lists within the menu.
  */
  close(section: MenuDropSection = this, recursive: boolean = true){
    const list = (section == this)
      ? this.main
      : section.querySelector<MenuDropList>(".list")!;

    if (recursive){
      list.querySelectorAll<MenuDropSubList>(".sub-list[data-open]").forEach(subList => this.close(subList,false));
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

  /**
   * Toggles the top-level list within the menu.
   * 
   * @param section This is used internally to toggle specific lists within the menu.
  */
  toggle(section: MenuDropSection = this){
    (!section.matches("[data-open]"))
      ? this.open(section)
      : this.close(section);
  }

  /**
   * Selects a given option from the top-level menu, when 'select' mode is enabled.
   * 
   * I never fully finished this functionality, so there's not much of a great API to work with this unfortunately.
   * Same with the 'shortcuts' feature. It works great for what this legacy version needed to do, but it really could
   * use a fresh start in the next update.
   * 
   * For these two features, if you really need to use them (I'm probably talking to myself here, lol), the most
   * I can say is to look into the source for this legacy build, and how STE used it also. It's not even using it much
   * there, so that's probably why I didn't smoothen it out yet. I think the technical debt for this component got
   * pretty high for me with the last few updates too, so that didn't help with being able to add new things safely.
   * Hence, why this whole rework is happening.
   * 
   * This text should probably be in the commit message for these docs, too.
   * 
   * ```html
   * <!--
   *   In the top-level opener button, the text content
   *   will reflect the currently selected value, and a
   *   dropdown arrow will be rendered next to it.
   * -->
   * <menu-drop data-select></menu-drop>
   * 
   * <!--
   *   Enables 'select' mode, while rendering the
   *   top-level opener button without any custom
   *   functionality.
   * -->
   * <menu-drop data-select="no-appearance"></menu-drop>
   * ```
  */
  select(option: number | string | MenuDropOption){
    if (!this.matches("[data-select]")) return;
    if (!option && option != 0) return;

    if (typeof option == "number"){
      option = this.getOptions()[option];
    }

    if (typeof option == "string"){
      option = this.main.querySelector<MenuDropOption>(`[data-value="${option}"]`)!;
    }

    if (!this.main.contains(option)) return;

    this.getOptions(option.closest<MenuDropList>(".list")!)
      .filter(option => option.matches("[data-selected]"))
      .forEach(option => option.removeAttribute("data-selected"));

    option.setAttribute("data-selected","");

    if (!this.matches("[data-select='no-appearance']")){
      this.opener.textContent = this.getTextNodes(option)[0].textContent;
    }

    return option;
  }

  /**
   * Returns the child options for a given list within the menu.
  */
  getOptions(container: MenuDropList = this.main): MenuDropOption[] {
    const elements = container.querySelectorAll<MenuDropOption>(":scope > .option, :scope > li > .option, :scope > li > .sub-list > .option")!;
    return Array.from(elements)
      .filter(element => ((window.getComputedStyle(element).getPropertyValue("display") != "none") && !element.matches("[data-disabled]")));
  }

  /**
   * Calculates if a given element within the menu is not obstructed by the viewport.
   * 
   * This is used internally for the list auto-wrapping behavior.
  */
  getVisibility(element: HTMLElement = this.main){
    const bounds = element.getBoundingClientRect();
    return (bounds.left >= 0 && bounds.right <= window.innerWidth - bounds.width);
  }

  /**
   * Returns the text nodes for a given element within the menu, only if they contain more than whitespace.
  */
  getTextNodes(element: HTMLElement){
    return Array.from(element.childNodes)
      .filter(node => node.nodeType == Node.TEXT_NODE && node.textContent?.replace(/\s/g,"").length);
  }

  override focus(options: FocusOptions = {}){
    this.opener.focus(options);
  }

  override blur(){
    (this.shadowRoot.activeElement as HTMLElement | null)?.blur?.();
  }

  get defined() {
    return this.#isDefined;
  }
}

interface HTMLElementTagNameMap {
  "menu-drop": MenuDropElement;
}

window.customElements.define("menu-drop",MenuDropElement);