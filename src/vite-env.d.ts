/// <reference types="vite/client" />

// CSS module imports (handled by Vite at build time)
declare module '*.css' {
  const css: string;
  export default css;
}
