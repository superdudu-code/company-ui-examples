<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
</script>

<template>
  <div class="home">
    <section class="home__hero">
      <h1>puture-ui examples</h1>
      <p class="home__sub">这里是组件库发布到 npm 后的真实使用示例，用于验证发布版可用性并向非开发同学演示效果。</p>
    </section>

  </div>
</template>

<style scoped>
.home { max-width: 1100px; }
.home__hero { margin-bottom: 32px; }
.home__hero h1 { margin: 0 0 8px; font-size: 28px; }
.home__sub { margin: 0 0 4px; color: var(--pc-text-color-2); font-size: var(--pc-font-size-large); }
.home__meta { margin: 0; color: var(--pc-text-color-3); font-size: var(--pc-font-size-mini); }
.home__meta code { background: var(--pc-fill-code); padding: 2px 6px; border-radius: var(--pc-radius-base); font-size: var(--pc-font-size-mini); }
.home__group { margin-top: 32px; }
.home__group h2 { margin: 0 0 16px; font-size: var(--pc-font-size-huge); color: var(--pc-text-color-2); font-weight: var(--pc-font-weight-strong); }
.home__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.home__card {
  display: flex; flex-direction: column; align-items: flex-start; gap: 6px;
  padding: 16px; background: var(--pc-fill-card); border: 1px solid var(--pc-border-color-divider);
  border-radius: var(--pc-radius-base); cursor: pointer; text-align: left; font: inherit;
  transition: border-color var(--pc-transition-duration-base), transform var(--pc-transition-duration-fast), box-shadow var(--pc-transition-duration-base);
}
.home__card:hover {
  border-color: var(--pc-color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--pc-shadow-1);
}
.home__card-title { font-size: var(--pc-font-size-large); font-weight: var(--pc-font-weight-strong); color: var(--pc-text-color-1); }
.home__card-pkg { font-size: var(--pc-font-size-mini); color: var(--pc-text-color-3); }
</style>
