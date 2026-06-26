<script setup lang="ts">
import { ref } from "vue"
import { PcCountrySelect } from "@puture-ui/business"

const value = ref<string | number | boolean | null>(null)
</script>

<template>
  <article class="page">
    <header class="page__header">
      <h1>CountrySelect 国家选择</h1>
      <p>业务侧封装的国家选择器，内置国家清单与统一展示规则。</p>
    </header>

    <section class="page__section">
      <h2>基础用法</h2>
      <div style="width: 360px">
        <PcCountrySelect v-model:value="value" placeholder="请选择国家" />
      </div>
      <p class="page__hint">当前值：{{ value ?? "-" }}</p>
    </section>
  </article>
</template>

<style scoped>
@import "./shared.css";
</style>
