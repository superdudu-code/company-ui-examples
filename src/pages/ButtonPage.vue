<script setup lang="ts">
import { PcButton } from "@puture-ui/ui"
</script>

<template>
  <article class="page">
    <header class="page__header">
      <h1>Button 按钮</h1>
      <p>对 Naive UI Button 的轻封装，统一品牌风格、支持原生表单 type。</p>
    </header>

    <section class="page__section">
      <h2>基础用法</h2>
      <div class="page__demo">
        <PcButton>默认按钮</PcButton>
        <PcButton native-type="submit">提交按钮</PcButton>
        <PcButton native-type="reset">重置按钮</PcButton>
        <PcButton disabled>禁用按钮</PcButton>
      </div>
    </section>
  </article>
</template>

<style scoped>
@import "./shared.css";
.page__demo { display: flex; gap: 8px; flex-wrap: wrap; }
</style>
