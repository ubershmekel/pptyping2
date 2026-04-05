/// <reference types="vite/client" />

// CSS module imports (handled by Vite at build time)
declare module '*.css' {
  const css: string;
  export default css;
}

// Raw SVG imports via ?raw query
declare module '*.svg?raw' {
  const content: string;
  export default content;
}
