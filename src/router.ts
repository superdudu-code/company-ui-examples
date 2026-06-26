import type { RouteRecordRaw } from "vue-router"
import DefaultLayout from "./layouts/DefaultLayout.vue"

export interface NavItem {
  title: string
  path: string
  pkg: "ui" | "business" | "capabilities"
}

export const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "UI",
    items: [
      { title: "Button 按钮", path: "/button", pkg: "ui" },
      { title: "BaseSelect 基础下拉", path: "/base-select", pkg: "ui" },
      { title: "DateRangePicker 日期范围", path: "/date-range-picker", pkg: "ui" }
    ]
  },
  {
    title: "Business",
    items: [
      { title: "SearchForm 搜索表单", path: "/search-form", pkg: "business" },
      { title: "CountrySelect 国家选择", path: "/country-select", pkg: "business" }
    ]
  },
  {
    title: "Capabilities",
    items: [
      { title: "Request 请求封装", path: "/request", pkg: "capabilities" }
    ]
  }
]

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      { path: "", name: "home", component: () => import("./pages/HomePage.vue") },
      { path: "button", name: "button", component: () => import("./pages/ButtonPage.vue") },
      { path: "base-select", name: "base-select", component: () => import("./pages/BaseSelectPage.vue") },
      { path: "date-range-picker", name: "date-range-picker", component: () => import("./pages/DateRangePickerPage.vue") },
      { path: "search-form", name: "search-form", component: () => import("./pages/SearchFormPage.vue") },
      { path: "country-select", name: "country-select", component: () => import("./pages/CountrySelectPage.vue") },
      { path: "request", name: "request", component: () => import("./pages/RequestPage.vue") }
    ]
  }
]
