<script setup lang="ts">
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { getRouteMenuTarget, getRouteTitle, resolveRoutePath, type LayoutMenuItem } from "./route-menu"

const route = useRoute()
const router = useRouter()

const currentTopRoute = computed(() => {
  const currentTopPath = route.matched[0]?.path ?? "/"

  return router.options.routes.find(item => item.path === currentTopPath) ?? router.options.routes[0]
})

const menuItems = computed<LayoutMenuItem[]>(() => {
  const topRoute = currentTopRoute.value
  const children = topRoute?.children ?? []

  if (!topRoute) {
    return []
  }

  if (children.length === 0) {
    return [
      {
        title: getRouteTitle(topRoute),
        path: getRouteMenuTarget(topRoute)
      }
    ]
  }

  const fallbackTitle = getRouteTitle(topRoute)

  return children.map(item => ({
    title: getRouteTitle(item, fallbackTitle),
    path: resolveRoutePath(item, topRoute.path)
  }))
})
</script>

<template>
  <aside class="aside-nav">
    <nav>
      <ul class="aside-nav__list">
        <li v-for="item in menuItems" :key="item.path">
          <RouterLink
            :to="item.path"
            class="aside-nav__link"
            active-class="aside-nav__link--active"
          >
            {{ item.title }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped lang="scss">
.aside-nav {
  align-self: start;
  height: calc(100vh - var(--example-header-height, 64px));
  overflow-y: auto;
  padding: 20px 14px;
  background: var(--pc-fill-card);
  border-right: 1px solid var(--pc-border-color-divider);
  box-sizing: border-box;
}

.aside-nav__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.aside-nav__link {
  min-height: 36px;
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  padding: 8px 12px;
  border-radius: var(--pc-radius-base);
  color: var(--pc-text-color-2);
  font-size: var(--pc-font-size-medium);
  transition: background var(--pc-transition-duration-base), color var(--pc-transition-duration-base);

  &:hover {
    color: var(--pc-text-color-1);
    background: var(--pc-fill-hover);
  }

  &--active {
    color: var(--pc-color-primary);
    font-weight: var(--pc-font-weight-strong);
    background: rgba(22, 119, 255, 0.08);
  }
}

@media (max-width: 960px) {
  .aside-nav {
    display: none;
  }
}
</style>
