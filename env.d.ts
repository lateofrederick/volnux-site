/// <reference types="vite/client" />

declare module '*?raw' {
  const src: string
  export default src
}

declare module '*.html?raw' {
  const src: string
  export default src
}
