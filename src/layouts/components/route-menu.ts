import type { RouteRecordRaw } from "vue-router"

export interface LayoutMenuItem {
  title: string
  path: string
}

/** 获取路由在菜单中展示的标题。 */
export function getRouteTitle(route: RouteRecordRaw, fallback?: string): string {
  const title = route.meta?.title

  if (typeof title === "string" && title) {
    return title
  }

  return fallback ?? String(route.name ?? route.path)
}

/** 根据父子路由路径生成可跳转的菜单地址。 */
export function resolveRoutePath(route: RouteRecordRaw, parentPath = ""): string {
  if (!route.path) {
    return parentPath || "/"
  }

  if (route.path.startsWith("/")) {
    return route.path
  }

  const basePath = parentPath === "/" ? "" : parentPath.replace(/\/$/, "")

  return `${basePath}/${route.path}`
}

/** 获取一级菜单点击后的默认跳转地址。 */
export function getRouteMenuTarget(route: RouteRecordRaw): string {
  const firstChild = route.children?.[0]

  return firstChild ? resolveRoutePath(firstChild, route.path) : resolveRoutePath(route)
}
