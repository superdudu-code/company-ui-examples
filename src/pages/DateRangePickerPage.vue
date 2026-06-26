<script setup lang="ts">
import { reactive } from "vue"
import { PcDateRangePicker } from "@puture-ui/ui"

const params = reactive<{ startDate: string | null; endDate: string | null }>({
  startDate: null,
  endDate: null
})
</script>

<template>
  <article class="page">
    <header class="page__header">
      <h1>DateRangePicker 日期范围</h1>
      <p>双向绑定起止时间字符串，开箱即用，无需在业务侧再做 dayjs 转换。</p>
    </header>

    <section class="page__section">
      <h2>基础用法</h2>
      <div style="width: 360px">
        <PcDateRangePicker
          v-model:start-time="params.startDate"
          v-model:end-time="params.endDate"
          clearable
        />
      </div>
      <p class="page__hint">开始：{{ params.startDate || "-" }} · 结束：{{ params.endDate || "-" }}</p>
    </section>
  </article>
</template>

<style scoped>
@import "./shared.css";
</style>
