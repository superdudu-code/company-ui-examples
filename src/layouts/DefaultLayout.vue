<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"
import { navGroups } from "../router"

const route = useRoute()

const flatNav = computed(() => navGroups.flatMap(g => g.items))
const currentNav = computed(() => flatNav.value.find(n => n.path === route.path))
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__inner">
        <RouterLink to="/" class="app-header__brand">
          <img src="/logo.svg" alt="puture-ui" />
          <span>puture-ui examples</span>
        </RouterLink>
        <div class="app-header__center">
          <span v-if="currentNav" class="app-header__current">{{ currentNav.title }}</span>
        </div>
        <div class="app-header__right">
          <a
            v-if="currentNav"
            :href="`https://www.npmjs.com/package/@puture-ui/${currentNav.pkg}`"
            target="_blank"
            rel="noreferrer"
            class="app-header__link"
          >
            npm @puture-ui/{{ currentNav.pkg }}
          </a>
        </div>
      </div>
    </header>

    <div class="app-body">
      <aside class="app-sidebar">
        <nav>
          <section v-for="group in navGroups" :key="group.title" class="app-sidebar__group">
            <h3 class="app-sidebar__title">{{ group.title }}</h3>
            <ul class="app-sidebar__list">
              <li v-for="item in group.items" :key="item.path">
                <RouterLink
                  :to="item.path"
                  class="app-sidebar__link"
                  active-class="app-sidebar__link--active"
                >
                  {{ item.title }}
                </RouterLink>
              </li>
            </ul>
          </section>
        </nav>
      </aside>

      <main class="app-main">
        <RouterView v-slot="{ Component }">
          <component :is="Component" />
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 30;
  height: 64px;
  background: #fff;
  border-bottom: 1px solid rgba(5, 5, 5, 0.06);
}

.app-header__inner {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 24px;
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 15px;
  flex-shrink: 0;
}

.app-header__brand img {
  width: 28px;
  height: 28px;
}

.app-header__center {
  flex: 1;
  display: flex;
  align-items: center;
}

.app-header__current {
  color: #606266;
  font-size: 14px;
  padding: 4px 10px;
  background: #f3f4f6;
  border-radius: 4px;
}

.app-header__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-header__link {
  font-size: 13px;
  color: #606266;
  padding: 6px 12px;
  border: 1px solid rgba(5, 5, 5, 0.08);
  border-radius: 6px;
  transition: all 0.2s;
}

.app-header__link:hover {
  color: #1f2328;
  border-color: rgba(5, 5, 5, 0.2);
}

.app-body {
  flex: 1;
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  min-height: 0;
}

.app-sidebar {
  background: #fff;
  border-right: 1px solid rgba(5, 5, 5, 0.06);
  padding: 24px 16px;
  position: sticky;
  top: 64px;
  align-self: start;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.app-sidebar__group + .app-sidebar__group {
  margin-top: 24px;
}

.app-sidebar__title {
  margin: 0 0 8px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: #909399;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.app-sidebar__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.app-sidebar__link {
  display: block;
  padding: 8px 12px;
  margin-bottom: 2px;
  font-size: 14px;
  color: #4a5057;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

.app-sidebar__link:hover {
  background: #f3f4f6;
  color: #1f2328;
}

.app-sidebar__link--active {
  background: rgba(242, 107, 31, 0.08);
  color: #f26b1f;
  font-weight: 500;
}

.app-main {
  min-width: 0;
  padding: 32px 40px 96px;
}

@media (max-width: 960px) {
  .app-body {
    grid-template-columns: 1fr;
  }
  .app-sidebar {
    display: none;
  }
}
</style>
