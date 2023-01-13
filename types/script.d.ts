type Opener = HTMLButtonElement;
type List = HTMLUListElement;
type Option = HTMLLIElement | HTMLAnchorElement;
type SubList = HTMLDivElement;
type Section = MenuDropElement | SubList;
declare class MenuDropElement extends HTMLElement {
    defined: boolean;
    shadowRoot: ShadowRoot & {
        alternateTimeout?: number;
        pointerType?: string;
    };
    container: HTMLDivElement;
    styles: HTMLLinkElement;
    opener: Opener;
    body: HTMLDivElement;
    main: List;
    constructor();
    connectedCallback(): void;
    open(section?: Section): void;
    close(section?: Section, recursive?: boolean): void;
    toggle(section?: Section): void;
    select(option: number | string | Option): Option | undefined;
    getOptions(container?: List): Option[];
    getVisibility(element?: HTMLElement): boolean;
    getTextNodes(element: HTMLElement): ChildNode[];
    focus({ preventScroll }?: FocusOptions): void;
    blur(): void;
}
