<script setup lang="ts">
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { getRouteMenuTarget, getRouteTitle } from "./route-menu"

const route = useRoute()
const router = useRouter()

const currentTopPath = computed(() => route.matched[0]?.path ?? "/")
const menuItems = computed(() =>
  router.options.routes.map(item => ({
    title: getRouteTitle(item),
    path: getRouteMenuTarget(item),
    active: item.path === currentTopPath.value
  }))
)
</script>

<template>
  <nav class="top-nav" aria-label="一级菜单">
    <RouterLink
      v-for="item in menuItems"
      :key="item.path"
      :to="item.path"
      class="top-nav__item"
      :class="{ 'top-nav__item--active': item.active }"
    >
      {{ item.title }}
    </RouterLink>
  </nav>
</template>

<style scoped lang="scss">
.top-nav {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  overflow-y: hidden;
}

.top-nav__item {
  height: var(--example-header-height, 64px);
  display: flex;
  align-items: center;
  padding: 0 14px;
  border-bottom: 2px solid transparent;
  color: var(--pc-text-color-2);
  font-size: var(--pc-font-size-medium);
  white-space: nowrap;
  transition: color var(--pc-transition-duration-base), border-color var(--pc-transition-duration-base);

  &:hover,
  &--active {
    color: var(--pc-color-primary);
    border-bottom-color: var(--pc-color-primary);
  }
}

@media (max-width: 720px) {
  .top-nav {
    width: 100%;
    height: 40px;
  }

  .top-nav__item {
    height: 40px;
  }
}
</style>
