<template>
  <section class="app-content">
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </section>
</template>

<style scoped lang="scss">
.app-content {
  height: 100%;
  min-width: 0;
  background: var(--pc-fill-card);
}
</style>
