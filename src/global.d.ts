declare global {
  interface Element {
    matches<K extends keyof HTMLElementTagNameMap>(selectors: K): this is HTMLElementTagNameMap[K];
    matches<K extends keyof SVGElementTagNameMap>(selectors: K): this is SVGElementTagNameMap[K];
    matches(selectors: string): boolean;
    matches<E extends Element = Element>(selectors: string): this is E;
  }
}

export {};