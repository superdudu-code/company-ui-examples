<script setup lang="ts">
import { ref } from "vue"
import { PcBaseSelect } from "@puture-ui/ui"

const value = ref<string | number | boolean | null>(null)
const options = [
  { label: "张三", value: 1 },
  { label: "李四", value: 2 },
  { label: "王五", value: 3, disabled: true },
  { label: "赵六", value: 4 }
]

const multiValue = ref<(string | number | boolean)[] | null>([])
</script>

<template>
  <article class="page">
    <header class="page__header">
      <h1>BaseSelect 基础下拉</h1>
      <p>对 Naive UI Select 的语义化封装，沉淀业务侧选项渲染、清空、占位等高频用法。</p>
    </header>

    <section class="page__section">
      <h2>基础用法</h2>
      <div style="width: 320px">
        <PcBaseSelect
          v-model:value="value"
          clearable
          :options="options"
          placeholder="请选择用户"
        />
      </div>
      <p class="page__hint">当前值：{{ value ?? "-" }}</p>
    </section>

    <section class="page__section">
      <h2>多选</h2>
      <div style="width: 320px">
        <PcBaseSelect
          v-model:value="multiValue"
          multiple
          clearable
          :options="options"
          placeholder="请选择多个用户"
        />
      </div>
      <p class="page__hint">当前值：{{ multiValue?.join(", ") || "-" }}</p>
    </section>
  </article>
</template>

<style scoped>
@import "./shared.css";
</style>
