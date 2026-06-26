<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { navGroups } from "../router"

const router = useRouter()
const total = computed(() => navGroups.reduce((s, g) => s + g.items.length, 0))
</script>

<template>
  <div class="home">
    <section class="home__hero">
      <h1>puture-ui examples</h1>
      <p class="home__sub">这里是组件库发布到 npm 后的真实使用示例，用于验证发布版可用性并向非开发同学演示效果。</p>
      <p class="home__meta">当前共 {{ total }} 个示例 · 全部基于 npm 上的 <code>@puture-ui/*</code> 包</p>
    </section>

    <section v-for="group in navGroups" :key="group.title" class="home__group">
      <h2>{{ group.title }}</h2>
      <div class="home__grid">
        <button
          v-for="item in group.items"
          :key="item.path"
          class="home__card"
          @click="router.push(item.path)"
        >
          <span class="home__card-title">{{ item.title }}</span>
          <span class="home__card-pkg">@puture-ui/{{ item.pkg }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home { max-width: 1100px; }
.home__hero { margin-bottom: 32px; }
.home__hero h1 { margin: 0 0 8px; font-size: 28px; }
.home__sub { margin: 0 0 4px; color: #4a5057; font-size: 15px; }
.home__meta { margin: 0; color: #909399; font-size: 13px; }
.home__meta code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
.home__group { margin-top: 32px; }
.home__group h2 { margin: 0 0 16px; font-size: 16px; color: #606266; font-weight: 600; }
.home__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.home__card {
  display: flex; flex-direction: column; align-items: flex-start; gap: 6px;
  padding: 16px; background: #fff; border: 1px solid rgba(5,5,5,0.06);
  border-radius: 8px; cursor: pointer; text-align: left; font: inherit;
  transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
}
.home__card:hover {
  border-color: rgba(242,107,31,0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5,5,5,0.04);
}
.home__card-title { font-size: 15px; font-weight: 500; color: #1f2328; }
.home__card-pkg { font-size: 12px; color: #909399; }
</style>
