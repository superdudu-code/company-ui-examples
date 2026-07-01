import { createApp } from "vue"
import "@puture-ui/ui/theme/style.css"
import "@puture-ui/ui/style.css"
import "@puture-ui/business/style.css"
import App from "./app.vue"
import { setupRouter } from "./router"

import "./styles/index.scss"

const app = createApp(App)

// 挂载路由
app.use(setupRouter)

app.mount("#app")
