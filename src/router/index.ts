import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router"
import DefaultLayout from "@/layouts/default-layout.vue"
import { App } from "vue";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: DefaultLayout,
    meta: {
      title: '首页'
    },
    children: [
      { path: "", name: "home", component: () => import("@/views/home-page.vue") },
    ]
  },
  {
    path: "/list",
    component: DefaultLayout,
    meta: {
      title: '列表页'
    },
    children: [
      {
        path: "/list/base-table",
        name: "ListBaseTable",
        component: () => import("@/views/list/base-table/index.vue"),
        meta: {
          title: '基础表格页'
        }
      }
    ]
  },
  {
    path: "/form",
    component: DefaultLayout,
    meta: {
      title: '表单页'
    },
    children: [
      {
        path: "/form/base-form",
        name: "FormBaseform",
        component: () => import("@/views/home-page.vue"),
         meta: {
          title: '基础表单页'
        }
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 注册路由
export function setupRouter(app: App) {
  app.use(router)
  // 路由守卫
  // createRouterGuide(router)
}


export default router;
