// polyfill.js
// This fixes a crash in @typescript/vfs running on Node.js 22+
if (typeof global.localStorage === 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}
