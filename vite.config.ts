import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"
import vueJsx from "@vitejs/plugin-vue-jsx"

export default defineConfig({
  base: "/example/",
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  server: {
    port: 5180,
    host: true
  }
})
