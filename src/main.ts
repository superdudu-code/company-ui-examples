import { createApp } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import "@puture-ui/ui/theme/style.css"
import "@puture-ui/ui/style.css"
import "@puture-ui/business/style.css"
import App from "./App.vue"
import { routes } from "./router"
import "./styles/global.css"

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

createApp(App).use(router).mount("#app")
