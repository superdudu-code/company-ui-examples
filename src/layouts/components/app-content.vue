<template>
  <section class="app-content">
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </section>
</template>

<style scoped lang="scss">
.app-content {
  min-width: 0;
  flex: 1;
  padding: 24px;
  border: 1px solid var(--pc-border-color-divider);
  border-radius: var(--pc-radius-base);
  background: var(--pc-fill-card);
}

@media (max-width: 720px) {
  .app-content {
    padding: 16px;
  }
}
</style>
