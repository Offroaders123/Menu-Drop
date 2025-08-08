declare global {
  interface Element {
    matches<K extends keyof HTMLElementTagNameMap>(selectors: K): this is HTMLElementTagNameMap[K];
    matches<K extends keyof SVGElementTagNameMap>(selectors: K): this is SVGElementTagNameMap[K];
    matches(selectors: string): boolean;
    matches<E extends Element = Element>(selectors: string): this is E;
  }

  interface MouseEvent {
    /**
     * @deprecated Not so fast there bucko! This appears to be supported in Safari now*, hence why it's usage is broken on touch devices. Well, it's broken, this is uglier.
    */
    pointerType?: PointerEvent["pointerType"];
  }
}

export {};