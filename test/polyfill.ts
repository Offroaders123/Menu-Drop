window.esmsInitOptions = {
  polyfillEnable: ["css-modules"]
};

await import("construct-style-sheets-polyfill");
// @ts-expect-error - module types
await import("es-module-shims");