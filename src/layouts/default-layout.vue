<script setup lang="ts">
import { ref } from "vue"
import { NAvatar, NInput } from "naive-ui"
import AppContent from "./components/app-content.vue"
import AsideNav from "./components/aside-nav.vue"
import TopNav from "./components/top-nav.vue"

const keyword = ref("")
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__inner">
        <div class="app-header__left">
          <RouterLink to="/" class="app-header__brand">
            <img src="/logo.svg" alt="puture-ui" />
            <span>PutUre Admin</span>
          </RouterLink>

          <TopNav />
        </div>

        <div class="app-header__actions">
          <NInput
            v-model:value="keyword"
            class="app-header__search"
            size="small"
            clearable
            placeholder="搜索菜单或页面"
          />
          <NAvatar round size="small">PU</NAvatar>
        </div>
      </div>
    </header>

    <div class="app-body">
      <AsideNav />

      <main class="app-main">
        <AppContent />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-shell {
  --example-aside-width: 146px;
  --example-header-height: 48px;

  height: 100vh;
  display: flex;
  flex-direction: column;
  color: var(--pc-text-color-1);
  background-color: #f0f2f5;
}

.app-header {
  z-index: 30;
  height: var(--example-header-height);
  background: var(--pc-fill-card);
  border-bottom: 1px solid var(--pc-border-color-divider);
  box-sizing: border-box;
}

.app-header__inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 0 24px;
  box-sizing: border-box;
}

.app-header__left {
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 32px;
}

.app-header__brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;

  img {
    width: 30px;
    height: 30px;
  }
}

.app-header__actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 12px;
}

.app-header__search {
  width: 220px;
}

.app-body {
  height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: var(--example-aside-width) minmax(0, 1fr);
}

.app-main {
    height: calc(100vh - var(--example-header-height, 64px));
}
</style>
