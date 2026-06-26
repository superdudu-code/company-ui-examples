<script setup lang="ts">
import { ref } from "vue"
import { SearchForm } from "@puture-ui/business"

const keyword = ref("")
const handleSearch = (val: string) => {
  keyword.value = val
}
</script>

<template>
  <article class="page">
    <header class="page__header">
      <h1>SearchForm 搜索表单</h1>
      <p>业务侧封装的搜索条容器，emit 关键词后由调用方触发查询。</p>
    </header>

    <section class="page__section">
      <h2>基础用法</h2>
      <SearchForm @search="handleSearch" />
      <p class="page__hint">最近搜索关键词：{{ keyword || "-" }}</p>
    </section>
  </article>
</template>

<style scoped>
@import "./shared.css";
</style>
